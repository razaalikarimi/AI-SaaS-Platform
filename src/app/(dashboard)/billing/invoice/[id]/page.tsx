/* eslint-disable */
"use client"

import { use } from "react"
import { Printer, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ amount: string, date: string, plan: string }> }) {
  const unwrappedParams = use(params)
  const unwrappedSearch = use(searchParams)
  
  const id = unwrappedParams.id
  const amount = unwrappedSearch.amount || "₹499"
  const date = unwrappedSearch.date || new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  const plan = unwrappedSearch.plan || "Pro Plan"

  return (
    <div className="h-full overflow-y-auto min-h-screen bg-slate-50 py-10 px-4 md:px-10 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto">
        
        {/* Controls (Hidden when printing) */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Button variant="ghost" onClick={() => window.close()} className="text-slate-500 cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">
            <Printer className="mr-2 h-4 w-4" /> Save as PDF
          </Button>
        </div>
        
        {/* Invoice Paper */}
        <div className="bg-white p-10 md:p-16 shadow-lg border border-slate-200 rounded-2xl">
          <div className="flex justify-between items-start mb-16">
            <div>
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-6">
                <span className="text-white font-black text-2xl">D</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">TAX INVOICE</h1>
              <p className="text-slate-500 mt-1.5 text-sm font-medium">#{id}</p>
            </div>
            <div className="text-right text-sm text-slate-500 space-y-1">
              <h3 className="font-bold text-slate-900 text-base mb-1">DevKit AI Technologies</h3>
              <p>Tech Park, Outer Ring Road</p>
              <p>Bengaluru, Karnataka 560103, India</p>
              <p>billing@devkit.in</p>
            </div>
          </div>

          <div className="flex justify-between mb-16 border-b border-slate-100 pb-10">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Billed To</h3>
              <p className="font-semibold text-slate-900">DevKit User</p>
              <p className="text-sm text-slate-500">user@devkit.in</p>
              <p className="text-xs text-slate-400 mt-1">Place of Supply: India</p>
            </div>
            <div className="text-right">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date Issued</h3>
              <p className="font-medium text-slate-900">{date}</p>
              <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded inline-block border border-emerald-100">Paid via Razorpay UPI / Cards</p>
            </div>
          </div>

          <table className="w-full text-left mb-12">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <th className="pb-4">Description</th>
                <th className="pb-4 text-center">Period</th>
                <th className="pb-4 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-6">
                  <p className="font-semibold text-slate-900 mb-1">DevKit Subscription - {plan}</p>
                  <p className="text-xs text-slate-500">Access to AI models, priority compute, and premium tools.</p>
                </td>
                <td className="py-6 text-center text-sm text-slate-600">1 Month</td>
                <td className="py-6 text-right font-medium text-slate-900">{amount}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Subtotal</span>
                <span>{amount}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>GST (Inclusive)</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-3">
                <span>Total Paid</span>
                <span>{amount}</span>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
            <p>Thank you for using DevKit AI.</p>
            <p className="mt-1">For billing questions, write to support@devkit.in</p>
          </div>
        </div>
        
      </div>
    </div>
  )
}
