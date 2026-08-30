import { Globe } from './Globe'

export default function GlobeDemo() {
  return (
    <div className="relative flex h-full w-full max-w-[500px] aspect-square items-center justify-center overflow-hidden rounded-full border border-white/[0.06] bg-canvas-dark/20 backdrop-blur-sm shadow-[0_0_50px_rgba(0,237,100,0.03)]">
      {/* Background ambient radial gradient */}
      <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_120%,rgba(0,237,100,0.12),rgba(0,0,0,0))]" />
      
      {/* Centered label matching MagicUI demo but styled for RescueLens */}
      <span className="pointer-events-none bg-gradient-to-b from-white to-white/10 bg-clip-text text-center text-6xl md:text-7xl font-bold font-mono tracking-tighter leading-none text-transparent select-none z-0">
        RESCUE
      </span>
      
      {/* The Interactive Cobe Globe */}
      <Globe className="top-8 z-10" />
    </div>
  )
}
