"""
Token verification and ownership utilities.

Uses Supabase's own auth.getUser() endpoint for token verification.
This is algorithm-independent (works with HS256, ES256, RS256) and handles
key rotation automatically — the officially recommended approach by Supabase.
"""

import logging
from fastapi import HTTPException, status
from app.config import get_settings
from app.database import get_supabase_admin

logger = logging.getLogger("electric_resume.security")


def decode_supabase_token(token: str) -> dict:
    """Verify a Supabase JWT by calling Supabase Auth server directly.

    Instead of decoding the JWT locally (which requires matching algorithms
    and key formats), we send the token to Supabase's auth.getUser() endpoint.
    Supabase validates the signature, expiration, and returns the user data.

    This approach:
    - Works with ANY algorithm (HS256, ES256, RS256)
    - Handles key rotation automatically
    - Is officially recommended by Supabase docs

    Args:
        token: The raw JWT string (without 'Bearer ' prefix).

    Returns:
        A dict with at minimum 'sub' (user ID) and 'email'.

    Raises:
        HTTPException: 401 if the token is invalid, expired, or malformed.
    """
    settings = get_settings()

    try:
        from supabase import create_client
        # Create a temporary client authenticated with the user's token
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        # Use the token to get the user — this verifies the token server-side
        response = client.auth.get_user(token)

        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = response.user
        logger.info("Token verified via Supabase for user %s", user.id)

        # Return a payload dict compatible with what auth_middleware expects
        return {
            "sub": str(user.id),
            "email": user.email or "",
            "role": user.role or "authenticated",
        }

    except HTTPException:
        raise
    except Exception as exc:
        logger.warning(
            "Supabase token verification failed: %s | token_prefix=%s",
            exc,
            token[:20] + "..." if len(token) > 20 else token,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_ownership(resource_user_id: str, current_user_id: str) -> None:
    """Raise 403 if the current user does not own the resource.

    Args:
        resource_user_id: The user_id stored on the resource row.
        current_user_id: The authenticated user's ID from the token.

    Raises:
        HTTPException: 403 Forbidden if IDs don't match.
    """
    if resource_user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource.",
        )
