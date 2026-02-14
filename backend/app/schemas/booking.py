"""
Schémas Pydantic pour les réservations
=======================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime, time


class BookingCreate(BaseModel):
    identifiant_vehicule: int
    date_debut: date
    date_fin: date
    heure_debut: Optional[time] = None
    heure_fin: Optional[time] = None
    lieu_prise_en_charge: str
    lieu_restitution: Optional[str] = None
    livraison_demandee: bool = False
    adresse_livraison: Optional[str] = None
    code_promo: Optional[str] = None
    assurance: bool = False
    type_assurance: Optional[str] = None
    notes_speciales: Optional[str] = None
    conducteurs_supplementaires: Optional[List[dict]] = None


class BookingUpdate(BaseModel):
    lieu_prise_en_charge: Optional[str] = None
    lieu_restitution: Optional[str] = None
    notes_speciales: Optional[str] = None


class BookingStatusUpdate(BaseModel):
    statut: str = Field(..., pattern="^(EnAttente|Confirmee|EnCours|Terminee|Annulee|RefuseeProprietaire|RefuseeLocataire)$")
    motif: Optional[str] = None


class BookingResponse(BaseModel):
    id: str
    numero_reservation: str
    locataire_id: str
    vehicule_id: str
    proprietaire_id: str
    date_debut: datetime
    date_fin: datetime
    nombre_jours: int
    lieu_prise_en_charge: Optional[str]
    lieu_restitution: Optional[str]
    prix_journalier: float
    montant_location: float
    montant_caution: float
    frais_service: float
    frais_assurance: float
    remise: float
    montant_total: float
    statut_reservation: str
    statut_paiement: str
    methode_paiement: Optional[str]
    date_creation: datetime
    vehicle_name: Optional[str] = None
    vehicle_image: Optional[str] = None
    owner_name: Optional[str] = None
    owner_image: Optional[str] = None
    owner_phone: Optional[str] = None
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        # Vehicle info
        vehicle_name = None
        vehicle_image = None
        if hasattr(obj, 'vehicule') and obj.vehicule:
            vehicle_name = obj.vehicule.TitreAnnonce
            if hasattr(obj.vehicule, 'photos') and obj.vehicule.photos:
                vehicle_image = obj.vehicule.photos[0].URLPhoto
        
        # Owner info
        owner_name = None
        owner_image = None
        owner_phone = None
        if hasattr(obj, 'proprietaire') and obj.proprietaire:
            p = obj.proprietaire
            owner_name = f"{p.Prenom or ''} {p.Nom or ''}".strip() or "Propriétaire"
            owner_image = p.PhotoProfil
            owner_phone = p.NumeroTelephone
        
        return cls(
            id=str(obj.IdentifiantReservation),
            numero_reservation=obj.NumeroReservation or f"RES-{obj.IdentifiantReservation}",
            locataire_id=str(obj.IdentifiantLocataire),
            vehicule_id=str(obj.IdentifiantVehicule),
            proprietaire_id=str(obj.IdentifiantProprietaire),
            date_debut=obj.DateDebut,
            date_fin=obj.DateFin,
            nombre_jours=obj.NombreJours,
            lieu_prise_en_charge=obj.LieuPriseEnCharge,
            lieu_restitution=obj.LieuRestitution,
            prix_journalier=float(obj.PrixJournalier) if obj.PrixJournalier else 0,
            montant_location=float(obj.MontantLocation) if obj.MontantLocation else 0,
            montant_caution=float(obj.MontantCaution) if obj.MontantCaution else 0,
            frais_service=float(obj.FraisService) if obj.FraisService else 0,
            frais_assurance=float(obj.FraisAssurance) if obj.FraisAssurance else 0,
            remise=float(obj.Remise) if obj.Remise else 0,
            montant_total=float(obj.MontantTotal) if obj.MontantTotal else 0,
            statut_reservation=obj.StatutReservation,
            statut_paiement=obj.StatutPaiement,
            methode_paiement=obj.MethodePaiement,
            date_creation=obj.DateCreationReservation,
            vehicle_name=vehicle_name,
            vehicle_image=vehicle_image,
            owner_name=owner_name,
            owner_image=owner_image,
            owner_phone=owner_phone,
        )


class BookingDetailResponse(BookingResponse):
    vehicule: Optional[dict] = None
    locataire: Optional[dict] = None
    proprietaire: Optional[dict] = None
    
    # Détails supplémentaires
    livraison_demandee: bool = False
    adresse_livraison: Optional[str] = None
    frais_livraison: float = 0
    
    # Kilométrage
    kilometrage_depart: Optional[int] = None
    kilometrage_retour: Optional[int] = None
    kilometrage_inclus: int = 200
    
    # Carburant
    niveau_carburant_depart: Optional[str] = None
    niveau_carburant_retour: Optional[str] = None
    
    # Assurance
    assurance_active: bool = False
    type_assurance: Optional[str] = None
    montant_assurance: float = 0
    
    # Commentaires
    commentaires_locataire: Optional[str] = None
    commentaires_proprietaire: Optional[str] = None
    notes_speciales: Optional[str] = None


class BookingListResponse(BaseModel):
    bookings: List[BookingResponse]
    total: int
    page: int
    page_size: int


class BookingExtensionRequest(BaseModel):
    """Demande d'extension de réservation"""
    nouvelle_date_fin: date
    raison: Optional[str] = None


class BookingExtensionResponse(BaseModel):
    """Réponse extension de réservation"""
    id: int
    reservation_id: int
    ancienne_date_fin: datetime
    nouvelle_date_fin: datetime
    jours_supplementaires: int
    montant_supplementaire: float
    statut: str
    date_demande: datetime


class BookingCancellationRequest(BaseModel):
    """Demande d'annulation de réservation"""
    motif: str = Field(..., min_length=10)


class BookingStartRequest(BaseModel):
    """Démarrage d'une réservation"""
    kilometrage_depart: int
    niveau_carburant: str = Field(..., pattern="^(Vide|1/4|1/2|3/4|Plein)$")
    etat_vehicule: Optional[dict] = None
    photos_depart: Optional[List[str]] = None
    commentaires: Optional[str] = None


class BookingEndRequest(BaseModel):
    """Fin d'une réservation"""
    kilometrage_retour: int
    niveau_carburant: str = Field(..., pattern="^(Vide|1/4|1/2|3/4|Plein)$")
    etat_vehicule: Optional[dict] = None
    photos_retour: Optional[List[str]] = None
    commentaires: Optional[str] = None
