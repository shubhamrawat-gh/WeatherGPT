import React from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

interface AuthCardProps {
  children: React.ReactNode
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="w-full glass-panel p-8 rounded-2xl shadow-2xl shadow-black/55 flex flex-col gap-6"
    >
      {children}
    </motion.div>
  )
}
