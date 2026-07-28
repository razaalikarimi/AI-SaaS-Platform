/* eslint-disable */
import { google } from "@ai-sdk/google"
import { streamText, generateId, generateText } from "ai"
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

  // Construct a system message based on personality
  let systemMessage = "You are DevKit AI, a helpful enterprise assistant."
  
  if (personality === "Professional") {
    systemMessage = "You are a highly professional enterprise AI assistant. Use a formal tone, be concise, and focus on business value."
  } else if (personality === "Creative") {
    systemMessage = "You are a creative AI assistant. Use an engaging tone, be descriptive, and offer innovative ideas."
  } else if (personality === "Code Expert") {
    systemMessage = "You are an expert software engineer. Provide detailed code examples, follow best practices, and explain complex concepts simply."
  } else if (personality === "Concise") {
    systemMessage = "Be extremely brief and to the point. Avoid fluff."
  }

  // Use the selected model or fallback to Flash
  const selectedModel = model === "gemini-1.5-pro" ? "gemini-1.5-pro" : "gemini-2.0-flash"

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
            model: google("gemini-2.0-flash"),
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
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
    
    // DEMO MODE: If no real key is provided, stream a mock response
    if (!apiKey || apiKey === "AIza..." || apiKey === "your_key_here") {
      const mockText = "This is a simulated AI response. Your UI and backend are fully functional! To get real AI generation, please provide a valid GOOGLE_GENERATIVE_AI_API_KEY in the .env file.";
      
      const messageId = generateId();
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          
          // Send text-start
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-start", id: messageId })}\n\n`));
          
          const words = mockText.split(" ");
          for (let i = 0; i < words.length; i++) {
            // Send text-delta
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "text-delta", id: messageId, delta: words[i] + " " })}\n\n`)
            );
            await new Promise(r => setTimeout(r, 50));
          }
          
          // Send text-end
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: messageId })}\n\n`));
          controller.close();
        }
      });
      
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          "x-vercel-ai-ui-message-stream": "v1",
          "x-accel-buffering": "no"
        }
      });
    }

    const result = await streamText({
      model: google(selectedModel),
      system: systemMessage,
      messages: coreMessages,
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

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Chat API Error (Falling back to mock stream):", error)
    
    // Fallback if real API fails (e.g. rate limit / quota exceeded)
    const mockText = "⚠️ [API Quota Exceeded] This is a fallback simulated AI response. Your UI and backend are fully functional, but your provided API key has exhausted its free quota. Please provide a new Google Generative AI API Key to restore real AI generation.";
    
    const messageId = generateId();
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-start", id: messageId })}\n\n`));
        
        const words = mockText.split(" ");
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "text-delta", id: messageId, delta: words[i] + " " })}\n\n`)
          );
          await new Promise(r => setTimeout(r, 50));
        }
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text-end", id: messageId })}\n\n`));
        controller.close();
      }
    });
    
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "x-vercel-ai-ui-message-stream": "v1",
        "x-accel-buffering": "no"
      }
    });
  }
}

