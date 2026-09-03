import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Database, Cpu, Map, Send, Radio, Brain, TrendingUp, LayoutDashboard, Bell, ChevronRight } from 'lucide-react'
import SEO from '../components/SEO'

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      title: "Ingest",
      desc: "Gather real-time weather observations from IMD surface stations, Doppler radars, INSAT satellites, and global numerical models (GFS & ECMWF).",
      icon: <Database className="w-6 h-6 text-[#00ed64]" />,
      bg: "bg-[#00ed64]/10",
      accent: "text-[#00ed64]"
    },
    {
      step: "02",
      title: "Understand",
      desc: "Natural-language processing engine classifies user intent, extracts temporal/spatial entities, and contextualizes regional weather queries.",
      icon: <Cpu className="w-6 h-6 text-indigo-400" />,
      bg: "bg-indigo-500/10",
      accent: "text-indigo-400"
    },
    {
      step: "03",
      title: "Forecast & Alert",
      desc: "Ensemble AI algorithms produce hyper-local forecasts and evaluate severity against IMD alert thresholds for early warning generation.",
      icon: <Map className="w-6 h-6 text-sky-400" />,
      bg: "bg-sky-500/10",
      accent: "text-sky-400"
    },
    {
      step: "04",
      title: "Deliver",
      desc: "Assemble conversational explanations, interactive map visualizer layers, agro-climate bulletins, and multi-channel push alerts.",
      icon: <Send className="w-6 h-6 text-emerald-400" />,
      bg: "bg-emerald-500/10",
      accent: "text-emerald-400"
    }
  ]

  const workflowNodes = [
    { label: "Data Ingestion", desc: "IMD, INSAT, GFS & ECMWF", icon: <Radio className="w-5 h-5 text-[#00ed64]" /> },
    { label: "NLP Understanding", desc: "Intent & Location Parsing", icon: <Brain className="w-5 h-5 text-[#00ed64]" /> },
    { label: "Forecast Ensemble", desc: "AI Weather Predictions", icon: <TrendingUp className="w-5 h-5 text-[#00ed64]" /> },
    { label: "Interactive GIS", desc: "Live Weather & Radar Map", icon: <LayoutDashboard className="w-5 h-5 text-[#00ed64]" /> },
    { label: "Alert Dispatch", desc: "Multi-Channel Bulletins", icon: <Bell className="w-5 h-5 text-[#00ed64]" /> }
  ]

  return (
    <>
      <SEO 
        title="WeatherGPT | How It Works" 
        description="Discover how WeatherGPT ingests multi-source meteorological data, parses queries with conversational AI, and generates hyper-local forecasts and early warnings." 
      />

      <div className="w-full bg-[#001e2b] text-white selection:bg-[#00ed64]/35 selection:text-[#001e2b] pb-24">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c2d38_1px,transparent_1px),linear-gradient(to_bottom,#1c2d38_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 pt-16 md:pt-24">
          
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-24">
            {/* typography.hero-display style */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-7xl font-medium tracking-tight md:tracking-[-1.5px] leading-tight md:leading-[1.10] text-white max-w-4xl mx-auto"
            >
              How WeatherGPT Works
            </motion.h1>

            {/* typography.subtitle style */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg font-normal text-[#a8b3bc] leading-[1.50] max-w-3xl mx-auto"
            >
              From meteorological data ingestion to conversational forecast delivery in seconds.
            </motion.p>
          </div>

          {/* 4-Step Process Section */}
          <div className="mb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((st, idx) => (
                /* card-feature-dark styled container with landing page colors */
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    y: {
                      repeat: Infinity,
                      duration: 5.5 + idx * 0.5,
                      ease: "easeInOut",
                    },
                    default: {
                      duration: 0.3,
                      ease: "easeOut",
                    }
                  }}
                  className="relative group p-8 rounded-lg border border-white/[0.04] bg-white/[0.01] backdrop-blur-md hover:border-[#00ed64]/30 hover:bg-[#00ed64]/[0.02] hover:shadow-xl hover:shadow-[#00ed64]/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Step label badge */}
                    <div className="flex items-center justify-between mb-8">
                      <span className={`text-[18px] font-mono font-bold uppercase tracking-wider ${st.accent}`}>
                        {st.step}
                      </span>
                      <div className={`w-10 h-10 rounded-lg ${st.bg} flex items-center justify-center`}>
                        {st.icon}
                      </div>
                    </div>
                    
                    {/* typography.heading-4 style */}
                    <h3 className="text-xl md:text-[22px] font-medium text-white leading-[1.35] mb-4 group-hover:text-[#00ed64] transition-colors">
                      {st.title}
                    </h3>
                    {/* typography.body-sm style */}
                    <p className="text-[#a8b3bc] text-sm leading-[1.50]">
                      {st.desc}
                    </p>
                  </div>
                  
                  {/* Visual Connection Arrow - Glowing Chevrons */}
                  {idx < 3 && (
                    <div className="hidden lg:flex items-center absolute -right-6 top-1/2 -translate-y-1/2 z-20 text-[#00ed64] opacity-40 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                      <ChevronRight className="w-4 h-4 -ml-4 stroke-[2.5] animate-pulse" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Workflow Diagram Section */}
          <div className="mb-32">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-mono font-semibold text-[#00ed64] uppercase tracking-widest">
                Data Pipeline
              </h2>
              {/* typography.heading-2 style */}
              <p className="mt-3 text-3xl md:text-[36px] font-medium text-white tracking-[-0.5px] leading-[1.25]">
                End-to-End Operational Pipeline
              </p>
              <p className="mt-2 text-sm text-[#a8b3bc]">
                Visualizing how information travels from meteorological sensors to conversational AI responses.
              </p>
            </div>

            {/* Redesigned Workflow Diagram Container */}
            <div className="w-full max-w-5xl mx-auto bg-[#0a202c]/40 backdrop-blur-md border border-[#1c2d38] rounded-xl p-8 md:p-16 relative overflow-hidden shadow-2xl">
              {/* Atmospheric Background Glows */}
              <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(0,237,100,0.03),transparent_60%)] pointer-events-none" />
              <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(0,237,100,0.03),transparent_60%)] pointer-events-none" />
              
              {/* DESKTOP VIEW (Horizontal Pipeline) */}
              <div className="hidden lg:block relative w-full py-8">
                {/* Inner Relative Container for perfect vertical alignment */}
                <div className="relative w-full">
                  {/* Horizontal Connecting Line Track (at center of 64px icon = 32px) */}
                  <div className="absolute top-[32px] left-[88px] right-[88px] h-[3px] bg-[#1c2d38] pointer-events-none" />
                  
                  {/* Glowing Scanner Line Effect */}
                  <div className="absolute top-[32px] left-[88px] right-[88px] h-[3px] overflow-hidden pointer-events-none z-0">
                    <motion.div
                      animate={{ left: ["-30%", "130%"] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-0 h-full w-[30%] bg-gradient-to-r from-transparent via-[#00ed64] to-transparent"
                    />
                  </div>

                  {/* Pulsing Light Ball traveling in sync with the nodes */}
                  <div className="absolute top-[32px] left-[88px] right-[88px] h-[3px] pointer-events-none z-0">
                    <motion.div
                      animate={{ left: ["0%", "25%", "50%", "75%", "100%"] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-1/2 w-4 h-4 rounded-full bg-[#00ed64] shadow-[0_0_15px_#00ed64,0_0_30px_#00ed64] -translate-y-1/2 -translate-x-1/2"
                    />
                  </div>

                  {/* Nodes Layout */}
                  <div className="flex justify-between items-start w-full relative z-10">
                    {workflowNodes.map((node, idx) => (
                      <motion.div 
                        key={idx}
                        whileHover={{ y: -6 }}
                        className="w-44 flex flex-col items-center cursor-pointer group"
                      >
                        {/* Icon container aligned with the line */}
                        <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-[#001e2b] border border-white/[0.06] group-hover:border-[#00ed64]/50 group-hover:shadow-[0_0_20px_rgba(0,237,100,0.15)] transition-all duration-300">
                          {/* Glowing wave ripple halo */}
                          <motion.div
                            animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: idx * 0.6 }}
                            className="absolute inset-0 rounded-full border border-[#00ed64]/40 pointer-events-none"
                          />
                          
                          <div className="w-12 h-12 rounded-full bg-[#0a202c] border border-[#1c2d38] flex items-center justify-center text-[#00ed64] group-hover:bg-[#00ed64]/10 group-hover:scale-105 transition-all duration-300">
                            {node.icon}
                          </div>
                        </div>
                        
                        {/* Labels underneath */}
                        <div className="mt-5 text-center px-1">
                          <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-[#00ed64] transition-colors">
                            {node.label}
                          </h4>
                          <p className="text-[11px] text-[#a8b3bc] mt-2 leading-relaxed max-w-[150px] mx-auto">
                            {node.desc}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MOBILE VIEW (Vertical Pipeline) */}
              <div className="lg:hidden relative w-full py-4">
                <div className="relative w-full min-h-[500px]">
                  {/* Vertical Connecting Line Track (at center of 48px icon = 24px) */}
                  <div className="absolute left-[24px] top-[24px] h-[400px] w-[3px] bg-[#1c2d38] pointer-events-none" />
                  
                  {/* Glowing Scanner Line Effect */}
                  <div className="absolute left-[24px] top-[24px] h-[400px] w-[3px] overflow-hidden pointer-events-none z-0">
                    <motion.div
                      animate={{ top: ["-30%", "130%"] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-0 w-full h-[30%] bg-gradient-to-b from-transparent via-[#00ed64] to-transparent"
                    />
                  </div>

                  {/* Pulsing Light Ball traveling in sync with the nodes */}
                  <motion.div
                    animate={{ top: ["24px", "124px", "224px", "324px", "424px"] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[24px] w-4 h-4 rounded-full bg-[#00ed64] shadow-[0_0_15px_#00ed64,0_0_30px_#00ed64] -translate-y-1/2 -translate-x-1/2 pointer-events-none z-10"
                  />

                  {/* Nodes Layout */}
                  <div className="flex flex-col w-full relative z-10">
                    {workflowNodes.map((node, idx) => (
                      <div 
                        key={idx} 
                        className="h-[100px] flex gap-6 items-start relative group cursor-pointer"
                      >
                        {/* Left Side: Icon container */}
                        <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-[#001e2b] border border-white/[0.06] flex-shrink-0 group-hover:border-[#00ed64]/50 transition-all duration-300">
                          {/* Glowing wave ripple halo */}
                          <motion.div
                            animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: idx * 0.6 }}
                            className="absolute inset-0 rounded-full border border-[#00ed64]/40 pointer-events-none"
                          />
                          
                          <div className="w-9 h-9 rounded-full bg-[#0a202c] border border-[#1c2d38] flex items-center justify-center text-[#00ed64] group-hover:bg-[#00ed64]/10 transition-colors">
                            {node.icon}
                          </div>
                        </div>
                        
                        {/* Right Side: Text content */}
                        <div className="text-left pt-1.5">
                          <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-[#00ed64] transition-colors">
                            {node.label}
                          </h4>
                          <p className="text-[11px] text-[#a8b3bc] mt-1 leading-snug">
                            {node.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Closing CTA - cta-banner-dark STYLE */}
          <section className="pb-24">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-5xl mx-auto rounded-lg bg-[#001e2b] border border-[#1c2d38] text-white p-12 md:p-16 text-center relative overflow-hidden shadow-xl"
              >
                <div className="absolute -top-12 -right-12 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(0,237,100,0.08),transparent_60%)] pointer-events-none" />
                <div className="absolute -bottom-12 -left-12 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(0,104,74,0.12),transparent_60%)] pointer-events-none" />

                <div className="relative z-10 max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-[36px] font-medium tracking-[-0.5px] leading-[1.25] mb-4">
                    Ready to explore conversational weather intelligence?
                  </h2>
                  <p className="text-[#a8b3bc] text-sm md:text-base mb-10 leading-relaxed">
                    Access real-time forecasts, severity alerts, agro-climate advisories, and interactive weather maps in one unified AI-driven platform.
                  </p>
                  <div className="flex justify-center">
                    <Link
                      to="/dashboard"
                      className="px-[22px] py-[10px] rounded-full text-sm font-bold bg-[#00ed64] hover:bg-[#00b545] text-[#001e2b] transition-colors shadow-md shadow-[#00ed64]/20 cursor-pointer"
                    >
                      Open WeatherGPT
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
