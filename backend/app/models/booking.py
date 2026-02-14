"""
Modèle SQLAlchemy pour les réservations
========================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, DECIMAL, Time
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Reservation(Base):
    """Table des réservations - Correspond à la table Reservations du schéma SQL"""
    
    __tablename__ = "Reservations"
    __table_args__ = {'implicit_returning': False}
    
    IdentifiantReservation = Column(Integer, primary_key=True, autoincrement=True)
    NumeroReservation = Column(String(50), unique=True, nullable=False, default='')  # Généré par trigger SQL
    IdentifiantVehicule = Column(Integer, ForeignKey("Vehicules.IdentifiantVehicule"), nullable=False)
    IdentifiantLocataire = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    IdentifiantProprietaire = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    
    # Dates et heures
    DateDebut = Column(DateTime, nullable=False)
    DateFin = Column(DateTime, nullable=False)
    DateCreationReservation = Column(DateTime, default=datetime.utcnow)
    HeureDebut = Column(Time)
    HeureFin = Column(Time)
    
    # Lieux
    LieuPriseEnCharge = Column(String(500))
    LieuRestitution = Column(String(500))
    LivraisonDemandee = Column(Boolean, default=False)
    AdresseLivraison = Column(String(500))
    FraisLivraison = Column(DECIMAL(10, 2), default=0)
    
    # Montants
    NombreJours = Column(Integer)
    PrixJournalier = Column(DECIMAL(10, 2), nullable=False)
    MontantLocation = Column(DECIMAL(10, 2), nullable=False)
    MontantCaution = Column(DECIMAL(10, 2), default=0)
    FraisService = Column(DECIMAL(10, 2), default=0)
    FraisAssurance = Column(DECIMAL(10, 2), default=0)
    FraisSupplementaires = Column(DECIMAL(10, 2), default=0)
    DetailsSupplementaires = Column(Text)  # JSON
    Remise = Column(DECIMAL(10, 2), default=0)
    CodePromo = Column(String(50))
    MontantTotal = Column(DECIMAL(10, 2), nullable=False)
    
    # Statuts
    StatutReservation = Column(String(30), default='EnAttente')
    # EnAttente, Confirmee, EnCours, Terminee, Annulee, RefuseeProprietaire, RefuseeLocataire
    StatutPaiement = Column(String(30), default='EnAttente')
    # EnAttente, Paye, PartiellementPaye, Rembourse, Echoue
    MethodePaiement = Column(String(50))
    
    # Kilométrage
    KilometrageDepart = Column(Integer)
    KilometrageRetour = Column(Integer)
    KilometrageParcouru = Column(Integer)
    KilometrageInclus = Column(Integer, default=200)
    FraisKilometrageSupplementaire = Column(DECIMAL(10, 2), default=0)
    MontantKilometrageSupplementaire = Column(DECIMAL(21, 2))
    
    # Carburant
    NiveauCarburantDepart = Column(String(20))  # Vide, 1/4, 1/2, 3/4, Plein
    NiveauCarburantRetour = Column(String(20))
    
    # État du véhicule
    EtatVehiculeDepart = Column(Text)  # JSON
    EtatVehiculeRetour = Column(Text)  # JSON
    PhotosDepart = Column(Text)  # JSON array
    PhotosRetour = Column(Text)  # JSON array
    
    # Commentaires
    CommentairesLocataire = Column(String(1000))
    CommentairesProprietaire = Column(String(1000))
    
    # Annulation
    MotifAnnulation = Column(String(500))
    DateAnnulation = Column(DateTime)
    AnnulePar = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"))
    FraisAnnulation = Column(DECIMAL(10, 2), default=0)
    
    # Assurance
    EstAssurance = Column(Boolean, default=False)
    TypeAssurance = Column(String(100))
    MontantAssurance = Column(DECIMAL(10, 2), default=0)
    
    # Conducteurs
    ConducteursSupplementaires = Column(Text)  # JSON
    NombreConducteurs = Column(Integer, default=1)
    
    # Notes
    NotesSpeciales = Column(String(1000))
    
    # Dates importantes
    DateConfirmation = Column(DateTime)
    DateDebutEffectif = Column(DateTime)
    DateFinEffective = Column(DateTime)
    
    # Retard
    RetardRetour = Column(Integer, default=0)
    FraisRetard = Column(DECIMAL(10, 2), default=0)
    
    # Relations
    locataire = relationship(
        "Utilisateur",
        foreign_keys=[IdentifiantLocataire],
        back_populates="reservations_locataire"
    )
    proprietaire = relationship(
        "Utilisateur",
        foreign_keys=[IdentifiantProprietaire],
        back_populates="reservations_proprietaire"
    )
    vehicule = relationship("Vehicule", back_populates="reservations")
    extensions = relationship("ExtensionReservation", back_populates="reservation")
    
    # Propriétés pour compatibilité avec l'ancien code
    @property
    def NombreJours(self):
        if self.DateDebut and self.DateFin:
            return (self.DateFin - self.DateDebut).days + 1
        return 0
    
    @property
    def SousTotal(self):
        return int(self.MontantLocation) if self.MontantLocation else 0
    
    @property
    def Assurance(self):
        return int(self.FraisAssurance) if self.FraisAssurance else 0
    
    @property
    def Total(self):
        return int(self.MontantTotal) if self.MontantTotal else 0
    
    @property
    def Caution(self):
        return int(self.MontantCaution) if self.MontantCaution else 0
    
    @property
    def ReferencePaiement(self):
        return self.NumeroReservation
    
    @property
    def Statut(self):
        # Mapper les nouveaux statuts vers l'ancien format
        status_mapping = {
            'EnAttente': 'en_attente',
            'Confirmee': 'confirmee',
            'EnCours': 'en_cours',
            'Terminee': 'terminee',
            'Annulee': 'annulee',
            'RefuseeProprietaire': 'annulee',
            'RefuseeLocataire': 'annulee'
        }
        return status_mapping.get(self.StatutReservation, 'en_attente')
    
    @Statut.setter
    def Statut(self, value):
        # Mapper l'ancien format vers les nouveaux statuts
        status_mapping = {
            'en_attente': 'EnAttente',
            'confirmee': 'Confirmee',
            'en_cours': 'EnCours',
            'terminee': 'Terminee',
            'annulee': 'Annulee'
        }
        self.StatutReservation = status_mapping.get(value, 'EnAttente')
    
    @property
    def Notes(self):
        return self.NotesSpeciales
    
    @Notes.setter
    def Notes(self, value):
        self.NotesSpeciales = value
    
    @property
    def DateCreation(self):
        return self.DateCreationReservation
    
    @DateCreation.setter
    def DateCreation(self, value):
        self.DateCreationReservation = value
    
    @property
    def DateModification(self):
        return self.DateCreationReservation
    
    @property
    def DatePaiement(self):
        return self.DateConfirmation


# ExtensionReservation est définie dans app/models/booking_extension.py
# Importer depuis ce module: from app.models.booking_extension import ExtensionReservation
