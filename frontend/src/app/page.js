"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ResumeTransformation from "@/components/landing/resume-transformation"
import HistoryPreview from "@/components/landing/history-preview"
import InsightsPreview from "@/components/landing/insights-preview"

function CyclingWords() {
  const words = [
    { text: "Full Color.", color: "text-pink-600" },
    { text: "High Impact.", color: "text-purple-600" },
    { text: "Top 1%.", color: "text-emerald-600" },
    { text: "Perfect Match.", color: "text-amber-500" }
  ]
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <span className="relative inline-flex items-center h-[1.2em] min-w-[350px] overflow-visible align-top">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`absolute left-0 w-full font-black italic tracking-tighter whitespace-nowrap ${words[index].color}`}
        >
          {words[index].text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      {/* Navigation Shell */}
      <header className="fixed w-full z-50 transition-all duration-300 shadow-[0_32px_64px_-15px_rgba(179,0,102,0.08)] bg-white/70 backdrop-blur-2xl font-sans font-medium tracking-tight top-0">
        <div className="flex justify-between items-center px-12 py-6 w-full max-w-[1440px] mx-auto space-y-0 bg-zinc-50/50">
          {/* Brand Logo */}
          <Link href="#" className="text-2xl font-black italic tracking-tighter text-primary hover:scale-[1.02] transition-all duration-300 active:scale-95">
            Electric Resume
          </Link>
          
          {/* Navigation Links (Web) */}
          <nav className="hidden md:flex gap-10 items-center">
            <Link href="#analyzer" className="text-on-surface-variant font-bold hover:text-primary transition-all duration-300 active:scale-95 text-sm uppercase tracking-widest">Analyzer</Link>
            <Link href="#history" className="text-on-surface-variant font-bold hover:text-primary transition-all duration-300 active:scale-95 text-sm uppercase tracking-widest">History</Link>
            <Link href="#market-insights" className="text-on-surface-variant font-bold hover:text-primary transition-all duration-300 active:scale-95 text-sm uppercase tracking-widest">Insights</Link>
          </nav>
          
          {/* Trailing Action */}
          <div className="flex items-center gap-6">
            <Link href="/login">
              <button className="hero-gradient text-on-primary px-8 py-3.5 rounded-full font-black hover:scale-[1.05] shadow-[0_20px_40px_-10px_rgba(179,0,102,0.3)] transition-all duration-300 flex items-center gap-2 text-sm active:scale-95">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
                Upload Resume
              </button>
            </Link>
          </div>
          
          {/* Mobile Menu Toggle (Decorative) */}
          <button className="md:hidden text-primary">
            <span className="material-symbols-outlined text-3xl">menu</span>
          </button>
        </div>
      </header>

      <main className="flex-grow pt-40 pb-24">
        {/* Hero Section */}
        <section className="relative max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
            {/* Hero Copy */}
            <div className="lg:col-span-6 space-y-10">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 text-primary rounded-full text-label-sm border border-primary/30 font-black tracking-[0.2em] uppercase">
                <span className="material-symbols-outlined text-[18px] animate-pulse">bolt</span>
                AI-Powered Career Engine
              </div>
              <h1 className="text-display-lg font-black leading-[1.1] tracking-[-0.04em] text-on-background">
                Supercharge Your <br />
                Career in <CyclingWords />
              </h1>
              <p className="text-body-lg text-on-surface-variant max-w-lg leading-relaxed font-medium">
                Ditch the boring black-and-white CVs. Our intelligent analyzer injects life into your experience, formatting your skills for impact and getting you past the ATS algorithms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/login">
                  <button className="hero-gradient text-on-primary px-8 py-4 rounded-full font-bold text-title-md hover:scale-[1.02] shadow-[0_12px_32px_-8px_rgba(179,0,102,0.3)] transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto">
                    Start Analyzing Free
                    <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                  </button>
                </Link>
                <button className="bg-transparent text-primary px-8 py-4 rounded-full font-semibold text-title-md hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-transparent">
                  <span className="material-symbols-outlined text-[20px]">play_circle</span>
                  See How It Works
                </button>
              </div>
            </div>
            
            {/* Hero Image/Mockup Area (Dynamic Transformation) */}
            <div className="lg:col-span-6 relative h-[600px] lg:h-full">
               <ResumeTransformation />
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-24" id="analyzer">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-headline-md font-semibold text-on-background">Not Just Another Spellcheck</h2>
            <p className="text-body-lg text-on-surface-variant">We dismantle your resume and rebuild it as a high-performance career asset using deep market insights.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-[0_16px_32px_-8px_rgba(179,0,102,0.1)] transition-all duration-300 hover:scale-[1.02] flex flex-col gap-6 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl">auto_fix_high</span>
              </div>
              <div>
                <h3 className="text-title-md font-semibold text-on-background mb-3">Keyword Alchemy</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">We don't just match keywords; we analyze contextual relevance to ensure your skills resonate with human recruiters and ATS bots alike.</p>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-[0_16px_32px_-8px_rgba(0,106,48,0.1)] transition-all duration-300 hover:scale-[1.02] flex flex-col gap-6 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl">insights</span>
              </div>
              <div>
                <h3 className="text-title-md font-semibold text-on-background mb-3">Action Verb Optimizer</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Upgrade weak phrases. We suggest powerful, industry-specific action verbs to quantify your achievements and drive impact.</p>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm hover:shadow-[0_16px_32px_-8px_rgba(112,89,0,0.1)] transition-all duration-300 hover:scale-[1.02] flex flex-col gap-6 relative overflow-hidden group">
              <div className="w-14 h-14 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-3xl">format_paint</span>
              </div>
              <div>
                <h3 className="text-title-md font-semibold text-on-background mb-3">Vibrant Formatting</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">Apply layout rules that guide the reader's eye seamlessly through your narrative, utilizing white space as a strategic advantage.</p>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-tertiary/5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            </div>
          </div>
        </section>

        {/* History Preview Section */}
        <HistoryPreview />

        {/* Market Insights Preview Section */}
        <InsightsPreview />

        {/* CTA Section */}
        <section className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 relative">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10 rounded-[2rem] mx-6 md:mx-12"></div>
          <div className="relative z-10 glass-panel rounded-[2rem] p-12 md:p-20 text-center max-w-4xl mx-auto shadow-[0_32px_64px_-15px_rgba(179,0,102,0.1)] border border-white/50">
            <h2 className="text-headline-md font-bold text-on-background mb-6">Ready to electrify your job search?</h2>
            <p className="text-body-lg text-on-surface-variant mb-10 max-w-xl mx-auto">Join thousands of professionals who have transformed their CVs from static documents into dynamic career catalysts.</p>
            <Link href="/login" className="inline-block">
              <button className="hero-gradient text-on-primary px-10 py-5 rounded-full font-bold text-title-md hover:scale-[1.05] shadow-[0_16px_32px_-8px_rgba(179,0,102,0.4)] transition-all duration-300 inline-flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px]">flash_on</span>
                Upload Resume Now
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-50 text-primary px-12 py-10 border-t border-surface-container">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center w-full">
          <div className="font-bold text-zinc-900 mb-6 md:mb-0 text-base">
            Electric Resume
          </div>
          <nav className="flex gap-6 mb-6 md:mb-0">
            <Link href="#" className="text-zinc-500 hover:text-emerald-600 transition-colors">Privacy</Link>
            <Link href="#" className="text-zinc-500 hover:text-emerald-600 transition-colors">Terms</Link>
            <Link href="#" className="text-zinc-500 hover:text-emerald-600 transition-colors">Support</Link>
          </nav>
          <div className="text-zinc-500">
            © 2026 The Electric Gallery. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
