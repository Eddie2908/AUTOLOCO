"""
Data Integrity Service
======================

Service responsable de vérifier l'intégrité et la cohérence des données
récupérées de la base de données SQL Server par utilisateur.

Fonctionnalités:
- Validation des données utilisateur
- Vérification de cohérence inter-tables
- Détection des données orphelines
- Validation des contraintes métier
- Rapports d'intégrité détaillés
"""

from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

# Import des modèles
from app.models.user import Utilisateur as User
from app.models.vehicle import Vehicule as Vehicle
from app.models.booking import Reservation
from app.models.review import Avis as Review
from app.models.document import DocumentUtilisateur
from app.models.payment import Transaction as Payment
from app.models.address import AdresseUtilisateur
from app.models.notification import Notification

logger = logging.getLogger(__name__)


class DataIntegrityError:
    """Représente une erreur d'intégrité des données"""
    
    def __init__(
        self,
        error_type: str,
        severity: str,  # "critical", "warning", "info"
        table: str,
        user_id: Optional[int],
        message: str,
        affected_records: List[int] = None,
        suggestion: str = None
    ):
        self.error_type = error_type
        self.severity = severity
        self.table = table
        self.user_id = user_id
        self.message = message
        self.affected_records = affected_records or []
        self.suggestion = suggestion
        self.timestamp = datetime.utcnow()
    
    def to_dict(self) -> Dict:
        """Convertir en dictionnaire"""
        return {
            "error_type": self.error_type,
            "severity": self.severity,
            "table": self.table,
            "user_id": self.user_id,
            "message": self.message,
            "affected_records": self.affected_records,
            "suggestion": self.suggestion,
            "timestamp": self.timestamp.isoformat()
        }


class DataIntegrityReport:
    """Rapport complet de vérification d'intégrité"""
    
    def __init__(self, user_id: Optional[int] = None):
        self.user_id = user_id
        self.errors: List[DataIntegrityError] = []
        self.checks_performed: List[str] = []
        self.data_summary: Dict[str, Any] = {}
        self.timestamp = datetime.utcnow()
        self.status = "pending"  # pending, valid, invalid, warnings
    
    def add_error(self, error: DataIntegrityError):
        """Ajouter une erreur au rapport"""
        self.errors.append(error)
        self._update_status()
    
    def add_check(self, check_name: str):
        """Marquer une vérification comme effectuée"""
        self.checks_performed.append(check_name)
    
    def _update_status(self):
        """Mettre à jour le statut global basé sur les erreurs"""
        if not self.errors:
            self.status = "valid"
        else:
            critical_errors = [e for e in self.errors if e.severity == "critical"]
            warnings = [e for e in self.errors if e.severity == "warning"]
            
            if critical_errors:
                self.status = "invalid"
            elif warnings:
                self.status = "warnings"
            else:
                self.status = "valid"
    
    def to_dict(self) -> Dict:
        """Convertir en dictionnaire"""
        return {
            "user_id": self.user_id,
            "status": self.status,
            "timestamp": self.timestamp.isoformat(),
            "checks_performed": self.checks_performed,
            "total_checks": len(self.checks_performed),
            "total_errors": len(self.errors),
            "critical_errors": len([e for e in self.errors if e.severity == "critical"]),
            "warnings": len([e for e in self.errors if e.severity == "warning"]),
            "errors": [e.to_dict() for e in self.errors],
            "data_summary": self.data_summary
        }


class DataIntegrityService:
    """Service de vérification d'intégrité des données"""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ========================================================================
    # VÉRIFICATIONS UTILISATEUR
    # ========================================================================
    
    def verify_user_data_integrity(self, user_id: int) -> DataIntegrityReport:
        """
        Vérifier l'intégrité complète des données d'un utilisateur
        
        Vérifie:
        - Existence et validité du profil utilisateur
        - Cohérence des données personnelles
        - Validité des documents
        - Validité des adresses
        - Cohérence des réservations
        - Validité des avis et évaluations
        - Cohérence des paiements
        """
        report = DataIntegrityReport(user_id)
        
        try:
            # Étape 1: Vérifier que l'utilisateur existe
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                report.add_error(DataIntegrityError(
                    error_type="user_not_found",
                    severity="critical",
                    table="User",
                    user_id=user_id,
                    message=f"Utilisateur {user_id} not found in database"
                ))
                return report
            
            report.add_check("user_exists")
            
            # Étape 2: Vérifier les données utilisateur de base
            self._verify_user_profile(user, report)
            
            # Étape 3: Vérifier les adresses
            self._verify_user_addresses(user_id, report)
            
            # Étape 4: Vérifier les documents
            self._verify_user_documents(user_id, report)
            
            # Étape 5: Vérifier les réservations
            self._verify_user_reservations(user_id, report)
            
            # Étape 6: Vérifier les avis
            self._verify_user_reviews(user_id, report)
            
            # Étape 7: Vérifier les paiements
            self._verify_user_payments(user_id, report)
            
            # Étape 8: Vérifier la cohérence des compteurs
            self._verify_counter_consistency(user_id, report)
            
            # Résumer les données
            report.data_summary = self._get_user_data_summary(user_id)
            
        except Exception as e:
            logger.error(f"Error during integrity check for user {user_id}: {str(e)}")
            report.add_error(DataIntegrityError(
                error_type="verification_error",
                severity="critical",
                table="System",
                user_id=user_id,
                message=f"Error during integrity verification: {str(e)}"
            ))
        
        return report
    
    def _verify_user_profile(self, user: User, report: DataIntegrityReport):
        """Vérifier la validité du profil utilisateur"""
        errors = []
        
        # Vérifier champs obligatoires
        if not user.Nom or not user.Nom.strip():
            errors.append("Name is empty")
        
        if not user.Prenom or not user.Prenom.strip():
            errors.append("FirstName is empty")
        
        if not user.Email or not user.Email.strip():
            errors.append("Email is empty")
        
        if not user.MotDePasse or not user.MotDePasse.strip():
            errors.append("Password is empty")
        
        if user.TypeUtilisateur not in ["admin", "proprietaire", "locataire"]:
            errors.append(f"Invalid user type: {user.TypeUtilisateur}")
        
        if user.StatutCompte not in ["Actif", "Inactif", "Suspendu", "Supprime"]:
            errors.append(f"Invalid account status: {user.StatutCompte}")
        
        # Vérifier validité de l'email
        if user.Email and "@" not in user.Email:
            errors.append(f"Invalid email format: {user.Email}")
        
        # Vérifier cohérence des dates
        if user.DateNaissance and user.DateNaissance > datetime.now().date():
            errors.append("Birth date is in the future")
        
        # Vérifier l'âge minimum (18 ans)
        if user.DateNaissance:
            age = (datetime.now().date() - user.DateNaissance).days // 365
            if age < 18:
                errors.append(f"User is underage: {age} years old")
        
        # Vérifier la notation (0-5)
        if user.NotesUtilisateur:
            if user.NotesUtilisateur < 0 or user.NotesUtilisateur > 5:
                errors.append(f"Rating out of range: {user.NotesUtilisateur}")
        
        # Ajouter les erreurs au rapport
        for error_msg in errors:
            report.add_error(DataIntegrityError(
                error_type="invalid_profile_data",
                severity="critical" if "obligatoires" in error_msg or "Invalid" in error_msg else "warning",
                table="User",
                user_id=user.id,
                message=error_msg,
                suggestion="Review and correct user profile data"
            ))
        
        if not errors:
            report.add_check("profile_valid")
    
    def _verify_user_addresses(self, user_id: int, report: DataIntegrityReport):
        """Vérifier les adresses de l'utilisateur"""
        addresses = self.db.query(AdresseUtilisateur).filter(
            AdresseUtilisateur.IdentifiantUtilisateur == user_id
        ).all()
        
        for address in addresses:
            errors = []
            
            # Vérifier champs obligatoires
            if not address.Rue or not address.Rue.strip():
                errors.append(f"Address {address.id} has empty street")
            
            if not address.Ville or not address.Ville.strip():
                errors.append(f"Address {address.id} has empty city")
            
            if not address.CodePostal or not address.CodePostal.strip():
                errors.append(f"Address {address.id} has empty postal code")
            
            if not address.Pays or not address.Pays.strip():
                errors.append(f"Address {address.id} has empty country")
            
            # Ajouter les erreurs
            for error_msg in errors:
                report.add_error(DataIntegrityError(
                    error_type="invalid_address",
                    severity="warning",
                    table="AdresseUtilisateur",
                    user_id=user_id,
                    message=error_msg,
                    affected_records=[address.id],
                    suggestion="Complete address information"
                ))
        
        if not errors:
            report.add_check("addresses_valid")
    
    def _verify_user_documents(self, user_id: int, report: DataIntegrityReport):
        """Vérifier les documents de l'utilisateur"""
        documents = self.db.query(DocumentUtilisateur).filter(
            DocumentUtilisateur.IdentifiantUtilisateur == user_id
        ).all()
        
        for doc in documents:
            errors = []
            
            # Vérifier champs obligatoires
            if not doc.TypeDocument or not doc.TypeDocument.strip():
                errors.append(f"Document {doc.id} has no type")
            
            if not doc.CheminFichier or not doc.CheminFichier.strip():
                errors.append(f"Document {doc.id} has no file path")
            
            # Vérifier le statut
            valid_statuses = ["En_Attente", "Approuve", "Rejete", "Expire"]
            if doc.StatutVerification not in valid_statuses:
                errors.append(f"Document {doc.id} has invalid status: {doc.StatutVerification}")
            
            # Vérifier cohérence de dates
            if doc.DateExpiration and doc.DateExpiration < datetime.now().date():
                report.add_error(DataIntegrityError(
                    error_type="expired_document",
                    severity="warning",
                    table="DocumentUtilisateur",
                    user_id=user_id,
                    message=f"Document {doc.id} has expired",
                    affected_records=[doc.id],
                    suggestion="Request user to renew document"
                ))
            
            # Ajouter les erreurs
            for error_msg in errors:
                report.add_error(DataIntegrityError(
                    error_type="invalid_document",
                    severity="warning",
                    table="DocumentUtilisateur",
                    user_id=user_id,
                    message=error_msg,
                    affected_records=[doc.id],
                    suggestion="Correct document information"
                ))
        
        if not errors:
            report.add_check("documents_valid")
    
    def _verify_user_reservations(self, user_id: int, report: DataIntegrityReport):
        """Vérifier les réservations de l'utilisateur"""
        # Réservations en tant que locataire
        reservations = self.db.query(Reservation).filter(
            Reservation.IdentifiantLocataire == user_id
        ).all()
        
        for reservation in reservations:
            errors = []
            
            # Vérifier que le véhicule existe
            vehicle = self.db.query(Vehicle).filter(
                Vehicle.id == reservation.IdentifiantVehicule
            ).first()
            
            if not vehicle:
                errors.append(f"Reservation {reservation.id} references non-existent vehicle {reservation.IdentifiantVehicule}")
            
            # Vérifier cohérence des dates
            if reservation.DateDebut >= reservation.DateFin:
                errors.append(f"Reservation {reservation.id} has invalid dates (start >= end)")
            
            # Vérifier montant valide
            if reservation.MontantTotal and reservation.MontantTotal < 0:
                errors.append(f"Reservation {reservation.id} has negative amount: {reservation.MontantTotal}")
            
            # Vérifier statut
            valid_statuses = ["En_Attente", "Confirmee", "En_Cours", "Completee", "Annulee"]
            if reservation.StatutReservation not in valid_statuses:
                errors.append(f"Reservation {reservation.id} has invalid status: {reservation.StatutReservation}")
            
            # Ajouter les erreurs
            for error_msg in errors:
                report.add_error(DataIntegrityError(
                    error_type="invalid_reservation",
                    severity="critical" if "non-existent" in error_msg else "warning",
                    table="Reservation",
                    user_id=user_id,
                    message=error_msg,
                    affected_records=[reservation.id],
                    suggestion="Review and correct reservation data"
                ))
        
        if not errors:
            report.add_check("reservations_valid")
    
    def _verify_user_reviews(self, user_id: int, report: DataIntegrityReport):
        """Vérifier les avis de l'utilisateur"""
        reviews = self.db.query(Review).filter(
            Review.IdentifiantAuteur == user_id
        ).all()
        
        for review in reviews:
            errors = []
            
            # Vérifier notation (0-5)
            if review.Note < 0 or review.Note > 5:
                errors.append(f"Review {review.id} has invalid rating: {review.Note}")
            
            # Vérifier que le véhicule existe
            if review.IdentifiantVehicule:
                vehicle = self.db.query(Vehicle).filter(
                    Vehicle.id == review.IdentifiantVehicule
                ).first()
                
                if not vehicle:
                    errors.append(f"Review {review.id} references non-existent vehicle")
            
            # Vérifier cohérence de dates
            if review.DateCreation > datetime.now():
                errors.append(f"Review {review.id} has future creation date")
            
            # Ajouter les erreurs
            for error_msg in errors:
                report.add_error(DataIntegrityError(
                    error_type="invalid_review",
                    severity="warning",
                    table="Avis",
                    user_id=user_id,
                    message=error_msg,
                    affected_records=[review.id],
                    suggestion="Review and correct review data"
                ))
        
        if not errors:
            report.add_check("reviews_valid")
    
    def _verify_user_payments(self, user_id: int, report: DataIntegrityReport):
        """Vérifier les paiements de l'utilisateur"""
        payments = self.db.query(Payment).filter(
            Payment.IdentifiantUtilisateur == user_id
        ).all()
        
        for payment in payments:
            errors = []
            
            # Vérifier montant valide
            if payment.Montant and payment.Montant < 0:
                errors.append(f"Payment {payment.id} has negative amount: {payment.Montant}")
            
            # Vérifier statut
            valid_statuses = ["En_Attente", "Accepte", "Rejete", "Remboursee"]
            if payment.StatutPaiement not in valid_statuses:
                errors.append(f"Payment {payment.id} has invalid status: {payment.StatutPaiement}")
            
            # Vérifier méthode valide
            valid_methods = ["Carte_Credit", "Portefeuille_Numerique", "Virement_Bancaire"]
            if payment.MethodePaiement not in valid_methods:
                errors.append(f"Payment {payment.id} has invalid method: {payment.MethodePaiement}")
            
            # Ajouter les erreurs
            for error_msg in errors:
                report.add_error(DataIntegrityError(
                    error_type="invalid_payment",
                    severity="critical" if "negative" in error_msg else "warning",
                    table="Paiement",
                    user_id=user_id,
                    message=error_msg,
                    affected_records=[payment.id],
                    suggestion="Review and correct payment data"
                ))
        
        if not errors:
            report.add_check("payments_valid")
    
    def _verify_counter_consistency(self, user_id: int, report: DataIntegrityReport):
        """Vérifier la cohérence des compteurs utilisateur"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return
        
        # Compter les réservations réelles
        actual_reservations = self.db.query(func.count(Reservation.id)).filter(
            Reservation.IdentifiantLocataire == user_id,
            Reservation.StatutReservation.in_(["Confirmee", "Completee"])
        ).scalar() or 0
        
        # Comparer avec le compteur stocké
        if user.NombreReservationsEffectuees != actual_reservations:
            report.add_error(DataIntegrityError(
                error_type="counter_mismatch",
                severity="warning",
                table="User",
                user_id=user_id,
                message=f"Reservation counter mismatch: stored={user.NombreReservationsEffectuees}, actual={actual_reservations}",
                suggestion="Rebuild user statistics"
            ))
        else:
            report.add_check("counter_consistency_valid")
    
    def _get_user_data_summary(self, user_id: int) -> Dict[str, Any]:
        """Récupérer un résumé des données de l'utilisateur"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        addresses_count = self.db.query(func.count(AdresseUtilisateur.id)).filter(
            AdresseUtilisateur.IdentifiantUtilisateur == user_id
        ).scalar() or 0
        
        documents_count = self.db.query(func.count(DocumentUtilisateur.id)).filter(
            DocumentUtilisateur.IdentifiantUtilisateur == user_id
        ).scalar() or 0
        
        reservations_count = self.db.query(func.count(Reservation.id)).filter(
            Reservation.IdentifiantLocataire == user_id
        ).scalar() or 0
        
        reviews_count = self.db.query(func.count(Review.id)).filter(
            Review.IdentifiantAuteur == user_id
        ).scalar() or 0
        
        return {
            "user_id": user_id,
            "name": f"{user.Prenom} {user.Nom}",
            "email": user.Email,
            "user_type": user.TypeUtilisateur,
            "account_status": user.StatutCompte,
            "addresses_count": addresses_count,
            "documents_count": documents_count,
            "reservations_count": reservations_count,
            "reviews_count": reviews_count,
            "rating": float(user.NotesUtilisateur) if user.NotesUtilisateur else 0.0,
            "member_since": user.DateInscription.isoformat() if user.DateInscription else None
        }
    
    # ========================================================================
    # VÉRIFICATIONS GLOBALES
    # ========================================================================
    
    def verify_database_integrity(self) -> Dict[str, Any]:
        """
        Effectuer une vérification d'intégrité globale de la base de données
        
        Vérifie:
        - Orphelins (réservations sans véhicule, avis sans réservation, etc.)
        - Cohérence des relations
        - Données supprimées incorrectement
        - Compteurs globaux
        """
        report = {
            "timestamp": datetime.utcnow().isoformat(),
            "status": "valid",
            "errors": [],
            "warnings": [],
            "checks": []
        }
        
        try:
            # Vérifier les réservations orphelines
            orphan_reservations = self.db.query(Reservation).filter(
                ~Reservation.IdentifiantVehicule.in_(
                    self.db.query(Vehicle.id)
                )
            ).all()
            
            if orphan_reservations:
                report["status"] = "invalid"
                report["errors"].append({
                    "type": "orphan_records",
                    "table": "Reservation",
                    "count": len(orphan_reservations),
                    "ids": [r.id for r in orphan_reservations],
                    "message": "Found reservations without valid vehicle"
                })
            
            # Vérifier les avis orphelines
            orphan_reviews = self.db.query(Review).filter(
                ~Review.IdentifiantAuteur.in_(
                    self.db.query(User.id)
                )
            ).all()
            
            if orphan_reviews:
                report["status"] = "invalid"
                report["errors"].append({
                    "type": "orphan_records",
                    "table": "Avis",
                    "count": len(orphan_reviews),
                    "ids": [r.id for r in orphan_reviews],
                    "message": "Found reviews without valid author"
                })
            
            report["checks"].append("orphan_records_checked")
            
            # Compter les enregistrements principaux
            user_count = self.db.query(func.count(User.id)).scalar() or 0
            vehicle_count = self.db.query(func.count(Vehicle.id)).scalar() or 0
            reservation_count = self.db.query(func.count(Reservation.id)).scalar() or 0
            
            report["summary"] = {
                "total_users": user_count,
                "total_vehicles": vehicle_count,
                "total_reservations": reservation_count
            }
            
        except Exception as e:
            logger.error(f"Error during database integrity check: {str(e)}")
            report["status"] = "error"
            report["errors"].append({
                "type": "system_error",
                "message": str(e)
            })
        
        return report
    
    # ========================================================================
    # UTILITAIRES
    # ========================================================================
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """Récupérer les données d'un utilisateur par email avec vérification"""
        user = self.db.query(User).filter(User.Email == email).first()
        if not user:
            return None
        
        # Vérifier l'intégrité immédiatement
        report = self.verify_user_data_integrity(user.id)
        
        return {
            "user": {
                "id": user.id,
                "name": f"{user.Prenom} {user.Nom}",
                "email": user.Email,
                "user_type": user.TypeUtilisateur,
                "account_status": user.StatutCompte
            },
            "integrity_report": report.to_dict()
        }
    
    def get_all_users_integrity_status(self) -> Dict[str, Any]:
        """Récupérer le statut d'intégrité de tous les utilisateurs"""
        users = self.db.query(User).all()
        
        results = {
            "timestamp": datetime.utcnow().isoformat(),
            "total_users": len(users),
            "valid_count": 0,
            "invalid_count": 0,
            "warnings_count": 0,
            "users": []
        }
        
        for user in users:
            report = self.verify_user_data_integrity(user.id)
            
            if report.status == "valid":
                results["valid_count"] += 1
            elif report.status == "invalid":
                results["invalid_count"] += 1
            else:
                results["warnings_count"] += 1
            
            results["users"].append({
                "user_id": user.id,
                "email": user.Email,
                "status": report.status,
                "error_count": len(report.errors)
            })
        
        return results
