"""
Configuration de l'application
===============================

Gestion centralisée de toutes les variables d'environnement
et paramètres de configuration via Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache
import warnings


class Settings(BaseSettings):
    """
    Configuration de l'application AUTOLOCO.
    
    Les valeurs sont chargées depuis les variables d'environnement
    ou un fichier .env à la racine du projet.
    """
    
    # ============================================================
    # APPLICATION
    # ============================================================
    APP_NAME: str = "AUTOLOCO API"
    ENVIRONMENT: str = "development"  # development, staging, production
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"
    
    # ============================================================
    # SÉCURITÉ
    # ============================================================
    SECRET_KEY: str = "dev-secret-key-change-in-production-minimum-32-characters"  # OBLIGATOIRE en production
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "*.autoloco.cm"]
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://autoloco.cm",
        "https://www.autoloco.cm"
    ]
    
    # ============================================================
    # BASE DE DONNÉES SQL SERVER
    # ============================================================
    DATABASE_URL: str = "mssql+pyodbc://sa:Password123@localhost/AUTOLOCO?driver=ODBC+Driver+18+for+SQL+Server&TrustServerCertificate=yes"
    # Format: mssql+pyodbc://user:pass@server/database?driver=ODBC+Driver+18+for+SQL+Server
    
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 3600
    DB_ECHO: bool = False  # True pour debug SQL
    
    # ============================================================
    # JWT AUTHENTICATION
    # ============================================================
    JWT_SECRET_KEY: Optional[str] = None  # Si différent de SECRET_KEY
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 heure
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 jours
    
    @property
    def jwt_secret(self) -> str:
        return self.JWT_SECRET_KEY or self.SECRET_KEY
    
    # ============================================================
    # REDIS CACHE
    # ============================================================
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_CACHE_EXPIRE: int = 3600  # 1 heure par défaut
    
    # ============================================================
    # STORAGE (Azure Blob / AWS S3)
    # ============================================================
    STORAGE_PROVIDER: str = "azure"  # azure, s3, local
    
    # Azure Blob Storage
    AZURE_STORAGE_ACCOUNT: Optional[str] = None
    AZURE_STORAGE_KEY: Optional[str] = None
    AZURE_STORAGE_CONTAINER: str = "autoloco"
    
    # AWS S3 (alternative)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    AWS_REGION: str = "eu-west-1"
    
    # Local storage (dev uniquement)
    LOCAL_STORAGE_PATH: str = "./uploads"
    
    # ============================================================
    # PAYMENT GATEWAYS
    # ============================================================
    
    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Flutterwave (Mobile Money)
    FLUTTERWAVE_SECRET_KEY: Optional[str] = None
    FLUTTERWAVE_PUBLIC_KEY: Optional[str] = None
    FLUTTERWAVE_ENCRYPTION_KEY: Optional[str] = None
    
    # ============================================================
    # EMAIL (SendGrid)
    # ============================================================
    SENDGRID_API_KEY: Optional[str] = None
    EMAIL_FROM_ADDRESS: str = "noreply@autoloco.cm"
    EMAIL_FROM_NAME: str = "AUTOLOCO"
    
    # ============================================================
    # SMS (API locale Cameroun)
    # ============================================================
    SMS_PROVIDER: str = "local"  # local, twilio
    SMS_API_URL: Optional[str] = None
    SMS_API_KEY: Optional[str] = None
    
    # ============================================================
    # MONITORING & LOGGING
    # ============================================================
    SENTRY_DSN: Optional[str] = None
    LOG_LEVEL: str = "INFO"  # DEBUG, INFO, WARNING, ERROR
    
    # ============================================================
    # RATE LIMITING
    # ============================================================
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # ============================================================
    # SECURITY - FILE UPLOADS
    # ============================================================
    
    # ClamAV Antivirus
    CLAMAV_ENABLED: bool = False  # Activer en production
    CLAMAV_HOST: str = "localhost"
    CLAMAV_PORT: int = 3310
    
    # Signed URLs
    URL_SIGNATURE_KEY: Optional[str] = None  # Si différent de SECRET_KEY
    URL_SIGNATURE_EXPIRE_HOURS: int = 24
    
    @property
    def url_signature_key(self) -> str:
        return self.URL_SIGNATURE_KEY or self.SECRET_KEY
    
    # ============================================================
    # MAPS & GEOLOCATION
    # ============================================================
    
    # Google Maps API
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    GOOGLE_PLACES_API_KEY: Optional[str] = None
    
    # Routing providers
    ROUTING_PROVIDER: str = "osrm"  # osrm (gratuit) ou google (payant)
    OSRM_SERVER_URL: str = "https://router.project-osrm.org"
    
    # Geocoding
    GEOCODING_PROVIDER: str = "nominatim"  # nominatim (gratuit) ou google (payant)
    NOMINATIM_USER_AGENT: str = "AUTOLOCO/1.0"
    
    # Cache géolocalisation
    GEO_CACHE_EXPIRE_SECONDS: int = 300  # 5 minutes
    
    # ============================================================
    # BUSINESS RULES
    # ============================================================
    
    # Réservations
    MIN_BOOKING_DAYS: int = 1
    MAX_BOOKING_DAYS: int = 90
    BOOKING_ADVANCE_DAYS: int = 365  # Max anticipation
    
    # Véhicules
    MAX_VEHICLES_PER_OWNER: int = 10
    MAX_PHOTOS_PER_VEHICLE: int = 10
    MIN_PHOTOS_PER_VEHICLE: int = 3
    
    # Utilisateurs
    MIN_AGE_RENTER: int = 18
    MIN_AGE_OWNER: int = 21
    MAX_SESSIONS_PER_USER: int = 5
    
    # Paiements
    CURRENCY: str = "XOF"  # Franc CFA
    PLATFORM_COMMISSION_PERCENT: float = 10.0  # 10% commission
    MIN_DEPOSIT_PERCENT: float = 20.0  # 20% caution minimum
    
    # ============================================================
    # CONFIGURATION CLASS
    # ============================================================
    
    def model_post_init(self, __context):
        """Validate critical settings after initialization."""
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY.startswith("dev-secret-key"):
                raise ValueError(
                    "FATAL: SECRET_KEY must be changed from default in production! "
                    "Set a strong random key via the SECRET_KEY environment variable."
                )
            if self.DATABASE_URL.startswith("mssql+pyodbc://sa:Password123"):
                raise ValueError(
                    "FATAL: DATABASE_URL still uses default dev credentials in production!"
                )
        elif self.SECRET_KEY.startswith("dev-secret-key"):
            warnings.warn(
                "SECRET_KEY is using the default dev value. "
                "Set a strong SECRET_KEY before deploying.",
                stacklevel=2,
            )

    class Config:
        env_file = ".env"
        extra = "ignore" 
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Fonction cachée pour récupérer les settings.
    Évite de recharger les variables d'environnement à chaque appel.
    """
    return Settings()


# Instance globale des settings
settings = get_settings()
