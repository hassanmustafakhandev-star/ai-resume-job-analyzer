"""
Pydantic request models for every endpoint.

All user-supplied data is validated here before reaching business logic.
"""

from typing import Optional

from pydantic import BaseModel, Field


class AnalyzeTextRequest(BaseModel):
    """JSON body for the text-based analysis endpoint."""

    resume_text: str = Field(
        ...,
        min_length=50,
        max_length=15000,
        description="Plain-text resume content.",
    )
    jd_text: Optional[str] = Field(
        None,
        max_length=15000,
        description="Plain-text job description. Provide this OR jd_url.",
    )
    jd_url: Optional[str] = Field(
        None,
        max_length=2048,
        description="URL to scrape the job description from. Provide this OR jd_text.",
    )


class ShareCreateRequest(BaseModel):
    """Body for creating a share link (no extra fields needed — analysis_id is in path)."""
    pass


class ProfileUpdateRequest(BaseModel):
    """Fields a user may update on their own profile."""

    display_name: Optional[str] = Field(None, max_length=100)
    avatar_url: Optional[str] = Field(None, max_length=2048)
