#!/usr/bin/env python3
"""
Data Integrity Testing Scripts
==============================

Scripts pour tester le système de vérification d'intégrité
directement en ligne de commande ou pour l'automation.

Utilisation:
    python scripts/test_data_integrity.py --user 1
    python scripts/test_data_integrity.py --database
    python scripts/test_data_integrity.py --all-users
"""

import sys
import argparse
import json
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Optional, Dict, Any

# Imports AUTOLOCO
try:
    from sqlalchemy.orm import Session
    from app.core.database import SessionLocal
    from app.services.data_integrity_service import DataIntegrityService
    from app.models.user_models import User
except ImportError as e:
    print(f"❌ Erreur d'import: {e}")
    print("   Assurez-vous que le backend AUTOLOCO est dans le PYTHONPATH")
    sys.exit(1)


class DataIntegrityTester:
    """Classe pour tester le système d'intégrité des données"""
    
    def __init__(self):
        """Initialiser le testeur"""
        self.db: Optional[Session] = None
        self.service: Optional[DataIntegrityService] = None
        self.results: Dict[str, Any] = {
            "timestamp": datetime.now().isoformat(),
            "tests": [],
            "summary": {
                "total": 0,
                "passed": 0,
                "failed": 0,
                "errors": []
            }
        }
    
    def connect(self) -> bool:
        """Établir une connexion à la base de données"""
        try:
            self.db = SessionLocal()
            self.service = DataIntegrityService(self.db)
            print("✅ Connexion à la base de données établie")
            return True
        except Exception as e:
            print(f"❌ Erreur de connexion: {e}")
            self.results["summary"]["errors"].append(f"Database connection: {str(e)}")
            return False
    
    def disconnect(self):
        """Fermer la connexion"""
        if self.db:
            self.db.close()
            print("✅ Connexion fermée")
    
    def test_user_integrity(self, user_id: int) -> bool:
        """Tester l'intégrité d'un utilisateur spécifique"""
        print(f"\n📋 Test: Vérification de l'utilisateur {user_id}")
        
        self.results["summary"]["total"] += 1
        
        try:
            # Vérifier que l'utilisateur existe
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                print(f"❌ Utilisateur {user_id} non trouvé")
                self.results["summary"]["failed"] += 1
                self.results["summary"]["errors"].append(f"User {user_id} not found")
                return False
            
            print(f"   Utilisateur trouvé: {user.Nom} {user.Prenom}")
            
            # Vérifier l'intégrité
            report = self.service.verify_user_data_integrity(user_id)
            
            # Analyser les résultats
            test_result = {
                "test": f"user_integrity_{user_id}",
                "status": "passed" if report.status == "valid" else "warning",
                "user_id": user_id,
                "integrity_status": report.status,
                "error_count": len(report.errors),
                "critical_errors": len([e for e in report.errors if e.severity == "critical"]),
                "warnings": len([e for e in report.errors if e.severity == "warning"]),
                "checks_performed": list(report.checks_performed)
            }
            
            if report.status == "valid":
                print(f"✅ Données valides (0 erreurs)")
                self.results["summary"]["passed"] += 1
            elif report.status == "warnings":
                print(f"⚠️  Avertissements détectés ({test_result['warnings']} avertissement(s))")
                self.results["summary"]["passed"] += 1
            else:  # invalid
                print(f"❌ Erreurs critiques détectées ({test_result['critical_errors']})")
                self.results["summary"]["failed"] += 1
                for error in report.errors:
                    if error.severity == "critical":
                        print(f"   - {error.message}")
            
            self.results["tests"].append(test_result)
            return report.status != "invalid"
            
        except Exception as e:
            print(f"❌ Erreur: {e}")
            self.results["summary"]["failed"] += 1
            self.results["summary"]["errors"].append(f"User integrity test: {str(e)}")
            return False
    
    def test_database_integrity(self) -> bool:
        """Tester l'intégrité globale de la base de données"""
        print(f"\n🗄️  Test: Vérification globale de la base de données")
        
        self.results["summary"]["total"] += 1
        
        try:
            result = self.service.verify_database_integrity()
            
            test_result = {
                "test": "database_integrity",
                "status": "passed" if result["status"] == "valid" else "warning",
                "integrity_status": result["status"],
                "summary": result["summary"],
                "checks": result["checks"]
            }
            
            # Analyser les orphelines
            orphaned_count = (
                result["summary"].get("orphaned_reservations", 0) +
                result["summary"].get("orphaned_reviews", 0)
            )
            
            if orphaned_count == 0:
                print(f"✅ Base de données cohérente (0 enregistrement orphelin)")
                self.results["summary"]["passed"] += 1
            else:
                print(f"⚠️  {orphaned_count} enregistrement(s) orphelin(s) détecté(s)")
                self.results["summary"]["passed"] += 1
            
            print(f"   Total réservations: {result['summary'].get('total_reservations', 0)}")
            print(f"   Total avis: {result['summary'].get('total_reviews', 0)}")
            print(f"   Total utilisateurs: {result['summary'].get('total_users', 0)}")
            
            self.results["tests"].append(test_result)
            return True
            
        except Exception as e:
            print(f"❌ Erreur: {e}")
            self.results["summary"]["failed"] += 1
            self.results["summary"]["errors"].append(f"Database integrity test: {str(e)}")
            return False
    
    def test_all_users(self) -> bool:
        """Tester l'intégrité de tous les utilisateurs"""
        print(f"\n👥 Test: Vérification de tous les utilisateurs")
        
        try:
            status = self.service.get_all_users_integrity_status()
            
            print(f"   Total utilisateurs: {status['total_users']}")
            print(f"   ✅ Valides: {status['valid_count']}")
            print(f"   ⚠️  Avertissements: {status.get('warnings_count', 0)}")
            print(f"   ❌ Erreurs: {status['invalid_count']}")
            
            test_result = {
                "test": "all_users_integrity",
                "status": "passed",
                "total_users": status["total_users"],
                "valid_count": status["valid_count"],
                "invalid_count": status["invalid_count"],
                "warnings_count": status.get("warnings_count", 0)
            }
            
            self.results["summary"]["total"] += 1
            self.results["summary"]["passed"] += 1
            self.results["tests"].append(test_result)
            
            return True
            
        except Exception as e:
            print(f"❌ Erreur: {e}")
            self.results["summary"]["failed"] += 1
            self.results["summary"]["errors"].append(f"All users test: {str(e)}")
            return False
    
    def test_health_check(self) -> bool:
        """Tester la santé du service"""
        print(f"\n💓 Test: Health check du service")
        
        self.results["summary"]["total"] += 1
        
        try:
            user_count = self.db.query(User).count()
            
            test_result = {
                "test": "health_check",
                "status": "passed",
                "database_connected": True,
                "total_users": user_count,
                "timestamp": datetime.now().isoformat()
            }
            
            print(f"✅ Service en bonne santé")
            print(f"   Utilisateurs en BD: {user_count}")
            
            self.results["summary"]["passed"] += 1
            self.results["tests"].append(test_result)
            
            return True
            
        except Exception as e:
            print(f"❌ Erreur: {e}")
            self.results["summary"]["failed"] += 1
            return False
    
    def print_summary(self):
        """Afficher un résumé des résultats"""
        print("\n" + "="*60)
        print("📊 RÉSUMÉ DES TESTS")
        print("="*60)
        
        summary = self.results["summary"]
        print(f"Total tests: {summary['total']}")
        print(f"✅ Réussis: {summary['passed']}")
        print(f"❌ Échoués: {summary['failed']}")
        
        if summary['errors']:
            print(f"\n⚠️  Erreurs rencontrées:")
            for error in summary['errors']:
                print(f"   - {error}")
        
        print(f"\nTimestamp: {self.results['timestamp']}")
        print("="*60 + "\n")
    
    def save_results(self, filename: str = "integrity_test_results.json"):
        """Sauvegarder les résultats en JSON"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False, default=str)
            print(f"✅ Résultats sauvegardés dans {filename}")
        except Exception as e:
            print(f"❌ Erreur lors de la sauvegarde: {e}")


def main():
    """Point d'entrée principal"""
    parser = argparse.ArgumentParser(
        description="Tester le système de vérification d'intégrité des données AUTOLOCO",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
    python scripts/test_data_integrity.py --user 1
    python scripts/test_data_integrity.py --database
    python scripts/test_data_integrity.py --all-users
    python scripts/test_data_integrity.py --all
    python scripts/test_data_integrity.py --user 1 --save results.json
        """)
    
    parser.add_argument('--user', type=int, help='Tester un utilisateur spécifique (ID)')
    parser.add_argument('--database', action='store_true', help='Tester l\'intégrité globale de la BD')
    parser.add_argument('--all-users', action='store_true', help='Tester tous les utilisateurs')
    parser.add_argument('--health', action='store_true', help='Tester la santé du service')
    parser.add_argument('--all', action='store_true', help='Exécuter tous les tests')
    parser.add_argument('--save', type=str, help='Sauvegarder les résultats en JSON')
    parser.add_argument('--verbose', '-v', action='store_true', help='Mode verbeux')
    
    args = parser.parse_args()
    
    # Créer le testeur
    tester = DataIntegrityTester()
    
    # Afficher le message de démarrage
    print("\n🚀 Démarrage des tests de vérification d'intégrité")
    print(f"   Heure: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Établir la connexion
    if not tester.connect():
        sys.exit(1)
    
    try:
        # Déterminer les tests à exécuter
        if args.all:
            tester.test_health_check()
            tester.test_user_integrity(1)  # Test user 1 par défaut
            tester.test_all_users()
            tester.test_database_integrity()
        elif args.user:
            tester.test_user_integrity(args.user)
        elif args.database:
            tester.test_database_integrity()
        elif args.all_users:
            tester.test_all_users()
        elif args.health:
            tester.test_health_check()
        else:
            # Par défaut, exécuter les tests basiques
            tester.test_health_check()
            tester.test_database_integrity()
        
        # Afficher le résumé
        tester.print_summary()
        
        # Sauvegarder si demandé
        if args.save:
            tester.save_results(args.save)
        
        # Retourner le code de statut approprié
        sys.exit(0 if tester.results["summary"]["failed"] == 0 else 1)
        
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrompus par l'utilisateur")
        sys.exit(130)
    finally:
        tester.disconnect()


if __name__ == "__main__":
    main()
