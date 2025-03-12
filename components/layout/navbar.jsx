"use client"

import { motion } from "framer-motion"
import { Button } from "../ui/button"

export function Navbar() {
  const navItems = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Research", href: "#research" },
    { name: "About Us", href: "#about" },
  ]

  return (
    <nav className="flex justify-between items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-bold"
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
            className="hover:text-purple-400 transition-colors"
            href={item.href}
          >
            {item.name}
          </motion.a>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Button>Sign Up</Button>
      </motion.div>
    </nav>
  )
}

