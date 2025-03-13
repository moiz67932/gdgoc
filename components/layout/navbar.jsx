"use client"

import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { User } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Research", href: "#research" },
    { name: "About Us", href: "#about" },
  ]

  return (
    <nav className="container mx-auto px-4 h-16 flex justify-between items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent"
      >
        ConvoAI
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1, delayChildren: 0.2 }}
        className="hidden md:flex space-x-8"
      >
        {navItems.map((item, index) => (
          <motion.a
            key={index}
            whileHover={{ scale: 1.05 }}
            className="text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition-colors font-medium"
            href={item.href}
          >
            {item.name}
          </motion.a>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.5 }}
        className="flex items-center space-x-4"
      >
        <Link href="/dashboard">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </motion.div>
        </Link>
        <Button
          variant="default"
          className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-600 rounded-full px-6"
        >
          Sign Up
        </Button>
      </motion.div>
    </nav>
  )
}

