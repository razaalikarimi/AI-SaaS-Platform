/* eslint-disable */
"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { Send, User, Bot, StopCircle, MessageSquare, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useParams } from "next/navigation"
import { toast } from "sonner"
import { DefaultChatTransport } from "ai"

import { UIMessage } from "ai"
import { useUsage } from "@/context/UsageContext"
import { getPrompts } from "@/actions/prompts"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Wand2 } from "lucide-react"

export const ChatWindow = ({ initialMessages = [] }: { initialMessages?: UIMessage[] }) => {
  const { incrementChat } = useUsage()
  const params = useParams()
  const chatId = params.chatId as string
  const [isMounted, setIsMounted] = useState(false)
  const [prompts, setPrompts] = useState<any[]>([])

  useEffect(() => {
    setIsMounted(true)
    const loadPrompts = async () => {
      const data = await getPrompts()
      setPrompts(data)
    }
    loadPrompts()
  }, [])

  const {
    messages,
    sendMessage,
    status,
    stop,
    regenerate,
  } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        chatId,
        personality: "Professional",
        model: "gemini-2.0-flash"
      }
    }),
    onError: () => {
      toast.error("Failed to connect to AI. Please try again.")
    },
  })

  const [input, setInput] = useState("")
  const isLoading = status === "streaming" || status === "submitted"
  const scrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    // Check usage limit before sending
    if (!incrementChat()) {
      return
    }

    sendMessage({ text: input })
    setInput("")
  }

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, isLoading])

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
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <MessageSquare size={20} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-slate-700">New Conversation</h3>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                  Type a message below to start chatting with DevKit AI.
                </p>
              </div>
            </div>
          )}

          {messages.map((m: any) => {
            const content = m.content || (m.parts
              ? m.parts.filter((p: any) => p.type === "text").map((p: any) => p.text).join("")
              : "")
            if (!content.trim()) return null

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
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                  {!isUser && (
                    <div className="flex items-center gap-3 px-1">
                      <button
                        onClick={() => copyToClipboard(content)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-medium"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => regenerate()}
                        className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors font-medium"
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
                // @ts-ignore
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
                onClick={() => stop()}
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-semibold rounded-md"
              >
                <StopCircle size={13} className="mr-1.5" />
                Stop
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim()}
                className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-40"
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
