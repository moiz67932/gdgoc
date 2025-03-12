"use client"

import { motion } from "framer-motion"

export function Button({ children, className = "", onClick, variant = "primary" }) {
  const baseClasses = "px-6 py-2 rounded-full transition-colors font-medium"

  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white",
    large: "bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg",
  }

  const classes = `${baseClasses} ${variants[variant]} ${className}`

  return (
    <motion.button whileHover={{ scale: 1.05, backgroundColor: "#9333ea" }} className={classes} onClick={onClick}>
      {children}
    </motion.button>
  )
}

