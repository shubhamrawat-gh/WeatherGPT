import { Shield, Target } from 'lucide-react'

interface GlobeStatusCardProps {
  selectedCountry: any
  activeLayersCount: number
}

export default function GlobeStatusCard({
  selectedCountry,
  activeLayersCount,
}: GlobeStatusCardProps) {
  return (
    <div className="flex flex-col gap-4 font-sans select-none text-left">
      <div className="flex flex-col gap-1 border-b border-hairline-dark/45 pb-3">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Global Situational Awareness
        </h3>
        <p className="text-[10px] text-muted-dark/85 m-0 leading-normal">
          Real-time global tactical visualization overlay. Monitor international alerts and boundary definitions.
        </p>
      </div>

      {/* Target Regional Focus details */}
      <div className="bg-surface-dark/15 border border-hairline-dark/30 rounded-xl p-4 flex flex-col gap-3">
        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-hairline-dark/20 pb-2">
          <Target className="w-3.5 h-3.5 text-brand-green" /> Regional Target Focus
        </span>
        
        {selectedCountry ? (
          <div className="flex flex-col gap-1.5 font-mono text-[10px] text-muted-dark">
            <div className="flex justify-between">
              <span>Admin Unit:</span>
              <span className="text-white font-semibold">{selectedCountry.ADMIN}</span>
            </div>
            <div className="flex justify-between">
              <span>ISO Alpha-3:</span>
              <span className="text-white font-semibold">{selectedCountry.ISO_A3}</span>
            </div>
            <div className="flex justify-between">
              <span>Geocoding Status:</span>
              <span className="text-brand-green font-semibold flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-brand-green inline-block animate-pulse" />
                LOCKED
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-[10px] text-muted-dark/70 font-mono">
            No active region selected. Double-click a country on the 3D globe to lock telemetry focus.
          </div>
        )}
      </div>

      {/* Operational Summary */}
      <div className="flex flex-col gap-2 bg-surface-dark/15 border border-hairline-dark/30 rounded-xl p-4">
        <div className="flex items-center gap-2 text-white text-xs font-semibold">
          <Shield className="w-4 h-4 text-brand-green font-sans" />
          <span>Operational Summary</span>
        </div>
        <p className="text-[10px] text-muted-dark/80 leading-relaxed m-0 font-sans">
          Central tactical feed reports global disaster intelligence nodes are <span className="text-brand-green font-mono">STANDBY</span>. Active layers: <span className="text-brand-green font-mono">{activeLayersCount}</span>.
        </p>
      </div>
    </div>
  )
}
