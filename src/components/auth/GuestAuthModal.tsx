/* eslint-disable */
"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Check, X, ArrowRight, ShieldCheck, Zap, History, Bot } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface GuestAuthModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: "chat" | "tool" | "general"
}

export const GuestAuthModal = ({
  isOpen,
  onClose,
  reason = "chat",
}: GuestAuthModalProps) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors z-20"
          >
            <X size={18} />
          </button>

          {/* Top Banner */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-7 text-white relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Sparkles size={20} className="text-indigo-200" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                Free Trial Limit Reached
              </span>
            </div>

            <h2 className="text-xl font-bold tracking-tight text-white mb-1.5">
              Enjoying DevKit AI?
            </h2>
            <p className="text-xs text-indigo-100/90 leading-relaxed max-w-sm">
              You've completed your free guest trial. Create a free account in 5 seconds to continue chatting and unlock full platform capabilities.
            </p>
          </div>

          {/* Benefits List */}
          <div className="p-6 space-y-4 bg-slate-50/50">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Included in Free Account:
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900">10 Free Daily AI Chats</div>
                  <div className="text-[11px] text-slate-500">Live web search, weather, Wikipedia & code generation</div>
                </div>
                <Check size={16} className="text-emerald-500 shrink-0" />
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <History size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900">Save & Search Chat History</div>
                  <div className="text-[11px] text-slate-500">Resume your conversations anytime from any device</div>
                </div>
                <Check size={16} className="text-emerald-500 shrink-0" />
              </div>

              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100 shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Zap size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900">8+ Production AI Tools</div>
                  <div className="text-[11px] text-slate-500">Code Generator, SEO Optimizer, Blog Writer & more</div>
                </div>
                <Check size={16} className="text-emerald-500 shrink-0" />
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-3 space-y-2">
              <Link href="/sign-up" className="block w-full">
                <Button className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all">
                  Create Free Account <ArrowRight size={16} />
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                <span>Already have an account?</span>
                <Link href="/sign-in" className="text-indigo-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>100% Free Forever • No Credit Card Required</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
