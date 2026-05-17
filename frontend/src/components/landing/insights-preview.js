"use client"

import { motion } from "framer-motion"
import { BarChart3, ArrowUpRight, Zap, Globe, Briefcase } from "lucide-react"

const skillsData = [
  { skill: "AI Strategy", growth: "+82%", color: "bg-primary" },
  { skill: "Product Design", growth: "+45%", color: "bg-purple-600" },
  { skill: "Data Analysis", growth: "+38%", color: "bg-secondary" },
  { skill: "Growth Marketing", growth: "+25%", color: "bg-tertiary" }
]

export default function InsightsPreview() {
  return (
    <section className="py-24 px-6 relative overflow-hidden" id="market-insights">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(179,0,102,0.03)_0%,transparent_70%)]" />

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Text Side */}
        <div className="space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-label-sm font-black uppercase tracking-widest">
            <BarChart3 size={16} />
            Market Intelligence
          </div>
          <h2 className="text-headline-md font-black tracking-tight leading-tight text-on-background">
            Data-Driven <br />
            <span className="text-secondary italic">Career Strategy.</span>
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            Stop guessing what employers want. Our engine scans real-time job market data to identify the exact skills and keywords trending in your industry right now.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-1">
                <div className="text-2xl font-black text-on-background flex items-center gap-2">
                   10M+ <Briefcase className="text-zinc-300" size={18} />
                </div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Jobs Analyzed</div>
             </div>
             <div className="space-y-1">
                <div className="text-2xl font-black text-secondary flex items-center gap-2">
                   Global <Globe className="text-secondary/30" size={18} />
                </div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Market Coverage</div>
             </div>
          </div>
        </div>

        {/* Visual Side: Animated Charts */}
        <div className="relative z-10">
          <div className="glass-panel p-10 rounded-[3rem] border border-white/50 shadow-2xl space-y-8 relative overflow-hidden">
             {/* Sparkles effect inside the card */}
             <div className="absolute top-4 right-4"><Zap className="text-secondary/20 animate-pulse" size={40} /></div>

             <div className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mb-6">Trending Skills 2026</div>
             
             <div className="space-y-6">
                {skillsData.map((s, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-sm font-bold text-on-background">{s.skill}</span>
                       <span className="text-xs font-black text-secondary flex items-center gap-1">
                          {s.growth} <ArrowUpRight size={12} />
                       </span>
                    </div>
                    <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                       <motion.div
                         initial={{ width: 0 }}
                         whileInView={{ width: s.growth.replace('+', '') }}
                         transition={{ duration: 1, delay: i * 0.1 }}
                         viewport={{ once: true }}
                         className={`h-full ${s.color} rounded-full`}
                       />
                    </div>
                  </div>
                ))}
             </div>

             <div className="pt-6 border-t border-zinc-100 flex justify-between items-center text-[10px] font-bold text-zinc-400">
                <span>Updated every 24h</span>
                <span className="text-secondary animate-pulse">● Live Engine</span>
             </div>
          </div>

          {/* Floating badge */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -bottom-6 -right-6 glass-panel p-4 rounded-2xl border border-secondary/30 shadow-xl shadow-secondary/10 flex items-center gap-3"
          >
             <div className="w-8 h-8 bg-secondary text-white rounded-full flex items-center justify-center">
                <Zap size={16} />
             </div>
             <div className="text-xs font-bold">In-Demand Skill Detected!</div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
