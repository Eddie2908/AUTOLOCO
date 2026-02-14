"""
Endpoints de gestion du programme de fidélité
==============================================
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.schemas.loyalty import (
    LoyaltyProgramResponse,
    PointsHistoryResponse,
    PointsCreate,
    ReferralCreate,
    ReferralResponse,
    UserLoyaltyStatusResponse
)
from app.models.loyalty import ProgrammeFidelite, PointFidelite, Parrainage
from app.models.user import Utilisateur
from app.api.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter()


@router.get("/status", response_model=UserLoyaltyStatusResponse)
async def get_loyalty_status(
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère le statut de fidélité de l'utilisateur"""
    # Calculer les points disponibles
    result = await db.execute(
        select(
            func.sum(PointFidelite.PointsAcquis - PointFidelite.PointsUtilises)
        ).where(
            and_(
                PointFidelite.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur,
                or_(
                    PointFidelite.DateExpiration.is_(None),
                    PointFidelite.DateExpiration > datetime.utcnow()
                )
            )
        )
    )
    points_disponibles = result.scalar() or 0
    
    # Calculer les points expirés
    result_expires = await db.execute(
        select(
            func.sum(PointFidelite.PointsAcquis - PointFidelite.PointsUtilises)
        ).where(
            and_(
                PointFidelite.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur,
                PointFidelite.DateExpiration < datetime.utcnow()
            )
        )
    )
    points_expires = result_expires.scalar() or 0
    
    # Trouver le niveau actuel
    niveau_actuel = current_user.NiveauFidelite or "BRONZE"
    
    # Historique des points
    history_result = await db.execute(
        select(PointFidelite)
        .where(PointFidelite.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur)
        .order_by(PointFidelite.DateAcquisition.desc())
        .limit(20)
    )
    historique = history_result.scalars().all()
    
    # Parrainages actifs
    parrainages_result = await db.execute(
        select(func.count())
        .select_from(Parrainage)
        .where(
            and_(
                Parrainage.IdentifiantParrain == current_user.IdentifiantUtilisateur,
                Parrainage.StatutParrainage != 'Annule'
            )
        )
    )
    parrainages_actifs = parrainages_result.scalar() or 0
    
    return UserLoyaltyStatusResponse(
        niveau_actuel=niveau_actuel,
        points_totaux=current_user.PointsFideliteTotal or 0,
        points_disponibles=int(points_disponibles),
        points_expires=int(points_expires),
        prochain_niveau=None,  # À calculer selon les règles
        points_manquants_prochain_niveau=None,
        avantages_actuels=[],
        historique_points=[PointsHistoryResponse.model_validate(p) for p in historique],
        parrainages_actifs=parrainages_actifs
    )


@router.get("/programs", response_model=List[LoyaltyProgramResponse])
async def list_loyalty_programs(
    db: AsyncSession = Depends(get_db)
):
    """Liste tous les programmes de fidélité disponibles"""
    result = await db.execute(
        select(ProgrammeFidelite)
        .where(ProgrammeFidelite.Actif == True)
        .order_by(ProgrammeFidelite.SeuilPoints)
    )
    programs = result.scalars().all()
    return [LoyaltyProgramResponse.model_validate(p) for p in programs]


@router.post("/points", response_model=PointsHistoryResponse, status_code=status.HTTP_201_CREATED)
async def award_points(
    points_data: PointsCreate,
    current_admin: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Attribue des points de fidélité (Admin uniquement)"""
    # Vérifier que l'utilisateur existe
    user_result = await db.execute(
        select(Utilisateur).where(
            Utilisateur.IdentifiantUtilisateur == points_data.identifiant_utilisateur
        )
    )
    user = user_result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    # Créer l'entrée de points
    points = PointFidelite(
        IdentifiantUtilisateur=points_data.identifiant_utilisateur,
        TypeAcquisition=points_data.type_acquisition,
        PointsAcquis=points_data.points_acquis,
        PointsUtilises=0,
        DateAcquisition=datetime.utcnow(),
        IdentifiantSource=points_data.identifiant_source,
        TypeSource=points_data.type_source,
        Description=points_data.description
    )
    
    await db.add(points)
    
    # Mettre à jour le total de l'utilisateur
    user.PointsFideliteTotal = (user.PointsFideliteTotal or 0) + points_data.points_acquis
    
    await db.commit()
    await db.refresh(points)
    
    return PointsHistoryResponse.model_validate(points)


@router.post("/referral", response_model=ReferralResponse, status_code=status.HTTP_201_CREATED)
async def create_referral(
    referral_data: ReferralCreate,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Crée une invitation de parrainage"""
    import secrets
    
    # Générer un code unique
    code_parrainage = f"{current_user.Nom[:3].upper()}{secrets.token_hex(4).upper()}"
    
    # Vérifier que le code n'existe pas déjà
    existing = await db.execute(
        select(Parrainage).where(Parrainage.CodeParrainage == code_parrainage)
    )
    if existing.scalar_one_or_none():
        code_parrainage = f"{current_user.Nom[:3].upper()}{secrets.token_hex(6).upper()}"
    
    # Créer le parrainage
    parrainage = Parrainage(
        IdentifiantParrain=current_user.IdentifiantUtilisateur,
        CodeParrainage=code_parrainage,
        EmailFilleul=referral_data.email_filleul,
        DateInvitation=datetime.utcnow(),
        StatutParrainage='EnAttente',
        PointsParrain=500,  # Configurable
        PointsFilleul=300,  # Configurable
        RemiseParrain=5000,
        RemiseFilleul=3000
    )
    
    await db.add(parrainage)
    await db.commit()
    await db.refresh(parrainage)
    
    return ReferralResponse.model_validate(parrainage)


@router.get("/referrals", response_model=List[ReferralResponse])
async def list_referrals(
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste les parrainages de l'utilisateur"""
    result = await db.execute(
        select(Parrainage)
        .where(Parrainage.IdentifiantParrain == current_user.IdentifiantUtilisateur)
        .order_by(Parrainage.DateInvitation.desc())
    )
    referrals = result.scalars().all()
    return [ReferralResponse.model_validate(r) for r in referrals]
