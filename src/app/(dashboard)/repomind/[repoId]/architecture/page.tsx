"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, RefreshCcw, Loader2, Code2, Eye } from "lucide-react";
import { useParams } from "next/navigation";

export default function ArchitecturePage() {
  const params = useParams<{ repoId: string }>();
  const repoId = params?.repoId || "";
  
  const [loading, setLoading] = useState(false);
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const mermaidRef = useRef<HTMLDivElement>(null);

  const fetchArchitecture = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/repomind/architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate architecture");
      }
      
      setMermaidCode(data.mermaid);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Render Mermaid diagram when code changes
  useEffect(() => {
    if (mermaidCode && mermaidRef.current && !showCode) {
      const renderMermaid = async () => {
        try {
          const mermaid = (await import("mermaid")).default;
          mermaid.initialize({ 
            startOnLoad: false, 
            theme: "default",
            securityLevel: "loose",
            flowchart: { curve: "basis" }
          });
          mermaidRef.current!.innerHTML = "";

          // Clean up any remaining unquoted node labels with special characters
          let cleanedCode = mermaidCode.trim();
          cleanedCode = cleanedCode.replace(/^```(mermaid)?\n?/i, "").replace(/\n?```$/i, "").trim();
          cleanedCode = cleanedCode.replace(/\{\{([^"\n]+?)\}\}/g, (_m, label) => `{{\"${label.trim().replace(/"/g, "'")}\"}}`);
          cleanedCode = cleanedCode.replace(/\[([^"\n\[\]]+?)\]/g, (_m, label) => {
            if (/[()::\s\-]/.test(label) && !label.startsWith('"')) return `[\"${label.trim().replace(/"/g, "'")}\"]`;
            return `[${label}]`;
          });
          cleanedCode = cleanedCode.replace(/\(([^"\n()]+?)\)/g, (_m, label) => {
            if (/[::\s\-]/.test(label) && !label.startsWith('"')) return `(\"${label.trim().replace(/"/g, "'")}\")`;
            return `(${label})`;
          });

          // Unique ID per render to avoid element ID collisions in DOM
          const uniqueId = `arch-diagram-${Date.now()}`;
          const { svg } = await mermaid.render(uniqueId, cleanedCode);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (e) {
          console.error("Mermaid render failed:", e);
          // Fallback: show raw code gracefully
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `
              <div class="w-full p-4 bg-slate-900 rounded-lg text-slate-200 font-mono text-sm overflow-auto">
                <div class="text-amber-400 font-sans text-xs font-semibold uppercase tracking-wider mb-2">Diagram Markup Preview</div>
                <pre class="whitespace-pre-wrap">${mermaidCode}</pre>
              </div>
            `;
          }
        }
      };
      renderMermaid();
    }
  }, [mermaidCode, showCode]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="h-8 w-8 text-indigo-500" />
            System Architecture
          </h1>
          <p className="text-slate-500 mt-1">
            Generated structural map of your codebase.
          </p>
        </div>
        <div className="flex gap-2">
          {mermaidCode && (
            <Button variant="outline" onClick={() => setShowCode(!showCode)}>
              {showCode ? <Eye className="mr-2 h-4 w-4" /> : <Code2 className="mr-2 h-4 w-4" />}
              {showCode ? "View Diagram" : "View Code"}
            </Button>
          )}
          <Button onClick={fetchArchitecture} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            {mermaidCode ? "Regenerate Map" : "Generate Architecture Map"}
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm min-h-[500px]">
        <CardHeader>
          <CardTitle>Codebase Map</CardTitle>
          <CardDescription>Generated using OpenAI and Mermaid.js</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
              <p>Analyzing repository structure and generating diagram...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-red-500 space-y-4 text-center">
              <p className="font-semibold text-lg">Error Generating Architecture</p>
              <p className="max-w-md">{error}</p>
              <p className="text-sm text-slate-500 mt-2">Note: You may need to add a GITHUB_TOKEN to your .env file to avoid rate limits.</p>
            </div>
          ) : mermaidCode ? (
            showCode ? (
              <div className="bg-slate-900 rounded-lg p-6 overflow-auto">
                <pre className="text-sm font-mono text-slate-200 whitespace-pre-wrap">{mermaidCode}</pre>
              </div>
            ) : (
              <div ref={mermaidRef} className="flex justify-center p-4 bg-slate-50 rounded-lg overflow-auto border border-slate-100 min-h-[400px]" />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-slate-500 space-y-4">
              <Cpu className="h-16 w-16 text-slate-200" />
              <p>Click "Generate Architecture Map" to scan this repository.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

