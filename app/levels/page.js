"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { motion } from "framer-motion"
import Link from "next/link"

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

export default function LevelsPage() {
  // Split levels into two arrays - first 6 and the last one
  const mainLevels = levels.slice(0, 6)
  const lastLevel = levels[6]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
          Your Learning Journey
        </h1>
        
        <div className="max-w-5xl mx-auto">
          {/* First 6 levels in a 3x2 grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center mb-8">
            {mainLevels.map((level, index) => (
              <Link href={`/levels/${level.id}`} key={level.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group w-full max-w-[280px]"
                >
                  <div className={`aspect-square rounded-full bg-gradient-to-br ${level.color} p-1 cursor-pointer transform transition-transform duration-300 group-hover:scale-105`}>
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-6 flex flex-col items-center justify-center text-center">
                      <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                        {level.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {level.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
          
          {/* Last level centered separately */}
          <div className="flex justify-center">
            <Link href={`/levels/${lastLevel.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="relative group w-full max-w-[280px]"
              >
                <div className={`aspect-square rounded-full bg-gradient-to-br ${lastLevel.color} p-1 cursor-pointer transform transition-transform duration-300 group-hover:scale-105`}>
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 p-6 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
                      {lastLevel.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {lastLevel.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 