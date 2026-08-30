export interface HotspotArea {
  id: string
  lat: number
  lng: number
  radius: number // in km or degrees
  riskScore: number // 0 to 1 scale
  hazardType: 'wildfire' | 'flood' | 'earthquake' | 'hurricane' | 'general'
  predictedAt: string
  expiresAt?: string
}

interface HotspotLayerProps {
  hotspots: HotspotArea[]
  visible: boolean
  onHotspotSelect?: (hotspot: HotspotArea) => void
}

/**
 * HotspotLayer Architecture Stub
 * Designed for rendering AI hazard predictions, wildfire boundaries, and heatmaps.
 */
export default function HotspotLayer(_props: HotspotLayerProps) {
  // Rendering is managed directly by the WebGL canvas context in Globe3D.
  // This component serves as the declarative configuration boundary.
  return null
}
