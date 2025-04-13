"use client"

import { motion } from "framer-motion"
import { Button } from "../ui/button"

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-20 relative">
      {/* Decorative stars */}
      <div className="absolute top-10 left-1/4 w-2 h-2 bg-white rounded-full opacity-60"></div>
      <div className="absolute bottom-20 right-1/3 w-3 h-3 bg-white rounded-full opacity-50"></div>
      <div className="absolute top-40 right-1/4 w-1 h-1 bg-white rounded-full opacity-60"></div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
      >
        Connect, <span className="text-purple-400">Communicate</span>,<br />
        and <span className="text-purple-400">Grow</span> with Us
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="text-xl text-gray-300 max-w-2xl mb-10"
      >
        An AI-powered conversation environment designed specifically for people with autism and similar communication
        challenges to practice and improve their social interaction skills.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Button variant="large">Get Started</Button>
      </motion.div>
    </section>
  )
}

