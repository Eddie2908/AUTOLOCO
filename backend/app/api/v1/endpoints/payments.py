"""
Endpoints de gestion des paiements
===================================

Routes pour le traitement des paiements Mobile Money et carte.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.schemas.payment import (
    PaymentCreate,
    PaymentResponse,
    PaymentListResponse,
    PaymentMethodResponse
)
from app.models.payment import Paiement
from app.models.booking import Reservation
from app.models.user import Utilisateur
from app.api.dependencies import get_current_active_user

router = APIRouter()


def _user_type(current_user: Utilisateur) -> str:
    return (getattr(current_user, "TypeUtilisateur", None) or "").lower()


@router.get("", response_model=PaymentListResponse)
async def list_payments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    statut: Optional[str] = None,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste les paiements de l'utilisateur."""
    query = select(Paiement)
    
    if _user_type(current_user) != "admin":
        query = query.where(
            Paiement.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur
        )
    
    if statut:
        query = query.where(Paiement.Statut == statut)
    
    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.order_by(Paiement.DateCreation.desc())
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    payments = result.scalars().all()
    
    return PaymentListResponse(
        payments=[PaymentResponse.model_validate(p) for p in payments],
        total=total or 0,
        page=page,
        page_size=page_size
    )


@router.post("", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Initie un nouveau paiement."""
    # Vérifier la réservation
    booking_result = await db.execute(
        select(Reservation).where(
            Reservation.IdentifiantReservation == payment_data.identifiant_reservation
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
            detail="Vous n'êtes pas autorisé à payer cette réservation"
        )
    
    # Créer le paiement
    payment = Paiement(
        IdentifiantReservation=payment_data.identifiant_reservation,
        IdentifiantUtilisateur=current_user.IdentifiantUtilisateur,
        Montant=booking.Total,
        MethodePaiement=payment_data.methode_paiement,
        Statut="en_attente",
        DateCreation=datetime.utcnow()
    )
    
    await db.add(payment)
    await db.commit()
    await db.refresh(payment)
    
    # TODO: Intégrer avec le gateway de paiement réel (Flutterwave, Stripe)
    
    return PaymentResponse.model_validate(payment)


@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment_by_id(
    payment_id: int,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les détails d'un paiement."""
    result = await db.execute(
        select(Paiement).where(Paiement.IdentifiantPaiement == payment_id)
    )
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement non trouvé"
        )
    
    if payment.IdentifiantUtilisateur != current_user.IdentifiantUtilisateur:
        if _user_type(current_user) != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès non autorisé"
            )
    
    return PaymentResponse.model_validate(payment)


@router.post("/{payment_id}/confirm", response_model=PaymentResponse)
async def confirm_payment(
    payment_id: int,
    reference: str,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Confirme un paiement après validation du gateway."""
    result = await db.execute(
        select(Paiement).where(Paiement.IdentifiantPaiement == payment_id)
    )
    payment = result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Paiement non trouvé"
        )
    
    payment.Statut = "confirme"
    payment.ReferencePaiement = reference
    payment.DatePaiement = datetime.utcnow()
    
    # Mettre à jour la réservation
    booking_result = await db.execute(
        select(Reservation).where(
            Reservation.IdentifiantReservation == payment.IdentifiantReservation
        )
    )
    booking = booking_result.scalar_one_or_none()
    if booking:
        booking.Statut = "confirmee"
        booking.DateModification = datetime.utcnow()
    
    await db.commit()
    await db.refresh(payment)
    
    return PaymentResponse.model_validate(payment)


@router.get("/methods/available", response_model=List[PaymentMethodResponse])
async def get_available_payment_methods():
    """Retourne les méthodes de paiement disponibles."""
    return [
        PaymentMethodResponse(
            id="mobile_money_mtn",
            name="MTN Mobile Money",
            icon="/mtn-logo.png",
            available=True
        ),
        PaymentMethodResponse(
            id="mobile_money_orange",
            name="Orange Money",
            icon="/orange-logo.png",
            available=True
        ),
        PaymentMethodResponse(
            id="carte_bancaire",
            name="Carte Bancaire",
            icon="/visa-mastercard.png",
            available=True
        ),
        PaymentMethodResponse(
            id="especes",
            name="Espèces",
            icon="/cash.png",
            available=False
        )
    ]
