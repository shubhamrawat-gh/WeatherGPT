import { Check } from 'lucide-react'

interface StepperProps {
  currentStep: number
  steps: string[]
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="w-full py-4 select-none">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = currentStep > stepNumber
          const isActive = currentStep === stepNumber

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border font-mono text-xs font-bold transition-all duration-200 ${
                    isCompleted
                      ? 'bg-brand-green border-brand-green text-canvas-dark'
                      : isActive
                      ? 'bg-brand-green/10 border-brand-green text-brand-green shadow-lg shadow-brand-green/5'
                      : 'bg-surface-dark border-hairline-dark/60 text-muted-dark'
                  }`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" aria-hidden="true" />
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Step Label */}
                <span
                  className={`absolute top-10 text-[10px] font-sans font-semibold uppercase tracking-wider whitespace-nowrap transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-muted-dark/70'
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Progress Line */}
              {index < steps.length - 1 ? (
                <div 
                  className={`flex-grow h-[1px] mx-4 transition-colors duration-250 ${
                    isCompleted ? 'bg-brand-green/60' : 'bg-hairline-dark/40'
                  }`}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          )
        })}
      </div>
      {/* Spacer to balance the absolute labels below circles */}
      <div className="h-6" />
    </div>
  )
}
