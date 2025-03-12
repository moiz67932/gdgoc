"use client"

import { motion } from "framer-motion"
import { ArrowRight, MessageSquare, Brain, Users } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <MessageSquare className="w-12 h-12 text-purple-400" />,
      title: "Personalized Conversations",
      description:
        "AI avatars adapt to your communication style and provide personalized interactions that help you practice real-world scenarios.",
    },
    {
      icon: <Brain className="w-12 h-12 text-purple-400" />,
      title: "Skill Development",
      description:
        "Gradually build communication skills with structured exercises designed by experts in autism and speech therapy.",
    },
    {
      icon: <Users className="w-12 h-12 text-purple-400" />,
      title: "Safe Environment",
      description:
        "Practice in a judgment-free space where you can learn at your own pace without the anxiety of real-world interactions.",
    },
  ]

  return (
    <section id="features" className="py-20">
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="text-3xl font-bold text-center mb-16"
      >
        How ConvoAI Helps You
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ feature, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-gray-800 bg-opacity-50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500 transition-all"
    >
      <div className="mb-6">{feature.icon}</div>
      <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
      <p className="text-gray-300">{feature.description}</p>
      <motion.a
        whileHover={{ x: 5 }}
        className="inline-flex items-center mt-6 text-purple-400 hover:text-purple-300"
        href="#"
      >
        Learn More <ArrowRight className="ml-2 w-4 h-4" />
      </motion.a>
    </motion.div>
  )
}

