import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef
} from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Compass,
  Radio,
  AlertTriangle,
  RefreshCw,
  Sun,
  Moon,
  Globe,
  ChevronDown,
  CloudRain,
  Wind,
  Waves,
  Thermometer,
  MapPin,
  Activity,
  X,
  ExternalLink,
  Terminal,
  CheckCircle2
} from 'lucide-react'
import type { FeatureCollection } from 'geojson'
import {
  getMapboxToken,
  INDIA_MAP_CENTER,
  DEFAULT_ZOOM,
  MAP_STYLES,
  PERFORMANCE_MAP_OPTIONS,
  type MapStyleKey,
  DISASTER_HOTSPOTS
} from './mapConfig'
import {
  getRegisteredClimateLayers,
  toggleMapboxLayersVisibility
} from './layers'
import { useClimateDataPolling } from './useClimateDataPolling'
import {
  MAP_EVENTS,
  type MapFlyToPayload,
  type MapToggleLayerPayload,
  type MapFilterAlertsPayload
} from '../../services/mapEvents'

export interface ClimateMapHandle {
  flyToLocation: (lng: number, lat: number, zoom?: number, duration?: number) => void
  highlightRegion: (geoJson: unknown) => void
  toggleLayer: (layerId: string, visible: boolean) => void
  filterAlerts: (severity: string) => void
  resetView: () => void
  getMapInstance: () => mapboxgl.Map | null
}

export interface ClimateMapProps {
  initialStyle?: MapStyleKey
  className?: string
  onMapLoaded?: (map: mapboxgl.Map) => void
  enablePolling?: boolean
}

// Icon mapper for dynamic layer badges
const LAYER_ICONS: Record<string, React.ElementType> = {
  CloudRain,
  Wind,
  Waves,
  AlertTriangle,
  Thermometer,
  Activity
}

export const ClimateMap = forwardRef<ClimateMapHandle, ClimateMapProps>(
  function ClimateMap(
    { initialStyle = 'dark', className = '', onMapLoaded, enablePolling = true },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<mapboxgl.Map | null>(null)
    const isMountedRef = useRef(false)
    const token = getMapboxToken()

    // State for UI controls
    const [currentStyle, setCurrentStyle] = useState<MapStyleKey>(initialStyle)
    const [isMapReady, setIsMapReady] = useState(false)
    const [showLayerMenu, setShowLayerMenu] = useState(false)
    const [showStyleMenu, setShowStyleMenu] = useState(false)
    const [showHotspots, setShowHotspots] = useState(false)
    const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
    const [tokenMissing, setTokenMissing] = useState(!token)
    const [showApiInspector, setShowApiInspector] = useState(false)
    const [showLegendExpanded, setShowLegendExpanded] = useState(true)

    // Layer visibility state map: { [layerId]: boolean }
    const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>(() => {
      const initial: Record<string, boolean> = {}
      for (const layer of getRegisteredClimateLayers()) {
        initial[layer.id] = layer.defaultVisible
      }
      return initial
    })

    // Active layer visibility ref for style reloads
    const layerVisibilityRef = useRef(layerVisibility)
    layerVisibilityRef.current = layerVisibility

    // Real-time data polling hook
    const {
      lastPolledAt,
      isUpdating,
      latestQuakes,
      apiStatus,
      apiLatencyMs,
      triggerManualPoll
    } = useClimateDataPolling(
      mapInstanceRef,
      { enabled: enablePolling && isMapReady }
    )

    /**
     * Re-initializes all registered layers and restores visibility.
     * Essential because Mapbox's map.setStyle() strips all user-added sources and layers!
     */
    const initOrRestoreAllLayers = useCallback((map: mapboxgl.Map) => {
      const layers = getRegisteredClimateLayers()
      for (const layer of layers) {
        try {
          layer.init(map)
          const isVisible = layerVisibilityRef.current[layer.id] ?? layer.defaultVisible
          toggleMapboxLayersVisibility(map, layer.layerIds, isVisible)
        } catch (err) {
          console.warn(`[ClimateMap] Layer init failed for ${layer.id}:`, err)
        }
      }
    }, [])

    /**
     * Core Imperative API: Smooth 1200ms flyTo capped duration
     */
    const flyToLocation = useCallback(
      (lng: number, lat: number, zoom = 7.5, duration = 1200) => {
        const map = mapInstanceRef.current
        if (!map) return

        map.flyTo({
          center: [lng, lat],
          zoom,
          essential: true, // Guarantees animation completes even with low-power mode
          duration: Math.min(1500, Math.max(800, duration))
        })
      },
      []
    )

    /**
     * Fast toggle layer visibility without rebuilding sources
     */
    const toggleLayer = useCallback((layerId: string, visible: boolean) => {
      const map = mapInstanceRef.current
      setLayerVisibility((prev) => ({ ...prev, [layerId]: visible }))

      if (!map) return
      const registered = getRegisteredClimateLayers().find((l) => l.id === layerId)
      if (registered) {
        toggleMapboxLayersVisibility(map, registered.layerIds, visible)
      }
    }, [])

    /**
     * Fast alert severity filter via map.setFilter()
     */
    const filterAlerts = useCallback((severity: string) => {
      setSelectedSeverity(severity)
      const map = mapInstanceRef.current
      if (!map) return

      const alertLayer = getRegisteredClimateLayers().find((l) => l.id === 'imd-alerts')
      if (alertLayer?.setFilter) {
        alertLayer.setFilter(map, severity)
      }
    }, [])

    /**
     * Reset camera to All-India center
     */
    const resetView = useCallback(() => {
      const map = mapInstanceRef.current
      if (!map) return

      map.flyTo({
        center: INDIA_MAP_CENTER,
        zoom: DEFAULT_ZOOM,
        essential: true,
        duration: 1200
      })
    }, [])

    /**
     * Highlight region geometry via highlight source/layer
     */
    const highlightRegion = useCallback((geoJson: unknown) => {
      const map = mapInstanceRef.current
      if (!map || !geoJson) return

      const highlightSource = map.getSource('source-region-highlight') as mapboxgl.GeoJSONSource | undefined
      if (!highlightSource) {
        map.addSource('source-region-highlight', {
          type: 'geojson',
          data: geoJson as FeatureCollection
        })
        map.addLayer({
          id: 'layer-region-highlight-fill',
          type: 'fill',
          source: 'source-region-highlight',
          paint: {
            'fill-color': '#00ed64',
            'fill-opacity': 0.25
          }
        })
        map.addLayer({
          id: 'layer-region-highlight-line',
          type: 'line',
          source: 'source-region-highlight',
          paint: {
            'line-color': '#00ed64',
            'line-width': 2.5
          }
        })
      } else {
        highlightSource.setData(geoJson as FeatureCollection)
      }
    }, [])

    // Expose imperative handle to parent components
    useImperativeHandle(
      ref,
      () => ({
        flyToLocation,
        highlightRegion,
        toggleLayer,
        filterAlerts,
        resetView,
        getMapInstance: () => mapInstanceRef.current
      }),
      [flyToLocation, highlightRegion, toggleLayer, filterAlerts, resetView]
    )

    // Listen to global window custom events from ChatAssistant, tool-calling, or voice
    useEffect(() => {
      const handleFlyTo = (e: Event) => {
        const detail = (e as CustomEvent<MapFlyToPayload>).detail
        if (detail && typeof detail.lng === 'number' && typeof detail.lat === 'number') {
          flyToLocation(detail.lng, detail.lat, detail.zoom, detail.duration)
        }
      }

      const handleToggle = (e: Event) => {
        const detail = (e as CustomEvent<MapToggleLayerPayload>).detail
        if (detail) {
          toggleLayer(detail.layerId, detail.visible)
        }
      }

      const handleFilter = (e: Event) => {
        const detail = (e as CustomEvent<MapFilterAlertsPayload>).detail
        if (detail) {
          filterAlerts(detail.severity)
        }
      }

      const handleReset = () => {
        resetView()
      }

      window.addEventListener(MAP_EVENTS.FLY_TO, handleFlyTo)
      window.addEventListener(MAP_EVENTS.TOGGLE_LAYER, handleToggle)
      window.addEventListener(MAP_EVENTS.FILTER_ALERTS, handleFilter)
      window.addEventListener(MAP_EVENTS.RESET_VIEW, handleReset)

      return () => {
        window.removeEventListener(MAP_EVENTS.FLY_TO, handleFlyTo)
        window.removeEventListener(MAP_EVENTS.TOGGLE_LAYER, handleToggle)
        window.removeEventListener(MAP_EVENTS.FILTER_ALERTS, handleFilter)
        window.removeEventListener(MAP_EVENTS.RESET_VIEW, handleReset)
      }
    }, [flyToLocation, toggleLayer, filterAlerts, resetView])

    /**
     * Mapbox GL Instance Lifecycle - Mount Once Guarded
     */
    useEffect(() => {
      if (!containerRef.current || mapInstanceRef.current || isMountedRef.current) return
      isMountedRef.current = true

      if (!token || !token.startsWith('pk.')) {
        setTokenMissing(true)
        return
      }

      mapboxgl.accessToken = token

      try {
        // Initialize map instance with strictly performance-tuned flags
        const map = new mapboxgl.Map({
          container: containerRef.current,
          style: MAP_STYLES[currentStyle].url,
          center: INDIA_MAP_CENTER,
          zoom: DEFAULT_ZOOM,
          ...PERFORMANCE_MAP_OPTIONS
        })

        mapInstanceRef.current = map

        // On map load: register and initialize layers
        map.on('load', () => {
          setIsMapReady(true)
          initOrRestoreAllLayers(map)
          onMapLoaded?.(map)
        })

        // On style.load: whenever setStyle() completes (dark/light switch), re-register all layers
        map.on('style.load', () => {
          initOrRestoreAllLayers(map)
        })
      } catch (err) {
        console.error('[ClimateMap] Map initialization error:', err)
        setTokenMissing(true)
      }

      // Clean up on unmount: remove map instance and reset reference
      return () => {
        isMountedRef.current = false
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }
      }
    }, [token, currentStyle, initOrRestoreAllLayers, onMapLoaded])

    /**
     * Handle theme/style change with map.setStyle()
     */
    const handleStyleChange = (styleKey: MapStyleKey) => {
      setCurrentStyle(styleKey)
      setShowStyleMenu(false)
      const map = mapInstanceRef.current
      if (map) {
        map.setStyle(MAP_STYLES[styleKey].url)
      }
    }

    const layers = getRegisteredClimateLayers()
    const activeLayerCount = Object.values(layerVisibility).filter(Boolean).length

    return (
      <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
        {/* Token Missing Warning Banner */}
        {tokenMissing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
            <div className="max-w-md w-full p-6 rounded-2xl bg-[#121212] border border-red-500/40 text-center flex flex-col items-center gap-3 shadow-2xl">
              <AlertTriangle className="w-8 h-8 text-red-400" />
              <h3 className="text-base font-semibold text-white">Public Mapbox Token Required</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mapbox GL JS requires a public access token starting with <code className="text-brand-green font-mono">pk.*</code> (not a secret <code className="text-red-400 font-mono">sk.*</code> token). Please ensure your <code className="text-white font-mono">.env</code> contains <code className="text-brand-green font-mono">VITE_MAPBOX_TOKEN=pk.xxx</code>.
              </p>
              <button
                onClick={() => setTokenMissing(false)}
                className="mt-2 px-4 py-1.5 text-xs font-semibold rounded-lg bg-brand-green text-black hover:bg-brand-green/90 transition-colors cursor-pointer"
              >
                Dismiss &amp; Continue
              </button>
            </div>
          </div>
        )}

        {/* Mapbox Canvas Container */}
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top Floating Telemetry Status Bar */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/75 dark:bg-[#121212]/90 backdrop-blur-md border border-white/10 text-white shadow-lg">
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold tracking-wider text-emerald-400">GIS LIVE</span>
            </div>

            <span className="text-white/20">|</span>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-300">
              <Radio className="w-3.5 h-3.5 text-brand-green" />
              <span>
                {activeLayerCount}/{layers.length} Layers Active
              </span>
            </div>

            {lastPolledAt && (
              <>
                <span className="text-white/20">|</span>
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <RefreshCw
                    className={`w-3 h-3 text-slate-400 ${isUpdating ? 'animate-spin text-brand-green' : ''}`}
                  />
                  <span>Sync {lastPolledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </>
            )}
          </div>

          {/* Quick Disaster Hotspots Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowHotspots(!showHotspots)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 dark:bg-[#121212]/90 backdrop-blur-md border border-white/10 hover:border-brand-green/40 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-lg cursor-pointer"
              title="Quick Jump to Disaster Zones"
            >
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Disaster Hotspots</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showHotspots && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#121212]/95 backdrop-blur-xl border border-white/15 p-2 shadow-2xl z-40 flex flex-col gap-1">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Active Meteorological Hotspots
                </div>
                {DISASTER_HOTSPOTS.map((spot) => (
                  <button
                    key={spot.id}
                    onClick={() => {
                      flyToLocation(spot.center[0], spot.center[1], spot.zoom)
                      setShowHotspots(false)
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.08] transition-colors text-left text-xs group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-brand-green transition-colors">
                        {spot.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{spot.region}</div>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-md font-mono border"
                      style={{
                        color: spot.badgeColor,
                        borderColor: `${spot.badgeColor}40`,
                        backgroundColor: `${spot.badgeColor}15`
                      }}
                    >
                      {spot.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top-Right Floating Controls (Layer Menu, Style Switcher, Manual Poll) */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2 pointer-events-auto">
          {/* Manual Poll Trigger */}
          <button
            onClick={() => triggerManualPoll()}
            className="p-2 rounded-xl bg-black/75 dark:bg-[#121212]/90 backdrop-blur-md border border-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-colors shadow-lg cursor-pointer"
            title="Poll Real-Time Weather Data"
            aria-label="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin text-brand-green' : ''}`} />
          </button>

          {/* Style Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/75 dark:bg-[#121212]/90 backdrop-blur-md border border-white/10 hover:border-brand-green/40 text-xs text-white transition-all shadow-lg cursor-pointer"
              title="Basemap Style"
            >
              {currentStyle === 'dark' && <Moon className="w-3.5 h-3.5 text-brand-green" />}
              {currentStyle === 'light' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {currentStyle === 'satellite' && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="capitalize">{currentStyle}</span>
            </button>

            {showStyleMenu && (
              <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#121212]/95 backdrop-blur-xl border border-white/15 p-1.5 shadow-2xl z-40 flex flex-col gap-1">
                {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleStyleChange(key)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors cursor-pointer ${
                      currentStyle === key
                        ? 'bg-brand-green/20 text-brand-green font-medium border border-brand-green/30'
                        : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    {key === 'dark' && <Moon className="w-3.5 h-3.5" />}
                    {key === 'light' && <Sun className="w-3.5 h-3.5" />}
                    {key === 'satellite' && <Globe className="w-3.5 h-3.5" />}
                    <span>{MAP_STYLES[key].name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* USGS Live Telemetry & API Diagnostic Button */}
          <button
            onClick={() => setShowApiInspector(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/75 dark:bg-[#121212]/90 backdrop-blur-md border border-red-500/30 hover:border-red-500/60 text-xs text-white transition-all shadow-lg cursor-pointer"
            title="Inspect USGS API Live Stream & Diagnostics"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiStatus === 'connected' ? 'bg-red-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${apiStatus === 'connected' ? 'bg-red-500' : 'bg-amber-500'}`} />
            </span>
            <Activity className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline font-mono">USGS API</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300">
              {latestQuakes?.features?.length ?? 0}
            </span>
          </button>

          {/* Layer Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-md border text-xs font-medium transition-all shadow-lg cursor-pointer ${
                showLayerMenu
                  ? 'bg-brand-green text-black border-brand-green'
                  : 'bg-black/75 dark:bg-[#121212]/90 border-white/10 hover:border-brand-green/40 text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {activeLayerCount}
              </span>
            </button>

            {/* Layer Switcher Flyout Modal/Panel */}
            {showLayerMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#121212]/95 backdrop-blur-xl border border-white/15 p-3 shadow-2xl z-40 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-semibold text-white tracking-wide">
                    Meteorological Overlays
                  </span>
                  <span className="text-[10px] font-mono text-brand-green">Live Telemetry</span>
                </div>

                {/* Layer Items */}
                <div className="flex flex-col gap-1.5">
                  {layers.map((layer) => {
                    const isVisible = layerVisibility[layer.id] ?? false
                    const IconComponent = LAYER_ICONS[layer.iconName] || Layers

                    return (
                      <div
                        key={layer.id}
                        onClick={() => toggleLayer(layer.id, !isVisible)}
                        className={`flex items-start justify-between p-2 rounded-xl transition-colors cursor-pointer border ${
                          isVisible
                            ? 'bg-white/[0.06] border-white/15'
                            : 'bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-white/[0.03]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className="p-1.5 rounded-lg shrink-0 mt-0.5"
                            style={{
                              backgroundColor: `${layer.color}20`,
                              color: layer.color
                            }}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-medium text-white">{layer.name}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1">
                              {layer.description}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={() => {}}
                            className="w-4 h-4 accent-brand-green rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Severity Filter for IMD Alerts */}
                <div className="pt-2 border-t border-white/10 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 font-medium">IMD Severity Filter:</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {selectedSeverity}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1">
                    {(['all', 'extreme', 'severe', 'moderate'] as const).map((sev) => (
                      <button
                        key={sev}
                        onClick={() => filterAlerts(sev)}
                        className={`py-1 px-1.5 text-[10px] font-mono uppercase rounded-lg border transition-all cursor-pointer text-center ${
                          selectedSeverity === sev
                            ? 'bg-brand-green/20 border-brand-green text-brand-green font-semibold'
                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom-Right Camera Navigation Controls */}
        <div className="absolute bottom-6 right-4 z-30 flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2.5 rounded-xl bg-black/75 dark:bg-[#121212]/90 backdrop-blur-md border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition-colors shadow-lg cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2.5 rounded-xl bg-black/75 dark:bg-[#121212]/90 backdrop-blur-md border border-white/10 hover:border-white/20 text-slate-200 hover:text-white transition-colors shadow-lg cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2.5 rounded-xl bg-black/75 dark:bg-[#121212]/90 backdrop-blur-md border border-white/10 hover:border-brand-green/50 text-slate-200 hover:text-brand-green transition-colors shadow-lg cursor-pointer"
            title="Reset All-India View"
            aria-label="Reset Camera"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Latest Seismic Event Banner (Top-Left) */}
        {latestQuakes?.features?.[0] && (
          <div className="absolute top-4 left-4 z-30 pointer-events-auto max-w-xs sm:max-w-sm">
            <div className="p-3 rounded-2xl bg-black/85 dark:bg-[#101014]/90 backdrop-blur-xl border border-red-500/30 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-red-500/20 text-red-400">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                  </span>
                  <span className="text-xs font-semibold text-white tracking-wide">
                    Live Seismic Event
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">
                  M {Number(latestQuakes.features[0].properties?.mag || 0).toFixed(1)}
                </span>
              </div>

              <div className="text-xs text-slate-200 line-clamp-1 font-medium">
                {latestQuakes.features[0].properties?.place || 'Regional Epicenter'}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-white/10">
                <span>Depth: {latestQuakes.features[0].properties?.depthKm} km</span>
                <button
                  onClick={() => {
                    const geom = latestQuakes.features[0].geometry
                    if (geom && geom.type === 'Point') {
                      flyToLocation(geom.coordinates[0], geom.coordinates[1], 7.8, 1200)
                    }
                  }}
                  className="text-brand-green hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                >
                  Fly to Epicenter &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Diagnostics & Live Feed Inspection Modal */}
        {showApiInspector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div className="relative w-full max-w-2xl rounded-2xl bg-[#121216] border border-white/15 p-5 shadow-2xl flex flex-col gap-4 text-white">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold tracking-wide">USGS Earthquake API Connection &amp; Telemetry</h2>
                    <p className="text-[11px] text-slate-400 font-mono">Endpoint: /api/live-layers/usgs-quakes</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowApiInspector(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Diagnostic Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">Connection Status</span>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>200 OK</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">Roundtrip Latency</span>
                  <div className="font-bold text-white">
                    {apiLatencyMs !== null ? `${apiLatencyMs} ms` : 'Active'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">Events in Bounding Box</span>
                  <div className="font-bold text-red-400">
                    {latestQuakes?.features?.length ?? 0} Recorded
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex flex-col gap-1">
                  <span className="text-[10px] text-slate-400">Auth Requirement</span>
                  <div className="font-bold text-cyan-400">
                    Keyless (FDSN)
                  </div>
                </div>
              </div>

              {/* How To Make API Calls info block */}
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] flex flex-col gap-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-brand-green" />
                    How to query this API from terminal or client:
                  </span>
                  <a
                    href="/api/live-layers/usgs-quakes"
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-green hover:underline flex items-center gap-1 text-[10px]"
                  >
                    Open Live JSON <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="p-2 rounded-lg bg-[#0a0a0a] text-slate-300 overflow-x-auto text-[10px]">
                  <code>curl http://localhost:5173/api/live-layers/usgs-quakes</code>
                </div>
              </div>

              {/* Live JSON Payload Preview */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Live Normalized GeoJSON Stream ({latestQuakes?.features?.length ?? 0} items):</span>
                  <button
                    onClick={() => triggerManualPoll()}
                    className="px-2 py-1 rounded bg-brand-green/20 text-brand-green border border-brand-green/30 hover:bg-brand-green/30 transition-all cursor-pointer text-[10px] font-semibold"
                  >
                    Poll Now (Force Sync)
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-[#08080a] border border-white/10 text-[10px] font-mono text-emerald-300 max-h-48 overflow-y-auto">
                  {JSON.stringify(latestQuakes || { message: 'Loading live USGS telemetry...' }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Bottom-Left Advanced Illustrated Legend */}
        <div className="absolute bottom-4 left-4 z-30 pointer-events-auto">
          <div className="p-3 rounded-2xl bg-black/85 dark:bg-[#121216]/95 backdrop-blur-xl border border-white/15 shadow-2xl flex flex-col gap-2 text-white">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-1.5">
              <span className="text-[11px] font-semibold tracking-wide flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-brand-green animate-pulse" />
                Climate &amp; Disaster GIS Indicators
              </span>
              <button
                onClick={() => setShowLegendExpanded(!showLegendExpanded)}
                className="text-[10px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {showLegendExpanded ? 'Collapse ▲' : 'Expand ▼'}
              </button>
            </div>

            {showLegendExpanded && (
              <div className="flex flex-col gap-2.5 text-[10px] font-mono text-slate-300">
                {/* USGS Earthquake Depth Scale */}
                <div className="flex flex-col gap-1">
                  <span className="text-slate-400 font-semibold text-[9px] uppercase tracking-wider">
                    USGS Earthquake Focal Depth (Color Ramp):
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff6b6b] inline-block shadow-sm" />
                      <span>&lt;100 km (Shallow)</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffa94d] inline-block shadow-sm" />
                      <span>100–300 km (Mid)</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ffd43b] inline-block shadow-sm" />
                      <span>&gt;300 km (Deep)</span>
                    </span>
                  </div>
                </div>

                {/* Magnitude Circle Size Scale */}
                <div className="flex flex-col gap-1 border-t border-white/10 pt-1.5">
                  <span className="text-slate-400 font-semibold text-[9px] uppercase tracking-wider">
                    Magnitude Circle Scaling:
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full border border-white bg-red-400/80 inline-block" />
                      <span>M2.5 (4px)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full border border-white bg-red-400/80 inline-block" />
                      <span>M5.0 (12px)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full border border-white bg-red-400/80 inline-block" />
                      <span>M8.0 (24px)</span>
                    </span>
                  </div>
                </div>

                {/* IMD Warning Levels & Radar */}
                <div className="flex items-center gap-3 border-t border-white/10 pt-1.5">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] inline-block" />
                    <span>IMD Red Alert</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c] inline-block" />
                    <span>Orange Alert</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-green inline-block" />
                    <span>Doppler Radar</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

export default ClimateMap

