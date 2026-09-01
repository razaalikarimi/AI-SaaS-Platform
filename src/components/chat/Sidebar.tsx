/* eslint-disable */
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Plus,
  MessageSquare,
  LayoutDashboard,
  CreditCard,
  Users,
  FolderOpen,
  Star,
  Settings,
  Zap,
  GitBranch,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatList } from "./ChatList"
import { Logo } from "@/components/Logo"
import { useUsage } from "@/context/UsageContext"
import { useUser, UserButton } from "@clerk/nextjs"

const routes = [
  { label: "Overview",       icon: LayoutDashboard, href: "/dashboard", badge: null  },
  { label: "Chat",           icon: MessageSquare,   href: "/chat",      badge: null  },
  { label: "Tools",          icon: Zap,             href: "/tools",     badge: "New" },
  { label: "Knowledge",      icon: FolderOpen,      href: "/knowledge", badge: null  },
  { label: "Repositories",   icon: GitBranch,       href: "/repomind",  badge: null  },
  { label: "Prompts",        icon: Star,            href: "/prompts",   badge: null  },
  { label: "Team",           icon: Users,           href: "/team",      badge: null  },
  { label: "Billing",        icon: CreditCard,      href: "/billing",   badge: null  },
]

export const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const { isProUser, remainingGuestChats, guestChatLimit } = useUsage()
  const { user, isSignedIn } = useUser()

  useEffect(() => { setIsMounted(true) }, [])

  const handleNewChat = () => {
    router.push("/chat")
  }

  if (!isMounted) return null

  return (
    <div className="flex w-[260px] h-full flex-col flex-shrink-0 bg-white border-r border-slate-200">

      {/* Brand */}
      <Link href="/">
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
          <Logo />
        </div>
      </Link>

      {/* New Conversation Button */}
      <div className="px-4 py-3 border-b border-slate-100">
        <button
          onClick={handleNewChat}
          className="w-full h-9 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 text-sm font-semibold transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={14} />
          New Conversation
        </button>
      </div>

      {/* Navigation Routes */}
      <ScrollArea className="flex-1 px-3 py-3">
        <div className="space-y-0.5">
          {routes.map((route, i) => {
            const isActive = pathname === route.href || (route.href !== "/dashboard" && pathname.startsWith(route.href))
            return (
              <Link key={i} href={route.href}>
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all group
                    ${isActive
                      ? "bg-slate-100 text-slate-900 font-medium"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}
                  `}
                >
                  <route.icon
                    size={16}
                    className={isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"}
                  />
                  <span className="flex-1 truncate">{route.label}</span>
                  {route.badge && (
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-1.5 py-0.5 rounded">
                      {route.badge}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Chat History */}
        <div className="mt-5">
          <div className="px-3 mb-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] uppercase font-semibold tracking-widest text-slate-400">History</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>
          <ChatList />
        </div>
      </ScrollArea>

      {/* User Footer */}
      {isSignedIn ? (
        <div className="p-3.5 border-t border-slate-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserButton />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 truncate">
                  {user?.fullName || user?.firstName || "Member"}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {isProUser ? "⭐ Pro Plan" : "Free Plan"}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md shrink-0"
              onClick={() => router.push("/billing")}
            >
              <Settings size={14} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700">Guest Trial</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                {remainingGuestChats}/{guestChatLimit} Left
              </span>
            </div>

            <Link href="/sign-in" className="w-full">
              <button className="w-full h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer">
                <LogIn size={13} />
                Sign In / Register
              </button>
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}
