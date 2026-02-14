"""
API endpoints pour les analytics et monitoring.
Optimized with Redis caching to avoid re-running 25+ queries on every request.
"""

from typing import Optional
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.cache import (
    cache_get, cache_set, make_cache_key,
    CACHE_TTL_MEDIUM, CACHE_TTL_SHORT, CACHE_TTL_LONG,
)
from app.api.dependencies import get_current_admin_user
from app.models.user import Utilisateur
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import (
    PlatformOverviewResponse,
    TopPerformersResponse,
    RealTimeMetricsResponse
)

router = APIRouter()


@router.get("/overview", response_model=PlatformOverviewResponse)
async def get_platform_overview(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_admin_user)
):
    """
    Vue d'ensemble complete de la plateforme (cached 5min).
    """
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()

    cache_key = make_cache_key(
        "analytics_overview",
        start=start_date.isoformat(),
        end=end_date.isoformat(),
    )
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    sync_session = getattr(db, "_session", db)
    service = AnalyticsService(sync_session)
    data = service.get_platform_overview(start_date, end_date)

    response = {**data, "period": {"start": start_date.isoformat(), "end": end_date.isoformat()}}
    await cache_set(cache_key, response, CACHE_TTL_MEDIUM)
    return PlatformOverviewResponse(**data, period={"start": start_date, "end": end_date})


@router.get("/real-time", response_model=RealTimeMetricsResponse)
async def get_real_time_metrics(
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_admin_user)
):
    """
    Metriques en temps reel (cached 1min).
    """
    cache_key = "autoloco:analytics_realtime:latest"
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    sync_session = getattr(db, "_session", db)
    service = AnalyticsService(sync_session)
    data = service.get_real_time_metrics()

    await cache_set(cache_key, data, CACHE_TTL_SHORT)
    return RealTimeMetricsResponse(**data)


@router.get("/top-performers", response_model=TopPerformersResponse)
async def get_top_performers(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_admin_user)
):
    """
    Top performers de la plateforme (cached 30min).
    """
    cache_key = make_cache_key("analytics_top", limit=limit)
    cached = await cache_get(cache_key)
    if cached is not None:
        return cached

    sync_session = getattr(db, "_session", db)
    service = AnalyticsService(sync_session)
    data = service.get_top_performers(limit)

    await cache_set(cache_key, data, CACHE_TTL_LONG)
    return TopPerformersResponse(**data)


@router.get("/export")
async def export_analytics(
    format: str = Query("csv", pattern="^(csv|xlsx|json)$"),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: Utilisateur = Depends(get_current_admin_user)
):
    """
    Export des données analytics.
    
    Formats supportés: CSV, XLSX, JSON
    """
    # TODO: Implémenter l'export de données
    return {
        "message": "Export en cours de développement",
        "format": format,
        "period": {"start": start_date, "end": end_date}
    }
