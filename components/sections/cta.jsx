"use client"

import { motion } from "framer-motion"
import { Button } from "../ui/button"

export function CtaSection() {
  return (
    <section className="py-20 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-10 rounded-2xl max-w-4xl mx-auto border border-purple-800/50"
      >
        <h2 className="text-3xl font-bold mb-6">Ready to transform your communication skills?</h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands who are already improving their social interactions with our AI-powered platform.
        </p>
        <Button variant="large">Start Your Journey</Button>
      </motion.div>
    </section>
  )
}

