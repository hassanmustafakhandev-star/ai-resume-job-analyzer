"""
Application configuration loaded from environment variables.

Uses pydantic-settings to validate and parse all required env vars
at startup. Missing required values will cause a clear error on boot.
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the Electric Resume backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Supabase ──────────────────────────────────────────────
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str

    # ── ML Model (local, no API key required) ─────────────────
    ML_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"

    # ── Redis ─────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── Security ──────────────────────────────────────────────
    JWT_SECRET: str = "change-me"

    # ── Environment ───────────────────────────────────────────
    ENVIRONMENT: str = "dev"

    # ── Limits ────────────────────────────────────────────────
    MAX_PDF_SIZE_MB: int = 5

    # ── CORS ──────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse the comma-separated ALLOWED_ORIGINS string into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    @property
    def max_pdf_size_bytes(self) -> int:
        """Return the max PDF size in bytes."""
        return self.MAX_PDF_SIZE_MB * 1024 * 1024

    @property
    def is_production(self) -> bool:
        """Return True if running in production."""
        return self.ENVIRONMENT.lower() == "prod"


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton accessor for application settings."""
    return Settings()
