"""
Schémas Pydantic pour l'authentification
=========================================
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime


class RegisterRequest(BaseModel):
    """Requête d'inscription."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    nom: str = Field(..., min_length=2)
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    ville: Optional[str] = None
    type_utilisateur: str = Field(default="locataire", pattern="^(locataire|proprietaire)$")


class RegisterResponse(BaseModel):
    """Réponse d'inscription."""
    user_id: int
    email: str
    type_utilisateur: str
    access_token: str
    refresh_token: str
    message: str


class LoginRequest(BaseModel):
    """Requête de connexion."""
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """Réponse de connexion."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class TokenRefreshRequest(BaseModel):
    """Requête de rafraîchissement du token."""
    refresh_token: str


class TokenRefreshResponse(BaseModel):
    """Réponse de rafraîchissement du token."""
    access_token: str
    token_type: str = "bearer"


class LogoutRequest(BaseModel):
    """Requête de déconnexion."""
    refresh_token: str = Field(..., description="Refresh token à révoquer")
    logout_all_devices: bool = Field(
        default=False,
        description="Si True, déconnecte tous les appareils"
    )


class LogoutResponse(BaseModel):
    """Réponse de déconnexion."""
    success: bool
    message: str
    logged_out_devices: int
    timestamp: Optional[str] = None


class SessionResponse(BaseModel):
    """Informations sur une session active."""
    session_id: int
    device: Optional[str] = None
    browser: Optional[str] = None
    location: Optional[str] = None
    ip_address: Optional[str] = None
    last_activity: datetime
    is_current: bool = False
    
    class Config:
        from_attributes = True


class ForceLogoutRequest(BaseModel):
    """Requête de déconnexion forcée (admin)."""
    reason: str = Field(..., min_length=10, max_length=255)
    notify_user: bool = Field(default=True)
