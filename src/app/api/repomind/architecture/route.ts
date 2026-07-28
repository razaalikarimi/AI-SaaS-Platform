import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/lib/db";

export const maxDuration = 60;

function cleanMermaidCode(code: string): string {
  let cleaned = code.trim();
  cleaned = cleaned.replace(/^```(mermaid)?\n?/i, "").replace(/\n?```$/i, "").trim();

  // Fix unquoted labels inside {{...}}
  cleaned = cleaned.replace(/\{\{([^"\n]+?)\}\}/g, (_match, label) => {
    return `{{\"${label.trim().replace(/"/g, "'")}\"}}`;
  });

  // Fix unquoted labels inside [...] containing special chars
  cleaned = cleaned.replace(/\[([^"\n\[\]]+?)\]/g, (_match, label) => {
    if (/[()::\s\-]/.test(label) && !label.startsWith('"')) {
      return `[\"${label.trim().replace(/"/g, "'")}\"]`;
    }
    return `[${label}]`;
  });

  // Fix unquoted labels inside (...) containing special chars
  cleaned = cleaned.replace(/\(([^"\n()]+?)\)/g, (_match, label) => {
    if (/[::\s\-]/.test(label) && !label.startsWith('"')) {
      return `(\"${label.trim().replace(/"/g, "'")}\")`;
    }
    return `(${label})`;
  });

  return cleaned;
}

export async function POST(req: Request) {
  try {
    const { repoId } = await req.json();

    if (!repoId) {
      return new Response(JSON.stringify({ error: "Missing repoId" }), { status: 400 });
    }

    const repo = await db.repository.findUnique({ where: { id: repoId } });
    if (!repo) {
      return new Response(JSON.stringify({ error: "Repository not found" }), { status: 404 });
    }

    const fallbackDiagram = `graph TD\n  User["End user"] --> Frontend["React Frontend"]\n  Frontend --> APIGateway["API Gateway"]\n  APIGateway --> AuthService["Auth Service"]\n  APIGateway --> CoreAPI["Core Backend API"]\n  CoreAPI --> Database["Database / Storage"]\n  CoreAPI --> LLMService["Google Gemini AI"]`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    if (!apiKey || apiKey === "AIza..." || apiKey === "your_key_here") {
      return new Response(JSON.stringify({ 
        mermaid: fallbackDiagram
      }), { status: 200 });
    }

    // Attempt to fetch GitHub repo structure to give AI real data
    let repoStructure = "No structure data available.";
    try {
      const githubToken = process.env.GITHUB_TOKEN || "";
      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "DevKit-Architecture-Agent",
      };
      if (githubToken) {
        headers["Authorization"] = `token ${githubToken}`;
      }

      // Fetch the default branch tree recursively
      const treeUrl = `https://api.github.com/repos/${repo.fullName}/git/trees/${repo.defaultBranch || 'main'}?recursive=1`;
      const treeResponse = await fetch(treeUrl, { headers });
      
      if (treeResponse.ok) {
        const treeData = await treeResponse.json();
        const paths = treeData.tree.map((item: any) => item.path).filter((p: string) => !p.startsWith("node_modules") && !p.startsWith(".git"));
        // Take up to 200 paths to prevent token overflow
        repoStructure = paths.slice(0, 200).join("\n");
      }
    } catch (e) {
      console.error("Failed to fetch repo tree:", e);
    }

    const prompt = `
      You are an expert Software Architect. 
      Analyze the following repository and generate a high-level Mermaid.js flowchart (graph TD) that represents its likely architecture.
      
      Repository Name: ${repo.fullName}
      Description: ${repo.description || "N/A"}
      Language: ${repo.language || "Unknown"}
      
      Files and Directory Structure:
      ${repoStructure}
      
      Rules:
      1. Output ONLY valid Mermaid code. Do not wrap it in markdown blockquotes like \`\`\`mermaid. 
      2. Keep it clean, high-level (Frontend, Backend, Database, Cloud Services, etc.).
      3. Use proper Mermaid node shapes and connections.
      4. CRITICAL MERMAID SYNTAX RULE: ALWAYS wrap ALL node labels in double quotes. Example: NodeA["Frontend React App"], NodeB["API Service::Node.js"], NodeC{{"Large Language Model (Gemini)"}}. Never leave special characters like colons, parentheses, or dots unquoted inside shape markers!
    `;

    let mermaidCode = fallbackDiagram;
    try {
      const { text } = await generateText({
        model: google("gemini-2.0-flash"),
        prompt: prompt,
      });
      mermaidCode = cleanMermaidCode(text);
    } catch (aiErr: any) {
      console.error("AI Generation failed, using fallback architecture diagram:", aiErr);
    }

    return new Response(JSON.stringify({ mermaid: mermaidCode }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Architecture Gen Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
