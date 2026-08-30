import { Search, MapPin } from 'lucide-react'

interface ResourceSearchBarProps {
  keyword: string
  onKeywordChange: (val: string) => void
  locationQuery: string
  onLocationChange: (val: string) => void
  onExecuteSearch?: () => void
  placeholder?: string
}

export default function ResourceSearchBar({
  keyword,
  onKeywordChange,
  locationQuery,
  onLocationChange,
  onExecuteSearch,
  placeholder = 'Search assets, shelter hubs, medical reserves...'
}: ResourceSearchBarProps) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-3 items-stretch font-sans text-left">
      {/* Keyword Search field */}
      <div className="flex-grow relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-dark" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none transition-all duration-150 h-11"
        />
      </div>

      {/* Location Search field */}
      <div className="relative md:w-72">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-dark" />
        <input
          type="text"
          value={locationQuery}
          onChange={(e) => onLocationChange(e.target.value)}
          placeholder="Filter by city, grid, or coordinate..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hairline-dark bg-canvas-dark text-white text-xs placeholder-muted-dark focus:border-brand-green/45 focus:outline-none transition-all duration-150 h-11"
        />
      </div>

      {/* Execute search button */}
      <button
        type="button"
        onClick={onExecuteSearch}
        className="px-6 py-2.5 bg-brand-green hover:bg-brand-green-dark text-canvas-dark rounded-full text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 h-11 flex items-center justify-center focus:outline-none"
      >
        Search Grid
      </button>
    </div>
  )
}
