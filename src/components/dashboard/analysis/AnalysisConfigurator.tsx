import { AVAILABLE_PROVIDERS } from '../../../services/aiProvider'
import ModuleSelector from './ModuleSelector'
import { BrainCircuit, Info } from 'lucide-react'

interface AnalysisConfiguratorProps {
  selectedProviderId: string
  onProviderChange: (id: string) => void
  selectedModuleIds: string[]
  onModulesChange: (ids: string[]) => void
}

export default function AnalysisConfigurator({
  selectedProviderId,
  onProviderChange,
  selectedModuleIds,
  onModulesChange,
}: AnalysisConfiguratorProps) {
  const selectedProvider = AVAILABLE_PROVIDERS.find(p => p.id === selectedProviderId) || AVAILABLE_PROVIDERS[0]

  return (
    <div className="flex flex-col gap-6 select-none w-full text-left">
      {/* Provider Selection */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <BrainCircuit className="w-4 h-4 text-brand-green" /> Core AI Model Provider
        </span>
        
        <div className="relative">
          <select
            value={selectedProviderId}
            onChange={(e) => onProviderChange(e.target.value)}
            className="w-full h-12 bg-canvas-dark border border-hairline-dark hover:border-hairline-dark-strong/80 rounded-lg px-4 py-2 text-xs text-white focus:outline-none appearance-none cursor-pointer"
            aria-label="Select AI Model Provider"
          >
            {AVAILABLE_PROVIDERS.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
          {/* Custom Select Arrow */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-muted-dark">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Selected Provider Info */}
        <div className="p-3.5 rounded-lg border border-hairline-dark/45 bg-surface-dark/10 flex gap-3 text-[10px] text-muted-dark/85 font-sans leading-relaxed">
          <Info className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-white uppercase tracking-wider text-[9px] font-mono">
              Provider Capabilities
            </span>
            <p className="m-0 text-muted-dark/85 leading-normal">
              {selectedProvider.description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {selectedProvider.supportedFormats.map(f => (
                <span key={f} className="px-2 py-0.5 rounded bg-brand-teal-deep border border-brand-green/15 font-mono text-[8px] uppercase tracking-wider text-brand-green/80">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modules Selector */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
          Active Diagnostic Modules Suite
        </span>
        <ModuleSelector
          selectedIds={selectedModuleIds}
          onSelectionChange={onModulesChange}
        />
      </div>
    </div>
  )
}
