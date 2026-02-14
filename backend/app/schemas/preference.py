"""
Schémas Pydantic pour les préférences utilisateur
==================================================
"""

from pydantic import BaseModel
from typing import Optional


class PreferenceUpdate(BaseModel):
    # Notifications
    notifications_email: Optional[bool] = None
    notifications_sms: Optional[bool] = None
    notifications_push: Optional[bool] = None
    notifications_reservations: Optional[bool] = None
    notifications_messages: Optional[bool] = None
    notifications_promotions: Optional[bool] = None
    notifications_avis: Optional[bool] = None
    
    # Affichage
    mode_theme: Optional[str] = None  # Clair, Sombre, Auto
    langue: Optional[str] = None
    fuseau_horaire: Optional[str] = None
    affichage_monnaie: Optional[str] = None
    format_date: Optional[str] = None
    
    # Confidentialité
    visibilite_profil: Optional[str] = None  # Public, Prive, AmisUniquement
    afficher_telephone: Optional[bool] = None
    afficher_email: Optional[bool] = None
    autoriser_messages: Optional[bool] = None
    autoriser_appels: Optional[bool] = None


class PreferenceResponse(BaseModel):
    identifiant_preference: int
    identifiant_utilisateur: int
    
    # Notifications
    notifications_email: bool
    notifications_sms: bool
    notifications_push: bool
    notifications_reservations: bool
    notifications_messages: bool
    notifications_promotions: bool
    notifications_avis: bool
    
    # Affichage
    mode_theme: str
    langue: str
    fuseau_horaire: Optional[str]
    affichage_monnaie: str
    format_date: str
    
    # Confidentialité
    visibilite_profil: str
    afficher_telephone: bool
    afficher_email: bool
    autoriser_messages: bool
    autoriser_appels: bool
    
    class Config:
        from_attributes = True
