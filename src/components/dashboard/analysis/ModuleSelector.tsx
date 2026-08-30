import { ShieldAlert, Cpu, HardHat, Compass, AlertTriangle } from 'lucide-react'

export interface AnalysisModule {
  id: string
  name: string
  description: string
  icon: any
  status: 'operational' | 'in_development' | 'beta'
}

interface ModuleSelectorProps {
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

export const MODULES: AnalysisModule[] = [
  {
    id: 'damage_assessment',
    name: 'Damage Assessment',
    description: 'Scans structures, calculates roof destruction indexes, and maps damage severity boundaries (Computer Vision).',
    icon: ShieldAlert,
    status: 'operational'
  },
  {
    id: 'infrastructure_analysis',
    name: 'Infrastructure Analysis',
    description: 'Scans transportation lines, identifies blocked roads, collapsed bridges, and power grid failures.',
    icon: HardHat,
    status: 'operational'
  },
  {
    id: 'resource_detection',
    name: 'Resource Detection',
    description: 'Identifies rescue vehicles, evacuation bases, tents, clean water drops, and staging coordinates.',
    icon: Cpu,
    status: 'beta'
  },
  {
    id: 'situational_intelligence',
    name: 'Situational Intelligence',
    description: 'Synthesizes textual intelligence reports and overlays to build command summaries (LLM multimodal).',
    icon: Compass,
    status: 'operational'
  },
  {
    id: 'risk_assessment',
    name: 'Risk Assessment',
    description: 'Calculates future flooding margins, wildfire progression pathways, and secondary landslide indicators.',
    icon: AlertTriangle,
    status: 'in_development'
  }
]

export default function ModuleSelector({ selectedIds, onSelectionChange }: ModuleSelectorProps) {
  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(x => x !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const statusBadges = {
    operational: {
      label: 'Operational',
      color: 'text-brand-green bg-brand-green/5 border-brand-green/15'
    },
    beta: {
      label: 'Beta Staging',
      color: 'text-blue-400 bg-blue-400/5 border-blue-400/15'
    },
    in_development: {
      label: 'Planned',
      color: 'text-muted-dark/75 bg-surface-dark border-hairline-dark/40'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full select-none text-left">
      {MODULES.map((module) => {
        const isSelected = selectedIds.includes(module.id)
        const Icon = module.icon
        const badge = statusBadges[module.status]

        return (
          <div
            key={module.id}
            onClick={() => toggleSelection(module.id)}
            className={`flex flex-col gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-brand-green/5 border-brand-teal-mid/60 shadow-[0_0_15px_rgba(0,237,100,0.06)]'
                : 'bg-surface-dark/15 border-hairline-dark/50 hover:border-hairline-dark hover:bg-surface-dark/25'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center border shrink-0 transition-colors duration-200 ${
                  isSelected
                    ? 'bg-brand-teal-deep border-brand-green/30 text-brand-green'
                    : 'bg-surface-dark border-hairline-dark text-muted-dark/85'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <span className={`text-[12px] font-semibold transition-colors duration-200 ${
                  isSelected ? 'text-brand-green' : 'text-white'
                }`}>
                  {module.name}
                </span>
              </div>

              {/* Status Badge */}
              <span className={`text-[8px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border uppercase ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            <p className="text-[10px] text-muted-dark/85 leading-relaxed m-0 pr-2">
              {module.description}
            </p>

            {/* Custom Checkbox Indicator */}
            <div className="flex justify-end mt-1">
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 ${
                isSelected 
                  ? 'bg-brand-green border-brand-green text-canvas-dark' 
                  : 'bg-transparent border-hairline-dark/80'
              }`}>
                {isSelected ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : null}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
