"""
Data Integrity API Endpoints
=============================

Endpoints pour vérifier l'intégrité et la cohérence des données
stockées dans la base de données SQL Server.

Routes:
- GET /api/v1/admin/integrity/users/{user_id} - Vérifier un utilisateur spécifique
- GET /api/v1/admin/integrity/database - Vérifier l'intégrité globale
- GET /api/v1/admin/integrity/users - Statut d'intégrité de tous les utilisateurs
- GET /api/v1/admin/integrity/user-by-email/{email} - Récupérer et vérifier par email
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from datetime import datetime

from app.core.database import get_db
from app.services.data_integrity_service import DataIntegrityService
from app.api.dependencies import get_current_admin_user
from app.models.user import Utilisateur

router = APIRouter(
    tags=["data-integrity"],
    dependencies=[Depends(get_current_admin_user)]
)


# ====================================================================
# 1. Vérifier l'intégrité des données d'un utilisateur spécifique
# ====================================================================

@router.get("/users/{user_id}")
async def verify_user_data_integrity(
    user_id: int,
    db=Depends(get_db)
) -> Dict[str, Any]:
    """
    Vérifier l'intégrité complète des données d'un utilisateur spécifique.
    
    Effectue les vérifications suivantes:
    1. Validité du profil utilisateur
    2. Complétude et validité des adresses
    3. Validité des documents (type, statut, expiration)
    4. Cohérence des réservations (dates, montants, véhicules)
    5. Validité des avis (notes, dates)
    6. Validité des paiements (montants, statuts, méthodes)
    7. Cohérence des compteurs
    
    Args:
        user_id: ID de l'utilisateur à vérifier
        
    Returns:
        Rapport détaillé d'intégrité avec erreurs et suggestions
        
    Raises:
        HTTPException 404: Utilisateur non trouvé
        HTTPException 403: Utilisateur non autorisé (non admin)
    """
    try:
        # NOTE: get_db() fournit un wrapper async autour d'une Session sync (pyodbc).
        # DataIntegrityService attend une Session sync.
        sync_session = getattr(db, "_session", db)

        # Vérifier que l'utilisateur existe
        user = sync_session.query(Utilisateur).filter(Utilisateur.IdentifiantUtilisateur == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Utilisateur {user_id} non trouvé"
            )

        service = DataIntegrityService(sync_session)
        report = service.verify_user_data_integrity(user_id)

        return {
            "success": True,
            "user_id": user_id,
            "report": report.to_dict(),
            "timestamp": datetime.now().isoformat(),
            "checks_performed": report.checks_performed,
            "data_summary": report.data_summary,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la vérification: {str(e)}",
        )


# ====================================================================
# 2. Vérifier l'intégrité globale de la base de données
# ====================================================================

@router.get("/database")
async def verify_database_integrity(
    db=Depends(get_db)
) -> Dict[str, Any]:
    """
    Vérifier l'intégrité globale de la base de données.
    
    Effectue les vérifications globales suivantes:
    1. Recherche de réservations orphelines (véhicule inexistant)
    2. Recherche d'avis orphelins (auteur inexistant)
    3. Vérification de la cohérence des compteurs
    4. Statistiques générales de la base de données
    
    Returns:
        Rapport d'intégrité globale avec statistiques et problèmes détectés
        
    Raises:
        HTTPException 403: Utilisateur non autorisé (non admin)
    """
    try:
        sync_session = getattr(db, "_session", db)
        service = DataIntegrityService(sync_session)
        result = service.verify_database_integrity()

        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            **result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la vérification globale: {str(e)}",
        )


# ====================================================================
# 3. Obtenir le statut d'intégrité de tous les utilisateurs
# ====================================================================

@router.get("/users")
async def get_all_users_integrity_status(
    db=Depends(get_db),
    limit: int = 100,
    offset: int = 0
) -> Dict[str, Any]:
    """
    Obtenir un résumé du statut d'intégrité pour tous les utilisateurs.
    
    Retourne un tableau synthétique avec:
    - Nombre total d'utilisateurs
    - Nombre d'utilisateurs avec données valides
    - Nombre d'utilisateurs avec erreurs
    - Nombre d'utilisateurs avec avertissements
    - Liste détaillée par utilisateur
    
    Args:
        limit: Nombre maximum de résultats (défaut: 100)
        offset: Décalage pour pagination (défaut: 0)
        
    Returns:
        Résumé du statut d'intégrité pour tous les utilisateurs
        
    Raises:
        HTTPException 403: Utilisateur non autorisé (non admin)
    """
    try:
        sync_session = getattr(db, "_session", db)
        service = DataIntegrityService(sync_session)
        result = service.get_all_users_integrity_status()

        users_data = result.get("users", [])
        paginated_users = users_data[offset : offset + limit]

        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "pagination": {
                "limit": limit,
                "offset": offset,
                "total": len(users_data),
                "returned": len(paginated_users),
            },
            "summary": {
                "total_users": result.get("total_users", 0),
                "valid_count": result.get("valid_count", 0),
                "invalid_count": result.get("invalid_count", 0),
                "warnings_count": result.get("warnings_count", 0),
            },
            "users": paginated_users,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des statuts: {str(e)}",
        )


# ====================================================================
# 4. Récupérer un utilisateur par email avec vérification d'intégrité
# ====================================================================

@router.get("/user-by-email/{email}")
async def get_user_by_email(
    email: str,
    db=Depends(get_db)
) -> Dict[str, Any]:
    """
    Récupérer un utilisateur par adresse email avec vérification d'intégrité.
    
    Retourne les données de l'utilisateur ainsi qu'un rapport complet
    d'intégrité de ses données.
    
    Args:
        email: Adresse email de l'utilisateur
        
    Returns:
        Données de l'utilisateur + rapport d'intégrité
        
    Raises:
        HTTPException 404: Utilisateur non trouvé
        HTTPException 403: Utilisateur non autorisé (non admin)
    """
    try:
        sync_session = getattr(db, "_session", db)
        service = DataIntegrityService(sync_session)
        result = service.get_user_by_email(email)

        if result is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Aucun utilisateur trouvé avec l'email: {email}",
            )

        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            **result,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération: {str(e)}",
        )


# ====================================================================
# 5. Endpoint de diagnostic simple (health check)
# ====================================================================

@router.get("/health")
async def integrity_health_check(
    db=Depends(get_db)
) -> Dict[str, Any]:
    """
    Vérification rapide de la santé du service d'intégrité.
    
    Effectue des checks minimes:
    - Connexion à la base de données
    - Accès au service
    - Timestamp du serveur
    
    Returns:
        Status de santé du service
    """
    try:
        sync_session = getattr(db, "_session", db)
        service = DataIntegrityService(sync_session)

        # Faire un test simple de connexion
        user_count = sync_session.query(Utilisateur).count()

        return {
            "status": "healthy",
            "service": "data-integrity",
            "database_connected": True,
            "total_users": user_count,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "service": "data-integrity",
            "database_connected": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }


# ====================================================================
# 6. Endpoint pour les statistiques de réparation
# ====================================================================

@router.post("/repair-attempt/{user_id}")
async def attempt_repair_user_data(
    user_id: int,
    db=Depends(get_db)
) -> Dict[str, Any]:
    """
    Tenter une réparation automatique des données d'un utilisateur.
    
    NOTE: Cette opération est délicate et doit être documentée.
    Elle tente de corriger les problèmes détectés (montants négatifs, etc.)
    
    Args:
        user_id: ID de l'utilisateur à réparer
        
    Returns:
        Résumé des réparations effectuées
        
    Raises:
        HTTPException 404: Utilisateur non trouvé
        HTTPException 403: Utilisateur non autorisé (non admin)
    """
    try:
        sync_session = getattr(db, "_session", db)
        user = sync_session.query(Utilisateur).filter(Utilisateur.IdentifiantUtilisateur == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Utilisateur {user_id} non trouvé",
            )

        # Pour maintenant, retourner un message instructif
        # Une vraie réparation nécessite une logique métier complexe
        service = DataIntegrityService(sync_session)
        report = service.verify_user_data_integrity(user_id)

        return {
            "success": True,
            "user_id": user_id,
            "message": "Vérification effectuée. Consultez le rapport pour les corrections nécessaires.",
            "errors_detected": len(report.errors),
            "critical_errors": len([e for e in report.errors if e.severity == "critical"]),
            "warnings": len([e for e in report.errors if e.severity == "warning"]),
            "suggestions": [e.suggestion for e in report.errors if e.suggestion],
            "timestamp": datetime.now().isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la tentative de réparation: {str(e)}",
        )
