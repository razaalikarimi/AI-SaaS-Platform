"use client"

import { Zap, MessageSquare, GitBranch, FolderOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

const FEATURES = [
  {
    title: "AI Chat",
    description: "Chat with an advanced AI model to get quick answers, solve problems, and write code.",
    icon: MessageSquare,
  },
  {
    title: "Document Search",
    description: "Upload your files and chat with them to quickly find the exact information you need.",
    icon: FolderOpen,
  },
  {
    title: "Smart Generators",
    description: "Use our pre-built tools to instantly generate emails, blog posts, and code snippets.",
    icon: Zap,
  },
  {
    title: "GitHub Tools",
    description: "Connect your GitHub account to map out your project, check for security issues, and review code.",
    icon: GitBranch,
  },
]

export const Features = () => {
  return (
    <section className="bg-white border-t border-slate-100" id="solutions">
      <div className="section-padding max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
            Our Capabilities
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-3 mb-4">
            Everything your team needs in one platform
          </h2>
          <p className="text-slate-500 text-[15px] max-w-2xl mx-auto leading-relaxed">
            DevKit brings all the essential tools you need into one clean dashboard.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {FEATURES.map((f, i) => (
            <Link key={i} href="/dashboard" className="block h-full">
              <div className="border border-slate-200 bg-white p-6 rounded-xl h-full flex flex-col justify-between group hover:border-slate-300 hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all cursor-pointer">
                <div>
                  {/* Icon — simple light gray background */}
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mb-5 flex-shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <f.icon size={18} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </div>

                {/* Hover link */}
                <div className="flex items-center gap-1 pt-5 text-xs font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ArrowRight size={11} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-14" />

        {/* Bottom CTA Banner — clean off-white */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">
              Ready to transform your workflow?
            </h3>
            <p className="text-slate-500 max-w-md leading-relaxed text-sm">
              Join forward-thinking software engineering and product teams already building with DevKit.
            </p>
          </div>
          <Link href="/dashboard" className="flex-shrink-0">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 h-11 rounded-md transition-colors flex items-center gap-2">
              Start Free Trial
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>

      </div>
    </section>
  )
}
