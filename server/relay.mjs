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

// Known coordinates for Indian cities and strategic NER transport hubs
const KNOWN_COORDS = {
  mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  delhi: { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
  kolkata: { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  chennai: { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  bengaluru: { lat: 12.9716, lng: 77.5946, name: 'Bengaluru' },
  hyderabad: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  dhanbad: { lat: 23.7957, lng: 86.4304, name: 'Dhanbad' },
  patna: { lat: 25.5941, lng: 85.1376, name: 'Patna' },
  ranchi: { lat: 23.3441, lng: 85.3096, name: 'Ranchi' },
  pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  jaipur: { lat: 26.9124, lng: 75.7873, name: 'Jaipur' },
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
  'sela pass': { lat: 27.5012, lng: 92.1245, name: 'Sela Pass' },
  'sonapur tunnel': { lat: 25.1845, lng: 92.3812, name: 'Sonapur Tunnel' }
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
 * Fetch live weather from Open-Meteo API
 */
async function fetchOpenMeteoWeather(locationStr) {
  const norm = (locationStr || '').toLowerCase().trim()
  let lat = 26.1844
  let lng = 91.7362
  let resolvedName = locationStr || 'Guwahati'

  // 1. Match known locations
  for (const [key, val] of Object.entries(KNOWN_COORDS)) {
    if (norm.includes(key) || key.includes(norm)) {
      lat = val.lat
      lng = val.lng
      resolvedName = val.name
      break
    }
  }

  // 2. Fallback to Open-Meteo Geocoding if not in known locations
  if (!KNOWN_COORDS[norm]) {
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(norm)}&count=1&language=en&format=json`
      const geoRes = await fetch(geoUrl, { signal: AbortSignal.timeout(3000) })
      if (geoRes.ok) {
        const geoData = await geoRes.json()
        if (geoData?.results?.[0]) {
          lat = geoData.results[0].latitude
          lng = geoData.results[0].longitude
          resolvedName = geoData.results[0].name
        }
      }
    } catch {
      // Use fallback coords
    }
  }

  // 3. Fetch live weather & forecast
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,visibility,cloud_cover,is_day&daily=weather_code,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=3`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) })
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

    return {
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
  } catch (err) {
    console.warn(`[Relay] Weather fetch fallback for ${resolvedName}:`, err.message)
    return {
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

  if (name === 'get_weather_alerts') {
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

// System instructions for Gemini Live session
const SYSTEM_INSTRUCTION = `You are WeatherGPT Live Voice AI, an operational meteorological intelligence assistant for India (SIH26068, Theme: Disaster Management).
Your voice will be spoken directly to the user in real time.

CORE OPERATIONAL RULES:
1. SPOKEN VOICE STYLE:
   - Speak conversationally, naturally, and concisely (1-3 sentences per turn).
   - Avoid reading out long raw markdown tables or bulleted walls of text. Speak key numbers and findings directly (e.g. "Currently in Mumbai it's 28 degrees with moderate rain showers...").
2. TOOL USAGE:
   - Always call 'get_live_weather' whenever the user asks about current weather, forecasts, temperature, or rain in any Indian city, district, or town.
   - Call 'get_weather_alerts' when asked about cyclones, floods, heatwaves, warnings, or active weather bulletins.
   - Call 'get_earthquakes' when asked about earthquakes, tremors, seismic activity, or Richter scale readings.
   - Call 'get_agro_climate_advisory' for farming, crop sowing, or agricultural questions.
   - Call 'get_regional_climate_stats' for monsoon progress or regional climate questions.
3. MULTILINGUAL FLUENCY:
   - If the user speaks in Hindi or Hinglish (e.g. "Dhanbad ka mausam kaisa hai"), reply fully and naturally in Hindi!
   - If the user speaks in Marathi, Bengali, Tamil, Telugu, Gujarati, reply in that language.
4. METEOROLOGICAL AUTHORITY:
   - Never say you do not have live data; you have live telemetry tools. Always consult your tools for exact measurements.
5. DOMAIN BOUNDARY:
   - If asked about non-weather topics (coding, politics, entertainment, sports), politely refuse in one short sentence.`

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
      safeSendClient({ type: 'error', message: 'Failed to connect to Gemini Live API' })
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
      safeSendClient({ type: 'error', message: err.message || 'Gemini Live session error' })
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
