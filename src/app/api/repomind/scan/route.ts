import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { repoId } = await req.json()

    if (!repoId) {
      return NextResponse.json({ error: "Missing repoId" }, { status: 400 })
    }

    const repo = await db.repository.findUnique({
      where: { id: repoId }
    })

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    // Update status to INDEXING
    await db.repository.update({
      where: { id: repoId },
      data: { status: "INDEXING" }
    })

    // Fetch GitHub Repo structure
    let filesCount = 0
    try {
      const githubToken = process.env.GITHUB_TOKEN || ""
      const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "DevKit-Scan-Agent",
      }
      if (githubToken) {
        headers["Authorization"] = `token ${githubToken}`
      }

      const treeUrl = `https://api.github.com/repos/${repo.fullName}/git/trees/${repo.defaultBranch || 'main'}?recursive=1`
      const treeResponse = await fetch(treeUrl, { headers })

      if (treeResponse.ok) {
        const treeData = await treeResponse.json()
        const treeFiles = treeData.tree.filter((item: any) => item.type === "blob" && !item.path.startsWith("node_modules/") && !item.path.startsWith(".git/"))
        
        filesCount = treeFiles.length

        // Clean up previous files if any to avoid unique key conflicts
        await db.repositoryFile.deleteMany({
          where: { repositoryId: repoId }
        })

        // Create RepositoryFiles (take up to 100 to avoid database bloat)
        const filesToCreate = treeFiles.slice(0, 100).map((file: any) => {
          const parts = file.path.split("/")
          const name = parts[parts.length - 1]
          return {
            path: file.path,
            name: name,
            content: `// Source code for file: ${file.path}`,
            size: file.size || 100,
            sha: file.sha || "",
            repositoryId: repoId
          }
        })

        if (filesToCreate.length > 0) {
          await db.repositoryFile.createMany({
            data: filesToCreate
          })
        }
      }
    } catch (e) {
      console.error("[Scan API] GitHub fetch failed:", e)
    }

    // Update status to READY
    const updatedRepo = await db.repository.update({
      where: { id: repoId },
      data: { status: "READY" },
      include: { files: true }
    })

    return NextResponse.json({
      success: true,
      filesCount: updatedRepo.files.length,
      status: updatedRepo.status
    })

  } catch (error: any) {
    console.error("Scan error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const repoId = searchParams.get("repoId")

    if (!repoId) {
      return NextResponse.json({ error: "Missing repoId" }, { status: 400 })
    }

    const repo = await db.repository.findUnique({
      where: { id: repoId },
      include: { files: true }
    })

    if (!repo) {
      return NextResponse.json({ error: "Repository not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      filesCount: repo.files.length,
      status: repo.status
    })

  } catch (error: any) {
    console.error("Scan GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
