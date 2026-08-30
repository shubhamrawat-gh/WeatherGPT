export interface IncidentPoint {
  id: string
  lat: number
  lng: number
  title: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string
  reportedAt: string
}

interface IncidentLayerProps {
  incidents: IncidentPoint[]
  visible: boolean
  onIncidentSelect?: (incident: IncidentPoint) => void
}

/**
 * IncidentLayer Architecture Stub
 * Designed for future rendering of disaster alerts and crisis events on the 3D globe.
 */
export default function IncidentLayer(_props: IncidentLayerProps) {
  // Rendering is managed directly by the WebGL canvas context in Globe3D.
  // This component serves as the declarative configuration boundary.
  return null
}
