"""
Tests for the analyze router.
"""

from unittest.mock import AsyncMock, MagicMock, patch

from tests.conftest import TEST_USER_ID


MOCK_AI_RESULT = {
    "match_score": 82,
    "matched_skills": ["React", "Next.js", "TypeScript"],
    "missing_skills": ["Python", "FastAPI"],
    "job_title": "Senior Frontend Engineer",
    "company_name": "Acme Corp",
    "sections": [
        {
            "title": "Summary",
            "feedback": "Your summary is strong but lacks backend mention.",
            "rewrite": "Experienced Full Stack Engineer with 10 years...",
        },
        {
            "title": "Experience",
            "feedback": "Great detail. Quantify achievements more.",
            "rewrite": "Spearheaded development of a Next.js platform...",
        },
        {
            "title": "Skills",
            "feedback": "Add the missing skills from the JD.",
            "rewrite": None,
        },
    ],
}


class TestAnalyzeAuthenticated:
    """Tests for POST /api/v1/analyze."""

    @patch("app.routers.analyze.ai_service.analyze", new_callable=AsyncMock)
    def test_analyze_text_success(self, mock_ai, client, mock_supabase_admin):
        """Should analyze resume text and return structured result."""
        mock_ai.return_value = MOCK_AI_RESULT

        mock_insert_result = MagicMock()
        mock_insert_result.data = [{
            "id": "test-analysis-id",
            "created_at": "2024-04-18T00:00:00Z",
        }]
        mock_supabase_admin.table.return_value.insert.return_value.execute.return_value = mock_insert_result

        response = client.post(
            "/api/v1/analyze",
            data={
                "resume_text": "A" * 100,  # Min 50 chars
                "jd_text": "We are looking for a Senior Frontend Engineer with React experience...",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["score"] == 82
        assert "React" in data["matchedSkills"]
        assert data["jobTitle"] == "Senior Frontend Engineer"
        assert len(data["sections"]) == 3

    def test_analyze_missing_resume(self, client):
        """Should return 422 when resume is missing."""
        response = client.post(
            "/api/v1/analyze",
            data={"jd_text": "Some job description"},
        )
        assert response.status_code == 422

    def test_analyze_missing_jd(self, client):
        """Should return 422 when JD is missing."""
        response = client.post(
            "/api/v1/analyze",
            data={"resume_text": "A" * 100},
        )
        assert response.status_code == 422

    @patch("app.routers.analyze.ai_service.analyze", new_callable=AsyncMock)
    def test_analyze_ai_failure_returns_503(self, mock_ai, client):
        """Should return 503 when AI service fails."""
        mock_ai.side_effect = Exception("AI unavailable")

        response = client.post(
            "/api/v1/analyze",
            data={
                "resume_text": "A" * 100,
                "jd_text": "Some job description text for testing purposes.",
            },
        )
        assert response.status_code == 503


class TestAnalyzeGuest:
    """Tests for POST /api/v1/analyze/guest."""

    @patch("app.routers.analyze.ai_service.analyze", new_callable=AsyncMock)
    def test_guest_analyze_success(self, mock_ai, unauth_client):
        """Should allow guest analysis without authentication."""
        mock_ai.return_value = MOCK_AI_RESULT

        response = unauth_client.post(
            "/api/v1/analyze/guest",
            data={
                "resume_text": "A" * 100,
                "jd_text": "We need a developer with React and Node.js experience.",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["score"] == 82
        assert "id" in data  # Temporary UUID assigned

    def test_guest_analyze_short_resume(self, unauth_client):
        """Should reject resume text shorter than 50 characters."""
        response = unauth_client.post(
            "/api/v1/analyze/guest",
            data={
                "resume_text": "Too short",
                "jd_text": "Some job description.",
            },
        )
        assert response.status_code == 422
