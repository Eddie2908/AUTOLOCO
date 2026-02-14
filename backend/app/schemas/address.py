"""
Schémas Pydantic pour les adresses
===================================
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AddressBase(BaseModel):
    type_adresse: str  # Principale, Facturation, Livraison
    adresse_ligne1: str
    adresse_ligne2: Optional[str] = None
    ville: str
    code_postal: str
    pays: str = "Bénin"
    region: Optional[str] = None
    departement: Optional[str] = None


class AddressCreate(AddressBase):
    est_principale: bool = False


class AddressUpdate(BaseModel):
    adresse_ligne1: Optional[str] = None
    adresse_ligne2: Optional[str] = None
    ville: Optional[str] = None
    code_postal: Optional[str] = None
    est_principale: Optional[bool] = None


class AddressResponse(AddressBase):
    identifiant_adresse: int
    est_principale: bool
    latitude: Optional[float]
    longitude: Optional[float]
    date_creation: datetime
    
    class Config:
        from_attributes = True
