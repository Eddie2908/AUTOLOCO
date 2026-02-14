"""
Configuration pytest pour les tests
"""
import sys
from pathlib import Path

# Ajouter le répertoire racine au PYTHONPATH
root_path = Path(__file__).parent.parent
sys.path.insert(0, str(root_path))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings
from app.core.database import Base, engine as app_engine


@pytest.fixture(scope="session")
def engine():
    """Créer le moteur de base de données pour les tests"""
    # Utiliser le même engine que l'application (avec la bonne URL de connexion)
    return app_engine


@pytest.fixture(scope="function")
def db(engine) -> Session:
    """
    Créer une session de base de données pour chaque test.
    Rollback après chaque test pour isoler les données.
    """
    connection = engine.connect()
    transaction = connection.begin()
    
    SessionLocal = sessionmaker(bind=connection)
    session = SessionLocal()
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()
