/**
 * WeatherGPT Web Search Service
 * Real-time web search grounding for weather forecasting, IMD alerts, and disaster updates.
 */

export interface WebSearchResult {
  title: string
  source: string
  publishedAt: string
  url: string
  snippet?: string
}

// In-memory cache for search queries with 2-minute TTL to avoid redundant network roundtrips
interface CachedSearch {
  results: WebSearchResult[]
  timestamp: number
}

const SEARCH_CACHE = new Map<string, CachedSearch>()
const CACHE_TTL_MS = 2 * 60 * 1000

/**
 * Clean and unescape XML / HTML text strings
 */
function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Parse Google News RSS XML response into structured search results
 */
export function parseGoogleNewsXml(xml: string, limit = 4): WebSearchResult[] {
  const items: WebSearchResult[] = []
  const itemRegex = /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<link>(.*?)<\/link>[\s\S]*?<pubDate>(.*?)<\/pubDate>[\s\S]*?(?:<description>([\s\S]*?)<\/description>)?[\s\S]*?<\/item>/g

  let match: RegExpExecArray | null
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const rawTitle = match[1] || ''
    const link = match[2] || ''
    const pubDate = match[3] || ''
    const rawDesc = match[4] || ''

    const cleanTitle = unescapeXml(rawTitle)

    // Extract publisher from title (usually formatted as "Headline - Publisher Name")
    let publisher = 'IMD / News Network'
    const lastDashIdx = cleanTitle.lastIndexOf(' - ')
    if (lastDashIdx > 0) {
      publisher = cleanTitle.substring(lastDashIdx + 3).trim()
    }

    // Extract cleaner text from description HTML if available
    let snippet = ''
    const descText = rawDesc.replace(/<[^>]+>/g, ' ')
    const cleanDesc = unescapeXml(descText)
    if (cleanDesc && cleanDesc.length > cleanTitle.length + 10) {
      snippet = cleanDesc.length > 200 ? cleanDesc.substring(0, 197) + '...' : cleanDesc
    }

    // Format publication date into human-readable Indian date
    let formattedDate = pubDate
    try {
      const d = new Date(pubDate)
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
      }
    } catch {
      // Keep original pubDate if parsing fails
    }

    items.push({
      title: cleanTitle,
      source: publisher,
      publishedAt: formattedDate,
      url: link,
      snippet: snippet || undefined
    })
  }

  return items
}

/**
 * Formulate an optimal weather/disaster search query from user prompt and detected location
 */
export function buildWeatherSearchQuery(userPrompt: string, location?: string): string {
  // If a location is detected, prioritize location-specific weather news and alerts
  if (location && location.trim().length > 0) {
    // Check if query is looking for alerts or cyclones
    if (/\b(cyclone|flood|alert|warning|disaster|landslide|earthquake)\b/i.test(userPrompt)) {
      return `${location} cyclone flood warning IMD alert news`
    }
    return `${location} weather forecast rain IMD alert news`
  }

  // Strip generic greeting or conversational filler
  const sanitized = userPrompt
    .replace(/\b(what is the|tell me about|how is the|what will be the|can you check|please|batao|kaisa rahega)\b/gi, '')
    .trim()

  if (sanitized.length > 3) {
    return `${sanitized} weather IMD news`
  }

  return 'India monsoon weather forecast IMD alert news'
}

/**
 * Perform live web search for weather and disaster updates with multi-endpoint fallback
 */
export async function searchLiveWeatherWeb(
  userPrompt: string,
  location?: string
): Promise<WebSearchResult[]> {
  const query = buildWeatherSearchQuery(userPrompt, location)
  const cacheKey = query.toLowerCase().trim()

  // Check cache
  const cached = SEARCH_CACHE.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.results
  }

  // Strategy 1: Call local Vite dev server middleware (/api/web-search)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)

    const res = await fetch(`/api/web-search?q=${encodeURIComponent(query)}`, {
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (res.ok) {
      const data = (await res.json()) as { results?: WebSearchResult[] }
      if (Array.isArray(data?.results) && data.results.length > 0) {
        SEARCH_CACHE.set(cacheKey, { results: data.results, timestamp: Date.now() })
        return data.results
      }
    }
  } catch {
    // Server endpoint unreachable or timed out, attempt CORS proxy fallback
  }

  // Strategy 2: Fallback to CORS proxy fetching Google News RSS
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(proxyUrl, { signal: controller.signal })
    clearTimeout(timeout)

    if (res.ok) {
      const xml = await res.text()
      const parsed = parseGoogleNewsXml(xml, 4)
      if (parsed.length > 0) {
        SEARCH_CACHE.set(cacheKey, { results: parsed, timestamp: Date.now() })
        return parsed
      }
    }
  } catch (err) {
    console.warn('[WeatherGPT Search] All search strategies failed:', err)
  }

  return []
}
