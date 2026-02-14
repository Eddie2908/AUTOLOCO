"""
Schémas Pydantic pour les analytics.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class UserMetrics(BaseModel):
    """Métriques utilisateurs"""
    total: int
    by_type: Dict[str, int]
    new_users: int
    active_users: int
    verified_users: int
    verification_rate: float
    activation_rate: float
    growth_rate: float


class VehicleMetrics(BaseModel):
    """Métriques véhicules"""
    total: int
    active: int
    pending_validation: int
    new_vehicles: int
    by_category: Dict[str, int]
    by_city: Dict[str, int]
    activation_rate: float


class BookingMetrics(BaseModel):
    """Métriques réservations"""
    total: int
    confirmed: int
    cancelled: int
    by_status: Dict[str, int]
    avg_duration_days: float
    confirmation_rate: float
    cancellation_rate: float


class RevenueMetrics(BaseModel):
    """Métriques revenus"""
    total_revenue: float
    platform_commission: float
    avg_daily_revenue: float
    by_type: Dict[str, float]
    by_payment_method: Dict[str, float]
    growth_rate: float
    previous_period_revenue: float


class GrowthMetrics(BaseModel):
    """Métriques de croissance"""
    user_growth_weekly: List[Dict[str, Any]]
    vehicle_growth_weekly: List[Dict[str, Any]]
    booking_growth_weekly: List[Dict[str, Any]]


class ConversionMetrics(BaseModel):
    """Métriques de conversion"""
    signup_to_booking_rate: float
    new_renters: int
    renters_with_booking: int


class PlatformOverviewResponse(BaseModel):
    """Réponse complète des analytics plateforme"""
    users: UserMetrics
    vehicles: VehicleMetrics
    bookings: BookingMetrics
    revenue: RevenueMetrics
    growth: GrowthMetrics
    conversion: ConversionMetrics
    period: Dict[str, datetime]


class TopPerformer(BaseModel):
    """Top performer"""
    id: int
    name: str
    total_revenue: Optional[float] = None
    total_bookings: int
    avg_booking_value: Optional[float] = None


class TopPerformersResponse(BaseModel):
    """Top performers de la plateforme"""
    top_owners: List[TopPerformer]
    top_vehicles: List[TopPerformer]


class RealTimeMetricsResponse(BaseModel):
    """Métriques en temps réel"""
    today_bookings: int
    today_revenue: float
    today_signups: int
    online_users: int
    available_vehicles: int
    timestamp: str
