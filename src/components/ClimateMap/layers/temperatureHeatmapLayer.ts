import type { Map, GeoJSONSource } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'
import type { ClimateLayer } from './types'

export const INITIAL_TEMPERATURE_STATIONS: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Mumbai Colaba', tempC: 28.5, humidity: 88, status: 'Warm & Humid' },
      geometry: { type: 'Point', coordinates: [72.8777, 19.0760] }
    },
    {
      type: 'Feature',
      properties: { name: 'Delhi Safdarjung', tempC: 41.2, humidity: 42, status: 'Severe Heat' },
      geometry: { type: 'Point', coordinates: [77.2090, 28.6139] }
    },
    {
      type: 'Feature',
      properties: { name: 'Kolkata Alipore', tempC: 32.0, humidity: 82, status: 'Humid Heat' },
      geometry: { type: 'Point', coordinates: [88.3639, 22.5726] }
    },
    {
      type: 'Feature',
      properties: { name: 'Chennai Meenambakkam', tempC: 33.4, humidity: 76, status: 'Coastal Swelter' },
      geometry: { type: 'Point', coordinates: [80.2707, 13.0827] }
    },
    {
      type: 'Feature',
      properties: { name: 'Bengaluru HAL', tempC: 24.2, humidity: 68, status: 'Pleasant' },
      geometry: { type: 'Point', coordinates: [77.5946, 12.9716] }
    },
    {
      type: 'Feature',
      properties: { name: 'Guwahati Borjhar', tempC: 27.8, humidity: 91, status: 'Rain Cooled' },
      geometry: { type: 'Point', coordinates: [91.7362, 26.1445] }
    },
    {
      type: 'Feature',
      properties: { name: 'Jaipur Sanganer', tempC: 44.8, humidity: 24, status: 'Extreme Heatwave' },
      geometry: { type: 'Point', coordinates: [75.7873, 26.9124] }
    },
    {
      type: 'Feature',
      properties: { name: 'Bikaner Arid Hub', tempC: 46.1, humidity: 19, status: 'Extreme Heatwave' },
      geometry: { type: 'Point', coordinates: [73.3119, 28.0229] }
    },
    {
      type: 'Feature',
      properties: { name: 'Nagpur Sonegaon', tempC: 43.5, humidity: 38, status: 'Severe Heatwave' },
      geometry: { type: 'Point', coordinates: [79.0882, 21.1458] }
    },
    {
      type: 'Feature',
      properties: { name: 'Bhubaneswar Airport', tempC: 30.2, humidity: 85, status: 'Cloud Cover' },
      geometry: { type: 'Point', coordinates: [85.8245, 20.2961] }
    },
    {
      type: 'Feature',
      properties: { name: 'Kochi Naval Base', tempC: 27.4, humidity: 90, status: 'Coastal Rain' },
      geometry: { type: 'Point', coordinates: [76.2673, 9.9312] }
    },
    {
      type: 'Feature',
      properties: { name: 'Shimla Ridge', tempC: 17.5, humidity: 75, status: 'Cool Hill Station' },
      geometry: { type: 'Point', coordinates: [77.1734, 31.1048] }
    },
    {
      type: 'Feature',
      properties: { name: 'Srinagar Aerodrome', tempC: 21.0, humidity: 55, status: 'Mild' },
      geometry: { type: 'Point', coordinates: [74.7973, 34.0837] }
    }
  ]
}

export const temperatureHeatmapLayer: ClimateLayer = {
  id: 'temperature-heatmap',
  name: 'Temperature & Heatwave',
  category: 'temperature',
  description: 'WebGL thermal gradient heatmap and regional surface temperature anomaly points',
  iconName: 'Thermometer',
  color: '#f97316',
  defaultVisible: false,
  sourceIds: ['source-temp-stations'],
  layerIds: [
    'layer-temp-heatmap',
    'layer-temp-circle',
    'layer-temp-labels'
  ],

  init(map: Map) {
    if (!map.getSource('source-temp-stations')) {
      map.addSource('source-temp-stations', {
        type: 'geojson',
        data: INITIAL_TEMPERATURE_STATIONS,
        tolerance: 0.5,
        buffer: 0
      })
    }

    // 1. Thermal Heatmap Layer
    if (!map.getLayer('layer-temp-heatmap')) {
      map.addLayer({
        id: 'layer-temp-heatmap',
        type: 'heatmap',
        source: 'source-temp-stations',
        maxzoom: 9,
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'tempC'],
            15, 0.2,
            30, 0.6,
            45, 1.0
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 0.7,
            8, 1.8
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(30, 58, 138, 0)',
            0.2, 'rgba(59, 130, 246, 0.45)',  // Cool Blue
            0.4, 'rgba(16, 185, 129, 0.6)',   // Mild Green
            0.6, 'rgba(234, 179, 8, 0.75)',   // Warm Yellow
            0.8, 'rgba(249, 115, 22, 0.85)',  // Hot Orange
            1.0, 'rgba(239, 68, 68, 0.92)'    // Severe Red Heatwave
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            3, 22,
            8, 65
          ],
          'heatmap-opacity': 0.75
        }
      })
    }

    // 2. Point circle at higher zoom levels
    if (!map.getLayer('layer-temp-circle')) {
      map.addLayer({
        id: 'layer-temp-circle',
        type: 'circle',
        source: 'source-temp-stations',
        minzoom: 6,
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'tempC'],
            15, '#3b82f6',
            25, '#10b981',
            35, '#eab308',
            42, '#ef4444'
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#ffffff'
        }
      })
    }

    // 3. Station Temperature Labels
    if (!map.getLayer('layer-temp-labels')) {
      map.addLayer({
        id: 'layer-temp-labels',
        type: 'symbol',
        source: 'source-temp-stations',
        minzoom: 6.5,
        layout: {
          'text-field': ['concat', ['to-string', ['get', 'tempC']], '°C'],
          'text-size': 11,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.2],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#0a0a0a',
          'text-halo-width': 1.5
        }
      })
    }
  },

  updateData(map: Map, payload: unknown) {
    const source = map.getSource('source-temp-stations') as GeoJSONSource | undefined
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
