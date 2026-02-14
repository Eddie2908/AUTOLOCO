"""
Endpoints de gestion des avis
==============================

Routes CRUD pour les avis sur les véhicules et les utilisateurs.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.schemas.review import (
    ReviewCreate,
    ReviewResponse,
    ReviewListResponse
)
from app.models.review import Avis
from app.models.booking import Reservation
from app.models.vehicle import Vehicule
from app.models.user import Utilisateur
from app.api.dependencies import get_current_active_user

router = APIRouter()


@router.get("/vehicle/{vehicle_id}", response_model=ReviewListResponse)
async def get_vehicle_reviews(
    vehicle_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les avis d'un véhicule."""
    query = select(Avis).where(
        Avis.IdentifiantVehicule == vehicle_id
    )
    
    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.order_by(Avis.DateCreation.desc())
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    reviews = result.scalars().all()
    
    return ReviewListResponse(
        reviews=[ReviewResponse.model_validate(r) for r in reviews],
        total=total or 0,
        page=page,
        page_size=page_size
    )


@router.get("/user/{user_id}", response_model=ReviewListResponse)
async def get_user_reviews(
    user_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les avis reçus par un utilisateur."""
    query = select(Avis).where(
        Avis.IdentifiantUtilisateurCible == user_id
    )
    
    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.order_by(Avis.DateCreation.desc())
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    reviews = result.scalars().all()
    
    return ReviewListResponse(
        reviews=[ReviewResponse.model_validate(r) for r in reviews],
        total=total or 0,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Crée un nouvel avis."""
    # Vérifier que l'utilisateur a bien loué ce véhicule
    booking_result = await db.execute(
        select(Reservation).where(
            Reservation.IdentifiantReservation == review_data.identifiant_reservation
        )
    )
    booking = booking_result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation non trouvée"
        )
    
    if booking.IdentifiantLocataire != current_user.IdentifiantUtilisateur:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous ne pouvez pas noter cette réservation"
        )
    
    if booking.Statut != "terminee":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous ne pouvez noter qu'une réservation terminée"
        )
    
    # Vérifier pas d'avis existant
    existing_result = await db.execute(
        select(Avis).where(
            Avis.IdentifiantReservation == review_data.identifiant_reservation
        )
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Vous avez déjà laissé un avis pour cette réservation"
        )
    
    # Récupérer le véhicule pour trouver le propriétaire
    vehicle_result = await db.execute(
        select(Vehicule).where(
            Vehicule.IdentifiantVehicule == booking.IdentifiantVehicule
        )
    )
    vehicle = vehicle_result.scalar_one_or_none()
    
    # Créer l'avis
    review = Avis(
        IdentifiantReservation=review_data.identifiant_reservation,
        IdentifiantAuteur=current_user.IdentifiantUtilisateur,
        IdentifiantVehicule=booking.IdentifiantVehicule,
        IdentifiantUtilisateurCible=vehicle.IdentifiantProprietaire if vehicle else None,
        Note=review_data.note,
        Commentaire=review_data.commentaire,
        DateCreation=datetime.utcnow()
    )
    
    await db.add(review)
    
    # Mettre à jour la note moyenne du véhicule
    if vehicle:
        avg_result = await db.execute(
            select(func.avg(Avis.Note)).where(
                Avis.IdentifiantVehicule == vehicle.IdentifiantVehicule
            )
        )
        avg_note = avg_result.scalar()
        if avg_note:
            vehicle.NoteGlobale = round(float(avg_note), 1)
    
    await db.commit()
    await db.refresh(review)
    
    return ReviewResponse.model_validate(review)
