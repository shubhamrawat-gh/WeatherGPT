import { Map, Globe, Compass, RefreshCw } from 'lucide-react'

interface ResourceMapPanelProps {
  stagedRecordsCount?: number
  onSyncMap?: () => void
  onSyncGlobe?: () => void
}

export default function ResourceMapPanel({
  stagedRecordsCount = 0,
  onSyncMap,
  onSyncGlobe
}: ResourceMapPanelProps) {
  return (
    <div className="flex flex-col gap-5 p-5 rounded-xl border border-hairline-dark/50 bg-surface-dark/15 backdrop-blur-sm text-left font-sans h-full justify-between">
      <div className="flex flex-col gap-4">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-hairline-dark/20 pb-3">
          <div className="flex items-center gap-2 text-white">
            <Compass className="w-4.5 h-4.5 text-brand-green animate-pulse" />
            <h3 className="text-xs font-semibold uppercase tracking-wider m-0">
              Geospatial Sync console
            </h3>
          </div>
          <span className="font-mono text-[8px] tracking-widest text-brand-green/80 bg-brand-teal-deep border border-brand-green/20 px-2 py-0.5 rounded-full uppercase font-bold">
            Radar Standby
          </span>
        </div>

        {/* Tactical Info details */}
        <div className="flex flex-col gap-3 font-mono text-[10px] leading-relaxed">
          <div className="p-3 rounded bg-canvas-dark border border-hairline-dark/55 text-muted-dark/85">
            <p className="m-0 text-white font-semibold mb-1 uppercase text-[9px] tracking-wider">
              Telemetry Staging Protocol
            </p>
            This console broadcasts resource markers to the 3D Globe and 2D Map systems. Staging new records will bind coordinate payloads dynamically.
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3 rounded border border-hairline-dark/40 bg-surface-dark/30 flex flex-col gap-0.5">
              <span className="text-[8px] text-muted-dark uppercase tracking-wider">Active Marker Syncs</span>
              <span className="text-xs font-semibold text-white">{stagedRecordsCount} Nodes</span>
            </div>
            <div className="p-3 rounded border border-hairline-dark/40 bg-surface-dark/30 flex flex-col gap-0.5">
              <span className="text-[8px] text-muted-dark uppercase tracking-wider">Broadcast Status</span>
              <span className="text-xs font-semibold text-brand-green">STANDBY</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sync Hooks */}
      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-hairline-dark/20 mt-3">
        <button
          type="button"
          onClick={onSyncMap}
          className="flex-grow flex items-center justify-center gap-2 px-4 py-2 border border-hairline-dark hover:border-brand-green hover:bg-brand-green/5 text-white hover:text-brand-green rounded-lg text-xs font-semibold font-sans transition-all duration-150 cursor-pointer focus:outline-none"
        >
          <Map className="w-3.5 h-3.5" /> Bind to 2D Map
        </button>

        <button
          type="button"
          onClick={onSyncGlobe}
          className="flex-grow flex items-center justify-center gap-2 px-4 py-2 border border-hairline-dark hover:border-brand-green hover:bg-brand-green/5 text-white hover:text-brand-green rounded-lg text-xs font-semibold font-sans transition-all duration-150 cursor-pointer focus:outline-none"
        >
          <Globe className="w-3.5 h-3.5" /> Sync to 3D Globe
        </button>

        <button
          type="button"
          onClick={() => {}}
          className="w-9 h-9 border border-hairline-dark hover:bg-surface-dark/40 text-muted-dark hover:text-white rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-colors duration-150 focus:outline-none"
          title="Poll Registry Servers"
          aria-label="Refresh Registry Servers"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  )
}
