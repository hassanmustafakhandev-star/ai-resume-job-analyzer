"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

export function NavBar() {
  const pathname = usePathname()

  const links = [
    { name: "Analyzer", href: "/analyze" },
    { name: "History", href: "/dashboard" },
    { name: "Insights", href: "/insights" },
  ]

  return (
    <header className="fixed w-full z-50 transition-all duration-300 shadow-[0_32px_64px_-15px_rgba(179,0,102,0.08)] bg-white/70 backdrop-blur-2xl font-sans font-medium tracking-tight top-0">
      <div className="flex justify-between items-center px-12 py-6 w-full max-w-[1440px] mx-auto space-y-0 bg-zinc-50/50">
        <div className="flex items-center gap-12">
          {/* Brand Logo */}
          <Link 
            href="/" 
            className="text-2xl font-black italic tracking-tighter text-primary hover:scale-[1.02] transition-all duration-300 active:scale-95"
          >
            Electric Resume
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex gap-10 items-center">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm uppercase tracking-widest font-bold transition-all duration-300 active:scale-95 ${
                    isActive 
                      ? "text-primary border-b-2 border-primary pb-1" 
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Trailing Action */}
        <div className="flex items-center gap-6">
          <Link href="/analyze">
            <button className="hero-gradient text-on-primary px-8 py-3.5 rounded-full font-black hover:scale-[1.05] shadow-[0_20px_40px_-10px_rgba(179,0,102,0.3)] transition-all duration-300 flex items-center gap-2 text-sm active:scale-95">
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
              Upload Resume
            </button>
          </Link>
        </div>
      </div>
    </header>
  )
}
