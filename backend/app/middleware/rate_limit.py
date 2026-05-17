"""
Rate limiting configuration using slowapi.

Uses in-memory storage for development and Redis for production.
"""

import logging

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings

logger = logging.getLogger("electric_resume.rate_limit")


def create_limiter() -> Limiter:
    """Create and configure the slowapi Limiter instance.

    Uses in-memory storage in development (no Redis needed).
    Uses Redis in production for distributed rate limiting.

    Returns:
        A configured Limiter instance.
    """
    settings = get_settings()

    if settings.is_production:
        # Production: use Redis for distributed rate limiting
        storage_uri = settings.REDIS_URL
        logger.info("Rate limiter using Redis: %s", storage_uri)
    else:
        # Development: use in-memory storage (no Redis required)
        storage_uri = "memory://"
        logger.info("Rate limiter using in-memory storage (dev mode)")

    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=["100/hour"],
        storage_uri=storage_uri,
    )

    return limiter


# Module-level singleton
limiter = create_limiter()

