"""
History router — CRUD for a user's analysis history.

GET    /history              — paginated list
GET    /history/{id}         — single analysis (ownership verified)
DELETE /history/{id}         — delete (ownership verified)
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from slowapi.util import get_remote_address

from app.database import get_supabase_admin
from app.middleware.auth_middleware import AuthenticatedUser, get_current_user
from app.middleware.rate_limit import limiter
from app.models.responses import (
    AnalysisResult,
    ErrorResponse,
    HistoryItem,
    HistoryListResponse,
    SectionSuggestion,
)
from app.utils.helpers import format_date_short
from app.utils.security import verify_ownership

logger = logging.getLogger("electric_resume.history")

router = APIRouter(prefix="/history", tags=["History"])


def _key_func_user(request: Request) -> str:
    """Rate-limit key: user ID."""
    user = getattr(request.state, "user", None)
    if user:
        return f"user:{user.id}"
    return get_remote_address(request)


@router.get(
    "",
    response_model=HistoryListResponse,
    summary="List analysis history",
    description=(
        "Returns a paginated list of the current user's past analyses. "
        "Supports search by job title and pagination."
    ),
    responses={401: {"model": ErrorResponse}},
)
@limiter.limit("60/hour", key_func=_key_func_user)
async def list_history(
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    search: str = Query("", max_length=200, description="Search by job title"),
) -> HistoryListResponse:
    """Fetch the current user's analysis history with pagination and search."""
    request.state.user = user
    db = get_supabase_admin()

    offset = (page - 1) * limit

    # Build query
    query = (
        db.table("analyses")
        .select("id, job_title, score, matched_skills, created_at", count="exact")
        .eq("user_id", user.id)
        .order("created_at", desc=True)
    )

    if search:
        query = query.ilike("job_title", f"%{search}%")

    query = query.range(offset, offset + limit - 1)
    result = query.execute()

    total = result.count if result.count is not None else len(result.data)

    items = []
    for row in result.data:
        items.append(HistoryItem(
            id=row["id"],
            date=format_date_short(row.get("created_at", "")),
            jobTitle=row.get("job_title") or "Untitled Role",
            score=row.get("score", 0),
            matchedSkills=row.get("matched_skills") or [],
        ))

    return HistoryListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.get(
    "/{analysis_id}",
    response_model=AnalysisResult,
    summary="Get single analysis",
    description="Returns the full analysis result. Ownership is verified — returns 403 if not yours.",
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
    },
)
async def get_analysis(
    request: Request,
    analysis_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> AnalysisResult:
    """Fetch a single analysis by ID with ownership verification."""
    db = get_supabase_admin()

    result = (
        db.table("analyses")
        .select("*")
        .eq("id", analysis_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )

    analysis = result.data[0]

    # IDOR prevention — 403 not 404
    verify_ownership(analysis["user_id"], user.id)

    # Reconstruct sections from the suggestions JSONB
    sections = []
    suggestions = analysis.get("suggestions") or {}
    for key, val in suggestions.items():
        title = key.replace("_", " ").title()
        sections.append(SectionSuggestion(
            title=title,
            feedback=val.get("issue", ""),
            rewrite=val.get("improvement") or None,
        ))

    return AnalysisResult(
        id=analysis["id"],
        score=analysis.get("score", 0),
        matchedSkills=analysis.get("matched_skills") or [],
        missingSkills=analysis.get("missing_skills") or [],
        sections=sections,
        jobTitle=analysis.get("job_title"),
        companyName=analysis.get("company_name"),
        createdAt=analysis.get("created_at"),
    )


@router.delete(
    "/{analysis_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete analysis",
    description="Permanently delete an analysis. Ownership is verified.",
    responses={
        401: {"model": ErrorResponse},
        403: {"model": ErrorResponse},
    },
)
async def delete_analysis(
    request: Request,
    analysis_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
) -> None:
    """Delete an analysis by ID with ownership verification."""
    db = get_supabase_admin()

    # First fetch to verify ownership
    result = (
        db.table("analyses")
        .select("user_id")
        .eq("id", analysis_id)
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found.",
        )

    verify_ownership(result.data[0]["user_id"], user.id)

    # Delete
    db.table("analyses").delete().eq("id", analysis_id).execute()
    logger.info("User %s deleted analysis %s", user.id, analysis_id)
    return None
