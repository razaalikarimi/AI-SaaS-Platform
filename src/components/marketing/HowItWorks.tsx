"use client"

import { Database, Zap, Rocket } from "lucide-react"

const STEPS = [
  {
    icon: Database,
    title: "1. Add your data",
    description: "Upload your documents or link your GitHub repository so the AI can understand your work."
  },
  {
    icon: Zap,
    title: "2. Choose a tool",
    description: "Use our chat, pick a specific AI generator, or run a code review on your repository."
  },
  {
    icon: Rocket,
    title: "3. Get fast results",
    description: "Let the AI generate content, find bugs, or answer your questions in seconds."
  }
]

export const HowItWorks = () => {
  return (
    <section className="bg-white py-24 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-20">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-3">
            How to use DevKit
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
          {/* Connecting Line (Desktop only) */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-slate-100 -z-10" />

          {STEPS.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 shadow-sm flex items-center justify-center text-indigo-600 mb-6">
                <step.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed max-w-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
