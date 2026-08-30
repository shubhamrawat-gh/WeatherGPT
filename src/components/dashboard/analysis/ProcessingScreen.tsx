import { useEffect, useState, useRef } from 'react'
import { Terminal, Cpu, Loader2 } from 'lucide-react'

interface ProcessingScreenProps {
  providerName: string
  selectedModules: string[]
  filesCount: number
  onComplete: () => void
}

export default function ProcessingScreen({
  providerName,
  selectedModules,
  filesCount,
  onComplete,
}: ProcessingScreenProps) {
  const [currentStage, setCurrentStage] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  const stages = [
    { label: 'Preparing Analysis Pipeline', desc: 'Validating ingestion files and security credentials...' },
    { label: 'Running Neural Vision Model', desc: 'Evaluating structural damage and asset borders...' },
    { label: 'Generating Situational Intelligence', desc: 'Running geocoding mapping algorithms...' },
    { label: 'Building Summary Insights', desc: 'Synthesizing final operational insights...' }
  ]

  // Scroll to bottom of terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  useEffect(() => {
    // Generate terminal logs incrementally
    const logPool = [
      `[info] Initializing diagnostic pipeline with provider: ${providerName}`,
      `[info] Staging ${filesCount} file(s) for visual inference ingestion...`,
      '[info] Validation successful. Ingestion coordinates synced with GIS bounds.',
      '[system] Launching GPU partition allocation...',
      '[system] Memory staging allocated: 8.4GB VRAM active.',
      ...selectedModules.includes('damage_assessment') ? [
        '[model] Ingesting damage assessment weights...',
        '[model] Running structural polygon scans on file indices...',
        '[model] Building polygon bounding grids computed.'
      ] : [],
      ...selectedModules.includes('infrastructure_analysis') ? [
        '[model] Activating road network occlusion scan...',
        '[model] Evaluating corridor blockage probability vector...',
        '[model] Landslide runout boundary margins geocoded.'
      ] : [],
      ...selectedModules.includes('resource_detection') ? [
        '[model] Scanning object classifier weights...',
        '[model] Staged resource assets (shelters/vehicles) geocoded.'
      ] : [],
      ...selectedModules.includes('situational_intelligence') ? [
        '[llm] Loading contextual prompt tokens...',
        '[llm] Processing damage matrix metadata and incident feeds...',
        '[llm] Generating text summary parameters...'
      ] : [],
      ...selectedModules.includes('risk_assessment') ? [
        '[model] Evaluating soil parameters & moisture indicators...',
        '[model] Predictive hazard margins calculations...'
      ] : [],
      '[system] Ingesting telemetry metrics into data cache...',
      '[info] Compilation validation complete. Formatting output schema...'
    ]

    let logIndex = 0
    const logInterval = setInterval(() => {
      if (logIndex < logPool.length) {
        setLogs(prev => [...prev, logPool[logIndex]])
        logIndex++
        setProgress(Math.floor((logIndex / logPool.length) * 100))
      } else {
        clearInterval(logInterval)
      }
    }, 450)

    // Stage progression
    const stageInterval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < stages.length - 1) {
          return prev + 1
        } else {
          clearInterval(stageInterval)
          // Hold completed state brief moment before callback
          setTimeout(onComplete, 1200)
          return prev
        }
      })
    }, 2000)

    return () => {
      clearInterval(logInterval)
      clearInterval(stageInterval)
    }
  }, [providerName, selectedModules, filesCount, onComplete])

  return (
    <div className="flex flex-col gap-6 select-none w-full text-left max-w-2xl mx-auto py-8">
      {/* Status Header */}
      <div className="flex flex-col gap-2.5 items-center text-center">
        <div className="w-12 h-12 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green animate-spin">
          <Loader2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Operational Intelligence Analysis Active
          </h3>
          <p className="text-xs text-muted-dark/80 max-w-md m-0">
            System running diagnostics using <span className="text-brand-green font-mono">{providerName}</span>. Pipeline processing staged datasets...
          </p>
        </div>
      </div>

      {/* Progress & Stages Grid */}
      <div className="flex flex-col gap-4 bg-surface-dark/20 border border-hairline-dark/50 rounded-xl p-5">
        {/* Loading Bar */}
        <div className="flex flex-col gap-1.5 w-full">
          <div className="flex justify-between text-[10px] font-mono font-bold text-muted-dark">
            <span>PIPELINE TELEMETRY COMPILATION</span>
            <span className="text-brand-green">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-canvas-dark border border-hairline-dark/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Diagnostic Stages List */}
        <div className="flex flex-col gap-3.5 mt-2">
          {stages.map((stage, idx) => {
            const isActive = idx === currentStage
            const isCompleted = idx < currentStage
            return (
              <div
                key={stage.label}
                className={`flex gap-3 items-start transition-all duration-200 ${
                  isActive 
                    ? 'opacity-100' 
                    : isCompleted 
                      ? 'opacity-60' 
                      : 'opacity-30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${
                  isActive 
                    ? 'border-brand-green bg-brand-green/10 text-brand-green' 
                    : isCompleted 
                      ? 'border-brand-teal-mid bg-brand-teal-deep text-brand-green/80' 
                      : 'border-hairline-dark/50 text-muted-dark/60'
                }`}>
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>0{idx + 1}</span>
                  )}
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <span className={`text-[11px] font-semibold transition-colors duration-200 ${
                    isActive ? 'text-brand-green' : 'text-white'
                  }`}>
                    {stage.label}
                  </span>
                  <span className="text-[10px] text-muted-dark/85 leading-normal">
                    {stage.desc}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-brand-green" /> Operations Log Stream
        </span>
        
        <div className="w-full h-48 bg-canvas-dark border border-hairline-dark/65 rounded-lg p-3.5 font-mono text-[9px] text-brand-green/85 overflow-y-auto leading-relaxed flex flex-col gap-1.5 shadow-inner select-text">
          {logs.map((log, idx) => {
            const isError = log.includes('[error]')
            const isSystem = log.includes('[system]')
            const isModel = log.includes('[model]')
            const isLlm = log.includes('[llm]')
            
            let color = 'text-brand-green/85'
            if (isError) color = 'text-red-400'
            if (isSystem) color = 'text-blue-400'
            if (isModel) color = 'text-brand-green/60'
            if (isLlm) color = 'text-purple-400'

            return (
              <div key={idx} className={`${color} break-all`}>
                <span className="text-muted-dark/50 select-none mr-1.5">&gt;</span>
                {log}
              </div>
            )
          })}
          {progress < 100 ? (
            <div className="flex items-center gap-1.5 text-brand-green select-none">
              <span className="text-muted-dark/50 mr-1.5">&gt;</span>
              <Cpu className="w-3 h-3 animate-spin shrink-0" />
              <span className="animate-pulse">Awaiting diagnostic thread write...</span>
            </div>
          ) : null}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  )
}
