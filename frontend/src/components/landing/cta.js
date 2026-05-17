"use client"

import { Rocket } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-5xl mx-auto">
        <div className="relative glass-card rounded-[3rem] p-12 md:p-20 text-center overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-transparent to-purple-500/10 -z-10" />
          
          <div className="space-y-8 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/30 rotate-12">
              <Rocket className="text-white" size={40} />
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Ready to electrify your <br />
              <span className="text-gradient">job search?</span>
            </h2>

            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Join thousands of professionals who have used Electric Resume to land roles at top-tier companies.
            </p>

            <button className="bg-white text-slate-950 px-10 py-5 rounded-full font-black text-lg hover:bg-slate-200 transition-all active:scale-95 shadow-2xl shadow-white/10">
              Upload Resume Now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
