/* eslint-disable */
"use client"

import { MousePointerClick, Zap, Copy } from "lucide-react"

const STEPS = [
  {
    step: "1",
    icon: MousePointerClick,
    title: "Pick what you want to do",
    description: "Choose to chat with AI, pick a tool like Code Generator or Email Writer, or upload a PDF document."
  },
  {
    step: "2",
    icon: Zap,
    title: "Let AI generate the answer",
    description: "Type your topic or question. The AI fetches live information or writes your code in 1-2 seconds."
  },
  {
    step: "3",
    icon: Copy,
    title: "Copy and use your result",
    description: "Copy the code or text with one click, or save your chats so you can resume them anytime."
  }
]

export const HowItWorks = () => {
  return (
    <section className="bg-white py-20 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-3 mb-2">
            Easy to use in 3 simple steps.
          </h2>
          <p className="text-slate-500 text-sm">
            No complicated setup or long learning curve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <div 
              key={i} 
              className="bg-slate-50/70 border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <s.icon size={17} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">
                    Step {s.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
