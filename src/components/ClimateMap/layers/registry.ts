import type { ClimateLayer } from './types'
import { rainfallLayer } from './rainfallLayer'
import { cycloneLayer } from './cycloneLayer'
import { floodLayer } from './floodLayer'
import { imdAlertsLayer } from './imdAlertsLayer'
import { temperatureHeatmapLayer } from './temperatureHeatmapLayer'
import { usgsQuakesLayer } from './usgsQuakes'

/**
 * WeatherGPT Climate Layer Registry
 *
 * HOW TO ADD A NEW LAYER (e.g., Air Quality / AQI):
 * 1. Create a new file in `layers/myNewLayer.ts` implementing `ClimateLayer`.
 * 2. Import it and call `registerClimateLayer(myNewLayer)`.
 * That's it! ClimateMap will automatically initialize, provide toggle controls,
 * and manage lifecycle without touching core map initialization code.
 */

const registry = new Map<string, ClimateLayer>()

export function registerClimateLayer(layer: ClimateLayer): void {
  registry.set(layer.id, layer)
}

export function unregisterClimateLayer(id: string): void {
  registry.delete(id)
}

export function getRegisteredClimateLayers(): ClimateLayer[] {
  return Array.from(registry.values())
}

export function getClimateLayerById(id: string): ClimateLayer | undefined {
  return registry.get(id)
}

// Register default meteorological and disaster layers
registerClimateLayer(rainfallLayer)
registerClimateLayer(cycloneLayer)
registerClimateLayer(floodLayer)
registerClimateLayer(imdAlertsLayer)
registerClimateLayer(temperatureHeatmapLayer)
registerClimateLayer(usgsQuakesLayer)
