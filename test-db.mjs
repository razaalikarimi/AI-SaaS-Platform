import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to the database...");
  try {
    const userCount = await prisma.user.count();
    console.log("Database connection successful!");
    console.log("Total users in database:", userCount);
    
    // Check if WorkspaceInvite table exists
    const inviteCount = await prisma.workspaceInvite.count();
    console.log("WorkspaceInvite table exists! Total invites:", inviteCount);
  } catch (error) {
    console.error("Database connection failed or table missing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
