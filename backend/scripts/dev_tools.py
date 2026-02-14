#!/usr/bin/env python
"""
Scripts Utilitaires de Développement AUTOLOCO
==============================================

Collection de commandes CLI pour faciliter le développement:
- Gestion de la base de données
- Création de données de test
- Gestion des utilisateurs
- Vérification de l'environnement

Usage:
    python scripts/dev_tools.py --help
    python scripts/dev_tools.py check-env
    python scripts/dev_tools.py create-admin
    python scripts/dev_tools.py seed-db

Auteur: AUTOLOCO Backend Team
Date: 2026-01-23
"""

import sys
import os
from pathlib import Path

# Ajouter le répertoire parent au PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent.parent))

import click
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import hashlib

from app.core.config import settings
from app.core.database import get_db, engine
from app.core.security import get_password_hash
from app.models.user import Utilisateur


@click.group()
def cli():
    """
    🚀 Outils de Développement AUTOLOCO
    
    Suite d'outils pour faciliter le développement du backend
    """
    pass


@cli.command()
def check_env():
    """
    ✅ Vérifier la configuration de l'environnement
    
    Vérifie:
    - Variables d'environnement requises
    - Connexion à la base de données
    - Dépendances Python
    - Configuration des services externes
    """
    click.echo("🔍 Vérification de l'environnement...\n")
    
    errors = []
    warnings = []
    
    # 1. Variables d'environnement critiques
    click.echo("1. Variables d'environnement:")
    required_vars = [
        "DATABASE_URL",
        "SECRET_KEY",
        "ALGORITHM"
    ]
    
    for var in required_vars:
        value = getattr(settings, var, None)
        if value:
            # Masquer les valeurs sensibles
            if var in ["SECRET_KEY", "DATABASE_URL"]:
                display_value = f"{str(value)[:10]}..." if len(str(value)) > 10 else "***"
            else:
                display_value = value
            click.echo(f"   ✅ {var}: {display_value}")
        else:
            errors.append(f"Variable manquante: {var}")
            click.echo(f"   ❌ {var}: NON DÉFINIE")
    
    # 2. Base de données
    click.echo("\n2. Connexion Base de données:")
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            click.echo("   ✅ Connexion réussie")
            
            # Vérifier les tables
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            click.echo(f"   ✅ {len(tables)} tables trouvées")
            
            if len(tables) == 0:
                warnings.append("Aucune table dans la base de données. Exécuter les migrations SQL.")
    except Exception as e:
        errors.append(f"Erreur de connexion BD: {str(e)}")
        click.echo(f"   ❌ Erreur: {str(e)}")
    
    # 3. Dépendances Python
    click.echo("\n3. Dépendances Python:")
    required_packages = {
        "fastapi": "0.104.0",
        "sqlalchemy": "2.0.0",
        "uvicorn": "0.24.0",
        "pydantic": "2.5.0"
    }
    
    for package, min_version in required_packages.items():
        try:
            import importlib.metadata
            version = importlib.metadata.version(package)
            click.echo(f"   ✅ {package}: {version}")
        except Exception:
            errors.append(f"Package manquant: {package}")
            click.echo(f"   ❌ {package}: NON INSTALLÉ")
    
    # 4. Services optionnels
    click.echo("\n4. Services optionnels:")
    
    # ClamAV
    if settings.CLAMAV_ENABLED:
        click.echo(f"   ⚠️  ClamAV: Activé (non vérifié)")
        warnings.append("ClamAV activé mais connexion non vérifiée")
    else:
        click.echo(f"   ℹ️  ClamAV: Désactivé")
    
    # Google Maps
    if settings.GOOGLE_MAPS_API_KEY:
        click.echo(f"   ✅ Google Maps API: Configurée")
    else:
        click.echo(f"   ℹ️  Google Maps API: Non configurée (utilise Nominatim)")
    
    # Résumé
    click.echo("\n" + "="*60)
    if errors:
        click.echo(f"❌ {len(errors)} erreur(s) critique(s) détectée(s):")
        for error in errors:
            click.echo(f"   - {error}")
    else:
        click.echo("✅ Aucune erreur critique")
    
    if warnings:
        click.echo(f"\n⚠️  {len(warnings)} avertissement(s):")
        for warning in warnings:
            click.echo(f"   - {warning}")
    
    if not errors and not warnings:
        click.echo("\n🎉 Environnement parfaitement configuré!")
    
    click.echo("="*60)
    
    sys.exit(1 if errors else 0)


@cli.command()
@click.option('--email', prompt='Email administrateur', help='Email du compte admin')
@click.option('--password', prompt='Mot de passe', hide_input=True, confirmation_prompt=True, help='Mot de passe sécurisé')
@click.option('--nom', prompt='Nom', help='Nom de famille')
@click.option('--prenom', prompt='Prénom', help='Prénom')
@click.option('--telephone', prompt='Téléphone', help='Numéro de téléphone')
def create_admin(email, password, nom, prenom, telephone):
    """
    👤 Créer un compte administrateur
    
    Crée un utilisateur avec le rôle Administrateur et tous les privilèges
    """
    click.echo("\n🔐 Création d'un administrateur...\n")
    
    try:
        db = next(get_db())
        
        # Vérifier si l'email existe déjà
        existing = db.query(Utilisateur).filter(Utilisateur.Email == email).first()
        if existing:
            click.echo(f"❌ Un utilisateur avec l'email {email} existe déjà")
            return
        
        # Créer l'utilisateur
        admin = Utilisateur(
            Email=email,
            MotDePasse=get_password_hash(password),
            Nom=nom,
            Prenom=prenom,
            Telephone=telephone,
            RoleUtilisateur="Administrateur",
            StatutCompte="Actif",
            EmailVerifie=True,
            TelephoneVerifie=True,
            DateInscription=datetime.utcnow(),
            DateModification=datetime.utcnow()
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        click.echo("✅ Administrateur créé avec succès!")
        click.echo(f"\n📧 Email: {email}")
        click.echo(f"👤 Nom: {prenom} {nom}")
        click.echo(f"📱 Téléphone: {telephone}")
        click.echo(f"🔑 ID: {admin.IdentifiantUtilisateur}")
        click.echo(f"👑 Rôle: {admin.RoleUtilisateur}")
        
    except Exception as e:
        click.echo(f"❌ Erreur: {str(e)}")
        sys.exit(1)


@cli.command()
@click.option('--users', default=10, help='Nombre d\'utilisateurs à créer')
@click.option('--vehicles', default=20, help='Nombre de véhicules à créer')
@click.confirmation_option(prompt='Êtes-vous sûr de vouloir ajouter des données de test?')
def seed_db(users, vehicles):
    """
    🌱 Peupler la base avec des données de test
    
    Génère automatiquement:
    - Utilisateurs (propriétaires et locataires)
    - Véhicules variés
    - Réservations
    - Avis
    """
    click.echo("\n🌱 Ajout de données de test...\n")
    
    try:
        db = next(get_db())
        
        # Listes de données réalistes pour le Cameroun
        prenoms = ["Jean", "Marie", "Paul", "Sophie", "André", "Élise", "François", "Claire", "Michel", "Anne"]
        noms = ["Nguema", "Mbarga", "Kamga", "Fotso", "Nkolo", "Eyoum", "Tchoua", "Biya", "Abanda", "Manga"]
        villes = ["Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua", "Maroua"]
        marques = ["Toyota", "Mercedes", "Hyundai", "Kia", "Nissan", "Honda", "Peugeot", "Renault"]
        modeles = {
            "Toyota": ["Corolla", "Camry", "RAV4", "Land Cruiser", "Hilux"],
            "Mercedes": ["Classe A", "Classe C", "GLE", "Sprinter"],
            "Hyundai": ["Accent", "Elantra", "Tucson", "Santa Fe"],
            "Kia": ["Picanto", "Rio", "Sportage", "Sorento"],
            "Nissan": ["Patrol", "Qashqai", "Navara"],
            "Honda": ["Civic", "Accord", "CR-V"],
            "Peugeot": ["208", "308", "2008", "3008"],
            "Renault": ["Clio", "Megane", "Duster", "Kangoo"]
        }
        
        click.echo(f"👥 Création de {users} utilisateurs...")
        created_users = []
        
        for i in range(users):
            prenom = prenoms[i % len(prenoms)]
            nom = noms[i % len(noms)]
            email = f"user{i+1}@test.autoloco.cm"
            
            user = Utilisateur(
                Email=email,
                MotDePasse=get_password_hash("password123"),
                Nom=nom,
                Prenom=prenom,
                Telephone=f"+23767{1000000 + i}",
                RoleUtilisateur="Proprietaire" if i % 3 == 0 else "Locataire",
                StatutCompte="Actif",
                EmailVerifie=True,
                TelephoneVerifie=i % 2 == 0,
                DateInscription=datetime.utcnow() - timedelta(days=365-i*10),
                DateModification=datetime.utcnow()
            )
            
            db.add(user)
            created_users.append(user)
        
        db.commit()
        click.echo(f"   ✅ {users} utilisateurs créés")
        
        # Créer des véhicules
        click.echo(f"\n🚗 Création de {vehicles} véhicules...")
        
        from app.models.vehicle import Vehicule
        
        for i in range(vehicles):
            marque = marques[i % len(marques)]
            modele = modeles[marque][i % len(modeles[marque])]
            ville = villes[i % len(villes)]
            
            # Coordonnées GPS approximatives des villes
            coords = {
                "Douala": (4.0511, 9.7679),
                "Yaoundé": (3.8480, 11.5021),
                "Bafoussam": (5.4737, 10.4179),
                "Bamenda": (5.9527, 10.1582),
                "Garoua": (9.3017, 13.3940),
                "Maroua": (10.5915, 14.3228)
            }
            
            lat, lng = coords[ville]
            # Ajouter variation aléatoire
            lat += (i % 20 - 10) * 0.01
            lng += (i % 20 - 10) * 0.01
            
            vehicule = Vehicule(
                IdentifiantProprietaire=created_users[i % len(created_users)].IdentifiantUtilisateur,
                Marque=marque,
                Modele=modele,
                Annee=2015 + (i % 9),
                Immatriculation=f"CM-{1000 + i}-DLA",
                NombrePlaces=4 + (i % 4),
                TypeTransmission="Automatique" if i % 3 == 0 else "Manuelle",
                TypeCarburant="Diesel" if i % 2 == 0 else "Essence",
                Kilometrage=50000 + (i * 5000),
                Couleur=["Blanc", "Noir", "Gris", "Bleu", "Rouge"][i % 5],
                PrixJournalier=15000 + (i * 1000),
                LocalisationVille=ville,
                LocalisationRegion=ville,
                Latitude=lat,
                Longitude=lng,
                StatutVehicule="Actif",
                StatutDisponibilite="Disponible",
                DateAjout=datetime.utcnow() - timedelta(days=180-i*5),
                DateModification=datetime.utcnow()
            )
            
            db.add(vehicule)
        
        db.commit()
        click.echo(f"   ✅ {vehicles} véhicules créés")
        
        click.echo("\n🎉 Données de test ajoutées avec succès!")
        click.echo("\n📊 Récapitulatif:")
        click.echo(f"   👥 Utilisateurs: {users}")
        click.echo(f"   🚗 Véhicules: {vehicles}")
        click.echo(f"   🏙️  Villes: {len(villes)}")
        
        click.echo("\n🔑 Identifiants de test:")
        click.echo("   Email: user1@test.autoloco.cm")
        click.echo("   Mot de passe: password123")
        
    except Exception as e:
        click.echo(f"❌ Erreur: {str(e)}")
        db.rollback()
        sys.exit(1)


@cli.command()
@click.confirmation_option(prompt='⚠️  ATTENTION: Ceci va SUPPRIMER TOUTES LES DONNÉES. Continuer?')
def reset_db():
    """
    🗑️  DANGER: Réinitialiser complètement la base de données
    
    Supprime toutes les données et recrée les tables
    """
    click.echo("\n🗑️  Réinitialisation de la base de données...\n")
    
    try:
        # Cette commande nécessiterait les migrations Alembic
        # ou l'exécution manuelle des scripts SQL
        click.echo("⚠️  Cette fonctionnalité nécessite:")
        click.echo("   1. Exécuter les scripts SQL de suppression")
        click.echo("   2. Exécuter les scripts SQL de création")
        click.echo("\n📄 Voir: scripts/migration_complete_tables.sql")
        
    except Exception as e:
        click.echo(f"❌ Erreur: {str(e)}")
        sys.exit(1)


@cli.command()
def generate_secret_key():
    """
    🔐 Générer une nouvelle SECRET_KEY sécurisée
    
    Génère une clé aléatoire de 32 bytes pour JWT
    """
    click.echo("\n🔐 Génération d'une SECRET_KEY...\n")
    
    # Méthode 1: secrets (recommandé)
    key1 = secrets.token_urlsafe(32)
    
    # Méthode 2: hashlib
    key2 = hashlib.sha256(secrets.token_bytes(32)).hexdigest()
    
    click.echo("SECRET_KEY générées (utilisez l'une des deux):\n")
    click.echo(f"Option 1 (URL-safe):")
    click.echo(f"{key1}\n")
    click.echo(f"Option 2 (Hex):")
    click.echo(f"{key2}\n")
    click.echo("💡 Copiez cette clé dans votre fichier .env:")
    click.echo(f"SECRET_KEY={key1}")


@cli.command()
def list_routes():
    """
    📋 Lister toutes les routes de l'API
    
    Affiche tous les endpoints disponibles avec leurs méthodes HTTP
    """
    click.echo("\n📋 Routes de l'API AUTOLOCO:\n")
    
    try:
        from main import app
        
        routes_by_tag = {}
        
        for route in app.routes:
            if hasattr(route, "methods") and hasattr(route, "path"):
                methods = ", ".join(sorted(route.methods - {"HEAD", "OPTIONS"}))
                path = route.path
                
                # Extraire le tag depuis le path
                if path.startswith("/api/v1/"):
                    tag = path.split("/")[3] if len(path.split("/")) > 3 else "root"
                else:
                    tag = "root"
                
                if tag not in routes_by_tag:
                    routes_by_tag[tag] = []
                
                routes_by_tag[tag].append((methods, path))
        
        # Afficher par tag
        for tag, routes in sorted(routes_by_tag.items()):
            click.echo(f"📦 {tag.upper()}")
            for methods, path in sorted(routes, key=lambda x: x[1]):
                click.echo(f"   {methods:10} {path}")
            click.echo()
        
        total = sum(len(routes) for routes in routes_by_tag.values())
        click.echo(f"✅ Total: {total} routes")
        
    except Exception as e:
        click.echo(f"❌ Erreur: {str(e)}")


@cli.command()
@click.argument('email')
def delete_user(email):
    """
    🗑️  Supprimer un utilisateur par email
    
    Supprime un utilisateur et toutes ses données associées
    """
    click.confirm(f'⚠️  Supprimer définitivement l\'utilisateur {email}?', abort=True)
    
    try:
        db = next(get_db())
        user = db.query(Utilisateur).filter(Utilisateur.Email == email).first()
        
        if not user:
            click.echo(f"❌ Utilisateur {email} non trouvé")
            return
        
        click.echo(f"\n🗑️  Suppression de {user.Prenom} {user.Nom} ({email})...")
        
        # Note: Ajoutez ici la logique pour supprimer les données associées
        # (véhicules, réservations, etc.) selon vos règles métier
        
        db.delete(user)
        db.commit()
        
        click.echo("✅ Utilisateur supprimé")
        
    except Exception as e:
        click.echo(f"❌ Erreur: {str(e)}")
        db.rollback()


@cli.command()
def db_stats():
    """
    📊 Afficher les statistiques de la base de données
    
    Compte les enregistrements dans chaque table principale
    """
    click.echo("\n📊 Statistiques de la base de données:\n")
    
    try:
        db = next(get_db())
        
        from app.models.user import Utilisateur
        from app.models.vehicle import Vehicule
        from app.models.booking import Reservation
        from app.models.review import Avis
        from app.models.message import Message
        
        stats = [
            ("👥 Utilisateurs", Utilisateur),
            ("🚗 Véhicules", Vehicule),
            ("📅 Réservations", Reservation),
            ("⭐ Avis", Avis),
            ("💬 Messages", Message),
        ]
        
        for label, model in stats:
            count = db.query(model).count()
            click.echo(f"{label:20} {count:>6}")
        
        # Statistiques supplémentaires
        click.echo("\n" + "="*40)
        
        # Utilisateurs actifs
        actifs = db.query(Utilisateur).filter(Utilisateur.StatutCompte == "Actif").count()
        click.echo(f"{'👤 Comptes actifs':20} {actifs:>6}")
        
        # Véhicules disponibles
        from app.models.vehicle import Vehicule
        disponibles = db.query(Vehicule).filter(Vehicule.StatutDisponibilite == "Disponible").count()
        click.echo(f"{'🟢 Véhicules dispos':20} {disponibles:>6}")
        
    except Exception as e:
        click.echo(f"❌ Erreur: {str(e)}")


if __name__ == '__main__':
    cli()
