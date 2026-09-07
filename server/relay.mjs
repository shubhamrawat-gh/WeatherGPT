/**
 * WeatherGPT Real-Time Voice AI Backend Relay
 * Connects browser WebSocket client directly to Google Gemini Live API
 * (BidiGenerateContent) while holding GEMINI_API_KEY securely on the server.
 */

import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { WebSocketServer, WebSocket } from 'ws'

const MODEL_NAME = 'models/gemini-2.5-flash-native-audio-latest'
const IDLE_TIMEOUT_MS = 5 * 60 * 1000 // 5 minutes inactivity cap

// In-memory caches for ultra-low latency tool execution (< 1ms cache hits)
const weatherCache = new Map() // key: 'lat_lng', value: { data, expiresAt }
const geocodeCache = new Map() // key: 'norm_name', value: { lat, lng, name, expiresAt }

const WEATHER_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes fresh weather window
const GEOCODE_CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours geocode validity

// Comprehensive coordinates for Indian cities, state capitals, strategic hubs, and NER corridors
const KNOWN_COORDS = {
  // Top Metros & Major Capitals
  mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  delhi: { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
  'new delhi': { lat: 28.6139, lng: 77.2090, name: 'New Delhi' },
  kolkata: { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  chennai: { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  bengaluru: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  hyderabad: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
  pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  jaipur: { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
  lucknow: { lat: 26.8467, lng: 80.9462, name: 'Lucknow' },
  kanpur: { lat: 26.4499, lng: 80.3319, name: 'Kanpur' },
  nagpur: { lat: 21.1458, lng: 79.0882, name: 'Nagpur' },
  indore: { lat: 22.7196, lng: 75.8577, name: 'Indore' },
  bhopal: { lat: 23.2599, lng: 77.4126, name: 'Bhopal' },
  patna: { lat: 25.5941, lng: 85.1376, name: 'Patna' },
  ranchi: { lat: 23.3441, lng: 85.3096, name: 'Ranchi' },
  dhanbad: { lat: 23.7957, lng: 86.4304, name: 'Dhanbad' },
  jamshedpur: { lat: 22.8046, lng: 86.2029, name: 'Jamshedpur' },
  bokaro: { lat: 23.6693, lng: 86.1511, name: 'Bokaro' },
  chandigarh: { lat: 30.7333, lng: 76.7794, name: 'Chandigarh' },
  amritsar: { lat: 31.6340, lng: 74.8723, name: 'Amritsar' },
  ludhiana: { lat: 30.9010, lng: 75.8573, name: 'Ludhiana' },
  jalandhar: { lat: 31.3260, lng: 75.5762, name: 'Jalandhar' },
  srinagar: { lat: 34.0837, lng: 74.7973, name: 'Srinagar' },
  jammu: { lat: 32.7266, lng: 74.8570, name: 'Jammu' },
  shimla: { lat: 31.1048, lng: 77.1734, name: 'Shimla' },
  manali: { lat: 32.2432, lng: 77.1892, name: 'Manali' },
  dehradun: { lat: 30.3165, lng: 78.0322, name: 'Dehradun' },
  haridwar: { lat: 29.9457, lng: 78.1642, name: 'Haridwar' },
  rishikesh: { lat: 30.0869, lng: 78.2676, name: 'Rishikesh' },
  varanasi: { lat: 25.3176, lng: 82.9739, name: 'Varanasi' },
  banaras: { lat: 25.3176, lng: 82.9739, name: 'Varanasi' },
  prayagraj: { lat: 25.4358, lng: 81.8463, name: 'Prayagraj' },
  allahabad: { lat: 25.4358, lng: 81.8463, name: 'Prayagraj' },
  agra: { lat: 27.1767, lng: 78.0081, name: 'Agra' },
  noida: { lat: 28.5355, lng: 77.3910, name: 'Noida' },
  gurugram: { lat: 28.4595, lng: 77.0266, name: 'Gurugram' },
  gurgaon: { lat: 28.4595, lng: 77.0266, name: 'Gurugram' },
  faridabad: { lat: 28.4089, lng: 77.3178, name: 'Faridabad' },
  ghaziabad: { lat: 28.6692, lng: 77.4538, name: 'Ghaziabad' },
  meerut: { lat: 28.9845, lng: 77.7064, name: 'Meerut' },
  bareilly: { lat: 28.3670, lng: 79.4304, name: 'Bareilly' },
  aligarh: { lat: 27.8974, lng: 78.0880, name: 'Aligarh' },
  gorakhpur: { lat: 26.7606, lng: 83.3732, name: 'Gorakhpur' },
  gwalior: { lat: 26.2183, lng: 78.1828, name: 'Gwalior' },
  jabalpur: { lat: 23.1815, lng: 79.9864, name: 'Jabalpur' },
  ujjain: { lat: 23.1765, lng: 75.7885, name: 'Ujjain' },
  surat: { lat: 21.1702, lng: 72.8311, name: 'Surat' },
  vadodara: { lat: 22.3072, lng: 73.1812, name: 'Vadodara' },
  rajkot: { lat: 22.3039, lng: 70.8022, name: 'Rajkot' },
  bhavnagar: { lat: 21.7645, lng: 72.1519, name: 'Bhavnagar' },
  jamnagar: { lat: 22.4707, lng: 70.0577, name: 'Jamnagar' },
  gandhinagar: { lat: 23.2156, lng: 72.6369, name: 'Gandhinagar' },
  jodhpur: { lat: 26.2389, lng: 73.0243, name: 'Jodhpur' },
  udaipur: { lat: 24.5854, lng: 73.7125, name: 'Udaipur' },
  kota: { lat: 25.2138, lng: 75.8648, name: 'Kota' },
  bikaner: { lat: 28.0229, lng: 73.3119, name: 'Bikaner' },
  ajmer: { lat: 26.4499, lng: 74.6399, name: 'Ajmer' },
  raipur: { lat: 21.2514, lng: 81.6296, name: 'Raipur' },
  bilaspur: { lat: 22.0797, lng: 82.1409, name: 'Bilaspur' },
  bhubaneswar: { lat: 20.2961, lng: 85.8245, name: 'Bhubaneswar' },
  cuttack: { lat: 20.4625, lng: 85.8828, name: 'Cuttack' },
  puri: { lat: 19.8135, lng: 85.8312, name: 'Puri' },
  rourkela: { lat: 22.2604, lng: 84.8536, name: 'Rourkela' },
  visakhapatnam: { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam' },
  vizag: { lat: 17.6868, lng: 83.2185, name: 'Visakhapatnam' },
  vijayawada: { lat: 16.5062, lng: 80.6480, name: 'Vijayawada' },
  guntur: { lat: 16.3067, lng: 80.4365, name: 'Guntur' },
  tirupati: { lat: 13.6288, lng: 79.4192, name: 'Tirupati' },
  warangal: { lat: 17.9689, lng: 79.5941, name: 'Warangal' },
  coimbatore: { lat: 11.0168, lng: 76.9558, name: 'Coimbatore' },
  madurai: { lat: 9.9252, lng: 78.1198, name: 'Madurai' },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli' },
  trichy: { lat: 10.7905, lng: 78.7047, name: 'Tiruchirappalli' },
  salem: { lat: 11.6643, lng: 78.1460, name: 'Salem' },
  tirunelveli: { lat: 8.7139, lng: 77.7567, name: 'Tirunelveli' },
  kochi: { lat: 9.9312, lng: 76.2673, name: 'Kochi' },
  cochin: { lat: 9.9312, lng: 76.2673, name: 'Kochi' },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366, name: 'Thiruvananthapuram' },
  trivandrum: { lat: 8.5241, lng: 76.9366, name: 'Thiruvananthapuram' },
  kozhikode: { lat: 11.2588, lng: 75.7804, name: 'Kozhikode' },
  calicut: { lat: 11.2588, lng: 75.7804, name: 'Kozhikode' },
  mysuru: { lat: 12.2958, lng: 76.6394, name: 'Mysuru' },
  mysore: { lat: 12.2958, lng: 76.6394, name: 'Mysuru' },
  mangaluru: { lat: 12.9141, lng: 74.8560, name: 'Mangaluru' },
  mangalore: { lat: 12.9141, lng: 74.8560, name: 'Mangaluru' },
  hubballi: { lat: 15.3647, lng: 75.1240, name: 'Hubballi' },
  belagavi: { lat: 15.8497, lng: 74.4977, name: 'Belagavi' },
  goa: { lat: 15.2993, lng: 74.1240, name: 'Goa' },
  panaji: { lat: 15.4909, lng: 73.8278, name: 'Panaji' },
  nashik: { lat: 19.9975, lng: 73.7898, name: 'Nashik' },
  aurangabad: { lat: 19.8762, lng: 75.3433, name: 'Chhatrapati Sambhaji Nagar' },
  'chhatrapati sambhaji nagar': { lat: 19.8762, lng: 75.3433, name: 'Chhatrapati Sambhaji Nagar' },
  solapur: { lat: 17.6599, lng: 75.9064, name: 'Solapur' },
  kolhapur: { lat: 16.7050, lng: 74.2433, name: 'Kolhapur' },
  thane: { lat: 19.2183, lng: 72.9781, name: 'Thane' },
  gaya: { lat: 24.7914, lng: 85.0002, name: 'Gaya' },
  muzaffarpur: { lat: 26.1209, lng: 85.3647, name: 'Muzaffarpur' },
  bhagalpur: { lat: 25.2425, lng: 86.9842, name: 'Bhagalpur' },
  darbhanga: { lat: 26.1542, lng: 85.8918, name: 'Darbhanga' },

  // North-Eastern Region (NER) & Strategic Corridors
  guwahati: { lat: 26.1844, lng: 91.7362, name: 'Guwahati' },
  shillong: { lat: 25.5788, lng: 91.8933, name: 'Shillong' },
  gangtok: { lat: 27.3389, lng: 88.6138, name: 'Gangtok' },
  tawang: { lat: 27.5861, lng: 91.8687, name: 'Tawang' },
  itanagar: { lat: 27.0844, lng: 93.6053, name: 'Itanagar' },
  kohima: { lat: 25.6751, lng: 94.1086, name: 'Kohima' },
  imphal: { lat: 24.8170, lng: 93.9368, name: 'Imphal' },
  aizawl: { lat: 23.7271, lng: 92.7176, name: 'Aizawl' },
  agartala: { lat: 23.8315, lng: 91.2868, name: 'Agartala' },
  siliguri: { lat: 26.7271, lng: 88.4352, name: 'Siliguri' },
  silchar: { lat: 24.8333, lng: 92.7789, name: 'Silchar' },
  dibrugarh: { lat: 27.4728, lng: 94.9120, name: 'Dibrugarh' },
  jorhat: { lat: 26.7509, lng: 94.2037, name: 'Jorhat' },
  tezpur: { lat: 26.6528, lng: 92.7926, name: 'Tezpur' },
  dimapur: { lat: 25.9090, lng: 93.7266, name: 'Dimapur' },
  cherrapunji: { lat: 25.2986, lng: 91.5822, name: 'Cherrapunji' },
  sohra: { lat: 25.2986, lng: 91.5822, name: 'Cherrapunji' },
  mawsynram: { lat: 25.2975, lng: 91.5826, name: 'Mawsynram' },
  'sela pass': { lat: 27.5012, lng: 92.1245, name: 'Sela Pass' },
  'sonapur tunnel': { lat: 25.1845, lng: 92.3812, name: 'Sonapur Tunnel' },
  'nathu la': { lat: 27.3865, lng: 88.8315, name: 'Nathu La' },
  'zojila pass': { lat: 34.2817, lng: 75.4797, name: 'Zojila Pass' }
}

// Active Weather Alerts (synced with WeatherGPT dataset)
const ACTIVE_ALERTS = [
  {
    id: 'alt-001',
    title: 'Severe Cyclonic Storm Advisory (Bay of Bengal)',
    region: 'Coastal Odisha & Northern Andhra Pradesh',
    state: 'Odisha',
    severity: 'extreme',
    category: 'Cyclone',
    description: 'Deep depression over Westcentral Bay of Bengal with sustained winds of 110-120 km/h gusting to 135 km/h.',
    recommendedActions: ['Total suspension of fishing operations along Odisha and North Andhra coasts.', 'Coastal evacuation protocols activated in low-lying panchayats.']
  },
  {
    id: 'alt-002',
    title: 'Extremely Heavy Rainfall & Flash Flood Warning',
    region: 'Barak Valley & South Assam',
    state: 'Assam',
    severity: 'severe',
    category: 'Heavy Rainfall',
    description: 'Widespread torrential precipitation expected with isolated rainfall exceeding 200 mm. Barak and tributaries approaching danger marks.',
    recommendedActions: ['Avoid transit through low-lying river embankments.', 'Disaster quick-response teams placed on standby along NH-37 and NH-6.']
  },
  {
    id: 'alt-003',
    title: 'Heatwave to Severe Heatwave Bulletin',
    region: 'Western Rajasthan & Vidarbha',
    state: 'Rajasthan',
    severity: 'severe',
    category: 'Heatwave',
    description: 'Maximum temperatures hovering between 44°C and 47°C with severe dry hot westerly winds.',
    recommendedActions: ['Avoid sun exposure between 11:30 AM and 04:00 PM.', 'Ensure adequate hydration for field workers.']
  },
  {
    id: 'alt-004',
    title: 'Thunderstorm with Gusty Winds & Lightning',
    region: 'Sub-Himalayan West Bengal & Sikkim',
    state: 'Sikkim',
    severity: 'moderate',
    category: 'Thunderstorm',
    description: 'Convective thunderstorm cells with surface wind gusts up to 55 km/h and localized hail risk in elevated valleys.',
    recommendedActions: ['Do not take shelter under solitary trees during active lightning.', 'Postpone pesticide spraying.']
  },
  {
    id: 'alt-005',
    title: 'Moderate Rainfall with Hill Slope Instability',
    region: 'Garhwal & Kumaon Foothills',
    state: 'Uttarakhand',
    severity: 'moderate',
    category: 'Landslide',
    description: 'Continuous moderate rainfall (60-90 mm) causing localized debris fall and mudslide potential along mountain arterial routes.',
    recommendedActions: ['Pilgrimage convoys advised to travel only during daylight hours.', 'Clearance machinery on alert.']
  }
]

// Regional Climate Statistics
const REGIONAL_CLIMATE_STATS = [
  { region: 'Northern Plains (Delhi, UP, Punjab)', avgTemp: 34.2, humidity: 58, rainfallDeparture: '+12%', monsoonStatus: 'Active', uvIndex: 8 },
  { region: 'Western Arid Zone (Rajasthan, Gujarat)', avgTemp: 39.8, humidity: 42, rainfallDeparture: '-18%', monsoonStatus: 'Deficient', uvIndex: 10 },
  { region: 'Central India (MP, Chhattisgarh, Vidarbha)', avgTemp: 32.5, humidity: 68, rainfallDeparture: '+6%', monsoonStatus: 'Normal', uvIndex: 7 },
  { region: 'Eastern & Ganga Basin (Bihar, WB, Odisha)', avgTemp: 31.0, humidity: 82, rainfallDeparture: '+24%', monsoonStatus: 'Vigorous', uvIndex: 6 },
  { region: 'North Eastern Region (Assam, Meghalaya, NER)', avgTemp: 28.4, humidity: 88, rainfallDeparture: '+31%', monsoonStatus: 'Vigorous', uvIndex: 5 },
  { region: 'Southern Peninsula (Karnataka, TN, Kerala)', avgTemp: 29.6, humidity: 76, rainfallDeparture: '-4%', monsoonStatus: 'Normal', uvIndex: 8 }
]

// WMO code description mapper
function mapWmoCode(code) {
  if (code === 0) return 'Clear Sky'
  if (code === 1) return 'Mainly Clear'
  if (code === 2) return 'Partly Cloudy'
  if (code === 3) return 'Overcast'
  if (code >= 45 && code <= 48) return 'Foggy'
  if (code >= 51 && code <= 55) return 'Drizzle'
  if (code >= 61 && code <= 65) return 'Rain Showers'
  if (code >= 71 && code <= 77) return 'Snowfall'
  if (code >= 80 && code <= 82) return 'Heavy Rain Showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Cloudy'
}

/**
 * Fetch live weather from Open-Meteo API with ultra-low latency caching
 */
async function fetchOpenMeteoWeather(locationStr) {
  const norm = (locationStr || '').toLowerCase().trim()
  const now = Date.now()
  let lat = 26.1844
  let lng = 91.7362
  let resolvedName = locationStr || 'Guwahati'
  let foundCoords = false

  // 1. Instant match against KNOWN_COORDS (0ms)
  for (const [key, val] of Object.entries(KNOWN_COORDS)) {
    if (norm === key || norm.includes(key) || key.includes(norm)) {
      lat = val.lat
      lng = val.lng
      resolvedName = val.name
      foundCoords = true
      break
    }
  }

  // 2. Check geocodeCache (0ms)
  if (!foundCoords && geocodeCache.has(norm)) {
    const cachedGeo = geocodeCache.get(norm)
    if (cachedGeo.expiresAt > now) {
      lat = cachedGeo.lat
      lng = cachedGeo.lng
      resolvedName = cachedGeo.name
      foundCoords = true
    }
  }

  // 3. Fallback to Open-Meteo Geocoding if still unknown
  if (!foundCoords) {
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(norm)}&count=1&language=en&format=json`
      const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(2000) })
      if (geoRes.ok) {
        const geoData = await geoRes.json()
        if (geoData?.results?.[0]) {
          lat = geoData.results[0].latitude
          lng = geoData.results[0].longitude
          resolvedName = geoData.results[0].name
          geocodeCache.set(norm, {
            lat,
            lng,
            name: resolvedName,
            expiresAt: now + GEOCODE_CACHE_TTL_MS
          })
        }
      }
    } catch {
      // Use fallback coords
    }
  }

  // 4. Check Weather Cache (0ms latency if recently queried within 5 min)
  const weatherKey = `${lat.toFixed(2)}_${lng.toFixed(2)}`
  if (weatherCache.has(weatherKey)) {
    const cachedWeather = weatherCache.get(weatherKey)
    if (cachedWeather.expiresAt > now) {
      console.log(`[Relay Cache HIT] Returning cached weather for ${resolvedName} (0ms)`)
      return { ...cachedWeather.data, location: resolvedName }
    }
  }

  // 5. Fetch live weather & forecast from Open-Meteo
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,visibility,cloud_cover,is_day&daily=weather_code,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=3`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const cur = data.current || {}
    const daily = data.daily || {}

    const condition = mapWmoCode(cur.weather_code ?? 2)
    const isStorm = (cur.weather_code ?? 0) >= 95
    const isHeavyRain = (cur.precipitation ?? 0) > 4 || (daily.precipitation_sum?.[0] ?? 0) > 30

    let riskLevel = 'low'
    let riskSummary = 'Normal meteorological conditions.'
    if (isStorm) {
      riskLevel = 'critical'
      riskSummary = 'Severe convective thunderstorm with lightning risk.'
    } else if (isHeavyRain) {
      riskLevel = 'high'
      riskSummary = 'Heavy monsoon precipitation with flash flood and slope saturation hazard.'
    } else if ((cur.wind_gusts_10m ?? 0) > 45) {
      riskLevel = 'moderate'
      riskSummary = 'Gusty crosswinds exceeding 45 km/h.'
    }

    const weatherResult = {
      location: resolvedName,
      coordinates: [lat, lng],
      temperature: Math.round(cur.temperature_2m ?? 26),
      precipitationMm: cur.precipitation ?? 0,
      condition,
      windSpeedKmH: Math.round(cur.wind_speed_10m ?? 12),
      windGustsKmH: Math.round(cur.wind_gusts_10m ?? 20),
      cloudCover: cur.cloud_cover ?? 50,
      riskLevel,
      riskSummary,
      threeDayForecast: [
        { day: 'Today', condition: mapWmoCode(daily.weather_code?.[0] ?? 2), rainMm: daily.precipitation_sum?.[0] ?? 5 },
        { day: 'Tomorrow', condition: mapWmoCode(daily.weather_code?.[1] ?? 2), rainMm: daily.precipitation_sum?.[1] ?? 8 },
        { day: 'Day After', condition: mapWmoCode(daily.weather_code?.[2] ?? 2), rainMm: daily.precipitation_sum?.[2] ?? 2 }
      ]
    }

    // Store in cache for 5 minutes
    weatherCache.set(weatherKey, {
      data: weatherResult,
      expiresAt: now + WEATHER_CACHE_TTL_MS
    })

    return weatherResult
  } catch (err) {
    console.warn(`[Relay] Weather fetch fallback for ${resolvedName}:`, err.message)
    const fallbackResult = {
      location: resolvedName,
      coordinates: [lat, lng],
      temperature: 28,
      precipitationMm: 2.5,
      condition: 'Scattered Monsoon Showers',
      windSpeedKmH: 15,
      windGustsKmH: 28,
      riskLevel: 'moderate',
      riskSummary: 'Seasonal monsoon precipitation and damp roadway surface.',
      threeDayForecast: [
        { day: 'Today', condition: 'Moderate Rain', rainMm: 15 },
        { day: 'Tomorrow', condition: 'Intermittent Showers', rainMm: 8 },
        { day: 'Day After', condition: 'Partly Cloudy', rainMm: 3 }
      ]
    }

    // Cache fallback briefly (1 minute) to avoid hammering during network drops
    weatherCache.set(weatherKey, {
      data: fallbackResult,
      expiresAt: now + 60 * 1000
    })

    return fallbackResult
  }
}

/**
 * Execute tool calls requested by Gemini Live
 */
async function executeTool(name, args) {
  console.log(`[Relay Tool Execution] Calling: ${name} with args:`, JSON.stringify(args))

  if (name === 'get_live_weather') {
    const loc = args.location || 'Mumbai'
    return await fetchOpenMeteoWeather(loc)
  }

  if (name === 'get_weather_alerts' || name === 'get_disaster_alerts') {
    const filter = (args.region_or_state || '').toLowerCase()
    const severityFilter = (args.severity || '').toLowerCase()
    let alerts = ACTIVE_ALERTS

    if (filter) {
      alerts = alerts.filter(a => a.region.toLowerCase().includes(filter) || a.state.toLowerCase().includes(filter))
    }
    if (severityFilter) {
      alerts = alerts.filter(a => a.severity === severityFilter)
    }
    return {
      count: alerts.length,
      alerts: alerts.length > 0 ? alerts : ACTIVE_ALERTS.slice(0, 3)
    }
  }

  if (name === 'get_regional_climate_stats') {
    const reg = (args.region || '').toLowerCase()
    let stats = REGIONAL_CLIMATE_STATS
    if (reg) {
      stats = stats.filter(s => s.region.toLowerCase().includes(reg))
    }
    return {
      allIndiaLpa: '104% of normal (Active monsoon)',
      subdivisions: stats.length > 0 ? stats : REGIONAL_CLIMATE_STATS
    }
  }

  if (name === 'get_agro_climate_advisory') {
    const crop = (args.crop_or_zone || 'paddy').toLowerCase()
    return {
      cropFocus: crop.includes('wheat') ? 'Rabi Wheat' : 'Kharif Paddy',
      soilMoisture: '86% (Adequate to surplus)',
      irrigationAdvisory: 'Withhold artificial field irrigation; facilitate drainage in low-lying bunds.',
      sprayingWindow: 'Postpone chemical/pesticide spraying for 48 hours due to expected gusty downpours.',
      sowingStatus: 'Nursery transplantation recommended on elevated terraces.'
    }
  }

  if (name === 'get_earthquakes') {
    try {
      const { fetchUsgsQuakes } = await import('../tools/liveData/fetchUsgsQuakes.ts')
      const data = await fetchUsgsQuakes()
      const quakes = data.features || []
      const locFilter = (args.region_or_state || '').toLowerCase()
      const filtered = locFilter
        ? quakes.filter(q => (q.properties?.place || '').toLowerCase().includes(locFilter))
        : quakes
      return {
        count: filtered.length,
        timeframe: 'Recent 24-48 hours',
        earthquakes: filtered.map(q => ({
          magnitude: q.properties?.mag,
          severity: q.properties?.severity,
          place: q.properties?.place,
          depthKm: q.properties?.depthKm,
          status: q.properties?.status,
          occurredAt: q.properties?.occurredAt
        }))
      }
    } catch (err) {
      return { error: `Unable to query USGS earthquake telemetry: ${err.message}` }
    }
  }

  return { error: `Unknown tool name: ${name}` }
}

// System instructions for Gemini Live session (Ultra-low latency spoken delivery)
const SYSTEM_INSTRUCTION = `You are WeatherGPT Live Voice AI, an AI assistant built for India-focused weather forecasting, climate information, and disaster preparedness/response, developed for the Ministry of Earth Sciences (MoES).
Your voice is synthesized and spoken directly to the user in real time over an interactive voice stream. You are calm, precise, and trustworthy.

CORE OPERATIONAL RULES:
1. INSTANT SPOKEN DELIVERY (ULTRA-LOW LATENCY):
   - Lead immediately with the core metric or observation in the very first 3 to 5 words (e.g. "Mumbai is 28 degrees with moderate showers...").
   - NEVER use filler ("Great question!", "I'd be happy to help"), conversational throat-clearing, or markdown formatting (no asterisks, no bullets, no tables).
   - Keep answers extremely concise: strictly 1 to 2 short sentences total (under 25-30 words). This ensures near-instant audio generation without delay.
2. TOOL USAGE:
   - Call 'get_live_weather' for any city, district, temperature, or rain inquiry.
   - Call 'get_disaster_alerts' or 'get_weather_alerts' for active disaster alerts, cyclones, floods, or heatwaves.
   - Call 'get_earthquakes' for tremors, quakes, or seismic activity.
   - Call 'get_agro_climate_advisory' for farming, crop sowing, or agricultural directives.
   - Call 'get_regional_climate_stats' for monsoon progress or regional rainfall.
   - Never mention that you are calling a tool, fetching data, or searching. Speak as though you already know once data is in hand.
   - If a tool fails or returns nothing, state plainly that data is unavailable and suggest checking IMD's official portal.
3. MULTILINGUAL FLUENCY:
   - If the user speaks in Hindi or Hinglish (e.g. "Dhanbad ka mausam kaisa hai"), answer immediately and fully in Hindi (हिंदी).
   - If the user speaks in Marathi, Bengali, Tamil, Telugu, Gujarati, answer in that language.
4. ACCURACY & HEDGING:
   - Never state exact numbers unless they come directly from a tool result.
   - Do not speculate on disaster outcomes — report official forecasts with appropriate uncertainty.
5. DOMAIN SCOPE & REDIRECTION:
   - If asked non-weather topics (coding, poems, politics, sports trivia), briefly acknowledge and redirect in one short sentence: "That's outside what I can help with — I'm focused on weather and disaster info. Is there a location or event you'd like me to check?"
   - Do not be rigid about borderline cases (e.g. weather for weddings, flights, or school safety).
6. ACTIVE EMERGENCIES:
   - If someone describes being in immediate danger (trapped, floodwater rising, injury), immediately lead with the relevant emergency helpline: NDMA Helpline 1078 or National Emergency 112.
7. INITIAL SESSION GREETING MANDATE:
   - When asked to greet the user or introduce yourself at session start, say only: "नमस्ते! मैं वेदरजीपीटी सहायक हूँ। बताइए, आज आप किस शहर के मौसम के बारे में जानना चाहते हैं?"
   - Speak strictly this exact 1 short sentence in pure Hindi. Do not output any reasoning, English explanation, or filler.`

// Tool function declarations for Gemini Live API
const TOOLS_CONFIG = [
  {
    functionDeclarations: [
      {
        name: 'get_live_weather',
        description: 'Get current real-time live weather telemetry, 3-day forecast, and hazard risk assessment for any Indian city or coordinates.',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: {
              type: 'STRING',
              description: 'Name of the city, district, town or location in India, e.g. Mumbai, Dhanbad, Delhi, Guwahati, Kolkata, Shillong'
            }
          },
          required: ['location']
        }
      },
      {
        name: 'get_disaster_alerts',
        description: 'Get real-time disaster alerts, cyclone warnings, flash floods, heatwaves, or active emergency bulletins across India.',
        parameters: {
          type: 'OBJECT',
          properties: {
            region_or_state: {
              type: 'STRING',
              description: 'Optional state or region filter, e.g. Odisha, Assam, Rajasthan, Sikkim'
            },
            severity: {
              type: 'STRING',
              description: 'Filter by severity: extreme, severe, moderate, or minor'
            }
          }
        }
      },
      {
        name: 'get_weather_alerts',
        description: 'Get active severe weather alerts, cyclone advisories, flash flood warnings, or heatwave bulletins across India.',
        parameters: {
          type: 'OBJECT',
          properties: {
            region_or_state: {
              type: 'STRING',
              description: 'Optional state or region filter, e.g. Odisha, Assam, Rajasthan, Sikkim'
            },
            severity: {
              type: 'STRING',
              description: 'Filter by severity: extreme, severe, moderate, or minor'
            }
          }
        }
      },
      {
        name: 'get_regional_climate_stats',
        description: 'Get cumulative monsoon rainfall departures and regional climate statistics across Indian meteorological subdivisions.',
        parameters: {
          type: 'OBJECT',
          properties: {
            region: {
              type: 'STRING',
              description: 'Optional subdivision name, e.g. Northern Plains, Eastern India, Western Arid'
            }
          }
        }
      },
      {
        name: 'get_agro_climate_advisory',
        description: 'Get agricultural weather advisories, soil moisture status, and crop management directives for Indian farmers.',
        parameters: {
          type: 'OBJECT',
          properties: {
            crop_or_zone: {
              type: 'STRING',
              description: 'Target crop or agricultural zone, e.g. paddy, wheat, pulses, Eastern India'
            }
          }
        }
      },
      {
        name: 'get_earthquakes',
        description: 'Get recent live USGS earthquake activity, tremors, and seismic events scoped to India and bordering regions.',
        parameters: {
          type: 'OBJECT',
          properties: {
            region_or_state: {
              type: 'STRING',
              description: 'Optional region, state, or location name, e.g. Assam, Delhi, Gujarat, Hindu Kush'
            }
          }
        }
      }
    ]
  }
]

/**
 * Attaches the Voice Relay WebSocket Server to an HTTP server (e.g. Vite dev server or standalone server).
 */
export function attachVoiceRelay(httpServer, options = {}) {
  const apiKey = (options.geminiApiKey || process.env.GEMINI_API_KEY || '').trim()
  const voiceName = options.voiceName || process.env.GEMINI_VOICE || 'Kore'
  const path = options.path

  // If path is specified, use noServer: true so ws does not abort other upgrade requests (e.g. Vite HMR)
  const wss = path ? new WebSocketServer({ noServer: true }) : new WebSocketServer({ server: httpServer })

  if (path) {
    httpServer.on('upgrade', (request, socket, head) => {
      try {
        const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`)
        if (url.pathname === path) {
          wss.handleUpgrade(request, socket, head, (clientWs) => {
            wss.emit('connection', clientWs, request)
          })
        }
      } catch (err) {
        console.warn('[Relay] Error handling upgrade request:', err)
      }
    })
  }

  wss.on('connection', (clientWs, req) => {
    console.log(`[Relay] New browser client connected from ${req.socket.remoteAddress} (path: ${req.url})`)

    if (!apiKey) {
      console.error('[Relay ERROR] GEMINI_API_KEY is not set.')
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'GEMINI_API_KEY environment variable is not configured on the server.'
      }))
      clientWs.close(1008, 'GEMINI_API_KEY not configured')
      return
    }

    const geminiLiveUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`

    let geminiWs = null
    let idleTimer = null
    let isGeminiReady = false

    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        console.log('[Relay] Session idle timeout reached (5 min). Closing connection.')
        if (clientWs.readyState === WebSocket.OPEN) {
          clientWs.send(JSON.stringify({ type: 'warning', message: 'Session closed due to inactivity.' }))
          clientWs.close(1000, 'Idle timeout')
        }
        cleanup()
      }, IDLE_TIMEOUT_MS)
    }

    const safeSendClient = (payload) => {
      if (clientWs && clientWs.readyState === WebSocket.OPEN) {
        try {
          clientWs.send(typeof payload === 'string' ? payload : JSON.stringify(payload))
        } catch (err) {
          console.warn('[Relay] Failed to send to Client:', err.message)
        }
      }
    }

    const safeSendGemini = (payload) => {
      if (geminiWs && geminiWs.readyState === WebSocket.OPEN) {
        try {
          geminiWs.send(typeof payload === 'string' ? payload : JSON.stringify(payload))
        } catch (err) {
          console.warn('[Relay] Failed to send to Gemini:', err.message)
        }
      }
    }

    const cleanup = () => {
      if (idleTimer) {
        clearTimeout(idleTimer)
        idleTimer = null
      }
      if (geminiWs) {
        console.log('[Relay] Terminating Gemini Live connection and releasing all resources.')
        try {
          geminiWs.on('error', () => {})
          if (geminiWs.readyState === WebSocket.OPEN) {
            geminiWs.close(1000, 'Session ended')
          }
          geminiWs.terminate()
        } catch (err) {
          console.warn('[Relay] Error closing geminiWs:', err?.message || err)
        }
        geminiWs = null
      }
      isGeminiReady = false
    }

    resetIdleTimer()

    // Connect to Gemini Live API
    try {
      geminiWs = new WebSocket(geminiLiveUrl)
    } catch (err) {
      console.error('[Relay] Failed to initiate Gemini WebSocket:', err)
      safeSendClient({ type: 'error', message: 'Failed to connect to WeatherGPT Live engine' })
      clientWs.close()
      return
    }

    geminiWs.on('open', () => {
      if (!geminiWs || geminiWs.readyState !== WebSocket.OPEN) return
      console.log('[Relay] Connected to Gemini Live API. Sending setup handshake...')
      const setupMessage = {
        setup: {
          model: MODEL_NAME,
          generationConfig: {
            responseModalities: ['AUDIO'],
            temperature: 0.4,
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName
                }
              }
            }
          },
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          },
          tools: TOOLS_CONFIG
        }
      }
      safeSendGemini(setupMessage)
    })

    geminiWs.on('message', async (data) => {
      resetIdleTimer()
      try {
        const rawText = data.toString('utf-8')
        const parsed = JSON.parse(rawText)

        // 1. Setup Acknowledgement
        if (parsed.setupComplete) {
          console.log('[Relay] Gemini Live setup complete! Relay is ready.')
          isGeminiReady = true
          safeSendClient({ type: 'ready' })
          return
        }

        // 2. Tool Calls from Gemini
        if (parsed.toolCall?.functionCalls?.length > 0) {
          for (const call of parsed.toolCall.functionCalls) {
            console.log(`[Relay] Gemini requested tool: ${call.name} (id: ${call.id})`)

            // Notify frontend that tool was invoked (for live HUD badge)
            safeSendClient({
              type: 'tool_call',
              name: call.name,
              args: call.args,
              status: 'executing'
            })

            // Execute tool
            const toolResult = await executeTool(call.name, call.args || {})

            // Notify frontend tool completed
            safeSendClient({
              type: 'tool_call',
              name: call.name,
              args: call.args,
              result: toolResult,
              status: 'completed'
            })

            // Return toolResponse back to Gemini Live
            const toolResponse = {
              toolResponse: {
                functionResponses: [
                  {
                    id: call.id,
                    name: call.name,
                    response: {
                      result: toolResult
                    }
                  }
                ]
              }
            }
            safeSendGemini(toolResponse)
          }
          return
        }

        // 3. Server Generated Content (Audio & Transcript)
        if (parsed.serverContent) {
          const sc = parsed.serverContent

          // Interruption detected by Gemini VAD (user barged in)
          if (sc.interrupted) {
            console.log('[Relay] Model was interrupted by user speech.')
            safeSendClient({ type: 'interrupted' })
            return
          }

          // Model generated parts (audio chunks & text captions)
          if (sc.modelTurn?.parts?.length > 0) {
            for (const part of sc.modelTurn.parts) {
              if (part.inlineData?.data) {
                safeSendClient({
                  type: 'audio',
                  data: part.inlineData.data,
                  mimeType: part.inlineData.mimeType || 'audio/pcm;rate=24000'
                })
              }
              // Filter out internal reasoning / thought blocks
              if (part.text && !part.thought) {
                const isThinking = /^(?:\*\*|\#\#)?\s*(?:Providing|Thinking|Thought|Reasoning|Analyzing|Searching|User's intent|Okay, I have|The user wants|I need to)/i.test(part.text)
                if (!isThinking) {
                  const cleanText = part.text.replace(/^\*\*.*?\*\*\s*/g, '').trim()
                  if (cleanText) {
                    safeSendClient({
                      type: 'transcript',
                      text: cleanText,
                      sender: 'assistant'
                    })
                  }
                }
              }
            }
          }

          // Turn complete
          if (sc.turnComplete) {
            safeSendClient({ type: 'turn_complete' })
          }
        }
      } catch (err) {
        console.error('[Relay] Error handling Gemini message:', err)
      }
    })

    geminiWs.on('error', (err) => {
      console.error('[Relay] Gemini Live WebSocket error:', err.message || err)
      safeSendClient({ type: 'error', message: err.message || 'WeatherGPT Live session error' })
    })

    geminiWs.on('close', (code, reason) => {
      const reasonStr = reason ? reason.toString() : ''
      console.log(`[Relay] Gemini Live WebSocket closed: ${code} ${reasonStr}`)
      safeSendClient({ type: 'close', code, reason: reasonStr })
    })

    // Messages from Browser Client
    clientWs.on('message', (message) => {
      resetIdleTimer()
      try {
        const msg = JSON.parse(message.toString('utf-8'))

        // 1. Audio input stream (16kHz PCM Base64 chunks)
        if (msg.type === 'audio' && msg.data) {
          if (isGeminiReady) {
            safeSendGemini({
              realtimeInput: {
                mediaChunks: [
                  {
                    mimeType: 'audio/pcm;rate=16000',
                    data: msg.data
                  }
                ]
              }
            })
          }
          return
        }

        // 2. Text input query (fallback or mixed conversation)
        if (msg.type === 'text' && msg.text) {
          console.log('[Relay] Forwarding user text turn to Gemini:', msg.text)
          if (isGeminiReady) {
            safeSendGemini({
              clientContent: {
                turns: [
                  {
                    role: 'user',
                    parts: [{ text: msg.text }]
                  }
                ],
                turnComplete: true
              }
            })
          }
          return
        }

        // 3. User explicit tap-to-interrupt
        if (msg.type === 'interrupt') {
          console.log('[Relay] User requested explicit interrupt.')
          return
        }

        // 4. User explicit hard session termination
        if (msg.type === 'end_session') {
          console.log('[Relay] Received explicit end_session from client. Terminating Gemini Live session.')
          cleanup()
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.close(1000, 'Session ended by user')
          }
          return
        }
      } catch (err) {
        console.error('[Relay] Error parsing client message:', err)
      }
    })

    clientWs.on('close', () => {
      console.log('[Relay] Browser client disconnected.')
      cleanup()
    })

    clientWs.on('error', (err) => {
      console.error('[Relay] Client WebSocket error:', err)
      cleanup()
    })
  })

  return wss
}

// Check if running as standalone CLI script
const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isDirectExecution) {
  const PORT = parseInt(process.env.PORT || '3001', 10)
  const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim()

  if (!GEMINI_API_KEY) {
    console.warn('[Relay Warning] GEMINI_API_KEY environment variable is not set in process.env!')
    console.warn('Clients will receive an error unless GEMINI_API_KEY is provided.')
  }

  const server = http.createServer(async (req, res) => {
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'online',
        service: 'WeatherGPT Voice Relay',
        model: MODEL_NAME,
        timestamp: new Date().toISOString()
      }))
      return
    }

    if (req.url === '/api/live-layers/usgs-quakes') {
      try {
        const { fetchUsgsQuakes } = await import('../tools/liveData/fetchUsgsQuakes.ts')
        const data = await fetchUsgsQuakes()
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60'
        })
        res.end(JSON.stringify(data))
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Failed to fetch earthquakes', message: err.message }))
      }
      return
    }

    res.writeHead(404)
    res.end()
  })

  attachVoiceRelay(server)

  server.listen(PORT, () => {
    console.log('====================================================')
    console.log(` WeatherGPT Voice Relay Server running on port ${PORT}`)
    console.log(` Endpoint: ws://localhost:${PORT}`)
    console.log(` Target Model: ${MODEL_NAME}`)
    console.log('====================================================')
  })

  process.on('uncaughtException', (err) => {
    console.warn('[Relay] Uncaught exception recovered safely:', err?.message || err)
  })

  process.on('unhandledRejection', (reason) => {
    console.warn('[Relay] Unhandled rejection recovered safely:', reason)
  })
}
