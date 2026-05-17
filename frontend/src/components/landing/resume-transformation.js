"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { Sparkles, Zap, Star, Target, TrendingUp, User, Mail, Phone, MapPin } from "lucide-react"

export default function ResumeTransformation() {
  const [stage, setStage] = useState("bland") // bland, scanning, electric
  const [score, setScore] = useState(45)

  useEffect(() => {
    const timer = setInterval(() => {
      setStage((current) => {
        if (current === "bland") return "scanning"
        if (current === "scanning") return "electric"
        return "bland"
      })
    }, 6000) // Longer cycle for better visibility
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (stage === "electric") {
      let start = 45
      const end = 98
      const timer = setInterval(() => {
        start += 1
        if (start >= end) {
          setScore(end)
          clearInterval(timer)
        } else {
          setScore(start)
        }
      }, 20)
      return () => clearInterval(timer)
    } else {
      setScore(45)
    }
  }, [stage])

  return (
    <div className="relative w-full aspect-[3/4.2] max-w-[450px] mx-auto group">
      {/* Container with shadow and border */}
      <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        
        <AnimatePresence mode="wait">
          {stage === "bland" && (
            <motion.div
              key="bland"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white p-8 flex flex-col font-serif"
            >
              {/* Boring Resume Content */}
              <div className="text-center border-b border-zinc-300 pb-4 mb-6">
                <h3 className="text-2xl font-bold text-black uppercase">John Doe</h3>
                <div className="text-[10px] text-zinc-600 flex justify-center gap-4 mt-1">
                  <span>j.doe@email.com</span>
                  <span>555-0199</span>
                  <span>New York, NY</span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold border-b border-zinc-300 mb-2 uppercase">Experience</h4>
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between font-bold text-xs">
                          <span>Job Title {i}</span>
                          <span>2018 - Present</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-100 rounded" />
                        <div className="h-2 w-5/6 bg-zinc-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold border-b border-zinc-300 mb-2 uppercase">Education</h4>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold">University Name</span>
                    <span>2014 - 2018</span>
                  </div>
                </div>

                <div className="flex-grow flex items-end">
                   <div className="w-full h-24 bg-zinc-50 border border-dashed border-zinc-300 flex items-center justify-center text-[10px] text-zinc-400">
                      Standard Gray Template #402
                   </div>
                </div>
              </div>

              <div className="absolute inset-0 bg-zinc-500/5 pointer-events-none" />
              <div className="absolute top-4 right-4 bg-zinc-200 px-2 py-0.5 rounded text-[8px] font-sans font-bold text-zinc-500 tracking-widest uppercase">
                Low Performance
              </div>
            </motion.div>
          )}

          {stage === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center z-20 overflow-hidden"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_30px_rgba(179,0,102,0.4)]"
              />
              <div className="mt-6 text-xl font-black text-white italic tracking-tighter">ELECTRIFYING...</div>
              <div className="text-xs text-primary font-mono tracking-[0.4em] uppercase mt-2 animate-pulse">Injecting Vivid Pop</div>

              <motion.div 
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute left-0 w-full h-0.5 bg-primary shadow-[0_0_20px_rgba(179,0,102,1)]"
              />
            </motion.div>
          )}

          {stage === "electric" && (
            <motion.div
              key="electric"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-white flex flex-col font-sans"
            >
              {/* Electric Resume Content */}
              <div className="bg-gradient-to-br from-primary to-purple-700 p-8 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 blur-3xl rounded-full" />
                
                <div className="flex gap-6 items-center relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-2xl">
                    <User size={40} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black italic tracking-tighter">JOHN DOE</h3>
                    <div className="text-sm font-bold text-white/80 uppercase tracking-widest mt-1">Senior Product Designer</div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6 text-[10px] font-bold text-white/60">
                   <div className="flex items-center gap-1"><Mail size={10} /> john@electric.ai</div>
                   <div className="flex items-center gap-1"><MapPin size={10} /> San Francisco, CA</div>
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col gap-6">
                <div>
                   <div className="flex justify-between items-end mb-3">
                      <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Key Strengths</h4>
                      <span className="text-[10px] font-bold text-zinc-400 italic">Vivid Pop Optimization</span>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      {["Impact Driven", "ATS Focused", "Strategic", "Visual Mastery"].map((skill) => (
                        <div key={skill} className="bg-zinc-50 rounded-lg p-2 border border-zinc-100 flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                           <span className="text-[10px] font-bold text-zinc-700">{skill}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex-grow">
                   <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-3">Professional Impact</h4>
                   <div className="space-y-4">
                      <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 relative">
                         <div className="absolute top-2 right-2"><Star className="text-primary" size={12} /></div>
                         <div className="text-[10px] font-black text-primary mb-1 uppercase tracking-widest leading-none">Record of Excellence</div>
                         <div className="text-xs font-bold text-zinc-800 leading-tight">Increased conversion rates by 42% through AI-driven design iteration.</div>
                      </div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "95%" }}
                            className="h-full bg-primary"
                         />
                      </div>
                   </div>
                </div>

                <div className="mt-auto flex justify-between items-center bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-400 uppercase leading-none">ATS Score</span>
                      <span className="text-3xl font-black text-primary italic leading-none mt-1">{score}%</span>
                   </div>
                   <div className="flex gap-2">
                      <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center text-primary border border-primary/10">
                        <Zap size={20} />
                      </div>
                      <div className="w-10 h-10 bg-primary rounded-xl shadow-lg shadow-primary/30 flex items-center justify-center text-white">
                        <TrendingUp size={20} />
                      </div>
                   </div>
                </div>
              </div>

              <div className="absolute top-4 right-4 z-20">
                <div className="bg-primary text-white text-[8px] font-black px-2 py-1 rounded shadow-xl uppercase tracking-widest animate-bounce">
                   Elite
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Label */}
      <div className="absolute -left-12 top-1/2 -rotate-90 hidden lg:block">
         <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.5em] whitespace-nowrap">Transformation Journey</span>
      </div>
    </div>
  )
}
