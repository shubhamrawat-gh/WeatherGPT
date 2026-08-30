import React from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

interface DashboardCardProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
}

export default function DashboardCard({
  children,
  title,
  description,
  className = '',
}: DashboardCardProps) {
  const hasHeader = title || description

  return (
    <motion.div
      variants={cardVariants}
      className={`glass-panel p-6 rounded-xl relative overflow-hidden flex flex-col gap-4 ${className}`}
    >
      {hasHeader ? (
        <div className="flex flex-col gap-1 text-left pb-4 border-b border-hairline-dark/30">
          {title ? (
            <h3 className="text-sm font-semibold text-white m-0 select-none">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="text-[11px] text-muted-dark leading-normal m-0 select-none">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      
      <div className="flex-grow flex flex-col">
        {children}
      </div>
    </motion.div>
  )
}
