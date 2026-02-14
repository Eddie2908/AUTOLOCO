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

    This function properly handles table creation for SQL Server by:
    1. Disabling foreign key checks temporarily
    2. Creating all tables using SQLAlchemy's metadata
    3. Re-enabling foreign key checks

    This approach prevents foreign key constraint errors during creation.
    """
    try:
        logger.info("Initializing database tables...")

        # Get a connection for raw SQL execution if needed
        with engine.connect() as connection:
            # Disable foreign key constraints temporarily
            logger.info("Disabling foreign key constraints...")
            connection.execute(text("""
                IF OBJECT_ID('[dbo].[SessionActive]', 'U') IS NOT NULL
                    ALTER TABLE SessionActive NOCHECK CONSTRAINT ALL
            """))
            connection.execute(text("""
                IF OBJECT_ID('[dbo].[TokensBlacklist]', 'U') IS NOT NULL
                    ALTER TABLE TokensBlacklist NOCHECK CONSTRAINT ALL
            """))
            connection.execute(text("""
                IF OBJECT_ID('[dbo].[utilisateurs_permissions]', 'U') IS NOT NULL
                    ALTER TABLE utilisateurs_permissions NOCHECK CONSTRAINT ALL
            """))
            connection.commit()

        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")

        # Fix UNIQUE constraints on Vehicules to allow multiple NULLs
        with engine.connect() as connection:
            logger.info("Fixing UNIQUE constraints on Vehicules...")
            for col in ['Immatriculation', 'NumeroChassisVIN']:
                # Find and drop existing UNIQUE constraint
                connection.execute(text(f"""
                    DECLARE @constraint NVARCHAR(255)
                    SELECT @constraint = name
                    FROM sys.key_constraints
                    WHERE parent_object_id = OBJECT_ID('Vehicules')
                      AND type = 'UQ'
                      AND OBJECT_NAME(parent_object_id) = 'Vehicules'
                      AND EXISTS (
                          SELECT 1 FROM sys.index_columns ic
                          JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                          WHERE ic.object_id = parent_object_id
                            AND ic.index_id = unique_index_id
                            AND c.name = '{col}'
                      )
                    IF @constraint IS NOT NULL
                    BEGIN
                        EXEC('ALTER TABLE Vehicules DROP CONSTRAINT ' + @constraint)
                    END
                """))
                # Create filtered unique index (allows multiple NULLs)
                connection.execute(text(f"""
                    IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Vehicules_{col}' AND object_id = OBJECT_ID('Vehicules'))
                        CREATE UNIQUE INDEX UX_Vehicules_{col} ON Vehicules({col}) WHERE {col} IS NOT NULL
                """))
            connection.commit()

        # Re-enable foreign key constraints
        with engine.connect() as connection:
            logger.info("Re-enabling foreign key constraints...")
            connection.execute(text("""
                IF OBJECT_ID('[dbo].[SessionActive]', 'U') IS NOT NULL
                    ALTER TABLE SessionActive WITH CHECK CHECK CONSTRAINT ALL
            """))
            connection.execute(text("""
                IF OBJECT_ID('[dbo].[TokensBlacklist]', 'U') IS NOT NULL
                    ALTER TABLE TokensBlacklist WITH CHECK CHECK CONSTRAINT ALL
            """))
            connection.execute(text("""
                IF OBJECT_ID('[dbo].[utilisateurs_permissions]', 'U') IS NOT NULL
                    ALTER TABLE utilisateurs_permissions WITH CHECK CHECK CONSTRAINT ALL
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
        # Suppress foreign key checks
        session.execute(text("EXEC sp_MSForEachTable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL'"))
        session.commit()
    except:
        pass  # Some tables may not exist yet

    try:
        # 1. Create base table first (no dependencies)
        session.execute(text("""
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='Utilisateurs')
            CREATE TABLE Utilisateurs (
                IdentifiantUtilisateur INT PRIMARY KEY IDENTITY(1,1),
                Nom NVARCHAR(100) NOT NULL,
                Prenom NVARCHAR(100) NOT NULL,
                Email NVARCHAR(255) UNIQUE NOT NULL,
                MotDePasse NVARCHAR(255) NOT NULL,
                NumeroTelephone NVARCHAR(20),
                DateNaissance DATETIME,
                PhotoProfil NVARCHAR(500),
                TypeUtilisateur NVARCHAR(20) NOT NULL,
                StatutCompte NVARCHAR(20) DEFAULT 'Actif',
                EmailVerifie BIT DEFAULT 0,
                TelephoneVerifie BIT DEFAULT 0,
                DateInscription DATETIME DEFAULT GETUTCDATE(),
                DerniereConnexion DATETIME,
                AdresseIP NVARCHAR(45),
                DeviceInfo NVARCHAR(500),
                LanguePreferee NVARCHAR(10) DEFAULT 'fr',
                DevisePreferee NVARCHAR(3) DEFAULT 'XOF',
                BiographieUtilisateur NVARCHAR(1000),
                SiteWeb NVARCHAR(255),
                ReseauxSociaux TEXT,
                NotesUtilisateur DECIMAL(3,2) DEFAULT 0.00,
                NombreReservationsEffectuees INT DEFAULT 0,
                NombreVehiculesLoues INT DEFAULT 0,
                MembreDepuis INT,
                NiveauFidelite NVARCHAR(20) DEFAULT 'BRONZE',
                PointsFideliteTotal INT DEFAULT 0
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
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='SessionActive')
            CREATE TABLE SessionActive (
                IdentifiantSession INT PRIMARY KEY IDENTITY(1,1),
                IdentifiantUtilisateur INT NOT NULL,
                AccessTokenJTI NVARCHAR(100) NOT NULL,
                RefreshTokenJTI NVARCHAR(100) NOT NULL,
                AdresseIP NVARCHAR(45),
                UserAgent NVARCHAR(500),
                Appareil NVARCHAR(100),
                Navigateur NVARCHAR(50),
                Ville NVARCHAR(100),
                Pays NVARCHAR(100),
                DateCreation DATETIME DEFAULT GETUTCDATE(),
                DerniereActivite DATETIME DEFAULT GETUTCDATE(),
                DateExpiration DATETIME NOT NULL,
                EstActif BIT DEFAULT 1,
                FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur)
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
            IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='TokensBlacklist')
            CREATE TABLE TokensBlacklist (
                IdentifiantBlacklist INT PRIMARY KEY IDENTITY(1,1),
                JTI NVARCHAR(100) NOT NULL UNIQUE,
                TypeToken NVARCHAR(20) NOT NULL,
                IdentifiantUtilisateur INT NOT NULL,
                DateRevocation DATETIME DEFAULT GETUTCDATE(),
                DateExpiration DATETIME NOT NULL,
                RaisonRevocation NVARCHAR(100),
                AdresseIP NVARCHAR(45),
                UserAgent NVARCHAR(500),
                FOREIGN KEY (IdentifiantUtilisateur) REFERENCES Utilisateurs(IdentifiantUtilisateur)
            )
        """))
        session.commit()
        logger.info("Created TokensBlacklist table")
    except Exception as e:
        logger.warning(f"TokensBlacklist table creation failed: {e}")
        session.rollback()

    try:
        # Re-enable constraints
        session.execute(text("EXEC sp_MSForEachTable 'ALTER TABLE ? WITH CHECK CHECK CONSTRAINT ALL'"))
        session.commit()
    except:
        pass

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
            result = session.execute(text(f"""
                SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_NAME = '{table_name}'
            """)).scalar()

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
