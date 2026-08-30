import { useOutletContext } from 'react-router-dom'
import { Target, Shield } from 'lucide-react'

interface MapContextType {
  mapCenter: { lng: number; lat: number }
  mapZoom: number
  activeLayers: string[]
}

export default function MapDefaultPage() {
  const { mapCenter, mapZoom, activeLayers } = useOutletContext<MapContextType>()

  return (
    <div className="flex flex-col gap-5 text-left font-sans select-none">
      <div className="flex flex-col gap-1 border-b border-hairline-dark/45 pb-3">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          Telemetry &amp; Coordinates
        </h4>
        <p className="text-[10px] text-muted-dark/85 m-0 leading-normal">
          Real-time updates of the active tracking viewport coordinates and telemetry layers.
        </p>
      </div>

      {/* Live Coordinates Card */}
      <div className="bg-surface-dark/15 border border-hairline-dark/30 rounded-xl p-4 flex flex-col gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green">
            <Target className="w-4 h-4 animate-pulse" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-muted-dark uppercase font-mono tracking-wider">Operational Target</span>
            <span className="text-xs font-semibold text-white">India Sector Overview</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 font-mono text-[10px] border-t border-hairline-dark/25 pt-3">
          <div className="flex flex-col gap-1">
            <span className="text-muted-dark/70 uppercase text-[9px] tracking-wider">Longitude</span>
            <span className="text-white font-semibold text-[11px] truncate">
              {mapCenter.lng.toFixed(4)}° E
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-dark/70 uppercase text-[9px] tracking-wider">Latitude</span>
            <span className="text-white font-semibold text-[11px] truncate">
              {mapCenter.lat.toFixed(4)}° N
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-dark/70 uppercase text-[9px] tracking-wider">Zoom Level</span>
            <span className="text-white font-semibold text-[11px]">
              {mapZoom.toFixed(1)}x
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-dark/70 uppercase text-[9px] tracking-wider">Telemetry State</span>
            <span className="text-brand-green font-semibold text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green inline-block animate-pulse" />
              ONLINE
            </span>
          </div>
        </div>
      </div>

      {/* Staging stats (no fake data, only architecture summary) */}
      <div className="flex flex-col gap-2.5 bg-surface-dark/15 border border-hairline-dark/30 rounded-xl p-4">
        <div className="flex items-center gap-2 text-white text-xs font-semibold">
          <Shield className="w-4 h-4 text-brand-green" />
          <span>Active Overlays Summary</span>
        </div>
        <p className="text-[10px] text-muted-dark/80 leading-relaxed m-0">
          Currently superimposing <span className="text-brand-green font-mono">{activeLayers.length}</span> layer(s) on the maps container. Direct dispatch telemetry is queued for future integration.
        </p>
      </div>
    </div>
  )
}
