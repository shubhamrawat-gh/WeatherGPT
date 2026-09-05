import type { Map, GeoJSONSource } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'
import type { ClimateLayer } from './types'

export const INITIAL_FLOOD_ZONES: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    // 1. Barak River Inundation Zone
    {
      type: 'Feature',
      properties: {
        id: 'flood-barak',
        name: 'Barak Basin Severe Inundation',
        river: 'Barak & Kushiyara',
        riskLevel: 'critical',
        waterLevel: '+2.4m above danger mark',
        displacedEstimate: '14,200 residents',
        color: '#0284c7'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [92.50, 24.95],
            [93.10, 24.85],
            [93.00, 24.60],
            [92.40, 24.65],
            [92.50, 24.95]
          ]
        ]
      }
    },
    // 2. Brahmaputra Lower Basin
    {
      type: 'Feature',
      properties: {
        id: 'flood-brahmaputra',
        name: 'Brahmaputra Flood Plain Alert',
        river: 'Brahmaputra',
        riskLevel: 'high',
        waterLevel: '+1.1m above danger mark',
        displacedEstimate: '45,000 residents',
        color: '#0ea5e9'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [91.20, 26.35],
            [92.20, 26.25],
            [92.10, 25.95],
            [91.10, 26.05],
            [91.20, 26.35]
          ]
        ]
      }
    },
    // 3. Kosi North Bihar Basin
    {
      type: 'Feature',
      properties: {
        id: 'flood-kosi',
        name: 'Kosi River Seepage Zone',
        river: 'Kosi',
        riskLevel: 'moderate',
        waterLevel: '+0.4m below danger mark',
        displacedEstimate: 'Standby mode',
        color: '#38bdf8'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [86.60, 26.40],
            [87.30, 26.30],
            [87.20, 25.60],
            [86.50, 25.70],
            [86.60, 26.40]
          ]
        ]
      }
    },
    // 4. Mahanadi Delta Coastal Inundation
    {
      type: 'Feature',
      properties: {
        id: 'flood-mahanadi',
        name: 'Mahanadi Estuary High Tide Inundation',
        river: 'Mahanadi',
        riskLevel: 'high',
        waterLevel: 'High tidal surge & runoff',
        displacedEstimate: 'Coastal warning',
        color: '#0284c7'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [86.20, 20.50],
            [86.90, 20.55],
            [86.85, 20.00],
            [86.15, 20.10],
            [86.20, 20.50]
          ]
        ]
      }
    }
  ]
}

export const INITIAL_RIVER_GAUGES: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Silchar Annapurna Ghat Gauge', river: 'Barak', level: '20.65 m', danger: '19.83 m', status: 'Overflowing' },
      geometry: { type: 'Point', coordinates: [92.79, 24.83] }
    },
    {
      type: 'Feature',
      properties: { name: 'Guwahati DC Court Gauge', river: 'Brahmaputra', level: '49.80 m', danger: '49.68 m', status: 'Warning Level' },
      geometry: { type: 'Point', coordinates: [91.75, 26.18] }
    },
    {
      type: 'Feature',
      properties: { name: 'Baltara Khagaria Gauge', river: 'Kosi', level: '33.95 m', danger: '33.85 m', status: 'Rising Fast' },
      geometry: { type: 'Point', coordinates: [86.74, 25.52] }
    },
    {
      type: 'Feature',
      properties: { name: 'Naraj Cuttack Barrage Gauge', river: 'Mahanadi', level: '26.10 m', danger: '26.41 m', status: 'High Flow' },
      geometry: { type: 'Point', coordinates: [85.76, 20.47] }
    }
  ]
}

export const floodLayer: ClimateLayer = {
  id: 'flood-zones',
  name: 'Flood Hazard & Basins',
  category: 'flood',
  description: 'River catchment inundation risk polygons, Central Water Commission (CWC) gauge telemetry',
  iconName: 'Waves',
  color: '#0284c7',
  defaultVisible: true,
  sourceIds: ['source-flood-polys', 'source-flood-gauges'],
  layerIds: [
    'layer-flood-fill',
    'layer-flood-line',
    'layer-flood-gauges-pulse',
    'layer-flood-gauges'
  ],

  init(map: Map) {
    if (!map.getSource('source-flood-polys')) {
      map.addSource('source-flood-polys', {
        type: 'geojson',
        data: INITIAL_FLOOD_ZONES,
        tolerance: 0.6,
        buffer: 0
      })
    }

    if (!map.getSource('source-flood-gauges')) {
      map.addSource('source-flood-gauges', {
        type: 'geojson',
        data: INITIAL_RIVER_GAUGES,
        tolerance: 0.5,
        buffer: 0
      })
    }

    // 1. Flood Zone Fill
    if (!map.getLayer('layer-flood-fill')) {
      map.addLayer({
        id: 'layer-flood-fill',
        type: 'fill',
        source: 'source-flood-polys',
        paint: {
          'fill-color': [
            'match',
            ['get', 'riskLevel'],
            'critical', '#0284c7',
            'high', '#0ea5e9',
            'moderate', '#38bdf8',
            '#0284c7'
          ],
          'fill-opacity': 0.32
        }
      })
    }

    // 2. Flood Zone Contour Line
    if (!map.getLayer('layer-flood-line')) {
      map.addLayer({
        id: 'layer-flood-line',
        type: 'line',
        source: 'source-flood-polys',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 1.8,
          'line-opacity': 0.8
        }
      })
    }

    // 3. Gauge pulse halo
    if (!map.getLayer('layer-flood-gauges-pulse')) {
      map.addLayer({
        id: 'layer-flood-gauges-pulse',
        type: 'circle',
        source: 'source-flood-gauges',
        paint: {
          'circle-radius': 9,
          'circle-color': '#0284c7',
          'circle-opacity': 0.25,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#38bdf8'
        }
      })
    }

    // 4. Gauge center marker
    if (!map.getLayer('layer-flood-gauges')) {
      map.addLayer({
        id: 'layer-flood-gauges',
        type: 'circle',
        source: 'source-flood-gauges',
        paint: {
          'circle-radius': 4,
          'circle-color': '#38bdf8',
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      })
    }
  },

  updateData(map: Map, payload: unknown) {
    const source = map.getSource('source-flood-polys') as GeoJSONSource | undefined
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
