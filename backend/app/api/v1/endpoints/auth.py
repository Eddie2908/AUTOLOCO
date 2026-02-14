"""
Endpoints d'authentification
=============================

Routes pour l'inscription, la connexion, la déconnexion,
et la gestion des tokens.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    validate_token_not_blacklisted
)
from app.services.logout_service import LogoutService
from app.models.user import Utilisateur
from app.models.session import SessionActive
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    LogoutResponse,
    SessionResponse,
    ForceLogoutRequest,
    TokenRefreshRequest,
    TokenRefreshResponse
)
from app.api.dependencies import (
    get_current_active_user,
    get_current_admin_user
)


router = APIRouter()


# ============================================================
# REGISTER & LOGIN
# ============================================================

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    user_data: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Inscription d'un nouvel utilisateur.
    """
    # Vérifier si l'email existe déjà
    existing = await db.execute(
        select(Utilisateur).where(Utilisateur.Email == user_data.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte avec cet email existe déjà"
        )
    
    # Créer l'utilisateur (utilise les noms de colonnes du schéma SQL)
    user = Utilisateur(
        Email=user_data.email,
        MotDePasse=hash_password(user_data.password),
        TypeUtilisateur=user_data.type_utilisateur.capitalize(),  # Locataire, Proprietaire
        Nom=user_data.nom,
        Prenom=user_data.prenom or "",
        NumeroTelephone=user_data.telephone,
        StatutCompte="EnAttente",
        DateInscription=datetime.utcnow()
    )
    
    await db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Créer les tokens
    token_data = {
        "sub": str(user.IdentifiantUtilisateur),
        "email": user.Email,
        "type": user.TypeUtilisateur
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return RegisterResponse(
        user_id=user.IdentifiantUtilisateur,
        email=user.Email,
        type_utilisateur=user.TypeUtilisateur,
        access_token=access_token,
        refresh_token=refresh_token,
        message="Inscription réussie"
    )


@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Connexion d'un utilisateur.
    """
    # Trouver l'utilisateur
    result = await db.execute(
        select(Utilisateur).where(Utilisateur.Email == credentials.email)
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(credentials.password, user.MotDePasse):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    if user.StatutCompte == "Desactive":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce compte a été désactivé"
        )
    
    if user.StatutCompte == "Suspendu":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ce compte a été suspendu"
        )
    
    # Mettre à jour la dernière connexion
    user.DerniereConnexion = datetime.utcnow()
    await db.commit()
    
    # Créer les tokens
    token_data = {
        "sub": str(user.IdentifiantUtilisateur),
        "email": user.Email,
        "type": user.TypeUtilisateur
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={
            "id": str(user.IdentifiantUtilisateur),
            "email": user.Email,
            "nom": user.Nom,
            "prenom": user.Prenom,
            "type": user.TypeUtilisateur,
            "avatar": user.PhotoProfil,
            "statut": user.StatutCompte
        }
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    token_data: TokenRefreshRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Rafraîchit l'access token avec le refresh token.
    """
    try:
        payload = decode_token(token_data.refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token de rafraîchissement invalide"
            )
        
        user_id = payload.get("sub")
        
        # Vérifier que l'utilisateur existe toujours
        result = await db.execute(
            select(Utilisateur).where(
                Utilisateur.IdentifiantUtilisateur == int(user_id)
            )
        )
        user = result.scalar_one_or_none()
        
        if not user or not user.EstActif:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur invalide"
            )
        
        # Créer un nouveau access token
        new_token_data = {
            "sub": str(user.IdentifiantUtilisateur),
            "email": user.Email,
            "type": user.TypeUtilisateur
        }
        new_access_token = create_access_token(new_token_data)
        
        return TokenRefreshResponse(
            access_token=new_access_token,
            token_type="bearer"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de rafraîchissement invalide ou expiré"
        )


# ============================================================
# LOGOUT ENDPOINTS
# ============================================================

@router.post("/logout", response_model=LogoutResponse)
async def logout(
    request: Request,
    logout_data: LogoutRequest,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Déconnexion standard.
    """
    service = LogoutService(db)
    
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'accès manquant"
        )
    
    access_token = auth_header.split(" ")[1]
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("User-Agent")
    
    if logout_data.logout_all_devices:
        result = await service.logout_all_devices(
            user_id=current_user.IdentifiantUtilisateur,
            ip_address=ip_address,
            user_agent=user_agent
        )
    else:
        result = await service.logout_simple(
            access_token=access_token,
            refresh_token=logout_data.refresh_token,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    return LogoutResponse(**result)


@router.get("/me")
async def get_me(
    current_user: Utilisateur = Depends(get_current_active_user)
):
    """
    Récupère les informations de l'utilisateur connecté.
    """
    return {
        "id": str(current_user.IdentifiantUtilisateur),
        "email": current_user.Email,
        "nom": current_user.Nom,
        "prenom": current_user.Prenom,
        "type": current_user.TypeUtilisateur,
        "avatar": current_user.PhotoProfil,
        "statut": current_user.StatutCompte,
        "telephone": current_user.NumeroTelephone,
        "langue": current_user.LanguePreferee,
        "devise": current_user.DevisePreferee,
        "note_globale": float(current_user.NotesUtilisateur) if current_user.NotesUtilisateur else 0,
        "badge": current_user.NiveauFidelite,
        "points_fidelite": current_user.PointsFideliteTotal,
        "date_inscription": current_user.DateInscription.isoformat() if current_user.DateInscription else None
    }


@router.get("/sessions", response_model=List[SessionResponse])
async def get_active_sessions(
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Liste des sessions actives de l'utilisateur.
    """
    result = await db.execute(
        select(SessionActive)
        .where(
            SessionActive.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur,
            SessionActive.EstActif == True
        )
        .order_by(SessionActive.DerniereActivite.desc())
    )
    sessions = result.scalars().all()
    
    return [
        SessionResponse(
            session_id=s.IdentifiantSession,
            device=s.Appareil,
            browser=s.Navigateur,
            location=f"{s.Ville}, {s.Pays}" if s.Ville else None,
            ip_address=s.AdresseIP,
            last_activity=s.DerniereActivite,
            is_current=False
        )
        for s in sessions
    ]
