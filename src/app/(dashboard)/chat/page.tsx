"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createConversation } from "@/actions/chat"
import { Loader2 } from "lucide-react"

export default function ChatPage() {
  const router = useRouter()

  useEffect(() => {
    let isNavigating = false;
    const initChat = async () => {
      try {
        console.log("[ChatPage] Calling createConversation...");
        
        // Add a 8 second timeout to the server action
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Server action timed out")), 8000)
        );
        
        const chat = await Promise.race([
          createConversation(),
          timeoutPromise
        ]) as any;
        
        console.log("[ChatPage] createConversation returned:", chat);
        
        if (chat && chat.id && !isNavigating) {
          isNavigating = true;
          console.log("[ChatPage] Navigating to /chat/" + chat.id);
          window.location.href = `/chat/${chat.id}`; // Force hard navigation to bypass router hangs
        }
      } catch (err) {
        console.error("Failed to initialize chat session:", err);
        // Fallback to local chat on failure
        if (!isNavigating) {
          isNavigating = true;
          const fallbackId = crypto.randomUUID();
          console.log("[ChatPage] Fallback navigation to /chat/" + fallbackId);
          window.location.href = `/chat/${fallbackId}`;
        }
      }
    }
    initChat()
  }, [])

  return (
    <div className="flex items-center justify-center h-full w-full bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <span className="text-xs font-semibold tracking-wider text-slate-500">Initializing Chat Session...</span>
      </div>
    </div>
  )
}
