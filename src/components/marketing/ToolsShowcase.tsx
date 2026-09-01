/* eslint-disable */
"use client"

import { FileText, Mail, Briefcase, Code2, Video, Search, PenTool, ImageIcon, ArrowRight } from "lucide-react"
import Link from "next/link"

const TOOLS = [
  {
    title: "AI Code Generator",
    description: "Write clean code, components, and functions in Python, JavaScript, and more.",
    tag: "Coding",
    icon: Code2,
  },
  {
    title: "Blog & Article Writer",
    description: "Write complete articles and blog posts with clear headings on any topic.",
    tag: "Writing",
    icon: FileText,
  },
  {
    title: "Email Writer",
    description: "Write polite, professional emails for sales, client follow-ups, and jobs.",
    tag: "Work",
    icon: Mail,
  },
  {
    title: "LinkedIn Post Writer",
    description: "Create engaging LinkedIn posts and updates to grow your network.",
    tag: "Social",
    icon: Briefcase,
  },
  {
    title: "YouTube Script Writer",
    description: "Create video scripts with catchy hooks, talking points, and endings.",
    tag: "Video",
    icon: Video,
  },
  {
    title: "SEO Content Optimizer",
    description: "Improve your articles and websites to rank higher on Google search.",
    tag: "Google SEO",
    icon: Search,
  },
  {
    title: "Resume Builder",
    description: "Write impressive work experience bullet points for your tech resume.",
    tag: "Jobs",
    icon: PenTool,
  },
  {
    title: "AI Image Prompt Creator",
    description: "Create descriptive prompts to generate high quality images in Midjourney & DALL-E.",
    tag: "Images",
    icon: ImageIcon,
  },
]

export const ToolsShowcase = () => {
  return (
    <section className="bg-white py-20 border-b border-slate-200" id="tools">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Tools List
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mt-3 mb-1.5">
              8+ AI tools for everyday tasks.
            </h2>
            <p className="text-slate-500 text-sm">
              Each tool is built to give you fast, high quality results in seconds.
            </p>
          </div>

          <Link href="/tools" className="shrink-0">
            <button className="h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              View All Tools <ArrowRight size={12} />
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOOLS.map((tool, i) => (
            <Link key={i} href="/tools" className="block h-full group">
              <div className="border border-slate-200 bg-white p-5 rounded-xl h-full flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <tool.icon size={16} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      {tool.tag}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center text-[11px] font-semibold text-slate-400 group-hover:text-indigo-600 transition-colors gap-1">
                  Open Tool <ArrowRight size={10} />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
