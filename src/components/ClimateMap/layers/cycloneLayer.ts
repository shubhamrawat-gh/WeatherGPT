import type { Map, GeoJSONSource } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'
import type { ClimateLayer } from './types'

// Mock cyclone track over Bay of Bengal heading towards Odisha/North Andhra Coast
export const INITIAL_CYCLONE_DATA: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. Cone of uncertainty polygon
    {
      type: 'Feature',
      properties: {
        id: 'cyclone-cone',
        type: 'cone',
        name: '48-Hour Cone of Uncertainty',
        intensity: 'Extreme (110-120 km/h)'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [88.20, 16.50], // Start eye
            [87.60, 18.00],
            [86.20, 19.80], // Coastal landfall margin north
            [85.50, 21.00],
            [84.40, 20.20],
            [84.80, 18.50], // Coastal landfall margin south
            [86.90, 16.80],
            [88.20, 16.50]
          ]
        ]
      }
    },
    // 2. Projected Track Line
    {
      type: 'Feature',
      properties: {
        id: 'cyclone-track-future',
        type: 'future-track',
        name: 'Projected NW Path'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [88.20, 16.50],
          [87.40, 17.80],
          [86.60, 19.20],
          [85.80, 20.30]
        ]
      }
    },
    // 3. Past Track Line
    {
      type: 'Feature',
      properties: {
        id: 'cyclone-track-past',
        type: 'past-track',
        name: 'Observed Path (Past 36h)'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [90.80, 13.50],
          [89.90, 14.60],
          [89.10, 15.40],
          [88.20, 16.50]
        ]
      }
    },
    // 4. Current Eye Location (Point)
    {
      type: 'Feature',
      properties: {
        id: 'cyclone-eye',
        type: 'eye',
        name: 'Cyclone Center (Deep Depression)',
        sustainedWind: '115 km/h',
        gusts: '135 km/h',
        pressure: '984 hPa',
        movement: 'NW at 14 km/h'
      },
      geometry: {
        type: 'Point',
        coordinates: [88.20, 16.50]
      }
    },
    // 5. Gale Wind Radius (100km radius circle approximation)
    {
      type: 'Feature',
      properties: {
        id: 'cyclone-gale-radius',
        type: 'gale-zone',
        name: 'Gale Wind Radius (50+ kt)'
      },
      geometry: {
        type: 'Point',
        coordinates: [88.20, 16.50]
      }
    }
  ]
}

export const cycloneLayer: ClimateLayer = {
  id: 'cyclone-tracking',
  name: 'Cyclone Tracking & Cone',
  category: 'cyclone',
  description: 'Live storm trajectory, eye telemetry, wind radii, and 48-hour cone of uncertainty',
  iconName: 'Wind',
  color: '#ef4444',
  defaultVisible: true,
  sourceIds: ['source-cyclone-data'],
  layerIds: [
    'layer-cyclone-cone',
    'layer-cyclone-cone-border',
    'layer-cyclone-track-past',
    'layer-cyclone-track-future',
    'layer-cyclone-gale-ring',
    'layer-cyclone-eye-outer',
    'layer-cyclone-eye-core'
  ],

  init(map: Map) {
    if (!map.getSource('source-cyclone-data')) {
      map.addSource('source-cyclone-data', {
        type: 'geojson',
        data: INITIAL_CYCLONE_DATA,
        tolerance: 0.5,
        buffer: 0
      })
    }

    // 1. Cone of Uncertainty Fill
    if (!map.getLayer('layer-cyclone-cone')) {
      map.addLayer({
        id: 'layer-cyclone-cone',
        type: 'fill',
        source: 'source-cyclone-data',
        filter: ['==', ['get', 'type'], 'cone'],
        paint: {
          'fill-color': '#ef4444',
          'fill-opacity': 0.22
        }
      })
    }

    // 2. Cone Border
    if (!map.getLayer('layer-cyclone-cone-border')) {
      map.addLayer({
        id: 'layer-cyclone-cone-border',
        type: 'line',
        source: 'source-cyclone-data',
        filter: ['==', ['get', 'type'], 'cone'],
        paint: {
          'line-color': '#f87171',
          'line-width': 1.4,
          'line-dasharray': [3, 2]
        }
      })
    }

    // 3. Past Track (Solid Amber/Red)
    if (!map.getLayer('layer-cyclone-track-past')) {
      map.addLayer({
        id: 'layer-cyclone-track-past',
        type: 'line',
        source: 'source-cyclone-data',
        filter: ['==', ['get', 'type'], 'past-track'],
        paint: {
          'line-color': '#f97316',
          'line-width': 3,
          'line-opacity': 0.85
        }
      })
    }

    // 4. Future Track (Dashed Bright Crimson)
    if (!map.getLayer('layer-cyclone-track-future')) {
      map.addLayer({
        id: 'layer-cyclone-track-future',
        type: 'line',
        source: 'source-cyclone-data',
        filter: ['==', ['get', 'type'], 'future-track'],
        paint: {
          'line-color': '#ef4444',
          'line-width': 3.2,
          'line-dasharray': [2, 1.5]
        }
      })
    }

    // 5. Gale Wind Ring
    if (!map.getLayer('layer-cyclone-gale-ring')) {
      map.addLayer({
        id: 'layer-cyclone-gale-ring',
        type: 'circle',
        source: 'source-cyclone-data',
        filter: ['==', ['get', 'type'], 'gale-zone'],
        paint: {
          'circle-radius': 42,
          'circle-color': '#ef4444',
          'circle-opacity': 0.12,
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#f87171',
          'circle-stroke-opacity': 0.6
        }
      })
    }

    // 6. Current Eye Outer Pulse
    if (!map.getLayer('layer-cyclone-eye-outer')) {
      map.addLayer({
        id: 'layer-cyclone-eye-outer',
        type: 'circle',
        source: 'source-cyclone-data',
        filter: ['==', ['get', 'type'], 'eye'],
        paint: {
          'circle-radius': 14,
          'circle-color': '#ef4444',
          'circle-opacity': 0.45
        }
      })
    }

    // 7. Eye Core Dot
    if (!map.getLayer('layer-cyclone-eye-core')) {
      map.addLayer({
        id: 'layer-cyclone-eye-core',
        type: 'circle',
        source: 'source-cyclone-data',
        filter: ['==', ['get', 'type'], 'eye'],
        paint: {
          'circle-radius': 5,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#991b1b'
        }
      })
    }
  },

  updateData(map: Map, payload: unknown) {
    const source = map.getSource('source-cyclone-data') as GeoJSONSource | undefined
    if (source && payload) {
      source.setData(payload as FeatureCollection)
    }
  },

  destroy(map: Map) {
    for (const lid of this.layerIds) {
      if (map.getLayer(lid)) map.removeLayer(lid)
    }
    for (const sid of this.sourceIds) {
      if (map.getSource(sid)) map.removeSource(sid)
    }
  }
}
