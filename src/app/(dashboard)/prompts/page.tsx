/* eslint-disable */
"use client"

import { useEffect, useState } from "react"
import { getPrompts, createPrompt, deletePrompt } from "@/actions/prompts"
import { 
  Plus, 
  Search, 
  Copy, 
  Trash2, 
  MessageSquare, 
  Share2,
  Lock,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

import { useUsage } from "@/context/UsageContext"

export default function PromptsPage() {
  const { isGuestUser, openAuthModal } = useUsage()
  const [prompts, setPrompts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Form State
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [content, setContent] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    const data = await getPrompts()
    setPrompts(data)
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!name || !content) return
    if (isGuestUser) {
      setOpen(false)
      openAuthModal()
      toast.info("Sign in for free to save custom prompts.")
      return
    }
    try {
      await createPrompt({ name, description, prompt: content, isPublic })
      toast.success("Prompt created successfully")
      setOpen(false)
      fetchPrompts()
      setName("")
      setDescription("")
      setContent("")
      setIsPublic(false)
    } catch (error: any) {
      toast.error(error?.message || "Failed to create prompt")
    }
  }

  const handleDelete = async (id: string) => {
    await deletePrompt(id)
    toast.success("Prompt deleted")
    fetchPrompts()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }

  const filteredPrompts = prompts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50/50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Prompts</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and reuse your custom prompts.</p>
          </div>
          
          <Dialog open={open} onOpenChange={(nextOpen) => {
            if (nextOpen && isGuestUser) {
              openAuthModal()
              return
            }
            setOpen(nextOpen)
          }}>
            <DialogTrigger className="h-10 px-5 rounded-lg text-sm font-medium flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer">
              <Plus size={16} />
              New Prompt
            </DialogTrigger>
            <DialogContent className="bg-white rounded-xl max-w-xl p-6 shadow-lg border border-slate-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">Create Prompt</DialogTitle>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Name</Label>
                  <Input 
                    placeholder="e.g. Code Reviewer" 
                    className="bg-slate-50 border-slate-200 h-10 text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Description</Label>
                  <Input 
                    placeholder="What does this prompt do?" 
                    className="bg-slate-50 border-slate-200 h-10 text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Prompt Content</Label>
                  <Textarea 
                    placeholder="Write your prompt instructions here..." 
                    className="bg-slate-50 border-slate-200 min-h-[150px] text-sm resize-y"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-slate-900">Workspace Visibility</Label>
                    <p className="text-xs text-slate-500">Allow others in your workspace to use this prompt</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="h-10 text-sm">Cancel</Button>
                <Button onClick={handleCreate} className="h-10 text-sm bg-indigo-600 hover:bg-indigo-700 text-white">Save Prompt</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Search prompts..." 
            className="h-10 pl-10 bg-white border-slate-200 rounded-lg text-sm shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="animate-spin mx-auto text-indigo-500 mb-2" size={28} />
              <p className="text-sm text-slate-500">Loading prompts...</p>
            </div>
          ) : filteredPrompts.length === 0 ? (
            <div className="col-span-full py-20 bg-white rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-3">
                <MessageSquare size={24} />
              </div>
              <p className="text-sm font-medium text-slate-900">No prompts found</p>
              <p className="text-xs text-slate-500 mt-1">Create your first prompt to get started.</p>
            </div>
          ) : (
            filteredPrompts.map((prompt) => (
              <div key={prompt.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                      <MessageSquare size={18} />
                    </div>
                    <div className="flex items-center gap-2">
                      {prompt.isPublic ? (
                        <div className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-medium flex items-center gap-1.5">
                          <Share2 size={12} />
                          Shared
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-full text-[10px] font-medium flex items-center gap-1.5">
                          <Lock size={12} />
                          Private
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-base font-semibold text-slate-900 mb-1.5">{prompt.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6">
                    {prompt.description || "No description provided."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 -ml-2 h-8"
                    onClick={() => copyToClipboard(prompt.prompt)}
                  >
                    <Copy size={14} className="mr-1.5" />
                    Copy
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDelete(prompt.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
