/* eslint-disable */
"use client"

import React, { useState } from "react"
import { 
  ArrowRight, 
  MessageSquare, 
  Code2, 
  FolderOpen, 
  GitBranch, 
  Check, 
  Copy,
  Sun,
  Cloud,
  FileCheck,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const TABS = [
  {
    id: "chat",
    name: "AI Chat",
    badge: "Live Web",
    title: "Ask anything with live weather and real-time facts",
    query: "What is the live weather in Delhi, Mumbai, and Bengaluru right now?",
  },
  {
    id: "code",
    name: "Code Generator",
    badge: "Fast & Clean",
    title: "Write working code in any programming language",
    query: "Write a Razorpay UPI payment order function in Next.js",
  },
  {
    id: "knowledge",
    name: "Chat with PDFs",
    badge: "Upload Files",
    title: "Upload your documents and ask questions about them",
    query: "What are the employee benefits and rules in our company_handbook.pdf?",
  },
  {
    id: "repomind",
    name: "GitHub Checker",
    badge: "Code Review",
    title: "Check your GitHub project structure and find improvements",
    query: "Check our Next.js repository for bugs and speed tips",
  }
]

export const Hero = () => {
  const [activeTab, setActiveTab] = useState(TABS[0].id)
  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0]
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    const code = `"use server"

import Razorpay from "razorpay"

export async function createPaymentOrder(amountInRupees: number) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET!
  })

  // Convert to paise (₹499 = 49900 paise)
  const order = await razorpay.orders.create({
    amount: amountInRupees * 100,
    currency: "INR",
    receipt: \`rcpt_\${Date.now()}\`
  })

  return { success: true, order }
}`
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success("Code copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative w-full bg-white pt-12 pb-20 border-b border-slate-200">
      
      {/* Background subtle dots */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none opacity-50" />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        
        {/* Top simple badge */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>DevKit AI • Free Indian Developer Suite</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">No sign up needed to try</span>
          </div>
        </div>

        {/* Super simple, human headline */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight mb-5">
            All your AI tools <br className="hidden sm:inline" />
            in one simple place.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl mx-auto">
            Chat with AI, search live Indian city weather, write clean code, chat with your PDF files, and review GitHub repositories.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <Link href="/chat">
            <button className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs">
              Try Chat for Free
              <ArrowRight size={14} />
            </button>
          </Link>

          <Link href="/tools">
            <button className="h-11 px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer">
              Explore 8+ AI Tools
            </button>
          </Link>
        </div>

        {/* Simple 4-box highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-14 text-center">
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-sm font-bold text-slate-900">Super Fast</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Instant responses</div>
          </div>
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-sm font-bold text-slate-900">Indian Cities</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Live weather & facts</div>
          </div>
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-sm font-bold text-slate-900">8+ Tools</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Code, blogs & emails</div>
          </div>
          <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
            <div className="text-sm font-bold text-slate-900">UPI & INR</div>
            <div className="text-[11px] text-slate-500 mt-0.5">From ₹0 to ₹499</div>
          </div>
        </div>

        {/* Interactive Simple Preview Box */}
        <div className="w-full max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          
          {/* Tabs */}
          <div className="flex items-center overflow-x-auto border-b border-slate-200 bg-slate-50 px-3 pt-2 gap-1 scrollbar-none">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-t-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border-t border-x
                    ${isActive
                      ? "bg-white text-slate-900 border-slate-200"
                      : "border-transparent text-slate-500 hover:text-slate-800"}
                  `}
                >
                  <span>{tab.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${isActive ? "bg-indigo-50 text-indigo-700" : "bg-slate-200/60 text-slate-500"}`}>
                    {tab.badge}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Body */}
          <div className="p-5 md:p-6 bg-white">
            
            {/* User prompt */}
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 mb-4 text-xs">
              <span className="font-bold text-indigo-600 shrink-0">You asked:</span>
              <span className="text-slate-800 truncate font-medium">{currentTab.query}</span>
            </div>

            {/* TAB 1: AI Chat (Indian Cities Weather) */}
            {activeTab === "chat" && (
              <div className="space-y-3">
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3 font-semibold">City</th>
                        <th className="py-2 px-3 font-semibold">Temperature</th>
                        <th className="py-2 px-3 font-semibold">Condition</th>
                        <th className="py-2 px-3 font-semibold">Humidity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900">Delhi, NCR</td>
                        <td className="py-2 px-3">28°C (82°F)</td>
                        <td className="py-2 px-3 flex items-center gap-1"><Sun size={12} className="text-amber-500" /> Clear Sky</td>
                        <td className="py-2 px-3">45%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900">Mumbai, Maharashtra</td>
                        <td className="py-2 px-3">30°C (86°F)</td>
                        <td className="py-2 px-3 flex items-center gap-1"><Cloud size={12} className="text-slate-400" /> Partly Cloudy</td>
                        <td className="py-2 px-3">72%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-slate-900">Bengaluru, Karnataka</td>
                        <td className="py-2 px-3">24°C (75°F)</td>
                        <td className="py-2 px-3 flex items-center gap-1"><Cloud size={12} className="text-slate-400" /> Pleasant Breeze</td>
                        <td className="py-2 px-3">58%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Live satellite weather data updated across Indian metro regions in real-time.</span>
                </div>
              </div>
            )}

            {/* TAB 2: Code (Razorpay / Indian Payment Example) */}
            {activeTab === "code" && (
              <div className="rounded-lg bg-slate-900 text-slate-200 overflow-hidden border border-slate-800">
                <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950 text-xs border-b border-slate-800">
                  <span className="text-slate-400 font-mono text-[11px]">actions/razorpay.ts</span>
                  <button 
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer text-[11px]"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
                <pre className="p-3.5 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`"use server"

import Razorpay from "razorpay"

export async function createPaymentOrder(amountInRupees: number) {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_SECRET!
  })

  // Convert to paise (₹499 = 49900 paise)
  const order = await razorpay.orders.create({
    amount: amountInRupees * 100,
    currency: "INR",
    receipt: \`rcpt_\${Date.now()}\`
  })

  return { success: true, order }
}`}
                </pre>
              </div>
            )}

            {/* TAB 3: Knowledge (PDF) */}
            {activeTab === "knowledge" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-xs">
                  <FileCheck size={16} className="text-indigo-600 shrink-0" />
                  <span className="font-semibold text-slate-900">Found in: company_handbook.pdf (Page 6)</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Provident Fund (PF) and Medical Health Insurance active from Day 1.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Flexible hybrid working policy for all engineering teams across India.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-emerald-600 shrink-0" />
                    <span>Annual ₹25,000 learning stipend for AI certifications and technical books.</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: RepoMind */}
            {activeTab === "repomind" && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="text-[10px] text-slate-400">Project</div>
                    <div className="font-bold text-slate-900 truncate">devkit-india-app</div>
                  </div>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
                    <div className="text-[10px] text-emerald-700">Health Score</div>
                    <div className="font-bold text-emerald-800">98 / 100 (Clean)</div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                    <div className="text-[10px] text-slate-400">Bugs</div>
                    <div className="font-bold text-slate-900">0 Found</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                  <strong className="text-slate-800">Tip: </strong>
                  Next.js and Razorpay API routes are properly optimized. Build speed is fast and ready for production.
                </div>
              </div>
            )}

            {/* Bottom link */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">{currentTab.title}</span>
              <Link href={activeTab === "code" || activeTab === "tools" ? "/tools" : activeTab === "repomind" ? "/repomind" : activeTab === "knowledge" ? "/knowledge" : "/chat"}>
                <button className="font-semibold text-indigo-600 hover:underline cursor-pointer">
                  Try it yourself →
                </button>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
