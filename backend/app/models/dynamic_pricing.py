"""
Modèles SQLAlchemy pour la tarification dynamique
==================================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, DECIMAL, Boolean, Time, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class RegleTarificationDynamique(Base):
    """Table des règles de tarification dynamique"""
    
    __tablename__ = "ReglesTarificationDynamique"
    
    IdentifiantRegle = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantVehicule = Column(
        Integer,
        ForeignKey("Vehicules.IdentifiantVehicule", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Conditions d'application
    TypeCondition = Column(String(50))
    # SAISON, JOUR_SEMAINE, DEMANDE_ELEVEE, DERNIERE_MINUTE, 
    # DUREE_SEJOUR, EVENEMENT, METEO
    ValeurCondition = Column(String(200))
    
    # Modificateurs de prix
    TypeModificateur = Column(String(20))
    # POURCENTAGE, MONTANT_FIXE, MULTIPLICATEUR
    ValeurModificateur = Column(DECIMAL(10, 2), nullable=False)
    Operation = Column(String(10))
    # AJOUTER, SOUSTRAIRE, MULTIPLIER, REMPLACER
    
    # Limites de prix
    PrixMinimum = Column(DECIMAL(10, 2))
    PrixMaximum = Column(DECIMAL(10, 2))
    
    # Période d'application
    DateDebut = Column(DateTime, nullable=False)
    DateFin = Column(DateTime)
    HeureDebut = Column(Time)
    HeureFin = Column(Time)
    JoursSemaine = Column(String(50))  # JSON: [1,2,3,4,5] pour Lun-Ven
    
    Priorite = Column(Integer, default=0, index=True)
    Actif = Column(Boolean, default=True, index=True)
    Description = Column(String(500))
    
    # Relation vers véhicule
    vehicule = relationship(
        "Vehicule",
        back_populates="regles_tarification"
    )
    
    __table_args__ = (
        Index('IDX_ReglesTarification_Dates', 'DateDebut', 'DateFin'),
    )
    
    def __repr__(self):
        return f"<RegleTarificationDynamique(id={self.IdentifiantRegle}, vehicule={self.IdentifiantVehicule}, condition={self.TypeCondition})>"


class HistoriquePrixVehicule(Base):
    """Table de l'historique des prix pour analyse et machine learning"""
    
    __tablename__ = "HistoriquePrixVehicules"
    
    IdentifiantHistorique = Column(Integer, primary_key=True, autoincrement=True)  # BIGINT in SQL
    IdentifiantVehicule = Column(
        Integer,
        ForeignKey("Vehicules.IdentifiantVehicule", ondelete="CASCADE"),
        nullable=False
    )
    
    PrixJournalier = Column(DECIMAL(10, 2), nullable=False)
    PrixHebdomadaire = Column(DECIMAL(10, 2))
    PrixMensuel = Column(DECIMAL(10, 2))
    
    FacteursInfluence = Column(Text)  # JSON des facteurs affectant le prix
    TauxOccupation = Column(DECIMAL(5, 2))
    DemandePrevue = Column(DECIMAL(5, 2))
    SaisonTouristique = Column(String(50))
    EvenementsLocaux = Column(Text)  # JSON
    
    DateApplication = Column(DateTime, default=datetime.utcnow)
    
    # Relation vers véhicule
    vehicule = relationship(
        "Vehicule",
        back_populates="historique_prix"
    )
    
    __table_args__ = (
        Index('IDX_HistoriquePrix_Vehicule_Date', 'IdentifiantVehicule', 'DateApplication'),
    )
    
    def __repr__(self):
        return f"<HistoriquePrixVehicule(id={self.IdentifiantHistorique}, vehicule={self.IdentifiantVehicule}, prix={self.PrixJournalier})>"
