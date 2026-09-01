"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { toast } from "sonner"
import { Zap, Check } from "lucide-react"

import { 
  getUserUsage, 
  incrementChatAction, 
  incrementToolAction, 
  upgradeUserToProAction 
} from "@/actions/usage"

type UsageContextType = {
  chatCount: number
  toolCount: number
  isProUser: boolean
  isPaywallOpen: boolean
  incrementChat: () => Promise<boolean>
  incrementTool: () => Promise<boolean>
  openPaywall: () => void
  closePaywall: () => void
  upgradeToPro: () => Promise<void>
}

const UsageContext = createContext<UsageContextType | undefined>(undefined)

export const UsageProvider = ({ children }: { children: React.ReactNode }) => {
  const [chatCount, setChatCount] = useState(0)
  const [toolCount, setToolCount] = useState(0)
  const [isProUser, setIsProUser] = useState(false)
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load from Database on mount
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const usage = await getUserUsage()
        if (usage) {
          setChatCount(usage.chatCount)
          setToolCount(usage.toolCount)
          setIsProUser(usage.isProUser)
        }
      } catch (error) {
        console.error("Failed to load usage data")
      } finally {
        setIsInitialized(true)
      }
    }
    
    fetchUsage()
  }, [])

  const CHAT_LIMIT = 5
  const TOOL_LIMIT = 2

  const openPaywall = () => setIsPaywallOpen(true)
  const closePaywall = () => setIsPaywallOpen(false)
  const upgradeToPro = async () => {
    const success = await upgradeUserToProAction()
    if (success) {
      setIsProUser(true)
      closePaywall()
      toast.success("Successfully upgraded to Pro!", {
        description: "You now have unlimited access."
      })
    } else {
      toast.error("Upgrade failed. Please contact support.")
    }
  }

  const incrementChat = async () => {
    if (isProUser) return true
    
    const success = await incrementChatAction()
    if (success) {
      setChatCount(prev => prev + 1)
      return true
    } else {
      openPaywall()
      return false
    }
  }

  const incrementTool = async () => {
    if (isProUser) return true
    
    const success = await incrementToolAction()
    if (success) {
      setToolCount(prev => prev + 1)
      return true
    } else {
      openPaywall()
      return false
    }
  }

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        return resolve(true)
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handleRazorpayPayment = async () => {
    setIsProcessing(true)
    try {
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) {
        toast.error("Unable to load payment gateway")
        setIsProcessing(false)
        return
      }

      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 1900, planName: "Pro Plan (Upgrade)" }),
      })

      const order = await response.json()

      if (order.error) {
        toast.error("Failed to initialize payment")
        setIsProcessing(false)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "DevKit AI",
        description: `Upgrade to Pro`,
        order_id: order.id,
        handler: function (response: any) {
          upgradeToPro()
          setIsProcessing(false)
        },
        prefill: {
          name: "DevKit User",
          email: "user@devkit.io",
          contact: "9999999999"
        },
        theme: {
          color: "#4f46e5"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false)
          }
        }
      }

      // @ts-ignore
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any){
        toast.error("Payment failed", {
          description: response.error.description
        })
        setIsProcessing(false)
      })
      
      rzp.open()
    } catch (error) {
      console.error(error)
      toast.error("Network error during payment")
      setIsProcessing(false)
    }
  }

  return (
    <UsageContext.Provider value={{
      chatCount,
      toolCount,
      isProUser,
      isPaywallOpen,
      incrementChat,
      incrementTool,
      openPaywall,
      closePaywall,
      upgradeToPro
    }}>
      {children}

      {/* Global Paywall Modal */}
      {isPaywallOpen && !isProUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl relative overflow-hidden">
            
            <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Upgrade Required</h2>
              <button 
                onClick={closePaywall}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-md transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-500 text-sm mb-6">
                You've reached your free usage limit. Upgrade to the Pro Plan to unlock uninterrupted access to all features.
              </p>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">Pro Plan</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Billed monthly</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-slate-900">$19</span>
                    <span className="text-xs text-slate-500 font-medium">/mo</span>
                  </div>
                </div>
                <ul className="text-sm text-slate-600 space-y-3">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-600" /> 
                    <span>Unlimited AI Chat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-600" /> 
                    <span>Unlimited AI Tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-indigo-600" /> 
                    <span>Advanced Reasoning Models</span>
                  </li>
                </ul>
              </div>

              <button 
                onClick={handleRazorpayPayment}
                disabled={isProcessing}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-11 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm"
              >
                {isProcessing ? "Processing..." : "Upgrade to Pro"}
              </button>
              
              <p className="text-center text-xs text-slate-400 mt-4">
                Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      )}
    </UsageContext.Provider>
  )
}

export const useUsage = () => {
  const context = useContext(UsageContext)
  if (context === undefined) {
    throw new Error("useUsage must be used within a UsageProvider")
  }
  return context
}
