import { Plus, Minus, RotateCcw, Maximize2, Minimize2, Globe, Map } from 'lucide-react'

interface MapControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onResetView: () => void
  onToggleFullscreen: () => void
  isFullscreen: boolean
  viewMode: 'map' | 'globe'
  onToggleViewMode: () => void
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleFullscreen,
  isFullscreen,
  viewMode,
  onToggleViewMode,
}: MapControlsProps) {
  const btnClass = 'w-9 h-9 rounded-lg bg-canvas-dark/95 border border-hairline-dark/50 hover:border-brand-green/30 text-white hover:text-brand-green flex items-center justify-center transition-all duration-150 shadow-lg focus:outline-none shrink-0 cursor-pointer'

  return (
    <div className="flex flex-col gap-2 select-none">
      {/* Zoom In */}
      <button 
        type="button" 
        onClick={onZoomIn} 
        className={btnClass}
        aria-label="Zoom In"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button 
        type="button" 
        onClick={onZoomOut} 
        className={btnClass}
        aria-label="Zoom Out"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>

      {/* Reset View */}
      <button 
        type="button" 
        onClick={onResetView} 
        className={btnClass}
        aria-label="Reset View"
        title="Reset View"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      {/* View Mode Toggle */}
      <button 
        type="button" 
        onClick={onToggleViewMode} 
        className={btnClass}
        aria-label={viewMode === 'map' ? 'Switch to Globe View' : 'Switch to Map View'}
        title={viewMode === 'map' ? 'Switch to Globe View' : 'Switch to Map View'}
      >
        {viewMode === 'map' ? <Globe className="w-4 h-4" /> : <Map className="w-4 h-4" />}
      </button>

      {/* Fullscreen toggle */}
      <button 
        type="button" 
        onClick={onToggleFullscreen} 
        className={btnClass}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
