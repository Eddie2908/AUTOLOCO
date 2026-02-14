"""
Schémas Pydantic pour les paiements
====================================
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PaymentCreate(BaseModel):
    identifiant_reservation: int
    methode_paiement: str


class PaymentResponse(BaseModel):
    id: int
    reservation_id: int
    montant: int
    methode_paiement: str
    reference_paiement: Optional[str]
    statut: str
    date_creation: datetime
    date_paiement: Optional[datetime]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        return cls(
            id=obj.IdentifiantPaiement,
            reservation_id=obj.IdentifiantReservation,
            montant=obj.Montant,
            methode_paiement=obj.MethodePaiement,
            reference_paiement=obj.ReferencePaiement,
            statut=obj.Statut,
            date_creation=obj.DateCreation,
            date_paiement=obj.DatePaiement
        )


class PaymentListResponse(BaseModel):
    payments: List[PaymentResponse]
    total: int
    page: int
    page_size: int


class PaymentMethodResponse(BaseModel):
    id: str
    name: str
    icon: Optional[str]
    available: bool
