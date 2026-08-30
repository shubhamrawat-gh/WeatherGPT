import { useOutletContext } from 'react-router-dom'
import LayerPanel from '../../components/dashboard/maps/LayerPanel'

interface MapContextType {
  activeLayers: string[]
  onToggleLayer: (layerName: string) => void
}

export default function MapLayersPage() {
  const { activeLayers, onToggleLayer } = useOutletContext<MapContextType>()

  return (
    <LayerPanel 
      activeLayers={activeLayers} 
      onToggleLayer={onToggleLayer} 
    />
  )
}
