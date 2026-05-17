"""
PDF Service — extract plain text from uploaded PDF files using PyMuPDF.

Runs PyMuPDF (fitz) operations in a thread pool to avoid blocking the async event loop
and to prevent C-extension memory stream corruption ('document closed' errors).
"""

import asyncio
import logging
from typing import BinaryIO

import fitz  # PyMuPDF

logger = logging.getLogger("electric_resume.pdf_service")


def _extract_text_sync(file_content: bytes) -> str:
    """Synchronous PDF extraction running in a separate thread."""
    if not file_content:
        raise ValueError("The uploaded PDF file is empty.")

    try:
        with fitz.open(stream=file_content, filetype="pdf") as doc:
            if doc.page_count == 0:
                raise ValueError("The uploaded PDF has no pages.")

            pages_text = []
            for page in doc:
                text = page.get_text("text")
                if text:
                    pages_text.append(text.strip())

            full_text = "\n\n".join(pages_text)
    except ValueError:
        raise
    except Exception as exc:
        logger.error("Failed to open or process PDF: %s", exc)
        raise ValueError("The uploaded file is not a valid PDF or is corrupted.") from exc

    if not full_text.strip():
        raise ValueError(
            "Could not extract text from the PDF. "
            "It may be a scanned image — please paste your resume text instead."
        )

    logger.info(
        "Extracted %d characters from PDF",
        len(full_text),
    )
    return full_text


async def extract_text(file_content: bytes) -> str:
    """Extract plain text from a PDF file's binary content asynchronously.

    Uses PyMuPDF (fitz) executed in a thread pool for fast, reliable extraction.

    Args:
        file_content: Raw bytes of the uploaded PDF file.

    Returns:
        Extracted plain text, stripped and concatenated.

    Raises:
        ValueError: If the PDF is empty, corrupted, or unreadable.
    """
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _extract_text_sync, file_content)

