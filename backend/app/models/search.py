from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, Numeric, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class RechercheeSauvegardee(Base):
    """
    Modèle pour les recherches sauvegardées par les utilisateurs
    Table: RecherchesSauvegardees - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "RecherchesSauvegardees"

    IdentifiantRecherche = Column(Integer, primary_key=True, index=True, autoincrement=True)
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur", ondelete="CASCADE"), nullable=False)
    NomRecherche = Column(String(200), nullable=False)
    CriteresRecherche = Column(Text, nullable=False)
    NotificationsActives = Column(Boolean, default=True)
    FrequenceNotifications = Column(String(20))
    DateCreation = Column(DateTime, server_default=func.now())
    DateDerniereUtilisation = Column(DateTime)
    NombreUtilisations = Column(Integer, default=0)

    # Relations
    utilisateur = relationship("Utilisateur", foreign_keys=[IdentifiantUtilisateur])

    __table_args__ = (
        Index('idx_recherche_sauvegardee_utilisateur', 'IdentifiantUtilisateur'),
        Index('idx_recherche_sauvegardee_date', 'DateCreation'),
    )


class CacheRecherche(Base):
    """
    Modèle pour le cache des résultats de recherche
    Table: CacheRecherches - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "CacheRecherches"

    IdentifiantCache = Column(Integer, primary_key=True, index=True, autoincrement=True)
    CleCache = Column(String(500), nullable=False, unique=True)
    Resultats = Column(Text, nullable=False)
    NombreResultats = Column(Integer, nullable=False)
    DateCreation = Column(DateTime, server_default=func.now())
    DateExpiration = Column(DateTime, nullable=False)
    CompteUtilisations = Column(Integer, default=0)
    DerniereUtilisation = Column(DateTime)
    ParametresRecherche = Column(Text)

    __table_args__ = (
        Index('idx_cache_expiration', 'DateExpiration'),
        Index('idx_cache_utilisations', 'CompteUtilisations'),
        Index('idx_cache_derniere_utilisation', 'DerniereUtilisation'),
    )


class CacheStatistique(Base):
    """
    Modèle pour les statistiques de cache
    Table: CacheStatistiques - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "CacheStatistiques"

    IdentifiantStatCache = Column(Integer, primary_key=True, index=True, autoincrement=True)
    TypeCache = Column(String(50), nullable=False)
    Periode = Column(String(20))
    RequetesTotal = Column(Integer, default=0)
    RequetesCache = Column(Integer, default=0)
    RequetesMiss = Column(Integer, default=0)
    TauxReussite = Column(Float)
    TempsMoyenSansCache = Column(Numeric(10, 4))
    TempsMoyenAvecCache = Column(Numeric(10, 4))
    GainPerformance = Column(Numeric(30, 15))
    DateDebut = Column(DateTime, nullable=False)
    DateFin = Column(DateTime, nullable=False)
    DateCalcul = Column(DateTime, server_default=func.now())

    __table_args__ = (
        Index('idx_cache_stat_type', 'TypeCache'),
        Index('idx_cache_stat_date', 'DateCalcul'),
    )
