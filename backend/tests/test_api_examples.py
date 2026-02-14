"""
===================================================================================
EXEMPLES DE TESTS UNITAIRES POUR L'API AUTOLOCA
===================================================================================

Ce fichier contient des exemples de données JSON pour tester toutes les 
fonctionnalités de l'API backend.

Utilisation avec pytest et httpx:
    pytest tests/test_api_examples.py -v

Utilisation manuelle avec requests:
    import requests
    response = requests.post(BASE_URL + "/api/v1/auth/register", json=USER_REGISTER_DATA)
"""

import pytest
from datetime import datetime, date, timedelta
from decimal import Decimal


# ===================================================================================
# CONFIGURATION DE BASE
# ===================================================================================

BASE_URL = "http://localhost:8000"
API_V1 = f"{BASE_URL}/api/v1"


# ===================================================================================
# 1. AUTHENTIFICATION & UTILISATEURS
# ===================================================================================

# --- Inscription Locataire ---
USER_REGISTER_LOCATAIRE = {
    "email": "locataire@example.com",
    "password": "SecurePass123!",
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+237670000001",
    "ville": "Douala",
    "type_utilisateur": "locataire"
}

# --- Inscription Propriétaire ---
USER_REGISTER_PROPRIETAIRE = {
    "email": "proprietaire@example.com",
    "password": "SecurePass456!",
    "nom": "Martin",
    "prenom": "Pierre",
    "telephone": "+237670000002",
    "ville": "Yaoundé",
    "type_utilisateur": "proprietaire"
}

# --- Inscription Admin ---
USER_REGISTER_ADMIN = {
    "email": "admin@autoloca.cm",
    "password": "AdminPass789!",
    "nom": "Admin",
    "prenom": "Super",
    "telephone": "+237670000000",
    "ville": "Douala",
    "type_utilisateur": "admin"
}

# --- Connexion ---
USER_LOGIN = {
    "email": "locataire@example.com",
    "password": "SecurePass123!"
}

# --- Rafraîchir Token ---
TOKEN_REFRESH = {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# --- Déconnexion ---
USER_LOGOUT = {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "logout_all_devices": False
}

USER_LOGOUT_ALL = {
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "logout_all_devices": True
}

# --- Mise à jour profil ---
USER_UPDATE_PROFILE = {
    "nom": "Dupont",
    "prenom": "Jean-Pierre",
    "telephone": "+237670000099",
    "ville": "Bafoussam",
    "adresse": "123 Rue Principale",
    "langue_preferee": "fr",
    "devise_preferee": "XAF"
}

# --- Changement mot de passe ---
USER_CHANGE_PASSWORD = {
    "current_password": "SecurePass123!",
    "new_password": "NewSecurePass456!"
}


# ===================================================================================
# 2. VÉHICULES
# ===================================================================================

# --- Création véhicule (Berline) ---
VEHICLE_CREATE_BERLINE = {
    "marque": "Toyota",
    "modele": "Corolla",
    "annee": 2022,
    "immatriculation": "LT-1234-AB",
    "type_vehicule": "berline",
    "carburant": "essence",
    "transmission": "automatique",
    "nombre_places": 5,
    "nombre_portes": 4,
    "climatisation": True,
    "prix_journalier": 25000,
    "prix_hebdomadaire": 150000,
    "prix_mensuel": 500000,
    "caution_requise": 100000,
    "kilometrage_inclus": 200,
    "frais_kilometrage_supplementaire": 100,
    "ville": "Douala",
    "adresse": "Akwa, Rue de la Joie",
    "latitude": 4.0511,
    "longitude": 9.7679,
    "description": "Toyota Corolla 2022 en excellent état, climatisée, très économique.",
    "caracteristiques": ["GPS", "Bluetooth", "Camera de recul", "Régulateur de vitesse"],
    "est_disponible": True,
    "livraison_disponible": True,
    "frais_livraison": 5000
}

# --- Création véhicule (SUV) ---
VEHICLE_CREATE_SUV = {
    "marque": "Toyota",
    "modele": "RAV4",
    "annee": 2023,
    "immatriculation": "LT-5678-CD",
    "type_vehicule": "suv",
    "carburant": "diesel",
    "transmission": "automatique",
    "nombre_places": 5,
    "nombre_portes": 5,
    "climatisation": True,
    "prix_journalier": 45000,
    "prix_hebdomadaire": 280000,
    "prix_mensuel": 900000,
    "caution_requise": 200000,
    "kilometrage_inclus": 250,
    "frais_kilometrage_supplementaire": 150,
    "ville": "Yaoundé",
    "adresse": "Bastos, Boulevard Kennedy",
    "latitude": 3.8480,
    "longitude": 11.5021,
    "description": "SUV spacieux idéal pour les familles et les voyages.",
    "caracteristiques": ["GPS", "Bluetooth", "4x4", "Toit ouvrant", "Sièges cuir"],
    "est_disponible": True,
    "livraison_disponible": True,
    "frais_livraison": 7500
}

# --- Création véhicule (Pickup) ---
VEHICLE_CREATE_PICKUP = {
    "marque": "Toyota",
    "modele": "Hilux",
    "annee": 2021,
    "immatriculation": "LT-9012-EF",
    "type_vehicule": "pickup",
    "carburant": "diesel",
    "transmission": "manuelle",
    "nombre_places": 5,
    "nombre_portes": 4,
    "climatisation": True,
    "prix_journalier": 55000,
    "prix_hebdomadaire": 350000,
    "prix_mensuel": 1100000,
    "caution_requise": 250000,
    "kilometrage_inclus": 300,
    "frais_kilometrage_supplementaire": 200,
    "ville": "Douala",
    "adresse": "Bonaberi, Zone Industrielle",
    "latitude": 4.0725,
    "longitude": 9.6842,
    "description": "Pickup robuste pour tous types de terrains et charges lourdes.",
    "caracteristiques": ["4x4", "Benne", "Treuil", "Protection benne"],
    "est_disponible": True,
    "livraison_disponible": False
}

# --- Création véhicule (Luxe) ---
VEHICLE_CREATE_LUXE = {
    "marque": "Mercedes-Benz",
    "modele": "Classe E",
    "annee": 2023,
    "immatriculation": "LT-3456-GH",
    "type_vehicule": "berline",
    "carburant": "essence",
    "transmission": "automatique",
    "nombre_places": 5,
    "nombre_portes": 4,
    "climatisation": True,
    "prix_journalier": 85000,
    "prix_hebdomadaire": 550000,
    "prix_mensuel": 1800000,
    "caution_requise": 500000,
    "kilometrage_inclus": 150,
    "frais_kilometrage_supplementaire": 250,
    "ville": "Douala",
    "adresse": "Bonapriso, Rue des Ambassades",
    "latitude": 4.0189,
    "longitude": 9.7035,
    "description": "Mercedes Classe E, luxe et confort pour vos déplacements VIP.",
    "caracteristiques": ["GPS", "Bluetooth", "Sièges chauffants", "Toit panoramique", "Son Burmester"],
    "est_disponible": True,
    "est_mise_en_avant": True,
    "livraison_disponible": True,
    "frais_livraison": 10000
}

# --- Mise à jour véhicule ---
VEHICLE_UPDATE = {
    "prix_journalier": 28000,
    "prix_hebdomadaire": 165000,
    "description": "Description mise à jour avec nouvelles caractéristiques.",
    "est_disponible": True
}

# --- Filtres de recherche véhicules ---
VEHICLE_SEARCH_FILTERS = {
    "city": "Douala",
    "type": "berline",
    "fuel": "essence",
    "transmission": "automatique",
    "min_price": 20000,
    "max_price": 50000,
    "seats": 5,
    "available": True,
    "page": 1,
    "page_size": 20
}


# ===================================================================================
# 3. RÉSERVATIONS / BOOKINGS
# ===================================================================================

# --- Création réservation simple ---
BOOKING_CREATE_SIMPLE = {
    "identifiant_vehicule": 1,
    "date_debut": (date.today() + timedelta(days=3)).isoformat(),
    "date_fin": (date.today() + timedelta(days=5)).isoformat(),
    "heure_debut": "09:00",
    "heure_fin": "18:00",
    "lieu_prise_en_charge": "Douala, Akwa",
    "lieu_restitution": "Douala, Akwa",
    "livraison_demandee": False,
    "assurance": False,
    "notes_speciales": ""
}

# --- Création réservation avec livraison ---
BOOKING_CREATE_WITH_DELIVERY = {
    "identifiant_vehicule": 1,
    "date_debut": (date.today() + timedelta(days=7)).isoformat(),
    "date_fin": (date.today() + timedelta(days=10)).isoformat(),
    "heure_debut": "08:00",
    "heure_fin": "20:00",
    "lieu_prise_en_charge": "Douala, Bonanjo",
    "lieu_restitution": "Douala, Bonapriso",
    "livraison_demandee": True,
    "adresse_livraison": "Hôtel Sawa, Bonanjo, Douala",
    "assurance": True,
    "type_assurance": "tous_risques",
    "notes_speciales": "Merci de livrer le véhicule propre avec le plein d'essence."
}

# --- Création réservation longue durée ---
BOOKING_CREATE_LONG_TERM = {
    "identifiant_vehicule": 2,
    "date_debut": (date.today() + timedelta(days=14)).isoformat(),
    "date_fin": (date.today() + timedelta(days=44)).isoformat(),  # 30 jours
    "heure_debut": "10:00",
    "heure_fin": "10:00",
    "lieu_prise_en_charge": "Yaoundé, Bastos",
    "lieu_restitution": "Yaoundé, Bastos",
    "livraison_demandee": False,
    "assurance": True,
    "type_assurance": "basique",
    "code_promo": "LONGUE30",
    "notes_speciales": "Location mensuelle pour déplacements professionnels."
}

# --- Mise à jour statut réservation ---
BOOKING_STATUS_UPDATE_CONFIRM = {
    "statut": "Confirmee"
}

BOOKING_STATUS_UPDATE_REFUSE = {
    "statut": "Refusee",
    "motif": "Véhicule non disponible pour ces dates"
}

BOOKING_STATUS_UPDATE_CANCEL = {
    "statut": "Annulee",
    "motif": "Annulation par le locataire"
}

# --- Démarrage réservation (prise en charge) ---
BOOKING_START = {
    "kilometrage_depart": 45230,
    "niveau_carburant": 100,
    "etat_vehicule": {
        "exterieur": "bon",
        "interieur": "bon",
        "pneus": "bon",
        "rayures_existantes": ["légère rayure portière gauche"]
    },
    "photos_depart": [
        "https://storage.example.com/photos/depart_avant.jpg",
        "https://storage.example.com/photos/depart_arriere.jpg",
        "https://storage.example.com/photos/depart_interieur.jpg"
    ],
    "commentaires": "Véhicule remis en bon état, documents vérifiés."
}

# --- Fin réservation (restitution) ---
BOOKING_END = {
    "kilometrage_retour": 45680,
    "niveau_carburant": 75,
    "etat_vehicule": {
        "exterieur": "bon",
        "interieur": "bon",
        "pneus": "bon",
        "nouveaux_dommages": []
    },
    "photos_retour": [
        "https://storage.example.com/photos/retour_avant.jpg",
        "https://storage.example.com/photos/retour_arriere.jpg",
        "https://storage.example.com/photos/retour_interieur.jpg"
    ],
    "commentaires": "Véhicule restitué en bon état."
}

# --- Annulation réservation ---
BOOKING_CANCELLATION = {
    "motif": "Changement de plans, voyage annulé."
}

# --- Extension réservation ---
BOOKING_EXTENSION = {
    "nouvelle_date_fin": (date.today() + timedelta(days=8)).isoformat(),
    "raison": "Prolongation du séjour pour raisons professionnelles"
}


# ===================================================================================
# 4. PAIEMENTS
# ===================================================================================

# --- Création paiement Mobile Money MTN ---
PAYMENT_CREATE_MTN = {
    "identifiant_reservation": 1,
    "methode_paiement": "mobile_money_mtn",
    "numero_telephone": "+237670000001"
}

# --- Création paiement Orange Money ---
PAYMENT_CREATE_ORANGE = {
    "identifiant_reservation": 1,
    "methode_paiement": "mobile_money_orange",
    "numero_telephone": "+237690000001"
}

# --- Création paiement Carte Bancaire ---
PAYMENT_CREATE_CARD = {
    "identifiant_reservation": 1,
    "methode_paiement": "carte_bancaire",
    "card_token": "tok_visa_xxx"
}

# --- Confirmation paiement ---
PAYMENT_CONFIRM = {
    "reference": "PAY-2024-001234"
}


# ===================================================================================
# 5. AVIS / REVIEWS
# ===================================================================================

# --- Création avis véhicule ---
REVIEW_CREATE_VEHICLE = {
    "identifiant_reservation": 1,
    "note": 5,
    "commentaire": "Excellent véhicule, très propre et bien entretenu. Le propriétaire est très professionnel."
}

# --- Création avis avec note moyenne ---
REVIEW_CREATE_AVERAGE = {
    "identifiant_reservation": 2,
    "note": 3,
    "commentaire": "Véhicule correct mais la climatisation fonctionne mal."
}

# --- Création avis négatif ---
REVIEW_CREATE_NEGATIVE = {
    "identifiant_reservation": 3,
    "note": 2,
    "commentaire": "Véhicule livré en retard et pas très propre. Déçu du service."
}


# ===================================================================================
# 6. FAVORIS
# ===================================================================================

# Les favoris utilisent simplement l'ID du véhicule dans l'URL
# POST /api/v1/favorites/{vehicle_id}
# DELETE /api/v1/favorites/{vehicle_id}


# ===================================================================================
# 7. MESSAGERIE
# ===================================================================================

# --- Envoi message ---
MESSAGE_CREATE = {
    "identifiant_destinataire": 2,
    "contenu": "Bonjour, votre Toyota Corolla est-elle disponible du 15 au 18 décembre?"
}

# --- Réponse message ---
MESSAGE_REPLY = {
    "identifiant_destinataire": 1,
    "contenu": "Bonjour ! Oui, le véhicule est disponible pour ces dates. N'hésitez pas à réserver."
}

# --- Message avec détails réservation ---
MESSAGE_BOOKING_INQUIRY = {
    "identifiant_destinataire": 2,
    "contenu": """Bonjour,

Je suis intéressé par votre véhicule pour la période du 20 au 25 décembre.
Quelques questions:
1. La livraison à l'aéroport est-elle possible?
2. Acceptez-vous un second conducteur?
3. Y a-t-il une réduction pour 5 jours?

Merci d'avance pour votre réponse."""
}


# ===================================================================================
# 8. NOTIFICATIONS
# ===================================================================================

# Les notifications sont créées automatiquement par le système
# Exemples de filtres pour récupérer les notifications:

NOTIFICATION_FILTERS = {
    "page": 1,
    "page_size": 20,
    "unread_only": True,
    "category": "reservation"  # reservation, paiement, message, systeme
}


# ===================================================================================
# 9. CODES PROMOTIONNELS
# ===================================================================================

# --- Création code promo pourcentage ---
PROMO_CODE_CREATE_PERCENT = {
    "code_promo": "NOEL2024",
    "type_promo": "Pourcentage",
    "valeur_promo": 15.0,
    "montant_minimum": 50000,
    "nombre_utilisations_max": 100,
    "utilisations_par_utilisateur": 1,
    "date_debut": date.today().isoformat(),
    "date_fin": (date.today() + timedelta(days=30)).isoformat(),
    "description": "15% de réduction pour les fêtes de Noël"
}

# --- Création code promo montant fixe ---
PROMO_CODE_CREATE_FIXED = {
    "code_promo": "BIENVENUE",
    "type_promo": "Montant",
    "valeur_promo": 5000,
    "montant_minimum": 25000,
    "nombre_utilisations_max": 500,
    "utilisations_par_utilisateur": 1,
    "date_debut": date.today().isoformat(),
    "date_fin": (date.today() + timedelta(days=365)).isoformat(),
    "description": "5000 XAF de réduction pour les nouveaux utilisateurs"
}

# --- Création code promo VIP ---
PROMO_CODE_CREATE_VIP = {
    "code_promo": "VIPGOLD",
    "type_promo": "Pourcentage",
    "valeur_promo": 25.0,
    "montant_minimum": 100000,
    "nombre_utilisations_max": 10,
    "utilisations_par_utilisateur": 5,
    "date_debut": date.today().isoformat(),
    "date_fin": (date.today() + timedelta(days=90)).isoformat(),
    "utilisateurs_applicables": [1, 2, 3],  # IDs des utilisateurs VIP
    "description": "25% de réduction pour nos clients VIP"
}

# --- Validation code promo ---
PROMO_CODE_VALIDATE = {
    "code_promo": "NOEL2024",
    "montant_reservation": 75000
}


# ===================================================================================
# 10. INCIDENTS
# ===================================================================================

# --- Déclaration incident accident ---
INCIDENT_CREATE_ACCIDENT = {
    "identifiant_reservation": 1,
    "type_incident": "accident",
    "gravite": "moyenne",
    "date_incident": datetime.now().isoformat(),
    "lieu_incident": "Carrefour Ndokoti, Douala",
    "description": "Accrochage léger avec un autre véhicule au carrefour. Dégâts mineurs sur le pare-chocs arrière.",
    "photos_urls": [
        "https://storage.example.com/incidents/photo1.jpg",
        "https://storage.example.com/incidents/photo2.jpg"
    ]
}

# --- Déclaration incident panne ---
INCIDENT_CREATE_PANNE = {
    "identifiant_reservation": 2,
    "type_incident": "panne_mecanique",
    "gravite": "haute",
    "date_incident": datetime.now().isoformat(),
    "lieu_incident": "Autoroute Douala-Yaoundé, km 45",
    "description": "Le véhicule s'est arrêté soudainement. Impossible de redémarrer. Témoin moteur allumé.",
    "photos_urls": []
}

# --- Déclaration incident crevaison ---
INCIDENT_CREATE_CREVAISON = {
    "identifiant_reservation": 3,
    "type_incident": "crevaison",
    "gravite": "basse",
    "date_incident": datetime.now().isoformat(),
    "lieu_incident": "Rue du Commerce, Bonanjo",
    "description": "Pneu avant droit crevé après avoir roulé sur un clou.",
    "photos_urls": [
        "https://storage.example.com/incidents/crevaison.jpg"
    ]
}

# --- Mise à jour incident ---
INCIDENT_UPDATE = {
    "description": "Description mise à jour avec plus de détails.",
    "photos_urls": [
        "https://storage.example.com/incidents/photo1.jpg",
        "https://storage.example.com/incidents/photo2.jpg",
        "https://storage.example.com/incidents/photo3_new.jpg"
    ]
}

# --- Résolution incident (Admin) ---
INCIDENT_RESOLVE = {
    "actions_prises": "Véhicule remorqué et réparé. Client dédommagé.",
    "cout_reparation": 150000,
    "responsable": "tiers"  # locataire, proprietaire, tiers, indetermine
}


# ===================================================================================
# 11. RÉCLAMATIONS
# ===================================================================================

# --- Création réclamation remboursement ---
RECLAMATION_CREATE_REMBOURSEMENT = {
    "identifiant_reservation": 1,
    "type_reclamation": "remboursement",
    "priorite": "haute",
    "objet": "Demande de remboursement suite annulation",
    "description": "J'ai dû annuler ma réservation 48h avant en raison d'une urgence familiale. Je demande le remboursement intégral.",
    "montant_reclame": 75000,
    "pieces_jointes": [
        "https://storage.example.com/reclamations/justificatif.pdf"
    ]
}

# --- Création réclamation qualité service ---
RECLAMATION_CREATE_QUALITE = {
    "identifiant_reservation": 2,
    "type_reclamation": "qualite_service",
    "priorite": "normale",
    "objet": "Véhicule non conforme à la description",
    "description": "Le véhicule n'avait pas de climatisation fonctionnelle alors qu'elle était mentionnée dans l'annonce.",
    "montant_reclame": 25000,
    "pieces_jointes": []
}

# --- Création réclamation facturation ---
RECLAMATION_CREATE_FACTURATION = {
    "identifiant_reservation": 3,
    "type_reclamation": "facturation",
    "priorite": "normale",
    "objet": "Frais supplémentaires non justifiés",
    "description": "Des frais de nettoyage de 15000 XAF ont été facturés alors que j'ai rendu le véhicule propre.",
    "montant_reclame": 15000,
    "pieces_jointes": [
        "https://storage.example.com/reclamations/photos_retour.zip"
    ]
}

# --- Mise à jour réclamation ---
RECLAMATION_UPDATE = {
    "description": "Complément d'information: j'ai également des photos du véhicule au moment de la restitution.",
    "pieces_jointes": [
        "https://storage.example.com/reclamations/photos_retour.zip",
        "https://storage.example.com/reclamations/photos_supplementaires.zip"
    ]
}

# --- Clôture réclamation (Admin) ---
RECLAMATION_CLOSE_ACCEPTED = {
    "statut": "acceptee",
    "resolution": "Remboursement accordé suite à vérification des justificatifs.",
    "montant_rembourse": 75000
}

RECLAMATION_CLOSE_REJECTED = {
    "statut": "rejetee",
    "resolution": "Réclamation rejetée: les conditions d'annulation ne permettent pas le remboursement."
}

RECLAMATION_CLOSE_PARTIAL = {
    "statut": "partiellement_acceptee",
    "resolution": "Remboursement partiel accordé: 50% du montant en geste commercial.",
    "montant_rembourse": 37500
}


# ===================================================================================
# 12. DOCUMENTS
# ===================================================================================

# --- Upload permis de conduire ---
DOCUMENT_UPLOAD_PERMIS = {
    "type_document": "permis_conduire",
    "numero_document": "CM-DL-123456",
    "date_expiration": (date.today() + timedelta(days=365*2)).isoformat(),
    "pays_emission": "Cameroun"
}

# --- Upload CNI ---
DOCUMENT_UPLOAD_CNI = {
    "type_document": "carte_identite",
    "numero_document": "123456789012",
    "date_expiration": (date.today() + timedelta(days=365*5)).isoformat(),
    "pays_emission": "Cameroun"
}

# --- Upload passeport ---
DOCUMENT_UPLOAD_PASSEPORT = {
    "type_document": "passeport",
    "numero_document": "AB1234567",
    "date_expiration": (date.today() + timedelta(days=365*3)).isoformat(),
    "pays_emission": "Cameroun"
}


# ===================================================================================
# 13. GPS / TRACKING
# ===================================================================================

# --- Position GPS véhicule ---
GPS_POSITION_UPDATE = {
    "identifiant_vehicule": 1,
    "latitude": 4.0511,
    "longitude": 9.7679,
    "vitesse": 45.5,
    "direction": 180,
    "altitude": 15.0,
    "precision": 5.0,
    "timestamp": datetime.now().isoformat()
}

# --- Historique positions ---
GPS_HISTORY_FILTERS = {
    "identifiant_vehicule": 1,
    "date_debut": (date.today() - timedelta(days=1)).isoformat(),
    "date_fin": date.today().isoformat()
}


# ===================================================================================
# 14. FIDÉLITÉ / LOYALTY
# ===================================================================================

# --- Consultation points ---
LOYALTY_CHECK = {
    # GET /api/v1/loyalty/points
    # Retourne le solde de points de l'utilisateur
}

# --- Utilisation points ---
LOYALTY_REDEEM = {
    "points_a_utiliser": 500,
    "identifiant_reservation": 1
}


# ===================================================================================
# 15. ADMINISTRATION (Admin uniquement)
# ===================================================================================

# --- Mise à jour statut utilisateur ---
ADMIN_USER_STATUS_UPDATE = {
    "statut": "verifie"  # en_attente, verifie, suspendu, banni
}

# --- Statistiques dashboard ---
ADMIN_STATS_FILTERS = {
    "date_debut": (date.today() - timedelta(days=30)).isoformat(),
    "date_fin": date.today().isoformat(),
    "type": "reservations"  # reservations, revenus, utilisateurs, vehicules
}


# ===================================================================================
# EXEMPLES DE TESTS AVEC PYTEST
# ===================================================================================

class TestAuthEndpoints:
    """Tests pour les endpoints d'authentification"""
    
    def test_register_locataire(self, client):
        """Test inscription locataire"""
        response = client.post(
            f"{API_V1}/auth/register",
            json=USER_REGISTER_LOCATAIRE
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["email"] == USER_REGISTER_LOCATAIRE["email"]
    
    def test_register_proprietaire(self, client):
        """Test inscription propriétaire"""
        response = client.post(
            f"{API_V1}/auth/register",
            json=USER_REGISTER_PROPRIETAIRE
        )
        assert response.status_code == 201
    
    def test_login_success(self, client):
        """Test connexion réussie"""
        response = client.post(
            f"{API_V1}/auth/login",
            json=USER_LOGIN
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_login_invalid_credentials(self, client):
        """Test connexion avec mauvais identifiants"""
        response = client.post(
            f"{API_V1}/auth/login",
            json={
                "email": "wrong@example.com",
                "password": "wrongpassword"
            }
        )
        assert response.status_code == 401


class TestVehicleEndpoints:
    """Tests pour les endpoints de véhicules"""
    
    def test_create_vehicle(self, client, owner_token):
        """Test création véhicule"""
        response = client.post(
            f"{API_V1}/vehicles",
            json=VEHICLE_CREATE_BERLINE,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 201
    
    def test_list_vehicles(self, client):
        """Test liste véhicules"""
        response = client.get(f"{API_V1}/vehicles")
        assert response.status_code == 200
        data = response.json()
        assert "vehicles" in data
        assert "total" in data
    
    def test_search_vehicles(self, client):
        """Test recherche véhicules avec filtres"""
        response = client.get(
            f"{API_V1}/vehicles",
            params=VEHICLE_SEARCH_FILTERS
        )
        assert response.status_code == 200


class TestBookingEndpoints:
    """Tests pour les endpoints de réservations"""
    
    def test_create_booking(self, client, user_token):
        """Test création réservation"""
        response = client.post(
            f"{API_V1}/bookings",
            json=BOOKING_CREATE_SIMPLE,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 201
    
    def test_confirm_booking(self, client, owner_token):
        """Test confirmation réservation"""
        response = client.put(
            f"{API_V1}/bookings/1/status",
            json=BOOKING_STATUS_UPDATE_CONFIRM,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
    
    def test_start_booking(self, client, owner_token):
        """Test démarrage réservation"""
        response = client.post(
            f"{API_V1}/bookings/1/start",
            json=BOOKING_START,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
    
    def test_end_booking(self, client, owner_token):
        """Test fin réservation"""
        response = client.post(
            f"{API_V1}/bookings/1/end",
            json=BOOKING_END,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200


class TestPaymentEndpoints:
    """Tests pour les endpoints de paiements"""
    
    def test_create_payment_mtn(self, client, user_token):
        """Test création paiement MTN"""
        response = client.post(
            f"{API_V1}/payments",
            json=PAYMENT_CREATE_MTN,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 201
    
    def test_get_payment_methods(self, client):
        """Test liste méthodes de paiement"""
        response = client.get(f"{API_V1}/payments/methods/available")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0


class TestReviewEndpoints:
    """Tests pour les endpoints d'avis"""
    
    def test_create_review(self, client, user_token):
        """Test création avis"""
        response = client.post(
            f"{API_V1}/reviews",
            json=REVIEW_CREATE_VEHICLE,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 201
    
    def test_get_vehicle_reviews(self, client):
        """Test récupération avis véhicule"""
        response = client.get(f"{API_V1}/reviews/vehicle/1")
        assert response.status_code == 200


class TestMessageEndpoints:
    """Tests pour les endpoints de messagerie"""
    
    def test_send_message(self, client, user_token):
        """Test envoi message"""
        response = client.post(
            f"{API_V1}/messages",
            json=MESSAGE_CREATE,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 201
    
    def test_get_conversations(self, client, user_token):
        """Test liste conversations"""
        response = client.get(
            f"{API_V1}/messages/conversations",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200


class TestPromoCodeEndpoints:
    """Tests pour les endpoints de codes promo"""
    
    def test_create_promo_code(self, client, admin_token):
        """Test création code promo"""
        response = client.post(
            f"{API_V1}/promo-codes",
            json=PROMO_CODE_CREATE_PERCENT,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 201
    
    def test_validate_promo_code(self, client, user_token):
        """Test validation code promo"""
        response = client.post(
            f"{API_V1}/promo-codes/validate",
            json=PROMO_CODE_VALIDATE,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200


class TestIncidentEndpoints:
    """Tests pour les endpoints d'incidents"""
    
    def test_create_incident(self, client, user_token):
        """Test déclaration incident"""
        response = client.post(
            f"{API_V1}/incidents/incidents",
            json=INCIDENT_CREATE_ACCIDENT,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 201
    
    def test_resolve_incident(self, client, admin_token):
        """Test résolution incident"""
        response = client.post(
            f"{API_V1}/incidents/incidents/1/resolve",
            json=INCIDENT_RESOLVE,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200


class TestReclamationEndpoints:
    """Tests pour les endpoints de réclamations"""
    
    def test_create_reclamation(self, client, user_token):
        """Test création réclamation"""
        response = client.post(
            f"{API_V1}/incidents/reclamations",
            json=RECLAMATION_CREATE_REMBOURSEMENT,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 201
    
    def test_close_reclamation(self, client, admin_token):
        """Test clôture réclamation"""
        response = client.post(
            f"{API_V1}/incidents/reclamations/1/close",
            json=RECLAMATION_CLOSE_ACCEPTED,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200


# ===================================================================================
# FIXTURE PYTEST (à mettre dans conftest.py)
# ===================================================================================

"""
# conftest.py

import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def user_token(client):
    # Créer un utilisateur et récupérer son token
    response = client.post("/api/v1/auth/register", json=USER_REGISTER_LOCATAIRE)
    return response.json()["access_token"]

@pytest.fixture
def owner_token(client):
    # Créer un propriétaire et récupérer son token
    response = client.post("/api/v1/auth/register", json=USER_REGISTER_PROPRIETAIRE)
    return response.json()["access_token"]

@pytest.fixture
def admin_token(client):
    # Créer un admin et récupérer son token
    response = client.post("/api/v1/auth/register", json=USER_REGISTER_ADMIN)
    return response.json()["access_token"]
"""


# ===================================================================================
# EXEMPLES HTTP POUR TESTS MANUELS (compatible avec REST Client VS Code)
# ===================================================================================

HTTP_TESTS = """
### Variables
@baseUrl = http://localhost:8000/api/v1
@token = {{login.response.body.access_token}}

### ==================== AUTHENTIFICATION ====================

### Inscription Locataire
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
    "email": "locataire@example.com",
    "password": "SecurePass123!",
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+237670000001",
    "ville": "Douala",
    "type_utilisateur": "locataire"
}

### Connexion
# @name login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
    "email": "locataire@example.com",
    "password": "SecurePass123!"
}

### Mon profil
GET {{baseUrl}}/auth/me
Authorization: Bearer {{token}}

### ==================== VÉHICULES ====================

### Liste véhicules
GET {{baseUrl}}/vehicles?page=1&page_size=20&city=Douala

### Détails véhicule
GET {{baseUrl}}/vehicles/1

### Créer véhicule
POST {{baseUrl}}/vehicles
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "marque": "Toyota",
    "modele": "Corolla",
    "annee": 2022,
    "immatriculation": "LT-1234-AB",
    "type_vehicule": "berline",
    "carburant": "essence",
    "transmission": "automatique",
    "nombre_places": 5,
    "prix_journalier": 25000,
    "ville": "Douala",
    "description": "Toyota Corolla 2022"
}

### ==================== RÉSERVATIONS ====================

### Créer réservation
POST {{baseUrl}}/bookings
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "identifiant_vehicule": 1,
    "date_debut": "2024-12-20",
    "date_fin": "2024-12-22",
    "heure_debut": "09:00",
    "heure_fin": "18:00",
    "lieu_prise_en_charge": "Douala, Akwa",
    "livraison_demandee": false,
    "assurance": true
}

### Mes réservations
GET {{baseUrl}}/bookings
Authorization: Bearer {{token}}

### ==================== PAIEMENTS ====================

### Créer paiement
POST {{baseUrl}}/payments
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "identifiant_reservation": 1,
    "methode_paiement": "mobile_money_mtn",
    "numero_telephone": "+237670000001"
}

### ==================== AVIS ====================

### Créer avis
POST {{baseUrl}}/reviews
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "identifiant_reservation": 1,
    "note": 5,
    "commentaire": "Excellent véhicule!"
}

### ==================== MESSAGES ====================

### Envoyer message
POST {{baseUrl}}/messages
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "identifiant_destinataire": 2,
    "contenu": "Bonjour, votre véhicule est-il disponible?"
}

### ==================== FAVORIS ====================

### Ajouter favori
POST {{baseUrl}}/favorites/1
Authorization: Bearer {{token}}

### Supprimer favori
DELETE {{baseUrl}}/favorites/1
Authorization: Bearer {{token}}

### ==================== NOTIFICATIONS ====================

### Mes notifications
GET {{baseUrl}}/notifications?unread_only=true
Authorization: Bearer {{token}}

### Marquer comme lue
POST {{baseUrl}}/notifications/1/read
Authorization: Bearer {{token}}
"""

if __name__ == "__main__":
    print("=== EXEMPLES DE TESTS UNITAIRES AUTOLOCA ===")
    print("\nCe fichier contient des exemples de données JSON pour tester l'API.")
    print("\nUtilisation:")
    print("  - Avec pytest: pytest tests/test_api_examples.py -v")
    print("  - Avec REST Client (VS Code): Copiez les exemples HTTP ci-dessus")
    print("  - Avec Postman/Insomnia: Importez les collections JSON")
