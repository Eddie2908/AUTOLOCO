"""
Endpoints de gestion des notifications
=======================================

Routes pour les notifications utilisateur.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse
)
from app.models.notification import Notification
from app.models.user import Utilisateur
from app.api.dependencies import get_current_active_user

router = APIRouter()


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    category: Optional[str] = None,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupère les notifications de l'utilisateur."""
    query = select(Notification).where(
        Notification.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur
    )
    
    if unread_only:
        query = query.where(Notification.EstLu == False)
    
    if category:
        query = query.where(Notification.TypeNotification == category)
    
    # Pas de filtre DateExpiration car non présent dans le modèle
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total = await db.scalar(count_query)
    
    # Count unread
    unread_query = select(func.count()).where(
        and_(
            Notification.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur,
            Notification.EstLu == False
        )
    )
    unread_count = await db.scalar(unread_query)
    
    # Pagination
    offset = (page - 1) * page_size
    query = query.order_by(Notification.DateCreation.desc())
    query = query.offset(offset).limit(page_size)
    
    result = await db.execute(query)
    notifications = result.scalars().all()
    
    return NotificationListResponse(
        notifications=[NotificationResponse.model_validate(n) for n in notifications],
        total=total or 0,
        unread_count=unread_count or 0,
        page=page,
        page_size=page_size
    )


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Marque une notification comme lue."""
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.IdentifiantNotification == notification_id,
                Notification.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur
            )
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification non trouvée"
        )
    
    if not notification.EstLu:
        notification.EstLu = True
        notification.DateLecture = datetime.utcnow()
        await db.commit()
    
    return {"message": "Notification marquée comme lue"}


@router.post("/read-all")
async def mark_all_read(
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Marque toutes les notifications comme lues."""
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur,
                Notification.EstLu == False
            )
        )
    )
    notifications = result.scalars().all()
    
    for notification in notifications:
        notification.EstLu = True
        notification.DateLecture = datetime.utcnow()
    
    await db.commit()
    
    return {"message": "Toutes les notifications ont été marquées comme lues"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Supprime une notification."""
    result = await db.execute(
        select(Notification).where(
            and_(
                Notification.IdentifiantNotification == notification_id,
                Notification.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur
            )
        )
    )
    notification = result.scalar_one_or_none()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification non trouvée"
        )
    
    await db.delete(notification)
    await db.commit()


@router.get("/unread/count")
async def get_unread_count(
    current_user: Utilisateur = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Compte les notifications non lues."""
    result = await db.scalar(
        select(func.count()).where(
            and_(
                Notification.IdentifiantUtilisateur == current_user.IdentifiantUtilisateur,
                Notification.EstLu == False
            )
        )
    )
    
    return {"unread_count": result or 0}
