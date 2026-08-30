interface MapLegendProps {
  activeLayers?: string[]
}

export default function MapLegend({ activeLayers = [] }: MapLegendProps) {
  const items = [
    { label: 'Staging Grounds', color: 'bg-brand-green border-brand-green/35' },
    { label: 'Incident Hotspots', color: 'bg-red-500 border-red-500/35 animate-pulse' },
    { label: 'Asset Deposits', color: 'bg-blue-500 border-blue-500/35' },
    { label: 'Corridors / Risks', color: 'bg-amber-500 border-amber-500/35' },
  ]

  return (
    <div className="bg-canvas-dark/95 border border-hairline-dark/50 rounded-lg p-3.5 select-none font-mono text-[9px] tracking-wide text-muted-dark w-44 shadow-2xl flex flex-col gap-2.5">
      <span className="font-bold text-white uppercase text-[8px] tracking-widest border-b border-hairline-dark/30 pb-1.5">
        Map Key / Legend
      </span>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full border ${item.color} shrink-0`} />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      {activeLayers.includes('earthquake') && (
        <div className="flex flex-col gap-1.5 border-t border-hairline-dark/30 pt-2.5 mt-0.5">
          <span className="font-bold text-white uppercase text-[8px] tracking-widest pb-0.5">
            Earthquake Mag
          </span>
          <div className="flex items-center justify-between text-[8px] text-muted-dark/85 font-mono">
            <span>M1.0</span>
            <span>M6.0+</span>
          </div>
          <div className="h-2 w-full rounded bg-gradient-to-r from-[hsl(151,83%,34%)] to-[hsl(5,69%,54%)] border border-white/[0.05]" />
        </div>
      )}
    </div>
  )
}
