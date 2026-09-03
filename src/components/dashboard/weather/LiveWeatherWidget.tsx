import { useState, useEffect } from 'react'
import { 
  CloudRain, 
  Wind, 
  Droplets, 
  Layers, 
  RefreshCw, 
  Thermometer,
  ShieldAlert,
} from 'lucide-react'
import { fetchLiveWeather } from '../../../services/weatherService'
import type { LiveWeatherData } from '../../../services/weatherService'

const PRESET_LOCATIONS = [
  { name: 'Sonapur Tunnel (NH-6 Meghalaya)', coords: [92.3812, 25.1845] as [number, number], state: 'Meghalaya' },
  { name: 'Pagla Pahar Landslide Zone (NH-29)', coords: [93.7412, 25.8612] as [number, number], state: 'Nagaland' },
  { name: 'Guwahati Logistics Hub', coords: [91.7362, 26.1844] as [number, number], state: 'Assam' },
  { name: 'Shillong Staging Depot', coords: [91.8933, 25.5788] as [number, number], state: 'Meghalaya' },
  { name: 'Kohima Terminal Depot', coords: [94.1086, 25.6751] as [number, number], state: 'Nagaland' },
  { name: 'Gangtok Freight Staging', coords: [88.6138, 27.3389] as [number, number], state: 'Sikkim' },
  { name: 'Tawang High-Altitude Base', coords: [91.8687, 27.5861] as [number, number], state: 'Arunachal Pradesh' },
  { name: 'Imphal Multimodal Depot', coords: [93.9368, 24.8170] as [number, number], state: 'Manipur' },
  { name: 'Aizawl Buffer Yard', coords: [92.7176, 23.7271] as [number, number], state: 'Mizoram' },
  { name: 'Agartala Trade Hub', coords: [91.2868, 23.8315] as [number, number], state: 'Tripura' },
]

export default function LiveWeatherWidget() {
  const [selectedLocation, setSelectedLocation] = useState(PRESET_LOCATIONS[0])
  const [weatherData, setWeatherData] = useState<LiveWeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'current' | 'risk' | 'hourly' | '3day'>('current')

  const loadWeather = async (loc = selectedLocation) => {
    setLoading(true)
    const [lng, lat] = loc.coords
    const data = await fetchLiveWeather(lat, lng, loc.name)
    setWeatherData(data)
    setLoading(false)
  }

  useEffect(() => {
    loadWeather(selectedLocation)
  }, [selectedLocation])

  return (
    <div className="rounded-lg border border-[#1c2333] bg-[#0f141c] p-4 flex flex-col gap-4 font-sans text-xs text-left shadow-sm">
      {/* Top Header & Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c2333] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-[#151b26] border border-[#1c2333] flex items-center justify-center text-slate-300 shrink-0">
            <CloudRain className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-xs">Open-Meteo Live Forecast Telemetry</span>
              <span className="badge-neutral text-[9px]">
                WMO Direct
              </span>
            </div>
            <p className="text-[11px] text-slate-400 m-0">
              Live precipitation, wind gusts, freezing levels, and operational hazard flags
            </p>
          </div>
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLocation.name}
            onChange={(e) => {
              const found = PRESET_LOCATIONS.find((l) => l.name === e.target.value)
              if (found) setSelectedLocation(found)
            }}
            className="bg-[#151b26] border border-[#1c2333] rounded-md px-2.5 py-1 text-xs font-sans text-white cursor-pointer focus:outline-none focus:border-slate-500"
          >
            {PRESET_LOCATIONS.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => loadWeather()}
            disabled={loading}
            className="btn-ghost h-8 w-8"
            title="Refresh Open-Meteo Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-green' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1c2333] pb-1 gap-1.5 font-sans text-xs">
        {[
          { id: 'current', label: 'Live weather' },
          { id: 'risk', label: 'Risk assessment' },
          { id: 'hourly', label: '24h hourly forecast' },
          { id: '3day', label: '3-day outlook' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white/[0.06] text-white border border-[#1c2333]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Views */}
      {weatherData ? (
        <div>
          {/* TAB 1: LIVE CURRENT WEATHER */}
          {activeTab === 'current' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-sans text-xs">
              <div className="p-2.5 rounded-md bg-[#151b26] border border-[#1c2333] flex flex-col gap-1">
                <span className="card-stat-label flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-slate-400" /> Temperature:
                </span>
                <span className="text-lg font-mono font-semibold text-white">
                  {weatherData.current.temperature}°C
                </span>
                <span className="card-metadata text-[11px]">
                  {weatherData.current.weatherDescription}
                </span>
              </div>

              <div className="p-2.5 rounded-md bg-[#151b26] border border-[#1c2333] flex flex-col gap-1">
                <span className="card-stat-label flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-slate-400" /> Precipitation:
                </span>
                <span className="text-lg font-mono font-semibold text-slate-200">
                  {weatherData.current.precipitation} mm/h
                </span>
                <span className="card-metadata text-[11px]">
                  Cloud cover: {weatherData.current.cloudCover}%
                </span>
              </div>

              <div className="p-2.5 rounded-md bg-[#151b26] border border-[#1c2333] flex flex-col gap-1">
                <span className="card-stat-label flex items-center gap-1">
                  <Wind className="w-3 h-3 text-slate-400" /> Wind &amp; Gusts:
                </span>
                <span className="text-lg font-mono font-semibold text-white">
                  {weatherData.current.windSpeed} km/h
                </span>
                <span className="card-metadata text-[11px]">
                  Gusts up to {weatherData.current.windGusts} km/h
                </span>
              </div>

              <div className="p-2.5 rounded-md bg-[#151b26] border border-[#1c2333] flex flex-col gap-1">
                <span className="card-stat-label flex items-center gap-1">
                  <Layers className="w-3 h-3 text-slate-400" /> Visibility &amp; Elevation:
                </span>
                <span className="text-lg font-mono font-semibold text-slate-200">
                  {(weatherData.current.visibilityMeters / 1000).toFixed(1)} km
                </span>
                <span className="card-metadata text-[11px]">
                  Elev: {weatherData.elevationMeters}m ASL
                </span>
              </div>
            </div>
          ) : null}

          {/* TAB 2: WEATHER RISK ASSESSMENT */}
          {activeTab === 'risk' ? (
            <div className="flex flex-col gap-2.5 text-xs font-sans">
              <div className="p-3 rounded-md bg-[#151b26] border border-[#1c2333] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-xs flex items-center gap-1.5">
                    <ShieldAlert
                      className={`w-3.5 h-3.5 ${
                        weatherData.riskAssessment.level === 'critical'
                          ? 'text-red-400'
                          : weatherData.riskAssessment.level === 'high'
                          ? 'text-orange-400'
                          : 'text-amber-400'
                      }`}
                    />
                    Operational Weather Risk: <span className="font-mono text-white">{weatherData.riskAssessment.level.toUpperCase()}</span>
                  </div>
                  <p className="card-metadata text-[11px] mt-1 m-0">
                    {weatherData.riskAssessment.summary}
                  </p>
                </div>
                <span
                  className={
                    weatherData.riskAssessment.level === 'critical'
                      ? 'badge-critical'
                      : weatherData.riskAssessment.level === 'high'
                      ? 'badge-warning'
                      : 'badge-normal'
                  }
                >
                  {weatherData.riskAssessment.primaryFlag || 'Normal Conditions'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded bg-[#151b26] border border-[#1c2333]">
                  <span className="card-stat-label block mb-0.5">Freezing / Ice Hazard:</span>
                  <span className={weatherData.riskAssessment.freezingRisk ? 'text-red-400 font-medium' : 'text-emerald-400'}>
                    {weatherData.riskAssessment.freezingRisk ? 'Active Hazard' : 'Low Risk'}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#151b26] border border-[#1c2333]">
                  <span className="card-stat-label block mb-0.5">Heavy Rain / Mudslip:</span>
                  <span className={weatherData.riskAssessment.heavyRainRisk ? 'text-red-400 font-medium' : 'text-emerald-400'}>
                    {weatherData.riskAssessment.heavyRainRisk ? 'Active Hazard' : 'Low Risk'}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#151b26] border border-[#1c2333]">
                  <span className="card-stat-label block mb-0.5">High Ridge Gusts:</span>
                  <span className={weatherData.riskAssessment.highWindRisk ? 'text-amber-400 font-medium' : 'text-emerald-400'}>
                    {weatherData.riskAssessment.highWindRisk ? 'Active Hazard' : 'Normal'}
                  </span>
                </div>
                <div className="p-2 rounded bg-[#151b26] border border-[#1c2333]">
                  <span className="card-stat-label block mb-0.5">Visibility Degradation:</span>
                  <span className={weatherData.riskAssessment.lowVisibilityRisk ? 'text-amber-400 font-medium' : 'text-emerald-400'}>
                    {weatherData.riskAssessment.lowVisibilityRisk ? 'Active Fog' : 'Good'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* TAB 3: 24H HOURLY PRECIPITATION */}
          {activeTab === 'hourly' ? (
            <div className="flex flex-col gap-2 text-xs">
              <span className="card-metadata text-[11px]">Next 12 Hours Forecast &amp; Rain Probability:</span>
              <div className="flex gap-2 overflow-x-auto pb-1.5">
                {weatherData.hourly.time.slice(0, 12).map((t, idx) => {
                  const hour = t.split('T')[1] || t
                  const prob = weatherData.hourly.precipitationProbability[idx] ?? 0
                  const rainMm = weatherData.hourly.precipitation[idx] ?? 0
                  const temp = weatherData.hourly.temperature[idx] ?? 24
                  return (
                    <div
                      key={t}
                      className="p-2 rounded-md bg-[#151b26] border border-[#1c2333] flex flex-col items-center gap-1 min-w-[64px] shrink-0"
                    >
                      <span className="text-slate-400 font-mono text-[10px]">{hour}</span>
                      <span className="text-white font-mono font-medium text-xs">{temp}°C</span>
                      <div className="w-full h-6 bg-[#0f141c] rounded flex items-end overflow-hidden">
                        <div
                          className="w-full bg-blue-500/70 transition-all"
                          style={{ height: `${prob}%` }}
                        />
                      </div>
                      <span className="text-slate-300 font-mono text-[10px]">{prob}%</span>
                      <span className="text-[9px] text-slate-500 font-mono">{rainMm}mm</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* TAB 4: 3-DAY OUTLOOK */}
          {activeTab === '3day' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {weatherData.daily.time.map((d, idx) => {
                const rainSum = weatherData.daily.precipitationSum[idx] ?? 5
                const prob = weatherData.daily.precipitationProbabilityMax[idx] ?? 50
                const windMax = weatherData.daily.windSpeedMax[idx] ?? 15
                const gustMax = weatherData.daily.windGustsMax[idx] ?? 25
                const dayName = new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

                return (
                  <div
                    key={d}
                    className="p-3 rounded-md bg-[#151b26] border border-[#1c2333] flex flex-col items-start gap-1"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-semibold text-white text-xs">{dayName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{prob}% rain</span>
                    </div>
                    <div className="flex justify-between items-center w-full card-metadata text-[11px] mt-1 pt-1 border-t border-[#1c2333]">
                      <span>Precipitation:</span>
                      <span className="font-mono text-slate-200">{rainSum} mm</span>
                    </div>
                    <div className="flex justify-between items-center w-full card-metadata text-[11px]">
                      <span>Max Wind / Gusts:</span>
                      <span className="font-mono text-slate-200">{windMax} / {gustMax} km/h</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="p-4 text-center text-slate-400 font-sans text-xs">
          Loading Open-Meteo telemetry...
        </div>
      )}
    </div>
  )
}
