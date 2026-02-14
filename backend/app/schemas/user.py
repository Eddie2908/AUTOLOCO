"""
Schémas Pydantic pour les utilisateurs
=======================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    nom: str
    prenom: Optional[str] = None
    telephone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    type_utilisateur: str = "Locataire"


class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    photo_profil: Optional[str] = None
    date_naissance: Optional[datetime] = None
    biographie: Optional[str] = None
    site_web: Optional[str] = None
    langue: Optional[str] = None
    devise: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    type_utilisateur: str
    nom: str
    prenom: Optional[str]
    telephone: Optional[str]
    photo_profil: Optional[str]
    note_globale: Optional[float]
    statut: str
    niveau_fidelite: Optional[str]
    points_fidelite: Optional[int]
    date_inscription: datetime
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        return cls(
            id=obj.IdentifiantUtilisateur,
            email=obj.Email,
            type_utilisateur=obj.TypeUtilisateur,
            nom=obj.Nom,
            prenom=obj.Prenom,
            telephone=obj.NumeroTelephone,
            photo_profil=obj.PhotoProfil,
            note_globale=float(obj.NotesUtilisateur) if obj.NotesUtilisateur else 0.0,
            statut=obj.StatutCompte,
            niveau_fidelite=obj.NiveauFidelite,
            points_fidelite=obj.PointsFideliteTotal,
            date_inscription=obj.DateInscription
        )


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    page_size: int


class UserStatsResponse(BaseModel):
    total_reservations: int
    reservations_terminees: int
    note_moyenne: Optional[float]
    revenus_totaux: Optional[int]
    points_fidelite: Optional[int]
    niveau_fidelite: Optional[str]


class OwnerResponse(UserResponse):
    biographie: Optional[str]
    site_web: Optional[str]
    nombre_vehicules: int = 0
    temps_reponse: Optional[str]
    taux_acceptation: float = 0


class RenterResponse(UserResponse):
    date_naissance: Optional[datetime]
    nombre_locations: int = 0
    email_verifie: bool = False
    telephone_verifie: bool = False


class PasswordChangeRequest(BaseModel):
    """Requête de changement de mot de passe"""
    current_password: str
    new_password: str = Field(..., min_length=8)


class UserPreferencesUpdate(BaseModel):
    """Mise à jour des préférences utilisateur"""
    notifications_email: Optional[bool] = None
    notifications_sms: Optional[bool] = None
    notifications_push: Optional[bool] = None
    notifications_reservations: Optional[bool] = None
    notifications_promotions: Optional[bool] = None
    notifications_messages: Optional[bool] = None
    mode_theme: Optional[str] = None
    affichage_monnaie: Optional[str] = None
    fuseau_horaire: Optional[str] = None
    visibilite_profile: Optional[str] = None
    afficher_telephone: Optional[bool] = None
    afficher_email: Optional[bool] = None
    autoriser_messages: Optional[bool] = None
