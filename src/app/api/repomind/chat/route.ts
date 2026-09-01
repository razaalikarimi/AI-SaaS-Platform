import { openai } from "@ai-sdk/openai";
import { streamText, generateId } from "ai";
import { db } from "@/lib/db";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, repoId } = await req.json();

    let systemMessage = "You are RepoMind AI, an expert software developer. You answer questions about codebases.";

    if (repoId) {
      const repo = await db.repository.findUnique({ 
        where: { id: repoId },
        include: { files: true }
      });
      if (repo) {
        systemMessage = `You are RepoMind AI, an expert software developer. The user is asking questions about the GitHub repository '${repo.fullName}'. 
        Repository Description: ${repo.description || 'No description'}. 
        Main Language: ${repo.language || 'Unknown'}.
        
        Answer all questions assuming they are specifically about this codebase.`;

        if (repo.files && repo.files.length > 0) {
          systemMessage += `\n\nHere are the files in this repository codebase for your context:\n`;
          repo.files.forEach(file => {
            systemMessage += `- Path: ${file.path}\n`;
          });
        }
      }
    }

    const apiKey = process.env.OPENAI_API_KEY || "";
    
    // DEMO MODE: If no real key is provided
    if (!apiKey || apiKey === "AIza..." || apiKey === "your_key_here") {
      const mockText = "This is a simulated AI response. The real AI engine requires a OPENAI_API_KEY in the .env file. Once you provide it, I will be able to answer questions about this repository!";
      
      const messageId = generateId();
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          const words = mockText.split(" ");
          for (let i = 0; i < words.length; i++) {
            const chunk = JSON.stringify(words[i] + " ");
            controller.enqueue(encoder.encode(`0:${chunk}\n`));
            await new Promise(r => setTimeout(r, 40));
          }
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "x-vercel-ai-ui-message-stream": "v1"
        }
      });
    }

    const result = await streamText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      system: systemMessage,
      messages,
    });

    return result.toTextStreamResponse();

  } catch (error) {
    console.error("RepoMind Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
