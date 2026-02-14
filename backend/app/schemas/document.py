"""
Schémas Pydantic pour les documents KYC
========================================
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date


class DocumentBase(BaseModel):
    type_document: str  # CarteIdentite, Passeport, PermisConduire, JustificatifDomicile
    numero_document: str
    date_emission: Optional[date] = None
    date_expiration: Optional[date] = None
    pays_emission: str = "Bénin"


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    numero_document: Optional[str] = None
    date_emission: Optional[date] = None
    date_expiration: Optional[date] = None
    fichier_document: Optional[str] = None


class DocumentResponse(DocumentBase):
    identifiant_document: int
    fichier_document: Optional[str]
    statut_verification: str
    date_verification: Optional[datetime]
    verifie_par: Optional[int]
    commentaires_verification: Optional[str]
    date_upload: datetime
    
    class Config:
        from_attributes = True


class DocumentVerificationRequest(BaseModel):
    statut: str  # en_attente, verifie, refuse
    motif_refus: Optional[str] = None
    notes: Optional[str] = None
