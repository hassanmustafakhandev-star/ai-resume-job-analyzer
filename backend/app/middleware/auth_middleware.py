"""
Authentication middleware — FastAPI dependency injection.

Provides `get_current_user` (required auth) and `get_optional_user` (guest-accessible).
"""

import logging
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.utils.security import decode_supabase_token

logger = logging.getLogger("electric_resume.auth")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


class AuthenticatedUser:
    """Lightweight representation of the authenticated user extracted from a JWT."""

    def __init__(self, user_id: str, email: str, role: str = "authenticated"):
        self.id = user_id
        self.email = email
        self.role = role


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
) -> AuthenticatedUser:
    """Verify the Bearer token and return an AuthenticatedUser.

    This is a required-auth dependency — raises 401 if no valid token.

    Args:
        token: JWT extracted from the Authorization header by OAuth2PasswordBearer.

    Returns:
        An AuthenticatedUser instance.

    Raises:
        HTTPException: 401 if the token is missing or invalid.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_supabase_token(token)
    user_id = payload.get("sub", "")
    email = payload.get("email", "")
    role = payload.get("role", "authenticated")

    logger.info("Authenticated user %s for request", user_id)
    return AuthenticatedUser(user_id=user_id, email=email, role=role)


async def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme),
) -> Optional[AuthenticatedUser]:
    """Attempt to verify the Bearer token, but allow anonymous access.

    Useful for guest-accessible routes where auth is optional.

    Args:
        token: JWT extracted from the Authorization header, or None.

    Returns:
        An AuthenticatedUser if a valid token was provided, otherwise None.
    """
    if not token:
        return None

    try:
        payload = decode_supabase_token(token)
        return AuthenticatedUser(
            user_id=payload.get("sub", ""),
            email=payload.get("email", ""),
            role=payload.get("role", "authenticated"),
        )
    except HTTPException:
        return None
