"""
Endpoints de gestion des réservations
======================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
import uuid

from app.core.database import get_db
from app.schemas.booking import (
    BookingCreate,
    BookingUpdate,
    BookingResponse,
    BookingListResponse,
    BookingDetailResponse,
    BookingStatusUpdate,
    BookingExtensionRequest,
    BookingCancellationRequest,
    BookingStartRequest,
    BookingEndRequest
)
from app.models.booking import Reservation
from app.models.booking_extension import ExtensionReservation
from app.models.vehicle import Vehicule, PhotoVehicule
from app.models.user import Utilisateur
from app.api.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter()


def _user_type(current_user: Utilisateur) -> str:
    return (getattr(current_user, "TypeUtilisateur", None) or "").lower()


@router.get("", response_model=BookingListResponse)
async def list_bookings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    statut: Optional[str] = None,
    date_debut: Optional[date] = None,
    date_fin: Optional[date] = None,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste les réservations de l'utilisateur."""
    query = select(Reservation).options(
        selectinload(Reservation.vehicule).selectinload(Vehicule.photos),
        selectinload(Reservation.proprietaire),
    )
    
    # Filtrer selon le type d'utilisateur
    if _user_type(current_user) == "locataire":
        query = query.where(
            Reservation.IdentifiantLocataire == current_user.IdentifiantUtilisateur
        )
    elif _user_type(current_user) == "proprietaire":
        query = query.where(
            Reservation.IdentifiantProprietaire == current_user.IdentifiantUtilisateur
        )
    # Admin voit tout
    
    # Filtres
    if statut:
        query = query.where(Reservation.StatutReservation == statut)
    if date_debut:
        query = query.where(Reservation.DateDebut >= datetime.combine(date_debut, datetime.min.time()))
    if date_fin:
        query = query.where(Reservation.DateFin <= datetime.combine(date_fin, datetime.max.time()))
    
    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.order_by(Reservation.DateCreationReservation.desc())
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    bookings = result.scalars().all()
    
    return BookingListResponse(
        bookings=[BookingResponse.model_validate(b) for b in bookings],
        total=total or 0,
        page=page,
        page_size=page_size
    )


@router.get("/{booking_id}", response_model=BookingDetailResponse)
async def get_booking_by_id(
    booking_id: int,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les détails d'une réservation avec eager loading."""
    result = await db.execute(
        select(Reservation)
        .where(Reservation.IdentifiantReservation == booking_id)
        .options(
            selectinload(Reservation.vehicule).selectinload(Vehicule.photos),
            selectinload(Reservation.proprietaire),
        )
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation non trouvée"
        )
    
    # Vérifier autorisation
    if _user_type(current_user) != "admin":
        if booking.IdentifiantLocataire != current_user.IdentifiantUtilisateur:
            if booking.IdentifiantProprietaire != current_user.IdentifiantUtilisateur:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Accès non autorisé"
                )
    
    return BookingDetailResponse.model_validate(booking)


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Crée une nouvelle réservation."""
    # Vérifier disponibilité du véhicule
    vehicle_result = await db.execute(
        select(Vehicule).where(
            Vehicule.IdentifiantVehicule == booking_data.identifiant_vehicule
        )
    )
    vehicle = vehicle_result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Véhicule non trouvé"
        )
    
    if vehicle.StatutVehicule != 'Actif':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Véhicule non disponible"
        )
    
    # Vérifier pas de conflit de dates
    date_debut_dt = datetime.combine(booking_data.date_debut, datetime.min.time())
    date_fin_dt = datetime.combine(booking_data.date_fin, datetime.max.time())
    
    conflict_result = await db.execute(
        select(Reservation).where(
            and_(
                Reservation.IdentifiantVehicule == booking_data.identifiant_vehicule,
                Reservation.StatutReservation.in_(["EnAttente", "Confirmee", "EnCours"]),
                or_(
                    and_(
                        Reservation.DateDebut <= date_debut_dt,
                        Reservation.DateFin >= date_debut_dt
                    ),
                    and_(
                        Reservation.DateDebut <= date_fin_dt,
                        Reservation.DateFin >= date_fin_dt
                    ),
                    and_(
                        Reservation.DateDebut >= date_debut_dt,
                        Reservation.DateFin <= date_fin_dt
                    )
                )
            )
        )
    )
    
    if conflict_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Le véhicule n'est pas disponible pour ces dates"
        )
    
    # Calculer le nombre de jours et le total
    nombre_jours = (booking_data.date_fin - booking_data.date_debut).days + 1
    if nombre_jours < 1:
        nombre_jours = 1
    
    prix_journalier = float(vehicle.PrixJournalier)
    montant_location = prix_journalier * nombre_jours
    frais_service = montant_location * 0.05  # 5% frais
    frais_assurance = montant_location * 0.05 if booking_data.assurance else 0
    frais_livraison = float(vehicle.FraisLivraison) if booking_data.livraison_demandee else 0
    montant_total = montant_location + frais_service + frais_assurance + frais_livraison
    
    # Créer la réservation
    booking = Reservation(
        NumeroReservation=f'RES-TEMP-{uuid.uuid4().hex[:12].upper()}',  # Le trigger SQL remplacera par la valeur finale
        IdentifiantVehicule=booking_data.identifiant_vehicule,
        IdentifiantLocataire=current_user.IdentifiantUtilisateur,
        IdentifiantProprietaire=vehicle.IdentifiantProprietaire,
        DateDebut=date_debut_dt,
        DateFin=date_fin_dt,
        HeureDebut=booking_data.heure_debut,
        HeureFin=booking_data.heure_fin,
        LieuPriseEnCharge=booking_data.lieu_prise_en_charge,
        LieuRestitution=booking_data.lieu_restitution or booking_data.lieu_prise_en_charge,
        LivraisonDemandee=booking_data.livraison_demandee,
        AdresseLivraison=booking_data.adresse_livraison,
        FraisLivraison=Decimal(str(frais_livraison)),
        PrixJournalier=Decimal(str(prix_journalier)),
        MontantLocation=Decimal(str(montant_location)),
        MontantCaution=vehicle.CautionRequise,
        FraisService=Decimal(str(frais_service)),
        FraisAssurance=Decimal(str(frais_assurance)),
        MontantTotal=Decimal(str(montant_total)),
        KilometrageInclus=vehicle.KilometrageInclus,
        FraisKilometrageSupplementaire=vehicle.FraisKilometrageSupplementaire,
        CodePromo=booking_data.code_promo,
        EstAssurance=booking_data.assurance,
        TypeAssurance=booking_data.type_assurance,
        NotesSpeciales=booking_data.notes_speciales,
        StatutReservation="EnAttente",
        StatutPaiement="EnAttente",
        DateCreationReservation=datetime.utcnow()
    )
    
    await db.add(booking)
    await db.commit()
    await db.refresh(booking)
    
    return BookingResponse.model_validate(booking)


@router.put("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: int,
    status_data: BookingStatusUpdate,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Met à jour le statut d'une réservation."""
    result = await db.execute(
        select(Reservation).where(Reservation.IdentifiantReservation == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation non trouvée"
        )
    
    # Vérifier autorisation selon le statut
    allowed = False
    if _user_type(current_user) == "admin":
        allowed = True
    elif status_data.statut in ["Annulee", "RefuseeLocataire"] and booking.IdentifiantLocataire == current_user.IdentifiantUtilisateur:
        allowed = True
    elif _user_type(current_user) == "proprietaire":
        if booking.IdentifiantProprietaire == current_user.IdentifiantUtilisateur:
            allowed = True
    
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à modifier cette réservation"
        )
    
    booking.StatutReservation = status_data.statut
    
    # Gérer les cas spéciaux
    if status_data.statut == "Confirmee":
        booking.DateConfirmation = datetime.utcnow()
    elif status_data.statut == "Annulee":
        booking.DateAnnulation = datetime.utcnow()
        booking.AnnulePar = current_user.IdentifiantUtilisateur
        if status_data.motif:
            booking.MotifAnnulation = status_data.motif
    elif status_data.statut == "EnCours":
        booking.DateDebutEffectif = datetime.utcnow()
    elif status_data.statut == "Terminee":
        booking.DateFinEffective = datetime.utcnow()
    
    await db.commit()
    await db.refresh(booking)
    
    return BookingResponse.model_validate(booking)


@router.post("/{booking_id}/start", response_model=BookingResponse)
async def start_booking(
    booking_id: int,
    start_data: BookingStartRequest,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Démarre une réservation (prise en charge du véhicule)."""
    result = await db.execute(
        select(Reservation).where(Reservation.IdentifiantReservation == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation non trouvée"
        )
    
    if booking.StatutReservation != "Confirmee":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La réservation doit être confirmée pour démarrer"
        )
    
    # Vérifier autorisation (propriétaire uniquement)
    if booking.IdentifiantProprietaire != current_user.IdentifiantUtilisateur:
        if _user_type(current_user) != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seul le propriétaire peut démarrer la location"
            )
    
    booking.StatutReservation = "EnCours"
    booking.DateDebutEffectif = datetime.utcnow()
    booking.KilometrageDepart = start_data.kilometrage_depart
    booking.NiveauCarburantDepart = start_data.niveau_carburant
    if start_data.etat_vehicule:
        import json
        booking.EtatVehiculeDepart = json.dumps(start_data.etat_vehicule)
    if start_data.photos_depart:
        import json
        booking.PhotosDepart = json.dumps(start_data.photos_depart)
    if start_data.commentaires:
        booking.CommentairesProprietaire = start_data.commentaires
    
    await db.commit()
    await db.refresh(booking)
    
    return BookingResponse.model_validate(booking)


@router.post("/{booking_id}/end", response_model=BookingResponse)
async def end_booking(
    booking_id: int,
    end_data: BookingEndRequest,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Termine une réservation (restitution du véhicule)."""
    result = await db.execute(
        select(Reservation).where(Reservation.IdentifiantReservation == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation non trouvée"
        )
    
    if booking.StatutReservation != "EnCours":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La réservation doit être en cours pour être terminée"
        )
    
    # Vérifier autorisation
    if booking.IdentifiantProprietaire != current_user.IdentifiantUtilisateur:
        if _user_type(current_user) != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seul le propriétaire peut terminer la location"
            )
    
    booking.StatutReservation = "Terminee"
    booking.DateFinEffective = datetime.utcnow()
    booking.KilometrageRetour = end_data.kilometrage_retour
    booking.NiveauCarburantRetour = end_data.niveau_carburant
    if end_data.etat_vehicule:
        import json
        booking.EtatVehiculeRetour = json.dumps(end_data.etat_vehicule)
    if end_data.photos_retour:
        import json
        booking.PhotosRetour = json.dumps(end_data.photos_retour)
    if end_data.commentaires:
        booking.CommentairesProprietaire = (booking.CommentairesProprietaire or "") + "\n" + end_data.commentaires
    
    # Calculer frais supplémentaires si km dépassé
    if booking.KilometrageDepart and booking.KilometrageRetour:
        km_parcouru = booking.KilometrageRetour - booking.KilometrageDepart
        if km_parcouru > booking.KilometrageInclus:
            km_supplementaire = km_parcouru - booking.KilometrageInclus
            frais_km = km_supplementaire * float(booking.FraisKilometrageSupplementaire or 0)
            booking.FraisSupplementaires = Decimal(str(frais_km))
    
    await db.commit()
    await db.refresh(booking)
    
    return BookingResponse.model_validate(booking)


@router.post("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    cancel_data: BookingCancellationRequest,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Annule une réservation."""
    result = await db.execute(
        select(Reservation).where(Reservation.IdentifiantReservation == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation non trouvée"
        )
    
    if booking.IdentifiantLocataire != current_user.IdentifiantUtilisateur:
        if _user_type(current_user) != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas autorisé à annuler cette réservation"
            )
    
    if booking.StatutReservation not in ["EnAttente", "Confirmee"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cette réservation ne peut plus être annulée"
        )
    
    booking.StatutReservation = "Annulee"
    booking.MotifAnnulation = cancel_data.motif
    booking.DateAnnulation = datetime.utcnow()
    booking.AnnulePar = current_user.IdentifiantUtilisateur
    
    await db.commit()
    
    return {"message": "Réservation annulée avec succès"}


@router.post("/{booking_id}/extend", response_model=BookingResponse)
async def request_extension(
    booking_id: int,
    extension_data: BookingExtensionRequest,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Demande une extension de réservation."""
    result = await db.execute(
        select(Reservation).where(Reservation.IdentifiantReservation == booking_id)
    )
    booking = result.scalar_one_or_none()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation non trouvée"
        )
    
    if booking.IdentifiantLocataire != current_user.IdentifiantUtilisateur:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seul le locataire peut demander une extension"
        )
    
    if booking.StatutReservation not in ["Confirmee", "EnCours"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible d'étendre cette réservation"
        )
    
    # Calculer le montant supplémentaire
    nouvelle_date_fin = datetime.combine(extension_data.nouvelle_date_fin, datetime.max.time())
    jours_sup = (nouvelle_date_fin - booking.DateFin).days
    if jours_sup <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nouvelle date de fin doit être après la date actuelle"
        )
    
    montant_sup = float(booking.PrixJournalier) * jours_sup
    
    # Créer la demande d'extension
    extension = ExtensionReservation(
        IdentifiantReservation=booking_id,
        AncienneDateFin=booking.DateFin,
        NouvelleDateFin=nouvelle_date_fin,
        JoursSupplementaires=jours_sup,
        MontantSupplementaire=Decimal(str(montant_sup)),
        RaisonExtension=extension_data.raison,
        StatutDemande="EnAttente"
    )
    
    await db.add(extension)
    await db.commit()
    
    return BookingResponse.model_validate(booking)
