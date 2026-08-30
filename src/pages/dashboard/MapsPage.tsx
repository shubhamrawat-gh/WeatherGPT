import { useState, useRef } from 'react'
import { Outlet } from 'react-router-dom'
import type maplibregl from 'maplibre-gl'

import PageHeader from '../../components/dashboard/PageHeader'
import MapSection from '../../components/dashboard/maps/MapSection'
import MapToolbar from '../../components/dashboard/maps/MapToolbar'
import MapControls from '../../components/dashboard/maps/MapControls'
import MapLegend from '../../components/dashboard/maps/MapLegend'
import SEO from '../../components/SEO'
import GlobeContainer from '../../components/GlobeContainer'
import CountryPanel from '../../components/dashboard/globe/CountryPanel'
import { lazy, Suspense } from 'react'

const MapContainer = lazy(() => import('../../components/dashboard/maps/MapContainer'))

export default function MapsPage() {
  const [viewMode, setViewMode] = useState<'map' | 'globe'>('map')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeLayers, setActiveLayers] = useState<string[]>(['satellite', 'incident', 'resource', 'earthquake'])
  const [mapCenter, setMapCenter] = useState({ lng: -160, lat: 20 })
  const [mapZoom, setMapZoom] = useState(2.0)
  const mapRef = useRef<maplibregl.Map | null>(null)

  // Globe states
  const [selectedCountry, setSelectedCountry] = useState<any>(null)
  const autoRotate = true
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0)

  // Callback to capture map reference and attach listeners
  const handleMapLoad = (map: maplibregl.Map) => {
    mapRef.current = map
    map.on('move', () => {
      const center = map.getCenter()
      setMapCenter({ lng: center.lng, lat: center.lat })
      setMapZoom(map.getZoom())
    })
  }

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn()
  }

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut()
  }

  const handleResetView = () => {
    if (viewMode === 'map') {
      if (mapRef.current) {
        mapRef.current.easeTo({
          center: [-160, 20],
          zoom: 2.0,
          duration: 800,
        })
      }
    } else {
      setCameraResetTrigger((prev) => prev + 1)
    }
  }

  const handleToggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === 'map' ? 'globe' : 'map'))
  }

  const handleToggleLayer = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
    )
  }

  return (
    <>
      <SEO
        title="Geospatial Intelligence Map | RescueLens AI Console"
        description="Monitor disaster sectors, visualize damage overlays, and coordinate response assets."
      />

      <div className={`flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-6 text-left h-full transition-all duration-200 ${
        isFullscreen ? '!max-w-none !p-0 !gap-0 fixed inset-0 z-50 bg-canvas-dark' : ''
      }`}>
        
        {/* Hide header when in fullscreen mode to maximize map workspace area */}
        {!isFullscreen ? (
          <PageHeader
            title="Geospatial Operations Console"
            description="Real-time disaster mapping telemetry, active emergency zones, and critical supply staging locations."
          />
        ) : null}

        {/* Main Panel Viewport Wrapper */}
        <div className={`flex-grow w-full rounded-xl border border-hairline-dark/50 bg-surface-dark/10 relative overflow-hidden flex flex-col shadow-2xl min-h-[650px] ${
          isFullscreen ? '!rounded-none border-none h-screen w-screen' : ''
        }`}>
          {/* Top navigation tab toolbar */}
          <MapToolbar />

          {/* Map & Controls Layout Split */}
          <MapSection
            panel={
              <Outlet
                context={{
                  mapCenter,
                  mapZoom,
                  activeLayers,
                  onToggleLayer: handleToggleLayer,
                }}
              />
            }
            map={
              <div className="w-full h-full relative">
                {viewMode === 'map' ? (
                  <Suspense fallback={
                    <div className="relative w-full h-full flex flex-col items-center justify-center select-none font-mono text-[9px] text-muted-dark tracking-widest uppercase bg-canvas-dark">
                      <div className="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin mb-3" />
                      <span className="text-[9px] text-brand-green/85">Initializing Map Canvas...</span>
                    </div>
                  }>
                    <MapContainer
                      onMapLoad={handleMapLoad}
                      activeLayers={activeLayers}
                    />
                  </Suspense>
                ) : (
                  <div className="w-full h-full relative bg-canvas-dark">
                    <GlobeContainer 
                      onCountrySelect={setSelectedCountry}
                      autoRotate={autoRotate}
                      showIncidents={activeLayers.includes('incident')}
                      showResources={activeLayers.includes('resource')}
                      showHotspots={activeLayers.includes('risk') || activeLayers.includes('ai')}
                      cameraResetTrigger={cameraResetTrigger}
                    />

                    {/* Dotted HUD indicator overlay */}
                    <div className="absolute top-4 left-4 z-10 font-mono text-[9px] tracking-widest text-brand-green bg-canvas-dark/95 border border-brand-green/20 px-2.5 py-1 rounded uppercase select-none">
                      Interactive 3D Globe Sync Mode
                    </div>

                    {/* Selected Country Details Overlay */}
                    {selectedCountry ? (
                      <div className="absolute bottom-4 right-4 z-10 w-72 max-w-full">
                        <CountryPanel 
                          country={selectedCountry} 
                          onClear={() => setSelectedCountry(null)} 
                        />
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Floating Map Controls overlay */}
                <div className="absolute top-4 right-4 z-10">
                  <MapControls
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onResetView={handleResetView}
                    onToggleFullscreen={handleToggleFullscreen}
                    isFullscreen={isFullscreen}
                    viewMode={viewMode}
                    onToggleViewMode={handleToggleViewMode}
                  />
                </div>

                {/* Floating Legend Overlay */}
                <div className="absolute bottom-4 left-4 z-10">
                  <MapLegend activeLayers={activeLayers} />
                </div>
              </div>
            }
          />
        </div>
      </div>
    </>
  )
}
