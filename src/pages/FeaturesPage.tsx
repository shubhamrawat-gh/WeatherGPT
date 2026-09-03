import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Flame, Activity, Brain, Map, ShieldCheck, Bell, CheckCircle, ArrowRight } from 'lucide-react'
import SEO from '../components/SEO'
import MapContainer from '../components/dashboard/maps/MapContainer'

export default function FeaturesPage() {
  const handleMapLoad = (map: any) => {
    const incidentsSource = map.getSource('incidents-source')
    if (incidentsSource) {
      incidentsSource.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [91.8933, 25.5788] },
            properties: { title: 'Landslide Warning - NH-6 Shillong' }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [94.1086, 25.6751] },
            properties: { title: 'Choke Point - NH-29 Kohima' }
          }
        ]
      })
    }

    const resourcesSource = map.getSource('resources-source')
    if (resourcesSource) {
      resourcesSource.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [91.7362, 26.1445] },
            properties: { title: 'Guwahati Multi-Modal Hub' }
          },
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [88.4352, 26.7271] },
            properties: { title: 'Siliguri Staging Terminal' }
          }
        ]
      })
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  }

  const features = [
    {
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      title: "Real-Time Weather Forecasting",
      description: "Get hyper-local forecasts for temperature, precipitation, wind, and humidity across any district or city in India with multi-model AI ensemble precision.",
      badge: "Forecast Engine"
    },
    {
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      title: "Precipitation & Doppler Radar",
      description: "Receive instant rainfall telemetry and cloud movement insights from IMD Doppler radar feeds and INSAT satellite scans. Anticipate inundation in vulnerable zones.",
      badge: "IMD Weather"
    },
    {
      icon: <Brain className="w-6 h-6 text-indigo-400" />,
      title: "Conversational AI Interface",
      description: "Ask complex weather and climate questions in natural language. Get contextual explanations, interactive forecast charts, and actionable preparedness guidance.",
      badge: "NLP Engine"
    },
    {
      icon: <Map className="w-6 h-6 text-sky-400" />,
      title: "Interactive Live Weather GIS",
      description: "Visualize live radar layers, cloud coverage, cyclone tracks, rainfall intensity heatmaps, and active severe weather alert zones across India.",
      badge: "MapLibre GL"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-[#00ed64]" />,
      title: "Agro-Climate Advisory System",
      description: "Deliver tailored crop guidance including optimal sowing windows, soil moisture assessments, irrigation planning, and harvest weather advisories.",
      badge: "Agri Advisory"
    },
    {
      icon: <Bell className="w-6 h-6 text-red-400" />,
      title: "Disaster Early Warning & Alerts",
      description: "Deliver instant severity-classified weather bulletins to disaster management authorities, emergency response teams, and public channels.",
      badge: "Alert Dispatch"
    }
  ]

  const benefits = [
    {
      title: "Hyper-Local Forecast Accuracy",
      desc: "Access high-resolution predictions powered by multi-model ensembles combining GFS, ECMWF, and IMD numerical models."
    },
    {
      title: "Conversational Natural Language",
      desc: "Query weather patterns, monsoon timelines, and climate statistics naturally without interpreting complex meteorological charts."
    },
    {
      title: "Severity-Based Early Warnings",
      desc: "Automated alert classification warns communities well ahead of cyclones, cloudbursts, heatwaves, and flash floods."
    },
    {
      title: "Agro-Climate Decision Support",
      desc: "Help farmers safeguard crops with timely sowing windows, frost alerts, and precipitation outlooks."
    },
    {
      title: "Verified Multi-Agency Data Feeds",
      desc: "Seamless integration with IMD observation stations, INSAT satellites, WIS 2.0 exchange, and global NWP models."
    },
    {
      title: "AI-Generated Briefings & Summaries",
      desc: "Automated weather summaries, emergency bulletins, and regional trend briefings generated in seconds."
    }
  ]

  return (
    <>
      <SEO 
        title="WeatherGPT | Features & Core Capabilities" 
        description="WeatherGPT combines real-time weather observations, IMD radar feeds, satellite data, and conversational AI to deliver proactive weather intelligence." 
      />

      <div className="w-full bg-[#001e2b] text-white selection:bg-[#00ed64]/35 selection:text-[#001e2b] pb-24">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c2d38_1px,transparent_1px),linear-gradient(to_bottom,#1c2d38_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-[circle_80%_at_50%_40%] from-transparent via-[#001e2b]/50 to-[#001e2b] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-16 md:pt-24">
          
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-7xl font-medium tracking-tight md:tracking-[-1.5px] leading-tight md:leading-[1.10] text-white max-w-4xl mx-auto"
            >
              Conversational Weather Intelligence for{" "}
              <span className="text-[#00ed64]">
                India
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg font-normal text-[#a8b3bc] leading-[1.50] max-w-3xl mx-auto"
            >
              WeatherGPT combines real-time observation networks, IMD precipitation monitoring, satellite imagery, and conversational AI to deliver instant forecasts, severity alerts, and climate intelligence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-[22px] py-[10px] rounded-full text-sm font-semibold bg-[#00ed64] text-[#001e2b] hover:bg-[#00b545] transition-colors cursor-pointer text-center"
              >
                Open WeatherGPT
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-[22px] py-[10px] rounded-full text-sm font-semibold border border-[#1c2d38] bg-transparent text-white hover:bg-white/5 transition-colors cursor-pointer text-center"
              >
                View Live Map
              </Link>
            </motion.div>
          </div>

          {/* Interactive Feature Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-5xl mx-auto mb-28 rounded-lg border border-[#1c2d38] bg-[#001e2b] p-2 shadow-xl shadow-black/40"
          >
            <div className="rounded border border-[#1c2d38] bg-[#001e2b]/40 text-white overflow-hidden aspect-[16/9] flex flex-col relative">
              {/* Window Header */}
              <div className="bg-[#001e2b] border-b border-[#1c2d38] px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/70" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                  <div className="w-3 h-3 rounded-full bg-green-500/70" />
                  <span className="text-xs text-[#a8b3bc] font-mono ml-2">weathergpt-console // weather_intelligence</span>
                </div>
                <div className="px-3 py-1 rounded-md bg-[#00684a]/50 border border-[#00ed64]/30 text-[10px] font-mono text-[#00ed64]">
                  ● ACTIVE FEED: LIVE
                </div>
              </div>
              
              {/* Mock Dashboard Layout */}
              <div className="flex-1 grid grid-cols-12 overflow-hidden bg-slate-950/20">
                {/* Left Sidebar - Minimal Telemetry Status */}
                <div className="col-span-3 border-r border-[#1c2d38] p-4 flex flex-col gap-4 bg-[#001e2b]/35 text-left select-none">
                  <div>
                    <span className="text-[9px] font-bold text-[#a8b3bc]/70 tracking-widest font-mono block mb-2.5">ACTIVE FEEDS</span>
                    <div className="flex flex-col gap-2 font-mono text-[9px] text-[#a8b3bc]">
                      <div className="flex items-center justify-between bg-[#000a0f]/40 px-2 py-1.5 rounded border border-[#1c2d38]/40">
                        <span>NASA FIRMS</span>
                        <span className="text-[#00ed64] font-bold">CONNECTED</span>
                      </div>
                      <div className="flex items-center justify-between bg-[#000a0f]/40 px-2 py-1.5 rounded border border-[#1c2d38]/40">
                        <span>USGS SEISMIC</span>
                        <span className="text-[#00ed64] font-bold">SYNCED</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-[#a8b3bc]/70 tracking-widest font-mono block mb-2">CRITICAL ALERT</span>
                    <div className="p-3 rounded bg-red-950/35 border border-red-900/40 text-left">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] font-bold text-red-400 font-mono">CYCLONE ALERT</span>
                        <span className="text-[8px] bg-red-500/20 px-1 py-0.5 rounded text-red-300 font-mono font-bold">L4</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-normal font-sans">Severe cyclonic circulation tracked - Bay of Bengal</p>
                      <div className="text-[8px] text-[#a8b3bc]/80 mt-2 font-mono">19.821° N, 85.892° E</div>
                    </div>
                  </div>
                </div>

                {/* Map Center Area - Real MapLibre Map of India */}
                <div className="col-span-6 relative p-0 flex flex-col items-center justify-center overflow-hidden bg-[#001721] h-full w-full">
                  <div className="absolute inset-0 z-0">
                    <MapContainer 
                      activeLayers={['satellite', 'incident', 'resource']} 
                      onMapLoad={handleMapLoad} 
                      theme="dark"
                    />
                  </div>
                  
                  {/* Legend Overlay - Extremely Minimal */}
                  <div className="absolute bottom-4 left-4 bg-[#001e2b]/95 border border-[#1c2d38] px-2.5 py-1.5 rounded flex gap-3 text-[8px] font-mono text-left z-10 shadow-lg select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[#a8b3bc]">SEVERE WEATHER (INDIA)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-[#a8b3bc]">ALERT ZONES</span>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Minimal monospaced AI briefing */}
                <div className="col-span-3 border-l border-[#1c2d38] p-4 flex flex-col gap-4 bg-[#001e2b]/35 text-left select-none">
                  <div>
                    <div className="text-[9px] font-bold text-[#a8b3bc]/70 tracking-widest font-mono flex items-center gap-1.5 mb-2.5">
                      <Brain className="w-3.5 h-3.5 text-indigo-400" />
                      <span>GEMINI INTELLIGENCE</span>
                    </div>
                    <div className="font-mono text-[9px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1.5 rounded mb-3">
                      L4 STATUS ANALYSIS
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-slate-300 leading-normal flex flex-col gap-3">
                    <div className="border-b border-[#1c2d38] pb-2">
                      <span className="text-white block font-bold mb-1">[ANALYSIS]</span>
                      <p className="text-[#a8b3bc]">Heavy precipitation front advancing NE at 45 km/h. Coastal warning active.</p>
                    </div>
                    <div>
                      <span className="text-white block font-bold mb-1">[DIRECTIVES]</span>
                      <ul className="list-decimal pl-4 text-[#a8b3bc] space-y-1">
                        <li>Issue coastal alert bulletins.</li>
                        <li>Update district emergency teams.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid Section */}
          <div className="mb-32">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-mono font-semibold text-[#00ed64] uppercase tracking-widest">
                Features Overview
              </h2>
              <p className="mt-3 text-4xl sm:text-5xl md:text-[56px] font-medium tracking-[-1.5px] leading-none text-white">
                Weather intelligence powered by conversational AI
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feat, idx) => (
                /* card-feature-dark styled container */
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -12 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    y: {
                      repeat: Infinity,
                      duration: 5 + idx * 0.4,
                      ease: "easeInOut",
                    },
                    default: {
                      duration: 0.3,
                      ease: "easeOut",
                    }
                  }}
                  className="group p-8 rounded-lg border border-white/[0.04] bg-white/[0.01] backdrop-blur-md hover:border-[#00ed64]/30 hover:bg-[#00ed64]/[0.02] hover:shadow-xl hover:shadow-[#00ed64]/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Icon Container */}
                    <div className="w-12 h-12 rounded-lg bg-[#001e2b] flex items-center justify-center border border-[#1c2d38] mb-6 group-hover:scale-105 transition-transform">
                      {feat.icon}
                    </div>
                    {/* typography.heading-4 style */}
                    <h3 className="text-xl md:text-[22px] font-medium text-white leading-[1.35] mb-3 group-hover:text-[#00ed64] transition-colors duration-200">
                      {feat.title}
                    </h3>
                    {/* typography.body-sm style */}
                    <p className="text-[#a8b3bc] text-sm leading-[1.50]">
                      {feat.description}
                    </p>
                  </div>

                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Benefits Section - Dark panel in landing page style */}
          <div className="rounded-lg border border-white/[0.04] bg-white/[0.01] backdrop-blur-md p-8 md:p-16 relative overflow-hidden shadow-lg hover:border-[#00ed64]/30 hover:bg-[#00ed64]/[0.02] hover:shadow-xl hover:shadow-[#00ed64]/5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_top_right,rgba(0,237,100,0.03),transparent_50%)] pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
              {/* Header col */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <span className="text-xs font-mono font-semibold text-[#00ed64] uppercase tracking-widest">
                  Regional Impact
                </span>
                {/* typography.heading-2 style */}
                <h2 className="mt-3 text-3xl md:text-[36px] font-medium text-white tracking-[-0.5px] leading-[1.25]">
                  Why WeatherGPT?
                </h2>
                <p className="mt-4 text-[#a8b3bc] leading-relaxed text-sm md:text-base">
                  WeatherGPT bridges complex meteorological data and everyday decision-making. We ingest fragmented weather feeds, Doppler radar, and satellite imagery across India, turning them into natural conversations and timely alerts.
                </p>
                <div className="mt-8 flex">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#00ed64] hover:text-white transition-colors"
                  >
                    Open WeatherGPT <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Benefits list col */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {benefits.map((benefit, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle className="w-5 h-5 text-[#00ed64]" />
                    </div>
                    <div>
                      {/* typography.heading-5 style */}
                      <h4 className="font-semibold text-white text-[18px] leading-[1.40]">
                        {benefit.title}
                      </h4>
                      {/* typography.body-sm style */}
                      <p className="mt-1.5 text-sm text-[#a8b3bc] leading-[1.50]">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
