import { useState, useEffect } from 'react'
import { fetchLiveWeather } from '../../../services/weatherService'
import type { LiveWeatherData } from '../../../services/weatherService'
interface WeatherChipProps {
  coordinates?: [number, number] // [lng, lat]
  lat?: number
  lng?: number
  locationName?: string
  hazardType?: string
  compact?: boolean
  className?: string
}

export default function WeatherChip({
  coordinates,
  lat: latProp,
  lng: lngProp,
  locationName,
  hazardType,
  compact = false,
  className = '',
}: WeatherChipProps) {
  const [weather, setWeather] = useState<LiveWeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  const lat = coordinates ? coordinates[1] : latProp ?? 26.1844
  const lng = coordinates ? coordinates[0] : lngProp ?? 91.7362

  useEffect(() => {
    let isMounted = true
    setLoading(true)

    fetchLiveWeather(lat, lng, locationName)
      .then((data) => {
        if (isMounted) {
          setWeather(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [lat, lng, locationName])

  if (loading) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#151b26] border border-[#1c2333] text-slate-400 font-sans text-xs select-none animate-pulse ${className}`}
      >
        <span className="w-3 h-3 rounded-full bg-slate-700"></span>
        <span className="w-10 h-3 rounded bg-slate-700/60"></span>
      </div>
    )
  }

  if (!weather) return null

  const { current, riskAssessment } = weather
  const Icon = current.IconComponent

  // Check if there is a weather-driven cross-reference for this hazard
  const isWeatherHazard =
    hazardType === 'snowfall' ||
    hazardType === 'flood' ||
    hazardType === 'landslide'

  const hasHighRisk =
    riskAssessment.level === 'critical' ||
    riskAssessment.level === 'high' ||
    (isWeatherHazard && (riskAssessment.freezingRisk || riskAssessment.heavyRainRisk))

  const riskBadgeClass =
    riskAssessment.level === 'critical'
      ? 'badge-critical'
      : hasHighRisk
      ? 'badge-warning'
      : 'badge-neutral'

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#151b26] border border-[#1c2333] text-slate-300 font-sans text-xs select-none ${className}`}
        title={`${weather.locationName}: ${current.weatherDescription}, Wind: ${current.windSpeed} km/h (Gusts ${current.windGusts} km/h), Precip: ${current.precipitation} mm/h. ${riskAssessment.summary}`}
      >
        <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-mono text-xs font-normal text-white">{current.temperature}°C</span>
        <span className="text-slate-400 text-[11px] truncate max-w-[90px]">
          {current.weatherDescription}
        </span>
        {riskAssessment.primaryFlag ? (
          <span className={`${riskBadgeClass} text-[9px] px-1 py-0.2 shrink-0`}>
            {riskAssessment.primaryFlag.split('(')[0].trim()}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 rounded-md bg-[#151b26] border border-[#1c2333] text-xs font-sans text-slate-300 select-none ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded flex items-center justify-center bg-white/[0.04] text-slate-300 shrink-0">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-normal text-white">
            {current.temperature}°C
          </span>
          <span className="text-slate-400 text-xs">•</span>
          <span className="text-slate-300 text-xs truncate">
            {current.weatherDescription}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-[10px] text-slate-400">
          Rain: {current.precipitation} mm/h | Gusts: {current.windGusts} km/h
        </span>
        {riskAssessment.primaryFlag ? (
          <span className={riskBadgeClass}>
            {riskAssessment.primaryFlag}
          </span>
        ) : null}
      </div>
    </div>
  )
}
