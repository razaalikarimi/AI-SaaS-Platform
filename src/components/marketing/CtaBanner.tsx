/* eslint-disable */
"use client"

import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react"
import Link from "next/link"

export const CtaBanner = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-10 md:p-16 text-center shadow-xl">
          
          {/* Subtle glow */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-slate-700/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
              Empower your development workflow with DevKit.
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-8">
              Join thousands of developers and product teams generating code, searching live web data, and auditing codebases with sub-second speed.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href="/chat">
                <button className="h-12 px-7 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer">
                  Start Free Guest Trial
                  <ArrowRight size={15} />
                </button>
              </Link>

              <Link href="/tools">
                <button className="h-12 px-7 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  Explore 8+ Tools
                </button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-6">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>3 free prompts on entry • Instant setup • No credit card needed</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
