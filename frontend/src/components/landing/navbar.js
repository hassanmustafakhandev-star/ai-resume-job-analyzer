"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Upload } from "lucide-react"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? "glass border-b py-3" : "bg-transparent py-5"
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Brand */}
        <Link href="/" className="text-2xl font-bold italic tracking-tight text-white group">
          Electric <span className="text-pink-500 group-hover:text-purple-400 transition-colors">Resume</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#analyzer" className="hover:text-white transition-colors">Analyzer</Link>
          <Link href="#history" className="hover:text-white transition-colors">History</Link>
          <Link href="#market" className="hover:text-white transition-colors">Market Insights</Link>
        </div>

        {/* Right Action */}
        <div className="hidden md:flex items-center gap-4">
          <button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all active:scale-95">
            <Upload size={16} />
            Upload Resume
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass absolute top-full left-0 w-full p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <Link href="#analyzer" className="text-lg" onClick={() => setIsOpen(false)}>Analyzer</Link>
          <Link href="#history" className="text-lg" onClick={() => setIsOpen(false)}>History</Link>
          <Link href="#market" className="text-lg" onClick={() => setIsOpen(false)}>Market Insights</Link>
          <button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-5 py-3 rounded-xl text-center font-semibold">
            Upload Resume
          </button>
        </div>
      )}
    </nav>
  )
}
