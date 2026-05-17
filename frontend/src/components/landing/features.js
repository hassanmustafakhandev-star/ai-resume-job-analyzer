"use client"

import { Target, Zap, Layout } from "lucide-react"

const features = [
  {
    icon: <Target className="text-pink-500" size={24} />,
    title: "Keyword Optimization",
    description: "Our AI identifies critical keywords from job descriptions to ensure your resume clears the ATS hurdle every time.",
    color: "bg-pink-500/10"
  },
  {
    icon: <Zap className="text-purple-500" size={24} />,
    title: "Action Verb Enhancement",
    description: "Replace passive language with powerful action verbs that quantify your impact and grab recruiter attention.",
    color: "bg-purple-500/10"
  },
  {
    icon: <Layout className="text-indigo-500" size={24} />,
    title: "Formatting Enhancement",
    description: "Clean up your layout and hierarchy with AI-driven suggestions for a professional, modern visual appeal.",
    color: "bg-indigo-500/10"
  }
]

export default function Features() {
  return (
    <section className="py-24 px-6 relative" id="analyzer">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold">Engineered for Success</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Everything you need to transform your application from a standard document into a career-defining asset.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-all duration-300 group cursor-default"
            >
              <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
