import SEO from '../../components/SEO'
import MapContainer from '../../components/dashboard/maps/MapContainer'
import { AlertTriangle, Radio } from 'lucide-react'

export default function LiveMapPage() {
  return (
    <>
      <SEO
        title="WeatherGPT | Live Weather GIS Map"
        description="Interactive All-India meteorological GIS map with radar, precipitation heatmaps, temperature observations, and severe warning zones."
      />

      <div className="flex flex-col h-full w-full bg-[#0a0e14]">
        {/* Page Topbar Metric Header */}
        <div className="h-12 border-b border-[#1c2333] px-4 flex items-center justify-between shrink-0 bg-[#0f141c]/60">
          <div className="flex items-center gap-4">
            <h1 className="text-xs font-semibold text-white tracking-wide">
              Live Weather &amp; Radar GIS
            </h1>

            <div className="hidden sm:flex items-center gap-3 border-l border-[#1c2333] pl-4 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <strong className="text-slate-200">6</strong> Active Bulletins
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-brand-green" />
                <strong className="text-slate-200">12</strong> IMD Doppler Radars Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
            <span>Projection: EPSG:3857</span>
            <span>·</span>
            <span className="text-emerald-400">GIS LIVE</span>
          </div>
        </div>

        {/* Map Container Area */}
        <div className="flex-1 relative w-full h-full">
          <MapContainer />
        </div>
      </div>
    </>
  )
}
