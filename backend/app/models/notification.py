"""
Modèle SQLAlchemy pour les notifications
=========================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from datetime import datetime

from app.core.database import Base


class Notification(Base):
    """Table des notifications - Correspond à la table Notifications du schéma SQL"""
    
    __tablename__ = "Notifications"
    
    IdentifiantNotification = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    TypeNotification = Column(String(50), nullable=False)
    TitreNotification = Column(String(255), nullable=False)
    MessageNotification = Column(Text, nullable=False)
    LienNotification = Column(String(500))
    IconeNotification = Column(String(50))
    PrioriteNotification = Column(String(20), default='Normal')  # Faible, Normal, Elevee, Urgente
    CanalEnvoi = Column(String(20))  # Application, Email, SMS, Push
    DateCreation = Column(DateTime, default=datetime.utcnow)
    DateEnvoi = Column(DateTime)
    DateLecture = Column(DateTime)
    EstLu = Column(Boolean, default=False)
    EstArchive = Column(Boolean, default=False)
    MetaDonnees = Column(Text)  # JSON
    
    # Propriétés pour compatibilité avec l'ancien code
    @property
    def Titre(self):
        return self.TitreNotification
    
    @Titre.setter
    def Titre(self, value):
        self.TitreNotification = value
    
    @property
    def Contenu(self):
        return self.MessageNotification
    
    @Contenu.setter
    def Contenu(self, value):
        self.MessageNotification = value
    
    @property
    def Categorie(self):
        return self.TypeNotification
    
    @Categorie.setter
    def Categorie(self, value):
        self.TypeNotification = value
    
    @property
    def Priorite(self):
        return self.PrioriteNotification
    
    @Priorite.setter
    def Priorite(self, value):
        self.PrioriteNotification = value
    
    @property
    def ActionURL(self):
        return self.LienNotification
    
    @ActionURL.setter
    def ActionURL(self, value):
        self.LienNotification = value
    
    @property
    def DataJSON(self):
        return self.MetaDonnees
    
    @DataJSON.setter
    def DataJSON(self, value):
        self.MetaDonnees = value
    
    @property
    def EstLueProp(self):
        return self.EstLu
    
    @EstLueProp.setter
    def EstLueProp(self, value):
        self.EstLu = value
    
    @property
    def DateExpiration(self):
        return None  # Non présent dans le nouveau schéma


# Reclamation et Incident sont définies dans app/models/incident.py
# Importer depuis ce module: from app.models.incident import Reclamation, Incident
