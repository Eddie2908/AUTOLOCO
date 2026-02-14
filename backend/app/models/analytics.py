from sqlalchemy import Column, Integer, String, Text, DateTime, Numeric, Float, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class AggregationUtilisateur(Base):
    """
    Modèle pour les agrégations de données utilisateur
    Table: AggregationsUtilisateurs - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "AggregationsUtilisateurs"

    IdentifiantAggregation = Column(Integer, primary_key=True, index=True, autoincrement=True)
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Métriques de réservation
    NombreReservationsTotal = Column(Integer, default=0)
    NombreReservationsConfirmees = Column(Integer, default=0)
    NombreReservationsAnnulees = Column(Integer, default=0)
    TauxAnnulation = Column(Float)
    DureeTotalLocations = Column(Integer, default=0)
    
    # Métriques financières
    MontantTotalDepense = Column(Numeric(15, 2), default=0)
    MontantMoyenReservation = Column(Numeric(26, 13))
    
    # Notes
    NoteMoyenneDonnee = Column(Numeric(3, 2))
    NoteMoyenneRecue = Column(Numeric(3, 2))
    NombreAvisDonnes = Column(Integer, default=0)
    NombreAvisRecus = Column(Integer, default=0)
    
    # Dernières dates
    DerniereReservationDate = Column(DateTime)
    DerniereConnexionDate = Column(DateTime)
    DernierPaiementDate = Column(DateTime)
    
    # Préférences fréquentes
    CategoriePreferee = Column(Integer)
    VillePreferee = Column(String(100))
    MarquePreferee = Column(Integer)
    BudgetMoyen = Column(Numeric(10, 2))
    DureeMoyenneLocation = Column(Integer)
    
    # Comportement utilisateur
    TauxReponse = Column(Numeric(5, 2))
    DelaiMoyenReponse = Column(Integer)
    TauxConfirmation = Column(Numeric(5, 2))
    
    DateCalcul = Column(DateTime, server_default=func.now())
    DateMiseAJour = Column(DateTime)

    # Relations
    utilisateur = relationship("Utilisateur", foreign_keys=[IdentifiantUtilisateur])

    __table_args__ = (
        Index('idx_aggregation_utilisateur', 'IdentifiantUtilisateur'),
        Index('idx_aggregation_calcul', 'DateCalcul'),
        Index('idx_aggregation_maj', 'DateMiseAJour'),
    )


class ConfigurationBusinessRule(Base):
    """
    Modèle pour la configuration des règles métier
    Table: ConfigurationBusinessRules - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "ConfigurationBusinessRules"

    IdentifiantRegle = Column(Integer, primary_key=True, index=True, autoincrement=True)
    CodeRegle = Column(String(100), nullable=False, unique=True)
    TypeRegle = Column(String(100), nullable=False)
    NomRegle = Column(String(200), nullable=False)
    DescriptionRegle = Column(Text)
    Conditions = Column(Text, nullable=False)
    Actions = Column(Text, nullable=False)
    Priorite = Column(Integer, default=0)
    Actif = Column(Boolean, default=True)
    DateDebut = Column(DateTime, server_default=func.now())
    DateFin = Column(DateTime)
    CreePar = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    DateCreation = Column(DateTime, server_default=func.now())
    ModifiePar = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    DateModification = Column(DateTime)
    NombreExecutions = Column(Integer, default=0)
    DateDerniereExecution = Column(DateTime)

    # Relations
    createur = relationship("Utilisateur", foreign_keys=[CreePar])
    modificateur = relationship("Utilisateur", foreign_keys=[ModifiePar])

    __table_args__ = (
        Index('idx_business_rule_code', 'CodeRegle'),
        Index('idx_business_rule_type', 'TypeRegle'),
        Index('idx_business_rule_actif', 'Actif'),
        Index('idx_business_rule_priorite', 'Priorite'),
    )


class ABTest(Base):
    """
    Modèle pour les tests A/B
    Table: A_B_Tests - Synchronisé avec le schéma Prisma
    """
    __tablename__ = "A_B_Tests"

    IdentifiantTest = Column(Integer, primary_key=True, index=True, autoincrement=True)
    CodeTest = Column(String(100), nullable=False, unique=True)
    NomTest = Column(String(100), nullable=False)
    DescriptionTest = Column(Text)
    ObjectifTest = Column(String(500))
    HypotheseTest = Column(Text)
    MetriquePrincipale = Column(String(100))
    PopulationCible = Column(Text)
    TailleEchantillon = Column(Integer)
    
    # Configuration des variantes
    PourcentageVarianteA = Column(Integer, default=50)
    PourcentageVarianteB = Column(Integer, default=50)
    VarianteA = Column(Text)
    VarianteB = Column(Text)
    
    # Dates
    DateDebut = Column(DateTime)
    DateFin = Column(DateTime)
    DureeMinimaleJours = Column(Integer, default=7)
    
    # Statut
    StatutTest = Column(String(20), default='Brouillon')
    
    # Métriques
    ParticipantsVarianteA = Column(Integer, default=0)
    ParticipantsVarianteB = Column(Integer, default=0)
    ConversionsVarianteA = Column(Integer, default=0)
    ConversionsVarianteB = Column(Integer, default=0)
    TauxConversionA = Column(Float)
    TauxConversionB = Column(Float)
    SignificanceStatistique = Column(Numeric(5, 4))
    VarianteGagnante = Column(String(1))
    Resultats = Column(Text)
    
    CreePar = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    DateCreation = Column(DateTime, server_default=func.now())

    # Relations
    createur = relationship("Utilisateur", foreign_keys=[CreePar])

    __table_args__ = (
        Index('idx_ab_test_code', 'CodeTest'),
        Index('idx_ab_test_statut', 'StatutTest'),
        Index('idx_ab_test_dates', 'DateDebut', 'DateFin'),
    )
