"use client";
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, RefreshCcw, Loader2, ShieldCheck } from "lucide-react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function SecurityPage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params?.repoId || "";
  
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSecurityAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/repomind/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate security audit");
      }
      
      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-rose-500" />
            Security Audit
          </h1>
          <p className="text-slate-500 mt-1">
            AI-driven vulnerability scanning and code analysis.
          </p>
        </div>
        <Button onClick={fetchSecurityAudit} disabled={loading} className="bg-rose-600 hover:bg-rose-700">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
          {report ? "Run Audit Again" : "Start Security Scan"}
        </Button>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm min-h-[500px]">
        <CardHeader>
          <CardTitle>Audit Report</CardTitle>
          <CardDescription>Generated using OpenAI by inspecting repository configuration and structure.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" />
              <p>Scanning repository files for vulnerabilities...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-red-500 space-y-4 text-center">
              <p className="font-semibold text-lg">Scan Failed</p>
              <p className="max-w-md">{error}</p>
              <p className="text-sm text-slate-500 mt-2">Note: You may need to add a GITHUB_TOKEN to your .env file to avoid rate limits.</p>
            </div>
          ) : report ? (
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-sm prose prose-sm max-w-none text-slate-700">
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-slate-900 mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-slate-800 mt-4 mb-2" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc ml-5 mb-4 space-y-1" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal ml-5 mb-4 space-y-1" {...props} />,
                  li: ({node, ...props}) => <li {...props} />,
                  p: ({node, ...props}) => <p className="mb-4" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                  code: ({node, inline, ...props}: any) => 
                    inline 
                      ? <code className="bg-white border border-slate-200 px-1 py-0.5 rounded text-xs font-mono text-rose-600" {...props} />
                      : <pre className="bg-slate-800 p-4 rounded-lg my-4 overflow-x-auto text-xs font-mono text-slate-100"><code {...props} /></pre>
                }}
              >
                {report}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 space-y-4">
              <ShieldCheck className="h-16 w-16 text-slate-200" />
              <p>No audit reports yet. Click "Start Security Scan" to begin.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
