"""
Configuration de la base de données PostgreSQL
================================================

Setup de SQLAlchemy avec support asynchrone pour PostgreSQL.
"""

from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# NOTE: We use a sync driver (psycopg2) and a small async wrapper that runs DB calls in a threadpool.
# This preserves the async interface used across services (await db.execute(...), await session.commit(), etc.)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from starlette.concurrency import run_in_threadpool

# Create a synchronous engine using psycopg2
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,
)

# Sync session factory
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)

# Base pour les modèles
Base = declarative_base()


class AsyncSessionSyncWrapper:
    """Minimal wrapper that exposes async methods but delegates to a sync Session
    executed in a threadpool. It supports the common methods used across the codebase
    (execute, scalars, scalar, commit, rollback, close, add, flush, refresh).
    """

    def __init__(self, session):
        self._session = session

    async def execute(self, *args, **kwargs):
        return await run_in_threadpool(self._session.execute, *args, **kwargs)

    async def scalars(self, *args, **kwargs):
        result = await self.execute(*args, **kwargs)
        return result.scalars()

    async def scalar(self, *args, **kwargs):
        result = await self.execute(*args, **kwargs)
        return result.scalar()

    async def add(self, *args, **kwargs):
        return await run_in_threadpool(self._session.add, *args, **kwargs)

    async def flush(self):
        return await run_in_threadpool(self._session.flush)

    async def refresh(self, *args, **kwargs):
        return await run_in_threadpool(self._session.refresh, *args, **kwargs)

    async def commit(self):
        return await run_in_threadpool(self._session.commit)

    async def rollback(self):
        return await run_in_threadpool(self._session.rollback)

    async def delete(self, *args, **kwargs):
        return await run_in_threadpool(self._session.delete, *args, **kwargs)

    async def close(self):
        return await run_in_threadpool(self._session.close)

    def __getattr__(self, name):
        """Forward any unhandled attribute access to the underlying sync session.

        This allows sync ORM methods like ``db.query()``, ``db.get()``, etc.
        to work transparently when called from sync code paths or when the
        caller does not need to ``await`` the result (e.g. building a query
        object which is lazy).
        """
        return getattr(self._session, name)

    # Support async context management
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        if exc:
            await self.rollback()
        else:
            await self.commit()
        await self.close()


# Dependency pour obtenir une session de base de données (async interface compatible)
async def get_db() -> AsyncGenerator[AsyncSessionSyncWrapper, None]:
    """Fournit une wrapper session utilisable avec `async with` et `await` dans le code.

    Exemple d'usage inchangé :
        async def endpoint(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User))
            return result.scalars().all()
    """
    # Create a sync session in a thread (so we don't block the event loop during creation)
    sync_session = await run_in_threadpool(SessionLocal)
    session = AsyncSessionSyncWrapper(sync_session)

    try:
        yield session
    except Exception as e:
        await session.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        await session.close()


# Utility pour transactions (préserve l'API async)
async def execute_with_transaction(session: AsyncSessionSyncWrapper, operation):
    try:
        result = await operation(session)
        await session.commit()
        return result
    except Exception as e:
        await session.rollback()
        logger.error(f"Transaction failed: {e}")
        raise
