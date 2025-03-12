"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/layout/navbar"
import { HeroSection } from "@/components/sections/hero"
import { FeaturesSection } from "@/components/sections/features"
import { CtaSection } from "@/components/sections/cta"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.classList.add("dark")
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 dark text-white">
      <header className="container mx-auto px-4 py-6">
        <Navbar />
      </header>

      <main className="container mx-auto px-4 py-12">
        <HeroSection />
        <FeaturesSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  )
}

