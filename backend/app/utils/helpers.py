"""
Shared helper functions.
"""

import re
from datetime import datetime, timezone


def sanitize_text(text: str, max_length: int = 15000) -> str:
    """Strip HTML tags and limit character count.

    Args:
        text: Raw input text that may contain HTML.
        max_length: Maximum allowed characters.

    Returns:
        Cleaned, truncated plain text.
    """
    # Remove HTML tags
    cleaned = re.sub(r"<[^>]+>", "", text)
    # Collapse whitespace
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned[:max_length]


def truncate_jd_snippet(jd_text: str, max_length: int = 300) -> str:
    """Return the first `max_length` characters of a job description for display.

    Args:
        jd_text: Full job description text.
        max_length: Maximum snippet length.

    Returns:
        Truncated snippet with ellipsis if needed.
    """
    if len(jd_text) <= max_length:
        return jd_text
    return jd_text[:max_length].rstrip() + "…"


def utc_now_iso() -> str:
    """Return the current UTC time as an ISO 8601 string."""
    return datetime.now(timezone.utc).isoformat()


def format_date_short(iso_string: str) -> str:
    """Convert an ISO timestamp to YYYY-MM-DD format for the frontend.

    Args:
        iso_string: ISO 8601 datetime string.

    Returns:
        Date-only string like '2024-04-18'.
    """
    try:
        dt = datetime.fromisoformat(iso_string.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d")
    except (ValueError, AttributeError):
        return iso_string
