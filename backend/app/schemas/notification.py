"""
Schémas Pydantic pour les notifications.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    """Réponse pour une notification"""
    
    id: int = Field(alias="IDNotification")
    user_id: int = Field(alias="IdentifiantUtilisateur")
    title: str = Field(alias="Titre")
    content: str = Field(alias="Contenu")
    type: str = Field(alias="TypeNotification")
    category: Optional[str] = Field(alias="Categorie")
    priority: str = Field(alias="Priorite")
    icon: Optional[str] = Field(alias="IconeNotification")
    action_url: Optional[str] = Field(alias="ActionURL")
    data: Optional[Dict[str, Any]] = Field(alias="DataJSON")
    is_read: bool = Field(alias="EstLue")
    read_at: Optional[datetime] = Field(alias="DateLecture")
    created_at: datetime = Field(alias="DateCreation")
    
    class Config:
        from_attributes = True
        populate_by_name = True
    
    @classmethod
    def model_validate(cls, obj):
        return cls(
            id=obj.IdentifiantNotification,
            user_id=obj.IdentifiantUtilisateur,
            title=obj.Titre,
            content=obj.Contenu,
            type=obj.TypeNotification or "info",
            category=obj.Categorie,
            priority=obj.Priorite or "normal",
            icon=obj.IconeNotification,
            action_url=obj.ActionURL,
            data=obj.DataJSON,
            is_read=obj.EstLue or False,
            read_at=obj.DateLecture,
            created_at=obj.DateCreation
        )


class NotificationListResponse(BaseModel):
    """Réponse pour une liste de notifications"""
    
    notifications: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    page_size: int


class NotificationPreferenceUpdate(BaseModel):
    """Mise à jour des préférences de notification"""
    
    email: bool = True
    sms: bool = False
    push: bool = True
    in_app: bool = True
    frequency: str = "immediate"  # immediate, daily, weekly


class DeviceTokenCreate(BaseModel):
    """Enregistrement d'un token FCM"""
    
    token: str = Field(..., min_length=10)
    device_type: str = Field(..., pattern="^(ios|android|web)$")
    device_model: Optional[str] = None
    app_version: Optional[str] = None


class NotificationMarkRead(BaseModel):
    """Marquer des notifications comme lues"""
    
    notification_ids: List[int]
