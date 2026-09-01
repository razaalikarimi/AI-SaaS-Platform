/* eslint-disable */
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { prompt, systemPrompt } = await req.json()

    if (!prompt) {
      return new Response("Missing prompt", { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY || ""
    if (!apiKey || apiKey === "AIza..." || apiKey === "your_key_here") {
      const mockText = "Hello! Your tools interface is connected. Please provide a valid OPENAI_API_KEY in your .env file to generate live production assets."
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder()
          const words = mockText.split(" ")
          for (let i = 0; i < words.length; i++) {
            controller.enqueue(encoder.encode(words[i] + " "))
            await new Promise(r => setTimeout(r, 20))
          }
          controller.close()
        }
      })
      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        }
      })
    }

    const result = streamText({
      model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
      system: systemPrompt || "You are an expert AI creator and software engineer. Generate production-grade, highly polished, detailed, clean, and complete assets formatted beautifully with Markdown.",
      prompt,
      temperature: 0.7,
    })

    const textStream = result.textStream
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of textStream) {
            controller.enqueue(encoder.encode(chunk))
          }
        } catch (e: any) {
          console.error("[Tools Stream Error]:", e)
          controller.enqueue(encoder.encode(`\n\n⚠️ Error generating output: ${e?.message || "Unknown error"}`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      }
    })
  } catch (error: any) {
    console.error("[Tools API Error]:", error)
    return new Response(error?.message || "Internal Server Error", { status: 500 })
  }
}
