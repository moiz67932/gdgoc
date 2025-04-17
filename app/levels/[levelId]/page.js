"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

// Level data (same as in the main levels page)
const levels = [
  {
    id: 1,
    title: "Level 1",
    description: "Begin your journey with basic communication skills",
    color: "from-purple-400 to-purple-600"
  },
  {
    id: 2,
    title: "Level 2",
    description: "Master essential conversation techniques",
    color: "from-blue-400 to-blue-600"
  },
  {
    id: 3,
    title: "Level 3",
    description: "Advanced dialogue and response patterns",
    color: "from-green-400 to-green-600"
  },
  {
    id: 4,
    title: "Level 4",
    description: "Complex scenarios and problem-solving",
    color: "from-yellow-400 to-yellow-600"
  },
  {
    id: 5,
    title: "Level 5",
    description: "Expert-level communication strategies",
    color: "from-orange-400 to-orange-600"
  },
  {
    id: 6,
    title: "Level 6",
    description: "Master negotiation and persuasion",
    color: "from-red-400 to-red-600"
  },
  {
    id: 7,
    title: "Level 7",
    description: "Achieve communication mastery",
    color: "from-pink-400 to-pink-600"
  }
]

export default function LevelPage() {
  const params = useParams()
  const levelId = parseInt(params.levelId)
  const [level, setLevel] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentLevel = levels.find(l => l.id === levelId)
    setLevel(currentLevel || null)
  }, [levelId])

  if (!mounted || !level) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <Link href="/levels" className="inline-flex items-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Levels
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            <div className={`h-4 bg-gradient-to-r ${level.color}`} />
            
            <div className="p-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                {level.title}
              </h1>
              
              <div className="flex items-center mb-6">
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${level.color} mr-2`} />
                <span className="text-gray-600 dark:text-gray-400">Level {level.id} of 7</span>
              </div>
              
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                {level.description}
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Level Content Coming Soon
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  This level is currently under development. Check back soon for exciting content and challenges!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
} 