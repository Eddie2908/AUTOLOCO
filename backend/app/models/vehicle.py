"""
Modèle SQLAlchemy pour les véhicules
=====================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from sqlalchemy import Column, Integer, BigInteger, String, Boolean, DateTime, Float, Text, ForeignKey, DECIMAL, Time
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


# CategorieVehicule, MarqueVehicule et ModeleVehicule sont définies dans app/models/vehicle_category.py
# Importer depuis ce module: from app.models.vehicle_category import CategorieVehicule, MarqueVehicule, ModeleVehicule


class Vehicule(Base):
    """Table des véhicules - Correspond à la table Vehicules du schéma SQL"""
    
    __tablename__ = "Vehicules"
    
    IdentifiantVehicule = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantProprietaire = Column(Integer, ForeignKey("Utilisateurs.IdentifiantUtilisateur"), nullable=False)
    IdentifiantCategorie = Column(Integer, ForeignKey("CategoriesVehicules.IdentifiantCategorie"), nullable=False)
    IdentifiantModele = Column(Integer, ForeignKey("ModelesVehicules.IdentifiantModele"), nullable=False)
    TitreAnnonce = Column(String(200), nullable=False)
    DescriptionVehicule = Column(Text)
    Immatriculation = Column(String(50))
    Annee = Column(Integer, nullable=False)
    Couleur = Column(String(50))
    Kilometrage = Column(Integer, default=0)
    NumeroChassisVIN = Column(String(50))
    NombrePlaces = Column(Integer, nullable=False)
    TypeCarburant = Column(String(50), nullable=False)
    TypeTransmission = Column(String(50), nullable=False)
    
    # Equipements
    Climatisation = Column(Boolean, default=False)
    GPS = Column(Boolean, default=False)
    Bluetooth = Column(Boolean, default=False)
    CameraRecul = Column(Boolean, default=False)
    SiegesEnCuir = Column(Boolean, default=False)
    ToitOuvrant = Column(Boolean, default=False)
    RegulateursVitesse = Column(Boolean, default=False)
    AirbagsMultiples = Column(Boolean, default=False)
    EquipementsSupplementaires = Column(Text)  # JSON
    
    # Prix et tarification
    PrixJournalier = Column(DECIMAL(10, 2), nullable=False)
    PrixHebdomadaire = Column(DECIMAL(10, 2))
    PrixMensuel = Column(DECIMAL(10, 2))
    CautionRequise = Column(DECIMAL(10, 2), default=0)
    KilometrageInclus = Column(Integer, default=200)
    FraisKilometrageSupplementaire = Column(DECIMAL(10, 2), default=0)
    
    # Localisation
    LocalisationVille = Column(String(100), nullable=False)
    LocalisationRegion = Column(String(100))
    AdresseComplete = Column(String(500))
    Latitude = Column(DECIMAL(10, 8))
    Longitude = Column(DECIMAL(11, 8))
    
    # Disponibilité
    DisponibiliteLundi = Column(Boolean, default=True)
    DisponibiliteMardi = Column(Boolean, default=True)
    DisponibiliteMercredi = Column(Boolean, default=True)
    DisponibiliteJeudi = Column(Boolean, default=True)
    DisponibiliteVendredi = Column(Boolean, default=True)
    DisponibiliteSamedi = Column(Boolean, default=True)
    DisponibiliteDimanche = Column(Boolean, default=True)
    HeureDebutDisponibilite = Column(Time)
    HeureFinDisponibilite = Column(Time)
    
    # Livraison
    LivraisonPossible = Column(Boolean, default=False)
    FraisLivraison = Column(DECIMAL(10, 2), default=0)
    RayonLivraison = Column(Integer)
    
    # Statuts
    StatutVehicule = Column(String(20), default='Actif')  # Actif, Loue, Maintenance, Desactive, EnAttente
    StatutVerification = Column(String(20), default='EnAttente')  # EnAttente, Verifie, Rejete
    
    # Statistiques
    NotesVehicule = Column(DECIMAL(3, 2), default=0.00)
    NombreReservations = Column(Integer, default=0)
    NombreVues = Column(Integer, default=0)
    
    # Dates
    DateCreation = Column(DateTime, default=datetime.utcnow)
    DateDerniereModification = Column(DateTime, default=datetime.utcnow)
    DateDerniereReservation = Column(DateTime)
    
    # Mise en avant et promotion
    EstPromotion = Column(Boolean, default=False)
    EstVedette = Column(Boolean, default=False)
    
    # Assurance
    EstAssure = Column(Boolean, default=False)
    CompagnieAssurance = Column(String(200))
    NumeroPoliceAssurance = Column(String(100))
    DateExpirationAssurance = Column(DateTime)
    
    # Entretien
    DernierEntretien = Column(DateTime)
    ProchainEntretien = Column(DateTime)
    
    # Tarification dynamique
    TarificationDynamiqueActive = Column(Boolean, default=False)
    TauxOccupationActuel = Column(DECIMAL(5, 2), default=0.00)
    
    # Relations
    proprietaire = relationship("Utilisateur", back_populates="vehicules")
    categorie = relationship("CategorieVehicule", back_populates="vehicules")
    modele = relationship("ModeleVehicule", back_populates="vehicules")
    photos = relationship("PhotoVehicule", back_populates="vehicule", cascade="all, delete-orphan")
    reservations = relationship("Reservation", back_populates="vehicule")
    caracteristiques = relationship("CaracteristiqueTechnique", back_populates="vehicule", uselist=False)
    
    # Nouvelles relations pour compatibilité BD v3
    regles_tarification = relationship("RegleTarificationDynamique", back_populates="vehicule", cascade="all, delete-orphan")
    historique_prix = relationship("HistoriquePrixVehicule", back_populates="vehicule", cascade="all, delete-orphan")
    
    # Propriétés pour compatibilité avec l'ancien code
    @property
    def Marque(self):
        """Retourne le nom de la marque via le modèle"""
        if hasattr(self, '_marque_cache'):
            return self._marque_cache
        return None
    
    @Marque.setter
    def Marque(self, value):
        self._marque_cache = value
    
    @property
    def Modele(self):
        """Retourne le nom du modèle"""
        if hasattr(self, '_modele_cache'):
            return self._modele_cache
        return None
    
    @Modele.setter
    def Modele(self, value):
        self._modele_cache = value
    
    @property
    def TypeVehicule(self):
        """Retourne le type/catégorie du véhicule"""
        if hasattr(self, '_type_cache'):
            return self._type_cache
        return None
    
    @TypeVehicule.setter
    def TypeVehicule(self, value):
        self._type_cache = value
    
    @property
    def Carburant(self):
        return self.TypeCarburant
    
    @property
    def Transmission(self):
        return self.TypeTransmission
    
    @property
    def NombrePortes(self):
        return 4  # Valeur par défaut
    
    @property
    def NoteGlobale(self):
        return float(self.NotesVehicule) if self.NotesVehicule else 0.0
    
    @property
    def NombreAvis(self):
        return self.NombreReservations  # Approximation
    
    @property
    def Ville(self):
        return self.LocalisationVille
    
    @Ville.setter
    def Ville(self, value):
        self.LocalisationVille = value
    
    @property
    def Adresse(self):
        return self.AdresseComplete
    
    @Adresse.setter
    def Adresse(self, value):
        self.AdresseComplete = value
    
    @property
    def Description(self):
        return self.DescriptionVehicule
    
    @Description.setter
    def Description(self, value):
        self.DescriptionVehicule = value
    
    @property
    def ImagePrincipale(self):
        if self.photos:
            for photo in self.photos:
                if photo.EstPhotoPrincipale:
                    return photo.URLPhoto
            return self.photos[0].URLPhoto if self.photos else None
        return None
    
    @property
    def LimiteKilometrique(self):
        return self.KilometrageInclus
    
    @property
    def IncluAssurance(self):
        return self.EstAssure
    
    @property
    def Caution(self):
        return int(self.CautionRequise) if self.CautionRequise else 100000
    
    @property
    def Equipements(self):
        return self.EquipementsSupplementaires
    
    @property
    def EstVerifie(self):
        return self.StatutVerification == 'Verifie'
    
    @property
    def EstMiseEnAvant(self):
        return self.EstVedette
    
    @property
    def EstDisponible(self):
        return self.StatutVehicule == 'Actif'
    
    @EstDisponible.setter
    def EstDisponible(self, value):
        self.StatutVehicule = 'Actif' if value else 'Desactive'
    
    @property
    def EstActif(self):
        return self.StatutVehicule != 'Desactive'
    
    @EstActif.setter
    def EstActif(self, value):
        if not value:
            self.StatutVehicule = 'Desactive'
    
    @property
    def DateModification(self):
        return self.DateDerniereModification
    
    @DateModification.setter
    def DateModification(self, value):
        self.DateDerniereModification = value


class PhotoVehicule(Base):
    """Table des photos de véhicules - Correspond à PhotosVehicules du schéma SQL"""
    
    __tablename__ = "PhotosVehicules"
    
    IdentifiantPhoto = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantVehicule = Column(Integer, ForeignKey("Vehicules.IdentifiantVehicule"), nullable=False)
    URLPhoto = Column(String(500), nullable=False)
    URLMiniature = Column(String(500))
    LegendePhoto = Column(String(255))
    OrdreAffichage = Column(Integer, default=0)
    EstPhotoPrincipale = Column(Boolean, default=False)
    TailleFichier = Column(BigInteger)
    FormatImage = Column(String(10))
    DateAjout = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    vehicule = relationship("Vehicule", back_populates="photos")
    
    # Alias pour compatibilité
    @property
    def UrlImage(self):
        return self.URLPhoto
    
    @property
    def EstPrincipale(self):
        return self.EstPhotoPrincipale
    
    @property
    def DateCreation(self):
        return self.DateAjout


# Alias pour compatibilité avec l'ancien code
ImageVehicule = PhotoVehicule


class CaracteristiqueTechnique(Base):
    """Table des caractéristiques techniques"""
    
    __tablename__ = "CaracteristiquesTechniques"
    
    IdentifiantCaracteristique = Column(Integer, primary_key=True, autoincrement=True)
    IdentifiantVehicule = Column(Integer, ForeignKey("Vehicules.IdentifiantVehicule"), nullable=False)
    Puissance = Column(Integer)
    Couple = Column(Integer)
    VitesseMaximale = Column(Integer)
    Acceleration = Column(DECIMAL(4, 2))
    CapaciteReservoir = Column(Integer)
    PoidsVide = Column(Integer)
    ChargeUtile = Column(Integer)
    LongueurVehicule = Column(Integer)
    LargeurVehicule = Column(Integer)
    HauteurVehicule = Column(Integer)
    EmpatementVehicule = Column(Integer)
    NormeEmission = Column(String(50))
    TypeRoueMotrice = Column(String(50))
    DateAjout = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    vehicule = relationship("Vehicule", back_populates="caracteristiques")


# ZoneGeographique est maintenant définie dans app/models/zone.py
# Importer depuis ce module si nécessaire: from app.models.zone import ZoneGeographique
