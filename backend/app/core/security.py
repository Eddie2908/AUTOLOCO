"""
Fonctions de sécurité et gestion JWT
====================================

Module centralisant la gestion des tokens JWT, hashing des mots de passe,
et vérification de la blacklist.
"""

import jwt
from jwt import PyJWTError
import bcrypt
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from redis import Redis

from app.core.config import settings


# ============================================================
# REDIS CLIENT (lazy init — avoids crash if Redis is down at startup)
# ============================================================

_redis_client: Optional[Redis] = None


def _get_redis() -> Optional[Redis]:
    """Return a Redis client, creating it lazily on first call."""
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=5,
            )
            _redis_client.ping()
        except Exception as e:
            print(f"[WARNING] Redis connection failed: {e}")
            _redis_client = None
    return _redis_client


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:
    """Hash un mot de passe avec bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie qu'un mot de passe correspond au hash."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )


# ============================================================
# JWT TOKEN MANAGEMENT
# ============================================================

def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Crée un access token JWT.
    
    Args:
        data: Données à encoder (user_id, email, type)
        expires_delta: Durée de validité personnalisée
    
    Returns:
        Token JWT encodé
    """
    to_encode = data.copy()
    
    # Expiration
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # JTI unique pour blacklist
    jti = str(uuid.uuid4())
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": jti,
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Crée un refresh token JWT.
    
    Args:
        data: Données à encoder (user_id)
    
    Returns:
        Refresh token JWT encodé
    """
    to_encode = data.copy()
    
    expire = datetime.utcnow() + timedelta(
        days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
    )
    
    jti = str(uuid.uuid4())
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": jti,
        "type": "refresh"
    })
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.JWT_ALGORITHM
    )
    
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """
    Décode et valide un token JWT.
    
    Args:
        token: Token JWT à décoder
    
    Returns:
        Payload du token
    
    Raises:
        HTTPException: Si le token est invalide ou expiré
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré"
        )
    except PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide"
        )


# ============================================================
# TOKEN BLACKLIST
# ============================================================

def add_token_to_blacklist(
    jti: str,
    user_id: int,
    token_type: str,
    exp: datetime,
    reason: str = "logout",
    ip_address: Optional[str] = None
) -> bool:
    """
    Ajoute un token à la blacklist Redis.
    
    Args:
        jti: JWT ID unique du token
        user_id: ID de l'utilisateur
        token_type: 'access' ou 'refresh'
        exp: Date d'expiration du token
        reason: Raison de la révocation
        ip_address: Adresse IP de la requête
    
    Returns:
        True si succès
    """
    try:
        # Calculer le TTL (temps restant avant expiration)
        ttl_seconds = int((exp - datetime.utcnow()).total_seconds())
        
        if ttl_seconds <= 0:
            # Token déjà expiré, pas besoin de blacklist
            return True
        
        # Clé Redis
        key = f"blacklist:{jti}"
        
        # Valeur JSON
        value = {
            "user_id": user_id,
            "type": token_type,
            "revoked_at": datetime.utcnow().isoformat(),
            "reason": reason,
            "ip": ip_address
        }
        
        # Stocker dans Redis avec TTL
        client = _get_redis()
        if client is None:
            return False
        client.setex(
            key,
            ttl_seconds,
            str(value)
        )
        
        return True
        
    except Exception as e:
        print(f"[ERROR] Blacklist Redis failed: {e}")
        # En cas d'échec Redis, on continue (fallback sur DB)
        return False


def is_token_blacklisted(jti: str) -> bool:
    """
    Vérifie si un token est dans la blacklist.
    
    Args:
        jti: JWT ID du token
    
    Returns:
        True si le token est blacklisté
    """
    try:
        client = _get_redis()
        if client is None:
            return False
        key = f"blacklist:{jti}"
        return client.exists(key) > 0
    except Exception as e:
        print(f"[ERROR] Blacklist check failed: {e}")
        # En cas d'échec Redis, on suppose que le token est valide
        # (le middleware vérifiera la DB en fallback)
        return False


def remove_token_from_blacklist(jti: str) -> bool:
    """
    Retire un token de la blacklist (usage rare, surtout pour tests).
    
    Args:
        jti: JWT ID du token
    
    Returns:
        True si succès
    """
    try:
        client = _get_redis()
        if client is None:
            return False
        key = f"blacklist:{jti}"
        client.delete(key)
        return True
    except Exception:
        return False


# ============================================================
# TOKEN VALIDATION MIDDLEWARE
# ============================================================

def validate_token_not_blacklisted(token: str) -> Dict[str, Any]:
    """
    Valide un token et vérifie qu'il n'est pas blacklisté.
    
    Args:
        token: Token JWT
    
    Returns:
        Payload du token
    
    Raises:
        HTTPException: Si le token est invalide ou blacklisté
    """
    # 1. Décoder le token
    payload = decode_token(token)
    
    # 2. Vérifier la blacklist
    jti = payload.get("jti")
    if not jti:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide (pas de JTI)"
        )
    
    if is_token_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token révoqué (déconnexion effectuée)"
        )
    
    return payload
