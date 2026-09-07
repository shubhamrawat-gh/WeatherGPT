/**
 * Open-Meteo Live Weather Integration Engine
 * Official Integration for https://open-meteo.com/
 * Provides real-time meteorological telemetry and 3-day forecasts for today without API keys.
 */

import { KNOWN_COORDS } from './voiceTools'

export interface OpenMeteoDailyForecast {
  date: string
  dayLabel: string
  condition: string
  maxTemp: number
  minTemp: number
  rainMm: number
  precipitationProbability: number
  windMaxKmH: number
}

export interface OpenMeteoLiveWeather {
  location: string
  country?: string
  coordinates: [number, number]
  temperature: number
  apparentTemperature: number
  relativeHumidity: number
  condition: string
  precipitationMm: number
  rainMm: number
  cloudCover: number
  windSpeedKmH: number
  windDirectionDeg: number
  windGustsKmH: number
  isDay: boolean
  riskLevel: 'low' | 'moderate' | 'high' | 'critical'
  riskSummary: string
  dailyForecast: OpenMeteoDailyForecast[]
  fetchedAt: string
}

// In-memory cache for Open-Meteo telemetry (5 min TTL)
const OPEN_METEO_CACHE = new Map<string, { data: OpenMeteoLiveWeather; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000

/**
 * Standard WMO Weather Code Mapper
 * Translates international meteorological numerical codes into human-readable conditions.
 */
export function mapWmoWeatherCode(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Sky (साफ आसमान)'
    case 1:
      return 'Mainly Clear'
    case 2:
      return 'Partly Cloudy (आंशिक बादल)'
    case 3:
      return 'Overcast (घने बादल)'
    case 45:
    case 48:
      return 'Dense Fog / Mist (घना कोहरा)'
    case 51:
    case 53:
    case 55:
      return 'Light Drizzle / Patchy Showers (बूंदाबांदी)'
    case 61:
      return 'Light Rain (हल्की वर्षा)'
    case 63:
      return 'Moderate Rain (मध्यम बारिश)'
    case 65:
      return 'Heavy Downpour (भारी बारिश)'
    case 66:
    case 67:
      return 'Freezing Rain'
    case 71:
    case 73:
    case 75:
      return 'Snowfall / Flurries (बर्फबारी)'
    case 80:
      return 'Scattered Rain Showers'
    case 81:
      return 'Moderate Monsoon Showers'
    case 82:
      return 'Violent Torrential Rain (अत्यधिक भारी बारिश)'
    case 95:
      return 'Thunderstorm with Gusty Winds (मेघगर्जना व आंधी)'
    case 96:
    case 99:
      return 'Severe Thunderstorm with Hail (आंधी-तूफान व ओलावृष्टि)'
    default:
      return 'Cloudy with Light Showers'
  }
}

/**
 * Fetch live weather and forecast directly from Open-Meteo (https://open-meteo.com/)
 */
export async function fetchOpenMeteoLiveWeather(
  locationQuery = 'New Delhi'
): Promise<OpenMeteoLiveWeather> {
  const norm = (locationQuery || '').toLowerCase().trim()
  const now = Date.now()

  let lat = 28.6139
  let lng = 77.2090
  let resolvedName = locationQuery || 'New Delhi'
  let country = 'India'
  let found = false

  // 1. Instant match in KNOWN_COORDS
  for (const [key, val] of Object.entries(KNOWN_COORDS)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      lat = val.lat
      lng = val.lng
      resolvedName = val.name
      found = true
      break
    }
  }

  // 2. Open-Meteo Geocoding Search Fallback
  if (!found) {
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(norm)}&count=1&language=en&format=json`
      const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(2500) })
      if (geoRes.ok) {
        const geoData = await geoRes.json()
        if (geoData?.results?.[0]) {
          const item = geoData.results[0]
          lat = item.latitude
          lng = item.longitude
          resolvedName = item.name
          country = item.country || 'India'
          found = true
        }
      }
    } catch (err) {
      console.warn('[Open-Meteo Geocoding] Could not geocode location:', locationQuery, err)
    }
  }

  // 3. Check in-memory cache
  const cacheKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`
  const cached = OPEN_METEO_CACHE.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return { ...cached.data, location: resolvedName }
  }

  // 4. Query Open-Meteo Forecast API
  const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FKolkata&forecast_days=3`

  const response = await fetch(forecastUrl, { signal: AbortSignal.timeout(3500) })
  if (!response.ok) {
    throw new Error(`Open-Meteo HTTP ${response.status}: ${response.statusText}`)
  }

  const data = await response.json()
  const cur = data.current || {}
  const daily = data.daily || {}

  const condition = mapWmoWeatherCode(cur.weather_code ?? 2)
  const isStorm = (cur.weather_code ?? 0) >= 95
  const isHeavyRain = (cur.precipitation ?? 0) > 4 || (daily.precipitation_sum?.[0] ?? 0) > 30
  const isExtremeHeat = (cur.temperature_2m ?? 0) >= 42 || (cur.apparent_temperature ?? 0) >= 45

  let riskLevel: 'low' | 'moderate' | 'high' | 'critical' = 'low'
  let riskSummary = 'Normal meteorological conditions within safe ranges.'

  if (isStorm) {
    riskLevel = 'critical'
    riskSummary = 'Severe thunderstorm with high convective activity and lightning danger.'
  } else if (isHeavyRain) {
    riskLevel = 'high'
    riskSummary = 'Intense precipitation with flash flooding and waterlogging risk.'
  } else if (isExtremeHeat) {
    riskLevel = 'high'
    riskSummary = 'Severe heatwave conditions. High heat index risk.'
  } else if ((cur.wind_gusts_10m ?? 0) > 45) {
    riskLevel = 'moderate'
    riskSummary = `Gusty crosswinds exceeding ${Math.round(cur.wind_gusts_10m)} km/h.`
  }

  const dayLabels = ['Today', 'Tomorrow', 'Day After']
  const dailyForecast: OpenMeteoDailyForecast[] = (daily.time || []).map((dStr: string, idx: number) => ({
    date: dStr,
    dayLabel: dayLabels[idx] || `Day +${idx}`,
    condition: mapWmoWeatherCode(daily.weather_code?.[idx] ?? 2),
    maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? 30),
    minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? 22),
    rainMm: daily.precipitation_sum?.[idx] ?? 0,
    precipitationProbability: daily.precipitation_probability_max?.[idx] ?? 0,
    windMaxKmH: Math.round(daily.wind_speed_10m_max?.[idx] ?? 12),
  }))

  const result: OpenMeteoLiveWeather = {
    location: resolvedName,
    country,
    coordinates: [lat, lng],
    temperature: Math.round((cur.temperature_2m ?? 26) * 10) / 10,
    apparentTemperature: Math.round((cur.apparent_temperature ?? cur.temperature_2m ?? 28) * 10) / 10,
    relativeHumidity: Math.round(cur.relative_humidity_2m ?? 65),
    condition,
    precipitationMm: cur.precipitation ?? 0,
    rainMm: cur.rain ?? 0,
    cloudCover: cur.cloud_cover ?? 40,
    windSpeedKmH: Math.round(cur.wind_speed_10m ?? 10),
    windDirectionDeg: Math.round(cur.wind_direction_10m ?? 0),
    windGustsKmH: Math.round(cur.wind_gusts_10m ?? 15),
    isDay: Boolean(cur.is_day),
    riskLevel,
    riskSummary,
    dailyForecast,
    fetchedAt: new Date().toISOString(),
  }

  OPEN_METEO_CACHE.set(cacheKey, {
    data: result,
    expiresAt: now + CACHE_TTL_MS,
  })

  return result
}
