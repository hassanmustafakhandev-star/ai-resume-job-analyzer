"use client"

/**
 * AuthContext — global authentication state using Supabase.
 *
 * This context listens to the Supabase auth state in real-time and provides
 * the current user, session, and loading state to the entire app.
 * 
 * Usage:
 *   const { user, session, loading } = useAuth()
 */

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Get the current session on initial mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    // Cleanup on unmount
    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access the auth context.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  return useContext(AuthContext)
}
