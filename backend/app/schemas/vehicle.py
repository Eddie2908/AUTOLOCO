"""
Schémas Pydantic pour les véhicules
====================================
Compatible avec le schéma BD_autoloca v3 FINAL
"""

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class VehicleBase(BaseModel):
    titre_annonce: str = Field(alias='brand', validation_alias='brand')
    identifiant_categorie: Optional[int] = Field(None, validation_alias='categorie_id')
    categorie_nom: Optional[str] = Field(None, alias='type', validation_alias='type')  # Nom de la catégorie (ex: 'Luxe')
    identifiant_modele: Optional[int] = Field(None, validation_alias='modele_id')
    modele_nom: Optional[str] = Field(None, alias='model', validation_alias='model')  # Nom du modèle (ex: 'Classe C')
    annee: int = Field(alias='year', validation_alias='year')
    nombre_places: int = Field(alias='seats', validation_alias='seats')
    type_carburant: str = Field(alias='fuel', validation_alias='fuel')
    type_transmission: str = Field(alias='transmission', validation_alias='transmission')
    prix_journalier: float = Field(alias='pricePerDay', validation_alias='pricePerDay')
    description: Optional[str] = Field(None, alias='description', validation_alias='description')
    couleur: Optional[str] = None
    kilometrage: Optional[int] = Field(0, validation_alias='mileage')
    localisation_ville: str = Field(alias='city', validation_alias='city')
    localisation_region: Optional[str] = None
    adresse_complete: Optional[str] = Field(None, alias='address', validation_alias='address')
    
    model_config = ConfigDict(populate_by_name=True)


class VehicleCreate(VehicleBase):
    # Equipements
    climatisation: bool = False
    gps: bool = False
    bluetooth: bool = False
    camera_recul: bool = False
    sieges_cuir: bool = False
    toit_ouvrant: bool = False
    regulateur_vitesse: bool = False
    
    # Prix additionnels
    prix_hebdomadaire: Optional[float] = Field(None, validation_alias='pricePerWeek')
    prix_mensuel: Optional[float] = Field(None, validation_alias='pricePerMonth')
    caution_requise: float = Field(100000, validation_alias='deposit')
    kilometrage_inclus: int = Field(200, validation_alias='kmPerDay')
    frais_km_supplementaire: float = Field(0, validation_alias='extraKmPrice')
    
    # Livraison / Options additionnelles
    livraison_possible: bool = False
    frais_livraison: float = 0
    rayon_livraison: Optional[int] = None
    
    # Champs frontend additionnels
    features: Optional[List[str]] = None
    images: Optional[List[str]] = None
    min_days: Optional[int] = Field(None, validation_alias='minDays')
    max_days: Optional[int] = Field(None, validation_alias='maxDays')
    instant_booking: Optional[bool] = Field(False, validation_alias='instantBooking')
    driver_available: Optional[bool] = Field(False, validation_alias='driverAvailable')
    driver_price: Optional[float] = Field(None, validation_alias='driverPrice')
    status: Optional[str] = None
    proprietaire_id: Optional[str] = None
    doors: Optional[int] = None
    brand: Optional[str] = Field(None, validation_alias='brand')  # Marque du véhicule
    
    model_config = ConfigDict(populate_by_name=True)
    
    @field_validator('driver_price', 'prix_hebdomadaire', 'prix_mensuel', 'caution_requise', 
                     'frais_km_supplementaire', 'frais_livraison', mode='before')
    @classmethod
    def empty_string_to_none(cls, v):
        """Convertir les chaînes vides en None pour les champs optionnels"""
        if isinstance(v, str) and v.strip() == '':
            return None
        return v


class VehicleUpdate(BaseModel):
    titre_annonce: Optional[str] = None
    description: Optional[str] = None
    prix_journalier: Optional[float] = None
    prix_hebdomadaire: Optional[float] = None
    prix_mensuel: Optional[float] = None
    localisation_ville: Optional[str] = None
    localisation_region: Optional[str] = None
    adresse_complete: Optional[str] = None
    statut_vehicule: Optional[str] = None
    
    # Equipements
    climatisation: Optional[bool] = None
    gps: Optional[bool] = None
    bluetooth: Optional[bool] = None
    camera_recul: Optional[bool] = None


class OwnerInfo(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None
    rating: Optional[float] = 0.0
    responseTime: Optional[str] = None
    memberSince: Optional[str] = None
    verified: bool = False


class VehicleResponse(BaseModel):
    id: str
    name: str
    brand: str
    model: str
    year: Optional[int]
    type: Optional[str]
    price: int
    image: Optional[str]
    fuel: Optional[str]
    transmission: Optional[str]
    seats: int
    doors: int
    rating: float
    reviews: int
    location: Optional[str]
    city: Optional[str]
    verified: bool
    featured: bool
    instant_booking: bool
    available: bool
    owner: Optional[OwnerInfo] = None
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        # Extraire marque et modèle depuis les relations ou le titre
        brand = getattr(obj, '_marque_cache', None) or "Marque"
        model = getattr(obj, '_modele_cache', None) or "Modèle"
        vehicle_type = getattr(obj, '_type_cache', None)
        
        # Extraire les infos du propriétaire
        owner_info = None
        prop = getattr(obj, 'proprietaire', None)
        if prop:
            member_since = ""
            if prop.DateInscription:
                member_since = str(prop.DateInscription.year)
            owner_info = OwnerInfo(
                name=f"{prop.Prenom or ''} {prop.Nom or ''}".strip() or "Propriétaire",
                avatar=prop.PhotoProfil,
                rating=float(prop.NotesUtilisateur) if prop.NotesUtilisateur else 0.0,
                memberSince=member_since,
                verified=prop.StatutCompte == 'Actif'
            )
        
        return cls(
            id=str(obj.IdentifiantVehicule),
            name=obj.TitreAnnonce or f"{brand} {model} {obj.Annee or ''}".strip(),
            brand=brand,
            model=model,
            year=obj.Annee,
            type=vehicle_type,
            price=int(obj.PrixJournalier) if obj.PrixJournalier else 0,
            image=obj.ImagePrincipale if hasattr(obj, 'ImagePrincipale') else None,
            fuel=obj.TypeCarburant,
            transmission=obj.TypeTransmission,
            seats=obj.NombrePlaces or 5,
            doors=4,  # Valeur par défaut
            rating=float(obj.NotesVehicule) if obj.NotesVehicule else 0.0,
            reviews=obj.NombreReservations or 0,
            location=obj.AdresseComplete,
            city=obj.LocalisationVille,
            verified=obj.StatutVerification == 'Verifie',
            featured=obj.EstVedette or False,
            instant_booking=False,
            available=obj.StatutVehicule == 'Actif',
            owner=owner_info
        )


class VehicleDetailResponse(VehicleResponse):
    images: List[str] = []
    description: Optional[str] = None
    mileage_limit: int = 200
    insurance: bool = True
    deposit: int = 100000
    features: List[str] = []
    owner: Optional[OwnerInfo] = None
    
    # Prix additionnels
    weekly_price: Optional[int] = None
    monthly_price: Optional[int] = None
    
    # Equipements détaillés
    climatisation: bool = False
    gps: bool = False
    bluetooth: bool = False
    camera_recul: bool = False
    sieges_cuir: bool = False


class VehicleListResponse(BaseModel):
    vehicles: List[VehicleResponse]
    total: int
    page: int
    page_size: int


class VehicleSearchFilters(BaseModel):
    """Filtres de recherche de véhicules"""
    ville: Optional[str] = None
    categorie: Optional[int] = None
    marque: Optional[int] = None
    prix_min: Optional[float] = None
    prix_max: Optional[float] = None
    places_min: Optional[int] = None
    carburant: Optional[str] = None
    transmission: Optional[str] = None
    livraison: Optional[bool] = None
    reservation_instantanee: Optional[bool] = None
    date_debut: Optional[datetime] = None
    date_fin: Optional[datetime] = None


class CategoryResponse(BaseModel):
    """Réponse pour une catégorie de véhicule"""
    id: int
    nom: str
    description: Optional[str]
    icone: Optional[str]
    nombre_vehicules: int = 0


class BrandResponse(BaseModel):
    """Réponse pour une marque de véhicule"""
    id: int
    nom: str
    logo: Optional[str]
    pays_origine: Optional[str]
    est_populaire: bool = False
