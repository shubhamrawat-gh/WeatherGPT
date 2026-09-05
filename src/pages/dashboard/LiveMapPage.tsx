import { lazy, Suspense } from 'react'
import SEO from '../../components/SEO'
import { AlertTriangle, Radio, Activity } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { DISASTER_HOTSPOTS } from '../../components/ClimateMap/mapConfig'
import { dispatchMapFlyTo } from '../../services/mapEvents'

// Lazy-load Mapbox GL JS component to avoid blocking initial dashboard paint
const ClimateMap = lazy(() => import('../../components/ClimateMap/ClimateMap'))

export default function LiveMapPage() {
  const { isDark } = useTheme()

  return (
    <>
      <SEO
        title="WeatherGPT | Live Weather & Disaster Climate Map"
        description="High-performance All-India meteorological GIS map with live Doppler radar, cyclone tracking, flood hazard zones, and IMD severe warning polygons."
      />

      <div className="flex flex-col h-full w-full dark:bg-[#0a0e14] bg-[#f8fafc] overflow-hidden">
        {/* Page Topbar Metric Header */}
        <div className="h-12 border-b dark:border-white/[0.08] border-slate-200 px-4 flex items-center justify-between shrink-0 dark:bg-[#0a0a0a] bg-white z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-semibold dark:text-white text-slate-900 tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              Climate Map &amp; Disaster GIS
            </h1>

            <div className="hidden md:flex items-center gap-3 border-l dark:border-white/[0.08] border-slate-200 pl-4 text-[11px] font-mono dark:text-slate-400 text-slate-600">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <strong className="dark:text-slate-200 text-slate-800">6</strong> IMD Bulletins
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Radio className="w-3 h-3 text-brand-green" />
                <strong className="dark:text-slate-200 text-slate-800">6</strong> Doppler Radars Active
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-red-400 animate-pulse" />
                <strong className="dark:text-slate-200 text-slate-800">USGS</strong> Live Quakes
              </span>
            </div>
          </div>

          {/* Quick Nav Pills for Disaster Focus */}
          <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
            <span className="text-slate-400 mr-1">Focus:</span>
            {DISASTER_HOTSPOTS.slice(0, 3).map((spot) => (
              <button
                key={spot.id}
                onClick={() => dispatchMapFlyTo(spot.center[0], spot.center[1], spot.zoom)}
                className="px-2.5 py-1 rounded-lg dark:bg-white/[0.04] bg-slate-100 hover:bg-brand-green/20 dark:hover:bg-brand-green/20 hover:text-brand-green dark:hover:text-brand-green border dark:border-white/10 border-slate-200 transition-all cursor-pointer truncate max-w-[130px]"
                title={spot.name}
              >
                {spot.name.split(' ')[0]} {spot.category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono dark:text-slate-500 text-slate-600">
            <span>Projection: Web Mercator</span>
            <span>·</span>
            <span className="text-emerald-500 font-semibold">60 FPS</span>
          </div>
        </div>

        {/* Full-Screen Map Container Area */}
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <Suspense
            fallback={
              <div className="w-full h-full flex flex-col items-center justify-center dark:bg-[#0a0a0a] bg-slate-100 text-slate-400 gap-3">
                <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono tracking-wider">Mounting Mapbox GL JS Engine...</span>
              </div>
            }
          >
            <ClimateMap initialStyle={isDark ? 'dark' : 'light'} />
          </Suspense>
        </div>
      </div>
    </>
  )
}
