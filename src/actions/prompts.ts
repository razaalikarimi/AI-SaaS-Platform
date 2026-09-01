"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth, currentUser } from "@clerk/nextjs/server"

const getDbUserId = async () => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  try {
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
  } catch (error) {
    return null;
  }
}

export const getPrompts = async () => {
  try {
    const userId = await getDbUserId();
    
    if (!userId) {
      // For guest visitors, return public/starter prompts
      return await db.promptTemplate.findMany({
        where: { isPublic: true },
        orderBy: { createdAt: "desc" }
      });
    }

    return await db.promptTemplate.findMany({
      where: {
        OR: [
          { userId },
          { isPublic: true }
        ]
      },
      orderBy: {
        createdAt: "desc"
      }
    })
  } catch (error) {
    console.error("[getPrompts] Error:", error)
    return []
  }
}

export const createPrompt = async (data: { name: string, description: string, prompt: string, isPublic: boolean }) => {
  const userId = await getDbUserId();
  if (!userId) {
    throw new Error("Please sign in to save custom prompts.");
  }

  const prompt = await db.promptTemplate.create({
    data: {
      ...data,
      userId
    }
  })
  revalidatePath("/prompts")
  return prompt
}

export const deletePrompt = async (id: string) => {
  const userId = await getDbUserId();
  if (!userId) throw new Error("Unauthorized");

  try {
    // deleteMany used to avoid throwing an error if the record doesn't exist or isn't owned by this user
    await db.promptTemplate.deleteMany({
      where: { id, userId }
    })
    revalidatePath("/prompts")
  } catch (error) {
    console.error("[deletePrompt] Error:", error)
    revalidatePath("/prompts")
  }
}
