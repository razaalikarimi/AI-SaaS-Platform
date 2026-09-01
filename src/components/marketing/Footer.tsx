"use client"

import Link from "next/link"
import { Share2, Globe, Link2, Mail } from "lucide-react"

const FOOTER_LINKS = {
  Platform: [
    { label: "AI Chat",      href: "/chat" },
    { label: "Knowledge Hub",href: "/knowledge" },
    { label: "RepoMind",     href: "/repomind" },
    { label: "AI Tools",     href: "/tools" },
    { label: "Workflows",    href: "#" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers",  href: "#" },
    { label: "Blog",     href: "#" },
    { label: "Press Kit",href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy",  href: "#" },
    { label: "Terms of Service",href: "#" },
    { label: "Cookie Settings", href: "#" },
    { label: "Security",        href: "#" },
  ],
}

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 pt-16 pb-8">

        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-14">

          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 w-fit">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
                <span className="text-white text-xs font-black">D</span>
              </div>
              <span className="text-base font-bold text-slate-900">DevKit</span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">
              All your AI tools in one simple place. Built for developers, students, and modern teams in India.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {[
                { icon: Share2, href: "#", label: "Twitter"  },
                { icon: Globe,  href: "#", label: "GitHub"   },
                { icon: Link2,  href: "#", label: "LinkedIn" },
              ].map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
                >
                  <s.icon size={14} />
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([cat, links]) => (
            <div key={cat}>
              <h5 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-4">
                {cat}
              </h5>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter CTA — clean, no glows */}
        <div className="mb-10 p-6 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={14} className="text-slate-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800 mb-0.5">Stay ahead with DevKit</div>
                <div className="text-xs text-slate-500">AI insights & platform news, straight to your inbox.</div>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="you@company.com"
                className="h-9 px-3.5 rounded-md bg-white border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-colors flex-1 md:w-56"
              />
              <button className="h-9 px-5 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-400">
            © 2026 DevKit AI Corporation. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">All systems operational</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
