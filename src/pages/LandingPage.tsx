import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Eye, MapPin, Activity, Shield, ChevronRight, AlertTriangle, LifeBuoy, CheckCircle, X } from 'lucide-react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollStory from '../components/ScrollStory'
import SEO from '../components/SEO'
import WorkflowTimeline from '../components/WorkflowTimeline'
import MagnetLines from '../components/MagnetLines'

gsap.registerPlugin(ScrollTrigger)

const NER_LOCATIONS = [
  'Mumbai, Maharashtra',
  'Delhi, NCR',
  'Bengaluru, Karnataka',
  'Chennai, Tamil Nadu',
  'Kolkata, West Bengal',
  'Hyderabad, Telangana',
  'Ahmedabad, Gujarat',
  'Pune, Maharashtra',
  'Jaipur, Rajasthan',
  'Lucknow, Uttar Pradesh',
  'Bhopal, Madhya Pradesh',
  'Chandigarh, Punjab',
  'Kochi, Kerala',
  'Guwahati, Assam',
  'Patna, Bihar',
  'Bhubaneswar, Odisha',
  'Dehradun, Uttarakhand',
  'Thiruvananthapuram, Kerala',
  'Visakhapatnam, Andhra Pradesh',
  'Ranchi, Jharkhand',
  'Shimla, Himachal Pradesh',
  'Srinagar, J&K',
  'Gangtok, Sikkim',
  'Agartala, Tripura',
  'Shillong, Meghalaya'
]

export default function LandingPage() {
  // Initialize Lenis Smooth Scrolling on Landing Page
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    // Synchronize Lenis scroll updates with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(updateTicker)
    gsap.ticker.lagSmoothing(0)

    ;(window as any).lenis = lenis

    return () => {
      gsap.ticker.remove(updateTicker)
      lenis.destroy()
      delete (window as any).lenis
    }
  }, [])

  // Public/Independent Intake Modal States
  const [showIntakeModal, setShowIntakeModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'report' | 'help'>('report')
  const [isLocating, setIsLocating] = useState(false)
  const [locError, setLocError] = useState<'permission-denied' | 'secure-context' | 'other' | null>(null)

  // Autocomplete States
  const [incSuggestions, setIncSuggestions] = useState<string[]>([])
  const [helpSuggestions, setHelpSuggestions] = useState<string[]>([])
  const [showIncDropdown, setShowIncDropdown] = useState(false)
  const [showHelpDropdown, setShowHelpDropdown] = useState(false)

  // Incident Form State
  const [incTitle, setIncTitle] = useState('')
  const [incLoc, setIncLoc] = useState('')
  const [incDesc, setIncDesc] = useState('')
  const [incSubmitted, setIncSubmitted] = useState(false)

  // Help Form State
  const [helpName, setHelpName] = useState('')
  const [helpLoc, setHelpLoc] = useState('')
  const [helpDesc, setHelpDesc] = useState('')
  const [helpSubmitted, setHelpSubmitted] = useState(false)

  const { state: navigationState } = useLocation()

  const resetLocationAutocomplete = () => {
    setIncSuggestions([])
    setHelpSuggestions([])
    setShowIncDropdown(false)
    setShowHelpDropdown(false)
  }

  const selectSuggestion = (val: string, type: 'report' | 'help') => {
    if (type === 'report') {
      setIncLoc(val)
      setShowIncDropdown(false)
    } else {
      setHelpLoc(val)
      setShowHelpDropdown(false)
    }
  }

  const fetchSuggestions = async (query: string, type: 'report' | 'help') => {
    if (!query || query.length < 2) {
      if (type === 'report') setIncSuggestions([])
      else setHelpSuggestions([])
      return
    }

    // Filter local major NER locations first for instant feedback
    const localMatches = NER_LOCATIONS.filter(loc =>
      loc.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 4)

    if (type === 'report') setIncSuggestions(localMatches)
    else setHelpSuggestions(localMatches)

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
      )
      if (!res.ok) throw new Error('Nominatim search failed')
      const data = await res.json()
      const apiMatches = data.map((item: any) => item.display_name)
      
      // Merge and deduplicate
      const merged = Array.from(new Set([...localMatches, ...apiMatches])).slice(0, 5)
      
      if (type === 'report') setIncSuggestions(merged)
      else setHelpSuggestions(merged)
    } catch (err) {
      console.error('Error fetching suggestions:', err)
    }
  }

  // Debounce autocomplete suggestions
  useEffect(() => {
    const activeQuery = activeTab === 'report' ? incLoc : helpLoc
    const showDropdown = activeTab === 'report' ? showIncDropdown : showHelpDropdown
    
    if (!activeQuery || activeQuery.length < 2 || !showDropdown) {
      if (activeTab === 'report') setIncSuggestions([])
      else setHelpSuggestions([])
      return
    }

    const timer = setTimeout(() => {
      fetchSuggestions(activeQuery, activeTab)
    }, 350)
    return () => clearTimeout(timer)
  }, [incLoc, helpLoc, showIncDropdown, showHelpDropdown, activeTab])

  // Click outside to close dropdowns
  useEffect(() => {
    const clickOutside = () => {
      setShowIncDropdown(false)
      setShowHelpDropdown(false)
    }
    window.addEventListener('click', clickOutside)
    return () => window.removeEventListener('click', clickOutside)
  }, [])

  // Auto-detect browser location
  const requestLocation = (type: 'report' | 'help') => {
    if (!('geolocation' in navigator) || !window.isSecureContext) {
      setLocError('secure-context')
      return
    }
    setIsLocating(true)
    setLocError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        // Reverse geocode via Nominatim API to get a human-readable street/city address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`)
          .then((res) => {
            if (!res.ok) throw new Error('Geocoding response error')
            return res.json()
          })
          .then((data) => {
            const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            if (type === 'report') {
              setIncLoc(address)
            } else {
              setHelpLoc(address)
            }
            setIsLocating(false)
          })
          .catch((error) => {
            console.error('Error reverse geocoding:', error)
            const coordsStr = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            if (type === 'report') {
              setIncLoc(coordsStr)
            } else {
              setHelpLoc(coordsStr)
            }
            setIsLocating(false)
          })
      },
      (error) => {
        console.error('Error fetching location:', error)
        setIsLocating(false)
        if (error.code === error.PERMISSION_DENIED) {
          setLocError('permission-denied')
        } else {
          setLocError('other')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // Trigger geo-detection on modal load or tab toggle if field is empty
  useEffect(() => {
    if (showIntakeModal) {
      if (activeTab === 'report' && !incLoc) {
        requestLocation('report')
      } else if (activeTab === 'help' && !helpLoc) {
        requestLocation('help')
      }
    }
  }, [showIntakeModal, activeTab])

  // Pause/resume Lenis smooth scrolling when intake modal opens/closes
  useEffect(() => {
    const lenisInstance = (window as any).lenis
    if (lenisInstance) {
      if (showIntakeModal) {
        lenisInstance.stop()
      } else {
        lenisInstance.start()
      }
    }
  }, [showIntakeModal])

  // Listen for the custom navbar dispatch event
  useEffect(() => {
    const handleSetTab = (e: Event) => {
      const customEvent = e as CustomEvent<'report' | 'help'>
      if (customEvent.detail) {
        setActiveTab(customEvent.detail)
        setShowIntakeModal(true)
      }
    }
    window.addEventListener('set-intake-tab', handleSetTab)
    return () => window.removeEventListener('set-intake-tab', handleSetTab)
  }, [])

  // Listen for navigation state from another route
  useEffect(() => {
    if (navigationState && (navigationState as any).openIntake) {
      setActiveTab((navigationState as any).openIntake)
      setShowIntakeModal(true)
      // Clear navigation state
      window.history.replaceState({}, document.title)
    }
  }, [navigationState])



  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  }

  return (
    <>
      <SEO 
        title="WeatherGPT — Conversational AI for Weather Forecasting, Alerts & Climate Intelligence" 
        description="Get real-time forecasts, severity-based alerts, and climate intelligence through one conversational interface — powered by IMD, INSAT, GFS, and ECMWF data." 
      />

      <div className="relative w-full overflow-hidden">
        {/* 1. HERO SECTION (SCROLL STORYTELLING) */}
        <ScrollStory />

        {/* 1.5 MINI FEATURES GRID SECTION */}
        <section className="relative z-10 px-6 pt-24 pb-12 max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full pt-12 border-t border-hairline-dark/30"
          >
            <motion.div 
              variants={itemVariants} 
              whileHover={{ scale: 1.08, y: -8 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0 }}
              className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-md hover:border-brand-green/30 hover:bg-brand-green/[0.02] shadow-xl hover:shadow-brand-green/5 transition-all duration-300"
            >
              <div className="p-3 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green animate-pulse">
                <Eye className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold tracking-wide text-white">Real-Time Forecasts</span>
              <span className="text-sm text-muted-dark leading-normal max-w-[200px]">Instant weather predictions for any location</span>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              whileHover={{ scale: 1.08, y: -8 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
              className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-md hover:border-brand-green/30 hover:bg-brand-green/[0.02] shadow-xl hover:shadow-brand-green/5 transition-all duration-300"
            >
              <div className="p-3 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green animate-pulse">
                <MapPin className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold tracking-wide text-white">Smart Alerts</span>
              <span className="text-sm text-muted-dark leading-normal max-w-[200px]">Severity-based weather warnings</span>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              whileHover={{ scale: 1.08, y: -8 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }}
              className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-md hover:border-brand-green/30 hover:bg-brand-green/[0.02] shadow-xl hover:shadow-brand-green/5 transition-all duration-300"
            >
              <div className="p-3 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green animate-pulse">
                <Activity className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold tracking-wide text-white">Climate Analytics</span>
              <span className="text-sm text-muted-dark leading-normal max-w-[200px]">Historical trends & rainfall analysis</span>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              whileHover={{ scale: 1.08, y: -8 }}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 3 }}
              className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl border border-white/[0.04] bg-white/[0.01] backdrop-blur-md hover:border-brand-green/30 hover:bg-brand-green/[0.02] shadow-xl hover:shadow-brand-green/5 transition-all duration-300"
            >
              <div className="p-3 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green animate-pulse">
                <Shield className="w-8 h-8" />
              </div>
              <span className="text-xl font-bold tracking-wide text-white">Conversational AI</span>
              <span className="text-sm text-muted-dark leading-normal max-w-[200px]">Natural-language weather queries</span>
            </motion.div>
          </motion.div>
        </section>

        {/* 2. FEATURES SECTION */}
        <section id="features" className="py-24 border-t border-hairline-dark/30 bg-surface-dark/10 relative z-10 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-xs font-mono tracking-widest text-brand-green uppercase">
                Core Capabilities
              </h2>
              <p className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Conversational weather intelligence for India
              </p>
              <p className="mt-4 text-base text-muted-dark">
                Empowering citizens, farmers, disaster management authorities, and rural communities with real-time weather forecasts, alerts, and climate analytics.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Feature 1 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="p-8 rounded-xl border border-hairline-dark/60 bg-canvas-dark/40 backdrop-blur-sm hover:border-brand-green/30 transition-colors duration-300 flex flex-col gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-green transition-colors duration-200">
                  Real-Time Forecasting
                </h3>
                <p className="text-sm text-muted-dark leading-relaxed">
                  Hyper-local weather predictions powered by IMD stations, INSAT satellite imagery, and GFS/ECMWF numerical models.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="p-8 rounded-xl border border-hairline-dark/60 bg-canvas-dark/40 backdrop-blur-sm hover:border-brand-green/30 transition-colors duration-300 flex flex-col gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-green transition-colors duration-200">
                  Severity-Based Alerts
                </h3>
                <p className="text-sm text-muted-dark leading-relaxed">
                  Automated weather warnings classified by IMD severity thresholds — from cyclones and floods to heatwaves and cold waves.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="p-8 rounded-xl border border-hairline-dark/60 bg-canvas-dark/40 backdrop-blur-sm hover:border-brand-green/30 transition-colors duration-300 flex flex-col gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-green transition-colors duration-200">
                  Agro-Climate Advisories
                </h3>
                <p className="text-sm text-muted-dark leading-relaxed">
                  Crop-specific sowing, irrigation, and harvest guidance for farmers based on monsoon patterns and soil moisture analysis.
                </p>
              </motion.div>

              {/* Feature 4 */}
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -6 }}
                className="p-8 rounded-xl border border-hairline-dark/60 bg-canvas-dark/40 backdrop-blur-sm hover:border-brand-green/30 transition-colors duration-300 flex flex-col gap-4 group"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-green transition-colors duration-200">
                  Disaster Early Warning
                </h3>
                <p className="text-sm text-muted-dark leading-relaxed">
                  Proactive alerts for floods, landslides, and extreme weather events with automated dispatch to district disaster management authorities.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 3. HOW IT WORKS SECTION */}
        <WorkflowTimeline />

        {/* Public/Independent Intake Popup Modal */}
        <AnimatePresence>
          {showIntakeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setShowIntakeModal(false)
                  setLocError(null)
                  resetLocationAutocomplete()
                }}
                className="absolute inset-0 bg-canvas-dark/85 backdrop-blur-md"
              />

              {/* Modal Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-xl p-8 rounded-2xl border border-white/[0.08] bg-canvas-dark/95 shadow-2xl z-10 overflow-hidden text-center"
              >
                {/* Close button */}
                <button
                  onClick={() => {
                    setShowIntakeModal(false)
                    setLocError(null)
                    resetLocationAutocomplete()
                  }}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-all duration-150 hover:scale-[1.05] active:scale-[0.95] cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                    {activeTab === 'report' ? 'Report Weather Event' : 'Ask a Weather Question'}
                  </h2>
                  <p className="text-sm text-white/50 max-w-sm mx-auto leading-relaxed">
                    {activeTab === 'report' 
                      ? 'Report a severe weather event, unusual conditions, or hazardous weather in your area.' 
                      : 'Ask any weather, climate, or forecast question and get an AI-powered response.'}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex justify-center mb-6">
                  <div className="flex p-1 rounded-lg bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
                    <button
                      onClick={() => {
                        setActiveTab('report')
                        setLocError(null)
                        resetLocationAutocomplete()
                      }}
                      className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-semibold font-mono tracking-tight transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none ${
                        activeTab === 'report'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'text-white/40 hover:text-white/80 border border-transparent'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Report Event
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('help')
                        setLocError(null)
                        resetLocationAutocomplete()
                      }}
                      className={`flex items-center gap-2 px-5 py-2 rounded-md text-xs font-semibold font-mono tracking-tight transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none ${
                        activeTab === 'help'
                          ? 'bg-brand-green/10 text-brand-green border border-brand-green/20'
                          : 'text-white/40 hover:text-white/80 border border-transparent'
                      }`}
                    >
                      <LifeBuoy className="w-3.5 h-3.5" />
                      Ask Weather
                    </button>
                  </div>
                </div>

                {/* Form Container */}
                <div className="relative text-left">
                  {locError === 'permission-denied' && (
                    <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs leading-relaxed flex flex-col gap-1.5">
                      <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Geolocation Permission Denied
                      </span>
                      <span className="text-white font-semibold">
                        To fix this: Click the lock icon next to the URL in your browser address bar, change Location permission to "Allow", and click "Use Current Location" again.
                      </span>
                    </div>
                  )}
                  {locError === 'secure-context' && (
                    <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed flex flex-col gap-1.5">
                      <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Secure Context Required
                      </span>
                      <span>
                        Browser geolocation services require a secure HTTPS connection or localhost. Please verify your connection status.
                      </span>
                    </div>
                  )}

                  {activeTab === 'report' ? (
                    incSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 flex flex-col items-center"
                      >
                        <CheckCircle className="w-12 h-12 text-red-400 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Event Reported</h3>
                        <p className="text-sm text-white/50 max-w-sm leading-relaxed mb-6">
                          Your weather event report has been logged into WeatherGPT. Alert classification and affected region analysis have been initiated.
                        </p>
                        <button
                          onClick={() => {
                            setIncTitle('')
                            setIncLoc('')
                            setIncDesc('')
                            setIncSubmitted(false)
                          }}
                          className="text-xs font-mono font-bold tracking-wider text-red-400 uppercase hover:underline cursor-pointer"
                        >
                          Report Another Event
                        </button>
                      </motion.div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (incTitle && incLoc) {
                            setIncSubmitted(true)
                          }
                        }}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Event Type / Weather Hazard</label>
                          <input
                            type="text"
                            required
                            value={incTitle}
                            onChange={(e) => setIncTitle(e.target.value)}
                            placeholder="e.g. Heavy rainfall flooding in Patna, Bihar"
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-red-500/50 focus:ring-0 focus:outline-none transition-colors duration-200"
                          />
                        </div>
                        <div 
                          className="flex flex-col gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Location / Region</label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              required
                              value={incLoc}
                              onFocus={() => setShowIncDropdown(true)}
                              onChange={(e) => {
                                setIncLoc(e.target.value)
                                setShowIncDropdown(true)
                              }}
                              placeholder="e.g. Mumbai, Maharashtra or 28.6139, 77.2090"
                              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-white/20 focus:border-red-500/50 focus:ring-0 focus:outline-none transition-colors duration-200"
                            />
                            <button
                              type="button"
                              onClick={() => requestLocation('report')}
                              className="absolute right-3 text-white/30 hover:text-white transition-colors duration-200 cursor-pointer flex items-center justify-center"
                              title="Detect Location"
                              disabled={isLocating}
                            >
                              {isLocating ? (
                                <svg className="animate-spin h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <MapPin className="w-4 h-4 text-red-400" />
                              )}
                            </button>

                            {showIncDropdown && incSuggestions.length > 0 ? (
                              <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-hairline-dark bg-canvas-dark shadow-2xl">
                                {incSuggestions.map((sug, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      selectSuggestion(sug, 'report')
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 font-sans truncate"
                                  >
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => requestLocation('report')}
                            className="self-start mt-1 text-[10px] font-mono font-bold tracking-wider text-red-400 hover:text-red-300 uppercase flex items-center gap-1.5 cursor-pointer transition-all duration-150 ease-out active:scale-95 border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 px-3 py-1 rounded-full shadow-sm shadow-red-500/5"
                          >
                            <MapPin className="w-3.5 h-3.5" /> Use Current Location
                          </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Event Details & Observations</label>
                          <textarea
                            required
                            value={incDesc}
                            onChange={(e) => setIncDesc(e.target.value)}
                            placeholder="Describe the weather event, severity, duration, and any damage observed..."
                            rows={3}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-red-500/50 focus:ring-0 focus:outline-none transition-colors duration-200 resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="mt-2 w-full text-sm font-semibold text-white bg-red-500 hover:bg-red-600 py-3 rounded-xl shadow-lg shadow-red-500/10 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] font-mono tracking-tight cursor-pointer"
                        >
                          Submit Weather Event Report
                        </button>
                      </form>
                    )
                  ) : (
                    helpSubmitted ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6 flex flex-col items-center"
                      >
                        <CheckCircle className="w-12 h-12 text-brand-green mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Question Submitted</h3>
                        <p className="text-sm text-white/50 max-w-sm leading-relaxed mb-6">
                          Your weather query has been submitted to WeatherGPT. Our AI is processing your request and will generate a response shortly.
                        </p>
                        <button
                          onClick={() => {
                            setHelpName('')
                            setHelpLoc('')
                            setHelpDesc('')
                            setHelpSubmitted(false)
                          }}
                          className="text-xs font-mono font-bold tracking-wider text-brand-green uppercase hover:underline cursor-pointer"
                        >
                          Submit Another Request
                        </button>
                      </motion.div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          if (helpName && helpLoc) {
                            setHelpSubmitted(true)
                          }
                        }}
                        className="flex flex-col gap-4"
                      >
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Your Name / Organization</label>
                          <input
                            type="text"
                            required
                            value={helpName}
                            onChange={(e) => setHelpName(e.target.value)}
                            placeholder="Your name, organization, or department"
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-brand-green/50 focus:ring-0 focus:outline-none transition-colors duration-200"
                          />
                        </div>
                        <div 
                          className="flex flex-col gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <label className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Location of Interest</label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              required
                              value={helpLoc}
                              onFocus={() => setShowHelpDropdown(true)}
                              onChange={(e) => {
                                setHelpLoc(e.target.value)
                                setShowHelpDropdown(true)
                              }}
                              placeholder="e.g. Delhi, Mumbai, or coordinates"
                              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-white/20 focus:border-brand-green/50 focus:ring-0 focus:outline-none transition-colors duration-200"
                            />
                            <button
                              type="button"
                              onClick={() => requestLocation('help')}
                              className="absolute right-3 text-white/30 hover:text-white transition-colors duration-200 cursor-pointer flex items-center justify-center"
                              title="Detect Location"
                              disabled={isLocating}
                            >
                              {isLocating ? (
                                <svg className="animate-spin h-4 w-4 text-brand-green" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                              ) : (
                                <MapPin className="w-4 h-4 text-brand-green" />
                              )}
                            </button>
                            
                            {showHelpDropdown && helpSuggestions.length > 0 ? (
                              <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-hairline-dark bg-canvas-dark shadow-2xl">
                                {helpSuggestions.map((sug, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      selectSuggestion(sug, 'help')
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 font-sans truncate"
                                  >
                                    {sug}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => requestLocation('help')}
                            className="self-start mt-1 text-[10px] font-mono font-bold tracking-wider text-brand-green hover:text-brand-green-dark uppercase flex items-center gap-1.5 cursor-pointer transition-all duration-150 ease-out active:scale-95 border border-brand-green/20 bg-brand-green/5 hover:bg-brand-green/15 px-3 py-1 rounded-full shadow-sm shadow-brand-green/5"
                          >
                            <MapPin className="w-3.5 h-3.5" /> Use Current Location
                          </button>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-mono tracking-wider text-white/40 uppercase">Your Weather Question</label>
                          <textarea
                            required
                            value={helpDesc}
                            onChange={(e) => setHelpDesc(e.target.value)}
                            placeholder="e.g. What is the rainfall forecast for next week in Pune? Will there be a cyclone warning for the east coast?"
                            rows={3}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-brand-green/50 focus:ring-0 focus:outline-none transition-colors duration-200 resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          className="mt-2 w-full text-sm font-semibold text-canvas-dark bg-brand-green hover:bg-brand-green-dark py-3 rounded-xl shadow-lg shadow-brand-green/10 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] font-mono tracking-tight cursor-pointer"
                        >
                          Submit Weather Question
                        </button>
                      </form>
                    )
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>



        {/* 4. CTA SECTION */}
        <section id="contact" className="h-screen min-h-[600px] relative flex items-center justify-center overflow-hidden border-t border-hairline-dark/30 bg-radial-[circle_at_50%_50%] from-brand-teal-deep/30 via-canvas-dark to-canvas-dark px-6">
          {/* Interactive Magnetic Lines Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.25] z-0">
            <MagnetLines
              rows={16}
              columns={24}
              containerSize="100vmax"
              lineColor="rgba(0, 237, 100, 0.6)"
              lineWidth="0.3vmin"
              lineHeight="2.5vmin"
              baseAngle={0}
            />
          </div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={itemVariants}
            className="max-w-5xl w-full mx-auto text-center relative z-10 px-4"
          >
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl m-0 leading-tight">
              Weather intelligence, one conversation away
            </h2>
            <p className="mt-6 text-lg md:text-xl text-muted-dark max-w-2xl mx-auto leading-relaxed">
              Empower communities, farmers, and disaster authorities with real-time weather forecasts, severity alerts, and climate analytics — through natural conversation.
            </p>
            <div className="mt-10 flex items-center justify-center">
              <Link
                to="/dashboard"
                className="text-base font-semibold text-canvas-dark bg-brand-green hover:bg-brand-green-dark px-10 py-4.5 rounded-full transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand-green/10 flex items-center gap-2 group"
              >
                Open WeatherGPT
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  )
}
