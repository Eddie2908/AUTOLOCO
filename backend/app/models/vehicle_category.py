from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, Boolean, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class CategorieVehicule(Base):
    """
    Modèle pour les catégories de véhicules
    Table: CategoriesVehicules
    """
    __tablename__ = "CategoriesVehicules"

    IdentifiantCategorie = Column(Integer, primary_key=True, index=True, autoincrement=True)
    NomCategorie = Column(String(100), nullable=False, unique=True)
    DescriptionCategorie = Column(String(500), nullable=True)
    IconeCategorie = Column(String(255), nullable=True)
    OrdreAffichage = Column(Integer, nullable=True, default=0)
    EstActif = Column(Boolean, nullable=True, default=True)
    DateCreation = Column(DateTime, server_default=func.now(), nullable=True)

    # Relations
    vehicules = relationship("Vehicule", back_populates="categorie")

    __table_args__ = (
        Index('idx_categorie_nom', 'NomCategorie'),
        Index('idx_categorie_ordre', 'OrdreAffichage'),
    )


class MarqueVehicule(Base):
    """
    Modèle pour les marques de véhicules
    Table: MarquesVehicules
    """
    __tablename__ = "MarquesVehicules"

    IdentifiantMarque = Column(Integer, primary_key=True, index=True, autoincrement=True)
    NomMarque = Column(String(100), nullable=False, unique=True)
    LogoMarque = Column(String(255), nullable=True)
    PaysOrigine = Column(String(100), nullable=True)
    SiteWeb = Column(String(255), nullable=True)
    EstPopulaire = Column(Boolean, nullable=True, default=False)
    DateAjout = Column(DateTime, server_default=func.now(), nullable=True)

    # Relations
    modeles = relationship("ModeleVehicule", back_populates="marque")

    __table_args__ = (
        Index('idx_marque_nom', 'NomMarque'),
    )


class ModeleVehicule(Base):
    """
    Modèle pour les modèles de véhicules
    Table: ModelesVehicules
    """
    __tablename__ = "ModelesVehicules"

    IdentifiantModele = Column(Integer, primary_key=True, index=True, autoincrement=True)
    IdentifiantMarque = Column(Integer, ForeignKey("MarquesVehicules.IdentifiantMarque"), nullable=False)
    NomModele = Column(String(100), nullable=False)
    AnneeDebut = Column(Integer, nullable=True)
    AnneeFin = Column(Integer, nullable=True)
    TypeCarburant = Column(String(50), nullable=True)
    TypeTransmission = Column(String(50), nullable=True)
    NombrePlaces = Column(Integer, nullable=True)
    NombrePortes = Column(Integer, nullable=True)
    CapaciteCoffre = Column(Integer, nullable=True)
    ConsommationMoyenne = Column(Numeric(5, 2), nullable=True)
    ImageModele = Column(String(255), nullable=True)
    DateAjout = Column(DateTime, server_default=func.now(), nullable=True)

    # Relations
    marque = relationship("MarqueVehicule", back_populates="modeles")
    vehicules = relationship("Vehicule", back_populates="modele")

    __table_args__ = (
        Index('idx_modele_marque', 'IdentifiantMarque'),
        Index('idx_modele_nom', 'NomModele'),
    )
