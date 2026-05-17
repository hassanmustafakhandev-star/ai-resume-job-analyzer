"""
Auth router — login, logout, current user, and token refresh.

Supabase handles the actual OAuth/magic-link flow on the client side.
These endpoints wrap Supabase admin SDK calls for server-side token
verification and profile retrieval.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.middleware.auth_middleware import get_current_user, AuthenticatedUser
from app.middleware.rate_limit import limiter
from app.database import get_supabase_admin
from app.models.responses import UserProfile, ErrorResponse

logger = logging.getLogger("electric_resume.auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get current user profile",
    description="Returns the profile of the currently authenticated user.",
    responses={401: {"model": ErrorResponse}},
)
async def get_me(
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
) -> UserProfile:
    """Fetch the current user's profile from the profiles table."""
    db = get_supabase_admin()

    result = db.table("profiles").select("*").eq("id", user.id).execute()

    if not result.data:
        logger.warning("Profile not found for user %s — creating one", user.id)
        # Auto-create profile if trigger missed (defensive)
        db.table("profiles").insert({
            "id": user.id,
            "email": user.email,
        }).execute()
        result = db.table("profiles").select("*").eq("id", user.id).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile could not be created.",
        )

    profile = result.data[0]
    return UserProfile(
        id=profile["id"],
        email=profile["email"],
        display_name=profile.get("display_name"),
        avatar_url=profile.get("avatar_url"),
        analyses_count=profile.get("analyses_count", 0),
        created_at=profile.get("created_at"),
    )


@router.put(
    "/me",
    response_model=UserProfile,
    summary="Update current user profile",
    description="Update display name or avatar URL for the current user.",
    responses={401: {"model": ErrorResponse}},
)
async def update_me(
    request: Request,
    display_name: str | None = None,
    avatar_url: str | None = None,
    user: AuthenticatedUser = Depends(get_current_user),
) -> UserProfile:
    """Update the current user's profile fields."""
    db = get_supabase_admin()

    update_data = {}
    if display_name is not None:
        update_data["display_name"] = display_name
    if avatar_url is not None:
        update_data["avatar_url"] = avatar_url

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update.",
        )

    db.table("profiles").update(update_data).eq("id", user.id).execute()

    # Return updated profile
    result = db.table("profiles").select("*").eq("id", user.id).execute()
    profile = result.data[0]
    return UserProfile(
        id=profile["id"],
        email=profile["email"],
        display_name=profile.get("display_name"),
        avatar_url=profile.get("avatar_url"),
        analyses_count=profile.get("analyses_count", 0),
        created_at=profile.get("created_at"),
    )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout current user",
    description="Server-side logout — invalidates the session if needed. "
    "The client should also clear the local token.",
)
async def logout(
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
) -> None:
    """Log out the current user.

    Supabase manages sessions client-side, so this is primarily
    for audit logging and future session invalidation.
    """
    logger.info("User %s logged out", user.id)
    return None
