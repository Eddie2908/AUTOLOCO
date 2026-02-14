"""
Schémas Pydantic pour la messagerie
====================================
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class MessageCreate(BaseModel):
    identifiant_destinataire: int
    contenu: str


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    expediteur_id: int
    destinataire_id: int
    contenu: str
    est_lu: bool
    date_envoi: datetime
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        return cls(
            id=obj.IdentifiantMessage,
            conversation_id=obj.IdentifiantConversation,
            expediteur_id=obj.IdentifiantExpediteur,
            destinataire_id=obj.IdentifiantDestinataire,
            contenu=obj.Contenu,
            est_lu=obj.EstLu,
            date_envoi=obj.DateEnvoi
        )


class ConversationResponse(BaseModel):
    id: int
    utilisateur1_id: int
    utilisateur2_id: int
    dernier_message: Optional[datetime]
    apercu: Optional[str]
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        return cls(
            id=obj.IdentifiantConversation,
            utilisateur1_id=obj.IdentifiantUtilisateur1,
            utilisateur2_id=obj.IdentifiantUtilisateur2,
            dernier_message=obj.DernierMessage,
            apercu=obj.AperçuDernierMessage
        )


class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]
    total: int
    page: int
    page_size: int
