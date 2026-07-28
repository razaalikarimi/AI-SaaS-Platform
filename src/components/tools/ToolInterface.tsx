/* eslint-disable */
"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { 
  Zap, 
  Copy, 
  Check, 
  RotateCcw, 
  Download, 
  Sparkles,
  ArrowLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"

import { DefaultChatTransport } from "ai"

import { useUsage } from "@/context/UsageContext"

interface ToolInterfaceProps {
  title: string
  description: string
  icon: any
  prompt: string
  inputs: {
    id: string
    label: string
    type: "text" | "textarea"
    placeholder: string
  }[]
}

export const ToolInterface = ({ 
  title, 
  description, 
  icon: Icon, 
  prompt, 
  inputs 
}: ToolInterfaceProps) => {
  const { incrementTool } = useUsage()
  const [formState, setFormState] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState(false)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        personality: "Professional",
        model: "gemini-2.0-flash"
      }
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"
  const lastMessage = messages[messages.length - 1]
  const result = lastMessage?.role === "assistant" 
    ? (lastMessage as any).content || (lastMessage.parts
      ? lastMessage.parts.map((p: any) => (typeof p === "string" ? p : p.text || "")).join("")
      : "")
    : ""


  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!incrementTool()) {
      return
    }
    
    // Construct the final prompt
    let finalPrompt = `${prompt}\n\nInputs:\n`
    Object.entries(formState).forEach(([key, value]) => {
      finalPrompt += `- ${key}: ${value}\n`
    })

    setMessages([])
    sendMessage({ text: finalPrompt })
  }

  const copyToClipboard = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    toast.success("Asset copied to clipboard.")
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadResult = () => {
    if (!result) return
    const blob = new Blob([result], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-output.md`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("File downloaded.")
  }

  return (
    <div className="p-10 h-full overflow-y-auto max-w-7xl mx-auto">
      <Link href="/tools" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-10 group text-xs font-bold uppercase tracking-wider">
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Return to Solutions Directory
      </Link>

      <div className="flex flex-col lg:flex-row bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
        {/* Input Panel */}
        <div className="flex-1 bg-white p-10 space-y-10 border-b lg:border-b-0 lg:border-r border-slate-200">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-xs">
                <Icon size={22} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-8">
            {inputs.map((input) => (
              <div key={input.id} className="space-y-2.5">
                <Label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {input.label}
                </Label>
                {input.type === "text" ? (
                  <Input
                    placeholder={input.placeholder}
                    className="bg-slate-50 border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 rounded-xl h-12 text-sm text-slate-800"
                    onChange={(e) => setFormState({ ...formState, [input.id]: e.target.value })}
                  />
                ) : (
                  <Textarea
                    placeholder={input.placeholder}
                    className="bg-slate-50 border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 rounded-xl min-h-[160px] text-sm leading-relaxed text-slate-800 resize-none"
                    onChange={(e) => setFormState({ ...formState, [input.id]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="enterprise-btn h-12 w-full text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2.5">
                  <RotateCcw className="animate-spin" size={16} />
                  Executing Generation...
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  <Sparkles size={16} />
                  Initiate Production
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="flex-1 bg-slate-50/50 flex flex-col min-h-[500px]">
          <div className="p-10 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generated Output</h2>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyToClipboard}
                  disabled={!result}
                  className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                >
                  {copied ? <Check size={16} className="text-teal-600" /> : <Copy size={16} />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={!result}
                  onClick={downloadResult}
                  className="h-9 w-9 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                >
                  <Download size={16} />
                </Button>
              </div>
            </div>

            <div className="flex-1 relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs">
              <AnimatePresence mode="wait">
                {!result && !isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 opacity-30"
                  >
                    <Zap className="text-indigo-600 mb-4" size={40} />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 max-w-[180px]">
                      Awaiting Input Configuration
                    </p>
                  </motion.div>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium markdown-body">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                )}
              </AnimatePresence>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  )
}
