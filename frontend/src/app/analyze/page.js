"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { analyzeResume, analyzeResumeGuest } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { NavBar } from "@/components/ui/navbar"
import { useRouter } from "next/navigation"

export default function AnalyzePage() {
  const { user } = useAuth()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [resumeText, setResumeText] = useState("")
  const [resumeFile, setResumeFile] = useState(null)
  const [jdText, setJdText] = useState("")
  const [inputMode, setInputMode] = useState("paste") // "paste" or "upload"
  const router = useRouter()

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setResumeFile(file)
      setResumeText("") // clear text input when file is selected
      toast.success(`Loaded: ${file.name}`)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop,
    onDropRejected: () => {
      toast.error("File must be a PDF under 5MB.")
    },
  })

  const handleAnalyze = async () => {
    if (inputMode === "paste" && !resumeText) {
      toast.error("Please paste your resume text.")
      return
    }
    if (inputMode === "upload" && !resumeFile) {
      toast.error("Please upload a PDF resume.")
      return
    }
    if (!jdText) {
      toast.error("Please provide the job description.")
      return
    }

    setIsAnalyzing(true)

    try {
      let data

      if (user) {
        // Authenticated: save to history
        data = await analyzeResume({
          resumeFile: inputMode === "upload" ? resumeFile : null,
          resumeText: inputMode === "paste" ? resumeText : null,
          jdText,
        })
      } else {
        // Guest: not saved, rate-limited
        if (inputMode === "upload") {
          toast.error("PDF upload requires an account. Please paste your resume text or log in.")
          setIsAnalyzing(false)
          return
        }
        data = await analyzeResumeGuest({ resumeText, jdText })
      }

      toast.success("Analysis complete!")
      router.push(`/results/${data.id}`)
    } catch (error) {
      toast.error(error.message || "Analysis failed. Please try again.")
      setIsAnalyzing(false)
    }
  }

  const isFormValid =
    (inputMode === "paste" ? resumeText.length > 50 : !!resumeFile) &&
    jdText.length > 50

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      <NavBar />

      {/* Main Content */}
      <main className="flex-grow pt-40 pb-24 px-6 md:px-12 w-full max-w-[1440px] mx-auto">
        <div className="mb-16 max-w-2xl">
          <h1 className="font-headline text-display-lg font-bold text-on-background tracking-tight mb-4">Analyze Your Core.</h1>
          <p className="font-body text-title-md text-on-surface-variant">Inject your experience below. Our semantic engine will dissect your trajectory and highlight the voltage needed to stand out.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Input Area */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-8 shadow-[0_32px_64px_-16px_rgba(179,0,102,0.05)] border-none">

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => { setInputMode("paste"); setResumeFile(null) }}
                className={`rounded-full px-6 py-2 font-label text-label-sm uppercase tracking-[0.05em] font-bold transition-all hover:scale-[1.02] ${
                  inputMode === "paste" ? "bg-primary-container text-on-primary-container" : "bg-transparent text-on-surface hover:bg-surface-container"
                }`}
              >
                Paste Text
              </button>
              <button
                onClick={() => { setInputMode("upload"); setResumeText("") }}
                className={`rounded-full px-6 py-2 font-label text-label-sm uppercase tracking-[0.05em] font-bold transition-all hover:scale-[1.02] ${
                  inputMode === "upload" ? "bg-primary-container text-on-primary-container" : "bg-transparent text-on-surface hover:bg-surface-container"
                }`}
              >
                Upload PDF
              </button>
            </div>

            {/* Resume Input Field */}
            <div className="relative group mb-10">
              {inputMode === "paste" ? (
                <textarea
                  className="w-full h-64 bg-surface-container-low text-on-surface font-body text-body-lg p-6 rounded-xl border-b-2 border-outline-variant focus:border-primary focus:ring-0 focus:outline-none resize-none placeholder:text-outline-variant transition-colors"
                  placeholder="Paste your raw resume text here..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              ) : (
                <div
                  {...getRootProps()}
                  className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all
                    ${isDragActive ? "border-primary bg-primary/5" : resumeFile ? "border-secondary bg-secondary/5" : "border-outline-variant hover:border-primary hover:bg-surface-container"}
                  `}
                >
                  <input {...getInputProps()} />
                  {resumeFile ? (
                    <div className="flex flex-col items-center gap-3 text-center px-4">
                      <span className="material-symbols-outlined text-4xl text-secondary">task</span>
                      <p className="font-bold text-on-surface">{resumeFile.name}</p>
                      <p className="text-sm text-secondary font-bold uppercase tracking-widest">Ready for Analysis</p>
                    </div>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-primary mb-3">upload_file</span>
                      <p className="font-bold text-on-surface">Drop PDF Resume</p>
                      <p className="text-sm text-on-surface-variant uppercase tracking-widest mt-1">Max 5MB</p>
                    </>
                  )}
                </div>
              )}
              {(resumeText || resumeFile) && (
                <button
                  onClick={() => { setResumeText(""); setResumeFile(null) }}
                  className="absolute bottom-4 right-4 p-2 rounded-full text-outline hover:text-error hover:bg-error/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              )}
            </div>

            {/* Job Description Input Field */}
            <div className="space-y-4">
              <h3 className="font-label text-label-sm uppercase tracking-[0.1em] text-secondary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">target</span>
                Target Parameters (Job Description)
              </h3>
              <div className="relative">
                <textarea
                  className="w-full h-48 bg-surface-container-low text-on-surface font-body text-body-lg p-6 rounded-xl border-b-2 border-outline-variant focus:border-secondary focus:ring-0 focus:outline-none resize-none placeholder:text-outline-variant transition-colors"
                  placeholder="Paste the target job description here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
                {jdText && (
                  <button
                    onClick={() => setJdText("")}
                    className="absolute bottom-4 right-4 p-2 rounded-full text-outline hover:text-error hover:bg-error/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                )}
              </div>
            </div>

            {/* Primary Action */}
            <div className="mt-10 flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={!isFormValid || isAnalyzing}
                className={`bg-secondary text-on-secondary rounded-full px-10 py-4 font-label text-label-sm uppercase tracking-[0.05em] font-bold hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_16px_32px_-10px_rgba(0,106,48,0.3)] flex items-center gap-3
                  ${(!isFormValid || isAnalyzing) ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isAnalyzing ? "Executing Sequence..." : "Initiate Analysis"}
                <span className={`material-symbols-outlined text-[18px] ${isAnalyzing ? "animate-spin" : ""}`}>
                  {isAnalyzing ? "sync" : "bolt"}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Results Placeholder */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-10 shadow-[0_32px_64px_-16px_rgba(179,0,102,0.05)] h-full min-h-[500px] flex flex-col justify-center items-center relative overflow-hidden">
            {/* Decorative Background Element */}
            <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-gradient-to-bl from-surface-container-low to-transparent rounded-full opacity-50 blur-3xl pointer-events-none"></div>

            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center z-10"
                >
                  <div className="relative mb-12 flex justify-center items-center">
                    <div className="absolute w-48 h-48 rounded-full bg-primary-container blur-2xl opacity-60 animate-pulse"></div>
                    <div className="relative w-40 h-40 rounded-full border-4 border-primary flex justify-center items-center animate-spin-slow">
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary"></div>
                      <div className="text-center animate-none">
                        <span className="material-symbols-outlined text-4xl text-primary mb-2 animate-pulse">radar</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="font-headline text-title-md font-semibold text-on-surface mb-3 text-primary">Deconstructing...</h3>
                  <p className="font-body text-body-lg text-on-surface-variant max-w-xs mx-auto">Quantifying Semantic Resonance & Action Verb Velocity</p>
                </motion.div>
              ) : (
                <motion.div
                  key="standby"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center text-center z-10"
                >
                  <div className="relative mb-12 flex justify-center items-center">
                    <div className="absolute w-48 h-48 rounded-full bg-tertiary-container blur-2xl opacity-40 animate-pulse"></div>
                    <div className="relative w-40 h-40 rounded-full border-4 border-surface-container flex justify-center items-center">
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-secondary-container border-r-tertiary-container rotate-45 opacity-80"></div>
                      <div className="text-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">radar</span>
                        <div className="font-label text-label-sm uppercase tracking-[0.05em] text-on-surface-variant font-bold">Standby</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center w-full max-w-xs">
                    <h3 className="font-headline text-title-md font-semibold text-on-surface mb-3">Awaiting Signal</h3>
                    <p className="font-body text-body-lg text-on-surface-variant mb-8">Insert data to begin the semantic extraction sequence.</p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {["Keywords", "Impact", "Format"].map(pill => (
                        <div key={pill} className="bg-surface-container rounded-full px-4 py-1.5 flex items-center gap-2 opacity-60">
                          <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
                          <span className="font-label text-label-sm text-on-surface uppercase tracking-widest">{pill}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="bg-zinc-50 dark:bg-zinc-900 border-t border-surface-container py-10 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 w-full max-w-[1440px] mx-auto">
          <div className="font-bold text-zinc-900 dark:text-zinc-100 mb-6 md:mb-0 uppercase tracking-tighter">
            © 2026 The Electric Gallery.
          </div>
          <div className="flex gap-8 text-sm font-bold uppercase tracking-widest opacity-40">
            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="hover:text-primary transition-colors" href="#">Terms</a>
            <a className="hover:text-primary transition-colors" href="#">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
