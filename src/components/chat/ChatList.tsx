/* eslint-disable */
"use client"

import { useEffect, useState } from "react"
import { getConversations, deleteConversation, renameConversation } from "@/actions/chat"
import { MessageSquare, MoreVertical, Trash2, Edit2, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

export const ChatList = () => {
  const { isSignedIn } = useUser()
  const [conversations, setConversations] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    if (!isSignedIn) return
    const fetch = async () => {
      const data = await getConversations()
      setConversations(data)
    }
    fetch()
  }, [params.chatId, isSignedIn])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    await deleteConversation(id)
    setConversations(conversations.filter(c => c.id !== id))
    if (params.chatId === id) router.push("/chat")
  }

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) return
    await renameConversation(id, editTitle)
    setConversations(conversations.map(c => c.id === id ? { ...c, title: editTitle } : c))
    setEditingId(null)
  }

  if (!isSignedIn) {
    return (
      <div className="px-3 py-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
        <p className="text-[11px] text-slate-500 mb-1.5 leading-relaxed">
          Sign in to save and resume your chats.
        </p>
        <Link href="/sign-in" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline inline-block">
          Sign In Free →
        </Link>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-2 text-[11px] text-slate-400 text-center">
        No conversations yet
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {conversations.map((chat) => (
        <div 
          key={chat.id}
          className={`
            group flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all
            ${params.chatId === chat.id ? "bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}
          `}
        >
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={() => router.push(`/chat/${chat.id}`)}
          >
            <MessageSquare size={16} className="shrink-0" />
            {editingId === chat.id ? (
              <Input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRename(chat.id)}
                onClick={(e) => e.stopPropagation()}
                className="h-6 px-1 py-0 bg-transparent border-none focus-visible:ring-0 text-foreground"
              />
            ) : (
              <span className="truncate">{chat.title}</span>
            )}
          </div>

          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            {editingId === chat.id ? (
              <div className="flex gap-1">
                <X size={14} className="hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} />
                <Check size={14} className="hover:text-emerald-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleRename(chat.id); }} />
              </div>
            ) : (
              /* I'll use a simple button for now instead of complex dropdown for speed */
              <Trash2 
                size={14} 
                className="text-zinc-600 hover:text-red-500 cursor-pointer transition-colors" 
                onClick={(e) => handleDelete(e, chat.id)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
