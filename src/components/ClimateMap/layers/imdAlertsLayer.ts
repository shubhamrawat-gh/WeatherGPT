import type { Map, GeoJSONSource } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'
import type { ClimateLayer } from './types'

// All-India IMD Warning polygons mapped to INITIAL_ALERTS
export const INITIAL_IMD_ALERT_POLYGONS: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. Odisha & North AP Cyclone Red Warning
    {
      type: 'Feature',
      properties: {
        id: 'alt-001',
        title: 'Severe Cyclonic Storm Warning (Red Alert)',
        region: 'Coastal Odisha & Northern Andhra',
        state: 'Odisha',
        severity: 'extreme',
        category: 'Cyclone',
        windSpeed: '110-120 gusting 135 km/h',
        leadAction: 'Evacuate low-lying coastal zones, suspend sea operations',
        color: '#dc2626'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [84.50, 18.20],
            [86.90, 19.50],
            [87.30, 21.60],
            [85.80, 21.80],
            [84.20, 19.50],
            [84.50, 18.20]
          ]
        ]
      }
    },
    // 2. Assam & Barak Valley Orange Warning
    {
      type: 'Feature',
      properties: {
        id: 'alt-002',
        title: 'Torrential Precipitation & Flash Flood (Orange Alert)',
        region: 'Barak Valley & South Assam',
        state: 'Assam',
        severity: 'severe',
        category: 'Heavy Rainfall',
        windSpeed: '30-45 km/h',
        leadAction: 'Stay alert along river banks, clear drainage channels',
        color: '#ea580c'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [92.10, 24.30],
            [93.30, 24.40],
            [93.20, 25.30],
            [92.00, 25.10],
            [92.10, 24.30]
          ]
        ]
      }
    },
    // 3. Thar & Vidarbha Heatwave Orange Warning
    {
      type: 'Feature',
      properties: {
        id: 'alt-003',
        title: 'Severe Heatwave Conditions (Orange Alert)',
        region: 'Western Rajasthan & Vidarbha',
        state: 'Rajasthan',
        severity: 'severe',
        category: 'Heatwave',
        windSpeed: '25-35 km/h hot dry westerlies',
        leadAction: 'Avoid direct noon sun, provide shaded animal shelters',
        color: '#f97316'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [70.00, 25.50],
            [74.00, 25.20],
            [73.80, 28.50],
            [70.50, 28.80],
            [70.00, 25.50]
          ]
        ]
      }
    },
    // 4. Sikkim Thunderstorm Yellow Advisory
    {
      type: 'Feature',
      properties: {
        id: 'alt-004',
        title: 'Thunderstorm & Lightning Hazard (Yellow Advisory)',
        region: 'Sub-Himalayan West Bengal & Sikkim',
        state: 'Sikkim',
        severity: 'moderate',
        category: 'Thunderstorm',
        windSpeed: '45-55 km/h gusts',
        leadAction: 'Do not shelter under isolated trees, protect open crops',
        color: '#ca8a04'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [88.00, 27.00],
            [89.00, 27.00],
            [89.00, 28.10],
            [88.00, 28.10],
            [88.00, 27.00]
          ]
        ]
      }
    },
    // 5. Uttarakhand Landslide Yellow Advisory
    {
      type: 'Feature',
      properties: {
        id: 'alt-005',
        title: 'Hill Slope Instability & Landslide (Yellow Advisory)',
        region: 'Garhwal & Kumaon Foothills',
        state: 'Uttarakhand',
        severity: 'moderate',
        category: 'Landslide',
        windSpeed: '20-30 km/h',
        leadAction: 'Restrict hill highway transit to daytime only',
        color: '#ca8a04'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [78.20, 29.80],
            [80.50, 29.70],
            [80.20, 31.20],
            [78.00, 31.00],
            [78.20, 29.80]
          ]
        ]
      }
    },
    // 6. Maharashtra Konkan Maritime Advisory
    {
      type: 'Feature',
      properties: {
        id: 'alt-006',
        title: 'High Swell & Squall Watch (Green/Advisory)',
        region: 'Konkan Coast & Goa',
        state: 'Maharashtra',
        severity: 'minor',
        category: 'Cyclone',
        windSpeed: '40-50 km/h',
        leadAction: 'Small craft should exercise caution in deep sea',
        color: '#16a34a'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [72.50, 15.50],
            [73.80, 15.30],
            [73.40, 19.30],
            [72.30, 19.40],
            [72.50, 15.50]
          ]
        ]
      }
    }
  ]
}

export const imdAlertsLayer: ClimateLayer = {
  id: 'imd-alerts',
  name: 'IMD Severe Bulletins',
  category: 'alerts',
  description: 'Official India Meteorological Department color-coded disaster alerts (Red, Orange, Yellow)',
  iconName: 'AlertTriangle',
  color: '#dc2626',
  defaultVisible: true,
  sourceIds: ['source-imd-alerts'],
  layerIds: [
    'layer-imd-alert-fill',
    'layer-imd-alert-line',
    'layer-imd-alert-labels'
  ],

  init(map: Map) {
    if (!map.getSource('source-imd-alerts')) {
      map.addSource('source-imd-alerts', {
        type: 'geojson',
        data: INITIAL_IMD_ALERT_POLYGONS,
        tolerance: 0.6,
        buffer: 0
      })
    }

    // 1. Severity-coded polygon fill
    if (!map.getLayer('layer-imd-alert-fill')) {
      map.addLayer({
        id: 'layer-imd-alert-fill',
        type: 'fill',
        source: 'source-imd-alerts',
        paint: {
          'fill-color': [
            'match',
            ['get', 'severity'],
            'extreme', '#dc2626', // Red
            'severe', '#ea580c',  // Orange
            'moderate', '#eab308',// Yellow
            'minor', '#16a34a',   // Green
            '#ef4444'
          ],
          'fill-opacity': 0.35
        }
      })
    }

    // 2. Severity-coded polygon outline
    if (!map.getLayer('layer-imd-alert-line')) {
      map.addLayer({
        id: 'layer-imd-alert-line',
        type: 'line',
        source: 'source-imd-alerts',
        paint: {
          'line-color': [
            'match',
            ['get', 'severity'],
            'extreme', '#f87171',
            'severe', '#fb923c',
            'moderate', '#fde047',
            'minor', '#4ade80',
            '#fca5a5'
          ],
          'line-width': 2.0
        }
      })
    }

    // 3. Polygon Label
    if (!map.getLayer('layer-imd-alert-labels')) {
      map.addLayer({
        id: 'layer-imd-alert-labels',
        type: 'symbol',
        source: 'source-imd-alerts',
        layout: {
          'text-field': ['get', 'category'],
          'text-size': 11,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
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
  },

  /**
   * High performance filter by severity ('all' | 'extreme' | 'severe' | 'moderate' | 'minor')
   * Uses map.setFilter() without re-fetching or re-adding sources!
   */
  setFilter(map: Map, filterValue: unknown) {
    const val = typeof filterValue === 'string' ? filterValue : 'all'
    const filterExp =
      val === 'all'
        ? null
        : ['==', ['get', 'severity'], val]

    if (map.getLayer('layer-imd-alert-fill')) {
      map.setFilter('layer-imd-alert-fill', filterExp)
    }
    if (map.getLayer('layer-imd-alert-line')) {
      map.setFilter('layer-imd-alert-line', filterExp)
    }
    if (map.getLayer('layer-imd-alert-labels')) {
      map.setFilter('layer-imd-alert-labels', filterExp)
    }
  },

  updateData(map: Map, payload: unknown) {
    const source = map.getSource('source-imd-alerts') as GeoJSONSource | undefined
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
