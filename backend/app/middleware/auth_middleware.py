"""
Middleware d'authentification et d'autorisation — DÉPRÉCIÉ
=========================================================

IMPORTANT: Ce module n'est plus utilisé.
L'authentification se fait via les dépendances FastAPI dans:
    app.api.dependencies (get_current_user, get_current_active_user, get_current_admin_user)

Ce fichier est conservé uniquement pour éviter les erreurs d'import si du code
legacy y fait référence. Pour toute nouvelle fonctionnalité d'auth, utiliser
les dépendances FastAPI standard.
"""

import warnings

from app.api.dependencies import (  # noqa: F401 — re-export for backward compat
    get_current_user,
    get_current_active_user,
    get_current_admin_user,
)

warnings.warn(
    "app.middleware.auth_middleware is deprecated. "
    "Use app.api.dependencies (get_current_user, etc.) instead.",
    DeprecationWarning,
    stacklevel=2,
)
