import type { LucideIcon } from 'lucide-react'

interface RequestCategoryCardProps {
  icon: LucideIcon
  title: string
  description: string
  onClick?: () => void
}

export default function RequestCategoryCard({
  icon: Icon,
  title,
  description,
  onClick,
}: RequestCategoryCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`group flex flex-col items-start gap-3 p-5 rounded-xl border border-hairline-dark/50 bg-surface-dark/10 hover:bg-surface-dark/20 hover:border-brand-green/30 transition-all duration-200 text-left select-none ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="w-10 h-10 rounded-lg bg-brand-teal-deep border border-hairline-dark/60 flex items-center justify-center text-brand-green group-hover:border-brand-green/20 group-hover:bg-brand-green/5 transition-all duration-200">
        <Icon className="w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
      </div>
      
      <div className="flex flex-col gap-1.5">
        <h4 className="text-sm font-semibold text-white group-hover:text-brand-green transition-colors duration-200 m-0 font-sans">
          {title}
        </h4>
        <p className="text-xs text-muted-dark/80 leading-relaxed m-0 font-sans">
          {description}
        </p>
      </div>
    </div>
  )
}
