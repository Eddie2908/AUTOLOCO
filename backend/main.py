"""
AUTOLOCO Backend API
====================

Point d'entrée principal de l'application FastAPI.
Configuration globale, middlewares, routes, CORS, etc.
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import logging
import time
from typing import AsyncGenerator

# Import de la configuration
from app.core.config import settings
from app.core.database import engine, Base
from app.core.database_init import init_database, check_database_connection, verify_tables_exist

# Import de tous les modèles pour que SQLAlchemy puisse résoudre les relations
# Cet import doit être fait AVANT d'utiliser Base.metadata
import app.models  # noqa: F401

# Import des routers
from app.api.v1.endpoints import (
    auth,
    users,
    vehicles,
    search,
    bookings,
    payments,
    messages,
    reviews,
    notifications,
    favorites,
    gps,
    admin,
    data_integrity,
    user_avatar,
    analytics,
    vehicle_images
)

# Configuration du logging (doit être défini AVANT d'être utilisé)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import des nouveaux routers (ajoutés lors de la complétion)
try:
    from app.api.v1.endpoints import loyalty, promo_codes, documents, incidents
    EXTENDED_ENDPOINTS_AVAILABLE = True
except ImportError:
    EXTENDED_ENDPOINTS_AVAILABLE = False
    logger.warning("Extended endpoints (loyalty, promo_codes, documents, incidents) not available")


# Custom exception class
class AutolocoException(Exception):
    def __init__(self, status_code: int, error_code: str, message: str, detail: str = None):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.detail = detail


# Lifespan events (startup/shutdown)
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Gestion du cycle de vie de l'application.
    """
    logger.info("Starting AUTOLOCO Backend API...")

    # Vérifier la connexion à la base de données
    if not check_database_connection():
        logger.error("Failed to connect to database")
    else:
        # Initialiser les tables de base de données
        if settings.ENVIRONMENT == "development":
            logger.info("Initializing database tables...")
            if not init_database():
                logger.warning("Database initialization had issues, some tables may not be properly created")
            else:
                # Verify critical tables exist
                if not verify_tables_exist():
                    logger.warning("Some required tables are missing")

    logger.info("AUTOLOCO Backend started successfully")

    yield

    logger.info("Shutting down AUTOLOCO Backend...")
    logger.info("Shutdown complete")


# Création de l'application FastAPI
app = FastAPI(
    title="AUTOLOCO API",
    description="API Backend pour la plateforme de location de véhicules AUTOLOCO",
    version="1.0.0",
    docs_url="/" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    openapi_url="/openapi.json",
    lifespan=lifespan,
)


# ============================================================
# MIDDLEWARES
# ============================================================

# CORS - Configuration pour frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page", "X-Page-Size"],
)

# GZip Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Middleware de logging des requêtes
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware pour logger toutes les requêtes avec timing.
    """
    start_time = time.time()
    
    logger.info(f"Request: {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    duration = time.time() - start_time
    logger.info(f"Response: {request.method} {request.url.path} - {response.status_code} ({duration:.3f}s)")
    
    response.headers["X-Process-Time"] = str(duration)
    
    return response


# ============================================================
# EXCEPTION HANDLERS
# ============================================================

@app.exception_handler(AutolocoException)
async def autoloco_exception_handler(request: Request, exc: AutolocoException):
    """Handler pour les exceptions métier personnalisées."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error_code,
            "message": exc.message,
            "detail": exc.detail
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler pour les erreurs de validation Pydantic."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "VALIDATION_ERROR",
            "message": "Les données fournies sont invalides",
            "detail": exc.errors()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handler pour toutes les autres exceptions non gérées."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "Une erreur interne est survenue",
            "detail": str(exc) if settings.ENVIRONMENT == "development" else None
        }
    )


# ============================================================
# ROUTES
# ============================================================

# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """Endpoint de santé pour les load balancers et monitoring."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }


# Root endpoint
@app.get("/", tags=["System"])
async def root():
    """Endpoint racine avec informations API."""
    return {
        "message": "Bienvenue sur l'API AUTOLOCO",
        "version": "1.0.0",
        "docs": "/docs",
        "api_base": "/api/v1"
    }


# Inclure tous les routers API v1
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentification"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Utilisateurs"])
app.include_router(vehicles.router, prefix="/api/v1/vehicles", tags=["Véhicules"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Recherche"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Réservations"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Paiements"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["Messagerie"])
app.include_router(reviews.router, prefix="/api/v1/reviews", tags=["Avis"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(favorites.router, prefix="/api/v1/favorites", tags=["Favoris"])
app.include_router(gps.router, prefix="/api/v1/gps", tags=["Géolocalisation"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["Administration"])
app.include_router(data_integrity.router, prefix="/api/v1/admin/integrity")
app.include_router(user_avatar.router, prefix="/api/v1/users", tags=["Avatar Utilisateur"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(vehicle_images.router, prefix="/api/v1/vehicles", tags=["Images Véhicules"])

# Nouveaux routers (ajoutés lors de la complétion backend)
if EXTENDED_ENDPOINTS_AVAILABLE:
    app.include_router(loyalty.router, prefix="/api/v1/loyalty", tags=["Programme de Fidélité"])
    app.include_router(promo_codes.router, prefix="/api/v1/promo-codes", tags=["Codes Promotionnels"])
    app.include_router(documents.router, prefix="/api/v1/documents", tags=["Documents KYC"])
    app.include_router(incidents.router, prefix="/api/v1/incidents", tags=["Incidents & Réclamations"])
    logger.info("Extended endpoints registered successfully: loyalty, promo codes, documents, incidents")


# ============================================================
# STARTUP MESSAGE
# ============================================================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level="info"
    )
