"""
Modèles SQLAlchemy pour les sessions et tokens
===============================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from app.core.database import Base


class SessionActive(Base):
    """Table des sessions actives."""
    
    __tablename__ = "SessionActive"
    
    IdentifiantSession = Column(Integer, primary_key=True, index=True)
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    AccessTokenJTI = Column(String(100), nullable=False, index=True)
    RefreshTokenJTI = Column(String(100), nullable=False, index=True)
    AdresseIP = Column(String(45))
    UserAgent = Column(String(500))
    Appareil = Column(String(100))
    Navigateur = Column(String(50))
    Ville = Column(String(100))
    Pays = Column(String(100))
    DateCreation = Column(DateTime, server_default=func.now())
    DerniereActivite = Column(DateTime, server_default=func.now(), onupdate=func.now())
    DateExpiration = Column(DateTime, nullable=False)
    EstActif = Column(Boolean, default=True)


class TokenBlacklist(Base):
    """Table des tokens révoqués (blacklist)."""
    
    __tablename__ = "TokensBlacklist"
    
    IdentifiantBlacklist = Column(Integer, primary_key=True, index=True)
    JTI = Column(String(100), nullable=False, unique=True, index=True)
    TypeToken = Column(String(20), nullable=False)
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    DateRevocation = Column(DateTime, server_default=func.now())
    DateExpiration = Column(DateTime, nullable=False)
    RaisonRevocation = Column(String(100))
    AdresseIP = Column(String(45))
    UserAgent = Column(String(500))
