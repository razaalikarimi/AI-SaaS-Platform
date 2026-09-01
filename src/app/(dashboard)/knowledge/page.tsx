"use client"

import { useState, useEffect, useRef } from "react"
import {
  FileUp,
  Search,
  FileText,
  Trash2,
  ShieldCheck,
  Database,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getDocuments, deleteDocument } from "@/actions/knowledge"
import { useUsage } from "@/context/UsageContext"

export default function KnowledgePage() {
  const { isGuestUser, openAuthModal } = useUsage()
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [search, setSearch] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchDocs() }, [])

  const fetchDocs = async () => {
    const data = await getDocuments()
    setDocuments(data)
    setLoading(false)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (isGuestUser) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      openAuthModal()
      toast.info("Please sign in to upload and store custom documents.")
      return
    }
    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error()
      toast.success(`${file.name} uploaded successfully.`)
      fetchDocs()
    } catch {
      toast.error("Error uploading file")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id)
      toast.success("Document removed.")
      fetchDocs()
    } catch {
      toast.error("Failed to delete document")
    }
  }

  const filteredDocs = documents.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase())
  )
  const totalSize = documents.reduce((a, d) => a + d.size, 0)
  const formattedSize = (totalSize / (1024 * 1024)).toFixed(2)
  const usagePct = Math.min(100, (totalSize / (100 * 1024 * 1024)) * 100)

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50/50">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleUpload}
        accept=".pdf,.docx,.txt"
      />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Knowledge Base
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-xl">
              Securely manage your documents and files. These files are indexed and used to provide context across your projects.
            </p>
          </div>
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-lg text-sm font-medium shadow-sm transition-all"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="mr-2 h-4 w-4" />
            )}
            {isUploading ? "Uploading..." : "Upload New File"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Left) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Elegant Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault(); setDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file && fileInputRef.current) {
                  const dt = new DataTransfer(); dt.items.add(file)
                  fileInputRef.current.files = dt.files
                  fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }))
                }
              }}
              className={`relative overflow-hidden rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-2
                ${dragOver
                  ? "border-indigo-400 bg-indigo-50/50 shadow-inner"
                  : "border-dashed border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50"}
              `}
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 shadow-sm">
                <FileUp size={28} className="text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Drag and drop your files here</h3>
              <p className="text-slate-500 text-sm mb-6 max-w-sm">
                Supported formats: PDF, DOCX, TXT. Maximum file size is 10MB.
              </p>
              <div className="px-6 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                Browse Files
              </div>
            </div>

            {/* Document Inventory */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 gap-4">
                <h2 className="text-base font-semibold text-slate-800">Your Documents</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    placeholder="Search documents..."
                    className="h-10 pl-10 w-full sm:w-64 bg-white border-slate-200 text-sm rounded-lg focus-visible:ring-indigo-500"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="p-16 flex flex-col items-center text-slate-500 text-sm">
                  <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
                  Loading your documents...
                </div>
              ) : filteredDocs.length === 0 ? (
                <div className="p-16 flex flex-col items-center text-slate-500 text-sm text-center">
                  <FileText className="h-12 w-12 text-slate-200 mb-4" />
                  <p className="text-base font-medium text-slate-700 mb-1">No documents found</p>
                  <p>Upload a file above to get started.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredDocs.map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shrink-0">
                          <FileText size={20} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 mb-1 line-clamp-1">{doc.name}</div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="font-medium text-slate-600">{(doc.size / 1024).toFixed(1)} KB</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-teal-600 flex items-center gap-1 font-medium">
                              <ShieldCheck size={12} /> Indexed
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area (Right) */}
          <div className="space-y-6">
            
            {/* Storage Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
                  <Database className="text-white" size={18} />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Storage Overview</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-500">Capacity Used</span>
                    <span className="text-slate-900">{formattedSize} MB / 100 MB</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium mb-1">Total Files</div>
                    <div className="text-2xl font-bold text-slate-900">{documents.length}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium mb-1">Status</div>
                    <div className="text-sm font-semibold text-teal-600 mt-2 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-teal-50 to-emerald-50/30 border border-teal-100 shadow-sm">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-teal-200/40 blur-2xl" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-emerald-200/40 blur-2xl" />
              
              <div className="relative z-10">
                <h3 className="font-semibold text-base mb-2 text-teal-900">Secure Document Hub</h3>
                <p className="text-sm text-teal-700/80 leading-relaxed mb-6">
                  All uploaded documents are securely processed and stored. They are used exclusively to provide context for your platform.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700 bg-white/60 border border-teal-200/50 w-fit px-3 py-1.5 rounded-md shadow-sm">
                  <ShieldCheck size={14} className="text-teal-600" />
                  End-to-End Encrypted
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
