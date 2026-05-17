"use client"

import { motion } from "framer-motion"
import { History, TrendingUp, Clock, FileCheck } from "lucide-react"

const historyData = [
  { version: "Initial Draft", date: "2 mins ago", score: 45, color: "bg-zinc-100" },
  { version: "Keyword Optimized", date: "1 min ago", score: 72, color: "bg-primary/20" },
  { version: "Electric Final", date: "Just now", score: 98, color: "hero-gradient" }
]

export default function HistoryPreview() {
  return (
    <section className="py-24 px-6 bg-zinc-50/50" id="history">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Visual Side */}
        <div className="relative order-2 lg:order-1">
          <div className="space-y-4">
            {historyData.map((item, i) => (
              <motion.div
                key={i}
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="glass-panel p-6 rounded-3xl border border-white/50 flex items-center justify-between shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${i === 2 ? "hero-gradient shadow-lg shadow-primary/30" : "bg-zinc-200 text-zinc-500"}`}>
                    {i === 2 ? <FileCheck size={24} /> : <Clock size={24} />}
                  </div>
                  <div>
                    <div className="font-black text-on-background">{item.version}</div>
                    <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">{item.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-black italic ${i === 2 ? "text-primary" : "text-zinc-400"}`}>
                    {item.score}%
                  </div>
                  <div className="text-[10px] font-bold text-zinc-400">ATS Score</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Decorative Graph Line */}
          <svg className="absolute -left-8 top-0 h-full w-4 hidden lg:block overflow-visible">
             <motion.path
               initial={{ pathLength: 0 }}
               whileInView={{ pathLength: 1 }}
               transition={{ duration: 1.5 }}
               viewport={{ once: true }}
               d="M 10 20 L 10 250"
               fill="none"
               stroke="url(#grad)"
               strokeWidth="4"
               strokeDasharray="8 8"
             />
             <defs>
               <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                 <stop offset="0%" stopColor="#b30066" />
                 <stop offset="100%" stopColor="#e6e8ea" />
               </linearGradient>
             </defs>
          </svg>
        </div>

        {/* Text Side */}
        <div className="space-y-8 order-1 lg:order-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-label-sm font-black uppercase tracking-widest">
            <History size={16} />
            Version Control
          </div>
          <h2 className="text-headline-md font-black tracking-tight leading-tight text-on-background">
            Never lose your <br />
            <span className="text-primary italic">Momentum.</span>
          </h2>
          <p className="text-body-lg text-on-surface-variant max-w-lg">
            Track your journey from a generic CV to an elite career profile. Save every iteration, compare score improvements, and see exactly which changes triggered the biggest impact.
          </p>
          <div className="flex items-center gap-4 text-primary font-bold">
             <TrendingUp size={24} />
             <span>Average user score increases by 45% after three iterations.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
