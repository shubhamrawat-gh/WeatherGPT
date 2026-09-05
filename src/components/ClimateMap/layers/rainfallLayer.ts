import type { Map, GeoJSONSource } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'
import type { ClimateLayer } from './types'

// Mock simplified precipitation polygons over major monsoon zones in India
export const INITIAL_RAINFALL_POLYGONS: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'rf-konkan',
        name: 'Konkan & Western Ghats Torrential Belt',
        intensity: 'heavy',
        dbz: 52,
        rateMmHr: 85,
        color: '#ef4444'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.65, 19.80],
            [73.40, 19.70],
            [73.70, 18.20],
            [73.85, 16.50],
            [73.40, 15.60],
            [72.70, 16.20],
            [72.50, 18.10],
            [72.65, 19.80]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'rf-barak',
        name: 'Assam & Barak Valley Monsoonal Core',
        intensity: 'heavy',
        dbz: 48,
        rateMmHr: 72,
        color: '#ef4444'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [91.50, 26.50],
            [93.80, 26.20],
            [93.50, 24.40],
            [92.10, 24.20],
            [91.20, 25.40],
            [91.50, 26.50]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'rf-odisha',
        name: 'Coastal Odisha Squall Band',
        intensity: 'moderate',
        dbz: 42,
        rateMmHr: 45,
        color: '#f97316'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [85.20, 21.00],
            [87.10, 21.50],
            [86.80, 19.60],
            [85.00, 19.20],
            [84.60, 20.10],
            [85.20, 21.00]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'rf-kerala',
        name: 'Malabar Coastal Inundation Zone',
        intensity: 'moderate',
        dbz: 38,
        rateMmHr: 35,
        color: '#3b82f6'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [75.60, 12.30],
            [76.30, 12.10],
            [76.70, 9.80],
            [76.10, 9.50],
            [75.40, 11.20],
            [75.60, 12.30]
          ]
        ]
      }
    }
  ]
}

// Doppler Radar telemetry stations across India
export const INITIAL_RADAR_STATIONS: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Mumbai Colaba Radar', dbz: 48, status: 'Active Doppler Scan', rangeKm: 250 },
      geometry: { type: 'Point', coordinates: [72.8258, 18.9067] }
    },
    {
      type: 'Feature',
      properties: { name: 'Kolkata Radar', dbz: 36, status: 'Active Doppler Scan', rangeKm: 250 },
      geometry: { type: 'Point', coordinates: [88.35, 22.53] }
    },
    {
      type: 'Feature',
      properties: { name: 'Paradip Coastal Radar', dbz: 54, status: 'Active Doppler Scan', rangeKm: 250 },
      geometry: { type: 'Point', coordinates: [86.61, 20.26] }
    },
    {
      type: 'Feature',
      properties: { name: 'Chennai Port Radar', dbz: 28, status: 'Active Doppler Scan', rangeKm: 250 },
      geometry: { type: 'Point', coordinates: [80.29, 13.08] }
    },
    {
      type: 'Feature',
      properties: { name: 'Kochi Naval Radar', dbz: 41, status: 'Active Doppler Scan', rangeKm: 250 },
      geometry: { type: 'Point', coordinates: [76.27, 9.96] }
    },
    {
      type: 'Feature',
      properties: { name: 'Agartala Regional Radar', dbz: 46, status: 'Active Doppler Scan', rangeKm: 250 },
      geometry: { type: 'Point', coordinates: [91.24, 23.88] }
    }
  ]
}

export const rainfallLayer: ClimateLayer = {
  id: 'rainfall-radar',
  name: 'Precipitation & Radar',
  category: 'radar',
  description: 'Doppler radar reflectivity (dBZ) and high-resolution precipitation intensity zones',
  iconName: 'CloudRain',
  color: '#00ed64',
  defaultVisible: true,
  sourceIds: ['source-rainfall-poly', 'source-rainfall-stations'],
  layerIds: [
    'layer-rainfall-fill',
    'layer-rainfall-line',
    'layer-rainfall-stations',
    'layer-rainfall-stations-halo'
  ],

  init(map: Map) {
    // 1. Polygon source with low tolerance for performance
    if (!map.getSource('source-rainfall-poly')) {
      map.addSource('source-rainfall-poly', {
        type: 'geojson',
        data: INITIAL_RAINFALL_POLYGONS,
        tolerance: 0.8,
        buffer: 0
      })
    }

    // 2. Station points source
    if (!map.getSource('source-rainfall-stations')) {
      map.addSource('source-rainfall-stations', {
        type: 'geojson',
        data: INITIAL_RADAR_STATIONS,
        tolerance: 0.5,
        buffer: 0
      })
    }

    // Layer: Rainfall Fills
    if (!map.getLayer('layer-rainfall-fill')) {
      map.addLayer({
        id: 'layer-rainfall-fill',
        type: 'fill',
        source: 'source-rainfall-poly',
        paint: {
          'fill-color': [
            'match',
            ['get', 'intensity'],
            'heavy', '#ef4444',
            'moderate', '#f97316',
            'light', '#00ed64',
            '#3b82f6'
          ],
          'fill-opacity': 0.38
        }
      })
    }

    // Layer: Rainfall Contour outlines
    if (!map.getLayer('layer-rainfall-line')) {
      map.addLayer({
        id: 'layer-rainfall-line',
        type: 'line',
        source: 'source-rainfall-poly',
        paint: {
          'line-color': [
            'match',
            ['get', 'intensity'],
            'heavy', '#ef4444',
            'moderate', '#f97316',
            'light', '#00ed64',
            '#60a5fa'
          ],
          'line-width': 1.6,
          'line-dasharray': [2, 2]
        }
      })
    }

    // Layer: Radar Station Pulse Halo
    if (!map.getLayer('layer-rainfall-stations-halo')) {
      map.addLayer({
        id: 'layer-rainfall-stations-halo',
        type: 'circle',
        source: 'source-rainfall-stations',
        paint: {
          'circle-radius': 12,
          'circle-color': '#00ed64',
          'circle-opacity': 0.18,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#00ed64'
        }
      })
    }

    // Layer: Radar Station Center Dot
    if (!map.getLayer('layer-rainfall-stations')) {
      map.addLayer({
        id: 'layer-rainfall-stations',
        type: 'circle',
        source: 'source-rainfall-stations',
        paint: {
          'circle-radius': 4.5,
          'circle-color': '#00ed64',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      })
    }
  },

  updateData(map: Map, payload: unknown) {
    const source = map.getSource('source-rainfall-poly') as GeoJSONSource | undefined
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
