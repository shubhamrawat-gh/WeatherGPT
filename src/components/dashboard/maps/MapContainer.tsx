import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { 
  Compass, 
  CloudRain, 
  Layers, 
  Thermometer, 
  Wind, 
  AlertTriangle,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

interface MapContainerProps {
  onMapLoad?: (map: maplibregl.Map) => void
  activeLayers?: string[]
  theme?: 'dark' | 'light' | 'auto'
}

// All-India Geographic Center
const INDIA_CENTER: [number, number] = [78.9629, 22.5937]
const DEFAULT_ZOOM = 4.6

// Open-source Map Tile Basemaps
const BASEMAP_TILES = {
  dark: {
    name: 'CartoDB Dark Matter',
    tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'],
  },
  osm: {
    name: 'OpenStreetMap Standard',
    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  },
  topo: {
    name: 'OpenTopoMap Terrain',
    tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
  },
  light: {
    name: 'CartoDB Positron Light',
    tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'],
  },
}

// Weather Station Mock Coordinates across India
const WEATHER_STATIONS = [
  { name: 'Mumbai Observatory', coords: [72.8777, 19.0760], temp: '28°C', rain: '78mm', wind: '42 km/h', status: 'Heavy Rain' },
  { name: 'Delhi Safdarjung', coords: [77.2090, 28.6139], temp: '38°C', rain: '0mm', wind: '18 km/h', status: 'Hazy Sun' },
  { name: 'Kolkata Alipore', coords: [88.3639, 22.5726], temp: '32°C', rain: '32mm', wind: '25 km/h', status: 'Partly Cloudy' },
  { name: 'Chennai Meenambakkam', coords: [80.2707, 13.0827], temp: '33°C', rain: '12mm', wind: '22 km/h', status: 'Humid' },
  { name: 'Bengaluru HAL', coords: [77.5946, 12.9716], temp: '24°C', rain: '14mm', wind: '16 km/h', status: 'Overcast' },
  { name: 'Guwahati Borjhar', coords: [91.7362, 26.1445], temp: '27°C', rain: '95mm', wind: '30 km/h', status: 'Torrential Rain' },
  { name: 'Jaipur Sanganer', coords: [75.7873, 26.9124], temp: '42°C', rain: '0mm', wind: '28 km/h', status: 'Heatwave' },
  { name: 'Shillong Barapani', coords: [91.8933, 25.5788], temp: '19°C', rain: '140mm', wind: '35 km/h', status: 'Heavy Showers' },
  { name: 'Bhubaneswar Airport', coords: [85.8245, 20.2961], temp: '30°C', rain: '110mm', wind: '65 km/h', status: 'Squall / Cyclone Warning' },
  { name: 'Kochi Naval Base', coords: [76.2673, 9.9312], temp: '27°C', rain: '48mm', wind: '24 km/h', status: 'Rainy' },
  { name: 'Shimla Ridge', coords: [77.1734, 31.1048], temp: '17°C', rain: '22mm', wind: '15 km/h', status: 'Misty' },
  { name: 'Dehradun Jolly Grant', coords: [78.0322, 30.3165], temp: '26°C', rain: '62mm', wind: '20 km/h', status: 'Thunderstorm' }
]

export default function MapContainer({
  onMapLoad,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const [selectedBasemap, setSelectedBasemap] = useState<keyof typeof BASEMAP_TILES>('dark')
  const [showBasemapMenu, setShowBasemapMenu] = useState(false)
  const [activeWeatherLayer, setActiveWeatherLayer] = useState<'radar' | 'temperatures' | 'wind' | 'alerts'>('radar')

  // Initialize MapLibre GL
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return

    const tileDef = BASEMAP_TILES[selectedBasemap]

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: tileDef.tiles,
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors &copy; CartoDB',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: INDIA_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 0,
      bearing: 0,
    })

    mapInstanceRef.current = map

    map.on('load', () => {
      // Compatibility layers for external consumers (e.g. FeaturesPage)
      if (!map.getSource('incidents-source')) {
        map.addSource('incidents-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'incidents-points',
          type: 'circle',
          source: 'incidents-source',
          paint: {
            'circle-radius': 6,
            'circle-color': '#f87171',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        })
      }

      if (!map.getSource('resources-source')) {
        map.addSource('resources-source', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        })
        map.addLayer({
          id: 'resources-points',
          type: 'circle',
          source: 'resources-source',
          paint: {
            'circle-radius': 5,
            'circle-color': '#10b981',
            'circle-stroke-width': 1.5,
            'circle-stroke-color': '#ffffff'
          }
        })
      }

      // Add Weather Alert Polygons
      map.addSource('weather-alerts-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'Cyclone Zone (Odisha Coast)', severity: 'extreme' },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [84.5, 18.5], [87.5, 20.5], [86.8, 21.8], [84.0, 19.5], [84.5, 18.5]
                ]]
              }
            },
            {
              type: 'Feature',
              properties: { name: 'Heavy Rain & Flash Flood (Assam & Meghalaya)', severity: 'severe' },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [90.5, 25.0], [93.5, 25.0], [93.5, 26.5], [90.5, 26.5], [90.5, 25.0]
                ]]
              }
            },
            {
              type: 'Feature',
              properties: { name: 'Heatwave Alert Zone (Rajasthan)', severity: 'severe' },
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [70.5, 25.5], [74.5, 25.5], [74.5, 28.5], [70.5, 28.5], [70.5, 25.5]
                ]]
              }
            }
          ]
        }
      })

      map.addLayer({
        id: 'weather-alerts-fill',
        type: 'fill',
        source: 'weather-alerts-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'severity'],
            'extreme', '#f87171',
            'severe', '#fb923c',
            '#fbbf24'
          ],
          'fill-opacity': 0.18
        }
      })

      map.addLayer({
        id: 'weather-alerts-line',
        type: 'line',
        source: 'weather-alerts-source',
        paint: {
          'line-color': [
            'match',
            ['get', 'severity'],
            'extreme', '#f87171',
            'severe', '#fb923c',
            '#fbbf24'
          ],
          'line-width': 1.5,
          'line-dasharray': [2, 2]
        }
      })

      // Attach Weather Station Markers
      WEATHER_STATIONS.forEach((station) => {
        const el = document.createElement('div')
        el.className = 'group relative flex items-center justify-center cursor-pointer'
        el.innerHTML = `
          <div class="w-3.5 h-3.5 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center transition-transform group-hover:scale-125">
            <div class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
        `

        const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
          <div style="padding: 6px 8px; font-family: sans-serif; font-size: 11px; color: #f8fafc; background: #0f141c; border: 1px solid #1c2333; border-radius: 6px;">
            <div style="font-weight: 600; margin-bottom: 2px;">${station.name}</div>
            <div style="color: #10b981; font-weight: 500;">${station.temp} · ${station.status}</div>
            <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Rain: ${station.rain} · Wind: ${station.wind}</div>
          </div>
        `)

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(station.coords as [number, number])
          .setPopup(popup)
          .addTo(map)

        markersRef.current.push(marker)
      })

      if (onMapLoad) {
        onMapLoad(map)
      }
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapInstanceRef.current = null
    }
  }, [selectedBasemap])

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()
  const handleReset = () => {
    mapInstanceRef.current?.flyTo({ center: INDIA_CENTER, zoom: DEFAULT_ZOOM, essential: true })
  }

  return (
    <div className="relative w-full h-full min-h-[400px] overflow-hidden bg-[#0a0e14] select-none">
      {/* MapLibre DOM Node */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Floating Weather Layer Bar (Top Center) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1 rounded-lg bg-[#0f141c]/90 border border-[#1c2333] shadow-lg backdrop-blur-md">
        <button
          onClick={() => setActiveWeatherLayer('radar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeWeatherLayer === 'radar'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>Radar &amp; Rain</span>
        </button>

        <button
          onClick={() => setActiveWeatherLayer('temperatures')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeWeatherLayer === 'temperatures'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          <span>Temperatures</span>
        </button>

        <button
          onClick={() => setActiveWeatherLayer('wind')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeWeatherLayer === 'wind'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>Wind</span>
        </button>

        <button
          onClick={() => setActiveWeatherLayer('alerts')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeWeatherLayer === 'alerts'
              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Alert Zones</span>
        </button>
      </div>

      {/* Map Control Buttons (Top Right) */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-md bg-[#0f141c]/90 border border-[#1c2333] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#151b26] transition-colors shadow-md cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-md bg-[#0f141c]/90 border border-[#1c2333] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#151b26] transition-colors shadow-md cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          title="Reset to All-India"
          className="w-8 h-8 rounded-md bg-[#0f141c]/90 border border-[#1c2333] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#151b26] transition-colors shadow-md cursor-pointer"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Basemap Switcher Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowBasemapMenu(!showBasemapMenu)}
            title="Switch Basemap"
            className="w-8 h-8 rounded-md bg-[#0f141c]/90 border border-[#1c2333] flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#151b26] transition-colors shadow-md cursor-pointer"
          >
            <Layers className="w-4 h-4" />
          </button>

          {showBasemapMenu && (
            <div className="absolute right-0 mt-1 w-44 rounded-md bg-[#0f141c] border border-[#1c2333] p-1.5 shadow-xl flex flex-col gap-1 z-30 font-sans text-xs">
              {(Object.keys(BASEMAP_TILES) as Array<keyof typeof BASEMAP_TILES>).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedBasemap(key)
                    setShowBasemapMenu(false)
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition-colors ${
                    selectedBasemap === key
                      ? 'bg-emerald-500/15 text-emerald-400 font-medium'
                      : 'text-slate-400 hover:text-white hover:bg-[#151b26]'
                  }`}
                >
                  {BASEMAP_TILES[key].name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend & Telemetry Status (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="p-3 rounded-lg bg-[#0f141c]/90 border border-[#1c2333] backdrop-blur-md shadow-lg text-left">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
            Active Warning Zones
          </div>
          <div className="flex flex-col gap-1.5 font-sans text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-red-400/80 border border-red-500" />
              <span className="text-slate-300">Extreme Cyclone Advisory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-orange-400/80 border border-orange-500" />
              <span className="text-slate-300">Torrential Rain &amp; Flood</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-amber-400/80 border border-amber-500" />
              <span className="text-slate-300">Heatwave Conditions</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-[#1c2333]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-400 font-mono">12 Synoptic Stations Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
