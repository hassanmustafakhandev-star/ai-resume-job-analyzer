"""
Tests for the history router.
"""

from unittest.mock import MagicMock, patch

from tests.conftest import TEST_USER_ID


MOCK_ANALYSES = [
    {
        "id": "analysis-1",
        "job_title": "Senior Frontend Engineer",
        "score": 90,
        "matched_skills": ["React", "Next.js", "TypeScript"],
        "created_at": "2024-04-18T00:00:00Z",
    },
    {
        "id": "analysis-2",
        "job_title": "Full Stack Developer",
        "score": 75,
        "matched_skills": ["JavaScript", "Node.js"],
        "created_at": "2024-04-15T00:00:00Z",
    },
]


class TestListHistory:
    """Tests for GET /api/v1/history."""

    def test_list_history_success(self, client, mock_supabase_admin):
        """Should return paginated history list."""
        mock_result = MagicMock()
        mock_result.data = MOCK_ANALYSES
        mock_result.count = 2

        # Chain the query builder mock
        table = mock_supabase_admin.table.return_value
        select = table.select.return_value
        eq = select.eq.return_value
        order = eq.order.return_value
        range_ = order.range.return_value
        range_.execute.return_value = mock_result

        response = client.get("/api/v1/history")

        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert len(data["items"]) == 2
        assert data["items"][0]["jobTitle"] == "Senior Frontend Engineer"
        assert data["items"][0]["score"] == 90

    def test_list_history_unauthenticated(self, unauth_client):
        """Should return 401 when not authenticated."""
        response = unauth_client.get("/api/v1/history")
        assert response.status_code == 401

    def test_list_history_pagination(self, client, mock_supabase_admin):
        """Should respect page and limit parameters."""
        mock_result = MagicMock()
        mock_result.data = [MOCK_ANALYSES[0]]
        mock_result.count = 2

        table = mock_supabase_admin.table.return_value
        select = table.select.return_value
        eq = select.eq.return_value
        order = eq.order.return_value
        range_ = order.range.return_value
        range_.execute.return_value = mock_result

        response = client.get("/api/v1/history?page=1&limit=1")

        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert data["limit"] == 1


class TestGetAnalysis:
    """Tests for GET /api/v1/history/{analysis_id}."""

    def test_get_analysis_success(self, client, mock_supabase_admin):
        """Should return full analysis when user owns it."""
        mock_result = MagicMock()
        mock_result.data = [{
            "id": "analysis-1",
            "user_id": TEST_USER_ID,
            "job_title": "Senior Frontend Engineer",
            "company_name": "Acme Corp",
            "score": 90,
            "matched_skills": ["React", "Next.js"],
            "missing_skills": ["Python"],
            "suggestions": {
                "summary": {"issue": "Lacks backend.", "improvement": "Add backend context."},
            },
            "created_at": "2024-04-18T00:00:00Z",
        }]

        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

        response = client.get("/api/v1/history/analysis-1")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "analysis-1"
        assert data["score"] == 90

    def test_get_analysis_not_owned(self, client, mock_supabase_admin):
        """Should return 403 when analysis belongs to another user."""
        mock_result = MagicMock()
        mock_result.data = [{
            "id": "analysis-1",
            "user_id": "other-user-id",
            "score": 90,
            "matched_skills": [],
            "missing_skills": [],
            "suggestions": {},
            "created_at": "2024-04-18T00:00:00Z",
        }]

        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

        response = client.get("/api/v1/history/analysis-1")
        assert response.status_code == 403

    def test_get_analysis_not_found(self, client, mock_supabase_admin):
        """Should return 404 when analysis doesn't exist."""
        mock_result = MagicMock()
        mock_result.data = []

        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

        response = client.get("/api/v1/history/nonexistent-id")
        assert response.status_code == 404


class TestDeleteAnalysis:
    """Tests for DELETE /api/v1/history/{analysis_id}."""

    def test_delete_analysis_success(self, client, mock_supabase_admin):
        """Should return 204 on successful deletion."""
        mock_result = MagicMock()
        mock_result.data = [{"user_id": TEST_USER_ID}]

        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        mock_supabase_admin.table.return_value.delete.return_value.eq.return_value.execute.return_value = MagicMock()

        response = client.delete("/api/v1/history/analysis-1")
        assert response.status_code == 204

    def test_delete_analysis_not_owned(self, client, mock_supabase_admin):
        """Should return 403 when trying to delete another user's analysis."""
        mock_result = MagicMock()
        mock_result.data = [{"user_id": "other-user-id"}]

        mock_supabase_admin.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result

        response = client.delete("/api/v1/history/analysis-1")
        assert response.status_code == 403

    def test_delete_unauthenticated(self, unauth_client):
        """Should return 401 when not authenticated."""
        response = unauth_client.delete("/api/v1/history/analysis-1")
        assert response.status_code == 401
