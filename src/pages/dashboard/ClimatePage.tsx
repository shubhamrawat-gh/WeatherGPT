import SEO from '../../components/SEO'
import { BarChart3, TrendingUp, CloudRain, Thermometer } from 'lucide-react'
import { CLIMATE_TRENDS, REGIONAL_CLIMATE_STATS } from '../../data/weatherMockData'

export default function ClimatePage() {
  const maxRain = Math.max(...CLIMATE_TRENDS.map((t) => Math.max(t.actualRainfall, t.normalRainfall)))

  return (
    <>
      <SEO
        title="WeatherGPT | Climate Analytics & Monsoon Trends"
        description="Historical rainfall departures, seasonal monsoon tracking, and meteorological subdivision climate anomalies."
      />

      <div className="flex flex-col h-full w-full dark:bg-[#0a0e14] bg-[#f8fafc] dark:text-slate-200 text-slate-800">
        {/* Page Topbar Header */}
        <div className="h-12 border-b dark:border-white/[0.08] border-slate-200 px-6 flex items-center justify-between shrink-0 dark:bg-[#0a0a0a] bg-white">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-4 h-4 text-brand-green" />
            <h1 className="text-xs font-semibold dark:text-white text-slate-900 tracking-wide">
              Climate Analytics &amp; Monsoon Ledger
            </h1>
          </div>

          <div className="text-[11px] font-mono dark:text-slate-400 text-slate-600">
            Season: Southwest Monsoon (Kharif) · Baseline: 1971–2020 LPA
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            
            {/* 3 Metric Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 flex flex-col gap-1.5 shadow-xs">
                <div className="flex items-center justify-between dark:text-slate-400 text-slate-500">
                  <span className="text-[10px] font-mono uppercase tracking-wider">All-India Monsoon LPA</span>
                  <CloudRain className="w-4 h-4 text-brand-green" />
                </div>
                <div className="text-2xl font-bold font-mono dark:text-white text-slate-900 mt-1">104.2%</div>
                <span className="text-[11px] text-brand-green font-mono">
                  +4.2% Departure (Normal Category)
                </span>
              </div>

              <div className="p-4 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 flex flex-col gap-1.5 shadow-xs">
                <div className="flex items-center justify-between dark:text-slate-400 text-slate-500">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Annual Mean Temp Anomaly</span>
                  <Thermometer className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono dark:text-white text-slate-900 mt-1">+0.54°C</div>
                <span className="text-[11px] text-amber-500 font-mono">
                  Above normal baseline trend
                </span>
              </div>

              <div className="p-4 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 flex flex-col gap-1.5 shadow-xs">
                <div className="flex items-center justify-between dark:text-slate-400 text-slate-500">
                  <span className="text-[10px] font-mono uppercase tracking-wider">Active Subdivisions</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold font-mono dark:text-white text-slate-900 mt-1">28 / 36</div>
                <span className="text-[11px] dark:text-slate-400 text-slate-500 font-mono">
                  Normal to Excess rainfall receipt
                </span>
              </div>
            </div>

            {/* Monthly Precipitation Comparison (CSS Bar Chart) */}
            <div className="p-5 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold dark:text-white text-slate-900 tracking-tight">
                    Monthly Precipitation: Actual vs. 50-Year LPA Normal (mm)
                  </h2>
                  <p className="text-xs dark:text-slate-400 text-slate-500 mt-0.5">
                    Data source: IMD Hydrometeorology Division &amp; National Climate Centre
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-brand-green" />
                    <span className="dark:text-slate-300 text-slate-700">Actual 2026</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm dark:bg-slate-600 bg-slate-400" />
                    <span className="dark:text-slate-400 text-slate-500">LPA Normal</span>
                  </div>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 border-b dark:border-white/[0.08] border-slate-200">
                {CLIMATE_TRENDS.map((t) => {
                  const actualHeight = Math.round((t.actualRainfall / maxRain) * 100)
                  const normalHeight = Math.round((t.normalRainfall / maxRain) * 100)

                  return (
                    <div key={t.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        {/* Actual bar */}
                        <div
                          style={{ height: `${actualHeight}%` }}
                          className="w-2.5 sm:w-3.5 bg-brand-green/85 rounded-t-sm transition-all group-hover:bg-brand-green"
                          title={`${t.month} Actual: ${t.actualRainfall} mm`}
                        />
                        {/* Normal bar */}
                        <div
                          style={{ height: `${normalHeight}%` }}
                          className="w-2.5 sm:w-3.5 dark:bg-slate-700/80 bg-slate-300 rounded-t-sm transition-all dark:group-hover:bg-slate-600 group-hover:bg-slate-400"
                          title={`${t.month} Normal: ${t.normalRainfall} mm`}
                        />
                      </div>
                      <span className="text-[10px] font-mono dark:text-slate-400 text-slate-500 mt-2">
                        {t.month}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Regional Meteorological Breakdown Table */}
            <div className="p-5 rounded-xl dark:bg-[#121212] bg-white border dark:border-white/[0.08] border-slate-200 shadow-xs">
              <h2 className="text-sm font-semibold dark:text-white text-slate-900 tracking-tight mb-1">
                Regional Subdivision Climate Matrix
              </h2>
              <p className="text-xs dark:text-slate-400 text-slate-500 mb-4">
                Real-time regional status across major agro-climatic and geographical divisions
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b dark:border-white/[0.08] border-slate-200 text-[10px] font-mono uppercase tracking-wider dark:text-slate-500 text-slate-500">
                      <th className="pb-3 font-semibold">Subdivision Region</th>
                      <th className="pb-3 font-semibold">Avg Temp</th>
                      <th className="pb-3 font-semibold">Humidity</th>
                      <th className="pb-3 font-semibold">Rain Departure</th>
                      <th className="pb-3 font-semibold">Monsoon Status</th>
                      <th className="pb-3 font-semibold">UV Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-white/[0.06] divide-slate-100">
                    {REGIONAL_CLIMATE_STATS.map((row, idx) => (
                      <tr key={idx} className="dark:hover:bg-white/[0.02] hover:bg-slate-50 transition-colors">
                        <td className="py-3 font-medium dark:text-slate-200 text-slate-900">{row.region}</td>
                        <td className="py-3 font-mono dark:text-slate-300 text-slate-700">{row.avgTemp}°C</td>
                        <td className="py-3 font-mono dark:text-slate-300 text-slate-700">{row.humidity}%</td>
                        <td className="py-3 font-mono">
                          <span
                            className={
                              row.rainfallDeparture >= 0
                                ? 'text-brand-green'
                                : 'text-orange-500'
                            }
                          >
                            {row.rainfallDeparture >= 0 ? `+${row.rainfallDeparture}%` : `${row.rainfallDeparture}%`}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              row.monsoonStatus === 'Vigorous'
                                ? 'bg-blue-500/15 text-blue-500 border border-blue-500/20'
                                : row.monsoonStatus === 'Active'
                                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                                : row.monsoonStatus === 'Normal'
                                ? 'dark:bg-slate-500/15 bg-slate-100 dark:text-slate-300 text-slate-700 border dark:border-slate-500/20 border-slate-300'
                                : 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                            }`}
                          >
                            {row.monsoonStatus}
                          </span>
                        </td>
                        <td className="py-3 font-mono dark:text-slate-300 text-slate-700">{row.uvIndex} / 11</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
