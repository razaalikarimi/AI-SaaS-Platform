/* eslint-disable */
"use client"

import { Zap, MessageSquare, GitBranch, FolderOpen, ArrowRight, Check } from "lucide-react"
import Link from "next/link"

const PILLARS = [
  {
    badge: "Smart Chat",
    title: "AI Chat with Live Web",
    description: "Ask questions, get live weather, check facts from Wikipedia, or get help with coding problems.",
    bullets: [
      "Check live weather and world timezones",
      "Get facts with real Wikipedia sources",
      "Fast answers that appear instantly"
    ],
    href: "/chat",
    cta: "Start Chatting",
    icon: MessageSquare,
  },
  {
    badge: "8+ Generators",
    title: "AI Tools for Daily Work",
    description: "Ready-to-use tools to write code, blog posts, professional emails, resumes, and SEO content.",
    bullets: [
      "Write code in Python, JavaScript, and more",
      "Create blog posts and LinkedIn updates",
      "Draft professional emails in 5 seconds"
    ],
    href: "/tools",
    cta: "Explore Tools",
    icon: Zap,
  },
  {
    badge: "Document Search",
    title: "Chat with your PDF Files",
    description: "Upload your PDFs, study notes, or guides and ask questions. The AI will find answers with exact page numbers.",
    bullets: [
      "Upload PDFs, notes, and documents",
      "Get answers with exact page citations",
      "Your uploaded files stay private and safe"
    ],
    href: "/knowledge",
    cta: "Upload a PDF",
    icon: FolderOpen,
  },
  {
    badge: "GitHub Insights",
    title: "GitHub Project Checker",
    description: "Enter any GitHub repository link to see project structure, check for bugs, and get easy tips to improve speed.",
    bullets: [
      "Check GitHub repository health score",
      "Find code bugs and outdated packages",
      "Understand complex projects easily"
    ],
    href: "/repomind",
    cta: "Check a Repository",
    icon: GitBranch,
  },
]

export const Features = () => {
  return (
    <section className="bg-slate-50/60 py-20 border-b border-slate-200" id="solutions">
      <div className="max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-white border border-slate-200 px-3 py-1 rounded-full">
            What You Can Do
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-3 mb-3">
            4 simple ways DevKit helps you work faster.
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Instead of opening 5 different websites, everything you need is right here in one simple dashboard.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {PILLARS.map((p, i) => {
            const Icon = p.icon
            return (
              <div 
                key={i} 
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                      <Icon size={18} />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-5">
                    {p.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {p.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                        <Check size={14} className="text-emerald-600 shrink-0" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Link href={p.href}>
                  <button className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    {p.cta} <ArrowRight size={12} />
                  </button>
                </Link>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
