"""
Dépendances FastAPI communes
=============================
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import validate_token_not_blacklisted
from app.models.user import Utilisateur

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Utilisateur:
    """Récupère l'utilisateur courant depuis le token JWT."""
    payload = validate_token_not_blacklisted(token)
    user_id = payload.get("sub")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )
    
    result = await db.execute(
        select(Utilisateur).where(
            Utilisateur.IdentifiantUtilisateur == int(user_id)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur non trouvé"
        )
    
    return user


async def get_current_active_user(
    current_user: Utilisateur = Depends(get_current_user)
) -> Utilisateur:
    """Vérifie que l'utilisateur est actif."""
    if not current_user.EstActif or current_user.Statut == "suspendu":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé ou suspendu"
        )
    return current_user


async def get_current_admin_user(
    current_user: Utilisateur = Depends(get_current_active_user)
) -> Utilisateur:
    """Vérifie que l'utilisateur est admin."""
    if current_user.TypeUtilisateur != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user


async def get_current_owner_user(
    current_user: Utilisateur = Depends(get_current_active_user)
) -> Utilisateur:
    """Vérifie que l'utilisateur est propriétaire ou admin."""
    if current_user.TypeUtilisateur not in ["proprietaire", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux propriétaires"
        )
    return current_user
