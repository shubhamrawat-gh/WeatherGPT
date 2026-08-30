import { CheckCircle } from 'lucide-react'
import ActionButton from '../ActionButton'
import DashboardCard from '../DashboardCard'

interface SuccessStateProps {
  onReset: () => void
  onReturn: () => void
}

export default function SuccessState({ onReset, onReturn }: SuccessStateProps) {
  return (
    <div className="w-full py-12 flex items-center justify-center">
      <DashboardCard className="max-w-md w-full text-center p-8 flex flex-col items-center gap-6">
        <div className="w-12 h-12 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center shadow-lg shadow-brand-green/5">
          <CheckCircle className="w-6 h-6 text-brand-green" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-2 select-none">
          <h2 className="text-xl font-bold text-white m-0 font-sans">
            Request Submitted Successfully
          </h2>
          <p className="text-xs text-muted-dark leading-relaxed max-w-xs m-0 font-sans">
            Your assistance request has been recorded. Future integrations will connect this request to emergency response teams.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <ActionButton onClick={onReturn}>
            Return to Help Center
          </ActionButton>
          
          <button
            onClick={onReset}
            className="text-xs text-brand-green hover:underline focus:outline-none bg-transparent border-0 cursor-pointer font-sans"
          >
            Create another help request
          </button>
        </div>
      </DashboardCard>
    </div>
  )
}
