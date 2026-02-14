"""
Schémas Pydantic pour le programme de fidélité
===============================================
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal


class LoyaltyProgramResponse(BaseModel):
    identifiant_programme: int
    nom_programme: str
    niveau: str
    seuil_points: int
    pourcentage_remise: Decimal
    priorite_support: bool
    annulation_gratuite: bool
    acces_exclusif: bool
    surclassement_gratuit: bool
    avantages: Optional[str]
    couleur_badge: Optional[str]
    icone_badge: Optional[str]
    
    class Config:
        from_attributes = True


class PointsHistoryResponse(BaseModel):
    identifiant_point: int
    type_acquisition: str
    points_acquis: int
    points_utilises: int
    solde_points: int
    date_acquisition: datetime
    date_expiration: Optional[datetime]
    description: Optional[str]
    est_expire: bool
    
    class Config:
        from_attributes = True


class PointsCreate(BaseModel):
    identifiant_utilisateur: int
    type_acquisition: str
    points_acquis: int
    description: Optional[str] = None
    identifiant_source: Optional[int] = None
    type_source: Optional[str] = None


class ReferralCreate(BaseModel):
    email_filleul: str


class ReferralResponse(BaseModel):
    identifiant_parrainage: int
    code_parrainage: str
    email_filleul: Optional[str]
    date_invitation: datetime
    date_inscription: Optional[datetime]
    statut_parrainage: str
    points_parrain: int
    points_filleul: int
    remise_parrain: Decimal
    remise_filleul: Decimal
    premier_achat_effectue: bool
    recompenses_attribuees: bool
    
    class Config:
        from_attributes = True


class UserLoyaltyStatusResponse(BaseModel):
    niveau_actuel: str
    points_totaux: int
    points_disponibles: int
    points_expires: int
    prochain_niveau: Optional[str]
    points_manquants_prochain_niveau: Optional[int]
    avantages_actuels: List[str]
    historique_points: List[PointsHistoryResponse]
    parrainages_actifs: int
