"""
Modèle SQLAlchemy pour les utilisateurs
========================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Utilisateur(Base):
    """Table des utilisateurs - Correspond à la table Utilisateurs du schéma SQL"""
    
    __tablename__ = "Utilisateurs"
    
    IdentifiantUtilisateur = Column(Integer, primary_key=True, autoincrement=True)
    Nom = Column(String(100), nullable=False)
    Prenom = Column(String(100), nullable=False)
    Email = Column(String(255), unique=True, nullable=False, index=True)
    MotDePasse = Column(String(255), nullable=False)  # Hash du mot de passe
    NumeroTelephone = Column(String(20))
    DateNaissance = Column(DateTime)
    PhotoProfil = Column(String(500))
    TypeUtilisateur = Column(String(20), nullable=False)  # Locataire, Proprietaire, Admin
    StatutCompte = Column(String(20), default='Actif')  # Actif, Suspendu, Desactive, EnAttente
    EmailVerifie = Column(Boolean, default=False)
    TelephoneVerifie = Column(Boolean, default=False)
    DateInscription = Column(DateTime, default=datetime.utcnow)
    DerniereConnexion = Column(DateTime)
    AdresseIP = Column(String(45))
    DeviceInfo = Column(String(500))
    LanguePreferee = Column(String(10), default='fr')
    DevisePreferee = Column(String(3), default='XOF')
    BiographieUtilisateur = Column(String(1000))
    SiteWeb = Column(String(255))
    ReseauxSociaux = Column(Text)  # JSON
    NotesUtilisateur = Column(DECIMAL(3, 2), default=0.00)
    NombreReservationsEffectuees = Column(Integer, default=0)
    NombreVehiculesLoues = Column(Integer, default=0)
    
    # Ancienneté
    MembreDepuis = Column(Integer)  # Nombre d'années d'ancienneté
    
    # Programme de fidélité
    NiveauFidelite = Column(String(20), default='BRONZE')  # BRONZE, ARGENT, OR, PLATINE
    PointsFideliteTotal = Column(Integer, default=0)
    
    # Relations
    vehicules = relationship("Vehicule", back_populates="proprietaire", foreign_keys="Vehicule.IdentifiantProprietaire")
    reservations_locataire = relationship(
        "Reservation",
        foreign_keys="Reservation.IdentifiantLocataire",
        back_populates="locataire"
    )
    reservations_proprietaire = relationship(
        "Reservation",
        foreign_keys="Reservation.IdentifiantProprietaire",
        back_populates="proprietaire"
    )
    
    # Nouvelles relations pour compatibilité BD v3
    adresses = relationship("AdresseUtilisateur", back_populates="utilisateur", cascade="all, delete-orphan")
    documents = relationship("DocumentUtilisateur", back_populates="utilisateur", foreign_keys="DocumentUtilisateur.IdentifiantUtilisateur", cascade="all, delete-orphan")
    preferences = relationship("PreferenceUtilisateur", back_populates="utilisateur", uselist=False, cascade="all, delete-orphan")
    methodes_paiement = relationship("MethodePaiementUtilisateur", back_populates="utilisateur", cascade="all, delete-orphan")
    
    # Alias pour compatibilité avec le code existant
    @property
    def MotDePasseHash(self):
        return self.MotDePasse
    
    @MotDePasseHash.setter
    def MotDePasseHash(self, value):
        self.MotDePasse = value
    
    @property
    def Telephone(self):
        return self.NumeroTelephone
    
    @Telephone.setter
    def Telephone(self, value):
        self.NumeroTelephone = value
    
    @property
    def Avatar(self):
        return self.PhotoProfil
    
    @Avatar.setter
    def Avatar(self, value):
        self.PhotoProfil = value
    
    @property
    def Statut(self):
        return self.StatutCompte
    
    @Statut.setter
    def Statut(self, value):
        self.StatutCompte = value
    
    @property
    def EstActif(self):
        return self.StatutCompte == 'Actif'
    
    @EstActif.setter
    def EstActif(self, value):
        self.StatutCompte = 'Actif' if value else 'Desactive'
    
    @property
    def DateCreation(self):
        return self.DateInscription
    
    @DateCreation.setter
    def DateCreation(self, value):
        self.DateInscription = value
    
    @property
    def NoteGlobale(self):
        return float(self.NotesUtilisateur) if self.NotesUtilisateur else 0.0
    
    @NoteGlobale.setter
    def NoteGlobale(self, value):
        self.NotesUtilisateur = value
    
    @property
    def Badge(self):
        return self.NiveauFidelite


# AdresseUtilisateur est définie dans app/models/address.py
# Importer depuis ce module: from app.models.address import AdresseUtilisateur


# DocumentUtilisateur est définie dans app/models/document.py
# Importer depuis ce module: from app.models.document import DocumentUtilisateur


# PreferenceUtilisateur est définie dans app/models/preference.py
# Importer depuis ce module: from app.models.preference import PreferenceUtilisateur


# TentativeConnexion est définie dans app/models/login_attempt.py
# Importer depuis ce module: from app.models.login_attempt import TentativeConnexion
