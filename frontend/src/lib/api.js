/**
 * API client for the Electric Resume FastAPI backend.
 * All authenticated calls inject the Supabase JWT as a Bearer token.
 *
 * Backend base URL: http://localhost:8000/api/v1
 */

import { getAccessToken } from "@/lib/supabase"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

/**
 * Generic authenticated fetch wrapper.
 * Attaches Bearer token and throws a readable error on non-2xx responses.
 */
async function apiFetch(path, options = {}) {
  const token = await getAccessToken()

  const headers = {
    ...(options.headers || {}),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    let errorDetail = `API error ${res.status}`
    try {
      const json = await res.json()
      if (Array.isArray(json.detail)) {
        // FastAPI 422 validation error array
        errorDetail = json.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ')
      } else {
        errorDetail = json.detail || errorDetail
      }
    } catch (_) {}
    console.error(`[API] Fetch error on ${path}:`, errorDetail)
    throw new Error(errorDetail)
  }


  // Handle 204 No Content
  if (res.status === 204) return null

  return res.json()
}


// ─────────────────────────────────────────────────────────────────
// ANALYZE
// ─────────────────────────────────────────────────────────────────

/**
 * Submit a resume + JD for authenticated analysis.
 * Saves result to the user's history.
 *
 * @param {Object} params
 * @param {File|null}   params.resumeFile  - PDF file object (optional)
 * @param {string|null} params.resumeText  - Plain text resume (optional)
 * @param {string|null} params.jdText      - Job description text (optional)
 * @param {string|null} params.jdUrl       - Job description URL (optional)
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeResume({ resumeFile, resumeText, jdText, jdUrl }) {
  const formData = new FormData()

  if (resumeFile) {
    formData.append("resume_file", resumeFile)
  } else if (resumeText) {
    formData.append("resume_text", resumeText)
  }

  if (jdText) {
    formData.append("jd_text", jdText)
  } else if (jdUrl) {
    formData.append("jd_url", jdUrl)
  }

  return apiFetch("/analyze", {
    method: "POST",
    body: formData,
  })
}


/**
 * Guest analysis — no auth required, not saved to database.
 * Rate limited to 3/day per IP.
 *
 * @param {Object} params
 * @param {string}      params.resumeText - Plain text resume (required)
 * @param {string|null} params.jdText     - Job description text
 * @param {string|null} params.jdUrl      - Job description URL
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeResumeGuest({ resumeText, jdText, jdUrl }) {
  const formData = new FormData()
  formData.append("resume_text", resumeText)
  if (jdText) formData.append("jd_text", jdText)
  if (jdUrl) formData.append("jd_url", jdUrl)

  const res = await fetch(`${API_BASE}/analyze/guest`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    let errorDetail = `API error ${res.status}`
    try {
      const json = await res.json()
      errorDetail = json.detail || errorDetail
    } catch (_) {}
    throw new Error(errorDetail)
  }

  return res.json()
}


// ─────────────────────────────────────────────────────────────────
// HISTORY
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch the current user's analysis history.
 *
 * @param {Object} params
 * @param {number} params.page   - Page number (default 1)
 * @param {number} params.limit  - Items per page (default 10)
 * @param {string} params.search - Search by job title
 * @returns {Promise<HistoryListResponse>}
 */
export async function getHistory({ page = 1, limit = 10, search = "" } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (search) params.set("search", search)
  return apiFetch(`/history?${params.toString()}`)
}

/**
 * Fetch a single analysis by ID.
 * @param {string} id
 * @returns {Promise<AnalysisResult>}
 */
export async function getAnalysis(id) {
  return apiFetch(`/history/${id}`)
}

/**
 * Delete an analysis by ID.
 * @param {string} id
 * @returns {Promise<null>}
 */
export async function deleteAnalysis(id) {
  return apiFetch(`/history/${id}`, { method: "DELETE" })
}


// ─────────────────────────────────────────────────────────────────
// AUTH (Profile)
// ─────────────────────────────────────────────────────────────────

/**
 * Fetch the current user's profile from the backend.
 * @returns {Promise<UserProfile>}
 */
export async function getMyProfile() {
  return apiFetch("/auth/me")
}


// ─────────────────────────────────────────────────────────────────
// SHARE
// ─────────────────────────────────────────────────────────────────

/**
 * Create a shareable link for an analysis.
 * @param {string} analysisId
 * @returns {Promise<{share_url: string, expires_at: string}>}
 */
export async function createShareLink(analysisId) {
  return apiFetch(`/share/${analysisId}`, { method: "POST" })
}

/**
 * View a shared analysis by token (no auth required).
 * @param {string} token
 * @returns {Promise<AnalysisResult>}
 */
export async function getSharedAnalysis(token) {
  const res = await fetch(`${API_BASE}/share/view/${token}`)
  if (!res.ok) throw new Error("Shared analysis not found or expired.")
  return res.json()
}
