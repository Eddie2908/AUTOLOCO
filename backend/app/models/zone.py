"""
Modèles SQLAlchemy pour les zones géographiques
================================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, DECIMAL, Index
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class ZoneGeographique(Base):
    """Table des zones géographiques optimisées"""
    
    __tablename__ = "ZonesGeographiques"
    
    IdentifiantZone = Column(Integer, primary_key=True, autoincrement=True)
    NomZone = Column(String(100), nullable=False)
    
    TypeZone = Column(String(50), index=True)
    # VILLE, QUARTIER, REGION, POINT_INTERET, AEROPORT, GARE
    
    ParentZone = Column(
        Integer,
        ForeignKey("ZonesGeographiques.IdentifiantZone")
    )
    
    # Géométrie optimisée
    GeoJSON = Column(Text)  # JSON representation
    # Coordonnees = Column(Geography)  # PostGIS type if needed
    CentroidLatitude = Column(DECIMAL(10, 8))
    CentroidLongitude = Column(DECIMAL(11, 8))
    RayonMetres = Column(Integer)
    
    # Métadonnées
    NombreVehicules = Column(Integer, default=0)
    PrixMoyen = Column(DECIMAL(10, 2))
    Popularite = Column(Integer, default=0, index=True)
    
    DateCreation = Column(DateTime, default=datetime.utcnow)
    DateMiseAJour = Column(DateTime, onupdate=datetime.utcnow)
    
    # Relation parent-enfant
    parent = relationship(
        "ZoneGeographique",
        remote_side=[IdentifiantZone],
        back_populates="sous_zones"
    )
    
    sous_zones = relationship(
        "ZoneGeographique",
        back_populates="parent",
        foreign_keys=[ParentZone]
    )
    
    # Index composites
    __table_args__ = (
        Index('IDX_Zones_Geospatial', 'CentroidLatitude', 'CentroidLongitude'),
    )
    
    def __repr__(self):
        return f"<ZoneGeographique(id={self.IdentifiantZone}, nom={self.NomZone}, type={self.TypeZone})>"


class DistancePrecalculee(Base):
    """Table des distances pré-calculées pour performance"""
    
    __tablename__ = "DistancesPrecalculees"
    
    IdentifiantOrigine = Column(Integer, primary_key=True)
    IdentifiantDestination = Column(Integer, primary_key=True)
    
    DistanceMetres = Column(Integer, nullable=False)
    DureeMinutes = Column(Integer, nullable=False)
    
    DateCalcul = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        Index('IDX_Distances_Origine', 'IdentifiantOrigine'),
        Index('IDX_Distances_Destination', 'IdentifiantDestination'),
    )
    
    def __repr__(self):
        return f"<DistancePrecalculee(origine={self.IdentifiantOrigine}, destination={self.IdentifiantDestination}, distance={self.DistanceMetres}m)>"
