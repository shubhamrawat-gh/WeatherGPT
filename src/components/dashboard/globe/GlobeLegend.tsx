export default function GlobeLegend() {
  const items = [
    { label: 'Tactical Incident Marker', color: 'bg-red-500 border-red-500/35' },
    { label: 'Relief Asset Deposit', color: 'bg-brand-green border-brand-green/35' },
    { label: 'Risk Hotspot Boundary', color: 'bg-blue-500 border-blue-500/35 animate-pulse' },
  ]

  return (
    <div className="bg-canvas-dark/95 border border-hairline-dark/50 rounded-lg p-3.5 select-none font-mono text-[9px] tracking-wide text-muted-dark w-48 shadow-2xl flex flex-col gap-2">
      <span className="font-bold text-white uppercase text-[8px] tracking-widest border-b border-hairline-dark/30 pb-1.5">
        Globe Legend Key
      </span>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full border ${item.color} shrink-0`} />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
