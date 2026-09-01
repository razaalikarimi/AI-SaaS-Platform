"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderGit2, Plus, Search, GitBranch, AlertCircle, Clock, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addRepository } from "@/actions/repositories";
import { useUsage } from "@/context/UsageContext";

function formatTimeAgo(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString('en-IN');
}

export function RepoClient({ initialRepos }: { initialRepos: any[] }) {
  const { isGuestUser, openAuthModal } = useUsage();
  const [repos, setRepos] = useState(initialRepos);
  const [search, setSearch] = useState("");
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const filteredRepos = repos.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    if (isGuestUser) {
      setIsConnectOpen(false);
      openAuthModal();
      toast.info("Please sign in to connect and audit GitHub repositories.");
      return;
    }

    try {
      setIsConnecting(true);
      const res = await addRepository(repoUrl);
      
      if (res.success && res.data) {
        toast.success("Repository connected successfully!");
        setRepos([res.data, ...repos]);
        setIsConnectOpen(false);
        setRepoUrl("");
      } else {
        toast.error(res.error || "Failed to connect repository");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsConnecting(false);
    }
  };

  const getLanguageColor = (lang: string) => {
    switch(lang?.toLowerCase()) {
      case 'typescript': return 'bg-blue-500';
      case 'javascript': return 'bg-yellow-400';
      case 'python': return 'bg-blue-400';
      case 'go': return 'bg-cyan-500';
      case 'rust': return 'bg-orange-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-slate-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Repositories</h1>
            <p className="text-slate-500 text-sm mt-1">Connect and manage your GitHub repositories.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="h-10 px-4 rounded-lg border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors bg-white shadow-sm"
              onClick={() => {
                toast.success("Repository sync started.");
                // Hard reload to fetch latest from server
                window.location.reload();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync
            </Button>
            <Button
              className="h-10 px-5 rounded-lg text-sm font-medium flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              onClick={() => setIsConnectOpen(true)}
            >
              <Plus size={16} />
              Connect Repo
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-white border-slate-200 text-sm rounded-lg shadow-sm"
            />
          </div>
        </div>

        {/* Repo Cards */}
        {filteredRepos.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-4">
              <FolderGit2 className="text-slate-400" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No repositories found</h3>
            <p className="text-slate-500 max-w-md mb-6">
              Connect your first GitHub repository to allow DevKit AI to index and analyze your codebase.
            </p>
            <Button onClick={() => setIsConnectOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus size={16} className="mr-2" /> Connect Repository
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRepos.map((repo) => (
              <Link href={`/repomind/${repo.id}`} key={repo.id}>
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group">
                  
                  {/* Top */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100/50">
                        <FolderGit2 size={20} className="text-indigo-600" />
                      </div>
                      <div className="overflow-hidden pr-2">
                        <div className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors truncate">
                          {repo.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 truncate">{repo.fullName}</div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                      ${repo.status === "READY"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-blue-50 border-blue-200 text-blue-700"}
                    `}>
                      {repo.status !== "READY" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      )}
                      {repo.status === "READY" ? "Synced" : "Syncing"}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mb-4 mt-auto pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <div className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                      {repo.language || "Unknown"}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock size={12} />
                      {formatTimeAgo(repo.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <GitBranch size={12} />
                      {repo.defaultBranch}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Connect Modal */}
      <Dialog open={isConnectOpen} onOpenChange={(open) => {
        if (open && isGuestUser) {
          openAuthModal();
          return;
        }
        setIsConnectOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px] bg-white rounded-xl">
          <DialogHeader>
            <DialogTitle>Connect Repository</DialogTitle>
            <DialogDescription>
              Paste a public GitHub repository URL to connect it to DevKit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConnect}>
            <div className="py-4">
              <label htmlFor="repoUrl" className="text-sm font-medium text-slate-700 mb-1.5 block">
                GitHub URL
              </label>
              <Input
                id="repoUrl"
                placeholder="https://github.com/facebook/react"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsConnectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={!repoUrl.trim() || isConnecting}>
                {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
