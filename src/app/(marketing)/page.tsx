import { Navbar } from "@/components/marketing/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { ToolsShowcase } from "@/components/marketing/ToolsShowcase"
import { Features } from "@/components/marketing/Features"
import { Footer } from "@/components/marketing/Footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ToolsShowcase />
      <Features />
      <Footer />
    </main>
  )
}
