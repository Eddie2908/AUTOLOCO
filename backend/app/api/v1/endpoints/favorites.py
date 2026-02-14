"""
Endpoints de gestion des favoris
=================================

Routes pour ajouter/supprimer des véhicules aux favoris.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.schemas.vehicle import VehicleResponse
from app.models.favorite import Favori
from app.models.vehicle import Vehicule
from app.models.user import Utilisateur
from app.api.dependencies import get_current_active_user

router = APIRouter()


@router.get("", response_model=List[VehicleResponse])
async def list_favorites(
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste les véhicules favoris de l'utilisateur."""
    result = await db.execute(
        select(Vehicule)
        .join(Favori, Favori.IdentifiantVehicule == Vehicule.IdentifiantVehicule)
        .where(Favori.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur)
        .order_by(Favori.DateAjout.desc())
        .options(
            selectinload(Vehicule.proprietaire),
            selectinload(Vehicule.photos),
            selectinload(Vehicule.categorie),
            selectinload(Vehicule.modele),
        )
    )
    vehicles = result.scalars().all()
    
    return [VehicleResponse.model_validate(v) for v in vehicles]


@router.post("/{vehicle_id}", status_code=status.HTTP_201_CREATED)
async def add_to_favorites(
    vehicle_id: int,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Ajoute un véhicule aux favoris."""
    # Vérifier que le véhicule existe
    vehicle_result = await db.execute(
        select(Vehicule).where(Vehicule.IdentifiantVehicule == vehicle_id)
    )
    if not vehicle_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Véhicule non trouvé"
        )
    
    # Vérifier pas déjà en favori
    existing_result = await db.execute(
        select(Favori).where(
            Favori.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur,
            Favori.IdentifiantVehicule == vehicle_id
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce véhicule est déjà dans vos favoris"
        )
    
    # Ajouter
    favorite = Favori(
        IdentifiantUtilisateur=current_user.IdentifiantUtilisateur,
        IdentifiantVehicule=vehicle_id,
        DateAjout=datetime.utcnow()
    )
    
    await db.add(favorite)
    await db.commit()
    
    return {"message": "Véhicule ajouté aux favoris"}


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_favorites(
    vehicle_id: int,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Retire un véhicule des favoris."""
    result = await db.execute(
        select(Favori).where(
            Favori.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur,
            Favori.IdentifiantVehicule == vehicle_id
        )
    )
    favorite = result.scalar_one_or_none()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ce véhicule n'est pas dans vos favoris"
        )
    
    await db.delete(favorite)
    await db.commit()


@router.get("/{vehicle_id}/check")
async def check_favorite(
    vehicle_id: int,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Vérifie si un véhicule est en favori."""
    result = await db.execute(
        select(Favori).where(
            Favori.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur,
            Favori.IdentifiantVehicule == vehicle_id
        )
    )
    is_favorite = result.scalar_one_or_none() is not None
    
    return {"is_favorite": is_favorite}
