/* eslint-disable */
import { openai } from "@ai-sdk/openai"
import { streamText, generateId, generateText, tool } from "ai"
import { z } from "zod"
import { db } from "@/lib/db"
import { auth, currentUser } from "@clerk/nextjs/server"

export const maxDuration = 30

async function getDbUserId(): Promise<string> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return "demo-user-id";
    let user = await db.user.findUnique({ where: { clerkId } });
    if (!user) {
      const clerkUser = await currentUser();
      user = await db.user.create({
        data: {
          clerkId,
          email: clerkUser?.emailAddresses[0]?.emailAddress || `${clerkId}@example.com`,
          name: clerkUser?.fullName || 'New User',
        }
      });
    }
    return user.id;
  } catch {
    return "demo-user-id";
  }
}

export async function POST(req: Request) {
  const userId = await getDbUserId()
  const { messages, model, personality, chatId } = await req.json()
  console.log("Incoming Messages:", JSON.stringify(messages, null, 2))

  // Comprehensive DevKit Master System Message
  let systemMessage = `You are DevKit AI — the core intelligent assistant of DevKit (an enterprise-grade AI SaaS platform for developers and modern businesses).
You are versatile, extremely knowledgeable, proactive, and friendly. You answer every question thoroughly, accurately, and with helpful explanations.

--- ABOUT DEVKIT PLATFORM ---
DevKit is an all-in-one AI SaaS developer & productivity ecosystem featuring:
1. **RepoMind (Flagship)**: Connect any public or private GitHub repository to:
   - Generate interactive Mermaid architecture diagrams & flowcharts (/repomind/[repoId]/architecture)
   - Perform automated security audits and detect vulnerabilities (/repomind/[repoId]/security)
   - AI-powered Pull Request (PR) reviews and code suggestions (/repomind/[repoId]/pr-review)
   - Chat with full repository context & codebase intelligence (/repomind/[repoId]/chat)
2. **AI Tools Suite (/tools)**:
   - AI Code Generator: Generates production-ready, typed code in Next.js, Python, TypeScript, Go, Rust, React, etc.
   - SEO Optimizer: Content optimization, meta tags, and keyword density checker.
   - Blog Writer & Email Generator: High-converting copy and enterprise communications.
   - LinkedIn Post & YouTube Script Generator: Viral content curation.
   - Resume Builder & Image Prompt generator for DALL-E/Midjourney.
3. **Knowledge Base (RAG) (/knowledge)**: Upload PDF, DOCX, and TXT files for semantic search and document chat.
4. **Prompt Library (/prompts)**: Custom enterprise prompt templates with variable replacement.
5. **Team Workspaces (/team)** & Usage Analytics (/billing).

--- GENERAL CAPABILITIES & BEHAVIOR ---
- Answer ALL user questions: coding, system design, general knowledge, math, science, current affairs, weather, recommendations, everyday casual conversation.
- If asked about weather, locations, or live public facts, utilize your available tools or provide accurate, context-aware information.
- Format responses beautifully with Markdown, code blocks, bullet points, and bold text for readability.
- When asked "who are you" or "what is DevKit", introduce yourself proudly as DevKit AI and highlight key platform capabilities.`;

  if (personality === "Professional") {
    systemMessage += "\nTone: Professional, structured, and focused on business value.";
  } else if (personality === "Creative") {
    systemMessage += "\nTone: Creative, engaging, with rich explanations and innovative ideas.";
  } else if (personality === "Code Expert") {
    systemMessage += "\nTone: Expert software engineer. Provide detailed code examples with best practices and TypeScript types.";
  } else if (personality === "Concise") {
    systemMessage += "\nTone: Direct, concise, no fluff.";
  }

  // Use the selected model or fallback
  const selectedModel = process.env.OPENAI_MODEL || "gpt-4o-mini"

  // Load User Knowledge Base Documents
  try {
    const userDocs = await db.document.findMany({
      where: { userId, content: { not: null } }
    });
    
    if (userDocs && userDocs.length > 0) {
      systemMessage += `\n\n--- KNOWLEDGE BASE CONTEXT ---\nYou have access to the following documents uploaded by the user. Use this information to answer their questions if relevant. Do not mention that you are reading from a knowledge base unless asked.\n\n`;
      userDocs.forEach((doc: any) => {
        if (doc.content) {
           systemMessage += `[Document Name: ${doc.name}]\n${doc.content.substring(0, 50000)}\n\n`; // Prevent exceeding limits
        }
      });
      systemMessage += `--- END OF KNOWLEDGE BASE ---\n\n`;
    }
  } catch (err) {
    console.error("Failed to load documents for RAG context:", err);
  }

  // Map UI messages to CoreMessages for streamText
  const coreMessages = messages.map((m: any) => ({
    role: m.role,
    content: m.parts ? m.parts.map((p: any) => p.text).join("") : m.content
  }))

  // Save the latest user message
  if (chatId && coreMessages.length > 0) {
    const lastMessage = coreMessages[coreMessages.length - 1];
    if (lastMessage.role === "user") {
      try {
        await db.message.create({
          data: {
            conversationId: chatId,
            role: "user",
            content: lastMessage.content
          }
        })
      } catch (err) {
        console.error("Failed to save user message:", err)
      }
    }
  }

  // Fire and forget auto-titling for new chats
  if (messages.length === 1 && chatId) {
    const userMessage = coreMessages[0].content;
    if (userMessage) {
      Promise.resolve().then(async () => {
        try {
          const titleResponse = await generateText({
            model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
            system: "Generate a very short (2-4 words) concise title for this chat based on the user's message. Do not use quotes, labels, or prefixes. Just the title.",
            prompt: userMessage,
          })
          const generatedTitle = titleResponse.text.trim().replace(/^["']|["']$/g, '').substring(0, 50)
          
          await db.conversation.update({
            where: { id: chatId },
            data: { title: generatedTitle }
          })
        } catch (err) {
          console.error("[Auto-Title] Failed to generate title:", err)
        }
      })
    }
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY || "";
    
    // DEMO MODE: If no real key is provided, stream a mock response
    if (!apiKey || apiKey === "AIza..." || apiKey === "your_key_here") {
      const mockText = "Hello! I am DevKit AI. Your interface is connected and functional! To enable live AI responses and tool executions, please provide a valid OPENAI_API_KEY in your .env file.";
      
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const words = mockText.split(" ");
          for (let i = 0; i < words.length; i++) {
            controller.enqueue(encoder.encode(words[i] + " "));
            await new Promise(r => setTimeout(r, 40));
          }
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        }
      });
    }

    const result = await streamText({
      model: openai(selectedModel),
      system: systemMessage,
      messages: coreMessages,
      tools: {
        getLiveWeather: tool({
          description: "Get real-time live weather, temperature, humidity, wind, and forecast for any city or locality in the world (e.g. 'Jamia Nagar Delhi', 'London', 'Mumbai', 'New York').",
          parameters: z.object({
            location: z.string().describe("The city, locality, or area to get weather for"),
          }),
          // @ts-ignore
          execute: async ({ location }) => {
            try {
              const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`, {
                headers: { "User-Agent": "DevKit-AI/1.0" },
                signal: AbortSignal.timeout(6000),
              });
              if (!res.ok) throw new Error("Weather fetch failed");
              const data = await res.json();
              const current = data.current_condition?.[0];
              const nearest = data.nearest_area?.[0];
              return {
                location: `${nearest?.areaName?.[0]?.value || location}, ${nearest?.region?.[0]?.value || ""}, ${nearest?.country?.[0]?.value || ""}`.trim(),
                temperature: `${current?.temp_C}°C (${current?.temp_F}°F)`,
                feelsLike: `${current?.FeelsLikeC}°C`,
                condition: current?.weatherDesc?.[0]?.value || "Clear",
                humidity: `${current?.humidity}%`,
                windSpeed: `${current?.windspeedKmph} km/h`,
                precipitation: `${current?.precipMM} mm`
              };
            } catch (err) {
              return { error: `Could not retrieve live weather for ${location}.` };
            }
          },
        }),
        getCurrentDateTime: tool({
          description: "Get the current real-time date, day of week, local time, and Indian Standard Time (IST).",
          parameters: z.object({}),
          // @ts-ignore
          execute: async () => {
            const now = new Date();
            return {
              utcDate: now.toUTCString(),
              indianStandardTime: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
              iso: now.toISOString()
            };
          }
        }),
        getDevKitFeatures: tool({
          description: "Get full in-depth information about DevKit SaaS platform, RepoMind features, tools, and links.",
          parameters: z.object({}),
          // @ts-ignore
          execute: async () => ({
            platform: "DevKit AI SaaS Platform",
            overview: "An enterprise AI platform for developers & teams with GitHub analysis, automated code tools, document intelligence, and prompt library.",
            features: [
              { name: "RepoMind Architecture", desc: "Interactive Mermaid flowcharts & architecture breakdown", url: "/repomind" },
              { name: "RepoMind Security", desc: "Automated vulnerability scanner & code audit", url: "/repomind" },
              { name: "RepoMind PR Review", desc: "AI-assisted pull request code quality review", url: "/repomind" },
              { name: "RepoMind Chat", desc: "Talk directly to repository code context", url: "/repomind" },
              { name: "AI Code Generator", desc: "Generate enterprise-grade, typed code in any language", url: "/tools/code-generator" },
              { name: "Knowledge Base (RAG)", desc: "Upload docs (PDF, DOCX, TXT) and search context", url: "/knowledge" },
              { name: "Prompt Library", desc: "Reusable curated prompt templates", url: "/prompts" },
              { name: "Specialized Tools", desc: "Blog Writer, Email Generator, LinkedIn Post, SEO Optimizer, Resume Builder", url: "/tools" }
            ]
          })
        })
      },
      // @ts-ignore
      maxSteps: 5,
      onFinish: async ({ text }) => {
        if (chatId) {
          try {
            await db.message.create({
              data: {
                conversationId: chatId,
                role: "assistant",
                content: text
              }
            })
          } catch (err) {
            console.error("Failed to save assistant message:", err)
          }
        }
      }
    })

    // Stream as plain text using fullStream to capture text from ALL steps (including after tool calls)
    const fullStream = result.fullStream;
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let hasContent = false;
        try {
          for await (const part of fullStream) {
            if (part.type === 'text-delta') {
              hasContent = true;
              controller.enqueue(encoder.encode(part.text));
            }
          }
          if (!hasContent) {
            controller.enqueue(encoder.encode("⚠️ AI returned an empty response. Please check your OPENAI_API_KEY and OPENAI_MODEL in Vercel Environment Variables."));
          }
        } catch (e: any) {
          console.error("Stream error:", e);
          const errorMsg = `⚠️ AI Stream Error: ${e?.message || "Unknown error"}. Please verify your OPENAI_API_KEY is valid and has credits.`;
          controller.enqueue(encoder.encode(hasContent ? `\n\n${errorMsg}` : errorMsg));
        } finally {
          controller.close();
        }
      }
    });
    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      }
    })
  } catch (error) {
    console.error("Chat API Error (Falling back to mock stream):", error)
    
    const mockText = "⚠️ [API Notification] An error occurred while generating AI response. Please check your OpenAI API key and quota in .env.";
    
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const words = mockText.split(" ");
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(encoder.encode(words[i] + " "));
          await new Promise(r => setTimeout(r, 40));
        }
        controller.close();
      }
    });
    
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      }
    });
  }
}

