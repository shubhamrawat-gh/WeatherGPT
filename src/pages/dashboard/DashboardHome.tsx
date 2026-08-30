import { useState, useEffect, useRef, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { 
  ShieldAlert, 
  Flame, 
  Droplet, 
  AlertTriangle, 
  Lock, 
  Clock, 
  Settings, 
  Compass, 
  Layers, 
  Tv, 
  Send, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Maximize2, 
  Eye, 
  CheckCircle, 
  Activity,
  Brain,
  Truck
} from 'lucide-react'

// Coordinate Centers & Polygons for San Francisco Bay / Yosemite Region
const MAP_CENTER: [number, number] = [-121.2, 37.75]
const INITIAL_ZOOM = 7.7

// Geographic configurations for sectors, predictive models, and routing
const INCIDENT_COORDS = {
  wildfire: [-119.7, 37.75] as [number, number],
  hazmat: [-121.9, 37.42] as [number, number],
  flood: [-122.45, 37.55] as [number, number]
}

const SECTOR_POLYGONS = {
  wildfire: [
    [-120.1, 37.95], [-119.4, 37.95], [-119.3, 37.55], [-120.1, 37.55], [-120.1, 37.95]
  ],
  hazmat: [
    [-122.02, 37.47], [-121.78, 37.47], [-121.78, 37.33], [-122.02, 37.33], [-122.02, 37.47]
  ],
  flood: [
    [-122.62, 38.02], [-122.35, 37.72], [-122.25, 37.42], [-122.55, 37.35], [-122.68, 37.75], [-122.62, 38.02]
  ]
}

const PREDICTIVE_POLYGONS = {
  wildfireCone: [
    [-119.7, 37.75], [-119.3, 38.05], [-118.9, 37.92], [-119.7, 37.75]
  ],
  hazmatPlume: [
    [-121.9, 37.42], [-121.78, 37.15], [-122.08, 37.15], [-121.9, 37.42]
  ],
  floodInundation: [
    [-122.52, 37.95], [-122.38, 37.82], [-122.35, 37.62], [-122.42, 37.45], [-122.55, 37.48], [-122.58, 37.82], [-122.52, 37.95]
  ]
}

// Simulated Live Assets data
const INITIAL_ASSETS = [
  // Personnel (Deployed vs Available)
  { id: 'p-1', name: 'OPS Team Echo-4', type: 'personnel', status: 'Deployed', coords: [-122.4, 37.75] as [number, number], info: 'Coordinating Coastal Route 12 blocking' },
  { id: 'p-2', name: 'Yosemite Hotshots', type: 'personnel', status: 'Deployed', coords: [-119.65, 37.78] as [number, number], info: 'Cutting fire break line in Sector 4-Alpha' },
  { id: 'p-3', name: 'Hazmat Response Unit 1', type: 'personnel', status: 'Deployed', coords: [-121.88, 37.43] as [number, number], info: 'Securing tank breach perimeter in Zone 9' },
  { id: 'p-4', name: 'Staging Unit Personnel', type: 'personnel', status: 'Available', coords: [-122.15, 37.68] as [number, number], info: 'Oakland Command Center Reserve' },
  { id: 'p-5', name: 'Reserve EMS Team C', type: 'personnel', status: 'Available', coords: [-121.92, 37.35] as [number, number], info: 'San Jose Logistics Hub Base' },
  { id: 'p-6', name: 'Field Engine Unit 18', type: 'personnel', status: 'Available', coords: [-120.45, 37.32] as [number, number], info: 'Merced Staging Depot' },

  // Air Assets (Helicopters)
  { id: 'a-1', name: 'Air-Rescue Helo H-01', type: 'air', status: 'Deployed', coords: [-119.55, 37.72] as [number, number], info: 'Water bombing active over fire line' },
  { id: 'a-2', name: 'Environmental Scan Helo H-02', type: 'air', status: 'Deployed', coords: [-121.82, 37.38] as [number, number], info: 'Thermal plume monitoring active' },
  { id: 'a-3', name: 'Med-Evac Helo H-03', type: 'air', status: 'Available', coords: [-122.38, 37.62] as [number, number], targetIncident: 'flood', eta: '4 min', info: 'Staged at SFO heliport. Ready for dispatch' },
  { id: 'a-4', name: 'Heavy Water Helo H-04', type: 'air', status: 'Available', coords: [-121.49, 38.58] as [number, number], targetIncident: 'wildfire', eta: '14 min', info: 'Staged at Sacramento Base. Ready for dispatch' },
  { id: 'a-5', name: 'Tactical Recon Helo H-05', type: 'air', status: 'Available', coords: [-121.89, 36.6] as [number, number], targetIncident: 'flood', eta: '12 min', info: 'Staged at Monterey Airport. Ready for dispatch' },
  { id: 'a-6', name: 'Logistics Helo H-06', type: 'air', status: 'Available', coords: [-120.0, 39.0] as [number, number], targetIncident: 'wildfire', eta: '18 min', info: 'Staged at Lake Tahoe Base. Ready for dispatch' },

  // Ground Logistics
  { id: 'g-1', name: 'Supply Engine T-01', type: 'ground', status: 'Deployed', coords: [-119.82, 37.68] as [number, number], info: 'Delivering foam containment supply' },
  { id: 'g-2', name: 'Pumping Unit T-02', type: 'ground', status: 'Deployed', coords: [-122.48, 37.62] as [number, number], info: 'Water diversion pumps deployed' },
  { id: 'g-3', name: 'Hazmat Spill Trailer T-03', type: 'ground', status: 'Available', coords: [-121.02, 37.64] as [number, number], targetIncident: 'hazmat', eta: '8 min', info: 'Modesto Staging Yard. Ready for dispatch' },
  { id: 'g-4', name: 'Logistics Hauler T-04', type: 'ground', status: 'Available', coords: [-122.41, 37.77] as [number, number], targetIncident: 'flood', eta: '3 min', info: 'San Francisco Central Yard. Ready for dispatch' },

  // Medical Capacity
  { id: 'm-1', name: 'Field Med-Station A', type: 'medical', status: 'Deployed', coords: [-121.91, 37.4] as [number, number], info: 'Station operational, 12 beds active' },
  { id: 'm-2', name: 'Emergency Med-Station B', type: 'medical', status: 'Deployed', coords: [-119.88, 37.65] as [number, number], info: 'Yosemite sector staging base, 8 beds active' },
  { id: 'm-3', name: 'Trauma Transport Unit C', type: 'medical', status: 'Available', coords: [-122.43, 37.76] as [number, number], targetIncident: 'flood', eta: '5 min', info: 'SF General Hospital. Ready for dispatch' }
]

// Simulated incident items in the Action Stack
const INITIAL_INCIDENTS = [
  { 
    id: 1, 
    key: 'wildfire',
    title: 'Wildfire Outbreak', 
    sector: 'Sector 4-Alpha', 
    severity: 'Critical', 
    time: '2m ago', 
    status: 'ACTIVE ESCALATION',
    icon: Flame,
    color: 'border-[#fa6e39] text-[#fa6e39] bg-[#fa6e39]/10',
    borderColor: 'border-l-4 border-l-[#fa6e39]',
    sparkline: [20, 35, 45, 52, 60, 78, 88], // escalation trend
    coords: INCIDENT_COORDS.wildfire,
    assignedResources: 'Yosemite Hotshots, Helo H-01, Supply Engine T-01',
    description: 'Rapidly propagating forest fire spreading northeast. Zero containment. High threat to local structures in El Portal corridor.'
  },
  { 
    id: 2, 
    key: 'hazmat',
    title: 'Chemical Tank Breach', 
    sector: 'Industrial zone 9', 
    severity: 'Critical', 
    time: '8m ago', 
    status: 'PLUME DISPERSION',
    icon: AlertTriangle,
    color: 'border-[#7b3ff2] text-[#7b3ff2] bg-[#7b3ff2]/10',
    borderColor: 'border-l-4 border-l-[#7b3ff2]',
    sparkline: [10, 25, 30, 48, 55, 62, 70],
    coords: INCIDENT_COORDS.hazmat,
    assignedResources: 'Hazmat Response Unit 1, Helo H-02, Field Med-Station A',
    description: '15,000 gal Hydrofluoric acid storage tank breached at Milpitas chemical processing yard. Atmospheric plume drifting South.'
  },
  { 
    id: 3, 
    key: 'flood',
    title: 'Flash Flood Overflow', 
    sector: 'Coastal Route 12', 
    severity: 'Warning', 
    time: '14m ago', 
    status: 'STABILIZED / MONITORING',
    icon: Droplet,
    color: 'border-[#3d4f9f] text-[#3d4f9f] bg-[#3d4f9f]/10',
    borderColor: 'border-l-4 border-l-[#3d4f9f]',
    sparkline: [50, 65, 75, 70, 68, 62, 55], // de-escalating trend
    coords: INCIDENT_COORDS.flood,
    assignedResources: 'OPS Team Echo-4, Pumping Unit T-02, Med-Station B',
    description: 'Tidal surge combined with river run-off caused channel overflow on Route 12. Retaining wall breached, highway partially submerged.'
  }
]

// Comms radio transcripts mock
const INITIAL_COMMS = [
  { time: '22:42:01', unit: 'NASA-FIRMS', msg: 'Satellite detection confirms hot spot expansion in Sector 4-Alpha.' },
  { time: '22:42:48', unit: 'COMMAND', msg: 'Helo H-01 authorized for immediate water drop payload release.' },
  { time: '22:43:12', unit: 'ENGINE-4', msg: 'Arrived at route 12 channel blockage. Water depth exceeds safety threshold.' },
  { time: '22:44:05', unit: 'HAZMAT-1', msg: 'Perimeter blockade set. Wind speeds drifting vapor plume directly South.' }
]

export default function DashboardHome() {
  // 1. Clock telemetry states
  const [utcTime, setUtcTime] = useState('')
  const [localTime, setLocalTime] = useState('')

  // 2. Incident states
  const [incidents] = useState(INITIAL_INCIDENTS)
  const [expandedIncidentId, setExpandedIncidentId] = useState<number | null>(null)
  
  // 3. Telemetry values (simulated update triggers)
  const [personnelDeployed, setPersonnelDeployed] = useState(142)
  const [airDeployed, setAirDeployed] = useState(8)
  const [groundDeployed, setGroundDeployed] = useState(32)

  // 4. Interactive map filter & layer states
  const [activeLayers, setActiveLayers] = useState<string[]>(['topography', 'geofence', 'predictive', 'assets', 'radar', 'wind'])
  const [selectedResourceFilter, setSelectedResourceFilter] = useState<'air' | 'ground' | 'personnel' | 'medical' | null>(null)
  const [flyToTrigger, setFlyToTrigger] = useState<{ coords: [number, number]; zoom: number } | null>(null)

  // 5. Picture-in-Picture Drone feed state
  const [pipCam, setPipCam] = useState({
    open: true,
    source: 'Drone 4-Alpha (Wildfire)',
    coords: '37.7538° N, 119.7214° W',
    alt: '180m',
    battery: '82%',
    status: 'TELEMETRY SYNCED',
    feedColor: 'border-l-[#fa6e39]',
    videoStream: 'wildfire' // wildfire, hazmat, flood
  })
  const [pipPos, setPipPos] = useState({ x: 75, y: 15 }) // relative to map parent container
  const [pipSize, setPipSize] = useState({ width: 300, height: 180 })
  const [isPipMinimized, setIsPipMinimized] = useState(false)

  // 6. Comms radio states
  const [commsFeed, setCommsFeed] = useState(INITIAL_COMMS)
  const [aiSummaryOpen, setAiSummaryOpen] = useState(false)
  const [newMsgText, setNewMsgText] = useState('')

  // 7. Global config settings states
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [systemSecurityAlert, setSystemSecurityAlert] = useState(false)

  // References
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const commsEndRef = useRef<HTMLDivElement>(null)

  // ----------------------------------------------------
  // EFFECT 1: Operations Telemetry Clock
  // ----------------------------------------------------
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setUtcTime(now.toISOString().substring(11, 19) + ' UTC')
      setLocalTime(now.toLocaleTimeString() + ' LCL')
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  // ----------------------------------------------------
  // EFFECT 2: Live Radio Traffic Drifting Feed
  // ----------------------------------------------------
  useEffect(() => {
    const units = ['HELO-1', 'HAZMAT-1', 'AIR-BASE', 'CMD-CENTER', 'EMS-STAG', 'ENGINE-4', 'LOGISTICS-HAULER']
    const logs = [
      'Foam containment line holding. Secondary breakout threat at 12%.',
      'Atmospheric vapor scans register slight reduction in chemical parts per million.',
      'Helicopter H-03 flight deck checks completed. Engines hot.',
      'SF Staging yard dispatching backup sandbags to coastal channel 4.',
      'Tactical crew Echo-4 reports route 12 bypass is clear for heavy ambulance transit.',
      'Weather station Yosemite records wind vector shift ENE @ 22KT.',
      'Gas monitoring array at Industrial Zone coordinates reporting within green threshold.'
    ]

    const interval = setInterval(() => {
      const randomUnit = units[Math.floor(Math.random() * units.length)]
      const randomLog = logs[Math.floor(Math.random() * logs.length)]
      const now = new Date()
      const timeStr = now.toTimeString().split(' ')[0]

      setCommsFeed(prev => {
        const next = [...prev, { time: timeStr, unit: randomUnit, msg: randomLog }]
        // cap at 20 lines to keep viewport performance optimal
        if (next.length > 20) next.shift()
        return next
      })
    }, 11000)

    return () => clearInterval(interval)
  }, [])

  // Scroll comms terminal to bottom when new logs drift in
  useEffect(() => {
    commsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [commsFeed])

  // ----------------------------------------------------
  // EFFECT 3: 2.5D Map Engine (MapLibre GL JS)
  // ----------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Initialize MapLibre Map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: MAP_CENTER,
      zoom: INITIAL_ZOOM,
      maxZoom: 12,
      minZoom: 5,
      pitch: 35, // 2.5D Pitch rotation angle
      bearing: -5 // Slight rotation
    })

    mapRef.current = map

    map.on('load', () => {
      // 1. Sector Geofencing Source & Layers
      map.addSource('sectors-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { sector: 'Sector 4-Alpha (Wildfire)', color: '#fa6e39' },
              geometry: { type: 'Polygon', coordinates: [SECTOR_POLYGONS.wildfire] }
            },
            {
              type: 'Feature',
              properties: { sector: 'Industrial Zone 9 (Hazmat)', color: '#7b3ff2' },
              geometry: { type: 'Polygon', coordinates: [SECTOR_POLYGONS.hazmat] }
            },
            {
              type: 'Feature',
              properties: { sector: 'Coastal Route 12 (Flood)', color: '#3d4f9f' },
              geometry: { type: 'Polygon', coordinates: [SECTOR_POLYGONS.flood] }
            }
          ]
        }
      })

      // Sector outlines
      map.addLayer({
        id: 'sectors-outline',
        type: 'line',
        source: 'sectors-source',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-dasharray': [3, 2]
        },
        layout: {
          visibility: activeLayers.includes('geofence') ? 'visible' : 'none'
        }
      })

      // Sector semi-transparent fills
      map.addLayer({
        id: 'sectors-fill',
        type: 'fill',
        source: 'sectors-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.05
        },
        layout: {
          visibility: activeLayers.includes('geofence') ? 'visible' : 'none'
        }
      })

      // 2. Predictive Hazard Polygons Source & Layers
      map.addSource('predictive-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { type: 'wildfire', color: '#fa6e39', label: 'Wildfire Spread Projection Cone' },
              geometry: { type: 'Polygon', coordinates: [PREDICTIVE_POLYGONS.wildfireCone] }
            },
            {
              type: 'Feature',
              properties: { type: 'hazmat', color: '#7b3ff2', label: 'Hazmat Vapor Plume Model' },
              geometry: { type: 'Polygon', coordinates: [PREDICTIVE_POLYGONS.hazmatPlume] }
            },
            {
              type: 'Feature',
              properties: { type: 'flood', color: '#3d4f9f', label: 'Coastal Flood Inundation Polygon' },
              geometry: { type: 'Polygon', coordinates: [PREDICTIVE_POLYGONS.floodInundation] }
            }
          ]
        }
      })

      map.addLayer({
        id: 'predictive-fill',
        type: 'fill',
        source: 'predictive-source',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.28,
          'fill-outline-color': ['get', 'color']
        },
        layout: {
          visibility: activeLayers.includes('predictive') ? 'visible' : 'none'
        }
      })

      // 3. Routing Paths Source (For active dispatcher helicopter tracking)
      map.addSource('paths-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      })

      map.addLayer({
        id: 'paths-line',
        type: 'line',
        source: 'paths-source',
        paint: {
          'line-color': '#00ed64',
          'line-width': 3.5,
          'line-dasharray': [2, 1.5]
        }
      })

      // 4. Pulse Radar Source and animation loop
      map.addSource('radar-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-122.45, 37.55] // SF Coastal Route 12 Radar point
          }
        }
      })

      map.addLayer({
        id: 'radar-layer',
        type: 'circle',
        source: 'radar-source',
        paint: {
          'circle-radius': 5,
          'circle-color': '#00ed64',
          'circle-opacity': 0.5,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#00ed64'
        },
        layout: {
          visibility: activeLayers.includes('radar') ? 'visible' : 'none'
        }
      })

      // Radar pulse loop variables
      let radius = 5
      const animateRadar = () => {
        if (!mapRef.current) return
        radius = (radius + 0.3) % 45
        if (map.isStyleLoaded() && map.getLayer('radar-layer')) {
          map.setPaintProperty('radar-layer', 'circle-radius', radius * 2.5)
          map.setPaintProperty('radar-layer', 'circle-opacity', 1 - (radius / 45))
        }
        requestAnimationFrame(animateRadar)
      }
      animateRadar()

      // Force resize to ensure rendering occupies correct container width
      setTimeout(() => map.resize(), 100)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // ----------------------------------------------------
  // EFFECT 4: Handle Layer Visibilities
  // ----------------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    const layerMapping: Record<string, string[]> = {
      topography: ['osm'],
      geofence: ['sectors-outline', 'sectors-fill'],
      predictive: ['predictive-fill'],
      radar: ['radar-layer']
    }

    Object.keys(layerMapping).forEach(reactLayer => {
      const mapLayers = layerMapping[reactLayer]
      const visible = activeLayers.includes(reactLayer)
      mapLayers.forEach(l => {
        if (map.getLayer(l)) {
          map.setLayoutProperty(l, 'visibility', visible ? 'visible' : 'none')
        }
      })
    })
  }, [activeLayers])

  // ----------------------------------------------------
  // EFFECT 5: GPS Asset Markers Coordination
  // ----------------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // 1. Remove previous markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    if (!activeLayers.includes('assets')) return

    // 2. Filter assets based on active sidebar resource filter
    const visibleAssets = INITIAL_ASSETS.filter(asset => {
      if (selectedResourceFilter) {
        if (selectedResourceFilter === 'air') return asset.type === 'air' && asset.status === 'Available'
        if (selectedResourceFilter === 'ground') return asset.type === 'ground' && asset.status === 'Available'
        if (selectedResourceFilter === 'personnel') return asset.type === 'personnel' && asset.status === 'Available'
        if (selectedResourceFilter === 'medical') return asset.type === 'medical' && asset.status === 'Available'
      }
      return true
    })

    // 3. Render HTML markers for remaining active assets
    visibleAssets.forEach(asset => {
      const markerEl = document.createElement('div')
      markerEl.className = 'relative flex items-center justify-center cursor-pointer'

      // Styling details (pulsing green for Available, solid flashing red/blue for Deployed)
      const isAvailable = asset.status === 'Available'
      
      const pinColor = isAvailable 
        ? 'bg-[#00ed64] shadow-[0_0_12px_#00ed64]' 
        : asset.type === 'air' ? 'bg-[#fa6e39]' : asset.type === 'personnel' ? 'bg-[#3d4f9f]' : 'bg-[#7b3ff2]'

      markerEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          ${isAvailable ? `
            <span class="absolute inline-flex h-7 w-7 rounded-full bg-[#00ed64]/35 animate-ping"></span>
            <span class="absolute inline-flex h-5 w-5 rounded-full bg-[#00ed64]/50 animate-pulse"></span>
          ` : `
            <span class="absolute inline-flex h-6 w-6 rounded-full bg-red-500/20 animate-pulse"></span>
          `}
          <div class="h-3.5 w-3.5 rounded-full ${pinColor} border border-[#001017] z-10 flex items-center justify-center"></div>
        </div>
      `

      // Add MapLibre coordinates popup
      const popup = new maplibregl.Popup({ className: 'custom-cockpit-popup', closeButton: false, offset: 8 })
        .setHTML(`
          <div class="p-2 font-mono text-[9px] text-[#ffffff] bg-[#001e2b] border border-[#1c2d38] rounded shadow-xl select-none">
            <div class="font-bold text-[#00ed64] uppercase flex items-center gap-1.5 border-b border-[#1c2d38] pb-1 mb-1">
              <span class="w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-[#00ed64] animate-pulse' : 'bg-red-400'}"></span>
              ${asset.name}
            </div>
            <div>STATUS: <span class="${isAvailable ? 'text-[#00ed64]' : 'text-amber-400'} font-bold">${asset.status.toUpperCase()}</span></div>
            <div>COORDS: ${asset.coords[1].toFixed(4)}, ${asset.coords[0].toFixed(4)}</div>
            <div class="text-[#a8b3bc] mt-1 text-[8px] leading-normal border-t border-[#1c2d38]/40 pt-1">${asset.info}</div>
            ${asset.eta ? `<div class="text-[#00ed64] font-bold mt-1 uppercase">GRID ETA: ${asset.eta}</div>` : ''}
          </div>
        `)

      const marker = new maplibregl.Marker({ element: markerEl })
        .setLngLat(asset.coords as [number, number])
        .setPopup(popup)
        .addTo(map)

      markersRef.current.push(marker)
    })

    // 4. Update the routing lines if an available resource category filter is clicked
    if (map.isStyleLoaded()) {
      const pathFeatures: any[] = []
      
      if (selectedResourceFilter === 'air') {
        // Draw routing from Available Helicopters to target incidents
        const availableHelos = INITIAL_ASSETS.filter(a => a.type === 'air' && a.status === 'Available')
        availableHelos.forEach(helo => {
          const targetCoords = helo.targetIncident === 'wildfire' 
            ? INCIDENT_COORDS.wildfire 
            : INCIDENT_COORDS.flood
          
          pathFeatures.push({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [helo.coords, targetCoords]
            }
          })
        })
      } else if (selectedResourceFilter === 'ground') {
        const availableTrucks = INITIAL_ASSETS.filter(a => a.type === 'ground' && a.status === 'Available')
        availableTrucks.forEach(truck => {
          const targetCoords = truck.targetIncident === 'hazmat' ? INCIDENT_COORDS.hazmat : INCIDENT_COORDS.flood
          pathFeatures.push({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [truck.coords, targetCoords]
            }
          })
        })
      }

      const pathsSource = map.getSource('paths-source') as maplibregl.GeoJSONSource
      if (pathsSource) {
        pathsSource.setData({
          type: 'FeatureCollection',
          features: pathFeatures
        })
      }
    }
  }, [selectedResourceFilter, activeLayers])

  // ----------------------------------------------------
  // EFFECT 6: Zoom Camera Focus Handler
  // ----------------------------------------------------
  useEffect(() => {
    if (!flyToTrigger || !mapRef.current) return
    mapRef.current.easeTo({
      center: flyToTrigger.coords,
      zoom: flyToTrigger.zoom,
      pitch: 45,
      duration: 1200
    })
    setFlyToTrigger(null)
  }, [flyToTrigger])

  // ----------------------------------------------------
  // INTERACTION FUNCTIONS
  // ----------------------------------------------------
  const handleToggleLayer = (layerId: string) => {
    setActiveLayers(prev => 
      prev.includes(layerId) ? prev.filter(l => l !== layerId) : [...prev, layerId]
    )
  }

  // Focus incident card and zoom map
  const handleFocusIncident = (incident: typeof INITIAL_INCIDENTS[number]) => {
    setExpandedIncidentId(prev => prev === incident.id ? null : incident.id)
    setFlyToTrigger({ coords: incident.coords as [number, number], zoom: 9.5 })
  }

  // Quick Action Dispatch
  const handleDispatchAction = (incidentName: string, type: string) => {
    // Increment telemetry
    if (type === 'wildfire') {
      setPersonnelDeployed(p => p + 14)
      setAirDeployed(a => a + 1)
    } else if (type === 'hazmat') {
      setGroundDeployed(g => g + 4)
      setPersonnelDeployed(p => p + 6)
    } else {
      setAirDeployed(a => a + 1)
      setGroundDeployed(g => g + 2)
    }

    // Add radio dispatch confirmation
    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0]
    setCommsFeed(prev => [
      ...prev,
      { time: timeStr, unit: 'EOC-CMD', msg: `ALERT: Additional units DISPATCHED to ${incidentName}. ETA synchronized.` }
    ])
  }

  // Switch Video Stream Feed in PiP
  const handleSetPiPFeed = (incidentType: 'wildfire' | 'hazmat' | 'flood') => {
    let source = ''
    let coords = ''
    let alt = ''
    let color = ''

    if (incidentType === 'wildfire') {
      source = 'Drone 4-Alpha (Wildfire)'
      coords = '37.7538° N, 119.7214° W'
      alt = '180m'
      color = 'border-l-[#fa6e39]'
    } else if (incidentType === 'hazmat') {
      source = 'Sentry CAM-09 (Hazmat)'
      coords = '37.4208° N, 121.9211° W'
      alt = 'Stationary'
      color = 'border-l-[#7b3ff2]'
    } else {
      source = 'Drone Route 12 (Flood)'
      coords = '37.5512° N, 122.4532° W'
      alt = '240m'
      color = 'border-l-[#3d4f9f]'
    }

    setPipCam({
      open: true,
      source,
      coords,
      alt,
      battery: '82%',
      status: 'TELEMETRY SYNCED',
      feedColor: color,
      videoStream: incidentType
    })
  }

  const handleBroadcastAlert = (incident: string) => {
    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0]
    setCommsFeed(prev => [
      ...prev,
      { time: timeStr, unit: 'RADIO-ALERT', msg: `BROADCAST: Emergency sirens triggered for ${incident}. Citizens seek elevation/containment.` }
    ])
  }

  // Manual input transmitter
  const handleTransmitMsg = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMsgText.trim()) return
    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0]
    setCommsFeed(prev => [
      ...prev,
      { time: timeStr, unit: 'COCKPIT-CMD', msg: newMsgText.toUpperCase() }
    ])
    setNewMsgText('')
  }

  // Dynamic sorting of Action Stack (Critical Severity first, then recency)
  const sortedIncidents = useMemo(() => {
    return [...incidents].sort((a, b) => {
      if (a.severity === 'Critical' && b.severity !== 'Critical') return -1
      if (a.severity !== 'Critical' && b.severity === 'Critical') return 1
      return b.id - a.id // Recency fallback
    })
  }, [incidents])

  // PiP Drag controls
  const dragStartPos = useRef({ x: 0, y: 0 })
  const handlePiPDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    dragStartPos.current = { x: e.clientX - pipPos.x, y: e.clientY - pipPos.y }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPipPos({
        x: Math.max(0, Math.min(80, moveEvent.clientX - dragStartPos.current.x)),
        y: Math.max(0, Math.min(80, moveEvent.clientY - dragStartPos.current.y))
      })
    }
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  // PiP Resize controls
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startWidth = pipSize.width
    const startHeight = pipSize.height
    const startX = e.clientX
    const startY = e.clientY
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      setPipSize({
        width: Math.max(200, Math.min(500, startWidth + (moveEvent.clientX - startX))),
        height: Math.max(120, Math.min(350, startHeight + (moveEvent.clientY - startY)))
      })
    }
    
    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className="w-full h-screen bg-[#001e2b] text-white flex flex-col overflow-hidden font-sans select-none antialiased">
      
      {/* 1. THE COMMAND HEADER (Top 5% height - approx 48px) */}
      <header className="h-[48px] bg-[#00141d] border-b border-[#1c2d38] flex items-center justify-between px-4 z-40 relative">
        {/* Left: System Status & Encryption */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#001e2b]/80 border border-[#1c2d38] px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#00ed64] animate-pulse"></span>
            COMMS: <span className="text-[#00ed64]">ONLINE</span>
          </div>
          
          <div className="flex items-center gap-1 bg-[#001e2b]/80 border border-[#1c2d38] px-2.5 py-1 rounded-full text-[10px] font-mono">
            <Lock className="w-3 h-3 text-[#00ed64]" />
            <span className="text-slate-350">AES-256</span>
          </div>
        </div>

        {/* Center: Global Operations Clock (UTC & Local) */}
        <div className="flex items-center gap-4 text-center">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-xs font-bold tracking-wider text-white bg-[#001017] px-2 py-0.5 rounded border border-[#1c2d38]">
              {utcTime || '00:00:00 UTC'}
            </span>
            <span className="font-mono text-[10px] font-medium text-slate-400">
              {localTime || '00:00:00 LCL'}
            </span>
          </div>
        </div>

        {/* Right: Profile & Quick Settings */}
        <div className="flex items-center gap-3">
          {/* Security Banner Button */}
          <button 
            onClick={() => setSystemSecurityAlert(!systemSecurityAlert)}
            className={`flex items-center gap-1 text-[9px] font-mono px-2 py-0.5 rounded-full border transition-all ${
              systemSecurityAlert 
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-[#001e2b] border-[#1c2d38] text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-2.5 h-2.5" />
            SEC: {systemSecurityAlert ? 'WARNING' : 'SECURE'}
          </button>

          <div className="h-4 w-px bg-[#1c2d38]"></div>

          <button 
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="p-1 rounded bg-[#001e2b] border border-[#1c2d38] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Cockpit Configuration"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-6.5 h-6.5 rounded-full bg-[#00684a] border border-[#00ed64]/30 flex items-center justify-center font-bold text-[10px] text-[#00ed64] uppercase">
              CO
            </div>
            <span className="hidden md:inline text-[10px] font-mono text-slate-350 tracking-wider">COMMANDER</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-grow flex flex-col lg:flex-row items-stretch w-full h-[calc(100vh-48px)] overflow-hidden relative">
        
        {/* Tactical Status Alerts Banner Overlay */}
        {systemSecurityAlert && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg">
            <div className="bg-red-950/90 border-2 border-red-500 rounded p-2.5 flex items-center gap-3 shadow-2xl backdrop-blur-md">
              <ShieldAlert className="w-5 h-5 text-red-400 animate-bounce shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-mono font-bold text-red-300 uppercase leading-none">AI Threat Inundation Vector alert</p>
                <p className="text-[9px] font-sans text-slate-300 mt-1">NASA Satellites report wind shear acceleration in Yosemite corridor. Adjust wildfire spread model.</p>
              </div>
              <button 
                onClick={() => setSystemSecurityAlert(false)}
                className="text-[9px] font-mono bg-red-800 text-white px-2 py-0.5 rounded ml-auto"
              >
                ACK
              </button>
            </div>
          </div>
        )}

        {/* 2. TACTICAL MAP CENTERPIECE (Center 65% width) */}
        <section className="flex-grow relative h-2/3 lg:h-full lg:w-[65%] border-b lg:border-b-0 lg:border-r border-[#1c2d38] flex flex-col bg-[#001721] overflow-hidden">
          
          {/* Layer Control Sidebar (Far Left - Floating overlay over map) */}
          <div className="absolute left-2.5 top-2.5 z-30 group h-[calc(100%-20px)] select-none">
            <div className="bg-[#001017]/95 border border-[#1c2d38] rounded-lg p-2.5 flex flex-col gap-4 shadow-2xl h-full backdrop-blur-md transition-all duration-300 w-11 overflow-hidden group-hover:w-52 group-hover:p-3.5">
              
              {/* Header Icon */}
              <div className="flex items-center gap-3 border-b border-[#1c2d38]/50 pb-2 text-cyan-400 shrink-0">
                <Layers className="w-4.5 h-4.5" />
                <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-white hidden group-hover:inline opacity-0 group-hover:opacity-100 transition-opacity">
                  MAP LAYERS
                </span>
              </div>

              {/* Toggles list */}
              <div className="flex-grow flex flex-col gap-3.5 mt-2">
                {[
                  { id: 'topography', label: 'Topography Plane', desc: 'OSM Topo Terrain' },
                  { id: 'geofence', label: 'Sector Geofencing', desc: 'Active zones bounding borders' },
                  { id: 'predictive', label: 'Predictive Overlays', desc: 'Cone & Plume models' },
                  { id: 'assets', label: 'Unit GPS Tracking', desc: 'Pulse deployed vs reserve' },
                  { id: 'radar', label: 'Live Weather Doppler', desc: 'Bay area radar scan' },
                  { id: 'wind', label: 'Wind Direction Vectors', desc: 'Yosemite wind arrows' }
                ].map(layer => {
                  const isActive = activeLayers.includes(layer.id)
                  return (
                    <button
                      key={layer.id}
                      onClick={() => handleToggleLayer(layer.id)}
                      className={`flex items-start gap-3 text-left w-full rounded p-1.5 transition-all text-xs border ${
                        isActive 
                          ? 'bg-[#00ed64]/10 border-[#00ed64]/40 text-[#00ed64]' 
                          : 'bg-[#001e2b] border-[#1c2d38] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center ${isActive ? 'bg-[#00ed64] border-[#00ed64]' : 'border-slate-500'}`}>
                        {isActive && <CheckCircle className="w-3 h-3 text-[#001e2b]" />}
                      </div>
                      <div className="hidden group-hover:flex flex-col gap-0.5 leading-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="font-mono text-[9px] font-bold uppercase">{layer.label}</span>
                        <span className="text-[8px] text-slate-500 mt-0.5 truncate">{layer.desc}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Status bar */}
              <div className="mt-auto pt-2 border-t border-[#1c2d38]/50 text-left hidden group-hover:block font-mono text-[8px] text-slate-500">
                ACTIVE PIPES: {activeLayers.length}/6
              </div>
            </div>
          </div>

          {/* Map canvas element container */}
          <div className="w-full h-full relative overflow-hidden">
            <div 
              ref={mapContainerRef} 
              className="w-full h-full"
            />
            
            {/* Dark operations HUD color filter wrapper style */}
            <style>{`
              .maplibregl-canvas {
                filter: invert(0.9) hue-rotate(180deg) brightness-0.7 saturate-0.9 contrast-1.15 !important;
                background-color: #001e2b !important;
              }
              .maplibregl-ctrl-attrib {
                display: none !important;
              }
              
              /* Custom styles for GPS markers & popup */
              .custom-cockpit-popup .maplibregl-popup-content {
                background-color: #001e2b !important;
                color: #ffffff !important;
                border: 1px solid #1c2d38 !important;
                border-radius: 8px !important;
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.6) !important;
                padding: 0 !important;
              }
              .custom-cockpit-popup .maplibregl-popup-tip {
                border-top-color: #001e2b !important;
                border-bottom-color: #001e2b !important;
              }
            `}</style>

            {/* Simulated Live Wind vectors overlays (Only visible if Wind layer toggle active) */}
            {activeLayers.includes('wind') && (
              <div className="absolute inset-0 pointer-events-none select-none z-10">
                {/* Wind arrow 1 near SF */}
                <div className="absolute top-[30%] left-[25%] flex items-center gap-1.5 bg-[#001017]/70 border border-[#1c2d38]/40 px-1.5 py-0.5 rounded text-[8px] font-mono text-cyan-400">
                  <Compass className="w-3.5 h-3.5 rotate-[120deg]" />
                  <span>WNW @ 12KT</span>
                </div>
                {/* Wind arrow 2 near Yosemite */}
                <div className="absolute top-[45%] left-[80%] flex items-center gap-1.5 bg-[#001017]/70 border border-[#1c2d38]/40 px-1.5 py-0.5 rounded text-[8px] font-mono text-[#fa6e39]">
                  <Compass className="w-3.5 h-3.5 rotate-[225deg]" />
                  <span>ENE @ 22KT</span>
                </div>
                {/* Wind arrow 3 near San Jose */}
                <div className="absolute top-[65%] left-[40%] flex items-center gap-1.5 bg-[#001017]/70 border border-[#1c2d38]/40 px-1.5 py-0.5 rounded text-[8px] font-mono text-[#7b3ff2]">
                  <Compass className="w-3.5 h-3.5 rotate-[180deg]" />
                  <span>NNE @ 15KT</span>
                </div>
                {/* Wind arrow 4 near Central Valley */}
                <div className="absolute top-[20%] left-[60%] flex items-center gap-1.5 bg-[#001017]/70 border border-[#1c2d38]/40 px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-400">
                  <Compass className="w-3.5 h-3.5 rotate-[90deg]" />
                  <span>NW @ 8KT</span>
                </div>
              </div>
            )}

            {/* Draggable & Resizable Picture-in-Picture Drone feed */}
            {pipCam.open && (
              <div 
                style={{ 
                  left: `${pipPos.x}%`, 
                  top: `${pipPos.y}%`, 
                  width: isPipMinimized ? '200px' : `${pipSize.width}px`, 
                  height: isPipMinimized ? '34px' : `${pipSize.height}px` 
                }}
                className={`absolute z-35 bg-[#001017]/95 border-2 border-[#1c2d38] rounded-lg overflow-hidden shadow-2xl flex flex-col backdrop-blur-md transition-all duration-100 ${
                  isPipMinimized ? 'shadow-lg border-[#00ed64]/30' : ''
                }`}
              >
                {/* PiP Header (Drag Handle) */}
                <div 
                  onMouseDown={handlePiPDragStart}
                  className="bg-[#00141d] px-2.5 py-1.5 flex items-center justify-between cursor-move select-none shrink-0 border-b border-[#1c2d38]"
                >
                  <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-white truncate max-w-[120px]">{pipCam.source}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => setIsPipMinimized(!isPipMinimized)} 
                      className="p-0.5 text-slate-400 hover:text-white transition-colors"
                      title={isPipMinimized ? 'Restore Stream' : 'Minimize Stream'}
                    >
                      <Maximize2 className="w-2.5 h-2.5" />
                    </button>
                    <button 
                      onClick={() => setPipCam(prev => ({ ...prev, open: false }))} 
                      className="text-xs leading-none text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* PiP Stream Content (Hidden when minimized) */}
                {!isPipMinimized && (
                  <div className="flex-grow relative bg-black/60 overflow-hidden select-none">
                    
                    {/* Simulated drone video graphic stream */}
                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-2 font-mono text-[8px] text-[#00ed64]/80">
                      
                      {/* Top HUD bar */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div>CAM SOURCE: [ACTIVE]</div>
                          <div>BATTERY: {pipCam.battery}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-red-400 font-bold">● REC LIVE</div>
                          <div>ALT: {pipCam.alt}</div>
                        </div>
                      </div>
                      
                      {/* Center Crosshair */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-40">
                        <div className="w-6 h-px bg-[#00ed64]"></div>
                        <div className="h-6 w-px bg-[#00ed64]"></div>
                        <div className="border border-[#00ed64] w-12 h-12 rounded-full absolute"></div>
                      </div>
                      
                      {/* Bottom HUD bar */}
                      <div className="flex justify-between items-end">
                        <div>
                          <div>COORDS: {pipCam.coords}</div>
                          <div>TELEMETRY: OPTIMAL</div>
                        </div>
                        <div className="text-right">
                          <div>PITCH: +1.24°</div>
                          <div>YAW: -89.4°</div>
                        </div>
                      </div>
                    </div>

                    {/* Drifting interference lines */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.04] to-transparent bg-[length:100%_4px] animate-[pulse_1.5s_infinite] pointer-events-none z-10"></div>

                    {/* Camera stream source visualization (animated styled canvasses) */}
                    {pipCam.videoStream === 'wildfire' && (
                      <div className="w-full h-full bg-[#fa6e39]/10 flex flex-col items-center justify-center relative">
                        {/* Simulated smoke clusters */}
                        <span className="absolute w-24 h-16 bg-[#fa6e39]/20 blur-xl rounded-full animate-pulse top-4 left-6"></span>
                        <span className="absolute w-32 h-10 bg-orange-700/10 blur-xl rounded-full bottom-2 right-8"></span>
                        <div className="text-[#fa6e39] font-bold font-mono text-[10px] animate-pulse">THERMAL IR CAMERA ACTIVE</div>
                        <div className="text-white/60 font-mono text-[8px] mt-1">SECTOR 4-ALPHA SMOKE OVERLAY</div>
                      </div>
                    )}

                    {pipCam.videoStream === 'hazmat' && (
                      <div className="w-full h-full bg-[#7b3ff2]/10 flex flex-col items-center justify-center relative">
                        <span className="absolute w-28 h-20 bg-[#7b3ff2]/20 blur-2xl rounded-full animate-pulse top-2 right-4"></span>
                        <div className="text-[#7b3ff2] font-bold font-mono text-[10px] animate-pulse">PLUME SCATTER PLOT ACTIVE</div>
                        <div className="text-white/60 font-mono text-[8px] mt-1">HAZMAT SPILL DETECTOR SYNCED</div>
                      </div>
                    )}

                    {pipCam.videoStream === 'flood' && (
                      <div className="w-full h-full bg-blue-950/40 flex flex-col items-center justify-center relative">
                        <span className="absolute w-40 h-12 bg-[#3d4f9f]/30 blur-2xl rounded-full animate-pulse bottom-4 left-2"></span>
                        <div className="text-[#3d4f9f] font-bold font-mono text-[10px] animate-pulse">HIGH WATER RADAR IMAGERY</div>
                        <div className="text-white/60 font-mono text-[8px] mt-1">COASTAL BLOCK 12 FLOOD OVERLAY</div>
                      </div>
                    )}

                    {/* Resize handle at bottom-right corner */}
                    <div 
                      onMouseDown={handleResizeStart}
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 cursor-se-resize bg-[#1c2d38] border-t border-l border-[#1c2d38] z-20 flex items-end justify-end p-0.5 text-[6px] text-slate-500 hover:text-white"
                      title="Drag to resize feed"
                    >
                      ◢
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick alert badge bottom map status */}
            <div className="absolute bottom-3 right-3 z-10 bg-[#001017]/95 border border-[#1c2d38] px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2 font-mono text-[9px] text-[#a8b3bc]">
              <span className="w-2 h-2 rounded-full bg-[#00ed64] animate-pulse"></span>
              GRID SYNCED: 3 ACTIVE REGIONAL THREATS
            </div>

            {/* Active resource filter badge indication */}
            {selectedResourceFilter && (
              <div className="absolute top-3 right-3 z-10 bg-[#00ed64]/10 border border-[#00ed64] text-[#00ed64] px-2.5 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2 font-mono text-[9px]">
                <Filter className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                <span>FILTERING: ONLY AVAILABLE {selectedResourceFilter.toUpperCase()} ASSETS DISPATCH SYNCED</span>
                <button 
                  onClick={() => setSelectedResourceFilter(null)} 
                  className="bg-[#00ed64] text-[#001e2b] rounded-full px-1.5 font-bold hover:bg-white transition-colors ml-1"
                >
                  CLEAR
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 3. ACTIVE INCIDENT QUEUE & RESOURCE COCKPIT LOG (Right 35% width) */}
        <section className="lg:w-[35%] h-full flex flex-col bg-[#00141d] overflow-hidden">
          
          {/* Top Panel: Active Incident Queue (55% Height) */}
          <div className="h-[55%] border-b border-[#1c2d38] flex flex-col overflow-hidden">
            <div className="bg-[#001017] border-b border-[#1c2d38] px-3.5 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                <span className="font-mono text-[10px] font-bold text-white tracking-widest uppercase">
                  Active Incident Queue
                </span>
              </div>
              <span className="font-mono text-[8px] bg-red-950/80 border border-red-800 text-red-400 font-bold px-2 py-0.5 rounded">
                {incidents.length} EVENTS DEPLOYED
              </span>
            </div>

            {/* Action Stack scroll list */}
            <div className="flex-grow overflow-y-auto p-3 flex flex-col gap-3">
              {sortedIncidents.map(inc => {
                const isExpanded = expandedIncidentId === inc.id
                return (
                  <div 
                    key={inc.id}
                    className={`rounded-lg bg-[#001017] border border-[#1c2d38] ${inc.borderColor} transition-all duration-200 group relative overflow-hidden`}
                  >
                    {/* Hover actions panel overlay */}
                    <div className="absolute right-2.5 top-2.5 z-20 hidden group-hover:flex items-center gap-1.5 transition-all">
                      <button 
                        onClick={() => handleSetPiPFeed(inc.key as any)}
                        className="bg-[#001e2b] hover:bg-[#00ed64] border border-[#1c2d38] hover:border-[#00ed64] text-slate-350 hover:text-[#001e2b] p-1.5 rounded transition-all flex items-center justify-center cursor-pointer"
                        title="Link drone camera feed"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleBroadcastAlert(inc.title)}
                        className="bg-[#001e2b] hover:bg-amber-400 border border-[#1c2d38] hover:border-amber-400 text-slate-350 hover:text-black p-1.5 rounded transition-all flex items-center justify-center cursor-pointer"
                        title="Broadcast emergency alert"
                      >
                        <Radio className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDispatchAction(inc.title, inc.key)}
                        className="bg-[#00ed64] text-[#001e2b] font-mono text-[8px] font-bold px-2 py-1.5 rounded hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
                        title="Dispatch additional assets"
                      >
                        <Send className="w-2.5 h-2.5" />
                        <span>DISPATCH</span>
                      </button>
                    </div>

                    {/* Primary Card View */}
                    <div 
                      onClick={() => handleFocusIncident(inc)}
                      className="p-3 cursor-pointer select-none text-left"
                    >
                      <div className="flex justify-between items-center gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <inc.icon className={`w-4 h-4 shrink-0 ${inc.id === 3 ? 'text-cyan-400' : 'text-red-400'}`} />
                          <h3 className="text-xs font-bold text-white leading-none tracking-tight">{inc.title}</h3>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <span className={`font-mono text-[8px] font-bold px-2 py-0.5 rounded border ${
                          inc.severity === 'Critical' 
                            ? 'bg-red-950/60 border-red-800 text-red-400' 
                            : 'bg-amber-950/60 border-amber-800 text-amber-400'
                        }`}>
                          {inc.severity.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 mb-2.5">
                        <span>{inc.sector}</span>
                        <span>{inc.time}</span>
                      </div>

                      {/* Sparkline & Status */}
                      <div className="flex items-center justify-between border-t border-[#1c2d38]/40 pt-2.5">
                        <div className="flex items-center gap-1.5 font-mono text-[8px] text-[#00ed64] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00ed64] animate-pulse"></span>
                          {inc.status}
                        </div>
                        
                        {/* Trend sparkline svg */}
                        <div className="flex items-center gap-2">
                          <span className="text-[7.5px] font-mono text-slate-500 uppercase">Trend:</span>
                          <svg className="w-16 h-4" viewBox="0 0 70 20">
                            <defs>
                              <linearGradient id={`grad-${inc.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={inc.id === 3 ? '#00ed64' : '#fa6e39'} stopOpacity="0.3" />
                                <stop offset="100%" stopColor={inc.id === 3 ? '#00ed64' : '#fa6e39'} stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path 
                              d={`M 0 ${20 - inc.sparkline[0]/5} L 10 ${20 - inc.sparkline[1]/5} L 20 ${20 - inc.sparkline[2]/5} L 30 ${20 - inc.sparkline[3]/5} L 40 ${20 - inc.sparkline[4]/5} L 50 ${20 - inc.sparkline[5]/5} L 60 ${20 - inc.sparkline[6]/5}`} 
                              fill="none" 
                              stroke={inc.id === 3 ? '#00ed64' : '#fa6e39'} 
                              strokeWidth="1.8"
                            />
                            <path 
                              d={`M 0 20 L 0 ${20 - inc.sparkline[0]/5} L 10 ${20 - inc.sparkline[1]/5} L 20 ${20 - inc.sparkline[2]/5} L 30 ${20 - inc.sparkline[3]/5} L 40 ${20 - inc.sparkline[4]/5} L 50 ${20 - inc.sparkline[5]/5} L 60 ${20 - inc.sparkline[6]/5} L 60 20 Z`} 
                              fill={`url(#grad-${inc.id})`}
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Deeper Resource Allocation details */}
                    {isExpanded && (
                      <div className="bg-[#00141d]/75 border-t border-[#1c2d38] p-3 text-left font-mono text-[9px] text-slate-300 leading-normal flex flex-col gap-2.5">
                        <div>
                          <span className="text-[#a8b3bc] font-bold">COORDINATES:</span> 
                          <span className="text-white ml-1.5">{inc.coords[1].toFixed(4)}° N, {inc.coords[0].toFixed(4)}° W</span>
                        </div>
                        <div>
                          <span className="text-[#a8b3bc] font-bold">DESCRIPTION:</span>
                          <p className="text-slate-350 font-sans text-[9px] mt-1 tracking-wide">{inc.description}</p>
                        </div>
                        <div className="border-t border-[#1c2d38]/30 pt-2 mt-1">
                          <span className="text-[#a8b3bc] font-bold">ASSIGNED ASSETS:</span>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {inc.assignedResources.split(', ').map((res, i) => (
                              <span key={i} className="bg-[#001e2b] border border-[#1c2d38] px-2 py-0.5 rounded text-[8px] text-white">
                                {res}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom Panel: Resource Telemetry & Comms Log (45% Height) */}
          <div className="h-[45%] flex flex-col overflow-hidden">
            
            {/* Header / Tabs */}
            <div className="bg-[#001017] border-b border-[#1c2d38] px-3.5 py-1.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] font-bold text-white tracking-widest uppercase">
                  Cockpit Telemetry Log
                </span>
              </div>
              
              {/* Comms AI Summary Toggle */}
              <button 
                onClick={() => setAiSummaryOpen(!aiSummaryOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[8px] font-mono font-bold tracking-wider border cursor-pointer transition-all ${
                  aiSummaryOpen 
                    ? 'bg-[#00ed64]/10 border-[#00ed64]/40 text-[#00ed64]' 
                    : 'bg-[#001e2b] border-[#1c2d38] text-slate-400 hover:text-white'
                }`}
              >
                <Brain className="w-3 h-3 text-[#00ed64]" />
                SUMMARY: {aiSummaryOpen ? 'ACTIVE' : 'RAW'}
              </button>
            </div>

            {/* Split bottom panel internally */}
            <div className="flex-grow flex flex-col md:flex-row items-stretch overflow-hidden">
              
              {/* Left Column: Stacked Resource Readiness Telemetry */}
              <div className="md:w-[48%] border-b md:border-b-0 md:border-r border-[#1c2d38] p-3 flex flex-col justify-between overflow-y-auto bg-[#00121a]">
                <div className="text-left font-mono text-[9px] text-[#a8b3bc] border-b border-[#1c2d38]/50 pb-1 mb-2 font-bold uppercase select-none flex items-center justify-between">
                  <span>Resource Readiness</span>
                  <span className="text-[7.5px] text-slate-500 font-normal">Click category to track</span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* AIR */}
                  <div 
                    onClick={() => setSelectedResourceFilter(selectedResourceFilter === 'air' ? null : 'air')}
                    className={`p-1.5 rounded cursor-pointer transition-all border ${
                      selectedResourceFilter === 'air' 
                        ? 'bg-[#00ed64]/5 border-[#00ed64]/45 text-white' 
                        : 'border-transparent hover:bg-[#001017]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono mb-1 leading-none select-none">
                      <span className="font-bold flex items-center gap-1.5">
                        <Tv className="w-3 h-3 text-[#00ed64]" />
                        Air Assets
                      </span>
                      <span>{airDeployed} deployed / 4 reserve</span>
                    </div>
                    {/* Stacked Progress Bar (Deployed: Red, Available: Green) */}
                    <div className="w-full h-1.5 bg-[#001e2b] rounded-full overflow-hidden flex">
                      <div className="h-full bg-red-500/80" style={{ width: '66%' }} title="Deployed (66%)"></div>
                      <div className="h-full bg-[#00ed64]" style={{ width: '34%' }} title="Available (34%)"></div>
                    </div>
                  </div>

                  {/* GROUND */}
                  <div 
                    onClick={() => setSelectedResourceFilter(selectedResourceFilter === 'ground' ? null : 'ground')}
                    className={`p-1.5 rounded cursor-pointer transition-all border ${
                      selectedResourceFilter === 'ground' 
                        ? 'bg-[#00ed64]/5 border-[#00ed64]/45 text-white' 
                        : 'border-transparent hover:bg-[#001017]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono mb-1 leading-none select-none">
                      <span className="font-bold flex items-center gap-1.5">
                        <Truck className="w-3 h-3 text-cyan-400" />
                        Ground Transport
                      </span>
                      <span>{groundDeployed} deployed / 13 reserve</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#001e2b] rounded-full overflow-hidden flex">
                      <div className="h-full bg-cyan-600" style={{ width: '71%' }}></div>
                      <div className="h-full bg-[#00ed64]" style={{ width: '29%' }}></div>
                    </div>
                  </div>

                  {/* PERSONNEL */}
                  <div 
                    onClick={() => setSelectedResourceFilter(selectedResourceFilter === 'personnel' ? null : 'personnel')}
                    className={`p-1.5 rounded cursor-pointer transition-all border ${
                      selectedResourceFilter === 'personnel' 
                        ? 'bg-[#00ed64]/5 border-[#00ed64]/45 text-white' 
                        : 'border-transparent hover:bg-[#001017]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono mb-1 leading-none select-none">
                      <span className="font-bold flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-[#fa6e39]" />
                        Personnel crews
                      </span>
                      <span>{personnelDeployed} deployed / 58 reserve</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#001e2b] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#fa6e39]" style={{ width: '71%' }}></div>
                      <div className="h-full bg-[#00ed64]" style={{ width: '29%' }}></div>
                    </div>
                  </div>

                  {/* MEDICAL */}
                  <div 
                    onClick={() => setSelectedResourceFilter(selectedResourceFilter === 'medical' ? null : 'medical')}
                    className={`p-1.5 rounded cursor-pointer transition-all border ${
                      selectedResourceFilter === 'medical' 
                        ? 'bg-[#00ed64]/5 border-[#00ed64]/45 text-white' 
                        : 'border-transparent hover:bg-[#001017]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-mono mb-1 leading-none select-none">
                      <span className="font-bold flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-[#7b3ff2]" />
                        Station capacity
                      </span>
                      <span>85% active / 15% reserve</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#001e2b] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#7b3ff2]" style={{ width: '85%' }}></div>
                      <div className="h-full bg-[#00ed64]" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#1c2d38]/30 font-mono text-[7.5px] text-slate-500 leading-normal select-none">
                  DEPLOYED PERSONNEL METRICS: {personnelDeployed} ACTIVE RESPONSE MEMBERS STAGED REGIONALLY.
                </div>
              </div>

              {/* Right Column: Live Scrolling Tactical Comms Log OR AI Summary */}
              <div className="flex-grow flex flex-col overflow-hidden bg-[#000d14] relative">
                
                {/* AI generated summary overlay panel */}
                {aiSummaryOpen ? (
                  <div className="absolute inset-0 z-20 bg-[#001017]/95 p-3 font-mono text-[9px] text-slate-350 leading-relaxed overflow-y-auto text-left">
                    <div className="text-cyan-400 font-bold border-b border-[#1c2d38]/50 pb-1 mb-2 uppercase flex items-center gap-1">
                      <Brain className="w-3.5 h-3.5 text-[#00ed64] shrink-0" />
                      Situation Summary (Last 5 mins)
                    </div>
                    <ul className="list-disc pl-3.5 flex flex-col gap-1.5 font-sans text-[8.5px] tracking-wide text-slate-300">
                      <li>
                        <strong className="text-[#fa6e39] font-mono text-[8px] font-bold">[WILDFIRE]</strong> Spread model reports rapid timber propagation towards NE Yosemite corridor. Helo deployment authorized for immediate fire-break cuts.
                      </li>
                      <li>
                        <strong className="text-[#7b3ff2] font-mono text-[8px] font-bold">[HAZMAT]</strong> Hydrofluoric chemical tank breach secured at Industrial zone coordinates. Vapor plume continues drifting south towards unpopulated basin.
                      </li>
                      <li>
                        <strong className="text-[#3d4f9f] font-mono text-[8px] font-bold">[FLOOD]</strong> Coastal route 12 flood levels stabilized. Highway blocks and pumping units deployed near bay routes. Risk downgraded.
                      </li>
                      <li>
                        <strong className="text-[#00ed64] font-mono text-[8px] font-bold">[RESOURCES]</strong> {airDeployed} helicopters active, 4 available and mapped. Ground logistics staged at central Modesto/SF hubs.
                      </li>
                    </ul>
                  </div>
                ) : null}

                {/* Comms Terminal Text Stream */}
                <div className="flex-grow overflow-y-auto p-3 flex flex-col gap-1.5 font-mono text-[8.5px] text-[#a8b3bc] text-left">
                  {commsFeed.map((comm, idx) => (
                    <div key={idx} className="leading-normal border-b border-[#1c2d38]/10 pb-1">
                      <span className="text-cyan-400 select-none">[{comm.time}]</span> 
                      <span className="text-[#00ed64] font-bold ml-1.5 select-none">{comm.unit}:</span> 
                      <span className="text-white ml-1.5 font-medium">{comm.msg}</span>
                    </div>
                  ))}
                  <div ref={commsEndRef} />
                </div>

                {/* Terminal Quick Transmitter Form */}
                <form onSubmit={handleTransmitMsg} className="h-8 border-t border-[#1c2d38] flex items-center bg-[#001017] shrink-0">
                  <div className="px-2 font-mono text-[8.5px] text-[#00ed64] select-none border-r border-[#1c2d38] h-full flex items-center shrink-0">
                    TX RADIO &gt;
                  </div>
                  <input 
                    type="text"
                    value={newMsgText}
                    onChange={(e) => setNewMsgText(e.target.value)}
                    placeholder="Broadcast text message to cockpit log..."
                    className="flex-grow bg-transparent border-none outline-none font-mono text-[9px] text-white px-2.5 h-full placeholder-slate-600 focus:placeholder-slate-400 focus:bg-white/[0.01] transition-all"
                  />
                </form>
              </div>

            </div>
          </div>

        </section>

      </div>

      {/* Global Config Settings Overlay Drawer */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#001721] border border-[#1c2d38] rounded-xl p-5 w-full max-w-md shadow-2xl text-left font-mono text-xs">
            <h4 className="text-sm font-bold text-white mb-3 border-b border-[#1c2d38] pb-2 uppercase flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-cyan-400" />
              Operations System Configuration
            </h4>
            
            <div className="flex flex-col gap-3 text-slate-300">
              <div className="flex justify-between items-center py-1.5 border-b border-[#1c2d38]/50">
                <span>AES-256 Link Encryption:</span>
                <span className="text-[#00ed64] font-bold">ACTIVE / ENCRYPTED</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1c2d38]/50">
                <span>Grid GPS Refresh Rate:</span>
                <span className="text-cyan-400 font-bold">1000ms / LIVE</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1c2d38]/50">
                <span>Simulated Radio Traffic:</span>
                <span className="text-[#00ed64] font-bold">ENABLED (11s)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-[#1c2d38]/50">
                <span>Gemini Predictive Engine:</span>
                <span className="text-cyan-400 font-bold">ONLINE / AUTONOMOUS</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span>Active Coordinates Datum:</span>
                <span>WGS 84 / UTM ZONE 10N</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5 justify-end">
              <button 
                onClick={() => setIsConfigOpen(false)}
                className="bg-[#00ed64] text-[#001e2b] font-bold px-4 py-2 rounded-full text-[10px] hover:bg-white transition-all cursor-pointer"
              >
                CLOSE CONFIG
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
