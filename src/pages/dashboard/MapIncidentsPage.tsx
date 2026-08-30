import { ShieldAlert, AlertTriangle } from 'lucide-react'
import MapEmptyState from '../../components/dashboard/maps/MapEmptyState'

export default function MapIncidentsPage() {
  const incidentLayers = [
    'Emergency Alert Zones',
    'Satellite Damage Grids',
    'Affected Population Density',
    'Flood / Hurricane Trajectories',
    'Hazard Heatmaps',
  ]

  return (
    <div className="flex flex-col gap-5 text-left font-sans select-none">
      <div className="flex flex-col gap-1 border-b border-hairline-dark/45 pb-3">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          Incident Visualization
        </h4>
        <p className="text-[10px] text-muted-dark/85 m-0 leading-normal">
          Overlay natural disaster boundaries and active emergency call hotspots.
        </p>
      </div>

      {/* Target Incident Layers Architecture Lists */}
      <div className="flex flex-col gap-2 bg-surface-dark/15 border border-hairline-dark/30 rounded-xl p-4">
        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Visualization Architecture
        </span>
        <ul className="flex flex-col gap-1.5 m-0 pl-4 text-[11px] text-muted-dark/90 leading-relaxed list-disc">
          {incidentLayers.map((layer) => (
            <li key={layer} className="hover:text-white transition-colors duration-150">
              {layer}
            </li>
          ))}
        </ul>
      </div>

      {/* Empty State */}
      <MapEmptyState
        icon={ShieldAlert}
        title="No Incidents Visualized"
        description="Damage heatmaps and incident grids will load dynamically here once backend telemetry binds. No mock disasters are generated."
        badgeText="Pipeline Offline"
      />
    </div>
  )
}
