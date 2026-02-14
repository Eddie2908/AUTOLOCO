"""
Endpoints d'administration
===========================

Routes réservées aux administrateurs.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.schemas.admin import (
    DashboardStats,
    UserAdminResponse,
    VehicleAdminResponse,
    ModerationAction
)
from app.models.user import Utilisateur
from app.models.vehicle import Vehicule
from app.models.booking import Reservation
from app.models.payment import Paiement
from app.api.dependencies import get_current_admin_user

router = APIRouter()


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    admin_user: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les statistiques du tableau de bord admin."""
    # Compter les utilisateurs
    users_count = await db.scalar(
        select(func.count()).select_from(Utilisateur)
    )
    
    # Compter les véhicules
    vehicles_count = await db.scalar(
        select(func.count()).select_from(Vehicule).where(Vehicule.EstActif == True)
    )
    
    # Compter les réservations
    bookings_count = await db.scalar(
        select(func.count()).select_from(Reservation)
    )
    
    # Revenus totaux
    total_revenue = await db.scalar(
        select(func.sum(Paiement.Montant)).where(Paiement.Statut == "confirme")
    )
    
    # Statistiques de la semaine
    week_ago = datetime.utcnow() - timedelta(days=7)
    new_users_week = await db.scalar(
        select(func.count()).select_from(Utilisateur).where(
            Utilisateur.DateCreation >= week_ago
        )
    )
    new_bookings_week = await db.scalar(
        select(func.count()).select_from(Reservation).where(
            Reservation.DateCreation >= week_ago
        )
    )
    
    return DashboardStats(
        total_users=users_count or 0,
        total_vehicles=vehicles_count or 0,
        total_bookings=bookings_count or 0,
        total_revenue=total_revenue or 0,
        new_users_week=new_users_week or 0,
        new_bookings_week=new_bookings_week or 0,
        platform_commission=int((total_revenue or 0) * 0.10)
    )


@router.get("/users", response_model=List[UserAdminResponse])
async def admin_list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type_utilisateur: Optional[str] = None,
    statut: Optional[str] = None,
    search: Optional[str] = None,
    admin_user: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste tous les utilisateurs pour l'admin."""
    query = select(Utilisateur)
    
    if type_utilisateur:
        query = query.where(Utilisateur.TypeUtilisateur == type_utilisateur)
    if statut:
        query = query.where(Utilisateur.Statut == statut)
    if search:
        query = query.where(
            (Utilisateur.Nom.ilike(f"%{search}%")) |
            (Utilisateur.Email.ilike(f"%{search}%"))
        )
    
    offset = (page - 1) * page_size
    query = query.order_by(Utilisateur.DateCreation.desc())
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [UserAdminResponse.model_validate(u) for u in users]


@router.get("/vehicles/pending", response_model=List[VehicleAdminResponse])
async def get_pending_vehicles(
    admin_user: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Liste les véhicules en attente de modération."""
    result = await db.execute(
        select(Vehicule).where(
            Vehicule.StatutVerification == "en_attente"
        ).order_by(Vehicule.DateCreation.desc())
    )
    vehicles = result.scalars().all()
    
    return [VehicleAdminResponse.model_validate(v) for v in vehicles]


@router.post("/vehicles/{vehicle_id}/moderate")
async def moderate_vehicle(
    vehicle_id: int,
    action: ModerationAction,
    admin_user: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Modère un véhicule (approuver/rejeter)."""
    result = await db.execute(
        select(Vehicule).where(Vehicule.IdentifiantVehicule == vehicle_id)
    )
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Véhicule non trouvé"
        )
    
    if action.action == "approve":
        vehicle.StatutVerification = "verifie"
        vehicle.EstVerifie = True
    elif action.action == "reject":
        vehicle.StatutVerification = "rejete"
        vehicle.EstActif = False
    
    vehicle.DateModification = datetime.utcnow()
    await db.commit()
    
    return {"message": f"Véhicule {action.action}"}


@router.post("/users/{user_id}/suspend")
async def suspend_user(
    user_id: int,
    reason: str,
    admin_user: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Suspend un utilisateur."""
    result = await db.execute(
        select(Utilisateur).where(
            Utilisateur.IdentifiantUtilisateur == user_id
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    user.Statut = "suspendu"
    user.DateModification = datetime.utcnow()
    await db.commit()
    
    return {"message": "Utilisateur suspendu"}


@router.post("/users/{user_id}/unsuspend")
async def unsuspend_user(
    user_id: int,
    admin_user: Utilisateur = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db)
):
    """Réactive un utilisateur suspendu."""
    result = await db.execute(
        select(Utilisateur).where(
            Utilisateur.IdentifiantUtilisateur == user_id
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )
    
    user.Statut = "verifie"
    user.DateModification = datetime.utcnow()
    await db.commit()
    
    return {"message": "Utilisateur réactivé"}
