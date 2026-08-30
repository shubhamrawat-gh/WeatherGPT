import { RotateCcw, Play, Pause, Layers } from 'lucide-react'

interface GlobeControlsProps {
  autoRotate: boolean
  onToggleAutoRotate: () => void
  onResetView: () => void
  activeLayers: string[]
  onToggleLayer: (id: string) => void
}

export default function GlobeControls({
  autoRotate,
  onToggleAutoRotate,
  onResetView,
  activeLayers,
  onToggleLayer,
}: GlobeControlsProps) {
  const layers = [
    { id: 'incident', label: 'Incident Pins Overlay', desc: 'Display global disaster incidents.' },
    { id: 'resource', label: 'Staged Resources Overlay', desc: 'Highlight emergency relief centers.' },
    { id: 'hotspot', label: 'AI Risk Hotspots Overlay', desc: 'Map predictive critical heatmaps.' },
  ]

  const btnClass = 'flex items-center justify-center gap-2 px-4 py-2 bg-surface-dark border border-hairline-dark hover:border-brand-green/30 hover:bg-surface-dark/40 text-white hover:text-brand-green rounded-lg text-xs font-semibold font-sans transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-none'

  return (
    <div className="flex flex-col gap-4 font-sans select-none text-left">
      <div className="flex flex-col gap-1 border-b border-hairline-dark/45 pb-3">
        <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
          Globe Controls
        </h4>
        <p className="text-[10px] text-muted-dark/85 m-0 leading-normal">
          Manage auto-rotation speeds, camera targets, and active coordinates layer filters.
        </p>
      </div>

      {/* Camera & Rotation Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onToggleAutoRotate}
          className={`${btnClass} flex-grow`}
          aria-label={autoRotate ? 'Pause Rotation' : 'Start Rotation'}
        >
          {autoRotate ? (
            <>
              <Pause className="w-3.5 h-3.5" /> Pause Rotate
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> Auto Rotate
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onResetView}
          className={btnClass}
          aria-label="Reset view angle"
          title="Reset Camera Angle"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset View
        </button>
      </div>

      {/* Layer Toggles */}
      <div className="flex flex-col gap-2.5 mt-2">
        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
          <Layers className="w-3.5 h-3.5 text-brand-green" /> Visualization Layers
        </span>

        {layers.map((l) => {
          const isActive = activeLayers.includes(l.id)
          return (
            <div
              key={l.id}
              className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition-all duration-200 ${
                isActive 
                  ? 'bg-brand-green/5 border-brand-teal-mid/50 text-white' 
                  : 'bg-surface-dark/15 border-hairline-dark/50 text-muted-dark hover:border-hairline-dark/70 hover:bg-surface-dark/25'
              }`}
            >
              <div className="flex flex-col gap-0.5 text-left">
                <span className={`text-[11px] font-semibold transition-colors duration-200 ${
                  isActive ? 'text-brand-green' : 'text-white'
                }`}>
                  {l.label}
                </span>
                <span className="text-[10px] text-muted-dark/80 leading-normal">
                  {l.desc}
                </span>
              </div>

              {/* Custom Toggle Switch */}
              <button
                type="button"
                onClick={() => onToggleLayer(l.id)}
                className={`relative inline-flex h-4 w-7.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-0.5 shrink-0 ${
                  isActive ? 'bg-brand-green' : 'bg-slate-800'
                }`}
                aria-pressed={isActive}
                aria-label={`Toggle ${l.label}`}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-canvas-dark shadow ring-0 transition duration-200 ease-in-out ${
                    isActive ? 'translate-x-3.5' : 'translate-x-0'
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
