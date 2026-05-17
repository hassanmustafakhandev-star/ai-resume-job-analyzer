"use client"

import { NavBar } from "@/components/ui/navbar"
import { motion } from "framer-motion"

export default function InsightsPage() {
  const trendingSkills = [
    { name: "Generative AI", growth: "+145%", color: "text-primary" },
    { name: "Product Strategy", growth: "+42%", color: "text-secondary" },
    { name: "Data Visualization", growth: "+28%", color: "text-tertiary" },
    { name: "Rust / WASM", growth: "+12%", color: "text-on-background" },
  ]

  const industryBenchmarks = [
    { role: "Senior Product Designer", avgScore: "82%", topSkills: ["Figma", "Design Systems", "User Research"] },
    { role: "Frontend Engineer", avgScore: "78%", topSkills: ["React", "Next.js", "Tailwind"] },
    { role: "Product Manager", avgScore: "85%", topSkills: ["Strategy", "Roadmapping", "SQL"] },
  ]

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      <NavBar />
      
      <main className="flex-grow pt-40 pb-24 px-6 md:px-12 w-full max-w-[1440px] mx-auto space-y-16">
        {/* Header Section */}
        <div className="max-w-2xl">
          <h1 className="font-headline text-display-lg font-bold text-on-background tracking-tight mb-4 italic underline decoration-primary/20">Market Insights.</h1>
          <p className="font-body text-title-md text-on-surface-variant italic">High-voltage analysis of current industry trends and structural benchmarks for elite performance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Trending Skills Section */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10 shadow-sm">
              <h2 className="text-xl font-black uppercase tracking-widest mb-8 italic">Trending Skills</h2>
              <div className="space-y-6">
                {trendingSkills.map((skill, idx) => (
                  <div key={idx} className="flex justify-between items-center group">
                    <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{skill.name}</span>
                    <span className={`font-black italic ${skill.color}`}>{skill.growth}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-primary text-on-primary rounded-xl p-8 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-4xl mb-4">bolt</span>
              <h3 className="text-xl font-black italic mb-2">Algorithm Alert</h3>
              <p className="text-sm opacity-80 italic">Semantic engines are increasingly prioritizing "Outcome-Based" bullet points over "Task-Based" descriptions. Update your trajectory accordingly.</p>
            </div>
          </div>

          {/* Industry Benchmarks Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
              <h2 className="text-xl font-black uppercase tracking-widest mb-8 italic">Industry Structural Benchmarks</h2>
              <div className="space-y-8">
                {industryBenchmarks.map((bench, idx) => (
                  <div key={idx} className="p-6 rounded-xl bg-surface-container-low/50 hover:bg-surface-container-low transition-all border border-transparent hover:border-outline-variant/20 group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <h3 className="font-headline text-2xl font-bold text-on-background group-hover:text-primary transition-colors italic">{bench.role}</h3>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {bench.topSkills.map(s => (
                            <span key={s} className="px-3 py-1 rounded-md bg-white border border-outline-variant/10 text-[10px] font-black uppercase tracking-tighter">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black italic text-secondary">{bench.avgScore}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Avg Match</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-secondary-container text-on-secondary-container rounded-xl p-8 border border-secondary/20">
                <h4 className="font-black uppercase tracking-widest text-xs mb-4">Top Extraction Region</h4>
                <div className="text-2xl font-black italic">Remote-First / North America</div>
                <p className="text-sm mt-2 opacity-70 italic">74% of high-voltage resumes are targeting these nodes.</p>
              </div>
              <div className="bg-tertiary-container text-on-tertiary-container rounded-xl p-8 border border-tertiary/20">
                <h4 className="font-black uppercase tracking-widest text-xs mb-4">Peak Hiring Pulse</h4>
                <div className="text-2xl font-black italic">Q3 - Early Autumn</div>
                <p className="text-sm mt-2 opacity-70 italic">Market resonance historically peaks during this interval.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-zinc-50 border-t border-surface-container py-10 mt-auto opacity-40">
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
