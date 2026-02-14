"""
Schémas Pydantic pour les codes promotionnels
==============================================
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class PromoCodeBase(BaseModel):
    code_promo: str = Field(..., min_length=3, max_length=50)
    type_promo: str  # Pourcentage, Montant, NuitsGratuites
    valeur_promo: Decimal
    date_debut: datetime
    date_fin: datetime
    description: Optional[str] = None


class PromoCodeCreate(PromoCodeBase):
    montant_minimum: Optional[Decimal] = None
    nombre_utilisations_max: Optional[int] = None
    utilisations_par_utilisateur: int = 1
    categories_applicables: Optional[str] = None  # JSON
    vehicules_applicables: Optional[str] = None  # JSON
    utilisateurs_applicables: Optional[str] = None  # JSON


class PromoCodeUpdate(BaseModel):
    valeur_promo: Optional[Decimal] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None
    actif: Optional[bool] = None
    nombre_utilisations_max: Optional[int] = None
    description: Optional[str] = None


class PromoCodeResponse(PromoCodeBase):
    identifiant_promo: int
    actif: bool
    nombre_utilisations_actuel: int
    nombre_utilisations_max: Optional[int]
    utilisations_par_utilisateur: int
    montant_minimum: Optional[Decimal]
    date_creation: datetime
    
    class Config:
        from_attributes = True


class PromoCodeValidationRequest(BaseModel):
    code_promo: str
    montant_reservation: Decimal
    identifiant_vehicule: Optional[int] = None


class PromoCodeValidationResponse(BaseModel):
    valide: bool
    message: str
    montant_remise: Optional[Decimal] = None
    type_remise: Optional[str] = None
    code_details: Optional[PromoCodeResponse] = None


class PromoCodeUsageResponse(BaseModel):
    identifiant_utilisation: int
    code_promo: str
    montant_remise: Decimal
    date_utilisation: datetime
    identifiant_utilisateur: int
    identifiant_reservation: int
    
    class Config:
        from_attributes = True
