/* eslint-disable */
"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check } from "lucide-react"
import Link from "next/link"

interface GuestAuthModalProps {
  isOpen: boolean
  onClose: () => void
  reason?: "chat" | "tool" | "general"
}

export const GuestAuthModal = ({
  isOpen,
  onClose,
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Minimalist Human-Crafted Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-xl border border-slate-200/80 p-7 z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black text-base flex items-center justify-center mx-auto mb-3.5 shadow-xs">
              D
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Sign in to continue
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[320px] mx-auto">
              You've used your free guest prompts. Create a free account to save your chat history and continue your session.
            </p>
          </div>

          {/* Value points - minimal, subtle */}
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Check size={14} className="text-slate-900 shrink-0" />
              <span>10 free daily chats with live web search</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Check size={14} className="text-slate-900 shrink-0" />
              <span>Save, search, and resume conversations</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Check size={14} className="text-slate-900 shrink-0" />
              <span>Access to all 8+ AI developer tools</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <Link href="/sign-up" className="block w-full">
              <button className="w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs tracking-wide transition-colors flex items-center justify-center cursor-pointer shadow-xs">
                Create Free Account
              </button>
            </Link>

            <Link href="/sign-in" className="block w-full">
              <button className="w-full h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs border border-slate-200 transition-colors flex items-center justify-center cursor-pointer">
                Sign In to Existing Account
              </button>
            </Link>
          </div>

          {/* Footer note */}
          <div className="text-center mt-5 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400">
              Free forever • No credit card required
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
