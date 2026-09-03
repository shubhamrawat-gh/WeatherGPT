import { useRef } from 'react'
import { motion, useScroll, useInView } from 'framer-motion'
import GradientText from './GradientText'
import Threads from './Threads'

const STEPS = [
  {
    num: '01',
    title: 'Data Ingestion',
    description:
      'Real-time weather observations from IMD surface stations, INSAT satellite imagery, GFS and ECMWF numerical models, and WIS 2.0 global exchange feeds are continuously ingested into the forecast pipeline.',
    accent: 'Multi-Source Feeds',
  },
  {
    num: '02',
    title: 'Query Understanding',
    description:
      'Natural-language processing parses user queries — classifying intent (forecast, alert, climate trend, FAQ), extracting location and time parameters, and detecting regional language context.',
    accent: 'NLP Engine',
  },
  {
    num: '03',
    title: 'Forecast & Alert Generation',
    description:
      'Model ensembles generate hyper-local forecasts while severity classification algorithms evaluate active weather events against IMD warning thresholds for automated alert escalation.',
    accent: 'AI Modeling',
  },
  {
    num: '04',
    title: 'Contextual Response Assembly',
    description:
      'Plain-language responses are assembled with inline charts, map snippets, and agro-climate advisories tailored to the user\'s profile — whether a farmer, disaster authority, or general citizen.',
    accent: 'Smart Synthesis',
  },
  {
    num: '05',
    title: 'Multi-Channel Delivery',
    description:
      'Actionable weather intelligence is delivered through the conversational chat interface, push alert notifications, and structured advisory bulletins for disaster management authorities.',
    accent: 'Response Ready',
  },
]

function TimelineStep({
  step,
  index,
}: {
  step: (typeof STEPS)[number]
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-12% 0px -12% 0px' })
  const isLeft = index % 2 === 0

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-1 md:grid-cols-[1fr_56px_1fr] items-center"
    >
      {/* LEFT COLUMN */}
      <div
        className={`flex ${isLeft ? 'md:justify-end md:order-1' : 'md:justify-end md:order-3'}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          whileHover={{
            y: -5,
            borderColor: 'rgba(0, 237, 100, 0.35)',
            transition: { duration: 0.25, ease: 'easeOut' },
          }}
          className={`relative w-full max-w-[480px] p-9 md:p-10 rounded-2xl border cursor-default group
            bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]
            transition-colors duration-300
            ${isLeft ? '' : 'md:order-3'}`}
        >
          {/* Accent label */}
          <div className="flex items-center gap-2.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green/70" />
            <span className="text-[11px] font-mono tracking-[0.2em] text-brand-green/60 uppercase">
              {step.accent}
            </span>
          </div>

          {/* Title Row */}
          <div className="flex items-baseline mb-4">
            <h3 className="text-2xl font-semibold text-white leading-snug tracking-tight">
              {step.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-base text-white/60 leading-relaxed tracking-wide">
            {step.description}
          </p>
        </motion.div>
      </div>

      {/* CENTER NODE (md+ only) */}
      <div className="hidden md:flex flex-col items-center justify-center relative md:order-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={
            isInView
              ? { scale: 1, opacity: 1 }
              : { scale: 0.8, opacity: 0 }
          }
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 16px rgba(0, 237, 100, 0.2)',
            transition: { duration: 0.2 },
          }}
          className={`w-10 h-10 rounded-full border-[1.5px] flex items-center justify-center font-mono text-xs font-semibold z-10 select-none transition-colors duration-500 ${
            isInView
              ? 'border-brand-green/60 text-brand-green/90 bg-brand-green/[0.08]'
              : 'border-white/[0.08] text-white/20 bg-canvas-dark'
          }`}
        >
          {step.num}
        </motion.div>
      </div>

      {/* RIGHT COLUMN (empty for layout balance) */}
      <div className={`hidden md:block ${isLeft ? 'md:order-3' : 'md:order-1'}`} />
    </div>
  )
}

export default function WorkflowTimeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 75%', 'end 35%'],
  })

  return (
    <section
      id="how-it-works"
      className="relative py-32 md:py-40 px-6 border-t border-white/[0.04]"
    >
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section header container containing Threads background for text only */}
        <div className="relative mb-20 md:mb-28 w-full py-16 px-4 md:py-24 overflow-hidden">
          {/* Threads background animation restricted to this text block with seamless radial fade */}
          <div 
            className="absolute inset-0 pointer-events-none z-0 opacity-85"
            style={{
              maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
              WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)',
            }}
          >
            <Threads
              amplitude={1.3}
              distance={0.6}
              enableMouseInteraction={true}
              color={[0, 0.93, 0.39]}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center relative z-10"
          >
            <h2 className="text-xs font-mono tracking-[0.25em] text-brand-green/70 uppercase mb-5">
              Intelligence Pipeline
            </h2>
            <p className="text-5xl md:text-6xl lg:text-[4.2rem] xl:text-[4.8rem] font-bold tracking-[-0.025em] text-white leading-[1.15]">
              How{' '}
              <GradientText
                colors={["#3300ff","#3cb92f","#f26ac5"]}
                animationSpeed={2.5}
                showBorder={false}
                className="inline-block"
              >
                WeatherGPT
              </GradientText>{' '}
              <br className="hidden sm:block" />
              Delivers Intelligence
            </p>
            <p className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed font-normal">
              From multi-source weather data ingest to conversational response — an AI-powered pipeline delivering actionable climate intelligence across India.
            </p>
          </motion.div>
        </div>
 
        {/* Timeline container */}
        <div ref={containerRef} className="relative">
          {/* CENTER VERTICAL LINE (md+ only) */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px">
            {/* Track */}
            <div className="absolute inset-0 bg-white/[0.04]" />
 
            {/* Scroll-driven fill */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-brand-green/40"
              style={{ scaleY: scrollYProgress, originY: 0 }}
            />
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-12 md:gap-4">
            {STEPS.map((step, index) => (
              <TimelineStep key={index} step={step} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
