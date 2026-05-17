"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { NavBar } from "@/components/ui/navbar"
import { ScoreGauge } from "@/components/ui/score-gauge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getAnalysis } from "@/lib/api"
import { createShareLink } from "@/lib/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ResultsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSharing, setIsSharing] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const analysis = await getAnalysis(id)
        setData(analysis)
      } catch (err) {
        toast.error(err.message || "Failed to load analysis.")
        // If not found or unauthorized, go back to dashboard
        if (err.message?.includes("401") || err.message?.includes("404")) {
          router.push("/dashboard")
        }
      } finally {
        setLoading(false)
      }
    }
    if (id) loadData()
  }, [id, router])

  const handleShare = async () => {
    setIsSharing(true)
    try {
      const result = await createShareLink(id)
      const shareUrl = result.share_url || `${window.location.origin}/share/${result.token}`
      await navigator.clipboard.writeText(shareUrl)
      toast.success("Share link copied to clipboard! (Expires in 7 days)")
    } catch (err) {
      toast.error(err.message || "Failed to create share link. Are you logged in?")
    } finally {
      setIsSharing(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center font-black italic text-primary animate-pulse">
      Initializing Sequence...
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-background flex items-center justify-center font-bold text-on-background">
      Analysis Not Found.
    </div>
  )

  return (
    <div className="bg-surface-container-lowest antialiased min-h-screen flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container">
      <NavBar />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-12 py-40 flex flex-col gap-16">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-8 mb-4">
          <div className="flex flex-col gap-4 max-w-2xl">
            <span className="text-label-sm font-bold uppercase tracking-[0.05em] text-primary">
              {data.jobTitle || "Target Role"} Analysis
              {data.companyName && data.companyName !== "the Company" && ` @ ${data.companyName}`}
            </span>
            <h1 className="text-display-sm md:text-display-lg font-bold text-on-background tracking-[-0.02em] leading-tight">Resume Analysis Complete</h1>
            <p className="text-body-lg text-on-surface-variant max-w-xl italic">
              We've compared your resume against the target job description. Here is your competitive breakdown and actionable steps to improve your fit.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="bg-transparent text-primary hover:bg-primary/10 font-bold py-3 px-6 rounded-full transition-all duration-300 border border-outline-variant/15 flex items-center gap-2 disabled:opacity-60"
            >
              <span className="material-symbols-outlined">share</span>
              <span>{isSharing ? "Copying..." : "Share Link"}</span>
            </button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Gauge & High-level Summary */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            {/* Match Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface-container-low rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 hover-pop"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at top right, var(--color-primary), transparent 70%)" }}></div>
              <h2 className="text-title-md font-bold text-on-background mb-8 z-10">Overall Match Score</h2>
              <ScoreGauge score={data.score} size={200} />
              <p className="text-body-lg text-center text-on-surface-variant z-10 mt-8 italic">
                {data.score >= 85
                  ? "Exceptional match — you're a top-tier candidate for this role."
                  : data.score >= 70
                  ? "Strong match. A few targeted improvements could make you a top candidate."
                  : data.score >= 50
                  ? "Moderate match. Bridging the skill gaps will significantly improve your chances."
                  : "Developing match. Focus on acquiring the missing skills to become competitive."}
              </p>
            </motion.div>

            {/* Matched Skills Summary */}
            {data.matchedSkills?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/15 flex flex-col gap-6 shadow-sm"
              >
                <h3 className="text-title-md font-bold text-on-background">Key Strengths Found</h3>
                <ul className="flex flex-col gap-3">
                  {data.matchedSkills.slice(0, 4).map((skill) => (
                    <li key={skill} className="flex items-center gap-3">
                      <span className="material-symbols-outlined fill text-secondary">check_circle</span>
                      <span className="text-body-lg font-semibold text-on-background capitalize">{skill}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </div>

          {/* Right Column: Details & Accordions */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Skill Gap Analysis */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/15 shadow-sm"
            >
              <div className="flex justify-between items-center mb-8 border-b border-outline-variant/15 pb-4">
                <h2 className="text-headline-md font-bold text-on-background italic">Skill Gap Analysis</h2>
                <span className="bg-tertiary-container text-on-tertiary-container text-label-sm font-bold px-3 py-1 rounded-full uppercase tracking-[0.05em]">
                  {data.missingSkills?.length || 0} Gaps Detected
                </span>
              </div>
              <div className="flex flex-col gap-8">
                {/* Matched Skills */}
                {data.matchedSkills?.length > 0 && (
                  <div>
                    <h3 className="text-title-md font-semibold text-on-background mb-4 uppercase tracking-widest text-xs">Matched Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.matchedSkills.map(skill => (
                        <span key={skill} className="bg-secondary-container text-on-secondary-container px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 capitalize">
                          <span className="material-symbols-outlined text-[16px]">done</span> {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {data.missingSkills?.length > 0 && (
                  <div>
                    <h3 className="text-title-md font-semibold text-on-background mb-4 uppercase tracking-widest text-xs">Missing Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.missingSkills.map(skill => (
                        <span key={skill} className="bg-error-container text-on-error-container px-4 py-2 rounded-full text-sm font-bold flex items-center gap-1 capitalize">
                          <span className="material-symbols-outlined text-[16px]">close</span> {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.section>

            {/* AI Suggestions Accordion Section */}
            {data.sections?.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-4"
              >
                <h2 className="text-headline-md font-bold text-on-background mb-2 italic">AI Enhancement Suggestions</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {data.sections.map((section, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`item-${idx}`}
                      className="bg-surface-container-lowest rounded-xl border border-outline-variant/15 overflow-hidden"
                    >
                      <AccordionTrigger className="w-full flex justify-between items-center p-6 text-left hover:bg-surface-container-low transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-2 rounded-full text-primary">
                            <span className="material-symbols-outlined">edit_document</span>
                          </div>
                          <h3 className="text-title-md font-bold text-on-background">{section.title}</h3>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 pt-0 border-t border-outline-variant/15 mt-0 pt-4">
                        <p className="text-body-lg text-on-surface-variant mb-4 italic">{section.feedback}</p>
                        {section.rewrite && (
                          <div className="bg-surface-container-low p-4 rounded-lg flex flex-col gap-3">
                            <div>
                              <span className="text-label-sm font-black text-primary uppercase italic">Suggested Improvement</span>
                              <p className="text-sm text-on-background mt-1 font-bold bg-tertiary-container/30 inline-block px-2 py-1 rounded">
                                "{section.rewrite}"
                              </p>
                            </div>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.section>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-zinc-50 border-t border-surface-container py-10 mt-auto opacity-50">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 w-full max-w-[1440px] mx-auto uppercase tracking-tighter font-black text-xs">
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
