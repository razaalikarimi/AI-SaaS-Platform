/* eslint-disable */
import { ChatWindow } from "@/components/chat/ChatWindow"
import { db } from "@/lib/db"

export default async function ChatIdPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { chatId } = await params;

  // Fetch old messages from DB
  let messages: any[] = [];
  try {
    messages = await db.message.findMany({
      where: { conversationId: chatId },
      orderBy: { createdAt: "asc" }
    })
  } catch (err) {
    console.error("Failed to load messages:", err)
  }

  // Map them to the AI SDK format
  const initialMessages = messages.map((m: any) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    parts: [{ type: "text", text: m.content }]
  }))

  return <ChatWindow key={chatId} initialMessages={initialMessages as any} />
}
