"use client"

import { 
  FileText, 
  Mail, 
  Briefcase, 
  Code2, 
  Search, 
  Video, 
  PenTool, 
  Image as ImageIcon, 
  Zap,
  ArrowRight
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUsage } from "@/context/UsageContext"

const tools = [
  {
    title: "Blog Writer",
    description: "Generate high-quality SEO-optimized blog posts in seconds.",
    icon: FileText,
    href: "/tools/blog-writer",
  },
  {
    title: "Email Generator",
    description: "Professional emails for sales, support, and marketing.",
    icon: Mail,
    href: "/tools/email-generator",
  },
  {
    title: "LinkedIn Post",
    description: "Viral LinkedIn content to grow your personal brand.",
    icon: Briefcase,
    href: "/tools/linkedin-post",
  },
  {
    title: "AI Code Generator",
    description: "Write clean, efficient code in any programming language.",
    icon: Code2,
    href: "/tools/code-generator",
  },
  {
    title: "YouTube Script",
    description: "Engaging video scripts for your YouTube channel.",
    icon: Video,
    href: "/tools/youtube-script",
  },
  {
    title: "SEO Optimizer",
    description: "Analyze and optimize your content for search engines.",
    icon: Search,
    href: "/tools/seo-optimizer",
  },
  {
    title: "Resume Builder",
    description: "Professional resumes tailored to job descriptions.",
    icon: PenTool,
    href: "/tools/resume-builder",
  },
  {
    title: "Image Prompt",
    description: "Detailed prompts for Midjourney and DALL-E.",
    icon: ImageIcon,
    href: "/tools/image-prompt",
  }
]

export default function ToolsPage() {
  const router = useRouter()
  const { incrementTool } = useUsage()

  const handleToolClick = async (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    const allowed = await incrementTool()
    if (allowed) {
      router.push(href)
    }
  }

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#F8FAFC]">
      <div className="max-w-6xl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900">Tools Directory</h1>
        <p className="text-slate-500 text-sm mt-1">Specialized enterprise-grade generators for every business operation.</p>
      </div>

      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <Input 
          placeholder="Search tools..." 
          className="pl-12 bg-white border-slate-200 rounded-xl h-11 text-sm focus-visible:ring-indigo-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool, i) => (
          <a key={i} href={tool.href} onClick={(e) => handleToolClick(e, tool.href)}>
            <div className="card-base p-7 group h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <tool.icon size={20} className="text-indigo-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tool.description}
                </p>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Open Tool <ArrowRight size={12} />
              </div>
            </div>
          </a>
        ))}
      </div>
      </div>
    </div>
  )
}
