/* eslint-disable */
"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

// Fast, lightweight helper to get DB user without slow external Clerk network hops
const getDbUserId = async () => {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return "demo-user-id";

    let user = await db.user.findUnique({ 
      where: { clerkId },
      select: { id: true }
    });
    
    if (!user) {
      user = await db.user.create({
        data: {
          clerkId,
          email: `${clerkId}@devkit.ai`,
          name: 'User',
        },
        select: { id: true }
      });
    }
    return user.id;
  } catch {
    return "demo-user-id";
  }
}

export const createConversation = async (workspaceId?: string) => {
  const userId = await getDbUserId()

  try {
    const conversation = await db.conversation.create({
      data: {
        userId,
        workspaceId,
        title: "New Chat",
        id: crypto.randomUUID(),
        updatedAt: new Date(),
      },
    })

    revalidatePath("/chat")
    return conversation
  } catch (error) {
    console.error("[createConversation] DB write failed:", error);
    // Return a mock conversation so the UI doesn't crash on Vercel
    return {
      id: crypto.randomUUID(),
      userId,
      workspaceId: workspaceId || null,
      title: "New Chat",
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false
    } as any;
  }
}

export const getConversations = async (workspaceId?: string) => {
  try {
    const userId = await getDbUserId()

    return await db.conversation.findMany({
      where: {
        userId,
        workspaceId,
        isArchived: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
  } catch (error) {
    console.error("[getConversations] Error:", error)
    return []
  }
}

export const renameConversation = async (id: string, title: string) => {
  const userId = await getDbUserId()

  try {
    await db.conversation.update({
      where: { id, userId },
      data: { title },
    })
  } catch {
    // Record may not exist or userId mismatch — silently ignore
  }

  revalidatePath("/chat")
}

export const deleteConversation = async (id: string) => {
  const userId = await getDbUserId()

  // deleteMany never throws if record not found (unlike delete)
  await db.conversation.deleteMany({
    where: { id, userId },
  })

  revalidatePath("/chat")
}
