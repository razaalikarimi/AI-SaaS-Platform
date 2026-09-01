import { Navbar } from "@/components/marketing/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { ToolsShowcase } from "@/components/marketing/ToolsShowcase"
import { Faq } from "@/components/marketing/Faq"
import { CtaBanner } from "@/components/marketing/CtaBanner"
import { Footer } from "@/components/marketing/Footer"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <ToolsShowcase />
      <Faq />
      <CtaBanner />
      <Footer />
    </main>
  )
}
