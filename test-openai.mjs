import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Testing OpenAI API Key...");
  try {
    const response = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: "Hello! Reply with 'AI connection successful!'",
    });
    console.log("Success! Response:", response.text);
  } catch (error) {
    console.error("OpenAI API call failed:", error);
  }
}

main();
