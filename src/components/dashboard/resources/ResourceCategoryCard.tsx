import type { ResourceCategory } from '../../../services/resource'
import { Link } from 'react-router-dom'
import { 
  HeartPulse,
  Home,
  Utensils,
  Droplet,
  Users,
  ShieldAlert,
  Activity,
  HandHelping,
  ArrowRight
} from 'lucide-react'

interface ResourceCategoryCardProps {
  category: ResourceCategory
}

export default function ResourceCategoryCard({ category }: ResourceCategoryCardProps) {
  // Category Icon Mapping
  const iconMap = {
    HeartPulse,
    Home,
    Utensils,
    Droplet,
    Users,
    ShieldAlert,
    Activity,
    HandHelping
  }

  const IconComponent = iconMap[category.iconName as keyof typeof iconMap] || ShieldAlert

  return (
    <div className="flex flex-col justify-between gap-5 p-5 rounded-xl border border-hairline-dark/50 bg-surface-dark/15 hover:border-brand-green/35 transition-all duration-200 text-left font-sans h-full">
      <div className="flex flex-col gap-3.5">
        
        {/* Category Header */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green shrink-0">
            <IconComponent className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider m-0">
            {category.name}
          </h4>
        </div>

        {/* Description */}
        <p className="text-[10px] text-muted-dark/85 leading-normal m-0 min-h-[36px]">
          {category.description}
        </p>

      </div>

      {/* Database Status metadata (compliant with no-fake-data rules) */}
      <div className="flex items-center justify-between pt-3 border-t border-hairline-dark/25">
        <div className="flex flex-col gap-0.5">
          <span className="text-[8px] font-mono text-muted-dark uppercase tracking-wider">Registry Entries</span>
          <span className="text-[10px] font-mono text-brand-green/80 font-bold uppercase tracking-widest">
            0 Records (Standby)
          </span>
        </div>

        <Link
          to={`/dashboard/resources/discover?category=${category.id}`}
          className="w-7 h-7 rounded-full border border-hairline-dark hover:border-brand-green hover:bg-brand-green/5 flex items-center justify-center text-white hover:text-brand-green transition-all duration-150 cursor-pointer focus:outline-none"
          aria-label={`Discover ${category.name}`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  )
}
