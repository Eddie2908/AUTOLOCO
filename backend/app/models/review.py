"""
Modèle SQLAlchemy pour les avis et évaluations
===============================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, DECIMAL
from datetime import datetime

from app.core.database import Base


class Avis(Base):
    """Table des avis - Correspond à la table Avis du schéma SQL"""
    
    __tablename__ = "Avis"
    
    IdentifiantAvis = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantReservation = Column(Integer, ForeignKey("Reservations.IdentifiantReservation"), nullable=False, unique=True)
    IdentifiantAuteur = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    IdentifiantCible = Column(Integer, nullable=False)  # Utilisateur ou Véhicule
    TypeCible = Column(String(20), nullable=False)  # Vehicule, Locataire, Proprietaire
    
    # Notes détaillées
    NoteGlobale = Column(DECIMAL(3, 2), nullable=False)
    NoteProprete = Column(DECIMAL(3, 2))
    NoteConformite = Column(DECIMAL(3, 2))
    NoteCommunication = Column(DECIMAL(3, 2))
    NoteEtatVehicule = Column(DECIMAL(3, 2))
    NoteRapportQualitePrix = Column(DECIMAL(3, 2))
    
    # Contenu
    CommentaireAvis = Column(String(2000))
    PhotosAvis = Column(Text)  # JSON array d'URLs
    RecommandeCible = Column(Boolean, default=True)
    
    # Statut
    StatutAvis = Column(String(20), default='Publie')  # EnAttente, Publie, Modere, Supprime
    
    # Dates
    DateCreation = Column(DateTime, default=datetime.utcnow)
    DateModification = Column(DateTime)
    
    # Statistiques
    NombreSignalements = Column(Integer, default=0)
    NombreUtile = Column(Integer, default=0)
    NombreInutile = Column(Integer, default=0)
    
    # Réponse du propriétaire
    ReponseProprietaire = Column(String(1000))
    DateReponse = Column(DateTime)
    
    # Propriétés pour compatibilité avec l'ancien code
    @property
    def IdentifiantVehicule(self):
        if self.TypeCible == 'Vehicule':
            return self.IdentifiantCible
        return None
    
    @property
    def IdentifiantUtilisateurCible(self):
        if self.TypeCible in ('Locataire', 'Proprietaire'):
            return self.IdentifiantCible
        return None
    
    @property
    def Note(self):
        return float(self.NoteGlobale) if self.NoteGlobale else 0.0
    
    @Note.setter
    def Note(self, value):
        self.NoteGlobale = value
    
    @property
    def Commentaire(self):
        return self.CommentaireAvis
    
    @Commentaire.setter
    def Commentaire(self, value):
        self.CommentaireAvis = value
    
    @property
    def Reponse(self):
        return self.ReponseProprietaire
    
    @Reponse.setter
    def Reponse(self, value):
        self.ReponseProprietaire = value


# SignalementAvis est définie dans app/models/review_report.py
# Importer depuis ce module: from app.models.review_report import SignalementAvis
