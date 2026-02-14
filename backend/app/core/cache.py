"""
Redis Cache Service
====================

Provides a simple cache layer with graceful fallback to no-op when Redis is unavailable.
Used to cache expensive queries like vehicle lists, analytics, and featured vehicles.
"""

import json
import hashlib
import logging
from typing import Any, Optional, Callable
from functools import wraps

from app.core.config import settings

logger = logging.getLogger(__name__)

# Attempt to import redis; gracefully degrade if not available
try:
    import redis
    _redis_client: Optional[redis.Redis] = None
    _REDIS_AVAILABLE = True
except ImportError:
    _redis_client = None
    _REDIS_AVAILABLE = False
    logger.warning("redis package not installed, caching disabled")


def get_redis() -> Optional[Any]:
    """Get or create a Redis connection. Returns None if Redis is unavailable."""
    global _redis_client

    if not _REDIS_AVAILABLE:
        return None

    if _redis_client is not None:
        return _redis_client

    try:
        _redis_client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=2,
            socket_timeout=2,
            retry_on_timeout=False,
        )
        # Quick connectivity test
        _redis_client.ping()
        logger.info("Redis cache connected successfully")
        return _redis_client
    except Exception as e:
        logger.warning(f"Redis not available, caching disabled: {e}")
        _redis_client = None
        return None


def make_cache_key(prefix: str, **kwargs) -> str:
    """Build a deterministic cache key from a prefix and keyword arguments."""
    sorted_params = json.dumps(kwargs, sort_keys=True, default=str)
    param_hash = hashlib.md5(sorted_params.encode()).hexdigest()[:12]
    return f"autoloco:{prefix}:{param_hash}"


async def cache_get(key: str) -> Optional[Any]:
    """Get a value from the cache. Returns None on miss or error."""
    client = get_redis()
    if client is None:
        return None
    try:
        raw = client.get(key)
        if raw is not None:
            return json.loads(raw)
    except Exception as e:
        logger.debug(f"Cache get error for {key}: {e}")
    return None


async def cache_set(key: str, value: Any, ttl: int = None) -> bool:
    """Set a value in the cache with an optional TTL (seconds). Returns True on success."""
    client = get_redis()
    if client is None:
        return False
    try:
        serialized = json.dumps(value, default=str)
        if ttl is None:
            ttl = settings.REDIS_CACHE_EXPIRE
        client.setex(key, ttl, serialized)
        return True
    except Exception as e:
        logger.debug(f"Cache set error for {key}: {e}")
        return False


async def cache_delete(key: str) -> bool:
    """Delete a specific cache key."""
    client = get_redis()
    if client is None:
        return False
    try:
        client.delete(key)
        return True
    except Exception:
        return False


async def cache_invalidate_prefix(prefix: str) -> int:
    """Invalidate all keys matching a prefix pattern. Returns count of deleted keys."""
    client = get_redis()
    if client is None:
        return 0
    try:
        pattern = f"autoloco:{prefix}:*"
        keys = client.keys(pattern)
        if keys:
            return client.delete(*keys)
        return 0
    except Exception as e:
        logger.debug(f"Cache invalidate error for prefix {prefix}: {e}")
        return 0


# Default TTLs for different data types (seconds)
CACHE_TTL_SHORT = 60           # 1 minute  - real-time metrics
CACHE_TTL_MEDIUM = 300         # 5 minutes - vehicle lists, search results
CACHE_TTL_LONG = 1800          # 30 minutes - analytics, featured vehicles
CACHE_TTL_VERY_LONG = 3600     # 1 hour    - static reference data (cities, categories)
