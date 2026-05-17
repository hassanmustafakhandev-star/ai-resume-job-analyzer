"""
Share router — create and view shareable analysis links.

POST /share/{analysis_id}   — create a share link (authenticated)
GET  /share/view/{token}    — view a shared analysis (public)
"""

import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi.util import get_remote_address

from app.database import get_supabase_admin
from app.middleware.auth_middleware import AuthenticatedUser, get_current_user
from app.middleware.rate_limit import limiter
from app.models.responses import (
    ErrorResponse,
    SectionSuggestion,
    ShareResponse,
    SharedAnalysisView,
)
from app.utils.security import verify_ownership

logger = logging.getLogger("electric_resume.share")

router = APIRouter(prefix="/share", tags=["Share"])

SHARE_EXPIRY_DAYS = 7


def _key_func_user(request: Request) -> str:
    """Rate-limit key: user ID."""
    user = getattr(request.state, "user", None)
    if user:
        return f"user:{user.id}"
    return get_remote_address(request)


@router.post(
    "/{analysis_id}",
    response_model=ShareResponse,
    summary="Create share link",
    description=(
        "Generate a cryptographically secure share link for an analysis. "
        "The link expires after 7 days. Only the owner can create share links."
    ),
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
        404: {"model": ErrorResponse},
    },
)
@limiter.limit("10/hour", key_func=_key_func_user)
async def create_share_link(
    request: Request,
    analysis_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> ShareResponse:
    """Create a share link for the given analysis."""
    request.state.user = user
    db = get_supabase_admin()

    # Fetch analysis
    result = (
        db.table("analyses")
        .select("user_id, share_token, share_expires_at")
        .eq("id", analysis_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )

    analysis = result.data[0]
    verify_ownership(analysis["user_id"], user.id)

    # Generate token
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=SHARE_EXPIRY_DAYS)

    # Update analysis
    db.table("analyses").update({
        "share_token": token,
        "share_expires_at": expires_at.isoformat(),
        "is_public": True,
    }).eq("id", analysis_id).execute()

    share_url = f"https://electricresume.com/share/{token}"

    logger.info(
        "User %s created share link for analysis %s (expires %s)",
        user.id,
        analysis_id,
        expires_at.isoformat(),
    )

    return ShareResponse(
        share_url=share_url,
        expires_at=expires_at.isoformat(),
    )


@router.get(
    "/view/{token}",
    response_model=SharedAnalysisView,
    summary="View shared analysis",
    description=(
        "Public endpoint — view a shared analysis using its token. "
        "Returns 404 if the link is expired or invalid."
    ),
    responses={404: {"model": ErrorResponse}},
)
async def view_shared_analysis(
    request: Request,
    token: str,
) -> SharedAnalysisView:
    """Fetch a shared analysis by its share token (no auth required)."""
    db = get_supabase_admin()

    now_iso = datetime.now(timezone.utc).isoformat()

    result = (
        db.table("analyses")
        .select("*")
        .eq("share_token", token)
        .eq("is_public", True)
        .gte("share_expires_at", now_iso)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share link expired or not found.",
        )

    analysis = result.data[0]

    # Reconstruct sections from suggestions JSONB
    sections = []
    suggestions = analysis.get("suggestions") or {}
    for key, val in suggestions.items():
        title = key.replace("_", " ").title()
        sections.append(SectionSuggestion(
            title=title,
            feedback=val.get("issue", ""),
            rewrite=val.get("improvement") or None,
        ))

    return SharedAnalysisView(
        id=analysis["id"],
        score=analysis.get("score", 0),
        matchedSkills=analysis.get("matched_skills") or [],
        missingSkills=analysis.get("missing_skills") or [],
        sections=sections,
        jobTitle=analysis.get("job_title"),
        companyName=analysis.get("company_name"),
        createdAt=analysis.get("created_at"),
    )
