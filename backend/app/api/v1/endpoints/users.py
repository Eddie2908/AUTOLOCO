"""
Endpoints de gestion des utilisateurs
======================================

Routes pour la gestion du profil, des locataires et propriétaires.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.schemas.user import (
    UserResponse,
    UserUpdate,
    UserListResponse,
    OwnerResponse,
    RenterResponse,
    UserStatsResponse
)
from app.models.user import Utilisateur
from app.api.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter()


def _user_type(current_user: Utilisateur) -> str:
    return (getattr(current_user, "TypeUtilisateur", None) or "").lower()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: Utilisateur = Depends(get_current_active_user)
):
    """Récupère le profil de l'utilisateur connecté."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Met à jour le profil de l'utilisateur connecté."""
    FIELD_MAP = {
        "nom": "Nom",
        "prenom": "Prenom",
        "telephone": "NumeroTelephone",
        "photo_profil": "PhotoProfil",
        "date_naissance": "DateNaissance",
        "biographie": "BiographieUtilisateur",
        "site_web": "SiteWeb",
        "langue": "LanguePreferee",
        "devise": "DevisePreferee",
    }
    update_data = user_data.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        model_attr = FIELD_MAP.get(field, field)
        setattr(current_user, model_attr, value)
    
    current_user.DateModification = datetime.utcnow()
    await db.commit()
    await db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)


@router.get("", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type_utilisateur: Optional[str] = None,
    statut: Optional[str] = None,
    search: Optional[str] = None,
    admin_user: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Liste tous les utilisateurs (admin uniquement).
    """
    query = select(Utilisateur)
    
    if type_utilisateur:
        query = query.where(Utilisateur.TypeUtilisateur == type_utilisateur)
    if statut:
        query = query.where(Utilisateur.Statut == statut)
    if search:
        query = query.where(
            (Utilisateur.Nom.ilike(f"%{search}%")) |
            (Utilisateur.Prenom.ilike(f"%{search}%")) |
            (Utilisateur.Email.ilike(f"%{search}%"))
        )
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return UserListResponse(
        users=[UserResponse.model_validate(u) for u in users],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Récupère un utilisateur par son ID."""
    result = await db.execute(
        select(Utilisateur).where(
            Utilisateur.IdentifiantUtilisateur == user_id
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    return UserResponse.model_validate(user)


@router.get("/{user_id}/stats", response_model=UserStatsResponse)
async def get_user_stats(
    user_id: int,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les statistiques d'un utilisateur."""
    # Vérifier autorisation
    if current_user.IdentifiantUtilisateur != user_id and _user_type(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé"
        )
    
    # TODO: Calculer les stats depuis les réservations
    return UserStatsResponse(
        total_reservations=0,
        reservations_terminees=0,
        note_moyenne=None,
        revenus_totaux=0 if _user_type(current_user) == "proprietaire" else None
    )


@router.put("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: int,
    statut: str,
    admin_user: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Met à jour le statut d'un utilisateur (admin uniquement)."""
    result = await db.execute(
        select(Utilisateur).where(
            Utilisateur.IdentifiantUtilisateur == user_id
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    user.Statut = statut
    user.DateModification = datetime.utcnow()
    await db.commit()
    await db.refresh(user)
    
    return UserResponse.model_validate(user)


@router.put("/me/password")
async def change_password(
    current_password: str,
    new_password: str,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Change le mot de passe de l'utilisateur connecté."""
    from app.core.security import verify_password, hash_password
    
    # Vérifier l'ancien mot de passe
    if not verify_password(current_password, current_user.MotDePasseHash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect"
        )
    
    # Mettre à jour le mot de passe
    current_user.MotDePasseHash = hash_password(new_password)
    current_user.DateModification = datetime.utcnow()
    await db.commit()
    
    return {"message": "Mot de passe modifié avec succès"}


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_current_user(
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Désactive le compte de l'utilisateur connecté."""
    current_user.EstActif = False
    current_user.DateModification = datetime.utcnow()
    await db.commit()
