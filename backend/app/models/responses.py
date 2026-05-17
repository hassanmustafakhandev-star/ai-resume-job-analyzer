"""
Pydantic response models.

Every endpoint returns one of these — never a raw dict.
Field names match exactly what the frontend expects.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ── Analysis ──────────────────────────────────────────────────


class SectionSuggestion(BaseModel):
    """A single section-level suggestion returned by the AI."""

    title: str
    feedback: str
    rewrite: Optional[str] = None


class AnalysisResult(BaseModel):
    """Full analysis result — returned from POST /analyze and GET /history/{id}."""

    id: str
    score: int = Field(..., ge=0, le=100)
    matchedSkills: List[str] = Field(default_factory=list)
    missingSkills: List[str] = Field(default_factory=list)
    sections: List[SectionSuggestion] = Field(default_factory=list)
    jobTitle: Optional[str] = None
    companyName: Optional[str] = None
    createdAt: Optional[str] = None


# ── History ───────────────────────────────────────────────────


class HistoryItem(BaseModel):
    """Lightweight item for the dashboard history list."""

    id: str
    date: str
    jobTitle: str
    score: int = Field(..., ge=0, le=100)
    matchedSkills: List[str] = Field(default_factory=list)


class HistoryListResponse(BaseModel):
    """Paginated history response."""

    items: List[HistoryItem]
    total: int
    page: int
    limit: int


# ── Share ─────────────────────────────────────────────────────


class ShareResponse(BaseModel):
    """Returned when a share link is created."""

    share_url: str
    expires_at: str


class SharedAnalysisView(BaseModel):
    """Public view of a shared analysis — stripped of internal fields."""

    id: str
    score: int = Field(..., ge=0, le=100)
    matchedSkills: List[str] = Field(default_factory=list)
    missingSkills: List[str] = Field(default_factory=list)
    sections: List[SectionSuggestion] = Field(default_factory=list)
    jobTitle: Optional[str] = None
    companyName: Optional[str] = None
    createdAt: Optional[str] = None


# ── Auth / Profile ────────────────────────────────────────────


class UserProfile(BaseModel):
    """Current user profile."""

    id: str
    email: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    analyses_count: int = 0
    created_at: Optional[str] = None


# ── Generic ───────────────────────────────────────────────────


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = "ok"


class ErrorResponse(BaseModel):
    """Standard error envelope."""

    detail: str
    retry_after_seconds: Optional[int] = None
