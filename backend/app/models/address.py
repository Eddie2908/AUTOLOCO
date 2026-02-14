"""
Modèles SQLAlchemy pour les adresses utilisateurs
==================================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class AdresseUtilisateur(Base):
    """Table des adresses utilisateurs avec géolocalisation"""
    
    __tablename__ = "AdressesUtilisateurs"
    
    IdentifiantAdresse = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantUtilisateur = Column(
        Integer, 
        ForeignKey("Utilisateurs.IdentifiantUtilisateur", ondelete="CASCADE"), 
        nullable=False,
        index=True
    )
    TypeAdresse = Column(String(20), nullable=False, index=True)
    # Principale, Facturation, Livraison, Autre
    
    AdresseLigne1 = Column(String(255), nullable=False)
    AdresseLigne2 = Column(String(255))
    Ville = Column(String(100), nullable=False)
    Region = Column(String(100))
    CodePostal = Column(String(20))
    Pays = Column(String(100), nullable=False, default='Sénégal')
    
    # Géolocalisation avec GEOGRAPHY (géré par SQL Server)
    # Coordonnees = Column(GEOGRAPHY) # Type spécial SQL Server
    Latitude = Column(DECIMAL(10, 8))
    Longitude = Column(DECIMAL(11, 8))
    
    EstAdressePrincipale = Column(Boolean, default=False)
    DateAjout = Column(DateTime, default=datetime.utcnow)
    
    # Relation vers utilisateur
    utilisateur = relationship(
        "Utilisateur",
        back_populates="adresses",
        foreign_keys=[IdentifiantUtilisateur]
    )
    
    def __repr__(self):
        return f"<AdresseUtilisateur(id={self.IdentifiantAdresse}, type={self.TypeAdresse}, ville={self.Ville})>"
