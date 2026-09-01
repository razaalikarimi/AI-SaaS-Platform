/* eslint-disable */
import { openai } from "@ai-sdk/openai"
import { streamText, generateId, generateText, tool, stepCountIs } from "ai"
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
  let systemMessage = `You are DevKit AI — an omniscient, elite, enterprise-grade AI assistant.
Your absolute mission is to provide 100% accurate, complete, well-structured, and helpful answers to EVERY question the user asks. Nothing should ever be left unanswered.

--- GUIDELINES FOR PERFECT ANSWERS ---
1. **Total Knowledge & Accuracy**:
   - Answer all questions across coding, software architecture, mathematics, science, technology, history, geography, current affairs, business, writing, reasoning, and daily general knowledge.
   - For real-time data like live weather, date/time, or factual lookups, ALWAYS utilize your specialized tools for up-to-the-minute precision.
2. **Comprehensive & Clear Formatting**:
   - Structure answers logically using clean Markdown: clear headings (##, ###), bullet points, tables, and **bold text** for key highlights.
   - For code, ALWAYS provide production-ready, typed, error-free code blocks with syntax highlighting and explanatory comments.
3. **Proactive & Friendly**:
   - Never give vague, one-line, or dismissive answers.
   - Explain the "why" and "how" with practical examples and step-by-step guidance.
4. **DevKit Ecosystem**:
   - If relevant, connect developer queries to DevKit's tools: RepoMind (architecture diagrams, security audits, PR reviews, repo chat) and AI Code Tools (/tools).`;

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
          description: "Get hyper-accurate real-time live weather, temperature, humidity, wind, and forecast for any city, town, locality, or landmark in the world.",
          inputSchema: z.object({
            location: z.string().describe("The city, locality, district, or place name (e.g. 'Patna', 'Delhi', 'London', 'Darjeeling')"),
          }),
          execute: async ({ location }: { location: string }) => {
            // WMO Weather interpretation code map
            const wmoCodes: Record<number, string> = {
              0: "Clear sky",
              1: "Mainly clear",
              2: "Partly cloudy",
              3: "Overcast",
              45: "Fog",
              48: "Depositing rime fog",
              51: "Light drizzle",
              53: "Moderate drizzle",
              55: "Dense drizzle",
              61: "Slight rain",
              63: "Moderate rain",
              65: "Heavy rain",
              71: "Slight snow fall",
              73: "Moderate snow fall",
              75: "Heavy snow fall",
              80: "Slight rain showers",
              81: "Moderate rain showers",
              82: "Violent rain showers",
              95: "Thunderstorm",
              96: "Thunderstorm with slight hail",
              99: "Thunderstorm with heavy hail"
            };

            // Intelligent region alias mapping for states/valleys
            const regionAliases: Record<string, string> = {
              "kashmir": "Srinagar, Jammu and Kashmir, India",
              "jammu and kashmir": "Srinagar, Jammu and Kashmir, India",
              "j&k": "Srinagar, Jammu and Kashmir, India",
              "sikkim": "Gangtok, Sikkim, India",
              "goa": "Panaji, Goa, India",
              "ladakh": "Leh, Ladakh, India",
              "kerala": "Kochi, Kerala, India",
              "uttarakhand": "Dehradun, Uttarakhand, India",
              "himachal": "Shimla, Himachal Pradesh, India",
              "himachal pradesh": "Shimla, Himachal Pradesh, India"
            };

            const searchLoc = regionAliases[location.trim().toLowerCase()] || location.trim();

            try {
              // 1. Geocode location with top 5 results and pick highest population match
              const geoRes = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchLoc)}&count=5&language=en&format=json`,
                { signal: AbortSignal.timeout(5000) }
              );
              const geoData = await geoRes.json();
              
              if (geoData?.results && geoData.results.length > 0) {
                // Sort by population descending so major cities are always picked over small villages
                const sortedResults = [...geoData.results].sort((a, b) => (b.population || 0) - (a.population || 0));
                const place = sortedResults[0];
                
                const weatherRes = await fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
                  { signal: AbortSignal.timeout(5000) }
                );
                const wData = await weatherRes.json();
                const current = wData.current;
                const daily = wData.daily;
                const condition = wmoCodes[current?.weather_code] || "Clear";
                
                return {
                  location: `${place.name}${place.admin1 ? ', ' + place.admin1 : ''}, ${place.country || ''}`.trim(),
                  temperature: `${Math.round(current?.temperature_2m)}°C (${Math.round((current?.temperature_2m * 9/5) + 32)}°F)`,
                  feelsLike: `${Math.round(current?.apparent_temperature)}°C`,
                  condition: condition,
                  humidity: `${current?.relative_humidity_2m}%`,
                  windSpeed: `${current?.wind_speed_10m} km/h`,
                  precipitation: `${current?.precipitation} mm`,
                  todayMax: daily?.temperature_2m_max?.[0] ? `${Math.round(daily.temperature_2m_max[0])}°C` : undefined,
                  todayMin: daily?.temperature_2m_min?.[0] ? `${Math.round(daily.temperature_2m_min[0])}°C` : undefined,
                  source: "Open-Meteo High Precision Satellite Radar"
                };
              }
            } catch (err) {
              console.warn("Open-Meteo fetch failed, falling back to wttr.in:", err);
            }

            // Fallback to wttr.in if geocoding fails
            try {
              const res = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`, {
                headers: { "User-Agent": "DevKit-AI/1.0" },
                signal: AbortSignal.timeout(5000),
              });
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
            } catch {
              return { error: `Live weather temporarily unavailable for ${location}.` };
            }
          },
        }),
        searchKnowledgeAndFacts: tool({
          description: "Search live verified facts, encyclopedic summaries, history, science, geography, notable figures, and technology information.",
          inputSchema: z.object({
            query: z.string().describe("The topic, question, or entity to search facts for"),
          }),
          execute: async ({ query }: { query: string }) => {
            try {
              const wikiRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.trim())}`,
                { signal: AbortSignal.timeout(4000), headers: { "User-Agent": "DevKit-AI/1.0" } }
              );
              if (wikiRes.ok) {
                const wikiData = await wikiRes.json();
                if (wikiData.extract) {
                  return {
                    title: wikiData.title,
                    summary: wikiData.extract,
                    source: "Wikipedia Verified Knowledge"
                  };
                }
              }
            } catch (err) {
              console.warn("Wiki search failed:", err);
            }
            return { query, note: "Answer using your vast internal knowledge base with full details." };
          }
        }),
        getCurrentDateTime: tool({
          description: "Get the current real-time date, day of week, local time, and Indian Standard Time (IST).",
          inputSchema: z.object({}),
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
          inputSchema: z.object({}),
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
      stopWhen: stepCountIs(5),
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

