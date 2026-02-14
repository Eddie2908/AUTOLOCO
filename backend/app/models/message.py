"""
Modèle SQLAlchemy pour la messagerie
=====================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


# Conversation est définie dans app/models/conversation.py
# Importer depuis ce module: from app.models.conversation import Conversation


class Message(Base):
    """Table des messages - Correspond à la table Messages du schéma SQL"""
    
    __tablename__ = "Messages"
    
    IdentifiantMessage = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantConversation = Column(Integer, ForeignKey("Conversations.IdentifiantConversation"), nullable=False)
    IdentifiantExpediteur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    IdentifiantDestinataire = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    ContenuMessage = Column(Text, nullable=False)
    TypeMessage = Column(String(20), default='Texte')  # Texte, Image, Document, Audio, Systeme
    PiecesJointes = Column(Text)  # JSON array
    DateEnvoi = Column(DateTime, default=datetime.utcnow)
    DateLecture = Column(DateTime)
    EstLu = Column(Boolean, default=False)
    EstArchive = Column(Boolean, default=False)
    EstSupprime = Column(Boolean, default=False)
    
    # Relations
    conversation = relationship("Conversation", back_populates="messages")
    
    # Propriétés pour compatibilité avec l'ancien code
    @property
    def Contenu(self):
        return self.ContenuMessage
    
    @Contenu.setter
    def Contenu(self, value):
        self.ContenuMessage = value


# TemplateNotification et DeclencheurNotification sont définies dans app/models/notification_template.py
# Importer depuis ce module: from app.models.notification_template import TemplateNotification, DeclencheurNotification
