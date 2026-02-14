"""
Modèle SQLAlchemy pour le journal d'audit et logs
==================================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, BigInteger, String, DateTime, Integer, ForeignKey, Text, Boolean
from sqlalchemy.sql import func
from app.core.database import Base


class JournalAudit(Base):
    """Table du journal d'audit - Correspond à la table JournalAudit du schéma SQL"""
    
    __tablename__ = "JournalAudit"
    
    IdentifiantAudit = Column(BigInteger, primary_key=True, index=True)
    TypeAction = Column(String(50), nullable=False)
    TableCible = Column(String(100), nullable=False)
    IdentifiantLigne = Column(Integer, nullable=False)
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    ActionEffectuee = Column(String(20))  # INSERT, UPDATE, DELETE, SELECT
    ValeursPrecedentes = Column(Text)  # JSON
    NouvellesValeurs = Column(Text)  # JSON
    AdresseIP = Column(String(45))
    UserAgent = Column(String(500))
    DateAction = Column(DateTime, server_default=func.now())
    DetailsSupplementaires = Column(Text)  # JSON


# LogErreur est définie dans app/models/error_log.py
# Importer depuis ce module: from app.models.error_log import LogErreur
