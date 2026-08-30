import { useState } from 'react'
import PageHeader from '../../components/dashboard/PageHeader'
import ActionButton from '../../components/dashboard/ActionButton'
import ResourceSearchBar from '../../components/dashboard/resources/ResourceSearchBar'
import ResourceFilters from '../../components/dashboard/resources/ResourceFilters'
import ResourceEmptyState from '../../components/dashboard/resources/ResourceEmptyState'
import { ArrowLeft, Search, RefreshCw } from 'lucide-react'

export default function DiscoverResourcesPage() {
  const [keyword, setKeyword] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedAvailability, setSelectedAvailability] = useState('')
  const [maxDistance, setMaxDistance] = useState(0)

  const handleResetFilters = () => {
    setKeyword('')
    setLocationQuery('')
    setSelectedCategory('')
    setSelectedAvailability('')
    setMaxDistance(0)
  }

  // Determine if any filters are currently active
  const isFilterActive = keyword || locationQuery || selectedCategory || selectedAvailability || maxDistance > 0

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-6 py-6 text-left animate-in fade-in duration-300">
      <PageHeader
        title="Resource Discovery Engine"
        description="Query coordinate meshes and availability databases for staged disaster assets."
        action={
          <ActionButton to="/dashboard/resources" variant="secondary" icon={ArrowLeft}>
            Back to Hub
          </ActionButton>
        }
      />

      {/* Search Bar */}
      <div className="p-4 rounded-xl border border-hairline-dark/50 bg-surface-dark/15 backdrop-blur-sm">
        <ResourceSearchBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          locationQuery={locationQuery}
          onLocationChange={setLocationQuery}
          onExecuteSearch={() => {}}
        />
      </div>

      {/* Granular Filters */}
      <ResourceFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedAvailability={selectedAvailability}
        onAvailabilityChange={setSelectedAvailability}
        maxDistance={maxDistance}
        onDistanceChange={setMaxDistance}
        onResetFilters={handleResetFilters}
      />

      {/* Results panel (Stricly empty-state compliant, zero fake records) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-hairline-dark/20 pb-2.5">
          <span className="font-mono text-[9px] tracking-widest text-brand-green uppercase font-bold">
            Search Results
          </span>
          <span className="font-mono text-[9px] text-muted-dark">
            {isFilterActive ? 'Filter Query Applied' : 'Radar Standby'}
          </span>
        </div>

        <div className="p-1.5 rounded-xl border border-hairline-dark/40 bg-surface-dark/10 min-h-[300px] flex items-center justify-center">
          <ResourceEmptyState
            icon={Search}
            title={isFilterActive ? "No Matches in Staging Grid" : "Staged Asset Radar is Idle"}
            description={
              isFilterActive 
                ? "No registered hospitals, shelters, or rescue teams match the current query attributes. Broaden your search parameters." 
                : "The crisis registry contains zero active resource node mappings. Launch the management interface to record assets."
            }
            action={
              isFilterActive ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-5 py-2 border border-hairline-dark hover:border-brand-green/30 hover:bg-surface-dark/40 text-white hover:text-brand-green rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer focus:outline-none"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Query Criteria
                </button>
              ) : (
                <ActionButton to="/dashboard/resources/manage" icon={RefreshCw}>
                  Deploy Staging Node
                </ActionButton>
              )
            }
            badgeText={isFilterActive ? "Query Return: Null" : "Radar Scope: Empty"}
          />
        </div>
      </div>
    </div>
  )
}
