"""
Service de déconnexion
======================

Gère la déconnexion des utilisateurs avec invalidation des tokens,
mise à jour des sessions, et audit trail.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_

from app.models.user import Utilisateur
from app.models.session import SessionActive, TokenBlacklist
from app.models.audit import JournalAudit
from app.core.security import add_token_to_blacklist, decode_token
from fastapi import HTTPException, status


class LogoutService:
    """Service de gestion de la déconnexion."""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def logout_simple(
        self,
        access_token: str,
        refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Déconnexion simple (un appareil).
        
        Args:
            access_token: Token d'accès
            refresh_token: Token de rafraîchissement
            ip_address: Adresse IP
            user_agent: User agent du navigateur
        
        Returns:
            Résultat de la déconnexion
        """
        # 1. Décoder les tokens
        access_payload = decode_token(access_token)
        refresh_payload = decode_token(refresh_token)
        
        user_id = int(access_payload.get("sub"))
        access_jti = access_payload.get("jti")
        access_exp = datetime.fromtimestamp(access_payload.get("exp"))
        
        refresh_jti = refresh_payload.get("jti")
        refresh_exp = datetime.fromtimestamp(refresh_payload.get("exp"))
        
        # 2. Ajouter les tokens à la blacklist Redis
        add_token_to_blacklist(
            jti=access_jti,
            user_id=user_id,
            token_type="access",
            exp=access_exp,
            reason="logout",
            ip_address=ip_address
        )
        
        add_token_to_blacklist(
            jti=refresh_jti,
            user_id=user_id,
            token_type="refresh",
            exp=refresh_exp,
            reason="logout",
            ip_address=ip_address
        )
        
        # 3. Insérer dans TokensBlacklist SQL (backup permanent)
        await self._insert_blacklist_db(
            jti=access_jti,
            user_id=user_id,
            token_type="access",
            exp=access_exp,
            reason="logout",
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        await self._insert_blacklist_db(
            jti=refresh_jti,
            user_id=user_id,
            token_type="refresh",
            exp=refresh_exp,
            reason="logout",
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # 4. Désactiver la session dans SessionsActives
        await self.db.execute(
            update(SessionActive)
            .where(SessionActive.RefreshTokenJTI == refresh_jti)
            .values(EstActif=False, DerniereActivite=datetime.utcnow())
        )
        
        # 5. Enregistrer dans JournalAudit
        await self._log_audit(
            type_action="logout",
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={
                "logout_type": "simple",
                "tokens_revoked": 2
            }
        )
        
        await self.db.commit()
        
        return {
            "success": True,
            "message": "Déconnexion réussie",
            "logged_out_devices": 1,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def logout_all_devices(
        self,
        user_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Déconnexion de tous les appareils de l'utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            ip_address: Adresse IP
            user_agent: User agent
        
        Returns:
            Résultat de la déconnexion
        """
        # 1. Récupérer toutes les sessions actives
        result = await self.db.execute(
            select(SessionActive)
            .where(
                and_(
                    SessionActive.IdentifiantUtilisateur == user_id,
                    SessionActive.EstActif == True
                )
            )
        )
        sessions = result.scalars().all()
        
        devices_count = len(sessions)
        
        if devices_count == 0:
            return {
                "success": True,
                "message": "Aucune session active",
                "logged_out_devices": 0
            }
        
        # 2. Pour chaque session, blacklist les tokens
        for session in sessions:
            # Access token
            add_token_to_blacklist(
                jti=session.AccessTokenJTI,
                user_id=user_id,
                token_type="access",
                exp=session.DateExpiration,
                reason="logout_all",
                ip_address=ip_address
            )
            
            await self._insert_blacklist_db(
                jti=session.AccessTokenJTI,
                user_id=user_id,
                token_type="access",
                exp=session.DateExpiration,
                reason="logout_all",
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Refresh token
            add_token_to_blacklist(
                jti=session.RefreshTokenJTI,
                user_id=user_id,
                token_type="refresh",
                exp=session.DateExpiration,
                reason="logout_all",
                ip_address=ip_address
            )
            
            await self._insert_blacklist_db(
                jti=session.RefreshTokenJTI,
                user_id=user_id,
                token_type="refresh",
                exp=session.DateExpiration,
                reason="logout_all",
                ip_address=ip_address,
                user_agent=user_agent
            )
        
        # 3. Désactiver toutes les sessions
        await self.db.execute(
            update(SessionActive)
            .where(
                and_(
                    SessionActive.IdentifiantUtilisateur == user_id,
                    SessionActive.EstActif == True
                )
            )
            .values(EstActif=False, DerniereActivite=datetime.utcnow())
        )
        
        # 4. Audit
        await self._log_audit(
            type_action="logout_all",
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={
                "logout_type": "all_devices",
                "tokens_revoked": devices_count * 2,
                "devices_count": devices_count
            }
        )
        
        await self.db.commit()
        
        return {
            "success": True,
            "message": f"Déconnexion de {devices_count} appareils réussie",
            "logged_out_devices": devices_count,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def logout_specific_session(
        self,
        user_id: int,
        session_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Déconnexion d'une session spécifique.
        
        Args:
            user_id: ID de l'utilisateur
            session_id: ID de la session à déconnecter
            ip_address: Adresse IP
            user_agent: User agent
        
        Returns:
            Résultat de la déconnexion
        """
        # 1. Récupérer la session
        result = await self.db.execute(
            select(SessionActive)
            .where(
                and_(
                    SessionActive.IdentifiantSession == session_id,
                    SessionActive.IdentifiantUtilisateur == user_id,
                    SessionActive.EstActif == True
                )
            )
        )
        session = result.scalar_one_or_none()
        
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session non trouvée ou déjà déconnectée"
            )
        
        # 2. Blacklist les tokens
        add_token_to_blacklist(
            jti=session.AccessTokenJTI,
            user_id=user_id,
            token_type="access",
            exp=session.DateExpiration,
            reason="logout_specific",
            ip_address=ip_address
        )
        
        add_token_to_blacklist(
            jti=session.RefreshTokenJTI,
            user_id=user_id,
            token_type="refresh",
            exp=session.DateExpiration,
            reason="logout_specific",
            ip_address=ip_address
        )
        
        await self._insert_blacklist_db(
            jti=session.AccessTokenJTI,
            user_id=user_id,
            token_type="access",
            exp=session.DateExpiration,
            reason="logout_specific",
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        await self._insert_blacklist_db(
            jti=session.RefreshTokenJTI,
            user_id=user_id,
            token_type="refresh",
            exp=session.DateExpiration,
            reason="logout_specific",
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # 3. Désactiver la session
        await self.db.execute(
            update(SessionActive)
            .where(SessionActive.IdentifiantSession == session_id)
            .values(EstActif=False, DerniereActivite=datetime.utcnow())
        )
        
        # 4. Audit
        await self._log_audit(
            type_action="logout_specific",
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            details={
                "logout_type": "specific_session",
                "session_id": session_id
            }
        )
        
        await self.db.commit()
        
        return {
            "success": True,
            "message": f"Session {session_id} déconnectée avec succès"
        }
    
    async def force_logout_user(
        self,
        admin_id: int,
        target_user_id: int,
        reason: str,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Déconnexion forcée par un administrateur.
        
        Args:
            admin_id: ID de l'administrateur
            target_user_id: ID de l'utilisateur à déconnecter
            reason: Raison de la déconnexion forcée
            ip_address: Adresse IP
        
        Returns:
            Résultat de la déconnexion
        """
        # Vérifier que la cible existe
        result = await self.db.execute(
            select(Utilisateur).where(Utilisateur.IdentifiantUtilisateur == target_user_id)
        )
        user = result.scalar_one_or_none()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Utilisateur non trouvé"
            )
        
        # Déconnecter tous les appareils
        logout_result = await self.logout_all_devices(
            user_id=target_user_id,
            ip_address=ip_address,
            user_agent=f"Admin Force Logout by {admin_id}"
        )
        
        # Audit spécial pour déconnexion forcée
        await self._log_audit(
            type_action="force_logout",
            user_id=admin_id,
            ip_address=ip_address,
            user_agent=None,
            details={
                "target_user_id": target_user_id,
                "reason": reason,
                "devices_logged_out": logout_result["logged_out_devices"]
            }
        )
        
        await self.db.commit()
        
        return {
            "success": True,
            "message": f"Utilisateur {target_user_id} déconnecté de {logout_result['logged_out_devices']} appareils",
            "logged_out_devices": logout_result["logged_out_devices"],
            "reason": reason
        }
    
    async def _insert_blacklist_db(
        self,
        jti: str,
        user_id: int,
        token_type: str,
        exp: datetime,
        reason: str,
        ip_address: Optional[str],
        user_agent: Optional[str]
    ):
        """Insère un token dans la table TokensBlacklist (backup SQL)."""
        blacklist_entry = TokenBlacklist(
            JTI=jti,
            TypeToken=token_type,
            IdentifiantUtilisateur=user_id,
            DateExpiration=exp,
            RaisonRevocation=reason,
            AdresseIP=ip_address,
            UserAgent=user_agent
        )
        await self.db.add(blacklist_entry)
    
    async def _log_audit(
        self,
        type_action: str,
        user_id: int,
        ip_address: Optional[str],
        user_agent: Optional[str],
        details: Dict[str, Any]
    ):
        """Enregistre un événement dans JournalAudit."""
        import json
        
        audit_entry = JournalAudit(
            TypeAction=type_action,
            TableCible="Sessions",
            IdentifiantLigne=user_id,
            IdentifiantUtilisateur=user_id,
            ActionEffectuee="UPDATE",
            AdresseIP=ip_address,
            UserAgent=user_agent,
            DetailsSupplementaires=json.dumps(details)
        )
        await self.db.add(audit_entry)
