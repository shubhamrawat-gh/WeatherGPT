import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
// @ts-ignore
import Globe from 'globe.gl'
// @ts-ignore
import * as THREE from 'three'

export interface Globe3DRef {
  getGlobeInstance: () => any
}

interface Globe3DProps {
  onCountrySelect?: (country: any) => void
  onCountryHover?: (country: any) => void
  incidents?: any[]
  resources?: any[]
  hotspots?: any[]
  showIncidents?: boolean
  showResources?: boolean
  showHotspots?: boolean
  interactive?: boolean
  autoRotate?: boolean
  cameraResetTrigger?: number
  disableRegionHover?: boolean
}

// Global cache for land dots to prevent recalculation on every mount
const landDotsCache = new Map<string, any[]>()

const Globe3D = forwardRef<Globe3DRef, Globe3DProps & { disableTelemetry?: boolean }>(({
  onCountrySelect,
  onCountryHover,
  incidents = [],
  resources = [],
  hotspots = [],
  showIncidents = true,
  showResources = true,
  showHotspots = true,
  interactive = true,
  autoRotate = true,
  cameraResetTrigger = 0,
  disableRegionHover = false,
  disableTelemetry = false,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeInstanceRef = useRef<any>(null)
  const [landDots, setLandDots] = useState<any[]>([])
  
  // Refs to hold callbacks to avoid stale closures in WebGL context
  const onCountrySelectRef = useRef(onCountrySelect)
  const onCountryHoverRef = useRef(onCountryHover)
  const disableRegionHoverRef = useRef(disableRegionHover)

  useImperativeHandle(ref, () => ({
    getGlobeInstance: () => globeInstanceRef.current
  }))
  
  useEffect(() => {
    onCountrySelectRef.current = onCountrySelect
    onCountryHoverRef.current = onCountryHover
    disableRegionHoverRef.current = disableRegionHover
  }, [onCountrySelect, onCountryHover, disableRegionHover])

  // Helper to extract land dots from topology image
  const extractLandDots = useCallback((img: HTMLImageElement, rows: number) => {
    const cacheKey = `${img.src}_${rows}`
    if (landDotsCache.has(cacheKey)) {
      return landDotsCache.get(cacheKey) || []
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return []

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imgData.data
    const w = imgData.width
    const h = imgData.height
    const dots: any[] = []
    const Y = Math.PI / 180

    const isLand = (lng: number, lat: number) => {
      const rowBytes = 4 * w
      const yCoord = Math.floor(((lat + 90) / 180) * h - 0.5)
      const xCoord = Math.floor(((lng + 180) / 360) * w + 0.5)
      const idx = rowBytes * (h - yCoord - 1) + 4 * xCoord + 3
      return data[idx] > 90
    }

    for (let lat = -90; lat <= 90; lat += 180 / rows) {
      const numPoints = Math.floor(25 * Math.cos(Math.abs(lat) * Y) * Math.PI * 4)
      for (let i = 0; i < numPoints; i++) {
        const lng = (360 * i) / numPoints - 180
        if (isLand(lng, lat)) {
          dots.push({ lat, lng })
        }
      }
    }

    landDotsCache.set(cacheKey, dots)
    return dots
  }, [])

  // Load land dots topology image (80 rows for ultra fast 60fps render)
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = "https://unpkg.com/three-globe@2.31.1/example/img/earth-topology.png"
    img.onload = () => {
      const dots = extractLandDots(img, 80) // 80 rows is highly optimized, loads instantly
      setLandDots(dots)
    }
    img.onerror = (err) => {
      console.error("Failed to load topology map for dotted globe:", err)
    }
  }, [extractLandDots])

  // Initialize Globe (Runs exactly ONCE on mount)
  useEffect(() => {
    if (!containerRef.current) return

    let cloudsMesh: THREE.Mesh | null = null
    let rotationAnimationFrameId: number | null = null

    const globe = (Globe as any)()(containerRef.current)
      .globeImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png")
      .backgroundColor("rgba(0, 0, 0, 0)")
      .showAtmosphere(true)
      .atmosphereColor("#3b82f6") // Beautiful blue atmosphere
      .atmosphereAltitude(0.12)
      .polygonCapColor(() => "rgba(0, 0, 0, 0)")
      .polygonSideColor(() => "rgba(0, 0, 0, 0)")
      .polygonStrokeColor(() => "rgba(255, 255, 255, 0.12)") // Translucent white borders for tech overlay aesthetic
      .polygonLabel((info: any) => {
        if (disableRegionHoverRef.current) return ""
        const d = info.properties
        return `
          <div style="font-family: monospace; font-size: 10px; color: #ffffff; background: rgba(0, 30, 43, 0.95); border: 1px solid #00ed64; padding: 6px 10px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); text-align: left;">
            <b style="color: #00ed64">${d.ADMIN}</b> (${d.ISO_A3})<br/>
            <span style="color: #a8b3bc; font-size: 9px;">Double-click to lock target focus</span>
          </div>
        `
      })

    globeInstanceRef.current = globe

    // Cap renderer pixel ratio to reduce GPU fill rate during scroll animations
    try {
      const renderer = globe.renderer()
      if (renderer) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      }
    } catch (_) { /* renderer not yet available */ }

    // Add rotating cloud layer mesh
    const CLOUDS_IMG_URL = '/clouds.png'
    const CLOUDS_ALT = 0.005
    const CLOUDS_ROTATION_SPEED = -0.005 // deg/frame

    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(CLOUDS_IMG_URL, (cloudsTexture: any) => {
      const globeRadius = globe.getGlobeRadius()
      const cloudsGeo = new THREE.SphereGeometry(globeRadius * (1 + CLOUDS_ALT), 48, 48)
      const cloudsMat = new THREE.MeshPhongMaterial({
        map: cloudsTexture,
        transparent: true,
        opacity: 0.85
      })
      cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat)
      globe.scene().add(cloudsMesh)

      const rotateClouds = () => {
        if (cloudsMesh) {
          cloudsMesh.rotation.y += (CLOUDS_ROTATION_SPEED * Math.PI) / 180
        }
        rotationAnimationFrameId = requestAnimationFrame(rotateClouds)
      }
      rotateClouds()
    }, undefined, (err: any) => {
      console.error("Failed to load clouds texture:", err)
    })

    // Configure controls (NO zoom enabled, ONLY rotate)
    const controls = globe.controls()
    if (controls) {
      controls.enableZoom = false // Disable zoom entirely
      controls.enableRotate = interactive // Only rotation enabled
      controls.autoRotate = autoRotate
      controls.autoRotateSpeed = 0.45

      // Ensure auto-rotation resumes consistently after user interaction
      controls.addEventListener('start', () => {
        controls.autoRotate = false
      })
      controls.addEventListener('end', () => {
        if (autoRotate) {
          controls.autoRotate = true
        }
      })
    }

    // Attach interaction handlers
    globe.onPolygonHover((hoverD: any) => {
      if (disableRegionHoverRef.current) return
      globe.polygonCapColor((d: any) => d === hoverD ? 'rgba(0, 237, 100, 0.15)' : 'rgba(0, 237, 100, 0.03)')
      if (onCountryHoverRef.current) {
        onCountryHoverRef.current(hoverD ? hoverD.properties : null)
      }
    })

    globe.onPolygonClick((d: any) => {
      if (disableRegionHoverRef.current) return
      if (onCountrySelectRef.current && d) {
        onCountrySelectRef.current(d.properties)
        
        // Easing camera target to the clicked country center (altitude kept constant at 2.5 to avoid zoom in effect)
        const bbox = d.bbox || [0, 0, 0, 0]
        const lat = (bbox[1] + bbox[3]) / 2 || 0
        const lng = (bbox[0] + bbox[2]) / 2 || 0
        
        globe.pointOfView({ lat, lng, altitude: 2.5 }, 1000)
      }
    })

    // Load country boundary coordinates (GeoJSON) dynamically
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
      .then((res) => res.json())
      .then((countries) => {
        if (globeInstanceRef.current) {
          globeInstanceRef.current.polygonsData(countries.features)
        }
      })
      .catch((err) => console.error('Failed to load globe GeoJSON polygon data:', err))

    // Handle resizing responsiveness
    const handleResize = () => {
      if (containerRef.current && globeInstanceRef.current) {
        const { clientWidth, clientHeight } = containerRef.current
        globeInstanceRef.current.width(clientWidth)
        globeInstanceRef.current.height(clientHeight)
      }
    }

    // Call once to size correctly
    setTimeout(handleResize, 100)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (rotationAnimationFrameId) {
        cancelAnimationFrame(rotationAnimationFrameId)
      }
      if (globeInstanceRef.current) {
        if (cloudsMesh) {
          try {
            globeInstanceRef.current.scene().remove(cloudsMesh)
          } catch (e) {
            console.warn("Failed to remove clouds mesh on unmount:", e)
          }
        }
        try {
          globeInstanceRef.current.pauseAnimation()
        } catch (e) {
          console.warn("Failed to pause globe animation on unmount:", e)
        }
        globeInstanceRef.current = null
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [disableRegionHover]) // Re-run if hover setting changes (rare, but safe)

  // Intersection Observer to pause/resume WebGL rendering when offscreen
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const globe = globeInstanceRef.current
        if (!globe) return
        if (entry.isIntersecting) {
          globe.resumeAnimation()
        } else {
          globe.pauseAnimation()
        }
      },
      { threshold: 0.05 }
    )

    observer.observe(container)
    return () => {
      observer.disconnect()
    }
  }, [])

  // Dynamically update autoRotate and interactive settings without re-initializing the entire globe
  useEffect(() => {
    const globe = globeInstanceRef.current
    if (!globe) return
    const controls = globe.controls()
    if (controls) {
      controls.autoRotate = autoRotate
      controls.enableRotate = interactive
    }
  }, [autoRotate, interactive])

  // Sync camera resets
  useEffect(() => {
    const globe = globeInstanceRef.current
    if (globe && cameraResetTrigger > 0) {
      globe.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 2.5 }, 1000)
    }
  }, [cameraResetTrigger])

  // Sync land dots onto pointsData (Disabled for realistic Earth view)
  useEffect(() => {
    const globe = globeInstanceRef.current
    if (globe && landDots.length > 0) {
      // Clear pointsData on globe so the photographic texture shows, but keep in state for telemetry arcs
      globe.pointsData([])
    }
  }, [landDots])

  // Sync data markers (Incidents, Resources, Hotspots) dynamically when props update
  useEffect(() => {
    const globe = globeInstanceRef.current
    if (!globe || disableTelemetry) return

    // 1. Incidents & Resources labels (mapped to labelsData so they don't overwrite pointsData)
    const labels: any[] = []
    if (showIncidents && incidents) {
      labels.push(...incidents.map(i => ({ ...i, __type: 'incident' })))
    }
    if (showResources && resources) {
      labels.push(...resources.map(r => ({ ...r, __type: 'resource' })))
    }

    globe.labelsData(labels)
    globe.labelText((d: any) => d.title || d.name || '')
    globe.labelColor((d: any) => d.__type === 'incident' ? '#ef4444' : '#00ed64')
    globe.labelDotRadius(0.4)
    globe.labelSize(0.7)
    globe.labelAltitude(0.015)
    globe.labelDotOrientation(() => 'right')
    globe.labelLabel((d: any) => `
      <div style="font-family: monospace; font-size: 10px; color: #ffffff; background: rgba(0, 30, 43, 0.95); border: 1px solid ${d.__type === 'incident' ? '#ef4444' : '#00ed64'}; padding: 6px 10px; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
        <span style="color: ${d.__type === 'incident' ? '#ef4444' : '#00ed64'}; font-weight: bold;">${d.__type === 'incident' ? 'INCIDENT' : 'RESOURCE'}</span>: ${d.title || d.name || 'Telemetry Node'}<br/>
        <span style="color: #a8b3bc; font-size: 9px;">Lat: ${d.lat?.toFixed(4) || 0} | Lng: ${d.lng?.toFixed(4) || 0}</span>
      </div>
    `)

    // 2. Hotspots markers (Rings)
    const activeHotspots = showHotspots && hotspots ? hotspots : []
    globe.ringsData(activeHotspots)
    globe.ringColor(() => '#3b82f6') // Blue for predictive hotspots
    globe.ringMaxRadius(3.5)
    globe.ringPropagationSpeed(1.5)
    globe.ringRepeatPeriod(2000)
  }, [incidents, showIncidents, resources, showResources, hotspots, showHotspots, disableTelemetry])

  // Background animated arcs and landing rings to simulate real-time operations telemetry (ReactBits design)
  useEffect(() => {
    const globe = globeInstanceRef.current
    if (!globe || landDots.length === 0 || disableTelemetry) return

    const arcCount = 6
    const arcAnimationDuration = 2000
    const arcIntervalTime = 5000
    let timeoutId: any
    let intervalId: any
    let clearRingsTimeoutId: any

    const generateTelemetryFlows = () => {
      // Pick random start and end coordinates on the land dots grid
      const len = landDots.length
      const count = arcCount * 2
      const randomNodes: any[] = []
      const visited = new Set<number>()
      
      while (randomNodes.length < count) {
        const idx = Math.floor(Math.random() * len)
        if (!visited.has(idx)) {
          visited.add(idx)
          randomNodes.push(landDots[idx])
        }
      }

      // Format arcs
      const arcs = Array.from({ length: arcCount }, (_, i) => ({
        startLat: randomNodes[i].lat,
        startLng: randomNodes[i].lng,
        endLat: randomNodes[i + arcCount].lat,
        endLng: randomNodes[i + arcCount].lng
      }))

      // Format target landing rings
      const rings = Array.from({ length: arcCount }, (_, i) => ({
        lat: randomNodes[i + arcCount].lat,
        lng: randomNodes[i + arcCount].lng
      }))

      // Set arcs data
      globe.arcsData(arcs)
      globe.arcColor(() => 'rgba(0, 237, 100, 0.45)') // brand green telemetry lines
      globe.arcStroke(0.18)
      globe.arcDashInitialGap(1)
      globe.arcDashLength(2)
      globe.arcDashGap(2)
      globe.arcDashAnimateTime(arcAnimationDuration)

      // Set landing rings animation after the arcs complete their flow
      timeoutId = setTimeout(() => {
        if (globeInstanceRef.current) {
          // Temporarily set ringsData for telemetry rings (they fade out)
          if (hotspots.length === 0 || !showHotspots) {
            globe.ringsData(rings)
            globe.ringColor(() => 'rgba(0, 237, 100, 0.65)')
            globe.ringMaxRadius(2.2)
            globe.ringPropagationSpeed(1.2)
            globe.ringRepeatPeriod(0) // single pulse

            // Clear telemetry rings after they propagate to keep rings state consistent
            clearRingsTimeoutId = setTimeout(() => {
              if (globeInstanceRef.current && (hotspots.length === 0 || !showHotspots)) {
                globe.ringsData([])
              }
            }, 2000)
          }
        }
      }, arcAnimationDuration)
    }

    // Run first flow
    generateTelemetryFlows()

    // Run recurring flows
    intervalId = setInterval(generateTelemetryFlows, arcIntervalTime)

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(clearRingsTimeoutId)
      clearInterval(intervalId)
    }
  }, [landDots, hotspots, showHotspots, disableTelemetry])

  return (
    <div className="w-full h-full relative overflow-hidden select-none touch-pan-y">
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" />
    </div>
  )
})

export default Globe3D
