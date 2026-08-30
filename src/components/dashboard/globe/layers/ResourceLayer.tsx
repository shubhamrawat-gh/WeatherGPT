export interface ResourcePoint {
  id: string
  lat: number
  lng: number
  name: string
  type: 'shelter' | 'hospital' | 'water' | 'food' | 'supplies'
  status: 'available' | 'depleted' | 'critical'
  quantity?: number
  updatedAt: string
}

interface ResourceLayerProps {
  resources: ResourcePoint[]
  visible: boolean
  onResourceSelect?: (resource: ResourcePoint) => void
}

/**
 * ResourceLayer Architecture Stub
 * Designed for future rendering of relief assets, supply drops, and search/rescue assets.
 */
export default function ResourceLayer(_props: ResourceLayerProps) {
  // Rendering is managed directly by the WebGL canvas context in Globe3D.
  // This component serves as the declarative configuration boundary.
  return null
}
