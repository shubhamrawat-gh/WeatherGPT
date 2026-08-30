import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadZone from './UploadZone'
import AnalysisConfigurator from './AnalysisConfigurator'
import ProcessingScreen from './ProcessingScreen'
import { getProviderById } from '../../../services/aiProvider'
import { ChevronRight, ArrowLeft, Play, CheckCircle } from 'lucide-react'

export default function AnalysisWorkflow() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  
  // Staged files
  const [files, setFiles] = useState<File[]>([])
  
  // AI Config settings
  const [providerId, setProviderId] = useState('gemini')
  const [selectedModules, setSelectedModules] = useState<string[]>(['damage_assessment', 'situational_intelligence'])

  const provider = getProviderById(providerId)

  const handleNextStep = () => {
    if (step < 3) {
      setStep(prev => prev + 1)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1)
    }
  }

  const handleStartProcessing = () => {
    setStep(4)
  }

  const handleProcessingComplete = () => {
    // Navigate to results page, passing the config via state for dynamic placeholder activation
    navigate('/dashboard/analysis/results', {
      state: {
        providerId,
        selectedModules,
        filesCount: files.length
      }
    })
  }

  const isStep1Valid = files.length > 0
  const isStep2Valid = selectedModules.length > 0

  return (
    <div className="w-full flex flex-col gap-6 text-left animate-in fade-in duration-300">
      
      {/* 4-Step HUD Stepper Indicator */}
      <div className="grid grid-cols-4 gap-2 border-b border-hairline-dark/35 pb-5">
        {[
          { label: 'Upload Data', num: 1 },
          { label: 'Configuration', num: 2 },
          { label: 'Review Parameters', num: 3 },
          { label: 'Process Analytics', num: 4 }
        ].map((s) => {
          const isActive = s.num === step
          const isCompleted = s.num < step
          return (
            <div key={s.num} className="flex flex-col gap-1.5">
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-canvas-dark border border-hairline-dark/60">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    isActive ? 'bg-brand-green w-full' : isCompleted ? 'bg-brand-teal-mid w-full' : 'w-0'
                  }`} 
                />
              </div>
              <span className={`text-[9px] font-mono font-bold tracking-wider uppercase ${
                isActive ? 'text-brand-green' : isCompleted ? 'text-brand-teal-mid' : 'text-muted-dark/40'
              }`}>
                0{s.num}. {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Steps Content Area */}
      <div className="flex-grow py-2">
        {step === 1 ? (
          <div className="flex flex-col gap-6 max-w-xl mx-auto">
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Step 1: Upload disaster imagery datasets
              </h3>
              <p className="text-[10px] text-muted-dark/85 leading-normal m-0">
                Upload aerial telemetry photos, drone mapping grids, or geotiff satellite orthophotos for diagnosis.
              </p>
            </div>
            <UploadZone files={files} onFilesChange={setFiles} />
            <div className="flex justify-end mt-4">
              <button
                type="button"
                disabled={!isStep1Valid}
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-green disabled:bg-hairline disabled:text-muted disabled:cursor-not-allowed hover:bg-brand-green-dark text-canvas-dark rounded-full text-xs font-bold font-sans transition-all duration-200 cursor-pointer focus:outline-none"
              >
                Configure Analysis <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-6 max-w-xl mx-auto">
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Step 2: AI Pipeline &amp; Analysis Configuration
              </h3>
              <p className="text-[10px] text-muted-dark/85 leading-normal m-0">
                Abstracted AI Provider interfaces allow selection of Hugging Face models, Google Gemini multimodal classifiers, or local EDGE devices.
              </p>
            </div>
            
            <AnalysisConfigurator
              selectedProviderId={providerId}
              onProviderChange={setProviderId}
              selectedModuleIds={selectedModules}
              onModulesChange={setSelectedModules}
            />

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-hairline-dark hover:bg-surface-dark/50 text-white rounded-full text-xs font-semibold font-sans transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Upload
              </button>
              <button
                type="button"
                disabled={!isStep2Valid}
                onClick={handleNextStep}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-green disabled:bg-hairline disabled:text-muted disabled:cursor-not-allowed hover:bg-brand-green-dark text-canvas-dark rounded-full text-xs font-bold font-sans transition-all duration-200 cursor-pointer focus:outline-none"
              >
                Review Parameters <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-6 max-w-xl mx-auto">
            <div className="flex flex-col gap-1">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Step 3: Review Analysis Parameters
              </h3>
              <p className="text-[10px] text-muted-dark/85 leading-normal m-0">
                Verify target files, active modules, and AI pipeline providers before running diagnostics.
              </p>
            </div>

            <div className="flex flex-col gap-4 bg-surface-dark/20 border border-hairline-dark/50 rounded-xl p-5 font-sans">
              {/* File details */}
              <div className="flex flex-col gap-1.5 border-b border-hairline-dark/25 pb-3.5">
                <span className="text-[9px] font-mono font-bold text-brand-green uppercase tracking-wider">Staged Datasets</span>
                <span className="text-xs font-semibold text-white">{files.length} file(s) marked for ingestion</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {files.slice(0, 3).map(f => (
                    <span key={f.name} className="px-2 py-0.5 rounded bg-surface-dark border border-hairline-dark font-mono text-[8px] text-muted-dark truncate max-w-[150px]">
                      {f.name}
                    </span>
                  ))}
                  {files.length > 3 ? (
                    <span className="px-2 py-0.5 rounded bg-surface-dark border border-hairline-dark font-mono text-[8px] text-brand-green">
                      +{files.length - 3} more
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Provider details */}
              <div className="flex flex-col gap-1 border-b border-hairline-dark/25 pb-3.5">
                <span className="text-[9px] font-mono font-bold text-brand-green uppercase tracking-wider">AI Model Interface</span>
                <span className="text-xs font-semibold text-white">{provider?.name}</span>
                <span className="text-[10px] text-muted-dark/80">{provider?.description}</span>
              </div>

              {/* Modules details */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-mono font-bold text-brand-green uppercase tracking-wider">Active Diagnostic Modules</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedModules.map(mid => {
                    const label = mid.replace('_', ' ').toUpperCase()
                    return (
                      <span key={mid} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-bold tracking-wider rounded border bg-brand-green/5 border-brand-green/20 text-brand-green select-none">
                        <CheckCircle className="w-3 h-3 text-brand-green" />
                        {label}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-hairline-dark hover:bg-surface-dark/50 text-white rounded-full text-xs font-semibold font-sans transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Config
              </button>
              
              <button
                type="button"
                onClick={handleStartProcessing}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-brand-green hover:bg-brand-green-dark text-canvas-dark rounded-full text-xs font-bold font-sans transition-all duration-200 cursor-pointer focus:outline-none"
              >
                <Play className="w-3.5 h-3.5 fill-current" /> Start Processing Pipeline
              </button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <ProcessingScreen
            providerName={provider?.name || 'Local Edge'}
            selectedModules={selectedModules}
            filesCount={files.length}
            onComplete={handleProcessingComplete}
          />
        ) : null}
      </div>
    </div>
  )
}
