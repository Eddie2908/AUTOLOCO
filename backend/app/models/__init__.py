"""
Initialisation des modèles SQLAlchemy
======================================
Ce fichier importe tous les modèles dans le bon ordre pour que SQLAlchemy
puisse résoudre toutes les relations entre les tables.
"""

# Import de la base
from app.core.database import Base

# 1. Modèles de base sans dépendances
from app.models.user import Utilisateur

# 2. Modèles liés à l'utilisateur (adresses, documents, préférences)
from app.models.address import AdresseUtilisateur
from app.models.document import DocumentUtilisateur
from app.models.preference import PreferenceUtilisateur
from app.models.invoice import MethodePaiementUtilisateur, Facture
from app.models.session import SessionActive, TokenBlacklist
from app.models.login_attempt import TentativeConnexion
from app.models.notification import Notification
from app.models.favorite import Favori

# 3. Modèles de catégories et véhicules
from app.models.vehicle_category import CategorieVehicule, MarqueVehicule, ModeleVehicule
from app.models.vehicle import Vehicule, PhotoVehicule, ImageVehicule, CaracteristiqueTechnique

# 4. Modèles de réservation
from app.models.booking import Reservation
from app.models.booking_extension import ExtensionReservation

# 5. Modèles de paiement et transactions
from app.models.payment import Transaction, Paiement

# 6. Modèles d'avis
from app.models.review import Avis
from app.models.review_report import SignalementAvis

# 7. Modèles d'incidents
from app.models.incident import Incident, Reclamation, CommentaireIncident, ActionIncident

# 8. Communication
from app.models.message import Message
from app.models.conversation import Conversation
from app.models.notification_template import TemplateNotification, DeclencheurNotification

# 9. Fidélité et promotions
from app.models.loyalty import ProgrammeFidelite, PointFidelite, Parrainage
from app.models.promo_code import CodePromo, UtilisationCodePromo

# 10. Administration et audit
from app.models.role import Role, Permission, RolePermission, UserPermission
from app.models.audit import JournalAudit

# 11. Zones géographiques
from app.models.zone import ZoneGeographique, DistancePrecalculee

# 12. Tarification dynamique
from app.models.dynamic_pricing import RegleTarificationDynamique, HistoriquePrixVehicule

# 13. Analytics et statistiques
from app.models.analytics import AggregationUtilisateur, ConfigurationBusinessRule, ABTest

# 14. Recherche
from app.models.search import RechercheeSauvegardee, CacheRecherche, CacheStatistique

# 15. Logs d'erreurs
from app.models.error_log import LogErreur

# 16. Données chiffrées
from app.models.encrypted_data import DonneesChiffrees

# Export de tous les modèles
__all__ = [
    # Base
    'Base',
    
    # Utilisateurs
    'Utilisateur',
    'AdresseUtilisateur',
    'DocumentUtilisateur',
    'PreferenceUtilisateur',
    'MethodePaiementUtilisateur',
    'SessionActive',
    'TokenBlacklist',
    'TentativeConnexion',
    
    # Véhicules
    'CategorieVehicule',
    'MarqueVehicule',
    'ModeleVehicule',
    'Vehicule',
    'PhotoVehicule',
    'ImageVehicule',
    'CaracteristiqueTechnique',
    
    # Réservations
    'Reservation',
    'ExtensionReservation',
    
    # Paiements et factures
    'Transaction',
    'Paiement',
    'Facture',
    
    # Avis et incidents
    'Avis',
    'SignalementAvis',
    'Incident',
    'Reclamation',
    'CommentaireIncident',
    'ActionIncident',
    
    # Communication
    'Message',
    'Conversation',
    'Notification',
    'TemplateNotification',
    'DeclencheurNotification',
    
    # Fidélité
    'ProgrammeFidelite',
    'PointFidelite',
    'Parrainage',
    
    # Promotions
    'CodePromo',
    'UtilisationCodePromo',
    
    # Administration
    'Role',
    'Permission',
    'RolePermission',
    'UserPermission',
    'JournalAudit',
    
    # Zones
    'ZoneGeographique',
    'DistancePrecalculee',
    
    # Tarification
    'RegleTarificationDynamique',
    'HistoriquePrixVehicule',
    
    # Analytics
    'AggregationUtilisateur',
    'ConfigurationBusinessRule',
    'ABTest',
    
    # Recherche
    'RechercheeSauvegardee',
    'CacheRecherche',
    'CacheStatistique',
    
    # Logs et sécurité
    'LogErreur',
    'DonneesChiffrees',
    
    # Autres
    'Favori',
]
