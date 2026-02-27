"""
Database initialization and table creation
============================================

Handles proper creation of all database tables with correct dependency ordering.
This replaces the problematic Base.metadata.create_all() approach.
"""

import logging
from sqlalchemy import text
from app.core.database import engine, Base, SessionLocal
import app.models  # noqa: F401 - Import all models to register them

logger = logging.getLogger(__name__)


def init_database():
    """Initialize database by creating all tables.

    This function handles table creation for PostgreSQL by:
    1. Creating all tables using SQLAlchemy's metadata (handles dependency ordering)
    2. Creating partial unique indexes where needed (e.g. allow multiple NULLs)

    PostgreSQL natively allows multiple NULLs in UNIQUE columns, so less
    workaround is needed compared to SQL Server.
    """
    try:
        logger.info("Initializing database tables...")

        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")

        # Create partial unique indexes on Vehicules to enforce uniqueness only for non-NULL values
        # (PostgreSQL UNIQUE columns already allow multiple NULLs, but explicit partial indexes
        #  are kept for clarity and consistency)
        with engine.connect() as connection:
            logger.info("Ensuring partial unique indexes on Vehicules...")
            for col in ['Immatriculation', 'NumeroChassisVIN']:
                connection.execute(text(f"""
                    CREATE UNIQUE INDEX IF NOT EXISTS ux_vehicules_{col.lower()}
                    ON "Vehicules" ("{col}")
                    WHERE "{col}" IS NOT NULL
                """))
            connection.commit()

        logger.info("Database initialization completed successfully")
        return True

    except Exception as e:
        logger.error(f"Database initialization failed: {e}", exc_info=True)

        # Try alternative approach: create tables directly with raw SQL
        logger.warning("Attempting alternative table creation approach...")
        try:
            _create_tables_raw_sql()
            logger.info("Tables created using raw SQL fallback")
            return True
        except Exception as e2:
            logger.error(f"Raw SQL table creation also failed: {e2}", exc_info=True)
            return False


def _create_tables_raw_sql():
    """Fallback method: Create tables using raw SQL in correct dependency order."""
    session = SessionLocal()

    try:
        # 1. Create base table first (no dependencies)
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS "Utilisateurs" (
                "IdentifiantUtilisateur" SERIAL PRIMARY KEY,
                "Nom" VARCHAR(100) NOT NULL,
                "Prenom" VARCHAR(100) NOT NULL,
                "Email" VARCHAR(255) UNIQUE NOT NULL,
                "MotDePasse" VARCHAR(255) NOT NULL,
                "NumeroTelephone" VARCHAR(20),
                "DateNaissance" TIMESTAMP,
                "PhotoProfil" VARCHAR(500),
                "TypeUtilisateur" VARCHAR(20) NOT NULL,
                "StatutCompte" VARCHAR(20) DEFAULT 'Actif',
                "EmailVerifie" BOOLEAN DEFAULT FALSE,
                "TelephoneVerifie" BOOLEAN DEFAULT FALSE,
                "DateInscription" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
                "DerniereConnexion" TIMESTAMP,
                "AdresseIP" VARCHAR(45),
                "DeviceInfo" VARCHAR(500),
                "LanguePreferee" VARCHAR(10) DEFAULT 'fr',
                "DevisePreferee" VARCHAR(3) DEFAULT 'XOF',
                "BiographieUtilisateur" VARCHAR(1000),
                "SiteWeb" VARCHAR(255),
                "ReseauxSociaux" TEXT,
                "NotesUtilisateur" DECIMAL(3,2) DEFAULT 0.00,
                "NombreReservationsEffectuees" INTEGER DEFAULT 0,
                "NombreVehiculesLoues" INTEGER DEFAULT 0,
                "MembreDepuis" INTEGER,
                "NiveauFidelite" VARCHAR(20) DEFAULT 'BRONZE',
                "PointsFideliteTotal" INTEGER DEFAULT 0
            )
        """))
        session.commit()
        logger.info("Created Utilisateurs table")
    except Exception as e:
        logger.warning(f"Utilisateurs table already exists or creation failed: {e}")
        session.rollback()

    try:
        # 2. Create SessionActive (depends on Utilisateurs)
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS "SessionActive" (
                "IdentifiantSession" SERIAL PRIMARY KEY,
                "IdentifiantUtilisateur" INTEGER NOT NULL,
                "AccessTokenJTI" VARCHAR(100) NOT NULL,
                "RefreshTokenJTI" VARCHAR(100) NOT NULL,
                "AdresseIP" VARCHAR(45),
                "UserAgent" VARCHAR(500),
                "Appareil" VARCHAR(100),
                "Navigateur" VARCHAR(50),
                "Ville" VARCHAR(100),
                "Pays" VARCHAR(100),
                "DateCreation" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
                "DerniereActivite" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
                "DateExpiration" TIMESTAMP NOT NULL,
                "EstActif" BOOLEAN DEFAULT TRUE,
                FOREIGN KEY ("IdentifiantUtilisateur") REFERENCES "Utilisateurs"("IdentifiantUtilisateur")
            )
        """))
        session.commit()
        logger.info("Created SessionActive table")
    except Exception as e:
        logger.warning(f"SessionActive table creation failed: {e}")
        session.rollback()

    try:
        # 3. Create TokensBlacklist (depends on Utilisateurs)
        session.execute(text("""
            CREATE TABLE IF NOT EXISTS "TokensBlacklist" (
                "IdentifiantBlacklist" SERIAL PRIMARY KEY,
                "JTI" VARCHAR(100) NOT NULL UNIQUE,
                "TypeToken" VARCHAR(20) NOT NULL,
                "IdentifiantUtilisateur" INTEGER NOT NULL,
                "DateRevocation" TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC'),
                "DateExpiration" TIMESTAMP NOT NULL,
                "RaisonRevocation" VARCHAR(100),
                "AdresseIP" VARCHAR(45),
                "UserAgent" VARCHAR(500),
                FOREIGN KEY ("IdentifiantUtilisateur") REFERENCES "Utilisateurs"("IdentifiantUtilisateur")
            )
        """))
        session.commit()
        logger.info("Created TokensBlacklist table")
    except Exception as e:
        logger.warning(f"TokensBlacklist table creation failed: {e}")
        session.rollback()

    finally:
        session.close()


def check_database_connection():
    """Check if database connection is working."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False


def verify_tables_exist():
    """Verify that critical tables exist in the database."""
    session = SessionLocal()
    required_tables = ['Utilisateurs', 'SessionActive', 'TokensBlacklist']

    try:
        for table_name in required_tables:
            result = session.execute(text(
                "SELECT COUNT(*) FROM information_schema.tables "
                "WHERE table_name = :tname"
            ), {"tname": table_name}).scalar()

            if result == 0:
                logger.error(f"Required table '{table_name}' not found")
                return False
            else:
                logger.info(f"Table '{table_name}' exists")

        return True
    except Exception as e:
        logger.error(f"Failed to verify tables: {e}")
        return False
    finally:
        session.close()
