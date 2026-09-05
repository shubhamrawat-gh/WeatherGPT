import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Link } from 'react-router-dom'
import { ArrowRight, Satellite, Radio, Smartphone, Map, BrainCircuit, ShieldAlert, Ambulance, Megaphone } from 'lucide-react'
import GlobeContainer from './GlobeContainer'
import TypingText from './TypingText'

gsap.registerPlugin(ScrollTrigger)

// Stable words array for typing animation to prevent timer resets on parent renders
const TYPING_WORDS = ['Intelligent', 'Conversational', 'Actionable']

// Coordinates for guided focus on NER corridors and hubs
const HOTSPOTS = {
  wildfire: { lat: 25.57, lng: 91.89, color: '#f97316', maxRadius: 3.5, propagationSpeed: 2.2, repeatPeriod: 1500 }, // Western India / Cyclone (Orange)
  flood: { lat: 25.67, lng: 94.10, color: '#3b82f6', maxRadius: 3.5, propagationSpeed: 2.2, repeatPeriod: 1500 },    // Northern Plains / Flood (Blue)
  resource: { lat: 27.33, lng: 88.61, color: '#00ed64', maxRadius: 3.5, propagationSpeed: 2.2, repeatPeriod: 1500 } // Agri Belt / Monsoon (Green)
}

// Telemetry arcs starting points, ending at corresponding hotspots
const ARCS = {
  wildfire: { startLat: 26.14, startLng: 91.73, endLat: 25.57, endLng: 91.89, color: '#f97316' }, // IMD Station -> Cyclone Zone
  flood: { startLat: 25.90, startLng: 93.72, endLat: 25.67, endLng: 94.10, color: '#3b82f6' },   // Satellite -> Flood Zone
  resource: { startLat: 26.72, startLng: 88.43, endLat: 27.33, endLng: 88.61, color: '#00ed64' } // Model -> Agri Belt
}

export default function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const globeWrapperRef = useRef<HTMLDivElement>(null)
  const globeContainerRef = useRef<any>(null)
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Listen to prefers-reduced-motion media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    const viewport = viewportRef.current
    const container = containerRef.current
    const globeWrapper = globeWrapperRef.current
    if (!viewport || !container || !globeWrapper) return

    // 3D camera coordinates that GSAP will tween
    const globeState = {
      lat: 20,
      lng: 0,
      altitude: 2.5
    }

    let globeConfigured = false

    // Configure globe.gl properties once WebGL is loaded
    const configureGlobe = (globe: any) => {
      if (globeConfigured) return
      globeConfigured = true

      globe.arcColor((d: any) => d.color || '#00ed64')
      globe.arcStroke(0.35)
      globe.arcDashLength(0.45)
      globe.arcDashGap(0.15)
      globe.arcDashAnimateTime(1200)

      globe.ringColor((d: any) => d.color || '#3b82f6')
      globe.ringMaxRadius((d: any) => d.maxRadius || 3)
      globe.ringPropagationSpeed((d: any) => d.propagationSpeed || 2)
      globe.ringRepeatPeriod((d: any) => d.repeatPeriod || 1500)

      const controls = globe.controls()
      if (controls) {
        controls.enableZoom = false
        controls.enableRotate = false
        controls.autoRotate = false
      }
    }

    // State for smooth auto-rotation and camera convergence
    let isScrolling = false
    let scrollTimeout: any = null
    let animationFrameId: any = null
    let isTickLoopRunning = false

    // Initialize GSAP matchMedia for desktop / mobile optimization
    const mm = gsap.matchMedia()

    mm.add({
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)"
    }, (context) => {
      const { isDesktop } = context.conditions as { isDesktop: boolean }

      // Set initial positions
      if (isDesktop) {
        gsap.set(globeWrapper, {
          xPercent: -50,
          yPercent: -50,
          x: "20vw",
          y: 0,
          scale: 1,
          left: "50%",
          top: "50%",
          position: "absolute"
        })
      } else {
        gsap.set(globeWrapper, {
          xPercent: -50,
          yPercent: -50,
          x: 0,
          y: "14vh",
          scale: 0.85,
          left: "50%",
          top: "50%",
          position: "absolute"
        })
      }

      // Initialize the master timeline with hardware-accelerated force3D
      const tl = gsap.timeline({
        defaults: { force3D: true },
        scrollTrigger: {
          trigger: container,
          start: "top top+=80", // Align pin with header height (80px)
          end: "+=5400", // Long scroll runway — small scrolls barely move the animation
          pin: viewport,
          scrub: 2.5, // High inertia scrub — animation trails behind scroll like Apple keynote
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!isScrolling) {
              isScrolling = true
            }
            if (scrollTimeout) clearTimeout(scrollTimeout)
            scrollTimeout = setTimeout(() => {
              isScrolling = false
            }, 200)

            const progress = self.progress
            if (progress < 0.95) {
              startTickLoop()
            }
          },
          onScrubComplete: () => {
            isScrolling = false
            if (scrollTimeout) clearTimeout(scrollTimeout)
          }
        }
      })

      // 01. Scene 1: Initial Hero rotation (0% -> 15%)
      tl.to(globeState, {
        lng: 25,
        duration: 0.15,
        ease: "none"
      })

      // 02. Scene 2: Focus Shift (15% -> 35%)
      tl.to(".hero-text-panel", {
        opacity: 0,
        y: -40,
        duration: 0.2,
        ease: "power2.inOut"
      }, 0.15)

      tl.to(globeWrapper, {
        x: 0,
        y: 0,
        scale: isDesktop ? 1.3 : 1.15,
        duration: 0.2,
        ease: "power3.inOut"
      }, 0.15)

      tl.to(globeState, {
        lat: HOTSPOTS.wildfire.lat,
        lng: HOTSPOTS.wildfire.lng,
        altitude: 2.5,
        duration: 0.2,
        ease: "power3.inOut"
      }, 0.15)

      // 03. Scene 3: Hero Transformation (35% -> 50%)
      tl.to(globeWrapper, {
        scale: isDesktop ? 1.5 : 1.3,
        duration: 0.15,
        ease: "power3.inOut"
      }, 0.35)

      tl.to(globeState, {
        altitude: 2.1,
        duration: 0.15,
        ease: "power3.inOut"
      }, 0.35)

      tl.to(".story-grid-overlay", {
        opacity: 0.03,
        duration: 0.15,
        ease: "power2.inOut"
      }, 0.35)

      // 04. Scene 4 & 5: Guided Hotspots Reveal & Globe Rotation (50% -> 80%)
      // Node 1: North America Wildfire (50% -> 60%)
      tl.to(".node-card-wildfire", {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.08,
        ease: "power3.out"
      }, 0.50)

      tl.to(globeState, {
        lng: HOTSPOTS.wildfire.lng, // maintain focus
        duration: 0.04
      }, 0.58)

      // Transition Node 1 -> Node 2 (58% -> 68%)
      tl.to(".node-card-wildfire", {
        opacity: 0,
        scale: 0.9,
        y: -15,
        duration: 0.04,
        ease: "power3.in"
      }, 0.58)

      tl.to(globeState, {
        lat: HOTSPOTS.flood.lat,
        lng: HOTSPOTS.flood.lng,
        altitude: 2.1,
        duration: 0.06,
        ease: "power3.inOut"
      }, 0.58)

      tl.to(".node-card-flood", {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.06,
        ease: "power3.out"
      }, 0.64)

      tl.to(globeState, {
        lng: HOTSPOTS.flood.lng, // maintain focus
        duration: 0.04
      }, 0.68)

      // Transition Node 2 -> Node 3 (68% -> 78%)
      tl.to(".node-card-flood", {
        opacity: 0,
        scale: 0.9,
        y: -15,
        duration: 0.04,
        ease: "power3.in"
      }, 0.68)

      tl.to(globeState, {
        lat: HOTSPOTS.resource.lat,
        lng: HOTSPOTS.resource.lng,
        altitude: 2.1,
        duration: 0.06,
        ease: "power3.inOut"
      }, 0.68)

      tl.to(".node-card-resource", {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.06,
        ease: "power3.out"
      }, 0.74)

      tl.to(globeState, {
        lng: HOTSPOTS.resource.lng, // maintain focus
        duration: 0.04
      }, 0.78)

      // Transition out of Node 3 (78% -> 80%)
      tl.to(".node-card-resource", {
        opacity: 0,
        scale: 0.9,
        y: -15,
        duration: 0.04,
        ease: "power3.in"
      }, 0.78)

      // 05. Scene 6: AI Analysis Overlay (80% -> 87%)
      tl.to(globeState, {
        lat: 28,
        lng: 40,
        altitude: 2.5,
        duration: 0.05,
        ease: "power3.inOut"
      }, 0.80)

      // Scale globe down to make room for side panels
      tl.to(globeWrapper, {
        scale: isDesktop ? 1.1 : 1.0,
        duration: 0.05,
        ease: "power2.inOut"
      }, 0.80)

      tl.to(".ai-overlay", {
        opacity: 1,
        duration: 0.05,
        ease: "power2.out"
      }, 0.80)

      // Slide left panel in from the left with staggered feature items
      tl.fromTo(".intel-panel-left",
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.04, ease: "power3.out" },
        0.81
      )
      tl.fromTo(".intel-panel-left .intel-item",
        { opacity: 0, x: -12, y: 6 },
        { opacity: 1, x: 0, y: 0, stagger: 0.01, duration: 0.03, ease: "power2.out" },
        0.82
      )

      // Slide right panel in from the right with staggered feature items
      tl.fromTo(".intel-panel-right",
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.04, ease: "power3.out" },
        0.82
      )
      tl.fromTo(".intel-panel-right .intel-item",
        { opacity: 0, x: 12, y: 6 },
        { opacity: 1, x: 0, y: 0, stagger: 0.01, duration: 0.03, ease: "power2.out" },
        0.83
      )


      // 06. Scene 7: WeatherGPT Reveal (87% -> 95%)
      tl.to(".ai-overlay", {
        opacity: 0,
        duration: 0.03,
        ease: "power2.in"
      }, 0.87)

      tl.to(globeWrapper, {
        opacity: 0.22,
        duration: 0.04,
        ease: "power2.inOut"
      }, 0.87)

      tl.to(".reveal-text", {
        opacity: 1,
        duration: 0.02
      }, 0.87)

      tl.fromTo(".reveal-text .word",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.015, duration: 0.06, ease: "power4.out" },
        0.87
      )

      // 07. Scene 8: Transition to Features (95% -> 100%)
      tl.to(".reveal-text", {
        opacity: 0,
        y: -25,
        duration: 0.03,
        ease: "power3.in"
      }, 0.95)

      tl.to(globeWrapper, {
        scale: 0.75,
        y: "-45vh",
        opacity: 0,
        duration: 0.05,
        ease: "power3.inOut"
      }, 0.95)

      tl.to(".story-grid-overlay", {
        opacity: 0.15,
        duration: 0.05,
        ease: "power2.inOut"
      }, 0.95)

      // Interpolation values for 60fps hardware-accelerated globe camera rendering
      let currentLat = globeState.lat
      let currentLng = globeState.lng
      let currentAlt = globeState.altitude
      let lastPointOfView = { lat: 0, lng: 0, altitude: 0 }

      let cachedGlobe: any = null
      let activeDataState = -1 // -1 means uninitialized

      const CONVERGENCE_THRESHOLD = 0.001

      // 60fps rendering tick to smooth out camera moves and auto-rotations
      const tick = () => {
        if (!isTickLoopRunning) return

        if (!cachedGlobe) {
          cachedGlobe = globeContainerRef.current?.getGlobeInstance()
        }
        const globe = cachedGlobe
        if (globe && tl) {
          configureGlobe(globe)

          const progress = tl.progress()
          if (progress >= 0.95) {
            stopTickLoop()
            return
          }

          const targetLat = globeState.lat
          const targetLng = globeState.lng
          const targetAlt = globeState.altitude

          const deltaLat = Math.abs(targetLat - currentLat)
          const deltaLng = Math.abs(targetLng - currentLng)
          const deltaAlt = Math.abs(targetAlt - currentAlt)

          const isConverging = deltaLat > CONVERGENCE_THRESHOLD ||
                               deltaLng > CONVERGENCE_THRESHOLD ||
                               deltaAlt > CONVERGENCE_THRESHOLD

          // Gentle camera convergence — heavy, cinematic inertia
          if (isConverging) {
            currentLat += (targetLat - currentLat) * 0.12
            currentLng += (targetLng - currentLng) * 0.12
            currentAlt += (targetAlt - currentAlt) * 0.12

            const povChanged = Math.abs(currentLat - lastPointOfView.lat) > CONVERGENCE_THRESHOLD ||
                               Math.abs(currentLng - lastPointOfView.lng) > CONVERGENCE_THRESHOLD ||
                               Math.abs(currentAlt - lastPointOfView.altitude) > CONVERGENCE_THRESHOLD

            if (povChanged) {
              globe.pointOfView({ lat: currentLat, lng: currentLng, altitude: currentAlt }, 0)
              lastPointOfView = { lat: currentLat, lng: currentLng, altitude: currentAlt }
            }
          } else if (!isScrolling) {
            // Explicit completion condition: when delta is below tolerance threshold
            // and user is not actively scrolling, snap to target and STOP the rAF loop.
            currentLat = targetLat
            currentLng = targetLng
            currentAlt = targetAlt
            globe.pointOfView({ lat: currentLat, lng: currentLng, altitude: currentAlt }, 0)
            lastPointOfView = { lat: currentLat, lng: currentLng, altitude: currentAlt }
            stopTickLoop()
            return
          }

          // Show/hide hotspots and arcs strictly tied to scroll progress
          let targetState = 0
          if (progress < 0.45) {
            targetState = 0
          } else if (progress >= 0.45 && progress < 0.58) {
            targetState = 1
          } else if (progress >= 0.58 && progress < 0.68) {
            targetState = 2
          } else {
            targetState = 3
          }

          if (targetState !== activeDataState) {
            activeDataState = targetState
            if (targetState === 0) {
              globe.ringsData([])
              globe.arcsData([])
            } else if (targetState === 1) {
              globe.ringsData([HOTSPOTS.wildfire])
              globe.arcsData([ARCS.wildfire])
            } else if (targetState === 2) {
              globe.ringsData([HOTSPOTS.wildfire, HOTSPOTS.flood])
              globe.arcsData([ARCS.wildfire, ARCS.flood])
            } else if (targetState === 3) {
              globe.ringsData([HOTSPOTS.wildfire, HOTSPOTS.flood, HOTSPOTS.resource])
              globe.arcsData([ARCS.wildfire, ARCS.flood, ARCS.resource])
            }
          }
        }
        animationFrameId = requestAnimationFrame(tick)
      }

      const startTickLoop = () => {
        if (isTickLoopRunning) return
        isTickLoopRunning = true
        tick()
      }

      const stopTickLoop = () => {
        isTickLoopRunning = false
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId)
          animationFrameId = null
        }
      }

      // Handle visibility changes to conserve battery/CPU when tab is inactive
      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopTickLoop()
        } else {
          const progress = tl.progress()
          if (progress < 0.95) {
            startTickLoop()
          }
        }
      }
      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Start tick loop initially
      startTickLoop()

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        stopTickLoop()
        if (scrollTimeout) clearTimeout(scrollTimeout)
      }
    })

    return () => {
      mm.revert()
      if (scrollTimeout) clearTimeout(scrollTimeout)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [prefersReducedMotion])

  // ACCESSIBILITY FALLBACK: Static Hero Section for Prefers Reduced Motion
  if (prefersReducedMotion) {
    return (
      <section className="relative h-auto py-12 md:py-0 md:h-[calc(100vh-5rem)] flex items-center px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12 w-full">
          <div className="flex flex-col items-start text-left w-full md:w-[55%] lg:w-[52%]">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] m-0">
              Understand Weather Instantly. <br />
              Respond <TypingText words={TYPING_WORDS} />
            </h1>
            <p className="mt-6 text-base text-muted-dark leading-relaxed font-sans max-w-xl m-0">
              Get real-time forecasts, severity-based alerts, and climate intelligence through one conversational interface — powered by IMD, INSAT, GFS, and ECMWF data.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full">
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-canvas-dark bg-brand-green hover:bg-brand-green-dark px-8 py-3.5 rounded-full shadow-lg shadow-brand-green/10 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Link>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm font-semibold text-white bg-transparent border border-hairline-dark hover:bg-surface-dark/50 px-8 py-3.5 rounded-full transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 group cursor-pointer"
              >
                Learn More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
            </div>
          </div>
          <div className="w-full md:w-[45%] lg:w-[48%] max-w-[320px] md:max-w-[400px] lg:max-w-[580px] aspect-square flex items-center justify-center">
            <GlobeContainer disableRegionHover={true} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full bg-canvas-dark">
      {/* Pinned Viewport Container */}
      <div ref={viewportRef} className="story-viewport h-[calc(100vh-5rem)] w-full overflow-hidden relative flex items-center justify-center" style={{ contain: 'layout style' }}>
        
        {/* Subtle grid pattern overlay */}
        <div className="story-grid-overlay absolute inset-0 bg-[linear-gradient(to_right,#1c2d38_1px,transparent_1px),linear-gradient(to_bottom,#1c2d38_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 pointer-events-none" />

        {/* Ambient background shading */}
        <div className="absolute inset-0 bg-radial-[circle_80%_at_50%_40%] from-transparent via-canvas-dark/50 to-canvas-dark pointer-events-none" />

        {/* Cinematic content layers */}
        <div className="relative w-full h-full max-w-7xl mx-auto px-6 flex items-center justify-between pointer-events-none">
          
          {/* SCENE 1: Left Text Column */}
          <div className="hero-text-panel flex flex-col items-start text-left w-full md:w-[55%] lg:w-[52%] z-10 pointer-events-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] m-0">
              Understand Weather Instantly. <br />
              Respond <TypingText words={TYPING_WORDS} />
            </h1>
            <p className="mt-6 text-base text-muted-dark leading-relaxed font-sans max-w-xl m-0">
              Get real-time forecasts, severity-based alerts, and climate intelligence through one conversational interface — powered by IMD, INSAT, GFS, and ECMWF data.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full">
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-canvas-dark bg-brand-green hover:bg-brand-green-dark px-8 py-3.5 rounded-full shadow-lg shadow-brand-green/10 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </Link>
              <button
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="text-sm font-semibold text-white bg-transparent border border-hairline-dark hover:bg-surface-dark/50 px-8 py-3.5 rounded-full transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 group cursor-pointer"
              >
                Learn More
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
              </button>
            </div>
          </div>

          {/* Centerpiece Globe wrapper */}
          <div ref={globeWrapperRef} className="globe-wrapper w-[80vw] h-[80vw] md:w-[45vw] md:h-[45vw] max-w-[560px] max-h-[560px] flex items-center justify-center pointer-events-auto z-0" style={{ willChange: 'transform, opacity', backfaceVisibility: 'hidden' }}>
            <GlobeContainer ref={globeContainerRef} disableTelemetry={true} disableRegionHover={true} />
          </div>

          {/* SCENE 4: Hotspot Cards */}
          {/* Node 1: Western India / Cyclone Card */}
          <div className="node-card-wildfire absolute md:right-12 right-[5%] bottom-[8%] md:bottom-auto md:top-[30%] max-w-sm w-[90%] md:w-[320px] glass-panel p-6 rounded-2xl border-l-4 border-l-orange-500 opacity-0 scale-95 pointer-events-auto shadow-2xl shadow-orange-500/5 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-orange-400 font-bold uppercase">Western India</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Cyclone Tracking</h3>
            <div className="grid grid-cols-2 gap-4 border-t border-hairline-dark/40 pt-4">
              <div>
                <div className="text-[9px] font-mono text-muted-dark uppercase tracking-wider">Wind Speed</div>
                <div className="text-base font-bold text-white mt-1">145 km/h</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-muted-dark uppercase tracking-wider">Category</div>
                <div className="text-base font-bold text-white mt-1">Severe</div>
              </div>
            </div>
          </div>

          {/* Node 2: Northern Plains / Flood Warning Card */}
          <div className="node-card-flood absolute md:left-12 left-[5%] bottom-[8%] md:bottom-auto md:top-[35%] max-w-sm w-[90%] md:w-[320px] glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500 opacity-0 scale-95 pointer-events-auto shadow-2xl shadow-blue-500/5 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-blue-400 font-bold uppercase">Northern Plains</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Flood Warning</h3>
            <div className="grid grid-cols-2 gap-4 border-t border-hairline-dark/40 pt-4">
              <div>
                <div className="text-[9px] font-mono text-muted-dark uppercase tracking-wider">River Level</div>
                <div className="text-base font-bold text-white mt-1">+2.4m</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-muted-dark uppercase tracking-wider">Severity</div>
                <div className="text-base font-bold text-blue-400 mt-1">Extreme</div>
              </div>
            </div>
          </div>

          {/* Node 3: Agri Belt / Monsoon Advisory Card */}
          <div className="node-card-resource absolute md:right-12 right-[5%] bottom-[8%] md:bottom-auto md:top-[30%] max-w-sm w-[90%] md:w-[320px] glass-panel p-6 rounded-2xl border-l-4 border-l-brand-green opacity-0 scale-95 pointer-events-auto shadow-2xl shadow-brand-green/5 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest text-brand-green font-bold uppercase">Agri Belt</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-4">Monsoon Advisory</h3>
            <div className="grid grid-cols-2 gap-4 border-t border-hairline-dark/40 pt-4">
              <div>
                <div className="text-[9px] font-mono text-muted-dark uppercase tracking-wider">Rainfall</div>
                <div className="text-base font-bold text-white mt-1">124 mm</div>
              </div>
              <div>
                <div className="text-[9px] font-mono text-muted-dark uppercase tracking-wider">Sowing Window</div>
                <div className="text-base font-bold text-brand-green mt-1">Optimal</div>
              </div>
            </div>
          </div>

          {/* SCENE 6: AI Analysis Overlay */}
          <div className="ai-overlay absolute inset-0 pointer-events-none opacity-0 flex items-center justify-center">
            {/* Circular scanning bracket */}
            <div className="absolute w-[80vw] h-[80vw] max-w-[500px] max-h-[500px] md:max-w-[640px] md:max-h-[640px] rounded-full border border-brand-green/15 animate-spin [animation-duration:24s] z-10" />
            <div className="absolute w-[84vw] h-[84vw] max-w-[520px] max-h-[520px] md:max-w-[670px] md:max-h-[670px] rounded-full border border-dashed border-brand-green/10 animate-spin [animation-duration:36s] [animation-direction:reverse] z-10" />
            
            {/* HUD border brackets */}
            <div className="absolute w-[86vw] h-[86vw] max-w-[540px] max-h-[540px] md:max-w-[700px] md:max-h-[700px] flex items-center justify-center z-10">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-green/30" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-green/30" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-green/30" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-green/30" />
            </div>

            {/* Scanning line sweep */}
            <div className="scan-sweep-line absolute w-[80vw] md:w-[600px] h-[3px] bg-gradient-to-r from-transparent via-brand-green/45 to-transparent z-20" style={{ animation: 'scan-sweep 4s ease-in-out infinite' }} />

            {/* ── LEFT PANEL: INTELLIGENCE INPUTS ── */}
            <div className="intel-panel-left absolute left-3 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 w-[200px] md:w-[230px] lg:w-[250px] z-30 select-none hidden md:flex flex-col">

              {/* Panel glass container */}
              <div className="backdrop-blur-xl bg-canvas-dark/70 border border-brand-green/20 rounded-2xl p-5 shadow-2xl shadow-black/40" style={{ background: 'linear-gradient(135deg, rgba(0,30,43,0.80) 0%, rgba(0,30,43,0.60) 100%)' }}>
                {/* Panel header */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green" style={{ animation: 'status-blink 2.8s ease-in-out infinite' }} />
                  <span className="text-[10px] font-mono tracking-[0.2em] text-brand-green font-semibold uppercase">Intelligence Inputs</span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-brand-green/25 via-brand-green/10 to-transparent mb-5" />

                {/* Feature items */}
                <div className="flex flex-col gap-4">
                  {/* Item 1: Satellite SAR Radar */}
                  <div className="intel-item group flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl transition-all duration-300 hover:bg-brand-green/[0.04] cursor-default">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 text-brand-green" style={{ animation: 'icon-pulse 4s ease-in-out infinite' }}>
                      <Satellite className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white tracking-wide leading-none">INSAT Satellite Imagery</span>
                        <div className="w-1 h-1 rounded-full bg-brand-green/60 flex-shrink-0" style={{ animation: 'status-blink 3.2s ease-in-out infinite 0.4s' }} />
                      </div>
                      <p className="text-[10px] text-muted-dark/80 leading-relaxed mt-1.5 font-sans">Track cloud formations, cyclone paths, and precipitation patterns.</p>
                    </div>
                  </div>

                  {/* Item 2: Weather & Precipitation */}
                  <div className="intel-item group flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl transition-all duration-300 hover:bg-brand-green/[0.04] cursor-default">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 text-brand-green" style={{ animation: 'icon-pulse 4s ease-in-out infinite 0.5s' }}>
                      <Radio className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white tracking-wide leading-none">IMD Observation Network</span>
                        <div className="w-1 h-1 rounded-full bg-brand-green/60 flex-shrink-0" style={{ animation: 'status-blink 3.2s ease-in-out infinite 0.9s' }} />
                      </div>
                      <p className="text-[10px] text-muted-dark/80 leading-relaxed mt-1.5 font-sans">Ingest real-time temperature, humidity, and rainfall measurements.</p>
                    </div>
                  </div>

                  {/* Item 3: Field Transit Reports */}
                  <div className="intel-item group flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl transition-all duration-300 hover:bg-brand-green/[0.04] cursor-default">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 text-brand-green" style={{ animation: 'icon-pulse 4s ease-in-out infinite 1s' }}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white tracking-wide leading-none">WIS 2.0 Global Exchange</span>
                        <div className="w-1 h-1 rounded-full bg-brand-green/60 flex-shrink-0" style={{ animation: 'status-blink 3.2s ease-in-out infinite 1.4s' }} />
                      </div>
                      <p className="text-[10px] text-muted-dark/80 leading-relaxed mt-1.5 font-sans">Global meteorological data exchange from WMO member nations.</p>
                    </div>
                  </div>

                  {/* Item 4: GIS Road Network */}
                  <div className="intel-item group flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl transition-all duration-300 hover:bg-brand-green/[0.04] cursor-default">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 text-brand-green" style={{ animation: 'icon-pulse 4s ease-in-out infinite 1.5s' }}>
                      <Map className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white tracking-wide leading-none">GFS & ECMWF Models</span>
                        <div className="w-1 h-1 rounded-full bg-brand-green/60 flex-shrink-0" style={{ animation: 'status-blink 3.2s ease-in-out infinite 1.9s' }} />
                      </div>
                      <p className="text-[10px] text-muted-dark/80 leading-relaxed mt-1.5 font-sans">Numerical weather prediction models for multi-day forecasts.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL: ACTIONABLE OUTPUTS ── */}
            <div className="intel-panel-right absolute right-3 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 w-[200px] md:w-[230px] lg:w-[250px] z-30 select-none hidden md:flex flex-col">

              {/* Panel glass container */}
              <div className="backdrop-blur-xl bg-canvas-dark/70 border border-brand-green/20 rounded-2xl p-5 shadow-2xl shadow-black/40" style={{ background: 'linear-gradient(225deg, rgba(0,30,43,0.80) 0%, rgba(0,30,43,0.60) 100%)' }}>
                {/* Panel header */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green" style={{ animation: 'status-blink 2.8s ease-in-out infinite 0.3s' }} />
                  <span className="text-[10px] font-mono tracking-[0.2em] text-brand-green font-semibold uppercase">Actionable Outputs</span>
                </div>
                <div className="w-full h-px bg-gradient-to-r from-brand-green/25 via-brand-green/10 to-transparent mb-5" />

                {/* Feature items */}
                <div className="flex flex-col gap-4">
                  {/* Item 1: Route Risk Prediction */}
                  <div className="intel-item group flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl transition-all duration-300 hover:bg-brand-green/[0.04] cursor-default">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 text-brand-green" style={{ animation: 'icon-pulse 4s ease-in-out infinite 0.3s' }}>
                      <BrainCircuit className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white tracking-wide leading-none">AI Forecast Generation</span>
                        <div className="w-1 h-1 rounded-full bg-brand-green/60 flex-shrink-0" style={{ animation: 'status-blink 3.2s ease-in-out infinite 0.7s' }} />
                      </div>
                      <p className="text-[10px] text-muted-dark/80 leading-relaxed mt-1.5 font-sans">Generate hyper-local forecasts with model ensemble analysis.</p>
                    </div>
                  </div>

                  {/* Item 2: Corridor Vulnerability */}
                  <div className="intel-item group flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl transition-all duration-300 hover:bg-brand-green/[0.04] cursor-default">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 text-brand-green" style={{ animation: 'icon-pulse 4s ease-in-out infinite 0.8s' }}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white tracking-wide leading-none">Severity Alert Classification</span>
                        <div className="w-1 h-1 rounded-full bg-brand-green/60 flex-shrink-0" style={{ animation: 'status-blink 3.2s ease-in-out infinite 1.2s' }} />
                      </div>
                      <p className="text-[10px] text-muted-dark/80 leading-relaxed mt-1.5 font-sans">Classify weather events by IMD severity thresholds.</p>
                    </div>
                  </div>

                  {/* Item 3: Multimodal Logistics Rerouting */}
                  <div className="intel-item group flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl transition-all duration-300 hover:bg-brand-green/[0.04] cursor-default">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 text-brand-green" style={{ animation: 'icon-pulse 4s ease-in-out infinite 1.3s' }}>
                      <Ambulance className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white tracking-wide leading-none">Agro-Climate Advisories</span>
                        <div className="w-1 h-1 rounded-full bg-brand-green/60 flex-shrink-0" style={{ animation: 'status-blink 3.2s ease-in-out infinite 1.7s' }} />
                      </div>
                      <p className="text-[10px] text-muted-dark/80 leading-relaxed mt-1.5 font-sans">Deliver sowing, irrigation, and harvest guidance to farmers.</p>
                    </div>
                  </div>

                  {/* Item 4: MDoNER Dispatch Sync */}
                  <div className="intel-item group flex items-start gap-3 p-2.5 -mx-2.5 rounded-xl transition-all duration-300 hover:bg-brand-green/[0.04] cursor-default">
                    <div className="flex-shrink-0 mt-0.5 w-5 h-5 text-brand-green" style={{ animation: 'icon-pulse 4s ease-in-out infinite 1.8s' }}>
                      <Megaphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-white tracking-wide leading-none">Automated Alert Dispatch</span>
                        <div className="w-1 h-1 rounded-full bg-brand-green/60 flex-shrink-0" style={{ animation: 'status-blink 3.2s ease-in-out infinite 2.2s' }} />
                      </div>
                      <p className="text-[10px] text-muted-dark/80 leading-relaxed mt-1.5 font-sans">Push severity alerts to disaster management authorities.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── MOBILE: Compact bottom panels (visible only on small screens) ── */}
            <div className="md:hidden absolute bottom-3 left-3 right-3 z-30 flex gap-2.5 select-none">
              {/* Mobile left panel */}
              <div className="intel-panel-left flex-1 backdrop-blur-xl bg-canvas-dark/65 border border-brand-green/15 rounded-xl p-3 shadow-xl" style={{ background: 'linear-gradient(135deg, rgba(0,30,43,0.80) 0%, rgba(0,30,43,0.60) 100%)' }}>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-1 h-1 rounded-full bg-brand-green" style={{ animation: 'status-blink 2.8s ease-in-out infinite' }} />
                  <span className="text-[8px] font-mono tracking-[0.15em] text-brand-green font-semibold uppercase">Inputs</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <Satellite className="w-3 h-3 text-brand-green" />
                    <span className="text-[9px] text-white/80 font-medium">INSAT Satellite</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-brand-green" />
                    <span className="text-[9px] text-white/80 font-medium">IMD Stations</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3 h-3 text-brand-green" />
                    <span className="text-[9px] text-white/80 font-medium">WIS 2.0 Data</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Map className="w-3 h-3 text-brand-green" />
                    <span className="text-[9px] text-white/80 font-medium">GFS & ECMWF</span>
                  </div>
                </div>
              </div>
              {/* Mobile right panel */}
              <div className="intel-panel-right flex-1 backdrop-blur-xl bg-canvas-dark/65 border border-brand-green/15 rounded-xl p-3 shadow-xl" style={{ background: 'linear-gradient(225deg, rgba(0,30,43,0.80) 0%, rgba(0,30,43,0.60) 100%)' }}>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-1 h-1 rounded-full bg-brand-green" style={{ animation: 'status-blink 2.8s ease-in-out infinite 0.3s' }} />
                  <span className="text-[8px] font-mono tracking-[0.15em] text-brand-green font-semibold uppercase">Outputs</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <BrainCircuit className="w-3 h-3 text-brand-green" />
                    <span className="text-[9px] text-white/80 font-medium">AI Forecasts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3 h-3 text-brand-green" />
                    <span className="text-[9px] text-white/80 font-medium">Alert Severity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Ambulance className="w-3 h-3 text-brand-green" />
                    <span className="text-[9px] text-white/80 font-medium">Agro Advisories</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Megaphone className="w-3 h-3 text-brand-green" />
                    <span className="text-[9px] text-white/80 font-medium">Alert Dispatch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="reveal-text absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full px-6 text-center text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-white leading-tight max-w-4xl mx-auto opacity-0 z-20 pointer-events-none">
            <span className="word inline-block mr-3 md:mr-4 text-white">From</span>
            <span className="word inline-block mr-3 md:mr-4 text-white">Weather</span>
            <span className="word inline-block mr-3 md:mr-4 text-white">Query</span>
            <span className="word inline-block mr-3 md:mr-4 text-white">to</span>
            <span className="word inline-block mr-3 md:mr-4 text-white">Actionable</span>
            <span className="word inline-block mr-3 md:mr-4 text-white">Intelligence</span>
            <span className="word inline-block text-brand-green">in Seconds.</span>
          </h2>

        </div>
      </div>
      <style>{`
        @keyframes scan-sweep {
          0%, 100% { transform: translateY(-220px); }
          50% { transform: translateY(220px); }
        }
        @media (max-width: 767px) {
          @keyframes scan-sweep {
            0%, 100% { transform: translateY(-130px); }
            50% { transform: translateY(130px); }
          }
        }

        /* Intelligence panel micro-animations */
        @keyframes icon-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes status-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.25; }
        }
        @keyframes connection-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes dot-ping {
          0%, 100% { opacity: 0.4; transform: translateY(-50%) scale(1); }
          50% { opacity: 1; transform: translateY(-50%) scale(1.6); }
        }

        /* Intel item hover expansion */
        .intel-item {
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s ease;
        }
        .intel-item:hover {
          transform: scale(1.03) translateX(2px);
        }
      `}</style>
    </div>
  )
}
