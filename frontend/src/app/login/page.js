"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // ── Google OAuth ──────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      // Supabase will redirect the user — no further action needed here
    } catch (error) {
      toast.error("Failed to sign in with Google. Please try again.")
      setIsLoading(false)
    }
  }

  // ── Magic Link (Email) ────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error("Please enter your email address.")
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
      setEmailSent(true)
      toast.success("Magic link sent! Check your email inbox.")
    } catch (error) {
      toast.error(error.message || "Failed to send magic link.")
    } finally {
      setIsLoading(false)
    }
  }

  // ── Guest Mode ────────────────────────────────────────────────
  const handleGuestMode = () => {
    toast.success("Continuing as guest (3 free analyses per day).")
    router.push("/analyze")
  }

  return (
    <div className="bg-surface text-on-background min-h-screen flex items-center justify-center p-6 relative overflow-hidden flex-1">
      {/* Decorative Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-primary-container to-tertiary-container opacity-20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-tr from-secondary-container to-primary-container opacity-20 blur-3xl pointer-events-none"></div>

      <main className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-surface-container-lowest rounded-xl p-8 relative overflow-hidden"
          style={{ boxShadow: "0 32px 64px -16px rgba(179,0,102,0.1)" }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">Electric Resume</h1>
            <p className="text-on-surface-variant text-sm font-medium">Elevate your professional narrative.</p>
          </div>

          {emailSent ? (
            // ── Email Sent Confirmation State ──
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-secondary">mark_email_read</span>
              </div>
              <h2 className="text-xl font-bold text-on-background">Check your inbox!</h2>
              <p className="text-on-surface-variant text-sm max-w-xs mx-auto">
                We sent a magic link to <strong>{email}</strong>. Click the link to sign in — no password needed.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-primary font-semibold text-sm hover:underline mt-2"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-surface-container-low text-on-surface py-3 px-6 rounded-full font-semibold hover:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <img
                  alt="Google logo"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzd39KjZISxj8XxzDjkrMBx_zKISx5Nm5Rp5JF_9rNLI0p2Tz-vF8N5ec6Y-ZuyN_suaB_HztKvpUT5xh0GPiQzWl-3s_0DNmVHUc9snTrtRJCwiWJnsvFLb8E49PzWzGLKbAVfmId_2zvIZk4db248PH4su3mU7OAkbVKUEhR1wnYcEGVvAU1Cmim3tXl1_wG349ZzyDgk2Ph-MFQL3tMkmLyMWZaAT2hBSZfcEfWGoOf01miiNGmTwXTDsXY56xAhALq9StbDA"
                />
                {isLoading ? "Redirecting..." : "Continue with Google"}
              </button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-outline-variant opacity-30"></div>
                <span className="flex-shrink-0 mx-4 text-on-surface-variant text-xs uppercase tracking-wider font-semibold">Or</span>
                <div className="flex-grow border-t border-outline-variant opacity-30"></div>
              </div>

              {/* Email Magic Link */}
              <form className="space-y-5" onSubmit={handleEmailLogin}>
                <div>
                  <label className="block text-xs font-semibold text-on-surface uppercase tracking-wider mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant focus:border-b-2 focus:border-primary focus:ring-0 px-4 py-3 rounded-t-md text-on-surface placeholder-on-surface-variant transition-colors"
                    id="email"
                    placeholder="you@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 px-6 rounded-full font-semibold hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex justify-center items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Sign In via Magic Link"}
                  <span className="material-symbols-outlined text-[1.25rem]">
                    {isLoading ? "sync" : "arrow_forward"}
                  </span>
                </button>
              </form>

              {/* Guest Mode */}
              <div className="mt-6 text-center">
                <button
                  onClick={handleGuestMode}
                  className="text-primary font-semibold text-sm hover:text-primary transition-colors py-2 px-4 rounded-full bg-transparent hover:bg-primary/10"
                >
                  Continue as Guest (3 free analyses/day)
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <div className="mt-8 text-center">
          <p className="text-xs text-on-surface-variant">
            By continuing, you agree to our{" "}
            <a className="text-primary hover:underline" href="#">Terms of Service</a>
            {" "}and{" "}
            <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
          </p>
        </div>
      </main>
    </div>
  )
}
