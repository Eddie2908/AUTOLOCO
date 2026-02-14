"""
Endpoints de gestion des codes promotionnels
=============================================
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from app.core.database import get_db
from app.schemas.promo_code import (
    PromoCodeCreate,
    PromoCodeUpdate,
    PromoCodeResponse,
    PromoCodeValidationRequest,
    PromoCodeValidationResponse,
    PromoCodeUsageResponse
)
from app.models.payment import CodePromo, UtilisationCodePromo
from app.models.user import Utilisateur
from app.api.dependencies import get_current_active_user, get_current_admin_user

router = APIRouter()


@router.get("", response_model=List[PromoCodeResponse])
async def list_promo_codes(
    actif: Optional[bool] = None,
    current_admin: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste tous les codes promo (Admin uniquement)"""
    query = select(CodePromo)
    
    if actif is not None:
        query = query.where(CodePromo.Actif == actif)
    
    query = query.order_by(CodePromo.DateCreation.desc())
    
    result = await db.execute(query)
    promos = result.scalars().all()
    
    return [PromoCodeResponse.model_validate(p) for p in promos]


@router.get("/{code}", response_model=PromoCodeResponse)
async def get_promo_code(
    code: str,
    current_admin: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère un code promo par son code"""
    result = await db.execute(
        select(CodePromo).where(CodePromo.CodePromo == code.upper())
    )
    promo = result.scalar_one_or_none()
    
    if not promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Code promo non trouvé"
        )
    
    return PromoCodeResponse.model_validate(promo)


@router.post("", response_model=PromoCodeResponse, status_code=status.HTTP_201_CREATED)
async def create_promo_code(
    promo_data: PromoCodeCreate,
    current_admin: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Crée un nouveau code promo (Admin uniquement)"""
    # Vérifier que le code n'existe pas déjà
    existing = await db.execute(
        select(CodePromo).where(CodePromo.CodePromo == promo_data.code_promo.upper())
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ce code promo existe déjà"
        )
    
    # Valider les dates
    if promo_data.date_debut >= promo_data.date_fin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La date de début doit être avant la date de fin"
        )
    
    # Créer le code promo
    promo = CodePromo(
        CodePromo=promo_data.code_promo.upper(),
        TypePromo=promo_data.type_promo,
        ValeurPromo=promo_data.valeur_promo,
        MontantMinimum=promo_data.montant_minimum,
        NombreUtilisationsMax=promo_data.nombre_utilisations_max,
        NombreUtilisationsActuel=0,
        UtilisationsParUtilisateur=promo_data.utilisations_par_utilisateur,
        DateDebut=promo_data.date_debut,
        DateFin=promo_data.date_fin,
        Actif=True,
        CategoriesApplicables=promo_data.categories_applicables,
        VehiculesApplicables=promo_data.vehicules_applicables,
        UtilisateursApplicables=promo_data.utilisateurs_applicables,
        Description=promo_data.description,
        CreePar=current_admin.IdentifiantUtilisateur,
        DateCreation=datetime.utcnow()
    )
    
    await db.add(promo)
    await db.commit()
    await db.refresh(promo)
    
    return PromoCodeResponse.model_validate(promo)


@router.put("/{code}", response_model=PromoCodeResponse)
async def update_promo_code(
    code: str,
    promo_data: PromoCodeUpdate,
    current_admin: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Met à jour un code promo"""
    result = await db.execute(
        select(CodePromo).where(CodePromo.CodePromo == code.upper())
    )
    promo = result.scalar_one_or_none()
    
    if not promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Code promo non trouvé"
        )
    
    # Mettre à jour les champs
    if promo_data.valeur_promo is not None:
        promo.ValeurPromo = promo_data.valeur_promo
    if promo_data.date_debut is not None:
        promo.DateDebut = promo_data.date_debut
    if promo_data.date_fin is not None:
        promo.DateFin = promo_data.date_fin
    if promo_data.actif is not None:
        promo.Actif = promo_data.actif
    if promo_data.nombre_utilisations_max is not None:
        promo.NombreUtilisationsMax = promo_data.nombre_utilisations_max
    if promo_data.description is not None:
        promo.Description = promo_data.description
    
    await db.commit()
    await db.refresh(promo)
    
    return PromoCodeResponse.model_validate(promo)


@router.delete("/{code}")
async def delete_promo_code(
    code: str,
    current_admin: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Désactive un code promo"""
    result = await db.execute(
        select(CodePromo).where(CodePromo.CodePromo == code.upper())
    )
    promo = result.scalar_one_or_none()
    
    if not promo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Code promo non trouvé"
        )
    
    promo.Actif = False
    await db.commit()
    
    return {"message": "Code promo désactivé avec succès"}


@router.post("/validate", response_model=PromoCodeValidationResponse)
async def validate_promo_code(
    validation_data: PromoCodeValidationRequest,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Valide un code promo pour une réservation"""
    # Chercher le code promo
    result = await db.execute(
        select(CodePromo).where(CodePromo.CodePromo == validation_data.code_promo.upper())
    )
    promo = result.scalar_one_or_none()
    
    if not promo:
        return PromoCodeValidationResponse(
            valide=False,
            message="Code promo invalide"
        )
    
    # Vérifier si actif
    if not promo.Actif:
        return PromoCodeValidationResponse(
            valide=False,
            message="Ce code promo n'est plus actif"
        )
    
    # Vérifier les dates
    now = datetime.utcnow()
    if now < promo.DateDebut:
        return PromoCodeValidationResponse(
            valide=False,
            message="Ce code promo n'est pas encore actif"
        )
    if now > promo.DateFin:
        return PromoCodeValidationResponse(
            valide=False,
            message="Ce code promo a expiré"
        )
    
    # Vérifier le nombre d'utilisations total
    if promo.NombreUtilisationsMax:
        if promo.NombreUtilisationsActuel >= promo.NombreUtilisationsMax:
            return PromoCodeValidationResponse(
                valide=False,
                message="Ce code promo a atteint sa limite d'utilisations"
            )
    
    # Vérifier le nombre d'utilisations par utilisateur
    user_usage_result = await db.execute(
        select(func.count())
        .select_from(UtilisationCodePromo)
        .where(
            and_(
                UtilisationCodePromo.IdentifiantPromo == promo.IdentifiantPromo,
                UtilisationCodePromo.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur
            )
        )
    )
    user_usage_count = user_usage_result.scalar() or 0
    
    if user_usage_count >= promo.UtilisationsParUtilisateur:
        return PromoCodeValidationResponse(
            valide=False,
            message="Vous avez déjà utilisé ce code promo"
        )
    
    # Vérifier le montant minimum
    if promo.MontantMinimum:
        if validation_data.montant_reservation < promo.MontantMinimum:
            return PromoCodeValidationResponse(
                valide=False,
                message=f"Montant minimum requis: {promo.MontantMinimum} XOF"
            )
    
    # Calculer la remise
    montant_remise = Decimal(0)
    if promo.TypePromo == "Pourcentage":
        montant_remise = (validation_data.montant_reservation * promo.ValeurPromo) / Decimal(100)
    elif promo.TypePromo == "Montant":
        montant_remise = promo.ValeurPromo
    
    return PromoCodeValidationResponse(
        valide=True,
        message="Code promo valide",
        montant_remise=montant_remise,
        type_remise=promo.TypePromo,
        code_details=PromoCodeResponse.model_validate(promo)
    )


@router.get("/usage/history", response_model=List[PromoCodeUsageResponse])
async def get_usage_history(
    code: Optional[str] = None,
    current_admin: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère l'historique d'utilisation des codes promo (Admin uniquement)"""
    query = select(UtilisationCodePromo)
    
    if code:
        # Chercher l'ID du code promo
        promo_result = await db.execute(
            select(CodePromo.IdentifiantPromo).where(CodePromo.CodePromo == code.upper())
        )
        promo_id = promo_result.scalar_one_or_none()
        if promo_id:
            query = query.where(UtilisationCodePromo.IdentifiantPromo == promo_id)
    
    query = query.order_by(UtilisationCodePromo.DateUtilisation.desc()).limit(100)
    
    result = await db.execute(query)
    usages = result.scalars().all()
    
    return [PromoCodeUsageResponse.model_validate(u) for u in usages]
