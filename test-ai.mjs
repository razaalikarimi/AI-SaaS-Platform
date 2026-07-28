import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Testing Google Gemini API Key...");
  try {
    const response = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: "Hello! Reply with 'AI connection successful!'",
    });
    console.log("Success! Response:", response.text);
  } catch (error) {
    console.error("Gemini API call failed:", error);
  }
}

main();
