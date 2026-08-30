interface PrioritySelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function PrioritySelector({
  value,
  onChange,
  error,
}: PrioritySelectorProps) {
  const priorities = [
    { name: 'Low', desc: 'General assistance, no immediate danger', border: 'border-slate-800 focus:ring-slate-500/25', activeBg: 'bg-slate-950/45 border-slate-700 text-slate-300' },
    { name: 'Medium', desc: 'Urgent requests, staging requirements', border: 'border-brand-teal focus:ring-brand-green/25', activeBg: 'bg-brand-teal/20 border-brand-teal-mid text-brand-green' },
    { name: 'High', desc: 'High risk to resources or operations', border: 'border-amber-950/40 focus:ring-amber-500/25', activeBg: 'bg-amber-950/30 border-amber-800 text-amber-400' },
    { name: 'Critical', desc: 'Immediate threat to life or safety', border: 'border-red-950/40 focus:ring-red-500/25', activeBg: 'bg-red-950/30 border-red-800 text-red-400' },
  ]

  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-xs font-mono font-bold text-white uppercase tracking-wider select-none">
        Priority Level <span className="text-brand-green">*</span>
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {priorities.map((p) => {
          const isActive = value === p.name
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => onChange(p.name)}
              className={`flex flex-col items-start text-left p-4 rounded-lg border text-sm transition-all duration-200 focus:outline-none focus:ring-1 ${
                isActive 
                  ? p.activeBg 
                  : 'bg-surface-dark/20 border-hairline-dark/70 text-muted-dark hover:border-hairline-dark hover:bg-surface-dark/30'
              } ${p.border}`}
            >
              <span className={`font-semibold ${isActive ? '' : 'text-white'}`}>
                {p.name}
              </span>
              <span className="text-[11px] text-muted-dark/80 mt-1 leading-normal">
                {p.desc}
              </span>
            </button>
          )
        })}
      </div>
      
      {error ? (
        <span className="text-xs text-red-500 font-sans mt-1">
          {error}
        </span>
      ) : null}
    </div>
  )
}
