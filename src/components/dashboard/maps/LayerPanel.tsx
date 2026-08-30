import { ShieldAlert, MapPin, Layers, AlertTriangle, CloudRain, Cpu, Activity } from 'lucide-react'

interface Layer {
  id: string
  name: string
  description: string
  icon: any
}

interface LayerPanelProps {
  activeLayers: string[]
  onToggleLayer: (layerName: string) => void
}

export default function LayerPanel({ activeLayers, onToggleLayer }: LayerPanelProps) {
  const layers: Layer[] = [
    {
      id: 'incident',
      name: 'Incident Layer',
      description: 'Active emergency locations, flood marks, and regional blockages.',
      icon: ShieldAlert,
    },
    {
      id: 'resource',
      name: 'Resource Layer',
      description: 'Staged shelter ground assets, food deposits, and medical clinics.',
      icon: MapPin,
    },
    {
      id: 'earthquake',
      name: 'Earthquakes Layer',
      description: 'USGS real-time global earthquake feeds and magnitude overlays.',
      icon: Activity,
    },
    {
      id: 'satellite',
      name: 'Satellite Tile Base',
      description: 'High-resolution base satellite orthophotos (OpenStreetMap hybrid).',
      icon: Layers,
    },
    {
      id: 'risk',
      name: 'Risk Layer',
      description: 'Landslide hazard corridors, seismic fault lines, and flood zones.',
      icon: AlertTriangle,
    },
    {
      id: 'weather',
      name: 'Weather Layer',
      description: 'Live doppler wind flows, storm trackers, and atmospheric gauges.',
      icon: CloudRain,
    },
    {
      id: 'ai',
      name: 'AI Analysis Layer',
      description: 'Computed damage overlays and automated resource staging vectors.',
      icon: Cpu,
    },
  ]

  return (
    <div className="flex flex-col gap-4 font-sans select-none text-left">
      <div className="flex flex-col gap-1 border-b border-hairline-dark/40 pb-3">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          Geospatial Map Layers
        </h4>
        <p className="text-[10px] text-muted-dark/85 m-0 leading-normal">
          Toggle layers to superimpose disaster overlays onto the OpenStreetMap canvas.
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {layers.map((layer) => {
          const isActive = activeLayers.includes(layer.id)
          const Icon = layer.icon
          return (
            <div
              key={layer.id}
              className={`flex items-start justify-between gap-4 p-3.5 rounded-lg border transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-green/5 border-brand-teal-mid/50 text-white' 
                  : 'bg-surface-dark/15 border-hairline-dark/50 text-muted-dark hover:border-hairline-dark/70 hover:bg-surface-dark/25'
              }`}
            >
              <div className="flex gap-3">
                <div className={`w-8.5 h-8.5 rounded-md flex items-center justify-center border shrink-0 transition-colors duration-200 ${
                  isActive 
                    ? 'bg-brand-teal-deep/80 border-brand-green/35 text-brand-green' 
                    : 'bg-surface-dark border-hairline-dark text-muted-dark/70'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <span className={`text-[12px] font-semibold transition-colors duration-200 ${
                    isActive ? 'text-brand-green' : 'text-white'
                  }`}>
                    {layer.name}
                  </span>
                  <p className="text-[10px] text-muted-dark/85 leading-relaxed m-0 pr-2">
                    {layer.description}
                  </p>
                </div>
              </div>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                onClick={() => onToggleLayer(layer.id)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 shrink-0 ${
                  isActive ? 'bg-brand-green' : 'bg-slate-800'
                }`}
                aria-pressed={isActive}
                aria-label={`Toggle ${layer.name}`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-canvas-dark shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
