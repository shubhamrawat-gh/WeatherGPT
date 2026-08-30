import type { LucideIcon } from 'lucide-react'

interface MapEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  badgeText?: string
}

export default function MapEmptyState({
  icon: Icon,
  title,
  description,
  badgeText = 'Pipeline Pending',
}: MapEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-hairline-dark/50 bg-surface-dark/10 rounded-xl select-none max-w-sm mx-auto my-6 font-sans">
      <div className="w-10 h-10 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green mb-4">
        <Icon className="w-4.5 h-4.5" aria-hidden="true" />
      </div>
      {badgeText && (
        <span className="font-mono text-[9px] tracking-widest text-brand-green/80 bg-brand-teal-deep border border-brand-green/20 px-2 py-0.5 rounded-full uppercase mb-2">
          {badgeText}
        </span>
      )}
      <h4 className="text-xs font-semibold text-white mb-1.5 uppercase tracking-wide">
        {title}
      </h4>
      <p className="text-[11px] text-muted-dark/80 leading-relaxed m-0">
        {description}
      </p>
    </div>
  )
}
