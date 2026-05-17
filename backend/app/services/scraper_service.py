"""
Scraper Service — fetch job descriptions from URLs.

Uses httpx for async HTTP and BeautifulSoup for HTML parsing.
"""

import logging

import httpx
from bs4 import BeautifulSoup

logger = logging.getLogger("electric_resume.scraper_service")

MAX_JD_CHARS = 5000
REQUEST_TIMEOUT = 8.0

# Common headers to avoid bot detection
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


async def fetch_jd(url: str) -> str:
    """Fetch and extract text content from a job description URL.

    Strips HTML tags, collapses whitespace, and truncates to MAX_JD_CHARS.

    Args:
        url: The URL to scrape.

    Returns:
        Plain text content of the job description.

    Raises:
        ValueError: If the URL is unreachable or returns no usable text.
    """
    try:
        async with httpx.AsyncClient(
            timeout=REQUEST_TIMEOUT,
            follow_redirects=True,
            headers=HEADERS,
        ) as client:
            response = await client.get(url)
            response.raise_for_status()
    except httpx.TimeoutException:
        logger.error("Timeout fetching JD from %s", url)
        raise ValueError(
            "The job description URL took too long to respond. "
            "Please paste the text instead."
        )
    except httpx.HTTPStatusError as exc:
        logger.error("HTTP error fetching JD from %s: %s", url, exc)
        raise ValueError(
            f"Could not fetch the job description (HTTP {exc.response.status_code}). "
            "Please paste the text instead."
        )
    except httpx.RequestError as exc:
        logger.error("Request error fetching JD from %s: %s", url, exc)
        raise ValueError(
            "Could not reach the job description URL. "
            "Please check the URL or paste the text instead."
        )

    # Parse HTML
    soup = BeautifulSoup(response.text, "html.parser")

    # Remove script and style elements
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    # Extract text
    text = soup.get_text(separator="\n", strip=True)

    if not text or len(text) < 50:
        raise ValueError(
            "Could not extract enough text from the URL. "
            "The page may require JavaScript. Please paste the text instead."
        )

    # Truncate
    if len(text) > MAX_JD_CHARS:
        text = text[:MAX_JD_CHARS]
        logger.info("JD text truncated to %d chars", MAX_JD_CHARS)

    logger.info("Scraped %d chars from %s", len(text), url)
    return text
