"use client"

import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { User, Trophy } from "lucide-react"
import Link from "next/link"
import { MobileNav } from "./mobile-navbar"
import { navItems } from "./nav-items"

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <nav className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent"
            >
              ConvoAI
            </motion.div>
          </Link>
        </div>

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
          <Link href="/levels">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </motion.div>
          </Link>
          <Link href="/profile/dashboard">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
            >
              <User className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </motion.div>
          </Link>
          <div className="hidden md:block">
            <Link href="/signup">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
                Sign Up
              </Button>
            </Link>
          </div>
        </motion.div>
      </nav>
    </header>
  )
}