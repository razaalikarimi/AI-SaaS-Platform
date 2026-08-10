"use server"

import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

const CHAT_LIMIT = 5
const TOOL_LIMIT = 2

// Helper to get Db User ID
const getDbUserId = async () => {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw new Error("Unauthorized")

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) throw new Error("User not found in DB")
  
  return user.id
}

export const getUserUsage = async () => {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return null

    const user = await db.user.findUnique({
      where: { clerkId },
      select: {
        chatCount: true,
        toolCount: true,
        plan: true,
      }
    })

    if (!user) return null

    return {
      chatCount: user.chatCount,
      toolCount: user.toolCount,
      isProUser: user.plan === "PRO",
    }
  } catch (error) {
    console.error("[getUserUsage]", error)
    return null
  }
}

export const incrementChatAction = async () => {
  try {
    const userId = await getDbUserId()
    const user = await db.user.findUnique({ where: { id: userId } })
    
    if (!user) return false

    if (user.plan === "PRO") return true
    
    if (user.chatCount >= CHAT_LIMIT) {
      return false // Blocked
    }

    await db.user.update({
      where: { id: userId },
      data: { chatCount: { increment: 1 } }
    })

    revalidatePath("/")
    return true
  } catch (error) {
    console.error("[incrementChatAction]", error)
    return false
  }
}

export const incrementToolAction = async () => {
  try {
    const userId = await getDbUserId()
    const user = await db.user.findUnique({ where: { id: userId } })
    
    if (!user) return false

    if (user.plan === "PRO") return true
    
    if (user.toolCount >= TOOL_LIMIT) {
      return false // Blocked
    }

    await db.user.update({
      where: { id: userId },
      data: { toolCount: { increment: 1 } }
    })

    revalidatePath("/")
    return true
  } catch (error) {
    console.error("[incrementToolAction]", error)
    return false
  }
}

export const upgradeUserToProAction = async () => {
  try {
    const userId = await getDbUserId()
    await db.user.update({
      where: { id: userId },
      data: { plan: "PRO" }
    })
    revalidatePath("/")
    return true
  } catch (error) {
    console.error("[upgradeUserToProAction]", error)
    return false
  }
}
