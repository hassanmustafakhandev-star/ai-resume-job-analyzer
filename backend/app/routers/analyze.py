"""
Analyze router — core AI analysis endpoints.

POST /analyze        — authenticated, saves to DB
POST /analyze/guest  — unauthenticated, rate-limited, no save
"""

import logging
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Request,
    UploadFile,
    status,
)
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings
from app.database import get_supabase_admin
from app.middleware.auth_middleware import (
    AuthenticatedUser,
    get_current_user,
)
from app.middleware.rate_limit import limiter
from app.models.requests import AnalyzeTextRequest
from app.models.responses import AnalysisResult, ErrorResponse, SectionSuggestion
from app.services import ai_service, pdf_service, scraper_service
from app.utils.helpers import sanitize_text, truncate_jd_snippet, utc_now_iso

logger = logging.getLogger("electric_resume.analyze")

router = APIRouter(prefix="/analyze", tags=["Analysis"])


def _key_func_user(request: Request) -> str:
    """Rate-limit key: use user ID from state if available, else IP."""
    user = getattr(request.state, "user", None)
    if user:
        return f"user:{user.id}"
    return get_remote_address(request)


def _build_result(analysis_id: str, ai_output: dict, created_at: str) -> AnalysisResult:
    """Convert raw AI output dict to the frontend-compatible AnalysisResult model."""
    sections = []
    for sec in ai_output.get("sections", []):
        sections.append(SectionSuggestion(
            title=sec.get("title", ""),
            feedback=sec.get("feedback", ""),
            rewrite=sec.get("rewrite"),
        ))

    return AnalysisResult(
        id=analysis_id,
        score=ai_output.get("match_score", 0),
        matchedSkills=ai_output.get("matched_skills", []),
        missingSkills=ai_output.get("missing_skills", []),
        sections=sections,
        jobTitle=ai_output.get("job_title"),
        companyName=ai_output.get("company_name"),
        createdAt=created_at,
    )


@router.post(
    "",
    response_model=AnalysisResult,
    summary="Analyze resume (authenticated)",
    description=(
        "Submit a resume (text or PDF) and a job description (text or URL) "
        "for AI-powered analysis. Results are saved to the user's history."
    ),
    responses={
        401: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
@limiter.limit("20/hour", key_func=_key_func_user)
async def analyze_authenticated(
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
    resume_file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    jd_text: Optional[str] = Form(None),
    jd_url: Optional[str] = Form(None),
) -> AnalysisResult:
    """Authenticated analysis — extracts, analyzes, and saves to DB."""
    settings = get_settings()

    # Store user on request.state for rate-limit key
    request.state.user = user

    # ── Resolve resume text ──────────────────────────────────
    final_resume_text = ""

    if resume_file and resume_file.filename:
        # Validate MIME type
        if resume_file.content_type != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Only PDF files are accepted.",
            )

        content = await resume_file.read()

        # Validate size
        if len(content) > settings.max_pdf_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"PDF exceeds maximum size of {settings.MAX_PDF_SIZE_MB}MB.",
            )

        try:
            final_resume_text = await pdf_service.extract_text(content)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            )
    elif resume_text:
        final_resume_text = sanitize_text(resume_text)
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either a resume PDF or resume text.",
        )

    if not final_resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resume content is empty after processing.",
        )

    # ── Resolve JD text ──────────────────────────────────────
    final_jd_text = ""

    if jd_text:
        final_jd_text = sanitize_text(jd_text)
    elif jd_url:
        try:
            final_jd_text = await scraper_service.fetch_jd(jd_url)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either job description text or a URL.",
        )

    if not final_jd_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Job description is empty after processing.",
        )

    # ── Run AI analysis ──────────────────────────────────────
    try:
        ai_output = await ai_service.analyze(final_resume_text, final_jd_text)
    except Exception as exc:
        logger.error("AI analysis failed for user %s: %s", user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI analysis service is temporarily unavailable. Please try again.",
        )

    # ── Save to database ─────────────────────────────────────
    db = get_supabase_admin()

    # Build suggestions JSONB from sections
    suggestions_jsonb = {}
    for sec in ai_output.get("sections", []):
        key = sec.get("title", "").lower().replace(" ", "_")
        suggestions_jsonb[key] = {
            "issue": sec.get("feedback", ""),
            "improvement": sec.get("rewrite", ""),
        }

    insert_data = {
        "user_id": user.id,
        "job_title": ai_output.get("job_title"),
        "company_name": ai_output.get("company_name"),
        "score": ai_output.get("match_score", 0),
        "matched_skills": ai_output.get("matched_skills", []),
        "missing_skills": ai_output.get("missing_skills", []),
        "suggestions": suggestions_jsonb,
        "jd_snippet": truncate_jd_snippet(final_jd_text),
        "is_public": False,
    }

    result = db.table("analyses").insert(insert_data).execute()

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save analysis.",
        )

    saved = result.data[0]
    created_at = saved.get("created_at", utc_now_iso())

    return _build_result(saved["id"], ai_output, created_at)


@router.post(
    "/guest",
    response_model=AnalysisResult,
    summary="Analyze resume (guest)",
    description=(
        "Guest analysis — rate-limited to 3 per day per IP. "
        "Results are NOT saved to the database."
    ),
    responses={
        422: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        503: {"model": ErrorResponse},
    },
)
@limiter.limit("3/day")
async def analyze_guest(
    request: Request,
    resume_text: str = Form(...),
    jd_text: Optional[str] = Form(None),
    jd_url: Optional[str] = Form(None),
) -> AnalysisResult:
    """Guest analysis — no auth required, no database save, strict rate limit."""
    # ── Validate inputs ──────────────────────────────────────
    final_resume_text = sanitize_text(resume_text)
    if len(final_resume_text) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Resume text must be at least 50 characters.",
        )

    final_jd_text = ""
    if jd_text:
        final_jd_text = sanitize_text(jd_text)
    elif jd_url:
        try:
            final_jd_text = await scraper_service.fetch_jd(jd_url)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(exc),
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide either job description text or a URL.",
        )

    if not final_jd_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Job description is empty.",
        )

    # ── Run AI analysis ──────────────────────────────────────
    try:
        ai_output = await ai_service.analyze(final_resume_text, final_jd_text)
    except Exception as exc:
        logger.error("Guest AI analysis failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI analysis service is temporarily unavailable. Please try again.",
        )

    import uuid
    temp_id = str(uuid.uuid4())

    return _build_result(temp_id, ai_output, utc_now_iso())
