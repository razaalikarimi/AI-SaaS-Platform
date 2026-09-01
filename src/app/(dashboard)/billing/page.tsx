"use client"

import { useState, useEffect } from "react"
import { CreditCard, Check, AlertCircle, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner" 
import { useUsage } from "@/context/UsageContext"

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function BillingPage() {
  const { isProUser, upgradeToPro } = useUsage()
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentPlan, setCurrentPlan] = useState("Free")
  const [invoices, setInvoices] = useState<any[]>([])

  useEffect(() => {
    if (isProUser && currentPlan !== "Pro") {
      setCurrentPlan("Pro")
      setInvoices(prev => prev.length === 0 ? [{
        id: `INV-${new Date().getFullYear()}-4309`,
        date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: "₹499",
        status: "Paid"
      }] : prev)
    }
  }, [isProUser])

  const handlePayment = async (planName: string, priceStr: string) => {
    setIsProcessing(true)

    const loaded = await loadRazorpayScript()
    if (!loaded) {
      toast.error("Unable to connect to payment gateway. Please check your internet connection.")
      setIsProcessing(false)
      return
    }
    
    // Convert string price "₹499" to paise (499 * 100 = 49900)
    const priceNum = parseInt(priceStr.replace(/[^0-9]/g, '')) * 100

    try {
      const response = await fetch('/api/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: priceNum, planName }),
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
        currency: order.currency || "INR",
        name: "DevKit AI",
        description: `Upgrade to ${planName}`,
        order_id: order.id,
        handler: function (response: any) {
          toast.success("Payment Successful!", {
            description: `Payment ID: ${response.razorpay_payment_id}`
          })
          
          const shortPlanName = planName.replace(" Plan", "")
          setCurrentPlan(shortPlanName)
          
          if (shortPlanName === "Pro") {
            upgradeToPro()
          }

          const newInvoice = {
            id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: priceStr,
            status: "Paid"
          }
          setInvoices(prev => [newInvoice, ...prev])

          setIsProcessing(false)
        },
        prefill: {
          name: "DevKit User",
          email: "user@devkit.in",
          contact: "9876543210"
        },
        theme: {
          color: "#0f172a" 
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

  // Helper to determine plan limits based on current plan
  const getPlanDetails = () => {
    if (currentPlan === "Team") {
      return { words: "Unlimited", limit: "Unlimited", percent: 10, max: "Unlimited words" }
    } else if (currentPlan === "Pro") {
      return { words: "2,300", limit: "100,000", percent: 2, max: "100,000 words" }
    }
    return { words: "2,300", limit: "10,000", percent: 23, max: "10,000 words" }
  }
  const details = getPlanDetails()

  return (
    <div className="h-full overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto p-6 md:p-10 text-slate-900">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1">Billing & Subscription</h1>
          <p className="text-slate-500 text-sm">Manage your plan, UPI / Card payment methods, and GST invoices.</p>
        </div>

        {/* Current Plan Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-medium">{currentPlan} Plan</h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold uppercase tracking-wider">Active</span>
            </div>
            <p className="text-slate-500 text-sm mb-4">
              {currentPlan === "Free" 
                ? "You are currently on the free tier. Upgrade to unlock more features."
                : "You are on a premium tier. Enjoy enhanced AI capabilities."}
            </p>
            
            <div className="max-w-xs">
              <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-600">
                <span>Monthly Usage</span>
                <span>{details.words} / {details.limit} words</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${details.percent}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {currentPlan === "Free" ? (
              <Button 
                onClick={() => handlePayment("Pro Plan", "₹499")}
                disabled={isProcessing}
                className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm cursor-pointer"
              >
                {isProcessing ? "Processing..." : "Upgrade to Pro (₹499)"}
              </Button>
            ) : (
              <Button variant="outline" className="shadow-sm">
                Manage Subscription
              </Button>
            )}
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Plan 1 */}
            <div className={`border ${currentPlan === "Free" ? "border-indigo-600 ring-1 ring-indigo-600" : "border-slate-200"} bg-white rounded-xl p-6 shadow-sm flex flex-col relative transition-all`}>
              <h3 className="font-medium text-slate-900 mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">₹0</span>
                <span className="text-slate-500 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-slate-900 mt-0.5" />
                  <span>10,000 words per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-slate-900 mt-0.5" />
                  <span>Standard AI models</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-slate-900 mt-0.5" />
                  <span>Community support</span>
                </li>
              </ul>
              <Button variant={currentPlan === "Free" ? "secondary" : "outline"} className="w-full" disabled={currentPlan === "Free"} onClick={() => handlePayment("Free Plan", "₹0")}>
                {currentPlan === "Free" ? "Current Plan" : "Downgrade"}
              </Button>
            </div>

            {/* Plan 2 */}
            <div className={`border-2 ${currentPlan === "Pro" ? "border-indigo-600 bg-indigo-50/10" : "border-slate-900 bg-white"} rounded-xl p-6 shadow-sm flex flex-col relative transition-all`}>
              {currentPlan !== "Pro" && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Popular
                </div>
              )}
              {currentPlan === "Pro" && (
                <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Active
                </div>
              )}
              <h3 className="font-medium text-slate-900 mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">₹499</span>
                <span className="text-slate-500 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-slate-900 mt-0.5" />
                  <span>100,000 words per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-slate-900 mt-0.5" />
                  <span>Advanced reasoning models</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-slate-900 mt-0.5" />
                  <span>Priority email support</span>
                </li>
              </ul>
              <Button 
                onClick={() => handlePayment("Pro Plan", "₹499")}
                disabled={isProcessing || currentPlan === "Pro"}
                className={`w-full ${currentPlan === "Pro" ? "bg-slate-100 text-slate-400 hover:bg-slate-100" : "bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"}`}
              >
                {currentPlan === "Pro" ? "Current Plan" : (isProcessing ? "Processing..." : "Upgrade to Pro (₹499)")}
              </Button>
            </div>

            {/* Plan 3 */}
            <div className={`border ${currentPlan === "Team" ? "border-indigo-600 ring-1 ring-indigo-600" : "border-slate-200"} bg-white rounded-xl p-6 shadow-sm flex flex-col transition-all`}>
              <h3 className="font-medium text-slate-900 mb-2">Team</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">₹1,499</span>
                <span className="text-slate-500 text-sm"> / month</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-slate-900 mt-0.5" />
                  <span>Unlimited words</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-slate-900 mt-0.5" />
                  <span>Custom AI fine-tuning</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-slate-900 mt-0.5" />
                  <span>24/7 dedicated support</span>
                </li>
              </ul>
              <Button 
                onClick={() => handlePayment("Team Plan", "₹1,499")}
                disabled={isProcessing || currentPlan === "Team"}
                variant={currentPlan === "Team" ? "secondary" : "outline"} 
                className="w-full cursor-pointer"
              >
                {currentPlan === "Team" ? "Current Plan" : (isProcessing ? "Processing..." : "Upgrade to Team (₹1,499)")}
              </Button>
            </div>

          </div>
        </div>

        {/* Invoice History */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Invoice History</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                    <AlertCircle size={20} className="text-slate-400" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-900 mb-1">No invoices yet</p>
                <p className="text-sm">You haven't made any payments yet. Once you subscribe, your invoices will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {invoices.map((inv, idx) => (
                  <div key={idx} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{inv.id}</div>
                        <div className="text-xs text-slate-500">{inv.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-900">{inv.amount}</div>
                        <div className="text-xs font-medium text-emerald-600">{inv.status}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                        onClick={() => {
                          const receipt = `DEVKIT AI - PAYMENT RECEIPT\n${'='.repeat(40)}\n\nInvoice ID: ${inv.id}\nDate: ${inv.date}\nPlan: ${currentPlan}\nAmount: ${inv.amount}\nStatus: ${inv.status}\n\nThank you for your payment!\nDevKit AI Platform`
                          const blob = new Blob([receipt], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `${inv.id}-receipt.txt`
                          a.click()
                          URL.revokeObjectURL(url)
                        }}
                      >
                        <Download size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
