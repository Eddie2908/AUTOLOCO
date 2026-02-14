"""
Modèles SQLAlchemy pour les préférences utilisateurs
=====================================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class PreferenceUtilisateur(Base):
    """Table des préférences utilisateurs"""
    
    __tablename__ = "PreferencesUtilisateurs"
    
    IdentifiantPreference = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantUtilisateur = Column(
        Integer,
        ForeignKey("Utilisateurs.IdentifiantUtilisateur", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )
    
    # Notifications
    NotificationsEmail = Column(Boolean, default=True)
    NotificationsSMS = Column(Boolean, default=True)
    NotificationsPush = Column(Boolean, default=True)
    NotificationsReservations = Column(Boolean, default=True)
    NotificationsPromotions = Column(Boolean, default=False)
    NotificationsMessages = Column(Boolean, default=True)
    NotificationsAvis = Column(Boolean, default=True)
    
    # Apparence
    ModeTheme = Column(String(10), default='Clair')  # Clair, Sombre, Auto
    
    # Localisation et formats
    AffichageMonnaie = Column(String(3), default='XOF')
    FormatDate = Column(String(20), default='DD/MM/YYYY')
    FuseauHoraire = Column(String(50), default='Africa/Dakar')
    
    # Confidentialité
    VisibiliteProfile = Column(String(20), default='Public')  # Public, Prive, Amis
    AfficherNumeroTelephone = Column(Boolean, default=False)
    AfficherEmail = Column(Boolean, default=False)
    AutoriserMessages = Column(Boolean, default=True)
    
    DateMiseAJour = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation vers utilisateur
    utilisateur = relationship(
        "Utilisateur",
        back_populates="preferences",
        uselist=False
    )
    
    def __repr__(self):
        return f"<PreferenceUtilisateur(user_id={self.IdentifiantUtilisateur}, theme={self.ModeTheme})>"
