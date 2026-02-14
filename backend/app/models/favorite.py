"""
Modèle SQLAlchemy pour les favoris et recherches
=================================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Boolean, Text
from datetime import datetime

from app.core.database import Base


class Favori(Base):
    """Table des favoris - Correspond à la table Favoris du schéma SQL"""
    
    __tablename__ = "Favoris"
    
    IdentifiantFavori = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantUtilisateur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    IdentifiantVehicule = Column(Integer, ForeignKey("Vehicules.IdentifiantVehicule"), nullable=False)
    DateAjout = Column(DateTime, default=datetime.utcnow)
    NotesPersonnelles = Column(String(500))


# RechercheSauvegardee et CacheRecherche sont définies dans app/models/search.py
# Importer depuis ce module: from app.models.search import RechercheeSauvegardee, CacheRecherche
# Note: Le nom correct dans search.py est "RechercheeSauvegardee" (avec double 'e')
