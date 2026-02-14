"""
Schémas Pydantic pour les incidents et réclamations
==================================================
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# ============================================================
# SCHÉMAS INCIDENTS
# ============================================================

class IncidentCreate(BaseModel):
    identifiant_reservation: int = Field(..., description="ID de la réservation concernée")
    type_incident: str = Field(..., description="Type d'incident")
    gravite: Optional[str] = Field("moyenne", description="Gravité: faible, moyenne, elevee, critique")
    date_incident: Optional[datetime] = Field(None, description="Date de l'incident")
    lieu_incident: Optional[str] = Field(None, max_length=500)
    description: str = Field(..., min_length=10, max_length=2000)
    photos_urls: Optional[str] = Field(None, description="URLs des photos (JSON)")


class IncidentUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=2000)
    photos_urls: Optional[str] = None
    temoin_nom: Optional[str] = Field(None, max_length=200)
    temoin_contact: Optional[str] = Field(None, max_length=200)
    numero_constat: Optional[str] = Field(None, max_length=100)
    numero_assurance: Optional[str] = Field(None, max_length=100)


class IncidentResponse(BaseModel):
    IdentifiantIncident: int
    IdentifiantReservation: int
    IdentifiantDeclarant: int
    TypeIncident: str
    GraviteIncident: str
    DateIncident: datetime
    LieuIncident: Optional[str]
    DescriptionIncident: str
    PhotosIncident: Optional[str]
    StatutIncident: str
    DateDeclaration: datetime
    DateResolution: Optional[datetime]
    IdentifiantGestionnaire: Optional[int]
    ActionsPrises: Optional[str]
    CoutReparation: Optional[Decimal]
    ResponsableIncident: Optional[str]
    TemoinNom: Optional[str]
    TemoinContact: Optional[str]
    NumeroConstat: Optional[str]
    NumeroAssurance: Optional[str]
    DateModification: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# SCHÉMAS RÉCLAMATIONS
# ============================================================

class ReclamationCreate(BaseModel):
    identifiant_reservation: Optional[int] = Field(None, description="ID de la réservation (optionnel)")
    type_reclamation: str = Field(..., description="Type de réclamation")
    priorite: Optional[str] = Field("normale", description="Priorité: faible, normale, elevee, urgente")
    objet: str = Field(..., min_length=5, max_length=500)
    description: str = Field(..., min_length=20, max_length=3000)
    montant_reclame: Optional[Decimal] = Field(None, description="Montant demandé en remboursement")
    pieces_jointes: Optional[str] = Field(None, description="URLs des pièces jointes (JSON)")


class ReclamationUpdate(BaseModel):
    description: Optional[str] = Field(None, max_length=3000)
    montant_reclame: Optional[Decimal] = None
    pieces_jointes: Optional[str] = None


class ReclamationResponse(BaseModel):
    IdentifiantReclamation: int
    IdentifiantReclamant: int
    IdentifiantReservation: Optional[int]
    NumeroReclamation: str
    TypeReclamation: str
    PrioriteReclamation: str
    ObjetReclamation: str
    DescriptionReclamation: str
    MontantReclame: Optional[Decimal]
    PiecesJointes: Optional[str]
    StatutReclamation: str
    DateCreation: datetime
    DateCloture: Optional[datetime]
    IdentifiantGestionnaire: Optional[int]
    ResolutionReclamation: Optional[str]
    MontantRembourse: Optional[Decimal]
    MethodeRemboursement: Optional[str]
    DateRemboursement: Optional[datetime]
    NoteSatisfaction: Optional[int]
    CommentaireSatisfaction: Optional[str]
    DateModification: Optional[datetime]

    class Config:
        from_attributes = True
