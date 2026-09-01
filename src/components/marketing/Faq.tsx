/* eslint-disable */
"use client"

import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

const FAQS = [
  {
    q: "What is DevKit AI and what can I do with it?",
    a: "DevKit AI is an all-in-one assistant for developers, students, and professionals. You can chat with AI to get real-time answers (like live weather), write clean code in any language, chat with your uploaded PDF files, and check GitHub projects for bugs."
  },
  {
    q: "Do I need to sign up to try the website?",
    a: "No! You can try 3 AI chats and 2 tools for free without creating an account. When you're ready, you can sign up for free in 5 seconds to save your chat history."
  },
  {
    q: "How does chatting with PDF files work?",
    a: "You simply upload any PDF, notes, or documentation in the Knowledge tab. Then you can ask questions, and the AI will answer using only the information in your file, telling you the exact page number."
  },
  {
    q: "Which programming languages are supported?",
    a: "DevKit supports all popular languages including Python, JavaScript, TypeScript, React, Next.js, HTML/CSS, SQL, C++, Java, and Go."
  },
  {
    q: "Is it completely free to use?",
    a: "Yes! The Free plan gives you 10 free chats every single day and access to all 8+ tools. If you need unlimited daily chats, you can upgrade to the Pro plan anytime."
  }
]

export const Faq = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="bg-slate-50/60 py-20 border-b border-slate-200" id="faq">
      <div className="max-w-3xl mx-auto px-6">
        
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-white border border-slate-200 px-3 py-1 rounded-full">
            Questions & Answers
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mt-3 mb-2">
            Common questions answered.
          </h2>
          <p className="text-slate-500 text-sm">
            Everything you need to know about DevKit and getting started.
          </p>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div 
                key={i} 
                className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-semibold text-slate-900 leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={16} 
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-slate-900" : ""}`} 
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
