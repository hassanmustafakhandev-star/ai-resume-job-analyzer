/**
 * Supabase client singleton for the frontend.
 * Uses NEXT_PUBLIC_ environment variables (safe to expose in browser).
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Get the current session's access token (JWT) for API calls.
 * Tries getSession first; if no session, returns null.
 * The Supabase client auto-refreshes expired tokens so this is always fresh.
 */
export async function getAccessToken() {
  // getSession() returns the locally stored session and auto-refreshes if expired
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.warn("[Auth] getSession error:", error.message)
    return null
  }
  return session?.access_token ?? null
}


/**
 * Get the current logged-in user, or null if not authenticated.
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
