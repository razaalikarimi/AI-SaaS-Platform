"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

export const CtaBanner = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden bg-indigo-50 border border-indigo-100 py-16 px-8 text-center shadow-sm">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/60 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Ready to try DevKit?
            </h2>
            <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Start using DevKit today to manage your daily tasks, generate code, and review your GitHub repositories.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard">
                <button className="h-14 px-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-base font-bold transition-colors shadow-md flex items-center gap-2 group">
                  Start Free Trial
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/pricing">
                <button className="h-14 px-8 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-base font-semibold transition-colors border border-slate-200 shadow-sm">
                  View Pricing
                </button>
              </Link>
            </div>
            <p className="text-slate-500 text-sm mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
