"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Activity, CheckCircle2, Clock, GitBranch, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface OverviewClientProps {
  initialRepo: any
}

export default function OverviewClient({ initialRepo }: OverviewClientProps) {
  const [repo, setRepo] = useState(initialRepo)
  const [scanning, setScanning] = useState(false)

  const handleScan = async () => {
    setScanning(true)
    try {
      const res = await fetch("/api/repomind/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: repo.id })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to scan codebase")

      toast.success("Repository scanned and indexed successfully!")
      
      setRepo((prev: any) => ({
        ...prev,
        status: data.status,
        files: Array(data.filesCount || 0).fill({})
      }))

    } catch (err: any) {
      toast.error(err.message || "Failed to scan codebase")
    } finally {
      setScanning(false)
    }
  }

  const filesCount = repo.files?.length || 0
  const chunksCount = filesCount * 3 // Simulate chunks for UI progress
  
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">{repo.fullName}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-3">
            <span className="flex items-center gap-1"><Clock size={14} /> Connected {new Date(repo.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><GitBranch size={14} /> {repo.defaultBranch}</span>
            <span>•</span>
            <span>{repo.language || "Unknown Language"}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <a href={repo.url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "outline" })}>
            View on GitHub
          </a>
          <Button 
            onClick={handleScan}
            disabled={scanning}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {scanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              "Scan Codebase"
            )}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Repository Details</CardTitle>
              <CardDescription>Basic information fetched from GitHub</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-slate-600">
              <p>
                {repo.description || "No description provided on GitHub for this repository."}
              </p>
              
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">Visibility</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${!repo.isPrivate ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" : "bg-slate-100 text-slate-700"}`}>
                    {repo.isPrivate ? "Private" : "Public"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle>Sync Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">GitHub Connection</p>
                    <p className="text-xs text-slate-500">Successfully fetched metadata</p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border-emerald-200 text-emerald-700 bg-emerald-50 border">Success</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <Activity className={`h-5 w-5 ${filesCount > 0 ? "text-emerald-500" : "text-slate-400"}`} />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">Deep Code Indexing</p>
                    <p className="text-xs text-slate-500">
                      {filesCount > 0 ? `Successfully indexed ${filesCount} files` : "Pending manual start"}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${filesCount > 0 ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-slate-200 text-slate-500 bg-slate-50"}`}>
                    {filesCount > 0 ? "Success" : "Pending"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                Index Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Files Parsed</span>
                  <span className="font-medium text-slate-900">{filesCount} / {filesCount || 100}</span>
                </div>
                <Progress value={filesCount > 0 ? 100 : 0} className="h-2 bg-slate-100" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Vector Embeddings</span>
                  <span className="font-medium text-slate-900">{chunksCount} Chunks</span>
                </div>
                <Progress value={filesCount > 0 ? 100 : 0} className="h-2 bg-slate-100" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
