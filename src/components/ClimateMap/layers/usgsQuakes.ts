import type { Map, GeoJSONSource, MapLayerMouseEvent } from 'mapbox-gl'
import mapboxgl from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'
import type { ClimateLayer } from './types'

export const INITIAL_USGS_QUAKES_DATA: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'us7000ner1',
      geometry: {
        type: 'Point',
        coordinates: [92.68, 26.85, 18.0]
      },
      properties: {
        id: 'us7000ner1',
        type: 'earthquake',
        mag: 4.2,
        severity: 'moderate',
        status: 'reviewed',
        occurredAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        depthKm: 18.0,
        place: '28 km NE of Dhekiajuli, Assam, India',
        title: 'M 4.2 - Assam, India'
      }
    },
    {
      type: 'Feature',
      id: 'us7000ner2',
      geometry: {
        type: 'Point',
        coordinates: [93.38, 23.35, 32.0]
      },
      properties: {
        id: 'us7000ner2',
        type: 'earthquake',
        mag: 3.4,
        severity: 'minor',
        status: 'automatic',
        occurredAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        depthKm: 32.0,
        place: '14 km SSE of Champhai, Mizoram, India',
        title: 'M 3.4 - Mizoram, India'
      }
    },
    {
      type: 'Feature',
      id: 'us7000ner3',
      geometry: {
        type: 'Point',
        coordinates: [70.28, 36.47, 209.9]
      },
      properties: {
        id: 'us7000ner3',
        type: 'earthquake',
        mag: 4.3,
        severity: 'moderate',
        status: 'reviewed',
        occurredAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        depthKm: 209.9,
        place: '39 km ESE of Farkhār, Hindu Kush Region',
        title: 'M 4.3 - Hindu Kush Regional Arc'
      }
    }
  ]
}

let activePopup: mapboxgl.Popup | null = null

export const usgsQuakesLayer: ClimateLayer = {
  id: 'usgs-quakes',
  name: 'USGS Live Earthquakes',
  category: 'earthquake',
  description: 'Real-time seismic telemetry scoped to India, focal depth, and magnitude tiers',
  iconName: 'Activity',
  color: '#ff6b6b',
  defaultVisible: true,
  sourceIds: ['source-usgs-quakes'],
  layerIds: [
    'layer-usgs-quakes-pulse',
    'layer-usgs-quakes-circles',
    'layer-usgs-quakes-labels'
  ],

  init(map: Map) {
    // 1. Register GeoJSON Source
    if (!map.getSource('source-usgs-quakes')) {
      map.addSource('source-usgs-quakes', {
        type: 'geojson',
        data: INITIAL_USGS_QUAKES_DATA,
        tolerance: 0.5,
        buffer: 0
      })
    }

    // 2. Pulse / Aura outer ring for major or moderate quakes
    if (!map.getLayer('layer-usgs-quakes-pulse')) {
      map.addLayer({
        id: 'layer-usgs-quakes-pulse',
        type: 'circle',
        source: 'source-usgs-quakes',
        filter: ['>=', ['get', 'mag'], 3.8],
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'mag'],
            2.5, 8,
            5.0, 22,
            8.0, 40
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'depthKm'],
            0, '#ff6b6b',
            100, '#ffa94d',
            300, '#ffd43b'
          ],
          'circle-opacity': [
            'case',
            ['==', ['get', 'status'], 'automatic'],
            0.12,
            0.22
          ]
        }
      })
    }

    // 3. Main Data-Driven Circle Layer
    if (!map.getLayer('layer-usgs-quakes-circles')) {
      map.addLayer({
        id: 'layer-usgs-quakes-circles',
        type: 'circle',
        source: 'source-usgs-quakes',
        paint: {
          // Radius scaling with magnitude (2.5 -> 4px, 8.0 -> 24px)
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'mag'],
            2.5, 4,
            8.0, 24
          ],
          // Depth-based color ramp: shallow (<100km red), intermediate (100-300km orange), deep (>300km yellow)
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'depthKm'],
            0, '#ff6b6b',
            100, '#ffa94d',
            300, '#ffd43b'
          ],
          // Dim provisional unreviewed events (0.45 vs 0.75)
          'circle-opacity': [
            'case',
            ['==', ['get', 'status'], 'automatic'],
            0.45,
            0.75
          ],
          // Border styling with dashed/dimmed look for automatic events
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': [
            'case',
            ['==', ['get', 'status'], 'automatic'],
            0.35,
            0.85
          ]
        }
      })
    }

    // 4. Magnitude text label on higher zoom levels or M>=4.0
    if (!map.getLayer('layer-usgs-quakes-labels')) {
      map.addLayer({
        id: 'layer-usgs-quakes-labels',
        type: 'symbol',
        source: 'source-usgs-quakes',
        minzoom: 5.5,
        layout: {
          'text-field': ['concat', 'M', ['to-string', ['get', 'mag']]],
          'text-size': 10,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.2],
          'text-anchor': 'top',
          'text-allow-overlap': false,
          'text-ignore-placement': false
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1.5
        }
      })
    }

    // Interactive Click Popup Handler
    const clickHandler = (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0]
      if (!feature || feature.geometry.type !== 'Point') return

      const coords = (feature.geometry as GeoJSON.Point).coordinates.slice()
      const props = feature.properties || {}
      const mag = Number(props.mag || 0).toFixed(1)
      const depth = Number(props.depthKm || 0).toFixed(1)
      const place = props.place || 'Unknown Location'
      const status = String(props.status || 'automatic').toUpperCase()
      const severity = String(props.severity || 'minor').toUpperCase()
      const occurred = props.occurredAt
        ? new Date(props.occurredAt).toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
          })
        : 'Recent'

      const isAutomatic = String(props.status).toLowerCase() === 'automatic'
      const statusBadgeColor = isAutomatic
        ? 'background: rgba(234, 179, 8, 0.2); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.4);'
        : 'background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.4);'

      const severityBadgeColor =
        severity === 'MAJOR'
          ? 'background: rgba(220, 38, 38, 0.2); color: #f87171;'
          : severity === 'MODERATE'
            ? 'background: rgba(234, 88, 12, 0.2); color: #fb923c;'
            : 'background: rgba(59, 130, 246, 0.2); color: #60a5fa;'

      if (activePopup) {
        activePopup.remove()
      }

      const html = `
        <div style="font-family: system-ui, sans-serif; padding: 10px 12px; min-width: 220px; background: #121212; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 10px 25px rgba(0,0,0,0.6);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <div style="font-size: 14px; font-weight: 700; color: #ff6b6b; display: flex; align-items: center; gap: 6px;">
              <span>●</span> M ${mag}
            </div>
            <span style="font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 6px; ${severityBadgeColor}">
              ${severity}
            </span>
          </div>
          <div style="font-size: 11px; font-weight: 500; color: #e2e8f0; margin-bottom: 8px; line-height: 1.3;">
            ${place}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 10px; margin-bottom: 8px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 6px;">
            <div>
              <span style="color: #94a3b8;">Depth:</span>
              <strong style="color: #f1f5f9; display: block;">${depth} km</strong>
            </div>
            <div>
              <span style="color: #94a3b8;">Status:</span>
              <span style="display: inline-block; font-size: 9px; padding: 1px 5px; border-radius: 4px; margin-top: 2px; ${statusBadgeColor}">
                ${status}
              </span>
            </div>
          </div>
          <div style="font-size: 9px; color: #64748b; font-family: monospace;">
            Occurred: ${occurred}
          </div>
        </div>
      `

      activePopup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: true,
        className: 'weathergpt-custom-popup',
        maxWidth: '300px'
      })
        .setLngLat(coords as [number, number])
        .setHTML(html)
        .addTo(map)
    }

    const mouseEnterHandler = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const mouseLeaveHandler = () => {
      map.getCanvas().style.cursor = ''
    }

    map.on('click', 'layer-usgs-quakes-circles', clickHandler)
    map.on('mouseenter', 'layer-usgs-quakes-circles', mouseEnterHandler)
    map.on('mouseleave', 'layer-usgs-quakes-circles', mouseLeaveHandler)
  },

  /**
   * Fast data update using Mapbox GeoJSONSource.setData()
   */
  updateData(map: Map, payload: unknown) {
    const source = map.getSource('source-usgs-quakes') as GeoJSONSource | undefined
    if (source && payload) {
      source.setData(payload as FeatureCollection)
    }
  },

  /**
   * Filter earthquakes by severity ('all' | 'minor' | 'moderate' | 'major')
   */
  setFilter(map: Map, filterValue: unknown) {
    const val = typeof filterValue === 'string' ? filterValue : 'all'
    const filterExp = val === 'all' ? null : ['==', ['get', 'severity'], val]

    if (map.getLayer('layer-usgs-quakes-circles')) {
      map.setFilter('layer-usgs-quakes-circles', filterExp)
    }
    if (map.getLayer('layer-usgs-quakes-pulse')) {
      map.setFilter('layer-usgs-quakes-pulse', filterExp)
    }
    if (map.getLayer('layer-usgs-quakes-labels')) {
      map.setFilter('layer-usgs-quakes-labels', filterExp)
    }
  },

  destroy(map: Map) {
    if (activePopup) {
      activePopup.remove()
      activePopup = null
    }
    for (const lid of this.layerIds) {
      if (map.getLayer(lid)) map.removeLayer(lid)
    }
    for (const sid of this.sourceIds) {
      if (map.getSource(sid)) map.removeSource(sid)
    }
  }
}

export default usgsQuakesLayer
