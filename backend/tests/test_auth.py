"""
Tests for the auth router.
"""

from unittest.mock import MagicMock, patch

from tests.conftest import TEST_USER_ID, TEST_USER_EMAIL


class TestGetMe:
    """Tests for GET /api/v1/auth/me."""

    def test_get_me_success(self, client, mock_supabase_admin):
        """Should return the current user's profile."""
        mock_result = MagicMock()
        mock_result.data = [{
            "id": TEST_USER_ID,
            "email": TEST_USER_EMAIL,
            "display_name": "Test User",
            "avatar_url": None,
            "analyses_count": 5,
            "created_at": "2024-01-01T00:00:00Z",
        }]
        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

        response = client.get("/api/v1/auth/me")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == TEST_USER_ID
        assert data["email"] == TEST_USER_EMAIL
        assert data["analyses_count"] == 5

    def test_get_me_creates_profile_if_missing(self, client, mock_supabase_admin):
        """Should auto-create a profile if none exists."""
        empty_result = MagicMock()
        empty_result.data = []

        created_result = MagicMock()
        created_result.data = [{
            "id": TEST_USER_ID,
            "email": TEST_USER_EMAIL,
            "display_name": None,
            "avatar_url": None,
            "analyses_count": 0,
            "created_at": "2024-01-01T00:00:00Z",
        }]

        # First call returns empty, second returns created profile
        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
            empty_result, created_result
        ]
        mock_supabase_admin.table.return_value.insert.return_value.execute.return_value = created_result

        response = client.get("/api/v1/auth/me")
        assert response.status_code == 200

    def test_get_me_unauthenticated(self, unauth_client):
        """Should return 401 when no token is provided."""
        response = unauth_client.get("/api/v1/auth/me")
        assert response.status_code == 401


class TestLogout:
    """Tests for POST /api/v1/auth/logout."""

    def test_logout_success(self, client):
        """Should return 204 on successful logout."""
        response = client.post("/api/v1/auth/logout")
        assert response.status_code == 204

    def test_logout_unauthenticated(self, unauth_client):
        """Should return 401 when not authenticated."""
        response = unauth_client.post("/api/v1/auth/logout")
        assert response.status_code == 401
