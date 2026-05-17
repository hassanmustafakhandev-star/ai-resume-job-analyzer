"use client"

import { Sparkles, ArrowRight, PlayCircle, FileText, CheckCircle } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-pink-600/20 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <div className="space-y-8 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-pink-400 text-sm font-semibold border-pink-500/20">
            <Sparkles size={16} />
            AI-Powered Analysis
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
            Supercharge Your <br />
            <span className="text-gradient">Career in Full Color</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto md:mx-0">
            The intelligent resume analyzer that doesn't just scan—it electrifies. 
            Transform your experience into a narrative that recruiters can't ignore.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button className="bg-white text-slate-950 px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95 group">
              Start Analyzing Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="glass px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
              <PlayCircle size={20} />
              See How It Works
            </button>
          </div>
        </div>

        {/* Right Content: Mock UI */}
        <div className="relative group">
          {/* Main Card */}
          <div className="glass-card rounded-[2rem] p-8 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <FileText className="text-slate-300" />
              </div>
              <div className="flex-1">
                <div className="h-2 w-1/3 bg-white/20 rounded-full mb-2" />
                <div className="h-2 w-1/4 bg-white/10 rounded-full" />
              </div>
              <div className="text-xs text-slate-500 font-mono">82% Match</div>
            </div>

            {/* Skeletons */}
            <div className="space-y-4">
              {[80, 95, 70, 85].map((width, i) => (
                <div key={i} className="h-4 bg-white/[0.05] rounded-lg relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" 
                    style={{ animationDelay: `${i * 0.5}s` }}
                  />
                  <div className={`h-full bg-slate-800/50 rounded-lg`} style={{ width: `${width}%` }} />
                </div>
              ))}
            </div>

            {/* Floating Card */}
            <div className="absolute bottom-10 right-[-20px] glass-card p-4 rounded-2xl shadow-purple-500/20 border-purple-500/30 animate-bounce duration-[3000ms]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Insight Found</div>
                  <div className="text-xs font-semibold">Increased sales by 40%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
