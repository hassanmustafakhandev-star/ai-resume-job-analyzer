"""
Pytest configuration and shared fixtures.

Provides a test client, mock user authentication, and mock Supabase responses.
"""

import os
import pytest
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

# Set env vars BEFORE importing the app
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-anon-key")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-key")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-for-testing-only")
os.environ.setdefault("ENVIRONMENT", "dev")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379")

from app.main import app
from app.middleware.auth_middleware import AuthenticatedUser, get_current_user


TEST_USER_ID = "00000000-0000-0000-0000-000000000001"
TEST_USER_EMAIL = "test@electricresume.com"


@pytest.fixture
def test_user() -> AuthenticatedUser:
    """A mock authenticated user for testing."""
    return AuthenticatedUser(
        user_id=TEST_USER_ID,
        email=TEST_USER_EMAIL,
        role="authenticated",
    )


@pytest.fixture
def mock_supabase_admin():
    """Mock the Supabase admin client at ALL router import locations.

    The key insight: each router does `from app.database import get_supabase_admin`,
    so we must patch it where it's used — in each router module — not just
    in app.database.
    """
    mock_db = MagicMock()

    with patch("app.routers.auth.get_supabase_admin", return_value=mock_db), \
         patch("app.routers.analyze.get_supabase_admin", return_value=mock_db), \
         patch("app.routers.history.get_supabase_admin", return_value=mock_db), \
         patch("app.routers.share.get_supabase_admin", return_value=mock_db), \
         patch("app.database.get_supabase_admin", return_value=mock_db):
        yield mock_db


@pytest.fixture
def client(test_user, mock_supabase_admin) -> TestClient:
    """FastAPI test client with auth dependency overridden.

    All requests will be treated as authenticated by the test user.
    The mock_supabase_admin fixture is included so DB calls don't hit a real server.
    """
    async def _override_auth():
        return test_user

    app.dependency_overrides[get_current_user] = _override_auth

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture
def unauth_client(mock_supabase_admin) -> TestClient:
    """FastAPI test client WITHOUT auth override — for guest endpoints.

    The mock_supabase_admin fixture is still included to prevent real DB calls.
    """
    app.dependency_overrides.clear()

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
