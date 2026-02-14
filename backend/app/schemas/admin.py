"""
Schémas Pydantic pour l'administration
=======================================
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DashboardStats(BaseModel):
    total_users: int
    total_vehicles: int
    total_bookings: int
    total_revenue: int
    new_users_week: int
    new_bookings_week: int
    platform_commission: int


class UserAdminResponse(BaseModel):
    id: int
    email: str
    nom: str
    prenom: Optional[str]
    type_utilisateur: str
    statut: str
    date_creation: datetime
    derniere_connexion: Optional[datetime]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        return cls(
            id=obj.IdentifiantUtilisateur,
            email=obj.Email,
            nom=obj.Nom,
            prenom=obj.Prenom,
            type_utilisateur=obj.TypeUtilisateur,
            statut=obj.Statut,
            date_creation=obj.DateCreation,
            derniere_connexion=obj.DerniereConnexion
        )


class VehicleAdminResponse(BaseModel):
    id: int
    marque: str
    modele: str
    proprietaire_id: int
    statut_verification: str
    date_creation: datetime
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        return cls(
            id=obj.IdentifiantVehicule,
            marque=obj.Marque,
            modele=obj.Modele,
            proprietaire_id=obj.IdentifiantProprietaire,
            statut_verification=obj.StatutVerification,
            date_creation=obj.DateCreation
        )


class ModerationAction(BaseModel):
    action: str  # approve, reject
    reason: Optional[str] = None
