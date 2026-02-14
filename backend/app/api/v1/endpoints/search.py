"""
Endpoints de recherche
=======================

Routes pour la recherche globale et les suggestions.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
from typing import List, Optional

from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.schemas.vehicle import VehicleResponse, VehicleListResponse
from app.schemas.search import SearchSuggestion, SearchResult
from app.models.vehicle import Vehicule
from app.models.vehicle_category import CategorieVehicule

router = APIRouter()


@router.get("/vehicles")
async def search_vehicles(
    q: Optional[str] = Query(None, min_length=2),
    city: Optional[str] = None,
    type: Optional[str] = None,
    fuel: Optional[str] = None,
    transmission: Optional[str] = None,
    minPrice: Optional[int] = None,
    maxPrice: Optional[int] = None,
    seats: Optional[int] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Recherche de véhicules avec filtres complets."""
    query = select(Vehicule).where(Vehicule.StatutVehicule != 'Desactive')
    
    if q:
        query = query.where(
            or_(
                Vehicule.TitreAnnonce.ilike(f"%{q}%"),
                Vehicule.DescriptionVehicule.ilike(f"%{q}%"),
                Vehicule.LocalisationVille.ilike(f"%{q}%")
            )
        )
    
    if city and city != "all":
        query = query.where(Vehicule.LocalisationVille == city)
    if type and type != "all":
        query = query.join(Vehicule.categorie).where(
            CategorieVehicule.NomCategorie.ilike(type)
        )
    if fuel and fuel != "all":
        query = query.where(Vehicule.TypeCarburant.ilike(fuel))
    if transmission and transmission != "all":
        query = query.where(Vehicule.TypeTransmission.ilike(transmission))
    if minPrice:
        query = query.where(Vehicule.PrixJournalier >= minPrice)
    if maxPrice:
        query = query.where(Vehicule.PrixJournalier <= maxPrice)
    if seats:
        query = query.where(Vehicule.NombrePlaces >= seats)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Pagination + eager load photos
    offset = (page - 1) * page_size
    query = query.options(
        selectinload(Vehicule.photos),
        selectinload(Vehicule.proprietaire)
    ).order_by(Vehicule.EstVedette.desc(), Vehicule.NotesVehicule.desc())
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    vehicles = result.scalars().all()
    
    return {
        "vehicles": [VehicleResponse.model_validate(v) for v in vehicles],
        "total": total or 0,
        "page": page,
        "page_size": page_size
    }


@router.get("/suggestions", response_model=List[SearchSuggestion])
async def get_search_suggestions(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    """Retourne des suggestions de recherche."""
    suggestions = []
    
    # Suggestions de titres d'annonces
    titles_result = await db.execute(
        select(Vehicule.TitreAnnonce)
        .where(Vehicule.TitreAnnonce.ilike(f"%{q}%"))
        .distinct()
        .limit(5)
    )
    for title in titles_result.scalars().all():
        if title:
            suggestions.append(SearchSuggestion(
                text=title,
                type="brand",
                count=0
            ))
    
    # Suggestions de villes
    cities_result = await db.execute(
        select(Vehicule.LocalisationVille)
        .where(Vehicule.LocalisationVille.ilike(f"%{q}%"))
        .distinct()
        .limit(5)
    )
    for city_name in cities_result.scalars().all():
        if city_name:
            suggestions.append(SearchSuggestion(
                text=city_name,
                type="city",
                count=0
            ))
    
    return suggestions[:limit]


@router.get("/popular")
async def get_popular_searches():
    """Retourne les recherches populaires."""
    return {
        "searches": [
            {"text": "Toyota Corolla", "count": 1250},
            {"text": "SUV Douala", "count": 980},
            {"text": "Location longue durée", "count": 750},
            {"text": "Mercedes", "count": 620},
            {"text": "4x4 Yaoundé", "count": 540}
        ]
    }
