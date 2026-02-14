"""
Schémas Pydantic pour la tarification dynamique
================================================
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from decimal import Decimal


class DynamicPricingRuleBase(BaseModel):
    nom_regle: str
    type_regle: str  # Saisonnalite, Demande, Evenement, Weekend, Promotion
    coefficient_prix: Decimal
    date_debut: datetime
    date_fin: datetime
    priorite: int = 0
    jours_semaine_applicable: Optional[str] = None


class DynamicPricingRuleCreate(DynamicPricingRuleBase):
    identifiant_vehicule: int


class DynamicPricingRuleUpdate(BaseModel):
    nom_regle: Optional[str] = None
    coefficient_prix: Optional[Decimal] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None
    actif: Optional[bool] = None


class DynamicPricingRuleResponse(DynamicPricingRuleBase):
    identifiant_regle: int
    identifiant_vehicule: int
    actif: bool
    date_creation: datetime
    
    class Config:
        from_attributes = True


class PriceCalculationRequest(BaseModel):
    identifiant_vehicule: int
    date_debut: date
    date_fin: date


class PriceCalculationResponse(BaseModel):
    prix_base: Decimal
    prix_ajuste: Decimal
    regles_appliquees: list
    detail_jours: list
    total_jours: int
    economie: Optional[Decimal] = None


class PriceHistoryResponse(BaseModel):
    identifiant_historique: int
    identifiant_vehicule: int
    prix_base: Decimal
    prix_ajuste: Decimal
    taux_occupation: Optional[Decimal]
    demande_estimee: Optional[str]
    date_enregistrement: datetime
    
    class Config:
        from_attributes = True
