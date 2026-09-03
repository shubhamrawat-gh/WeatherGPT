import { useState, useMemo } from 'react'
import SEO from '../../components/SEO'
import { 
  AlertTriangle, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Info
} from 'lucide-react'
import { INITIAL_ALERTS } from '../../data/weatherMockData'
import type { WeatherAlert } from '../../data/weatherMockData'

export default function AlertsPage() {
  const [alerts] = useState<WeatherAlert[]>(INITIAL_ALERTS)
  const [severityFilter, setSeverityFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSeverity =
        severityFilter === 'ALL' || alert.severity.toLowerCase() === severityFilter.toLowerCase()

      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        alert.title.toLowerCase().includes(query) ||
        alert.region.toLowerCase().includes(query) ||
        alert.affectedDistricts.some((d) => d.toLowerCase().includes(query)) ||
        alert.category.toLowerCase().includes(query)

      return matchesSeverity && matchesSearch
    })
  }, [alerts, severityFilter, searchQuery])

  const stats = useMemo(() => {
    return {
      extreme: alerts.filter((a) => a.severity === 'extreme').length,
      severe: alerts.filter((a) => a.severity === 'severe').length,
      moderate: alerts.filter((a) => a.severity === 'moderate').length,
      minor: alerts.filter((a) => a.severity === 'minor').length,
    }
  }, [alerts])

  return (
    <>
      <SEO
        title="WeatherGPT | Severe Weather Bulletins & Warnings"
        description="Active severe weather advisories, cyclonic storm warnings, and flood alerts across India."
      />

      <div className="flex flex-col h-full w-full bg-[#0a0e14] text-slate-200">
        {/* Page Topbar Header */}
        <div className="h-12 border-b border-[#1c2333] px-6 flex items-center justify-between shrink-0 bg-[#0f141c]/60">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <h1 className="text-xs font-semibold text-white tracking-wide">
              Active Severe Weather Bulletins
            </h1>
            <span className="text-[10px] font-mono text-slate-500 border-l border-[#1c2333] pl-3">
              Total {filteredAlerts.length} Active
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-red-400">{stats.extreme} Extreme</span>
            <span className="text-slate-600">·</span>
            <span className="text-orange-400">{stats.severe} Severe</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400">{stats.moderate} Moderate</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-[#1c2333] bg-[#0f141c]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by state, district, or hazard..."
              className="w-full h-8 pl-9 pr-3 rounded-md bg-[#0a0e14] border border-[#1c2333] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-green transition-colors"
            />
          </div>

          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
            {['ALL', 'EXTREME', 'SEVERE', 'MODERATE', 'MINOR'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-md text-[11px] font-mono font-medium transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-white/[0.08] text-white border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts List Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
            {filteredAlerts.length === 0 ? (
              <div className="py-16 text-center flex flex-col items-center">
                <Info className="w-8 h-8 text-slate-500 mb-2" />
                <h3 className="text-sm font-semibold text-white">No bulletins match current filters</h3>
                <p className="text-xs text-slate-400 mt-1">Try selecting a different severity tier or clear your search.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <article
                  key={alert.id}
                  className="p-5 rounded-lg bg-[#0f141c] border border-[#1c2333] hover:border-slate-700 transition-colors flex flex-col gap-3.5"
                >
                  {/* Top line: Severity badge, category, timestamp */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          alert.severity === 'extreme'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : alert.severity === 'severe'
                            ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                            : alert.severity === 'moderate'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {alert.severity}
                      </span>

                      <span className="text-[11px] font-mono text-brand-green bg-brand-green/10 border border-brand-green/20 px-2 py-0.5 rounded">
                        {alert.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Issued: {alert.issuedAt} · Valid: {alert.validUntil}</span>
                    </div>
                  </div>

                  {/* Title & Region */}
                  <div>
                    <h2 className="text-sm font-semibold text-white tracking-tight leading-snug">
                      {alert.title}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-sans">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{alert.region} ({alert.state})</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {alert.description}
                  </p>

                  {/* Affected Districts */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">
                      Districts:
                    </span>
                    {alert.affectedDistricts.map((district, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-[#151b26] border border-[#1c2333] text-[10px] font-mono text-slate-300"
                      >
                        {district}
                      </span>
                    ))}
                  </div>

                  {/* Recommended Action Checklist */}
                  <div className="pt-3 border-t border-[#1c2333]/80 flex flex-col gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                      Action Directives:
                    </span>
                    <ul className="flex flex-col gap-1 text-xs text-slate-300 font-sans">
                      {alert.recommendedActions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Source Footer */}
                  <div className="text-[10px] font-mono text-slate-500 pt-1">
                    Source: {alert.source}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
