import { RESOURCE_CATEGORIES } from '../../../services/resource'
import { Filter, RotateCcw } from 'lucide-react'

interface ResourceFiltersProps {
  selectedCategory: string
  onCategoryChange: (val: string) => void
  selectedAvailability: string
  onAvailabilityChange: (val: string) => void
  maxDistance: number
  onDistanceChange: (val: number) => void
  onResetFilters: () => void
}

export default function ResourceFilters({
  selectedCategory,
  onCategoryChange,
  selectedAvailability,
  onAvailabilityChange,
  maxDistance,
  onDistanceChange,
  onResetFilters
}: ResourceFiltersProps) {
  const availabilities = [
    { value: '', label: 'All Availability' },
    { value: 'available', label: 'Available (Fully Staged)' },
    { value: 'limited', label: 'Limited Supply' },
    { value: 'critical', label: 'Critical Capacity' },
    { value: 'inactive', label: 'Inactive / Standby' }
  ]

  const distances = [
    { value: 0, label: 'Any Distance' },
    { value: 5, label: 'Within 5 km' },
    { value: 10, label: 'Within 10 km' },
    { value: 25, label: 'Within 25 km' },
    { value: 50, label: 'Within 50 km' }
  ]

  return (
    <div className="flex flex-col gap-5 p-5 rounded-xl border border-hairline-dark/50 bg-surface-dark/15 backdrop-blur-sm text-left font-sans w-full">
      <div className="flex items-center justify-between border-b border-hairline-dark/20 pb-3">
        <div className="flex items-center gap-2 text-white">
          <Filter className="w-4 h-4 text-brand-green" />
          <span className="text-xs font-semibold uppercase tracking-wider">Telemetry Filters</span>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center gap-1 text-[9px] font-mono text-muted-dark hover:text-brand-green cursor-pointer transition-colors focus:outline-none"
        >
          <RotateCcw className="w-3 h-3" /> Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Category selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-mono font-bold text-brand-green uppercase tracking-wider">
            Resource Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs focus:border-brand-green/45 focus:outline-none transition-all duration-150 h-9"
          >
            <option value="">All Categories</option>
            {RESOURCE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Availability selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-mono font-bold text-brand-green uppercase tracking-wider">
            Availability Status
          </label>
          <select
            value={selectedAvailability}
            onChange={(e) => onAvailabilityChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs focus:border-brand-green/45 focus:outline-none transition-all duration-150 h-9"
          >
            {availabilities.map(av => (
              <option key={av.value} value={av.value}>
                {av.label}
              </option>
            ))}
          </select>
        </div>

        {/* Distance Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-mono font-bold text-brand-green uppercase tracking-wider">
            Radar Search Radius
          </label>
          <select
            value={maxDistance}
            onChange={(e) => onDistanceChange(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs focus:border-brand-green/45 focus:outline-none transition-all duration-150 h-9"
          >
            {distances.map(dist => (
              <option key={dist.value} value={dist.value}>
                {dist.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
