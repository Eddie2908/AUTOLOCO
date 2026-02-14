"""
Schémas Pydantic pour les avis
===============================
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ReviewCreate(BaseModel):
    identifiant_reservation: int
    note: float = Field(..., ge=1, le=5)
    commentaire: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    auteur_id: int
    vehicule_id: Optional[int]
    note: float
    commentaire: Optional[str]
    reponse: Optional[str]
    date_creation: datetime
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj):
        return cls(
            id=obj.IdentifiantAvis,
            auteur_id=obj.IdentifiantAuteur,
            vehicule_id=obj.IdentifiantVehicule,
            note=obj.Note,
            commentaire=obj.Commentaire,
            reponse=obj.Reponse,
            date_creation=obj.DateCreation
        )


class ReviewListResponse(BaseModel):
    reviews: List[ReviewResponse]
    total: int
    page: int
    page_size: int
