import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface AnalysisEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  badgeText?: string
}

export default function AnalysisEmptyState({
  icon: Icon,
  title,
  description,
  action,
  badgeText = 'Operations Center Staging',
}: AnalysisEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl border border-dashed border-hairline-dark/65 bg-surface-dark/15 backdrop-blur-sm max-w-xl mx-auto w-full select-none">
      <div className="w-12 h-12 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green mb-5">
        <Icon className="w-5 h-5" aria-hidden="true" />
      </div>

      <div className="flex flex-col items-center gap-2 mb-6">
        {badgeText ? (
          <span className="font-mono text-[9px] tracking-widest text-brand-green/70 bg-brand-teal-deep border border-brand-green/25 px-2 py-1 rounded-full uppercase">
            {badgeText}
          </span>
        ) : null}
        <h3 className="text-base font-semibold text-white m-0">
          {title}
        </h3>
        <p className="text-xs text-muted-dark leading-relaxed max-w-sm m-0">
          {description}
        </p>
      </div>

      {action ? (
        <div className="flex items-center gap-3">
          {action}
        </div>
      ) : null}
    </div>
  )
}
