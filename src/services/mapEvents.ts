/**
 * WeatherGPT Chat ↔ ClimateMap Imperative Event Bus
 * Allows chat assistant, voice tools, and search bars to command the map
 * without incurring React re-render cycles in the map component.
 */

export const MAP_EVENTS = {
  FLY_TO: 'weathergpt:map-fly-to',
  HIGHLIGHT_REGION: 'weathergpt:map-highlight-region',
  TOGGLE_LAYER: 'weathergpt:map-toggle-layer',
  FILTER_ALERTS: 'weathergpt:map-filter-alerts',
  RESET_VIEW: 'weathergpt:map-reset-view'
} as const

export interface MapFlyToPayload {
  lng: number
  lat: number
  zoom?: number
  duration?: number // default 1200ms
}

export interface MapToggleLayerPayload {
  layerId: string
  visible: boolean
}

export interface MapFilterAlertsPayload {
  severity: string // 'all' | 'extreme' | 'severe' | 'moderate' | 'minor'
}

export function dispatchMapFlyTo(lng: number, lat: number, zoom = 7.5, duration = 1200): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<MapFlyToPayload>(MAP_EVENTS.FLY_TO, {
      detail: { lng, lat, zoom, duration }
    })
  )
}

export function dispatchMapHighlightRegion(geoJson: unknown): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(MAP_EVENTS.HIGHLIGHT_REGION, {
      detail: { geoJson }
    })
  )
}

export function dispatchMapToggleLayer(layerId: string, visible: boolean): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<MapToggleLayerPayload>(MAP_EVENTS.TOGGLE_LAYER, {
      detail: { layerId, visible }
    })
  )
}

export function dispatchMapFilterAlerts(severity: string): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<MapFilterAlertsPayload>(MAP_EVENTS.FILTER_ALERTS, {
      detail: { severity }
    })
  )
}

export function dispatchMapResetView(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(MAP_EVENTS.RESET_VIEW))
}

/** Pre-indexed geographic coordinates for India's key regions & disaster sectors */
export const REGIONAL_COORDINATES: Record<string, { center: [number, number]; zoom: number; label: string }> = {
  mumbai: { center: [72.8777, 19.0760], zoom: 8.5, label: 'Mumbai, Maharashtra' },
  konkan: { center: [73.2, 17.5], zoom: 7.8, label: 'Konkan Coast' },
  odisha: { center: [85.8245, 20.2961], zoom: 7.2, label: 'Odisha Coastal Sector' },
  delhi: { center: [77.2090, 28.6139], zoom: 8.5, label: 'Delhi NCR' },
  kolkata: { center: [88.3639, 22.5726], zoom: 8.5, label: 'Kolkata, West Bengal' },
  chennai: { center: [80.2707, 13.0827], zoom: 8.5, label: 'Chennai, Tamil Nadu' },
  bengaluru: { center: [77.5946, 12.9716], zoom: 8.5, label: 'Bengaluru, Karnataka' },
  bangalore: { center: [77.5946, 12.9716], zoom: 8.5, label: 'Bengaluru, Karnataka' },
  assam: { center: [92.85, 24.82], zoom: 7.5, label: 'Assam & Barak Valley' },
  barak: { center: [92.85, 24.82], zoom: 8.0, label: 'Barak Basin' },
  rajasthan: { center: [72.2, 26.5], zoom: 6.8, label: 'Western Rajasthan' },
  vidarbha: { center: [79.0882, 21.1458], zoom: 7.2, label: 'Vidarbha, Maharashtra' },
  kerala: { center: [76.2673, 9.9312], zoom: 8.0, label: 'Kerala Coast' },
  uttarakhand: { center: [79.06, 30.37], zoom: 7.8, label: 'Uttarakhand Foothills' },
  sikkim: { center: [88.6, 27.3], zoom: 8.0, label: 'Sikkim & Sub-Himalaya' },
  hyderabad: { center: [78.4867, 17.3850], zoom: 8.5, label: 'Hyderabad, Telangana' },
  jaipur: { center: [75.7873, 26.9124], zoom: 8.5, label: 'Jaipur, Rajasthan' },
  cyclone: { center: [86.82, 19.82], zoom: 6.8, label: 'Bay of Bengal Cyclone Track' },
  flood: { center: [92.85, 24.82], zoom: 7.5, label: 'Barak Valley Inundation' },
  earthquake: { center: [92.85, 26.50], zoom: 7.0, label: 'Northeast India Seismic Arc' },
  quake: { center: [92.85, 26.50], zoom: 7.0, label: 'Northeast India Seismic Arc' },
  seismic: { center: [92.85, 26.50], zoom: 7.0, label: 'Northeast India Seismic Arc' },
  kutch: { center: [70.20, 23.30], zoom: 7.8, label: 'Kutch Fault Zone, Gujarat' },
  nepal: { center: [85.50, 28.20], zoom: 7.5, label: 'Nepal & Himalayan Fault Arc' },
  kodari: { center: [85.90, 27.95], zoom: 8.5, label: 'Kodāri & Langtang Epicenter, Nepal' },
  langtang: { center: [85.50, 28.20], zoom: 8.5, label: 'Langtang Lirung Seismic Sector, Nepal' },
  joshimath: { center: [80.33, 31.36], zoom: 8.0, label: 'Joshīmath & Nepal Border Epicenter' }
}

let navDebounceTimer: ReturnType<typeof setTimeout> | null = null

/**
 * Parses user text or AI output for regional indicators and triggers a smooth 1200ms flyTo,
 * debounced at 180ms to avoid thrashing during rapid streaming or tool-calling.
 * Also automatically toggles the live 'usgs-quakes' layer when earthquake queries are detected.
 */
export function triggerMapNavigationFromText(text: string): boolean {
  const lower = text.toLowerCase()
  const isEarthquakeQuery =
    lower.includes('earthquake') ||
    lower.includes('quake') ||
    lower.includes('tremor') ||
    lower.includes('seismic') ||
    lower.includes('richter')

  // Auto-activate USGS earthquake layer if user mentions seismic events
  if (isEarthquakeQuery) {
    dispatchMapToggleLayer('usgs-quakes', true)
  }

  // 1. Check for specific region/city matches
  for (const [key, loc] of Object.entries(REGIONAL_COORDINATES)) {
    if (lower.includes(key)) {
      if (navDebounceTimer) {
        clearTimeout(navDebounceTimer)
      }
      navDebounceTimer = setTimeout(() => {
        dispatchMapFlyTo(loc.center[0], loc.center[1], loc.zoom, 1200)
      }, 180)
      return true
    }
  }

  // 2. If general earthquake query with no specific region, fly to India's active seismic arc
  if (isEarthquakeQuery) {
    if (navDebounceTimer) clearTimeout(navDebounceTimer)
    navDebounceTimer = setTimeout(() => {
      dispatchMapFlyTo(92.85, 26.50, 7.0, 1200)
    }, 180)
    return true
  }

  return false
}
