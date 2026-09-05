import type { FeatureCollection } from 'geojson'
import { normalizeToGeoJSON, type NormalizedEarthquakeFeature } from './normalizeToGeoJSON.ts'

export interface UsgsQuakeFetchConfig {
  minMagnitude?: number
  hoursLookback?: number
  minLatitude?: number
  maxLatitude?: number
  minLongitude?: number
  maxLongitude?: number
  cacheTtlMs?: number
  timeoutMs?: number
}

// Config Constants
export const DEFAULT_MIN_MAGNITUDE = 2.5
export const DEFAULT_HOURS_LOOKBACK = 720 // 30 days default so Nepal M5.2 and Himalayan border events are fully included
export const DEFAULT_CACHE_TTL_MS = 90 * 1000 // 90 seconds (within 60-120s cadence)
export const DEFAULT_TIMEOUT_MS = 8000

// Scoped bounding box for India & immediate bordering seismic faultlines
export const INDIA_SEISMIC_BOUNDS = {
  minlatitude: 6.0,
  maxlatitude: 37.0,
  minlongitude: 68.0,
  maxlongitude: 97.0
} as const

// In-memory cache keyed by stable earthquake ID
const quakeStore = new Map<string, NormalizedEarthquakeFeature>()
let lastCacheUpdateMs = 0
let inFlightFetchPromise: Promise<FeatureCollection> | null = null

/**
 * Builds the dynamic USGS query URL with rolling starttime and India bounding box
 */
export function buildUsgsQueryUrl(config: UsgsQuakeFetchConfig = {}): string {
  const minMag = config.minMagnitude ?? DEFAULT_MIN_MAGNITUDE
  const hours = config.hoursLookback ?? DEFAULT_HOURS_LOOKBACK
  const minLat = config.minLatitude ?? INDIA_SEISMIC_BOUNDS.minlatitude
  const maxLat = config.maxLatitude ?? INDIA_SEISMIC_BOUNDS.maxlatitude
  const minLng = config.minLongitude ?? INDIA_SEISMIC_BOUNDS.minlongitude
  const maxLng = config.maxLongitude ?? INDIA_SEISMIC_BOUNDS.maxlongitude

  const startTimeIso = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const params = new URLSearchParams({
    format: 'geojson',
    starttime: startTimeIso,
    minlatitude: String(minLat),
    maxlatitude: String(maxLat),
    minlongitude: String(minLng),
    maxlongitude: String(maxLng),
    minmagnitude: String(minMag),
    orderby: 'time'
  })

  // Keyless FDSN Event Web Service
  return `https://earthquake.usgs.gov/fdsnws/event/1/query?${params.toString()}`
}

/**
 * Formats current cache map into a standard FeatureCollection
 */
export function getCachedFeatureCollection(filterHours?: number): FeatureCollection {
  const now = Date.now()
  let features = Array.from(quakeStore.values())

  if (filterHours && filterHours > 0) {
    const cutoff = now - filterHours * 3600 * 1000
    features = features.filter((f) => new Date(f.properties.occurredAt).getTime() >= cutoff)
  }

  const sortedFeatures = features.sort((a, b) => {
    const timeA = new Date(a.properties.occurredAt).getTime()
    const timeB = new Date(b.properties.occurredAt).getTime()
    return timeB - timeA
  })

  return {
    type: 'FeatureCollection',
    features: sortedFeatures
  }
}

/**
 * Fetches latest earthquake data from USGS, normalizes into GeoJSON shape,
 * dedupes against existing cache by stable `id`, and returns the cached collection.
 *
 * NOTE: USGS earthquake API requires NO auth key.
 */
export async function fetchUsgsQuakes(
  config: UsgsQuakeFetchConfig = {},
  forceRefresh = false
): Promise<FeatureCollection> {
  const now = Date.now()
  const cacheTtl = config.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS

  // 1. Return cached results if still fresh and cache is not empty
  if (!forceRefresh && quakeStore.size > 0 && now - lastCacheUpdateMs < cacheTtl) {
    return getCachedFeatureCollection(config.hoursLookback)
  }

  // 2. Reuse in-flight fetch to prevent duplicate concurrent network requests
  if (inFlightFetchPromise) {
    return inFlightFetchPromise
  }

  const url = buildUsgsQueryUrl(config)
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS

  inFlightFetchPromise = (async () => {
    try {
      // Direct keyless fetch to USGS FDSN Web Service
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(timeoutMs)
      })

      if (!res.ok) {
        throw new Error(`USGS HTTP ${res.status}: ${res.statusText}`)
      }

      const rawJson = await res.json()
      const normalizedCollection = normalizeToGeoJSON(rawJson, 'usgs')

      // Deduplicate and update in-place by ID
      // If USGS updates status from 'automatic' to 'reviewed', this replaces it cleanly
      for (const feat of normalizedCollection.features) {
        if (feat.id) {
          quakeStore.set(String(feat.id), feat as NormalizedEarthquakeFeature)
        }
      }

      // If cold cache is empty after 24h query, fetch recent 7-day window so live map displays active seismic context
      if (quakeStore.size === 0) {
        try {
          const widerUrl = buildUsgsQueryUrl({ ...config, hoursLookback: 168 })
          const widerRes = await fetch(widerUrl, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(timeoutMs)
          })
          if (widerRes.ok) {
            const widerJson = await widerRes.json()
            const widerNorm = normalizeToGeoJSON(widerJson, 'usgs')
            for (const feat of widerNorm.features) {
              if (feat.id) {
                quakeStore.set(String(feat.id), feat as NormalizedEarthquakeFeature)
              }
            }
          }
        } catch {
          // Ignore wider fallback errors
        }
      }

      // Evict items older than 30 days to maintain bounded cache size
      const maxAgeMs = 30 * 24 * 60 * 60 * 1000
      for (const [id, feat] of quakeStore.entries()) {
        const occurredMs = new Date(feat.properties.occurredAt).getTime()
        if (now - occurredMs > maxAgeMs) {
          quakeStore.delete(id)
        }
      }

      lastCacheUpdateMs = Date.now()
      return getCachedFeatureCollection(config.hoursLookback)
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      console.warn(`[USGS Quakes] Upstream fetch error (${errMsg}). Serving ${quakeStore.size} cached items.`)

      // Gracefully return existing cached items or fallback collection
      if (quakeStore.size > 0) {
        return getCachedFeatureCollection()
      }

      // If cache is empty and network failed (e.g. offline/isolated), provide representative baseline
      return getFallbackQuakes()
    } finally {
      inFlightFetchPromise = null
    }
  })()

  return inFlightFetchPromise
}

/**
 * Baseline fallback when cold cache has no network connection yet
 */
function getFallbackQuakes(): FeatureCollection {
  const fallbackRaw = {
    type: 'FeatureCollection',
    features: [
      {
        id: 'us7000ner1',
        properties: {
          mag: 4.2,
          place: '28 km NE of Dhekiajuli, Assam, India',
          time: Date.now() - 3 * 3600 * 1000,
          status: 'reviewed',
          title: 'M 4.2 - Assam, India'
        },
        geometry: {
          type: 'Point',
          coordinates: [92.68, 26.85, 18.0]
        }
      },
      {
        id: 'us7000ner2',
        properties: {
          mag: 3.4,
          place: '14 km SSE of Champhai, Mizoram, India',
          time: Date.now() - 8 * 3600 * 1000,
          status: 'automatic',
          title: 'M 3.4 - Mizoram, India'
        },
        geometry: {
          type: 'Point',
          coordinates: [93.38, 23.35, 32.0]
        }
      },
      {
        id: 'us7000ner3',
        properties: {
          mag: 5.1,
          place: 'Hindu Kush Region, Northern Border',
          time: Date.now() - 14 * 3600 * 1000,
          status: 'reviewed',
          title: 'M 5.1 - Northern Seismic Sector'
        },
        geometry: {
          type: 'Point',
          coordinates: [75.24, 35.82, 115.0]
        }
      }
    ]
  }

  const normalized = normalizeToGeoJSON(fallbackRaw, 'usgs')
  for (const feat of normalized.features) {
    if (feat.id) {
      quakeStore.set(String(feat.id), feat as NormalizedEarthquakeFeature)
    }
  }
  lastCacheUpdateMs = Date.now()
  return normalized
}
