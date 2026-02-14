"""
Endpoints de gestion des véhicules
===================================

Routes CRUD pour les véhicules et leurs images.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.cache import (
    cache_get, cache_set, cache_invalidate_prefix,
    make_cache_key, CACHE_TTL_MEDIUM, CACHE_TTL_LONG,
)
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    VehicleListResponse,
    VehicleDetailResponse
)
from app.models.vehicle import Vehicule, ImageVehicule, PhotoVehicule
from app.models.user import Utilisateur
from app.models.vehicle_category import CategorieVehicule, ModeleVehicule, MarqueVehicule
from app.api.dependencies import get_current_active_user, get_current_owner_user

router = APIRouter()


def _user_type(current_user: Utilisateur) -> str:
    return (getattr(current_user, "TypeUtilisateur", None) or "").lower()


@router.get("", response_model=VehicleListResponse)
async def list_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    city: Optional[str] = None,
    type: Optional[str] = None,
    fuel: Optional[str] = None,
    transmission: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    seats: Optional[int] = None,
    available: Optional[bool] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Liste les véhicules avec filtres et pagination."""
    query = select(Vehicule).where(Vehicule.StatutVehicule != 'Desactive')
    
    # Filtres — utiliser les vraies colonnes SQL
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
    if min_price:
        query = query.where(Vehicule.PrixJournalier >= min_price)
    if max_price:
        query = query.where(Vehicule.PrixJournalier <= max_price)
    if seats:
        query = query.where(Vehicule.NombrePlaces >= seats)
    if available is True:
        query = query.where(Vehicule.StatutVehicule == 'Actif')
    if featured is True:
        query = query.where(Vehicule.EstVedette == True)
    if search:
        query = query.where(
            or_(
                Vehicule.TitreAnnonce.ilike(f"%{search}%"),
                Vehicule.DescriptionVehicule.ilike(f"%{search}%"),
                Vehicule.LocalisationVille.ilike(f"%{search}%")
            )
        )
    
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
    
    return VehicleListResponse(
        vehicles=[VehicleResponse.model_validate(v) for v in vehicles],
        total=total or 0,
        page=page,
        page_size=page_size
    )


@router.get("/featured", response_model=List[VehicleResponse])
async def get_featured_vehicles(
    limit: int = Query(6, ge=1, le=20),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les véhicules mis en avant (cached 30min)."""
    cache_key = make_cache_key("featured_vehicles", limit=limit)
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    result = await db.execute(
        select(Vehicule)
        .where(
            and_(
                Vehicule.StatutVehicule == 'Actif',
                Vehicule.EstVedette == True
            )
        )
        .options(selectinload(Vehicule.photos), selectinload(Vehicule.proprietaire))
        .order_by(Vehicule.NotesVehicule.desc())
        .limit(limit)
    )
    vehicles = result.scalars().all()
    
    response = [VehicleResponse.model_validate(v).model_dump() for v in vehicles]
    await cache_set(cache_key, response, CACHE_TTL_LONG)
    return response


@router.get("/my-vehicles", response_model=VehicleListResponse)
async def get_my_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: Utilisateur = Depends(get_current_owner_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les véhicules de l'utilisateur connecté."""
    base_query = select(Vehicule).where(
        Vehicule.IdentifiantProprietaire == current_user.IdentifiantUtilisateur
    )
    
    # Count total
    count_query = select(func.count()).select_from(base_query.subquery())
    total = await db.scalar(count_query)
    
    # Pagination + eager load photos
    offset = (page - 1) * page_size
    query = base_query.options(
        selectinload(Vehicule.photos),
        selectinload(Vehicule.proprietaire)
    ).order_by(Vehicule.DateCreation.desc())
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    vehicles = result.scalars().all()
    
    return VehicleListResponse(
        vehicles=[VehicleResponse.model_validate(v) for v in vehicles],
        total=total or 0,
        page=page,
        page_size=page_size
    )


@router.get("/{vehicle_id}", response_model=VehicleDetailResponse)
async def get_vehicle_by_id(
    vehicle_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Récupère les détails d'un véhicule avec eager loading (evite N+1)."""
    result = await db.execute(
        select(Vehicule)
        .where(Vehicule.IdentifiantVehicule == vehicle_id)
        .options(
            selectinload(Vehicule.photos),
            selectinload(Vehicule.proprietaire),
            selectinload(Vehicule.categorie),
            selectinload(Vehicule.modele),
        )
    )
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Véhicule non trouvé"
        )
    
    response = VehicleDetailResponse.model_validate(vehicle)
    # Photos are already eager-loaded, extract URLs sorted by display order
    response.images = [
        img.UrlImage
        for img in sorted(vehicle.photos, key=lambda p: p.OrdreAffichage or 0)
    ]
    
    return response


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    current_user: Utilisateur = Depends(get_current_owner_user),
    db: AsyncSession = Depends(get_db)
):
    """Crée un nouveau véhicule."""
    import logging
    logger = logging.getLogger(__name__)
    
    try:
        data = vehicle_data.model_dump(exclude_unset=True)
        logger.info(f"Creating vehicle with data keys: {list(data.keys())}")
        
        # Mapper le nom de marque vers l'ID
        marque_nom = data.get('brand') or data.get('titre_annonce')
        marque_id = None
        if marque_nom:
            result = await db.execute(
                select(MarqueVehicule).where(MarqueVehicule.NomMarque == marque_nom)
            )
            marque = result.scalar_one_or_none()
            if marque:
                marque_id = marque.IdentifiantMarque
            else:
                marque = MarqueVehicule(NomMarque=marque_nom)
                await db.add(marque)
                await db.flush()
                marque_id = marque.IdentifiantMarque
        
        # Mapper le nom de catégorie vers l'ID
        categorie_id = data.get('identifiant_categorie')
        categorie_nom = data.get('categorie_nom')
        if not categorie_id and categorie_nom:
            result = await db.execute(
                select(CategorieVehicule).where(
                    CategorieVehicule.NomCategorie == categorie_nom
                )
            )
            categorie = result.scalar_one_or_none()
            if categorie:
                categorie_id = categorie.IdentifiantCategorie
            else:
                categorie = CategorieVehicule(NomCategorie=categorie_nom)
                await db.add(categorie)
                await db.flush()
                categorie_id = categorie.IdentifiantCategorie
        
        # Fallback: prendre la première catégorie existante si aucune n'est fournie
        if not categorie_id:
            result = await db.execute(
                select(CategorieVehicule.IdentifiantCategorie).limit(1)
            )
            first_cat = result.scalar_one_or_none()
            if first_cat:
                categorie_id = first_cat
            else:
                categorie = CategorieVehicule(NomCategorie="Autre")
                await db.add(categorie)
                await db.flush()
                categorie_id = categorie.IdentifiantCategorie
        
        # Mapper le modèle vers l'ID
        modele_id = data.get('identifiant_modele')
        modele_nom = data.get('modele_nom')
        if not modele_id and modele_nom:
            result = await db.execute(
                select(ModeleVehicule).where(
                    ModeleVehicule.NomModele == modele_nom
                )
            )
            modele = result.scalar_one_or_none()
            if modele:
                modele_id = modele.IdentifiantModele
            else:
                modele = ModeleVehicule(
                    NomModele=modele_nom,
                    IdentifiantMarque=marque_id or 1
                )
                await db.add(modele)
                await db.flush()
                modele_id = modele.IdentifiantModele
        
        # Fallback: prendre le premier modèle existant
        if not modele_id:
            result = await db.execute(
                select(ModeleVehicule.IdentifiantModele).limit(1)
            )
            first_mod = result.scalar_one_or_none()
            modele_id = first_mod or 1
        
        # Mappages des noms de champs Pydantic vers les colonnes SQLAlchemy
        field_mapping = {
            'titre_annonce': 'TitreAnnonce',
            'annee': 'Annee',
            'nombre_places': 'NombrePlaces',
            'type_carburant': 'TypeCarburant',
            'type_transmission': 'TypeTransmission',
            'prix_journalier': 'PrixJournalier',
            'description': 'DescriptionVehicule',
            'couleur': 'Couleur',
            'kilometrage': 'Kilometrage',
            'localisation_ville': 'LocalisationVille',
            'localisation_region': 'LocalisationRegion',
            'adresse_complete': 'AdresseComplete',
            'climatisation': 'Climatisation',
            'gps': 'GPS',
            'bluetooth': 'Bluetooth',
            'camera_recul': 'CameraRecul',
            'sieges_cuir': 'SiegesEnCuir',
            'toit_ouvrant': 'ToitOuvrant',
            'regulateur_vitesse': 'RegulateursVitesse',
            'prix_hebdomadaire': 'PrixHebdomadaire',
            'prix_mensuel': 'PrixMensuel',
            'caution_requise': 'CautionRequise',
            'kilometrage_inclus': 'KilometrageInclus',
            'frais_km_supplementaire': 'FraisKilometrageSupplementaire',
            'livraison_possible': 'LivraisonPossible',
            'frais_livraison': 'FraisLivraison',
            'rayon_livraison': 'RayonLivraison',
        }
        
        # Créer le dictionnaire avec les bons noms de colonnes
        vehicle_dict = {
            field_mapping.get(k, k): v 
            for k, v in data.items() 
            if k in field_mapping and v is not None
        }
        
        # Exclure les champs frontend non mappés
        excluded_fields = {'features', 'images', 'min_days', 'max_days', 'instant_booking', 
                          'driver_available', 'driver_price', 'status', 'proprietaire_id', 'doors',
                          'categorie_nom', 'modele_nom', 'brand', 'model'}
        vehicle_dict = {k: v for k, v in vehicle_dict.items() if k not in excluded_fields}
        
        # Ajouter les IDs résolus
        vehicle_dict['IdentifiantCategorie'] = categorie_id
        vehicle_dict['IdentifiantModele'] = modele_id
        
        # S'assurer que TitreAnnonce a une valeur
        if not vehicle_dict.get('TitreAnnonce'):
            vehicle_dict['TitreAnnonce'] = f"{marque_nom or 'Véhicule'} {modele_nom or ''}".strip()
        
        logger.info(f"Vehicle dict keys: {list(vehicle_dict.keys())}")
        
        vehicle = Vehicule(
            IdentifiantProprietaire=current_user.IdentifiantUtilisateur,
            **vehicle_dict
        )
        vehicle.DateCreation = datetime.utcnow()
        
        await db.add(vehicle)
        await db.commit()
        await db.refresh(vehicle)
        
        # Sauvegarder les photos uploadées dans PhotosVehicules
        images = data.get('images') or []
        for idx, image_url in enumerate(images):
            if image_url and isinstance(image_url, str):
                photo = PhotoVehicule(
                    IdentifiantVehicule=vehicle.IdentifiantVehicule,
                    URLPhoto=image_url,
                    OrdreAffichage=idx,
                    EstPhotoPrincipale=(idx == 0),
                    DateAjout=datetime.utcnow()
                )
                await db.add(photo)
        
        if images:
            await db.commit()
            await db.refresh(vehicle)
        
        # Invalidate vehicle caches on mutation
        await cache_invalidate_prefix("featured_vehicles")
        
        return VehicleResponse.model_validate(vehicle)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Vehicle creation failed: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erreur lors de la création du véhicule: {str(e)}"
        )


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: int,
    vehicle_data: VehicleUpdate,
    current_user: Utilisateur = Depends(get_current_owner_user),
    db: AsyncSession = Depends(get_db)
):
    """Met à jour un véhicule."""
    result = await db.execute(
        select(Vehicule).where(Vehicule.IdentifiantVehicule == vehicle_id)
    )
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Véhicule non trouvé"
        )
    
    # Vérifier propriété
    if vehicle.IdentifiantProprietaire != current_user.IdentifiantUtilisateur:
        if _user_type(current_user) != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas le propriétaire de ce véhicule"
            )
    
    update_data = vehicle_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)
    
    vehicle.DateModification = datetime.utcnow()
    await db.commit()
    await db.refresh(vehicle)
    
    await cache_invalidate_prefix("featured_vehicles")
    
    return VehicleResponse.model_validate(vehicle)


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: int,
    current_user: Utilisateur = Depends(get_current_owner_user),
    db: AsyncSession = Depends(get_db)
):
    """Supprime (désactive) un véhicule."""
    result = await db.execute(
        select(Vehicule).where(Vehicule.IdentifiantVehicule == vehicle_id)
    )
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Véhicule non trouvé"
        )
    
    if vehicle.IdentifiantProprietaire != current_user.IdentifiantUtilisateur:
        if _user_type(current_user) != "admin":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Vous n'êtes pas le propriétaire de ce véhicule"
            )
    
    # Soft delete
    vehicle.EstActif = False
    vehicle.DateModification = datetime.utcnow()
    await db.commit()
    
    await cache_invalidate_prefix("featured_vehicles")


@router.get("/owner/{owner_id}", response_model=List[VehicleResponse])
async def get_vehicles_by_owner(
    owner_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Liste les véhicules d'un propriétaire avec eager loading."""
    result = await db.execute(
        select(Vehicule).where(
            and_(
                Vehicule.IdentifiantProprietaire == owner_id,
                Vehicule.StatutVehicule != 'Desactive'
            )
        ).options(
            selectinload(Vehicule.photos),
            selectinload(Vehicule.proprietaire),
        ).order_by(Vehicule.DateCreation.desc())
    )
    vehicles = result.scalars().all()
    
    return [VehicleResponse.model_validate(v) for v in vehicles]
