import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function voiceRelayPlugin(): Plugin {
  return {
    name: 'voice-relay-dev-server',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv('', process.cwd(), '')
      const geminiApiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || ''

      if (server.httpServer) {
        // @ts-ignore - dynamic import of server relay in development
        import('./server/relay.mjs')
          .then(({ attachVoiceRelay }) => {
            attachVoiceRelay(server.httpServer, {
              path: '/voice-relay',
              geminiApiKey
            })
            console.log('\x1b[32m[WeatherGPT]\x1b[0m Voice Relay WebSocket attached directly at /voice-relay')
          })
          .catch((err) => {
            console.warn('[WeatherGPT] Could not attach embedded voice relay:', err?.message || err)
          })
      }
    }
  }
}

function liveLayersPlugin(): Plugin {
  return {
    name: 'live-layers-server',
    apply: 'serve',
    configureServer(server) {
      // Connect middleware for USGS live earthquakes
      server.middlewares.use('/api/live-layers/usgs-quakes', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const { fetchUsgsQuakes } = await import('./tools/liveData/fetchUsgsQuakes.ts')
          const data = await fetchUsgsQuakes()
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'public, max-age=60')
          res.end(JSON.stringify(data))
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Failed to fetch USGS earthquakes', details: errMsg }))
        }
      })

      // Connect middleware for Live Weather Web Search (Google News RSS proxy)
      server.middlewares.use('/api/web-search', async (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }

        try {
          const url = new URL(req.url || '', 'http://localhost')
          const q = url.searchParams.get('q') || 'India weather news IMD alert'
          const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-IN&gl=IN&ceid=IN:en`

          const upstreamRes = await fetch(rssUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })

          if (!upstreamRes.ok) {
            res.statusCode = upstreamRes.status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `Upstream error ${upstreamRes.status}` }))
            return
          }

          const xml = await upstreamRes.text()
          const { parseGoogleNewsXml } = await import('./src/services/searchService.ts')
          const results = parseGoogleNewsXml(xml, 5)

          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'public, max-age=120')
          res.end(JSON.stringify({ query: q, count: results.length, results }))
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Web search failed', details: errMsg }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), voiceRelayPlugin(), liveLayersPlugin()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('mapbox-gl')) {
              return 'vendor-mapbox'
            }
            if (id.includes('three') || id.includes('globe.gl') || id.includes('cobe')) {
              return 'vendor-globe'
            }
            if (id.includes('maplibre-gl')) {
              return 'vendor-maplibre'
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer-motion'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide'
            }
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('micromark') || id.includes('mdast') || id.includes('unist') || id.includes('vfile')) {
              return 'vendor-markdown'
            }
            if (id.includes('gsap')) {
              return 'vendor-gsap'
            }
            if (id.includes('ogl')) {
              return 'vendor-ogl'
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            return 'vendor-core'
          }
        }
      }
    }
  }
})
