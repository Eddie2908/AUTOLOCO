"""
Endpoints API pour la gestion des incidents et réclamations
==========================================================
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import Utilisateur
from app.models.incident import Incident, Reclamation
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentUpdate,
    ReclamationCreate,
    ReclamationResponse,
    ReclamationUpdate
)

router = APIRouter()


def _user_type(current_user: Utilisateur) -> str:
    # Certains modules historiques utilisent TypeCompte; on supporte les 2.
    return (
        getattr(current_user, "TypeUtilisateur", None)
        or getattr(current_user, "TypeCompte", None)
        or ""
    ).lower()


# ============================================================
# ENDPOINTS INCIDENTS
# ============================================================

@router.post("/incidents", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    *,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
    incident_data: IncidentCreate
):
    """
    Déclarer un nouvel incident pendant ou après une réservation
    
    Types d'incidents:
    - accident
    - panne_mecanique
    - crevaison
    - vandalisme
    - vol
    - retard_livraison
    - probleme_proprete
    - autre
    """
    # Vérifier que la réservation existe et appartient à l'utilisateur
    from app.models.booking import Reservation
    reservation = db.query(Reservation).filter(
        Reservation.IdentifiantReservation == incident_data.identifiant_reservation
    ).first()
    
    if not reservation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réservation non trouvée"
        )
    
    # Vérifier que l'utilisateur est impliqué dans la réservation
    if reservation.IdentifiantLocataire != current_user.IdentifiantUtilisateur and \
       reservation.IdentifiantProprietaire != current_user.IdentifiantUtilisateur:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à déclarer un incident pour cette réservation"
        )
    
    # Créer l'incident
    new_incident = Incident(
        IdentifiantReservation=incident_data.identifiant_reservation,
        IdentifiantDeclarant=current_user.IdentifiantUtilisateur,
        TypeIncident=incident_data.type_incident,
        GraviteIncident=incident_data.gravite or "moyenne",
        DateIncident=incident_data.date_incident or datetime.utcnow(),
        LieuIncident=incident_data.lieu_incident,
        DescriptionIncident=incident_data.description,
        PhotosIncident=incident_data.photos_urls,
        StatutIncident="en_attente",
        DateDeclaration=datetime.utcnow()
    )
    
    await db.add(new_incident)
    await db.commit()
    await db.refresh(new_incident)
    
    # TODO: Envoyer notification aux parties concernées
    
    return new_incident


@router.get("/incidents/me", response_model=List[IncidentResponse])
async def get_my_incidents(
    *,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    statut: Optional[str] = None
):
    """Récupérer mes incidents déclarés"""
    query = db.query(Incident).filter(
        Incident.IdentifiantDeclarant == current_user.IdentifiantUtilisateur
    )
    
    if statut:
        query = query.filter(Incident.StatutIncident == statut)
    
    incidents = query.order_by(Incident.DateDeclaration.desc()).offset(skip).limit(limit).all()
    
    return incidents


@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Récupérer les détails d'un incident"""
    incident = db.query(Incident).filter(
        Incident.IdentifiantIncident == incident_id
    ).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident non trouvé"
        )
    
    # Vérifier les permissions
    from app.models.booking import Reservation
    reservation = db.query(Reservation).filter(
        Reservation.IdentifiantReservation == incident.IdentifiantReservation
    ).first()
    
    if incident.IdentifiantDeclarant != current_user.IdentifiantUtilisateur and \
       (not reservation or (reservation.IdentifiantLocataire != current_user.IdentifiantUtilisateur and \
        reservation.IdentifiantProprietaire != current_user.IdentifiantUtilisateur)) and \
       _user_type(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à cet incident"
        )
    
    return incident


@router.put("/incidents/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: int,
    incident_update: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Mettre à jour un incident (Admin ou déclarant)"""
    incident = db.query(Incident).filter(
        Incident.IdentifiantIncident == incident_id
    ).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident non trouvé"
        )
    
    # Vérifier les permissions
    if incident.IdentifiantDeclarant != current_user.IdentifiantUtilisateur and \
       _user_type(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à modifier cet incident"
        )
    
    # Mettre à jour les champs
    update_data = incident_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(incident, field, value)
    
    incident.DateModification = datetime.utcnow()
    
    await db.commit()
    await db.refresh(incident)
    
    return incident


@router.post("/incidents/{incident_id}/resolve", response_model=IncidentResponse)
async def resolve_incident(
    incident_id: int,
    resolution_data: dict,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Résoudre un incident (Admin uniquement)"""
    if _user_type(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs peuvent résoudre les incidents"
        )
    
    incident = db.query(Incident).filter(
        Incident.IdentifiantIncident == incident_id
    ).first()
    
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Incident non trouvé"
        )
    
    # Mettre à jour le statut
    incident.StatutIncident = "resolu"
    incident.DateResolution = datetime.utcnow()
    incident.IdentifiantGestionnaire = current_user.IdentifiantUtilisateur
    incident.ActionsPrises = resolution_data.get("actions_prises")
    incident.CoutReparation = resolution_data.get("cout_reparation")
    incident.ResponsableIncident = resolution_data.get("responsable")
    
    await db.commit()
    await db.refresh(incident)
    
    return incident


# ============================================================
# ENDPOINTS RÉCLAMATIONS
# ============================================================

@router.post("/reclamations", response_model=ReclamationResponse, status_code=status.HTTP_201_CREATED)
async def create_reclamation(
    *,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
    reclamation_data: ReclamationCreate
):
    """
    Créer une nouvelle réclamation
    
    Types de réclamations:
    - remboursement
    - qualite_service
    - facturation
    - vehicule_non_conforme
    - retard
    - annulation
    - autre
    """
    # Vérifier que la réservation existe si fournie
    if reclamation_data.identifiant_reservation:
        from app.models.booking import Reservation
        reservation = db.query(Reservation).filter(
            Reservation.IdentifiantReservation == reclamation_data.identifiant_reservation
        ).first()
        
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Réservation non trouvée"
            )
        
        # Vérifier que l'utilisateur est le locataire
        if reservation.IdentifiantLocataire != current_user.IdentifiantUtilisateur:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous ne pouvez créer une réclamation que pour vos propres réservations"
            )
    
    # Créer la réclamation
    new_reclamation = Reclamation(
        IdentifiantReclamant=current_user.IdentifiantUtilisateur,
        IdentifiantReservation=reclamation_data.identifiant_reservation,
        TypeReclamation=reclamation_data.type_reclamation,
        PrioriteReclamation=reclamation_data.priorite or "normale",
        ObjetReclamation=reclamation_data.objet,
        DescriptionReclamation=reclamation_data.description,
        MontantReclame=reclamation_data.montant_reclame,
        PiecesJointes=reclamation_data.pieces_jointes,
        StatutReclamation="ouverte",
        DateCreation=datetime.utcnow()
    )
    
    await db.add(new_reclamation)
    await db.commit()
    await db.refresh(new_reclamation)
    
    # TODO: Envoyer notification au support
    
    return new_reclamation


@router.get("/reclamations/me", response_model=List[ReclamationResponse])
async def get_my_reclamations(
    *,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50,
    statut: Optional[str] = None
):
    """Récupérer mes réclamations"""
    query = db.query(Reclamation).filter(
        Reclamation.IdentifiantReclamant == current_user.IdentifiantUtilisateur
    )
    
    if statut:
        query = query.filter(Reclamation.StatutReclamation == statut)
    
    reclamations = query.order_by(Reclamation.DateCreation.desc()).offset(skip).limit(limit).all()
    
    return reclamations


@router.get("/reclamations/{reclamation_id}", response_model=ReclamationResponse)
async def get_reclamation(
    reclamation_id: int,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Récupérer les détails d'une réclamation"""
    reclamation = db.query(Reclamation).filter(
        Reclamation.IdentifiantReclamation == reclamation_id
    ).first()
    
    if not reclamation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réclamation non trouvée"
        )
    
    # Vérifier les permissions
    if reclamation.IdentifiantReclamant != current_user.IdentifiantUtilisateur and \
       _user_type(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à cette réclamation"
        )
    
    return reclamation


@router.put("/reclamations/{reclamation_id}", response_model=ReclamationResponse)
async def update_reclamation(
    reclamation_id: int,
    reclamation_update: ReclamationUpdate,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Mettre à jour une réclamation"""
    reclamation = db.query(Reclamation).filter(
        Reclamation.IdentifiantReclamation == reclamation_id
    ).first()
    
    if not reclamation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réclamation non trouvée"
        )
    
    # Vérifier les permissions
    if reclamation.IdentifiantReclamant != current_user.IdentifiantUtilisateur and \
       _user_type(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à modifier cette réclamation"
        )
    
    # Mettre à jour les champs
    update_data = reclamation_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(reclamation, field, value)
    
    reclamation.DateModification = datetime.utcnow()
    
    await db.commit()
    await db.refresh(reclamation)
    
    return reclamation


@router.post("/reclamations/{reclamation_id}/close", response_model=ReclamationResponse)
async def close_reclamation(
    reclamation_id: int,
    resolution_data: dict,
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user)
):
    """Clôturer une réclamation (Admin uniquement)"""
    if _user_type(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs peuvent clôturer les réclamations"
        )
    
    reclamation = db.query(Reclamation).filter(
        Reclamation.IdentifiantReclamation == reclamation_id
    ).first()
    
    if not reclamation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Réclamation non trouvée"
        )
    
    # Mettre à jour le statut
    reclamation.StatutReclamation = resolution_data.get("statut", "fermee")
    reclamation.DateCloture = datetime.utcnow()
    reclamation.IdentifiantGestionnaire = current_user.IdentifiantUtilisateur
    reclamation.ResolutionReclamation = resolution_data.get("resolution")
    reclamation.MontantRembourse = resolution_data.get("montant_rembourse")
    
    await db.commit()
    await db.refresh(reclamation)
    
    # TODO: Envoyer notification au réclamant
    
    return reclamation


@router.get("/reclamations/all/pending", response_model=List[ReclamationResponse])
async def get_pending_reclamations(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_user),
    skip: int = 0,
    limit: int = 50
):
    """Récupérer toutes les réclamations ouvertes (Admin uniquement)"""
    if _user_type(current_user) != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seuls les administrateurs peuvent accéder à cette ressource"
        )
    
    reclamations = db.query(Reclamation).filter(
        Reclamation.StatutReclamation.in_(["ouverte", "en_cours"])
    ).order_by(Reclamation.PrioriteReclamation, Reclamation.DateCreation).offset(skip).limit(limit).all()
    
    return reclamations
