export interface AIProvider {
  id: string
  name: string
  description: string
  capabilities: string[]
  supportedFormats: string[]
}

export interface AnalysisConfig {
  providerId: string
  selectedModules: string[]
  filesCount: number
}

export const AVAILABLE_PROVIDERS: AIProvider[] = [
  {
    id: 'gemini',
    name: 'Google Gemini 2.5 Pro Multimodal Vision',
    description: 'High-accuracy Sub-Himalayan slope analysis, optical drone rockfall vectoring, and automated MDoNER situation briefs.',
    capabilities: ['slope_stability', 'flood_inundation', 'route_accessibility', 'buffer_proximity'],
    supportedFormats: ['drone-orthophoto', 'satellite-sentinel2', 'dem-elevation', 'telemetry-log']
  },
  {
    id: 'isro_bhuvan',
    name: 'ISRO Bhuvan & CartoSat-3 Terrain Engine',
    description: 'Indigenous high-resolution stereoscopic terrain elevation modeling and active landslide scar classification.',
    capabilities: ['slope_stability', 'route_accessibility'],
    supportedFormats: ['satellite-sentinel2', 'dem-elevation', 'geotiff']
  },
  {
    id: 'imd_doppler',
    name: 'IMD North East Doppler Radar Pipeline',
    description: 'Live radar reflectivity and soil saturation modeling for Barail Ridge, Meghalaya Escarpment, and Brahmaputra Floodplain.',
    capabilities: ['flood_inundation', 'slope_stability'],
    supportedFormats: ['radar-reflectivity', 'telemetry-log']
  },
  {
    id: 'local_edge',
    name: 'BRO Mobile Convoy Edge Node (YOLO-v11)',
    description: 'Offline-compatible edge AI deployed on lead patrol vehicles for real-time rockfall and chokepoint detection.',
    capabilities: ['route_accessibility', 'slope_stability'],
    supportedFormats: ['optical-dashcam', 'drone-orthophoto']
  }
]

export function getProviderById(id: string): AIProvider | undefined {
  return AVAILABLE_PROVIDERS.find(p => p.id === id)
}
