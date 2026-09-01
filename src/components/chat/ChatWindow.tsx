/* eslint-disable */
"use client"

import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Send, User, Bot, StopCircle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { useUsage } from "@/context/UsageContext"
import { getPrompts } from "@/actions/prompts"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Wand2 } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export const ChatWindow = ({ initialMessages = [] }: { initialMessages?: any[] }) => {
  const { incrementChat } = useUsage()
  const params = useParams()
  const [chatId, setChatId] = useState<string>(() => (params?.chatId as string) || crypto.randomUUID())
  const [isMounted, setIsMounted] = useState(false)
  const [prompts, setPrompts] = useState<any[]>([])

  useEffect(() => {
    if (params?.chatId) {
      setChatId(params.chatId as string)
    }
  }, [params?.chatId])
  
  const [messages, setMessages] = useState<Message[]>(() => {
    return initialMessages.map((m) => ({
      id: m.id || String(Date.now() + Math.random()),
      role: m.role,
      content: m.content || (m.parts ? m.parts.map((p: any) => p.text || "").join("") : "")
    }))
  })

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
    const loadPrompts = async () => {
      try {
        const data = await getPrompts()
        setPrompts(data)
      } catch (err) {
        console.error("Failed to load prompts", err)
      }
    }
    loadPrompts()
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim()
    if (!trimmed || isLoading) return

    const allowed = await incrementChat()
    if (!allowed) return

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: trimmed
    }

    const assistantId = "assistant-" + Date.now()
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: ""
    }

    const nextMessages = [...messages, userMessage]
    setMessages([...nextMessages, assistantMessage])
    setInput("")
    setIsLoading(true)

    // Smoothly update browser URL if this was a brand new chat (0ms lag, no reload)
    if (typeof window !== "undefined" && window.location.pathname === "/chat") {
      window.history.replaceState(null, "", `/chat/${chatId}`)
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chatId,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          personality: "Professional",
          model: "gpt-4o-mini"
        }),
        signal: controller.signal
      })

      if (!res.ok) {
        throw new Error("Server responded with status " + res.status)
      }

      if (!res.body) {
        throw new Error("No response body received")
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let streamedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        streamedContent += chunk

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: streamedContent } : msg
          )
        )
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Chat Error:", err)
        toast.error("Failed to connect to AI. Please try again.")
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId && !msg.content
              ? { ...msg, content: "⚠️ An error occurred while generating the response. Please try again." }
              : msg
          )
        )
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const regenerate = () => {
    if (isLoading || messages.length === 0) return
    // Find last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
    if (lastUserMsg) {
      // Remove last assistant message if exists
      const cleanMessages = messages[messages.length - 1]?.role === "assistant" 
        ? messages.slice(0, -1)
        : messages
      setMessages(cleanMessages)
      handleSendMessage(lastUserMsg.content)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  if (!isMounted) return null

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success("Copied to clipboard.")
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">

      {/* Header — clean, minimal */}
      <header className="h-14 flex items-center justify-between px-5 border-b border-slate-100 bg-white sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center">
            <MessageSquare size={14} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800 leading-tight">Chat</h2>
            <p className="text-[10px] text-slate-400 leading-tight">DevKit Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Connected</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

          {/* Empty state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                <Bot size={28} />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-base font-bold text-slate-800">Welcome to DevKit AI</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your intelligent assistant for software architecture, code generation, real-time queries, and repository intelligence.
                </p>
              </div>
            </div>
          )}

          {messages.map((m: Message) => {
            if (!m.content && m.role === "assistant" && isLoading) return null
            if (!m.content.trim()) return null

            const isUser = m.role === "user"

            return (
              <div key={m.id} className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
                  isUser
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}>
                  {isUser ? <User size={13} /> : <Bot size={13} />}
                </div>

                {/* Bubble + actions */}
                <div className={`flex flex-col gap-1.5 max-w-[78%] ${isUser ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 text-sm leading-relaxed rounded-xl markdown-body ${
                    isUser
                      ? "bg-indigo-600 text-white rounded-tr-sm [&_strong]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_li]:text-white [&_p]:text-white [&_a]:text-white"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                  }`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                  </div>
                  {!isUser && (
                    <div className="flex items-center gap-3 px-1">
                      <button
                        onClick={() => copyToClipboard(m.content)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-medium cursor-pointer"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => regenerate()}
                        className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-medium cursor-pointer"
                      >
                        Regenerate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center flex-shrink-0">
                <Bot size={13} />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-xl rounded-tl-sm flex gap-1.5 items-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          <div ref={scrollRef} className="h-4" />
        </div>
      </div>

      {/* Input — clean, professional */}
      <div className="px-5 py-4 bg-white border-t border-slate-100 flex-shrink-0">
        <form onSubmit={onSubmit} className="max-w-3xl mx-auto relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message DevKit AI..."
            className="min-h-[52px] max-h-[180px] w-full bg-slate-50 border border-slate-200 focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:border-indigo-400 rounded-xl pr-28 pl-12 py-3.5 resize-none text-sm text-slate-800 placeholder:text-slate-400 leading-relaxed transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                onSubmit(e)
              }
            }}
          />
          <div className="absolute left-3 bottom-3">
            {prompts.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="Use a Prompt Template">
                      <Wand2 size={16} />
                    </Button>
                  }
                />
                <DropdownMenuContent align="start" className="w-64 mb-1">
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Prompts</div>
                  {prompts.map((p) => (
                    <DropdownMenuItem 
                      key={p.id} 
                      className="flex flex-col items-start gap-1 p-2 cursor-pointer"
                      onClick={() => setInput(p.prompt)}
                    >
                      <span className="font-medium text-slate-900">{p.name}</span>
                      {p.description && <span className="text-xs text-slate-500 line-clamp-1">{p.description}</span>}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <div className="absolute right-3 bottom-3">
            {isLoading ? (
              <Button
                type="button"
                onClick={() => stop()}
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-semibold rounded-md cursor-pointer"
              >
                <StopCircle size={13} className="mr-1.5" />
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim()}
                className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Send size={12} className="mr-1.5" />
                Send
              </Button>
            )}
          </div>
        </form>
        <p className="max-w-3xl mx-auto mt-2 text-[10px] text-slate-400 text-center">
          Press <kbd className="font-mono bg-slate-100 border border-slate-200 rounded px-1">Enter</kbd> to send · <kbd className="font-mono bg-slate-100 border border-slate-200 rounded px-1">Shift+Enter</kbd> for new line
        </p>
      </div>

    </div>
  )
}
