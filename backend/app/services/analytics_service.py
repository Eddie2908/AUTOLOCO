"""
Service d'analyse et de métriques pour AUTOLOCO.
Collecte et agrège les données pour les dashboards et rapports.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_, desc, case, text
import logging

from app.models.user import Utilisateur
from app.models.vehicle import Vehicule
from app.models.booking import Reservation
from app.models.payment import Transaction

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service de génération de métriques et analytics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_platform_overview(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Vue d'ensemble complète de la plateforme.
        """
        
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow()
        
        return {
            "users": self._get_user_metrics(start_date, end_date),
            "vehicles": self._get_vehicle_metrics(start_date, end_date),
            "bookings": self._get_booking_metrics(start_date, end_date),
            "revenue": self._get_revenue_metrics(start_date, end_date),
            "growth": self._get_growth_metrics(start_date, end_date),
            "conversion": self._get_conversion_metrics(start_date, end_date)
        }
    
    def _get_user_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Métriques utilisateurs"""
        
        # Total utilisateurs
        total_users = self.db.query(func.count(Utilisateur.IdentifiantUtilisateur)).scalar()
        
        # Par type
        users_by_type = self.db.query(
            Utilisateur.TypeUtilisateur,
            func.count(Utilisateur.IdentifiantUtilisateur)
        ).group_by(Utilisateur.TypeUtilisateur).all()
        
        # Nouveaux utilisateurs dans la période
        new_users = self.db.query(func.count(Utilisateur.IdentifiantUtilisateur)).filter(
            and_(
                Utilisateur.DateInscription >= start_date,
                Utilisateur.DateInscription <= end_date
            )
        ).scalar()
        
        # Utilisateurs actifs (connectés dans les 30 derniers jours)
        active_users = self.db.query(func.count(Utilisateur.IdentifiantUtilisateur)).filter(
            and_(
                Utilisateur.DerniereConnexion >= datetime.utcnow() - timedelta(days=30),
                Utilisateur.StatutCompte == "Actif"
            )
        ).scalar()
        
        # Utilisateurs vérifiés
        verified_users = self.db.query(func.count(Utilisateur.IdentifiantUtilisateur)).filter(
            Utilisateur.EmailVerifie == True
        ).scalar()
        
        # Taux de croissance
        previous_period_users = self.db.query(func.count(Utilisateur.IdentifiantUtilisateur)).filter(
            Utilisateur.DateInscription < start_date
        ).scalar()
        
        growth_rate = ((total_users - previous_period_users) / previous_period_users * 100) if previous_period_users > 0 else 0
        
        return {
            "total": total_users,
            "by_type": {row[0]: row[1] for row in users_by_type},
            "new_users": new_users,
            "active_users": active_users,
            "verified_users": verified_users,
            "verification_rate": (verified_users / total_users * 100) if total_users > 0 else 0,
            "activation_rate": (active_users / total_users * 100) if total_users > 0 else 0,
            "growth_rate": round(growth_rate, 2)
        }
    
    def _get_vehicle_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Métriques véhicules"""
        
        # Total véhicules
        total_vehicles = self.db.query(func.count(Vehicule.IdentifiantVehicule)).scalar()
        
        # Véhicules actifs
        active_vehicles = self.db.query(func.count(Vehicule.IdentifiantVehicule)).filter(
            Vehicule.StatutVehicule == "Actif"
        ).scalar()
        
        # Par statut (remplace catégorie qui nécessiterait un join)
        by_status = self.db.query(
            Vehicule.StatutVehicule,
            func.count(Vehicule.IdentifiantVehicule)
        ).group_by(Vehicule.StatutVehicule).all()
        
        # Par ville
        by_city = self.db.query(
            Vehicule.LocalisationVille,
            func.count(Vehicule.IdentifiantVehicule)
        ).group_by(Vehicule.LocalisationVille).order_by(
            desc(func.count(Vehicule.IdentifiantVehicule))
        ).limit(10).all()
        
        # Nouveaux véhicules
        new_vehicles = self.db.query(func.count(Vehicule.IdentifiantVehicule)).filter(
            and_(
                Vehicule.DateCreation >= start_date,
                Vehicule.DateCreation <= end_date
            )
        ).scalar()
        
        # En attente de validation
        pending_vehicles = self.db.query(func.count(Vehicule.IdentifiantVehicule)).filter(
            Vehicule.StatutVerification == "EnAttente"
        ).scalar()
        
        return {
            "total": total_vehicles,
            "active": active_vehicles,
            "pending_validation": pending_vehicles,
            "new_vehicles": new_vehicles,
            "by_status": {row[0]: row[1] for row in by_status},
            "by_city": {row[0]: row[1] for row in by_city},
            "activation_rate": (active_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0
        }
    
    def _get_booking_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Métriques réservations"""
        
        # Total réservations dans la période
        total_bookings = self.db.query(func.count(Reservation.IdentifiantReservation)).filter(
            and_(
                Reservation.DateCreationReservation >= start_date,
                Reservation.DateCreationReservation <= end_date
            )
        ).scalar()
        
        # Par statut
        by_status = self.db.query(
            Reservation.StatutReservation,
            func.count(Reservation.IdentifiantReservation)
        ).filter(
            and_(
                Reservation.DateCreationReservation >= start_date,
                Reservation.DateCreationReservation <= end_date
            )
        ).group_by(Reservation.StatutReservation).all()
        
        # Réservations confirmées
        confirmed_bookings = self.db.query(func.count(Reservation.IdentifiantReservation)).filter(
            and_(
                Reservation.DateCreationReservation >= start_date,
                Reservation.DateCreationReservation <= end_date,
                Reservation.StatutReservation == "Confirmee"
            )
        ).scalar()
        
        # Réservations annulées
        cancelled_bookings = self.db.query(func.count(Reservation.IdentifiantReservation)).filter(
            and_(
                Reservation.DateCreationReservation >= start_date,
                Reservation.DateCreationReservation <= end_date,
                Reservation.StatutReservation == "Annulee"
            )
        ).scalar()
        
        # Durée moyenne de location (SQL Server DATEDIFF syntax)
        avg_duration = self.db.query(
            func.avg(func.datediff(text("day"), Reservation.DateDebut, Reservation.DateFin))
        ).filter(
            and_(
                Reservation.DateCreationReservation >= start_date,
                Reservation.DateCreationReservation <= end_date
            )
        ).scalar() or 0
        
        # Taux de confirmation
        confirmation_rate = (confirmed_bookings / total_bookings * 100) if total_bookings > 0 else 0
        
        # Taux d'annulation
        cancellation_rate = (cancelled_bookings / total_bookings * 100) if total_bookings > 0 else 0
        
        return {
            "total": total_bookings,
            "confirmed": confirmed_bookings,
            "cancelled": cancelled_bookings,
            "by_status": {row[0]: row[1] for row in by_status},
            "avg_duration_days": round(avg_duration, 1),
            "confirmation_rate": round(confirmation_rate, 2),
            "cancellation_rate": round(cancellation_rate, 2)
        }
    
    def _get_revenue_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Métriques revenus"""
        
        # Revenu total
        total_revenue = self.db.query(
            func.sum(Transaction.Montant)
        ).filter(
            and_(
                Transaction.DateTransaction >= start_date,
                Transaction.DateTransaction <= end_date,
                Transaction.StatutTransaction == "Reussie"
            )
        ).scalar() or 0
        
        # Revenu par type
        by_type = self.db.query(
            Transaction.TypeTransaction,
            func.sum(Transaction.Montant)
        ).filter(
            and_(
                Transaction.DateTransaction >= start_date,
                Transaction.DateTransaction <= end_date,
                Transaction.StatutTransaction == "Reussie"
            )
        ).group_by(Transaction.TypeTransaction).all()
        
        # Par méthode de paiement
        by_method = self.db.query(
            Transaction.MethodePaiement,
            func.sum(Transaction.Montant)
        ).filter(
            and_(
                Transaction.DateTransaction >= start_date,
                Transaction.DateTransaction <= end_date,
                Transaction.StatutTransaction == "Reussie"
            )
        ).group_by(Transaction.MethodePaiement).all()
        
        # Commission plateforme (10%)
        platform_commission = total_revenue * 0.10
        
        # Revenu journalier moyen
        days_in_period = (end_date - start_date).days or 1
        avg_daily_revenue = total_revenue / days_in_period
        
        # Période précédente pour comparaison
        previous_start = start_date - (end_date - start_date)
        previous_revenue = self.db.query(
            func.sum(Transaction.Montant)
        ).filter(
            and_(
                Transaction.DateTransaction >= previous_start,
                Transaction.DateTransaction < start_date,
                Transaction.StatutTransaction == "Reussie"
            )
        ).scalar() or 0
        
        growth_rate = ((total_revenue - previous_revenue) / previous_revenue * 100) if previous_revenue > 0 else 0
        
        return {
            "total_revenue": float(total_revenue),
            "platform_commission": float(platform_commission),
            "avg_daily_revenue": float(avg_daily_revenue),
            "by_type": {row[0]: float(row[1]) for row in by_type},
            "by_payment_method": {row[0]: float(row[1]) for row in by_method},
            "growth_rate": round(growth_rate, 2),
            "previous_period_revenue": float(previous_revenue)
        }
    
    def _get_growth_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Métriques de croissance"""
        
        # SQL Server: truncate to week start using DATEADD(week, DATEDIFF(week, 0, col), 0)
        def week_trunc(col):
            return func.dateadd(text("week"), func.datediff(text("week"), 0, col), 0)
        
        week_label = "week_start"
        
        # Croissance utilisateurs par semaine
        user_week = week_trunc(Utilisateur.DateInscription).label(week_label)
        user_growth = self.db.query(
            user_week,
            func.count(Utilisateur.IdentifiantUtilisateur)
        ).filter(
            and_(
                Utilisateur.DateInscription >= start_date,
                Utilisateur.DateInscription <= end_date
            )
        ).group_by(user_week).order_by(user_week).all()
        
        # Croissance véhicules par semaine
        vehicle_week = week_trunc(Vehicule.DateCreation).label(week_label)
        vehicle_growth = self.db.query(
            vehicle_week,
            func.count(Vehicule.IdentifiantVehicule)
        ).filter(
            and_(
                Vehicule.DateCreation >= start_date,
                Vehicule.DateCreation <= end_date
            )
        ).group_by(vehicle_week).order_by(vehicle_week).all()
        
        # Croissance réservations par semaine
        booking_week = week_trunc(Reservation.DateCreationReservation).label(week_label)
        booking_growth = self.db.query(
            booking_week,
            func.count(Reservation.IdentifiantReservation)
        ).filter(
            and_(
                Reservation.DateCreationReservation >= start_date,
                Reservation.DateCreationReservation <= end_date
            )
        ).group_by(booking_week).order_by(booking_week).all()
        
        return {
            "user_growth_weekly": [{"week": str(row[0]), "count": row[1]} for row in user_growth],
            "vehicle_growth_weekly": [{"week": str(row[0]), "count": row[1]} for row in vehicle_growth],
            "booking_growth_weekly": [{"week": str(row[0]), "count": row[1]} for row in booking_growth]
        }
    
    def _get_conversion_metrics(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Métriques de conversion"""
        
        # Taux de conversion inscription -> première réservation
        total_new_users = self.db.query(func.count(Utilisateur.IdentifiantUtilisateur)).filter(
            and_(
                Utilisateur.DateInscription >= start_date,
                Utilisateur.DateInscription <= end_date,
                Utilisateur.TypeUtilisateur == "Locataire"
            )
        ).scalar()
        
        users_with_booking = self.db.query(
            func.count(func.distinct(Reservation.IdentifiantLocataire))
        ).join(
            Utilisateur, Utilisateur.IdentifiantUtilisateur == Reservation.IdentifiantLocataire
        ).filter(
            and_(
                Utilisateur.DateInscription >= start_date,
                Utilisateur.DateInscription <= end_date
            )
        ).scalar()
        
        conversion_rate = (users_with_booking / total_new_users * 100) if total_new_users > 0 else 0
        
        # Taux de conversion visite -> inscription (simulé)
        # En production, intégrer Google Analytics ou similaire
        
        return {
            "signup_to_booking_rate": round(conversion_rate, 2),
            "new_renters": total_new_users,
            "renters_with_booking": users_with_booking
        }
    
    def get_top_performers(self, limit: int = 10) -> Dict[str, Any]:
        """Top performers de la plateforme"""
        
        # Top propriétaires par revenus
        top_owners = self.db.query(
            Utilisateur.IdentifiantUtilisateur,
            Utilisateur.Prenom,
            Utilisateur.Nom,
            func.sum(Transaction.Montant).label('total_revenue'),
            func.count(Reservation.IdentifiantReservation).label('total_bookings')
        ).join(
            Vehicule, Vehicule.IdentifiantProprietaire == Utilisateur.IdentifiantUtilisateur
        ).join(
            Reservation, Reservation.IdentifiantVehicule == Vehicule.IdentifiantVehicule
        ).join(
            Transaction, Transaction.IdentifiantReservation == Reservation.IdentifiantReservation
        ).filter(
            Transaction.StatutTransaction == "Reussie"
        ).group_by(
            Utilisateur.IdentifiantUtilisateur,
            Utilisateur.Prenom,
            Utilisateur.Nom
        ).order_by(
            desc('total_revenue')
        ).limit(limit).all()
        
        # Top véhicules par réservations
        top_vehicles = self.db.query(
            Vehicule.IdentifiantVehicule,
            Vehicule.TitreAnnonce,
            func.count(Reservation.IdentifiantReservation).label('total_bookings'),
            func.avg(Reservation.MontantTotal).label('avg_booking_value')
        ).join(
            Reservation, Reservation.IdentifiantVehicule == Vehicule.IdentifiantVehicule
        ).group_by(
            Vehicule.IdentifiantVehicule,
            Vehicule.TitreAnnonce
        ).order_by(
            desc('total_bookings')
        ).limit(limit).all()
        
        return {
            "top_owners": [
                {
                    "id": row[0],
                    "name": f"{row[1]} {row[2]}",
                    "total_revenue": float(row[3]),
                    "total_bookings": row[4]
                }
                for row in top_owners
            ],
            "top_vehicles": [
                {
                    "id": row[0],
                    "name": row[1] or "Véhicule",
                    "total_bookings": row[2],
                    "avg_booking_value": float(row[3]) if row[3] else 0
                }
                for row in top_vehicles
            ]
        }
    
    def get_real_time_metrics(self) -> Dict[str, Any]:
        """Métriques en temps réel"""
        
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Aujourd'hui
        today_bookings = self.db.query(func.count(Reservation.IdentifiantReservation)).filter(
            Reservation.DateCreationReservation >= today_start
        ).scalar()
        
        today_revenue = self.db.query(func.sum(Transaction.Montant)).filter(
            and_(
                Transaction.DateTransaction >= today_start,
                Transaction.StatutTransaction == "Reussie"
            )
        ).scalar() or 0
        
        today_signups = self.db.query(func.count(Utilisateur.IdentifiantUtilisateur)).filter(
            Utilisateur.DateInscription >= today_start
        ).scalar()
        
        # Utilisateurs en ligne (dernière heure)
        online_users = self.db.query(func.count(Utilisateur.IdentifiantUtilisateur)).filter(
            Utilisateur.DerniereConnexion >= now - timedelta(hours=1)
        ).scalar()
        
        # Véhicules disponibles maintenant
        available_vehicles = self.db.query(func.count(Vehicule.IdentifiantVehicule)).filter(
            Vehicule.StatutVehicule == "Actif"
        ).scalar()
        
        return {
            "today_bookings": today_bookings,
            "today_revenue": float(today_revenue),
            "today_signups": today_signups,
            "online_users": online_users,
            "available_vehicles": available_vehicles,
            "timestamp": now.isoformat()
        }
