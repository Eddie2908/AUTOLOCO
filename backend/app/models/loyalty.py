"""
Modèle SQLAlchemy pour le programme de fidélité et parrainage
==============================================================
Compatible avec le schéma Prisma (BD_autoloca v3 FINAL)
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, DECIMAL
from datetime import datetime

from app.core.database import Base


class ProgrammeFidelite(Base):
    """Table du programme de fidélité - Synchronisé avec le schéma Prisma"""
    
    __tablename__ = "ProgrammeFidelite"
    
    IdentifiantProgramme = Column(Integer, primary_key=True, autoincrement=True)
    NomProgramme = Column(String(100), nullable=False)
    Niveau = Column(String(50))
    SeuilPoints = Column(Integer, nullable=False)
    
    # Avantages
    PourcentageRemise = Column(DECIMAL(5, 2), default=0)
    PrioriteSuppor = Column(Boolean, default=False)
    AnnulationGratuite = Column(Boolean, default=False)
    AccesExclusif = Column(Boolean, default=False)
    SurclassementGratuit = Column(Boolean, default=False)
    
    Avantages = Column(Text)
    CouleurBadge = Column(String(20))
    IconeBadge = Column(String(255))
    Actif = Column(Boolean, default=True)
    DateCreation = Column(DateTime, default=datetime.utcnow)


class PointFidelite(Base):
    """Table des points de fidélité - Synchronisé avec le schéma Prisma"""
    
    __tablename__ = "PointsFidelite"
    
    IdentifiantPoint = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    
    TypeAcquisition = Column(String(50))
    PointsAcquis = Column(Integer, nullable=False)
    PointsUtilises = Column(Integer, default=0)
    SoldePoints = Column(Integer)
    
    DateAcquisition = Column(DateTime, default=datetime.utcnow)
    DateExpiration = Column(DateTime)
    
    IdentifiantSource = Column(Integer)
    TypeSource = Column(String(50))
    Description = Column(String(500))
    EstExpire = Column(Integer, nullable=False)


class Parrainage(Base):
    """Table du programme de parrainage - Synchronisé avec le schéma Prisma"""
    
    __tablename__ = "ProgrammeParrainage"
    
    IdentifiantParrainage = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantParrain = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    IdentifiantFilleul = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    
    CodeParrainage = Column(String(50), unique=True, nullable=False)
    EmailFilleul = Column(String(255))
    DateInvitation = Column(DateTime, default=datetime.utcnow)
    DateInscription = Column(DateTime)
    
    # Récompenses
    PointsParrain = Column(Integer, default=0)
    PointsFilleul = Column(Integer, default=0)
    RemiseParrain = Column(DECIMAL(10, 2), default=0)
    RemiseFilleul = Column(DECIMAL(10, 2), default=0)
    CommissionParrain = Column(DECIMAL(5, 2))
    
    StatutParrainage = Column(String(20), default='EnAttente')
    PremierAchatEffectue = Column(Boolean, default=False)
    DatePremierAchat = Column(DateTime)
    MontantPremierAchat = Column(DECIMAL(10, 2))
    
    RecompensesAttribuees = Column(Boolean, default=False)
    DateAttributionRecompenses = Column(DateTime)


# AggregationUtilisateur est définie dans app/models/analytics.py
# Importer depuis ce module: from app.models.analytics import AggregationUtilisateur
