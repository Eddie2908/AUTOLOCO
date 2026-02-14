"""
User Data Integrity Tests
==========================

Suite complète de tests pour vérifier l'intégrité des données utilisateur
et la récupération correcte des informations de la base de données SQL Server.
"""

import pytest
from datetime import datetime, timedelta, date
from decimal import Decimal
from sqlalchemy.orm import Session
from typing import Tuple

# Import des modèles (noms réels des classes dans la BD)
from app.models.user import Utilisateur as User
from app.models.vehicle import Vehicule as Vehicle
from app.models.booking import Reservation
from app.models.review import Avis as Review
from app.models.document import DocumentUtilisateur
from app.models.payment import Transaction as Payment
from app.models.address import AdresseUtilisateur
from app.services.data_integrity_service import (
    DataIntegrityService,
    DataIntegrityError,
    DataIntegrityReport
)


class TestDataIntegrityService:
    """Tests du service de vérification d'intégrité"""
    
    @pytest.fixture
    def service(self, db: Session):
        """Créer une instance du service"""
        return DataIntegrityService(db)
    
    @pytest.fixture
    def test_user(self, db: Session) -> User:
        """Créer un utilisateur de test"""
        user = User(
            Nom="Dupont",
            Prenom="Jean",
            Email=f"jean.dupont@test.com",
            MotDePasse="hashedpassword123",
            NumeroTelephone="+33612345678",
            DateNaissance=datetime(1990, 1, 15),
            TypeUtilisateur="locataire",
            StatutCompte="Actif",
            EmailVerifie=True,
            TelephoneVerifie=True,
            LanguePreferee="fr",
            NotesUtilisateur=Decimal("4.5"),
            NombreReservationsEffectuees=5
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @pytest.fixture
    def test_vehicle(self, db: Session) -> Vehicle:
        """Créer un véhicule de test"""
        vehicle = Vehicle(
            IdentifiantProprietaire=1,
            IdentifiantCategorie=1,  # Assurez-vous que cette catégorie existe
            IdentifiantModele=1,  # Assurez-vous que ce modèle existe
            TitreAnnonce="Toyota Corolla 2022",
            DescriptionVehicule="Véhicule de test",
            Annee=2022,
            Couleur="Noir",
            NombrePlaces=5,
            TypeCarburant="Essence",
            TypeTransmission="Manuel",
            Climatisation=True,
            PrixJournalier=Decimal("50.00"),
            LocalisationVille="Dakar",
            StatutVehicule="Actif"
        )
        db.add(vehicle)
        db.commit()
        db.refresh(vehicle)
        return vehicle
    
    # ====================================================================
    # TEST 1: Vérification du profil utilisateur valide
    # ====================================================================
    
    def test_verify_valid_user_profile(self, service: DataIntegrityService, db: Session, test_user: User):
        """Tester la vérification d'un profil utilisateur valide"""
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        # Assertions
        assert report.user_id == test_user.IdentifiantUtilisateur
        assert report.status in ["valid", "warnings"]
        assert "profile_valid" in report.checks_performed or "user_exists" in report.checks_performed
        
        # Vérifier qu'il n'y a pas d'erreurs critiques sur le profil
        profile_errors = [e for e in report.errors if e.table == "User" and e.severity == "critical"]
        assert len(profile_errors) == 0
    
    # ====================================================================
    # TEST 2: Détection de données utilisateur invalides
    # ====================================================================
    
    def test_detect_missing_name(self, service: DataIntegrityService, db: Session):
        """Tester la détection d'un nom manquant"""
        user = User(
            Nom="",  # Nom manquant
            Prenom="Jean",
            Email="test@test.com",
            MotDePasse="password123",
            TypeUtilisateur="locataire",
            StatutCompte="Actif"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        report = service.verify_user_data_integrity(user.IdentifiantUtilisateur)
        
        # Doit avoir au moins une erreur sur le nom
        name_errors = [e for e in report.errors if "Name is empty" in e.message]
        assert len(name_errors) > 0
        assert report.status in ["invalid", "warnings"]
    
    def test_detect_invalid_email_format(self, service: DataIntegrityService, db: Session):
        """Tester la détection d'un format d'email invalide"""
        user = User(
            Nom="Dupont",
            Prenom="Jean",
            Email="invalid-email-without-at",  # Email invalide
            MotDePasse="password123",
            TypeUtilisateur="locataire",
            StatutCompte="Actif"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        report = service.verify_user_data_integrity(user.IdentifiantUtilisateur)
        
        email_errors = [e for e in report.errors if "email format" in e.message.lower()]
        assert len(email_errors) > 0
    
    def test_detect_invalid_user_type(self, service: DataIntegrityService, db: Session):
        """Tester la détection d'un type utilisateur invalide"""
        user = User(
            Nom="Dupont",
            Prenom="Jean",
            Email="test@test.com",
            MotDePasse="password123",
            TypeUtilisateur="invalid_type",  # Type invalide
            StatutCompte="Actif"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        report = service.verify_user_data_integrity(user.IdentifiantUtilisateur)
        
        type_errors = [e for e in report.errors if "Invalid user type" in e.message]
        assert len(type_errors) > 0
    
    # ====================================================================
    # TEST 3: Vérification des adresses
    # ====================================================================
    
    def test_verify_valid_address(self, service: DataIntegrityService, db: Session, test_user: User):
        """Tester la vérification d'une adresse valide"""
        address = AdresseUtilisateur(
            IdentifiantUtilisateur=test_user.IdentifiantUtilisateur,
            Rue="123 Rue de la Paix",
            Ville="Dakar",
            CodePostal="14000",
            Pays="Senegal"
        )
        db.add(address)
        db.commit()
        
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        # Vérifier qu'il n'y a pas d'erreurs d'adresse
        address_errors = [e for e in report.errors if e.table == "AdresseUtilisateur"]
        assert len(address_errors) == 0
    
    def test_detect_incomplete_address(self, service: DataIntegrityService, db: Session, test_user: User):
        """Tester la détection d'une adresse incomplète"""
        address = AdresseUtilisateur(
            IdentifiantUtilisateur=test_user.IdentifiantUtilisateur,
            Rue="123 Rue",
            Ville="",  # Ville manquante
            CodePostal="14000",
            Pays="Senegal"
        )
        db.add(address)
        db.commit()
        
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        address_errors = [e for e in report.errors if e.table == "AdresseUtilisateur"]
        assert len(address_errors) > 0
    
    # ====================================================================
    # TEST 4: Vérification des réservations
    # ====================================================================
    
    def test_verify_valid_reservation(self, service: DataIntegrityService, db: Session, test_user: User, test_vehicle: Vehicle):
        """Tester la vérification d'une réservation valide"""
        today = datetime.now().date()
        reservation = Reservation(
            IdentifiantLocataire=test_user.IdentifiantUtilisateur,
            IdentifiantVehicule=test_vehicle.IdentifiantVehicule,
            DateDebut=today + timedelta(days=1),
            DateFin=today + timedelta(days=5),
            MontantTotal=Decimal("200.00"),
            StatutReservation="Confirmee"
        )
        db.add(reservation)
        db.commit()
        
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        reservation_errors = [e for e in report.errors if e.table == "Reservation"]
        assert len(reservation_errors) == 0
    
    def test_detect_invalid_reservation_dates(self, service: DataIntegrityService, db: Session, test_user: User, test_vehicle: Vehicle):
        """Tester la détection de dates de réservation invalides"""
        today = datetime.now().date()
        reservation = Reservation(
            IdentifiantLocataire=test_user.IdentifiantUtilisateur,
            IdentifiantVehicule=test_vehicle.IdentifiantVehicule,
            DateDebut=today + timedelta(days=5),
            DateFin=today + timedelta(days=1),  # Fin avant début
            MontantTotal=Decimal("200.00"),
            StatutReservation="Confirmee"
        )
        db.add(reservation)
        db.commit()
        
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        date_errors = [e for e in report.errors if "invalid dates" in e.message.lower()]
        assert len(date_errors) > 0
    
    def test_detect_reservation_with_nonexistent_vehicle(self, service: DataIntegrityService, db: Session, test_user: User):
        """Tester la détection d'une réservation avec véhicule inexistant"""
        today = datetime.now().date()
        reservation = Reservation(
            IdentifiantLocataire=test_user.IdentifiantUtilisateur,
            IdentifiantVehicule=99999,  # Véhicule inexistant
            DateDebut=today + timedelta(days=1),
            DateFin=today + timedelta(days=5),
            MontantTotal=Decimal("200.00"),
            StatutReservation="Confirmee"
        )
        db.add(reservation)
        db.commit()
        
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        vehicle_errors = [e for e in report.errors if "non-existent vehicle" in e.message.lower()]
        assert len(vehicle_errors) > 0
    
    # ====================================================================
    # TEST 5: Vérification des avis et évaluations
    # ====================================================================
    
    def test_verify_valid_review(self, service: DataIntegrityService, db: Session, test_user: User, test_vehicle: Vehicle):
        """Tester la vérification d'un avis valide"""
        review = Review(
            IdentifiantAuteur=test_user.IdentifiantUtilisateur,
            IdentifiantVehicule=test_vehicle.IdentifiantVehicule,
            Note=4,
            Commentaire="Excellent véhicule!",
            DateCreation=datetime.now()
        )
        db.add(review)
        db.commit()
        
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        review_errors = [e for e in report.errors if e.table == "Avis"]
        assert len(review_errors) == 0
    
    def test_detect_invalid_review_rating(self, service: DataIntegrityService, db: Session, test_user: User, test_vehicle: Vehicle):
        """Tester la détection d'une note invalide"""
        review = Review(
            IdentifiantAuteur=test_user.IdentifiantUtilisateur,
            IdentifiantVehicule=test_vehicle.IdentifiantVehicule,
            Note=10,  # Note invalide (> 5)
            Commentaire="Mauvais avis",
            DateCreation=datetime.now()
        )
        db.add(review)
        db.commit()
        
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        rating_errors = [e for e in report.errors if "invalid rating" in e.message.lower()]
        assert len(rating_errors) > 0
    
    # ====================================================================
    # TEST 6: Vérification des paiements
    # ====================================================================
    
    def test_verify_valid_payment(self, service: DataIntegrityService, db: Session, test_user: User):
        """Tester la vérification d'un paiement valide"""
        payment = Payment(
            IdentifiantUtilisateur=test_user.IdentifiantUtilisateur,
            Montant=Decimal("100.00"),
            StatutPaiement="Accepte",
            MethodePaiement="Carte_Credit",
            DatePaiement=datetime.now()
        )
        db.add(payment)
        db.commit()
        
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        payment_errors = [e for e in report.errors if e.table == "Paiement"]
        assert len(payment_errors) == 0
    
    def test_detect_negative_payment(self, service: DataIntegrityService, db: Session, test_user: User):
        """Tester la détection d'un montant de paiement négatif"""
        payment = Payment(
            IdentifiantUtilisateur=test_user.IdentifiantUtilisateur,
            Montant=Decimal("-100.00"),  # Montant négatif
            StatutPaiement="Accepte",
            MethodePaiement="Carte_Credit",
            DatePaiement=datetime.now()
        )
        db.add(payment)
        db.commit()
        
        report = service.verify_user_data_integrity(test_user.IdentifiantUtilisateur)
        
        amount_errors = [e for e in report.errors if "negative amount" in e.message.lower()]
        assert len(amount_errors) > 0
    
    # ====================================================================
    # TEST 7: Intégrité globale de la base de données
    # ====================================================================
    
    def test_database_integrity_check(self, service: DataIntegrityService):
        """Tester la vérification d'intégrité globale de la base de données"""
        result = service.verify_database_integrity()
        
        assert result["timestamp"]
        assert "status" in result
        assert "summary" in result
        assert "checks" in result
    
    # ====================================================================
    # TEST 8: Récupération et vérification de données par email
    # ====================================================================
    
    def test_get_user_by_email_with_integrity_check(self, service: DataIntegrityService, test_user: User):
        """Tester la récupération d'un utilisateur par email avec vérification"""
        result = service.get_user_by_email(test_user.Email)
        
        assert result is not None
        assert result["user"]["id"] == test_user.IdentifiantUtilisateur
        assert result["user"]["email"] == test_user.Email
        assert "integrity_report" in result
        assert result["integrity_report"]["user_id"] == test_user.IdentifiantUtilisateur
    
    def test_get_nonexistent_user_by_email(self, service: DataIntegrityService):
        """Tester la récupération d'un utilisateur inexistant"""
        result = service.get_user_by_email("nonexistent@test.com")
        assert result is None
    
    # ====================================================================
    # TEST 9: Statut d'intégrité de tous les utilisateurs
    # ====================================================================
    
    def test_get_all_users_integrity_status(self, service: DataIntegrityService, test_user: User):
        """Tester la récupération du statut d'intégrité de tous les utilisateurs"""
        result = service.get_all_users_integrity_status()
        
        assert "timestamp" in result
        assert "total_users" in result
        assert "valid_count" in result
        assert "invalid_count" in result
        assert "users" in result
        assert len(result["users"]) >= 1


class TestDataIntegrityError:
    """Tests de la classe DataIntegrityError"""
    
    def test_error_creation(self):
        """Tester la création d'une erreur d'intégrité"""
        error = DataIntegrityError(
            error_type="test_error",
            severity="warning",
            table="TestTable",
            user_id=1,
            message="Test error message"
        )
        
        assert error.error_type == "test_error"
        assert error.severity == "warning"
        assert error.table == "TestTable"
        assert error.user_id == 1
    
    def test_error_to_dict(self):
        """Tester la conversion d'une erreur en dictionnaire"""
        error = DataIntegrityError(
            error_type="test_error",
            severity="warning",
            table="TestTable",
            user_id=1,
            message="Test error message",
            affected_records=[1, 2, 3]
        )
        
        error_dict = error.to_dict()
        
        assert error_dict["error_type"] == "test_error"
        assert error_dict["severity"] == "warning"
        assert error_dict["affected_records"] == [1, 2, 3]


class TestDataIntegrityReport:
    """Tests de la classe DataIntegrityReport"""
    
    def test_report_creation(self):
        """Tester la création d'un rapport"""
        report = DataIntegrityReport(user_id=1)
        
        assert report.user_id == 1
        assert report.status == "pending"
        assert len(report.errors) == 0
    
    def test_add_error_to_report(self):
        """Tester l'ajout d'une erreur au rapport"""
        report = DataIntegrityReport(user_id=1)
        
        error = DataIntegrityError(
            error_type="test",
            severity="critical",
            table="Test",
            user_id=1,
            message="Test error"
        )
        
        report.add_error(error)
        
        assert len(report.errors) == 1
        assert report.status == "invalid"  # Critical error
    
    def test_report_status_update(self):
        """Tester la mise à jour du statut du rapport"""
        report = DataIntegrityReport(user_id=1)
        
        # Ajouter une erreur warning
        warning = DataIntegrityError(
            error_type="test",
            severity="warning",
            table="Test",
            user_id=1,
            message="Warning"
        )
        report.add_error(warning)
        
        assert report.status == "warnings"
        
        # Ajouter une erreur critique
        critical = DataIntegrityError(
            error_type="test",
            severity="critical",
            table="Test",
            user_id=1,
            message="Critical error"
        )
        report.add_error(critical)
        
        assert report.status == "invalid"  # Critical errors take precedence


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
