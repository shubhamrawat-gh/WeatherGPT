import PageHeader from '../../components/dashboard/PageHeader'
import ResourceSection from '../../components/dashboard/resources/ResourceSection'
import ResourceMapPanel from '../../components/dashboard/resources/ResourceMapPanel'
import ResourceEmptyState from '../../components/dashboard/resources/ResourceEmptyState'
import ActionButton from '../../components/dashboard/ActionButton'
import { 
  Settings, 
  Search, 
  PlusCircle, 
  Server,
  FolderOpen
} from 'lucide-react'

export default function ResourceDashboardPage() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto px-6 py-6 text-left animate-in fade-in duration-300">
      <PageHeader
        title="Resource Intelligence Hub"
        description="Discover, catalog, and coordinate hospital capacities, shelters, volunteer taskforces, and responder assets."
        action={
          <div className="flex items-center gap-3">
            <ActionButton to="/dashboard/resources/discover" icon={Search}>
              Search Grid
            </ActionButton>
            <ActionButton to="/dashboard/resources/manage" variant="secondary" icon={PlusCircle}>
              Manage Registry
            </ActionButton>
          </div>
        }
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch w-full">
        {/* Left Side (Spans 2 columns) - Radar & Directory */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Resource Mapping Section */}
          <ResourceSection 
            title="Geospatial Mapping Radar" 
            subtitle="Broadcast real-time asset and facility markers directly to maps and 3D globe coordinates."
          >
            <ResourceMapPanel stagedRecordsCount={0} />
          </ResourceSection>

          {/* Active Registry Lists */}
          <ResourceSection 
            title="Active Emergency Reserves" 
            subtitle="Consolidated registry listings of hospitals, shelters, and supplies staged in the crisis sectors."
          >
            <div className="p-1.5 rounded-xl border border-hairline-dark/40 bg-surface-dark/10">
              <ResourceEmptyState
                icon={Server}
                title="Registry Database Stands Idle"
                description="No active resource markers or emergency facilities are loaded in the database. Deploy resources to sync coordinate logs."
                action={
                  <ActionButton to="/dashboard/resources/manage" variant="secondary" icon={PlusCircle}>
                    Stage First Resource
                  </ActionButton>
                }
                badgeText="System Status: Empty Standby"
              />
            </div>
          </ResourceSection>

        </div>

        {/* Right Side - Discovery Actions & Category Overviews */}
        <div className="flex flex-col gap-8">
          
          {/* Quick Discovery Directory */}
          <ResourceSection 
            title="Discovery Operations" 
            subtitle="Filter facilities by capability indices and proximity."
          >
            <div className="flex flex-col gap-4 p-5 rounded-xl border border-hairline-dark/50 bg-surface-dark/20">
              <div className="flex gap-3.5 items-start">
                <div className="w-8.5 h-8.5 rounded bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green shrink-0 mt-0.5">
                  <Search className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white">Search engine staging</span>
                  <p className="text-[10px] text-muted-dark/85 leading-normal m-0">
                    Query active triage hubs, medical reserves, and responder coordinates using keywords or search radius values.
                  </p>
                </div>
              </div>
              <ActionButton to="/dashboard/resources/discover" variant="secondary" className="w-full">
                Launch Search Engine
              </ActionButton>
            </div>
          </ResourceSection>

          {/* Catalog Categories */}
          <ResourceSection 
            title="Directory Categories" 
            subtitle="Structured classification grids for assets."
          >
            <div className="flex flex-col gap-4 p-5 rounded-xl border border-hairline-dark/50 bg-surface-dark/20">
              <div className="flex gap-3.5 items-start">
                <div className="w-8.5 h-8.5 rounded bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green shrink-0 mt-0.5">
                  <FolderOpen className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white">Categorized Directories</span>
                  <p className="text-[10px] text-muted-dark/85 leading-normal m-0">
                    Access specialized asset maps for hospitals, volunteer teams, emergency command centers, and water staging hubs.
                  </p>
                </div>
              </div>
              <ActionButton to="/dashboard/resources/categories" variant="secondary" className="w-full">
                Browse Categories
              </ActionButton>
            </div>
          </ResourceSection>

          {/* Registry Management */}
          <ResourceSection 
            title="Registry Administration" 
            subtitle="Administrative actions for registering, verifying and status tracking."
          >
            <div className="flex flex-col gap-4 p-5 rounded-xl border border-hairline-dark/50 bg-surface-dark/20">
              <div className="flex gap-3.5 items-start">
                <div className="w-8.5 h-8.5 rounded bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green shrink-0 mt-0.5">
                  <Settings className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white">Verifications &amp; Additions</span>
                  <p className="text-[10px] text-muted-dark/85 leading-normal m-0">
                    Register new staging nodes, update occupancy thresholds, and authorize coordinator contacts.
                  </p>
                </div>
              </div>
              <ActionButton to="/dashboard/resources/manage" variant="secondary" className="w-full">
                Access Registry Console
              </ActionButton>
            </div>
          </ResourceSection>

        </div>
      </div>
    </div>
  )
}
