import Link from "next/link"

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-sm">
        {/* Left: Brand */}
        <div className="text-xl font-bold italic text-white">
          Electric <span className="text-pink-500">Resume</span>
        </div>

        {/* Center: Links */}
        <div className="flex items-center gap-8 text-slate-400">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/support" className="hover:text-white transition-colors">Support</Link>
        </div>

        {/* Right: Copyright */}
        <div className="text-slate-500 font-mono">
          © {new Date().getFullYear()} Electric Resume AI.
        </div>
      </div>
    </footer>
  )
}
