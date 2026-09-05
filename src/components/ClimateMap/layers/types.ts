import type { Map } from 'mapbox-gl'

export interface ClimateLayerMeta {
  id: string
  name: string
  category: 'radar' | 'cyclone' | 'flood' | 'alerts' | 'temperature' | 'earthquake'
  description: string
  iconName: string
  color: string
  defaultVisible: boolean
}

export interface ClimateLayer extends ClimateLayerMeta {
  /** Mapbox layer IDs managed by this logical layer */
  layerIds: string[]
  /** Mapbox source IDs managed by this logical layer */
  sourceIds: string[]
  /** Called once when map is loaded or when style reloads */
  init: (map: Map) => void
  /** Fast setData() update without recreating sources or layers */
  updateData?: (map: Map, payload: unknown) => void
  /** Fast setFilter() update */
  setFilter?: (map: Map, filterValue: unknown) => void
  /** Clean up sources and layers */
  destroy?: (map: Map) => void
}

/**
 * Safely sets visibility on an array of Mapbox layers
 */
export function toggleMapboxLayersVisibility(
  map: Map,
  layerIds: string[],
  visible: boolean
): void {
  const visibilityValue = visible ? 'visible' : 'none'
  for (const layerId of layerIds) {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, 'visibility', visibilityValue)
    }
  }
}
