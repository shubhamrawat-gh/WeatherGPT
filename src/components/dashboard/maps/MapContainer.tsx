import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MapContainerProps {
  onMapLoad?: (map: maplibregl.Map) => void
  activeLayers?: string[]
  theme?: 'dark' | 'light' | 'auto'
}

export default function MapContainer({ onMapLoad, activeLayers = [], theme = 'auto' }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize map with OpenStreetMap tiles
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-160, 20], // Centered near Hawaii for a global Ring of Fire view
      zoom: 2.0,
      maxZoom: 14,
      minZoom: 1.5,
    })

    mapInstanceRef.current = map

    map.on('load', () => {
      // 1. Prepare Incident Visualization GeoJSON Layer
      map.addSource('incidents-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [], // empty for now (no fake records)
        },
      })

      map.addLayer({
        id: 'incidents-layer',
        type: 'circle',
        source: 'incidents-source',
        paint: {
          'circle-radius': 7,
          'circle-color': '#ef4444',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
        },
        layout: {
          visibility: activeLayers.includes('incident') ? 'visible' : 'none',
        },
      })

      // 2. Prepare Resource Mapping GeoJSON Layer
      map.addSource('resources-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [], // empty for now (no fake markers)
        },
      })

      map.addLayer({
        id: 'resources-layer',
        type: 'circle',
        source: 'resources-source',
        paint: {
          'circle-radius': 7,
          'circle-color': '#00ed64',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#001e2b',
        },
        layout: {
          visibility: activeLayers.includes('resource') ? 'visible' : 'none',
        },
      })

      // 3. Prepare Earthquake Telemetry GeoJSON Layer
      map.addSource('earthquakes-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })

      map.addLayer({
        id: 'earthquakes-layer',
        type: 'circle',
        source: 'earthquakes-source',
        paint: {
          'circle-radius': ['get', 'radius'],
          'circle-color': ['get', 'color'],
          'circle-opacity': ['get', 'opacity'],
          'circle-stroke-width': 0.5,
          'circle-stroke-color': '#ffffff',
        },
        layout: {
          visibility: activeLayers.includes('earthquake') ? 'visible' : 'none',
        },
      })

      // Fetch and transform JSONP data into clean GeoJSON features
      fetch('https://storage.googleapis.com/mapsdevsite/json/quakes.geo.json')
        .then((res) => res.text())
        .then((text) => {
          const match = text.match(/^eqfeed_callback\(([\s\S]*)\);?\s*$/)
          if (match) {
            const geojson = JSON.parse(match[1])
            const rawFeatures = geojson.features || []

            const processedFeatures = rawFeatures.map((feature: any) => {
              const mag = feature.properties?.mag || 1.0
              const minMag = 1.0
              const maxMag = 6.0
              const fraction = (Math.min(mag, maxMag) - minMag) / (maxMag - minMag)

              // HSL Interpolation from the original Google Maps logic
              const low = [151, 83, 34] // Low magnitude HSL
              const high = [5, 69, 54] // High magnitude HSL

              const h = (high[0] - low[0]) * fraction + low[0]
              const s = (high[1] - low[1]) * fraction + low[1]
              const l = (high[2] - low[2]) * fraction + low[2]
              const color = `hsl(${h}, ${s}%, ${l}%)`

              const opacity = Math.min(1.0, Math.max(0.1, 2 / mag))
              const radius = Math.min(30, Math.max(2, Math.pow(mag, 2))) // Quadratic scale with bounds

              return {
                ...feature,
                properties: {
                  ...feature.properties,
                  color,
                  opacity,
                  radius,
                },
              }
            })

            // Sort ascending by magnitude so higher magnitude events are rendered on top
            processedFeatures.sort((a: any, b: any) => (a.properties?.mag || 0) - (b.properties?.mag || 0))

            const finalGeoJson = {
              ...geojson,
              features: processedFeatures,
            }

            if (map.isStyleLoaded() && map.getSource('earthquakes-source')) {
              ;(map.getSource('earthquakes-source') as maplibregl.GeoJSONSource).setData(finalGeoJson)
            }
          }
        })
        .catch((err) => console.error('Failed to load earthquakes layer:', err))

      // Setup popup hover and click handlers
      map.on('click', 'earthquakes-layer', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['earthquakes-layer'],
        })
        if (!features.length) return
        const feature = features[0]
        const properties = feature.properties
        const geometry = feature.geometry as any
        const coordinates = geometry.coordinates.slice()

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
        }

        const dateString = properties.time 
          ? new Date(properties.time).toLocaleString() 
          : 'N/A'

        new maplibregl.Popup({ className: 'custom-map-popup', closeButton: true })
          .setLngLat(coordinates as [number, number])
          .setHTML(`
            <div class="p-1 select-none text-left font-sans">
              <div class="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-white/[0.08]">
                <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span class="font-mono text-[8px] font-bold text-red-400 tracking-wider uppercase">Seismic Incident</span>
              </div>
              <h4 class="text-xs font-bold text-white mb-1.5 leading-snug">${properties.title || 'Earthquake'}</h4>
              <div class="flex flex-col gap-1 font-mono text-[9px] text-muted-dark leading-normal">
                <div><span class="text-white/60">Magnitude:</span> <strong class="text-brand-green text-[10px] font-bold">${properties.mag.toFixed(1)}</strong></div>
                <div><span class="text-white/60">Location:</span> <span class="text-slate-200">${properties.place}</span></div>
                <div><span class="text-white/60">Timestamp:</span> <span class="text-slate-350">${dateString}</span></div>
              </div>
            </div>
          `)
          .addTo(map)
      })

      map.on('mouseenter', 'earthquakes-layer', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', 'earthquakes-layer', () => {
        map.getCanvas().style.cursor = ''
      })

      if (onMapLoad) {
        onMapLoad(map)
      }

      // Force delayed resizes to guarantee the canvas scales correctly after layout changes
      setTimeout(() => map.resize(), 100)
      setTimeout(() => map.resize(), 500)
      setTimeout(() => map.resize(), 1000)
    })

    // Setup ResizeObserver to automatically resize the map canvas when layout/container dimensions change
    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
      map.remove()
    }
  }, [])

  // Sync layer visibilities dynamically
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    const syncVisibility = (layerId: string, active: boolean) => {
      // Check if style is loaded and layer exists
      if (map.isStyleLoaded() && map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', active ? 'visible' : 'none')
      }
    }

    // Wrap in load/idle check to ensure style has loaded
    const updateLayers = () => {
      syncVisibility('incidents-layer', activeLayers.includes('incident'))
      syncVisibility('resources-layer', activeLayers.includes('resource'))
      syncVisibility('earthquakes-layer', activeLayers.includes('earthquake'))
      syncVisibility('osm', activeLayers.includes('satellite'))
    }

    if (map.isStyleLoaded()) {
      updateLayers()
    } else {
      map.once('idle', updateLayers)
    }
  }, [activeLayers])

  return (
    <div className={`w-full h-full relative overflow-hidden bg-[#001721] ${theme === 'dark' ? 'map-dark' : ''}`}>
      {/* Map canvas element */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      
      <style>{`
        /* Apply premium dark filter to the map canvas in dark mode */
        .map-dark .maplibregl-canvas,
        .dark .maplibregl-canvas {
          filter: invert(0.9) hue-rotate(180deg) brightness(0.65) saturate(0.85) contrast(1.15) !important;
          background-color: #001721 !important;
        }

        .maplibregl-ctrl-attrib {
          background-color: rgba(0, 30, 43, 0.85) !important;
          color: #a8b3bc !important;
          font-family: monospace !important;
          font-size: 8px !important;
          border-radius: 4px !important;
          border: 1px solid #1c2d38 !important;
        }
        .maplibregl-ctrl-attrib a {
          color: #00ed64 !important;
        }

        /* Premium custom style for MapLibre Popup content */
        .custom-map-popup .maplibregl-popup-content {
          background-color: #001721 !important;
          color: #ffffff !important;
          border: 1px solid rgba(28, 45, 56, 0.8) !important;
          border-radius: 8px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.7) !important;
          padding: 8px 10px !important;
        }
        .custom-map-popup .maplibregl-popup-tip {
          border-top-color: #001721 !important;
          border-bottom-color: #001721 !important;
        }
        .custom-map-popup .maplibregl-popup-close-button {
          color: #a8b3bc !important;
          font-size: 14px !important;
          padding: 1px 5px !important;
          top: 4px !important;
          right: 4px !important;
        }
        .custom-map-popup .maplibregl-popup-close-button:hover {
          color: #ffffff !important;
          background-color: transparent !important;
        }
      `}</style>
    </div>
  )
}
