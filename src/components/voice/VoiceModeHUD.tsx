import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  AlertCircle,
  RefreshCw,
  Hand
} from 'lucide-react'
import type {
  VoiceConnectionState,
  VoiceAgentState,
  ToolCallEvent
} from '../../services/voiceRelayClient'

interface VoiceModeHUDProps {
  connectionState: VoiceConnectionState
  agentState: VoiceAgentState
  isMuted: boolean
  audioLevel: number
  liveUserTranscript: string
  liveAssistantTranscript: string
  recentTools: ToolCallEvent[]
  errorMessage: string | null
  isExpanded: boolean
  voiceMode?: 'relay' | 'browser'
  onToggleExpand: () => void
  onInterrupt: () => void
  onToggleMute: () => void
  onEndCall: () => void
  onRetry: () => void
  onSwitchToBrowserMode?: () => void
}

// User-friendly tool labels replacing raw function identifiers
const TOOL_LABELS: Record<string, string> = {
  get_live_weather: 'Checking Live Weather',
  get_weather_alerts: 'Scanning Hazard Bulletins',
  get_regional_climate_stats: 'Analyzing Climate Trends',
  get_agro_climate_advisory: 'Synthesizing Agro Advisory'
}

// Waveform bar component for dynamic audio reactive equalizer
const WaveformBar = memo(function WaveformBar({
  delay,
  active,
  level,
  colorClass
}: {
  delay: number
  active: boolean
  level: number
  colorClass: string
}) {
  const minHeight = 6
  const maxHeight = 34
  const dynamicHeight = Math.min(maxHeight, minHeight + Math.round(level * 45) + (active ? 6 : 0))

  return (
    <motion.div
      className={`w-1 rounded-full ${colorClass}`}
      animate={{
        height: active ? [minHeight, dynamicHeight, minHeight] : minHeight,
        opacity: active ? [0.6, 1, 0.6] : 0.35
      }}
      transition={{
        repeat: Infinity,
        duration: 0.5 + delay * 0.12,
        ease: 'easeInOut',
        delay
      }}
    />
  )
})

export const VoiceModeHUD = memo(function VoiceModeHUD({
  connectionState,
  agentState,
  isMuted,
  audioLevel,
  liveUserTranscript,
  liveAssistantTranscript,
  recentTools,
  errorMessage,
  isExpanded,
  voiceMode = 'relay',
  onToggleExpand,
  onInterrupt,
  onToggleMute,
  onEndCall,
  onRetry,
  onSwitchToBrowserMode,
}: VoiceModeHUDProps) {
  if (connectionState === 'disconnected') return null

  // Dynamic scale for the orb based on mic audio level
  const audioMultiplier = Math.min(audioLevel * 0.5, 0.55)
  const orbScale = 1 + audioMultiplier

  const latestTool = recentTools.length > 0 ? recentTools[recentTools.length - 1] : null
  const toolName = latestTool ? TOOL_LABELS[latestTool.name] || 'Processing Data' : null

  // Has any speech transcript arrived yet
  const hasTranscript = Boolean(liveUserTranscript || liveAssistantTranscript)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className={`z-40 transition-all duration-300 ease-out ${
          isExpanded
            ? 'fixed inset-0 bg-[#001019]/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-12'
            : 'fixed bottom-24 right-4 sm:right-8 w-[92vw] max-w-sm sm:max-w-md bg-[#001724]/90 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] p-5 flex flex-col gap-4'
        }`}
      >
        {/* Ambient background aura glow */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none -z-10">
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30"
            animate={{
              scale: [1, 1.25, 1],
              opacity: agentState === 'speaking' ? [0.35, 0.6, 0.35] : [0.2, 0.35, 0.2]
            }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            style={{
              background:
                agentState === 'speaking'
                  ? 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(0,229,153,0.4) 60%, transparent 80%)'
                  : agentState === 'thinking'
                  ? 'radial-gradient(circle, rgba(99,102,241,0.8) 0%, rgba(56,189,248,0.4) 60%, transparent 80%)'
                  : 'radial-gradient(circle, rgba(0,229,153,0.7) 0%, rgba(20,184,166,0.3) 60%, transparent 80%)'
            }}
          />
        </div>

        {/* Sleek Minimal Header */}
        <div className="flex items-center justify-between pb-1 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              {connectionState === 'connected' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </>
              ) : connectionState === 'connecting' || connectionState === 'reconnecting' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-400" />
              )}
            </span>

            <span className="text-sm font-semibold tracking-tight text-white font-sans">
              Voice Mode
            </span>

            {/* Voice Mode Tag */}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono tracking-tight font-medium ${
                voiceMode === 'browser'
                  ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300'
                  : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              }`}
              title={voiceMode === 'browser' ? 'Browser Web Voice AI (Client-side)' : 'Gemini Live WebSocket Relay'}
            >
              {voiceMode === 'browser' ? 'Browser AI' : 'Gemini Live'}
            </span>

            {/* Active tool badge */}
            {latestTool && latestTool.status === 'executing' && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-400 font-sans"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{toolName}</span>
              </motion.span>
            )}
          </div>

          {/* Window action controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleExpand}
              className="p-1.5 rounded-xl text-[#7c8c9a] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title={isExpanded ? 'Minimize HUD' : 'Expand full screen'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onEndCall}
              className="p-1.5 rounded-xl text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="End session"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-2.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-[11px] leading-tight">{errorMessage}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {onSwitchToBrowserMode && voiceMode !== 'browser' && (
                <button
                  type="button"
                  onClick={onSwitchToBrowserMode}
                  className="px-2.5 py-1 rounded-xl bg-brand-green/20 hover:bg-brand-green/30 text-brand-green border border-brand-green/40 text-[10px] font-semibold cursor-pointer whitespace-nowrap transition-all shadow-xs"
                  title="Switch to built-in Browser Web Voice (zero server needed)"
                >
                  Use Browser Voice
                </button>
              )}
              <button
                type="button"
                onClick={onRetry}
                className="p-1 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer text-slate-300"
                title="Retry connection"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Center Visualizer & Animated Organic Liquid Orb */}
        <div className={`flex flex-col items-center justify-center my-auto relative ${isExpanded ? 'py-16' : 'py-5'}`}>
          <div className="relative flex items-center justify-center">
            {/* Layer 1: Expanding Sonar Ripple Ring */}
            {agentState === 'speaking' && (
              <>
                <motion.div
                  className="absolute rounded-full border border-cyan-400/40 pointer-events-none"
                  animate={{
                    scale: [1, 2.2],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeOut'
                  }}
                  style={{
                    width: isExpanded ? '160px' : '90px',
                    height: isExpanded ? '160px' : '90px'
                  }}
                />
                <motion.div
                  className="absolute rounded-full border border-emerald-400/30 pointer-events-none"
                  animate={{
                    scale: [1, 2.7],
                    opacity: [0.5, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    delay: 0.7,
                    ease: 'easeOut'
                  }}
                  style={{
                    width: isExpanded ? '160px' : '90px',
                    height: isExpanded ? '160px' : '90px'
                  }}
                />
              </>
            )}

            {/* Layer 2: Listening audio-reactive pulse ring */}
            {agentState === 'listening' && !isMuted && (
              <motion.div
                className="absolute rounded-full border border-emerald-400/25 pointer-events-none"
                animate={{
                  scale: [1, 1.4 + audioMultiplier * 1.5, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: 'easeInOut'
                }}
                style={{
                  width: isExpanded ? '170px' : '95px',
                  height: isExpanded ? '170px' : '95px'
                }}
              />
            )}

            {/* Layer 3: Main Liquid Morphing Orb */}
            <motion.div
              onClick={agentState === 'speaking' ? onInterrupt : undefined}
              animate={{
                scale: agentState === 'listening' && !isMuted ? orbScale : 1,
                rotate: agentState === 'thinking' ? 360 : [0, 5, -5, 0],
                borderRadius: [
                  '50% 50% 50% 50%',
                  '45% 55% 52% 48% / 48% 50% 50% 52%',
                  '52% 48% 46% 54% / 54% 46% 54% 46%',
                  '50% 50% 50% 50%'
                ]
              }}
              transition={{
                rotate:
                  agentState === 'thinking'
                    ? { repeat: Infinity, duration: 3, ease: 'linear' }
                    : { repeat: Infinity, duration: 6, ease: 'easeInOut' },
                borderRadius: { repeat: Infinity, duration: 4, ease: 'easeInOut' },
                scale: { type: 'spring', damping: 15, stiffness: 260 }
              }}
              className={`rounded-full flex items-center justify-center cursor-pointer relative select-none shadow-2xl overflow-hidden ${
                isExpanded ? 'w-36 h-36' : 'w-22 h-22'
              } ${
                agentState === 'speaking'
                  ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-300 shadow-[0_0_50px_rgba(0,229,153,0.55)]'
                  : agentState === 'thinking'
                  ? 'bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 shadow-[0_0_45px_rgba(56,189,248,0.5)]'
                  : agentState === 'listening'
                  ? isMuted
                    ? 'bg-neutral-800 border border-neutral-700 opacity-60'
                    : 'bg-gradient-to-tr from-emerald-600 via-emerald-400 to-teal-300 shadow-[0_0_40px_rgba(0,229,153,0.4)]'
                  : 'bg-[#002d3f] border border-white/10'
              }`}
              title={agentState === 'speaking' ? 'Click to interrupt' : undefined}
            >
              {/* Glass specular highlight overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-black/20 pointer-events-none rounded-full" />

              {/* Central state icon or equalizer */}
              <div className="relative z-10 flex items-center justify-center">
                {agentState === 'speaking' ? (
                  <div className="flex items-center gap-1 py-1">
                    <WaveformBar delay={0.0} active={true} level={audioLevel} colorClass="bg-slate-950" />
                    <WaveformBar delay={0.15} active={true} level={audioLevel} colorClass="bg-slate-950" />
                    <WaveformBar delay={0.3} active={true} level={audioLevel} colorClass="bg-slate-950" />
                    <WaveformBar delay={0.45} active={true} level={audioLevel} colorClass="bg-slate-950" />
                    <WaveformBar delay={0.6} active={true} level={audioLevel} colorClass="bg-slate-950" />
                  </div>
                ) : agentState === 'thinking' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="w-7 h-7 rounded-full border-2 border-white/40 border-t-white"
                  />
                ) : isMuted ? (
                  <MicOff className={`text-neutral-300 ${isExpanded ? 'w-10 h-10' : 'w-6 h-6'}`} />
                ) : (
                  <div className="flex items-center gap-1 py-1">
                    <WaveformBar delay={0.0} active={!isMuted} level={audioLevel} colorClass="bg-slate-950" />
                    <WaveformBar delay={0.15} active={!isMuted} level={audioLevel} colorClass="bg-slate-950" />
                    <WaveformBar delay={0.3} active={!isMuted} level={audioLevel} colorClass="bg-slate-950" />
                    <WaveformBar delay={0.45} active={!isMuted} level={audioLevel} colorClass="bg-slate-950" />
                    <WaveformBar delay={0.6} active={!isMuted} level={audioLevel} colorClass="bg-slate-950" />
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Clean minimal status badge */}
          <div className="mt-4 flex items-center justify-center">
            <span className="text-xs font-medium tracking-wide text-white/90 font-sans flex items-center gap-2">
              {agentState === 'speaking' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>Speaking</span>
                </>
              )}
              {agentState === 'thinking' && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                  <span>Thinking</span>
                </>
              )}
              {agentState === 'listening' && (
                <>
                  <span className={`w-1.5 h-1.5 rounded-full ${isMuted ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
                  <span>{isMuted ? 'Muted' : 'Listening'}</span>
                </>
              )}
              {agentState === 'idle' && <span>Ready</span>}
            </span>
          </div>
        </div>

        {/* Live Transcript / Dynamic Waveform Surface */}
        <div className={`rounded-2xl bg-black/25 border border-white/5 p-3 flex flex-col justify-center overflow-hidden ${isExpanded ? 'min-h-32 max-h-56' : 'min-h-[64px] max-h-28'}`}>
          <AnimatePresence mode="wait">
            {hasTranscript ? (
              <motion.div
                key="transcript-content"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2 overflow-y-auto pr-1"
              >
                {liveUserTranscript && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-mono text-[9px] text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 shrink-0 mt-0.5 font-bold uppercase">
                      You
                    </span>
                    <p className="text-slate-300 font-sans leading-relaxed text-xs">
                      {liveUserTranscript}
                    </p>
                  </div>
                )}

                {liveAssistantTranscript && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="font-mono text-[9px] text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-500/10 shrink-0 mt-0.5 font-bold uppercase">
                      AI
                    </span>
                    <p className="text-white font-sans leading-relaxed text-xs">
                      {liveAssistantTranscript}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              /* If no spoken words yet, show an elegant animated audio equalizer wave */
              <motion.div
                key="ambient-wave"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-1.5 py-2 select-none"
              >
                <WaveformBar delay={0.0} active={!isMuted} level={audioLevel} colorClass="bg-emerald-400/80" />
                <WaveformBar delay={0.1} active={!isMuted} level={audioLevel} colorClass="bg-teal-300/80" />
                <WaveformBar delay={0.2} active={!isMuted} level={audioLevel} colorClass="bg-cyan-300/80" />
                <WaveformBar delay={0.3} active={!isMuted} level={audioLevel} colorClass="bg-emerald-300/80" />
                <WaveformBar delay={0.4} active={!isMuted} level={audioLevel} colorClass="bg-teal-400/80" />
                <WaveformBar delay={0.5} active={!isMuted} level={audioLevel} colorClass="bg-cyan-400/80" />
                <WaveformBar delay={0.6} active={!isMuted} level={audioLevel} colorClass="bg-emerald-400/80" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Minimal Bottom Action Controls */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {/* Interrupt pill when AI is speaking */}
          {agentState === 'speaking' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onInterrupt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium cursor-pointer transition-all"
            >
              <Hand className="w-3.5 h-3.5" />
              <span>Interrupt</span>
            </motion.button>
          )}

          {/* Mute / Unmute Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onToggleMute}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
              isMuted
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-amber-300" />
                <span>Unmute</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mute</span>
              </>
            )}
          </motion.button>

          {/* End Session Button */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onEndCall}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-950/50 transition-all cursor-pointer border border-red-500/30"
            title="End session"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>End</span>
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
})
