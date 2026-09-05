import type { FeatureCollection, Feature, Point } from 'geojson'

export type DisasterSeverity = 'minor' | 'moderate' | 'severe' | 'extreme' | 'major'

export interface NormalizedEarthquakeProperties {
  id: string
  type: 'earthquake'
  mag: number
  severity: 'minor' | 'moderate' | 'major'
  status: 'automatic' | 'reviewed' | string
  occurredAt: string
  depthKm: number
  place: string
  title: string
  url?: string
  felt?: number | null
  cdi?: number | null
  tsunami?: number | null
  alert?: string | null
  expiresAt?: null
}

export type NormalizedEarthquakeFeature = Feature<Point, NormalizedEarthquakeProperties>

export interface UsgsRawFeature {
  id?: string
  properties?: {
    mag?: number | null
    place?: string | null
    time?: number | null
    updated?: number | null
    status?: string | null
    type?: string | null
    title?: string | null
    url?: string | null
    felt?: number | null
    cdi?: number | null
    tsunami?: number | null
    alert?: string | null
    [key: string]: unknown
  }
  geometry?: {
    type?: string
    coordinates?: [number, number, number?]
  }
}

export interface UsgsRawGeoJson {
  type: string
  features?: UsgsRawFeature[]
  bbox?: number[]
  metadata?: Record<string, unknown>
}

/**
 * Derives a standardized severity tier from earthquake magnitude:
 * - minor: < 4.0
 * - moderate: 4.0 - 5.9
 * - major: >= 6.0
 */
export function deriveEarthquakeSeverity(mag: number): 'minor' | 'moderate' | 'major' {
  if (mag >= 6.0) return 'major'
  if (mag >= 4.0) return 'moderate'
  return 'minor'
}

/**
 * Normalizes raw data from various disaster and weather providers into
 * WeatherGPT's unified GeoJSON FeatureCollection contract.
 */
export function normalizeToGeoJSON(
  raw: unknown,
  sourceType: 'usgs' | 'imd' | 'firms' | 'sachet' = 'usgs'
): FeatureCollection {
  if (sourceType === 'usgs') {
    const usgsData = (raw || {}) as UsgsRawGeoJson
    const rawFeatures = Array.isArray(usgsData.features) ? usgsData.features : []

    const normalizedFeatures: NormalizedEarthquakeFeature[] = []

    for (const feat of rawFeatures) {
      if (!feat || !feat.geometry || feat.geometry.type !== 'Point') continue

      const coords = feat.geometry.coordinates || [0, 0, 0]
      const lng = typeof coords[0] === 'number' ? coords[0] : 0
      const lat = typeof coords[1] === 'number' ? coords[1] : 0
      const depthKm = typeof coords[2] === 'number' ? Math.round(coords[2] * 10) / 10 : 10.0

      const props = feat.properties || {}
      const mag = typeof props.mag === 'number' ? Math.round(props.mag * 10) / 10 : 0
      const status = (props.status || 'automatic').toLowerCase()
      const timeMs = typeof props.time === 'number' ? props.time : Date.now()
      const occurredAt = new Date(timeMs).toISOString()
      const eventId = String(feat.id || `usgs-${timeMs}`)

      normalizedFeatures.push({
        type: 'Feature',
        id: eventId,
        geometry: {
          type: 'Point',
          coordinates: [lng, lat, depthKm]
        },
        properties: {
          id: eventId,
          type: 'earthquake',
          mag,
          severity: deriveEarthquakeSeverity(mag),
          status,
          occurredAt,
          depthKm,
          place: props.place || 'Regional Epicenter',
          title: props.title || `M ${mag.toFixed(1)} - ${props.place || 'India Region'}`,
          url: props.url || undefined,
          felt: props.felt ?? null,
          cdi: props.cdi ?? null,
          tsunami: props.tsunami ?? null,
          alert: props.alert ?? null,
          expiresAt: null
        }
      })
    }

    return {
      type: 'FeatureCollection',
      features: normalizedFeatures
    }
  }

  // Fallback for other or already-normalized collections
  return (raw && typeof raw === 'object' && 'type' in raw
    ? (raw as FeatureCollection)
    : { type: 'FeatureCollection', features: [] })
}
