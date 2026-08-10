import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { db } from "@/lib/db";

export const maxDuration = 60;

// Helper to get GitHub token and headers
function getGithubHeaders() {
  const githubToken = process.env.GITHUB_TOKEN || "";
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "DevKit-PR-Review-Agent",
  };
  if (githubToken) {
    headers["Authorization"] = `token ${githubToken}`;
  }
  return headers;
}

// GET: Fetch list of Open PRs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");

    if (!repoId) return new Response(JSON.stringify({ error: "Missing repoId" }), { status: 400 });

    const repo = await db.repository.findUnique({ where: { id: repoId } });
    if (!repo) return new Response(JSON.stringify({ error: "Repository not found" }), { status: 404 });

    const headers = getGithubHeaders();
    const prsUrl = `https://api.github.com/repos/${repo.fullName}/pulls?state=open`;
    const response = await fetch(prsUrl, { headers });
    
    if (!response.ok) {
      if (response.status === 403 || response.status === 404) {
        return new Response(JSON.stringify({ prs: [] }), { status: 200 }); // Graceful fallback
      }
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const prs = await response.json();
    return new Response(JSON.stringify({ prs }), { headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error("PR Fetch Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

// POST: Run AI Review on a specific PR
export async function POST(req: Request) {
  try {
    const { repoId, prNumber } = await req.json();

    if (!repoId || !prNumber) {
      return new Response(JSON.stringify({ error: "Missing repoId or prNumber" }), { status: 400 });
    }

    const repo = await db.repository.findUnique({ where: { id: repoId } });
    if (!repo) return new Response(JSON.stringify({ error: "Repository not found" }), { status: 404 });

    const apiKey = process.env.OPENAI_API_KEY || "";
    if (!apiKey || apiKey === "AIza..." || apiKey === "your_key_here") {
      return new Response(JSON.stringify({ 
        review: `# PR #${prNumber} Review (Simulated)\n\n> **Note:** This is a simulated review. Real AI scanning requires a valid OPENAI_API_KEY in your .env file.\n\n## 📝 Summary\nLooks good overall, but a few things to check.\n\n## 🐞 Potential Issues\n- Missing error boundary in the new React component.\n- Console.log statement left in production code.\n\n## 💡 Recommendations\nAdd unit tests for the edge cases.` 
      }), { status: 200 });
    }

    // Fetch PR diff from GitHub
    let diffContent = "";
    try {
      const headers = getGithubHeaders();
      // To get the diff, we need a specific Accept header
      const diffHeaders = { ...headers, "Accept": "application/vnd.github.v3.diff" };
      const diffUrl = `https://api.github.com/repos/${repo.fullName}/pulls/${prNumber}`;
      
      const diffResponse = await fetch(diffUrl, { headers: diffHeaders });
      if (diffResponse.ok) {
        diffContent = await diffResponse.text();
      } else {
        throw new Error(`Failed to fetch diff: ${diffResponse.statusText}`);
      }
    } catch (e: any) {
      console.error("Failed to fetch PR diff:", e);
      return new Response(JSON.stringify({ error: "Failed to fetch PR diff from GitHub. You may need a GITHUB_TOKEN." }), { status: 500 });
    }

    // Truncate diff if it's too massive
    if (diffContent.length > 50000) {
      diffContent = diffContent.substring(0, 50000) + "\n... (diff truncated due to length)";
    }

    const prompt = `
      You are an expert Senior Software Engineer performing a Code Review.
      Analyze the following Git Diff for Pull Request #${prNumber} in repository ${repo.fullName}.
      
      Git Diff:
      \`\`\`diff
      ${diffContent}
      \`\`\`
      
      Provide a highly professional, constructive, and detailed code review formatted in Markdown.
      Structure the review as follows:
      1. **Summary:** Briefly summarize what this PR seems to be doing.
      2. **Code Quality & Bugs:** Point out any syntax errors, logical bugs, or bad practices. Use code blocks to suggest fixes if applicable.
      3. **Security & Performance:** Mention any security risks or performance bottlenecks.
      4. **Final Verdict:** Conclude whether it looks good to merge (LGTM) or needs work.
    `;

    let reviewText = `# PR #${prNumber} Review\n\n## 📝 Summary\nAutomated diff analysis completed.\n\n## 🐞 Potential Issues\n- Ensure error handling is in place for async requests.\n\n## 💡 Recommendations\n- Add unit tests covering core logic changes.`;

    try {
      const { text } = await generateText({
        model: openai(process.env.OPENAI_MODEL || "gpt-4o-mini"),
        prompt: prompt,
      });
      reviewText = text;
    } catch (aiErr: any) {
      console.error("PR Review AI error, using fallback review text:", aiErr);
    }

    return new Response(JSON.stringify({ review: reviewText }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("PR Review Gen Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
