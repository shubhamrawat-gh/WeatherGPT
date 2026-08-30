import { Globe, X, Target, Info } from 'lucide-react'

interface CountryPanelProps {
  country: any
  onClear: () => void
}

export default function CountryPanel({ country, onClear }: CountryPanelProps) {
  if (!country) return null

  return (
    <div className="flex flex-col gap-4 font-sans select-none text-left bg-surface-dark/10 border border-hairline-dark/50 rounded-xl p-4 relative">
      {/* Close Button */}
      <button
        type="button"
        onClick={onClear}
        className="absolute top-3 right-3 text-muted-dark hover:text-white transition-colors duration-150 cursor-pointer focus:outline-none"
        aria-label="Clear country selection"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2.5 pb-2 border-b border-hairline-dark/30">
        <Globe className="w-4.5 h-4.5 text-brand-green" />
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          Target Locked: {country.ADMIN || 'Region Detail'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 font-mono text-[10px] text-muted-dark leading-relaxed">
        <div className="flex flex-col">
          <span className="text-muted-dark/70 text-[9px] uppercase tracking-wider">Formal Name</span>
          <span className="text-white font-semibold">{country.SOVEREIGNT || country.ADMIN}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-dark/70 text-[9px] uppercase tracking-wider">ISO Code</span>
          <span className="text-white font-semibold">{country.ISO_A3 || 'N/A'}</span>
        </div>
        <div className="flex flex-col col-span-2 border-t border-hairline-dark/20 pt-2 flex flex-col gap-1">
          <span className="text-muted-dark/70 text-[9px] uppercase tracking-wider flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-brand-green" /> Regional Telemetry Staged
          </span>
          <p className="text-[10px] font-sans text-muted-dark leading-relaxed m-0">
            Satellite image pipelines and localized hazard maps will sync here on future Phase 8 deployment.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-brand-green bg-brand-green/5 border border-brand-green/20 rounded-lg p-2.5 mt-1">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span className="font-sans leading-snug">Telemetry staging active. No local alerts logged in this boundary sector.</span>
      </div>
    </div>
  )
}
