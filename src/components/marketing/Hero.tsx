"use client"

import { ArrowRight, Search, Code2, Sparkles, Command } from "lucide-react"
import Link from "next/link"

export const Hero = () => {
  return (
    <section className="relative w-full bg-[#fafafa] overflow-hidden pt-16 pb-32 border-b border-slate-200/50">
      {/* Absolute minimalist background */}
      <div className="absolute inset-0 flex justify-center pointer-events-none overflow-hidden">
        <div className="w-full max-w-[1200px] h-full relative">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-slate-200/40 to-slate-100/10 blur-[100px]" />
          <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-100/20 to-transparent blur-[100px]" />
        </div>
      </div>

      <div className="relative z-10 max-w-[1000px] mx-auto px-6 text-center">
        
        {/* Elegant Headline */}
        <h1 className="text-[3.5rem] md:text-[5.5rem] font-bold tracking-[-0.04em] text-[#111] mb-6 leading-[1.05]">
          Your Ultimate <br className="hidden md:block" />
          All-in-One AI Workspace.
        </h1>

        {/* Crisp Sub-headline */}
        <p className="text-[17px] md:text-[19px] text-[#666] max-w-2xl mx-auto leading-[1.6] mb-12">
          Why pay for 10 different AI tools? Get an advanced AI Chat, 8+ tailored Content Generators, Document Knowledge Hub, and GitHub Intelligence all in one unified platform.
        </p>

        {/* Clean Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <button className="h-[46px] px-6 rounded-lg bg-[#111] hover:bg-[#222] text-white text-[15px] font-medium transition-colors flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)]">
              Start Building
              <ArrowRight size={15} />
            </button>
          </Link>
          <Link href="#solutions" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto h-12 px-6 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              See How It Works
            </button>
          </Link>
        </div>

        {/* Premium Command Palette Mockup */}
        <div className="mt-24 max-w-[640px] mx-auto">
          <div className="w-full rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] p-2 hover:-translate-y-2 transition-transform duration-500 ease-out">
            <div className="w-full rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-sm text-left">
              
              {/* Search Bar */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
                <Search size={18} className="text-slate-400" />
                <span className="text-[15px] text-slate-400 font-medium">Write a high-converting email</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-sans font-semibold text-slate-500">⌘</kbd>
                  <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded border border-slate-200 bg-slate-50 text-[10px] font-sans font-semibold text-slate-500">K</kbd>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2 bg-[#fcfcfc]">
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-indigo-50 border border-indigo-100/50 text-indigo-700 cursor-default mb-1">
                  <Sparkles size={16} className="text-indigo-500" />
                  <span className="text-[14px] font-medium">Use Email Generator</span>
                  <kbd className="ml-auto hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-sans font-medium text-indigo-400">↵</kbd>
                </div>
                
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 cursor-default mb-1">
                  <Code2 size={16} className="text-slate-400" />
                  <span className="text-[14px] font-medium">Chat with Knowledge Hub documents</span>
                </div>
                
                <div className="flex items-center gap-3 px-3 py-3 rounded-lg text-slate-600 hover:bg-slate-50 cursor-default">
                  <Command size={16} className="text-slate-400" />
                  <span className="text-[14px] font-medium">Analyze GitHub repository architecture</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
