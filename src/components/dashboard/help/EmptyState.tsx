import React from 'react'
import type { LucideIcon } from 'lucide-react'
import BaseEmptyState from '../EmptyState'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  badgeText?: string
}

export default function EmptyState(props: EmptyStateProps) {
  return <BaseEmptyState {...props} />
}
