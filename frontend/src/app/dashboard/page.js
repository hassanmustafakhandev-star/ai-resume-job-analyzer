"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { getHistory, deleteAnalysis } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { NavBar } from "@/components/ui/navbar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const [history, setHistory] = useState([])
  const [dataLoading, setDataLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deletingId, setDeletingId] = useState(null)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const LIMIT = 10

  // ── Auth Guard — wait for auth to load, then check ────────────
  useEffect(() => {
    if (authLoading) return // Wait until Supabase session is checked

    if (!user) {
      toast.error("Please log in to view your dashboard.")
      router.push("/login")
      return
    }

    // User is confirmed logged in — load data once
    loadData(1, "")
    setInitialized(true)
  }, [authLoading, user]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced search — only fires after initial load ──────────
  useEffect(() => {
    if (!initialized) return // Don't run before auth + first load
    const timer = setTimeout(() => {
      setPage(1)
      loadData(1, searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, initialized]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData(currentPage = 1, search = "") {
    setDataLoading(true)
    try {
      const data = await getHistory({ page: currentPage, limit: LIMIT, search })
      setHistory(data.items || [])
      setTotal(data.total || 0)
    } catch (err) {
      toast.error(err.message || "Failed to load history.")
    } finally {
      setDataLoading(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Delete this analysis permanently?")) return
    setDeletingId(id)
    try {
      await deleteAnalysis(id)
      setHistory(prev => prev.filter(item => item.id !== id))
      setTotal(prev => prev - 1)
      toast.success("Analysis deleted.")
    } catch (err) {
      toast.error(err.message || "Failed to delete analysis.")
    } finally {
      setDeletingId(null)
    }
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    loadData(newPage, searchQuery)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalPages = Math.ceil(total / LIMIT)
  const isLoading = authLoading || dataLoading

  // ── Loading state ─────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-black italic text-primary animate-pulse">
        Initializing Session...
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest antialiased min-h-screen flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* Decorative Ambient Glow */}
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary-container/20 to-transparent rounded-full blur-[120px] pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>

      <NavBar />

      {/* Main Content Canvas */}
      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-12 py-40 flex flex-col gap-16">
        {/* Header & Search/Filter Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="font-headline text-[3.5rem] font-bold leading-tight tracking-[-0.02em] text-on-background italic">
              Analysis History
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl italic">
              Review your past resume optimizations and track your match progression over time.
              {total > 0 && <span className="font-bold text-primary"> ({total} total)</span>}
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">search</span>
              <input
                className="w-full md:w-[320px] bg-surface-container-low border-b-2 border-outline-variant focus:border-primary pl-12 pr-4 py-3 text-on-surface outline-none rounded-t-md transition-colors font-bold uppercase tracking-widest text-[10px]"
                placeholder="Search past roles..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: History List (Span 8) */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            {isLoading ? (
              <div className="space-y-8 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-40 bg-surface-container-lowest rounded-xl" />)}
              </div>
            ) : (
              <AnimatePresence>
                {history.length > 0 ? (
                  <>
                    {history.map((item, idx) => (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-surface-container-lowest rounded-md p-6 lg:p-8 flex flex-col md:flex-row gap-8 hover:scale-[1.01] transition-all duration-300 relative group overflow-hidden border border-outline-variant/5"
                        style={{ boxShadow: "0 4px 24px -8px rgba(179,0,102,0.06)" }}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.score >= 80 ? "bg-secondary" : item.score >= 60 ? "bg-tertiary-container" : "bg-error"}`}></div>
                        <div className="flex-grow flex flex-col gap-4 justify-between">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="font-label text-[0.6875rem] font-bold uppercase tracking-[0.05em] text-on-surface-variant italic">{item.date}</span>
                              <h2 className="font-headline text-[1.75rem] font-semibold text-on-background mt-1 leading-tight">{item.jobTitle}</h2>
                              <p className="text-on-surface-variant font-medium mt-1 italic">Optimization Node #{idx + 1 + (page - 1) * LIMIT}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`px-3 py-1.5 rounded-full text-[0.6875rem] font-bold uppercase tracking-widest flex items-center gap-1 ${
                                item.score >= 80 ? "bg-secondary-container text-on-secondary-container" :
                                item.score >= 60 ? "bg-tertiary-container text-on-tertiary-container" :
                                "bg-error-container text-on-error-container"
                              }`}>
                                <span className="material-symbols-outlined text-[14px]">{item.score >= 60 ? "check_circle" : "warning"}</span>
                                {item.score >= 80 ? "Elite" : item.score >= 60 ? "Strong" : "Gaps"}
                              </div>
                              <button
                                onClick={(e) => handleDelete(item.id, e)}
                                disabled={deletingId === item.id}
                                className="p-2 rounded-full text-outline-variant hover:text-error hover:bg-error/10 transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete analysis"
                              >
                                <span className="material-symbols-outlined text-[18px]">
                                  {deletingId === item.id ? "sync" : "delete"}
                                </span>
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {(item.matchedSkills || []).slice(0, 4).map(skill => (
                              <span key={skill} className="bg-surface-container-low text-on-surface px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter capitalize">{skill}</span>
                            ))}
                          </div>
                        </div>
                        <div className="md:w-48 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-outline-variant/15 pt-6 md:pt-0 md:pl-8 mt-4 md:mt-0">
                          <div className="text-right">
                            <div className={`text-4xl font-bold font-headline tracking-tighter italic ${
                              item.score >= 80 ? "text-secondary" : item.score >= 60 ? "text-tertiary" : "text-error"
                            }`}>{item.score}%</div>
                            <div className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest">Resonance</div>
                          </div>
                          <Link href={`/results/${item.id}`} className="mt-4">
                            <button className="text-primary font-black hover:bg-primary/5 px-4 py-2 rounded-md transition-colors text-xs tracking-[0.2em] uppercase">
                              View Report
                            </button>
                          </Link>
                        </div>
                      </motion.article>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          onClick={() => handlePageChange(page - 1)}
                          disabled={page <= 1}
                          className="px-4 py-2 rounded-full border border-outline-variant/30 text-on-surface font-bold text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="px-4 py-2 text-on-surface-variant text-xs font-bold uppercase">
                          Page {page} of {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(page + 1)}
                          disabled={page >= totalPages}
                          className="px-4 py-2 rounded-full border border-outline-variant/30 text-on-surface font-bold text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-24 bg-surface-container-lowest rounded-xl border-dashed border-2 border-outline-variant/20">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-40">history</span>
                    <p className="font-black uppercase tracking-widest opacity-40 mb-6">
                      {searchQuery ? "No Results Found" : "No Extraction History Yet"}
                    </p>
                    {!searchQuery && (
                      <Link href="/analyze">
                        <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-all">
                          Start Your First Analysis
                        </button>
                      </Link>
                    )}
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Right Column: Quick Actions & Stats (Span 4) */}
          <aside className="xl:col-span-4 bg-surface-container-low rounded-xl p-8 sticky top-32">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-tertiary fill">insights</span>
              <h3 className="font-headline text-[1.125rem] font-bold text-on-background tracking-tight italic">Quick Actions</h3>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <Link href="/analyze">
                <button className="w-full bg-primary text-on-primary py-3 px-6 rounded-full font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  New Analysis
                </button>
              </Link>
            </div>

            {user && (
              <div className="border-t border-outline-variant/15 pt-6 mb-6">
                <h4 className="font-bold text-on-background text-sm uppercase tracking-widest mb-4 opacity-60">Logged In As</h4>
                <p className="text-sm text-on-surface-variant truncate">{user.email}</p>
              </div>
            )}

            {total > 0 && (
              <div className="border-t border-outline-variant/15 pt-6">
                <h4 className="font-bold text-on-background text-sm uppercase tracking-widest mb-4 opacity-60">Stats</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant text-sm">Total Analyses</span>
                    <span className="font-bold text-on-background">{total}</span>
                  </div>
                  {history.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant text-sm">Best Score</span>
                      <span className="font-bold text-secondary">{Math.max(...history.map(h => h.score))}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <footer className="bg-zinc-50 border-t border-outline-variant/10 py-10 mt-auto opacity-40">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 w-full max-w-[1440px] mx-auto uppercase tracking-tighter font-black text-[10px]">
          <div>© 2026 The Electric Gallery.</div>
          <div className="flex gap-8">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
