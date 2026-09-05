/**
 * ClimateMap Configuration & Settings for WeatherGPT
 * Optimized for mid-range mobile & desktop performance (60fps target)
 */

export interface MapboxTokenConfig {
  token: string
  isPlaceholder: boolean
}

/**
 * Retrieves the Mapbox access token from environment variables.
 * Prioritizes public tokens (pk.*) over secret tokens (sk.*), as Mapbox GL JS
 * strictly requires public tokens in browser clients.
 */
export function getMapboxToken(): string {
  const candidates = [
    import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN,
    import.meta.env.MAPBOX_PUBLIC_TOKEN,
    import.meta.env.VITE_MAPBOX_TOKEN,
    import.meta.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    import.meta.env.MAPBOX_API_KEY
  ]

  // 1. Look for a valid public token (starts with pk.)
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().startsWith('pk.')) {
      return candidate.trim()
    }
  }

  // 2. Fallback to any non-empty candidate (will be validated before map init)
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim()
    }
  }

  return ''
}

/** All-India geographic center & default viewpoint */
export const INDIA_MAP_CENTER: [number, number] = [78.9629, 22.5937]
export const DEFAULT_ZOOM = 4.6
export const MIN_ZOOM = 3.2
export const MAX_ZOOM = 14.0

/** Bounding box strictly framing the Indian subcontinent & maritime cyclone basins */
export const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [58.0, 3.5], // Southwest [lng, lat] (Arabian Sea / Lakshadweep)
  [100.5, 38.5] // Northeast [lng, lat] (Bay of Bengal / Himalayas / Arunachal)
]

/** Mapbox basemap styles matching WeatherGPT's dark/light design system */
export const MAP_STYLES = {
  dark: {
    id: 'dark',
    name: 'Dark Obsidian (Default)',
    url: 'mapbox://styles/mapbox/dark-v11',
    accentColor: '#00ed64',
    bg: '#0a0a0a'
  },
  light: {
    id: 'light',
    name: 'Clean Light GIS',
    url: 'mapbox://styles/mapbox/light-v11',
    accentColor: '#00a35c',
    bg: '#ffffff'
  },
  satellite: {
    id: 'satellite',
    name: 'Satellite Weather',
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    accentColor: '#00ed64',
    bg: '#000000'
  }
} as const

export type MapStyleKey = keyof typeof MAP_STYLES

/**
 * Performance-tuned options for mapboxgl.Map instantiation.
 * Strips heavy GPU operations (antialias false, preserves buffer false, disables pitch)
 */
export const PERFORMANCE_MAP_OPTIONS = {
  antialias: false, // Low GPU overhead
  preserveDrawingBuffer: false, // Eliminates canvas buffer retention
  dragRotate: false, // Disables 3D rotation listener churn
  pitchWithRotate: false, // Disables pitch listener churn
  touchPitch: false, // Disables 2-finger pitch on mobile
  touchZoomRotate: true, // Fluid pinch zoom for mobile touch
  doubleClickZoom: true,
  trackResize: true,
  cooperativeGestures: false,
  maxBounds: INDIA_BOUNDS,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM
}

/** Pre-set regional locations for fast 1200ms flyTo navigation */
export const DISASTER_HOTSPOTS = [
  {
    id: 'cyclone-bay-bengal',
    name: 'Bay of Bengal Cyclone',
    region: 'Coastal Odisha & Andhra',
    center: [86.82, 19.82] as [number, number],
    zoom: 6.8,
    category: 'Cyclone',
    badgeColor: '#ef4444'
  },
  {
    id: 'flood-assam-barak',
    name: 'Barak Valley Inundation',
    region: 'Assam & Barak Basin',
    center: [92.85, 24.82] as [number, number],
    zoom: 7.6,
    category: 'Flood',
    badgeColor: '#3b82f6'
  },
  {
    id: 'heatwave-rajasthan',
    name: 'Thar Severe Heatwave',
    region: 'West Rajasthan & Vidarbha',
    center: [72.2, 26.5] as [number, number],
    zoom: 6.5,
    category: 'Heatwave',
    badgeColor: '#f97316'
  },
  {
    id: 'monsoon-mumbai-konkan',
    name: 'Konkan Cloudburst Watch',
    region: 'Mumbai & Coastal Maharashtra',
    center: [72.87, 19.07] as [number, number],
    zoom: 8.2,
    category: 'Rainfall',
    badgeColor: '#00ed64'
  },
  {
    id: 'landslide-uttarakhand',
    name: 'Garhwal Hill Instability',
    region: 'Uttarakhand Foothills',
    center: [79.06, 30.37] as [number, number],
    zoom: 7.8,
    category: 'Landslide',
    badgeColor: '#eab308'
  },
  {
    id: 'earthquake-hindu-kush',
    name: 'Northern Arc Seismic Hotspot',
    region: 'Hindu Kush & Northern Border',
    center: [70.28, 36.47] as [number, number],
    zoom: 6.8,
    category: 'Earthquake',
    badgeColor: '#ff6b6b'
  },
  {
    id: 'earthquake-assam-kopili',
    name: 'Assam & Kopili Fault Sector',
    region: 'Northeast India Seismic Zone',
    center: [92.68, 26.85] as [number, number],
    zoom: 7.2,
    category: 'Earthquake',
    badgeColor: '#ff6b6b'
  },
  {
    id: 'earthquake-nepal-kodari',
    name: 'Nepal Kodāri M5.2 Epicenter',
    region: 'Nepal & Langtang Himalayan Arc',
    center: [85.90, 27.95] as [number, number],
    zoom: 7.8,
    category: 'Earthquake',
    badgeColor: '#ff6b6b'
  },
  {
    id: 'earthquake-joshimath-border',
    name: 'Joshīmath/Nepal Border M5.1',
    region: 'Uttarakhand & Nepal Border',
    center: [80.33, 31.36] as [number, number],
    zoom: 7.8,
    category: 'Earthquake',
    badgeColor: '#ff6b6b'
  }
]
