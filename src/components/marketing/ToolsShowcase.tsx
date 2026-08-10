"use client"

import { FileText, Mail, Briefcase, Code2, Video, Search, PenTool, ImageIcon, ArrowRight } from "lucide-react"
import Link from "next/link"

const TOOLS = [
  {
    title: "Blog Writer",
    description: "Generate high-quality SEO-optimized blog posts in seconds.",
    icon: FileText,
  },
  {
    title: "Email Generator",
    description: "Professional emails for sales, support, and marketing.",
    icon: Mail,
  },
  {
    title: "LinkedIn Post",
    description: "Viral LinkedIn content to grow your personal brand.",
    icon: Briefcase,
  },
  {
    title: "AI Code Generator",
    description: "Write clean, efficient code in any programming language.",
    icon: Code2,
  },
  {
    title: "YouTube Script",
    description: "Engaging video scripts for your YouTube channel.",
    icon: Video,
  },
  {
    title: "SEO Optimizer",
    description: "Analyze and optimize your content for search engines.",
    icon: Search,
  },
  {
    title: "Resume Builder",
    description: "Professional resumes tailored to job descriptions.",
    icon: PenTool,
  },
  {
    title: "Image Prompt",
    description: "Detailed prompts for Midjourney and DALL-E.",
    icon: ImageIcon,
  },
]

export const ToolsShowcase = () => {
  return (
    <section className="bg-[#fafafa] py-24 border-t border-slate-100" id="tools">
      <div className="section-padding max-w-7xl mx-auto px-6">
        
        <div className="mb-16 text-center md:text-left">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest">
            Tools Directory
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-3 mb-4">
            Specialized generators for every business operation.
          </h2>
          <p className="text-slate-500 text-[15px] max-w-2xl leading-relaxed">
            Stop starting from scratch. DevKit offers a complete directory of tailored AI tools to accelerate your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TOOLS.map((tool, i) => (
            <Link key={i} href="/tools" className="block h-full">
              <div className="border border-slate-200 bg-white p-6 rounded-xl h-full flex flex-col group hover:border-indigo-200 hover:shadow-[0_4px_14px_0_rgba(99,102,241,0.08)] transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-indigo-50/50 text-indigo-600 flex items-center justify-center mb-5 flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <tool.icon size={18} />
                </div>
                <h3 className="text-[15px] font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-grow">
                  {tool.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
           <Link href="/dashboard">
             <button className="h-11 px-6 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 text-sm font-semibold transition-colors shadow-sm inline-flex items-center gap-2">
               Explore all tools
               <ArrowRight size={14} />
             </button>
           </Link>
        </div>

      </div>
    </section>
  )
}
