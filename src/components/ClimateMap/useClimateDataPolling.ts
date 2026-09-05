import { useEffect, useRef, useState, useCallback } from 'react'
import type { Map, GeoJSONSource } from 'mapbox-gl'
import type { FeatureCollection, Feature, Point } from 'geojson'
import { INITIAL_CYCLONE_DATA } from './layers/cycloneLayer'
import { INITIAL_RADAR_STATIONS } from './layers/rainfallLayer'
import { INITIAL_RIVER_GAUGES } from './layers/floodLayer'

interface UseClimateDataPollingOptions {
  intervalMs?: number // Default 30,000 (30s)
  enabled?: boolean
}

export function useClimateDataPolling(
  mapRef: React.RefObject<Map | null>,
  options: UseClimateDataPollingOptions = {}
) {
  const { intervalMs = 30000, enabled = true } = options
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [latestQuakes, setLatestQuakes] = useState<FeatureCollection | null>(null)
  const [apiStatus, setApiStatus] = useState<'connected' | 'polling' | 'error'>('polling')
  const [apiLatencyMs, setApiLatencyMs] = useState<number | null>(null)
  const tickCountRef = useRef(0)
  const cachedQuakesRef = useRef<FeatureCollection | null>(null)

  // Batched update function: executes setData on existing sources in a single render frame
  const applyBatchedUpdate = useCallback(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    setIsUpdating(true)
    tickCountRef.current += 1
    const tick = tickCountRef.current

    requestAnimationFrame(() => {
      try {
        // 1. Update Cyclone Eye Position slightly (simulating NW movement along track)
        const cycloneSource = map.getSource('source-cyclone-data') as GeoJSONSource | undefined
        if (cycloneSource) {
          const updatedCyclone = JSON.parse(JSON.stringify(INITIAL_CYCLONE_DATA)) as FeatureCollection
          // Minor micro-drift in eye coordinate based on tick
          const eyeFeature = updatedCyclone.features.find((f: Feature) => f.properties?.type === 'eye')
          if (eyeFeature && eyeFeature.geometry.type === 'Point') {
            const pointGeom = eyeFeature.geometry as Point
            const driftLng = 88.20 - (tick % 10) * 0.03
            const driftLat = 16.50 + (tick % 10) * 0.04
            pointGeom.coordinates = [driftLng, driftLat]
            eyeFeature.properties = {
              ...eyeFeature.properties,
              sustainedWind: `${115 + (tick % 3) * 2} km/h`,
              gusts: `${135 + (tick % 3) * 2} km/h`,
              pressure: `${984 - (tick % 2)} hPa`
            }
          }
          // Batch apply via single setData() call
          cycloneSource.setData(updatedCyclone)
        }

        // 2. Update Doppler Radar telemetry (simulating pulse & reflectivity fluctuation)
        const radarSource = map.getSource('source-rainfall-stations') as GeoJSONSource | undefined
        if (radarSource) {
          const updatedRadar = JSON.parse(JSON.stringify(INITIAL_RADAR_STATIONS)) as FeatureCollection
          updatedRadar.features.forEach((feat: Feature, idx: number) => {
            if (feat.properties) {
              const delta = ((tick + idx) % 5) - 2
              feat.properties.dbz = Math.max(20, Math.min(65, feat.properties.dbz + delta))
            }
          })
          radarSource.setData(updatedRadar)
        }

        // 3. Update River Gauge telemetry
        const gaugeSource = map.getSource('source-flood-gauges') as GeoJSONSource | undefined
        if (gaugeSource) {
          const updatedGauges = JSON.parse(JSON.stringify(INITIAL_RIVER_GAUGES)) as FeatureCollection
          gaugeSource.setData(updatedGauges)
        }

        // 4. Update USGS Live Earthquakes if fresh payload is cached in memory
        if (cachedQuakesRef.current) {
          const quakesSource = map.getSource('source-usgs-quakes') as GeoJSONSource | undefined
          if (quakesSource) {
            quakesSource.setData(cachedQuakesRef.current)
          }
        }

        setLastPolledAt(new Date())
      } catch (err) {
        console.warn('[ClimateMap] Error during batched setData:', err)
      } finally {
        setIsUpdating(false)
      }
    })
  }, [mapRef])

  // Fetches live earthquakes from backend endpoint and applies via source.setData()
  const fetchLiveQuakes = useCallback(async () => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return

    setApiStatus('polling')
    const startTime = performance.now()
    try {
      const res = await fetch('/api/live-layers/usgs-quakes')
      if (res.ok) {
        const data = (await res.json()) as FeatureCollection
        cachedQuakesRef.current = data
        setLatestQuakes(data)
        setApiStatus('connected')
        setApiLatencyMs(Math.round(performance.now() - startTime))
        const quakesSource = map.getSource('source-usgs-quakes') as GeoJSONSource | undefined
        if (quakesSource) {
          quakesSource.setData(data)
        }
      } else {
        setApiStatus('error')
      }
    } catch (err) {
      setApiStatus('error')
      console.warn('[ClimateMap] USGS Quakes poll error:', err)
    }
  }, [mapRef])

  useEffect(() => {
    if (!enabled) return

    // Initial poll
    applyBatchedUpdate()
    fetchLiveQuakes()

    const timer = setInterval(() => {
      applyBatchedUpdate()
      fetchLiveQuakes()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [enabled, intervalMs, applyBatchedUpdate, fetchLiveQuakes])

  return {
    lastPolledAt,
    isUpdating,
    latestQuakes,
    apiStatus,
    apiLatencyMs,
    triggerManualPoll: () => {
      applyBatchedUpdate()
      fetchLiveQuakes()
    }
  }
}
