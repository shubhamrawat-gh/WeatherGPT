import { MapPin, Shield } from 'lucide-react'
import MapEmptyState from '../../components/dashboard/maps/MapEmptyState'

export default function MapResourcesPage() {
  const resourceTypes = [
    'Emergency Shelters',
    'Medical Clinics / Hospitals',
    'Food Distribution Centers',
    'Potable Water Tanks',
    'Rescuer Staging Hubs',
  ]

  return (
    <div className="flex flex-col gap-5 text-left font-sans select-none">
      <div className="flex flex-col gap-1 border-b border-hairline-dark/45 pb-3">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          Resource Discovery
        </h4>
        <p className="text-[10px] text-muted-dark/85 m-0 leading-normal">
          Search, locate, and overlay critical response assets onto coordinates.
        </p>
      </div>

      {/* Target Resource Types Architecture Lists */}
      <div className="flex flex-col gap-2 bg-surface-dark/15 border border-hairline-dark/30 rounded-xl p-4">
        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <Shield className="w-3.5 h-3.5 text-brand-green" /> Supported Categories
        </span>
        <ul className="flex flex-col gap-1.5 m-0 pl-4 text-[11px] text-muted-dark/90 leading-relaxed list-disc">
          {resourceTypes.map((type) => (
            <li key={type} className="hover:text-white transition-colors duration-150">
              {type}
            </li>
          ))}
        </ul>
      </div>

      {/* Empty State */}
      <MapEmptyState
        icon={MapPin}
        title="No Assets Mapped"
        description="Geospatial asset datasets will appear here once connected to dispatch databases. No mock markers are active."
        badgeText="Discovery Offline"
      />
    </div>
  )
}
