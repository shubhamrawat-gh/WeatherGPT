import type { LucideIcon } from 'lucide-react'

interface InsightCardProps {
  icon: LucideIcon
  title: string
  subtitle?: string
  value: string | number
  statusText?: string
  statusType?: 'success' | 'warning' | 'error' | 'neutral'
}

export default function InsightCard({
  icon: Icon,
  title,
  subtitle,
  value,
  statusText,
  statusType = 'neutral'
}: InsightCardProps) {
  const statusStyles = {
    success: 'text-brand-green bg-brand-green/5 border-brand-green/20',
    warning: 'text-yellow-400 bg-yellow-400/5 border-yellow-400/20',
    error: 'text-red-400 bg-red-400/5 border-red-400/20',
    neutral: 'text-muted-dark bg-surface-dark border-hairline-dark/50'
  }

  return (
    <div className="flex flex-col justify-between gap-3 p-4 rounded-xl border border-hairline-dark/45 bg-surface-dark/15 backdrop-blur-sm select-none">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono font-bold text-muted-dark/80 uppercase tracking-wider">
            {title}
          </span>
          {subtitle ? (
            <span className="text-[9px] text-muted-dark/60 leading-normal">
              {subtitle}
            </span>
          ) : null}
        </div>
        
        <div className="w-8 h-8 rounded bg-brand-teal-deep/50 border border-hairline-dark/70 flex items-center justify-center text-brand-green shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-4 mt-2">
        <span className="text-xl font-bold font-mono text-white tracking-tight leading-none">
          {value}
        </span>

        {statusText ? (
          <span className={`text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border uppercase ${statusStyles[statusType]}`}>
            {statusText}
          </span>
        ) : null}
      </div>
    </div>
  )
}
