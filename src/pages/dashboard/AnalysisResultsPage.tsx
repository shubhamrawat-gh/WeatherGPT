import { useLocation } from 'react-router-dom'
import PageHeader from '../../components/dashboard/PageHeader'
import ResultsLayout from '../../components/dashboard/analysis/ResultsLayout'
import ActionButton from '../../components/dashboard/ActionButton'
import { getProviderById } from '../../services/aiProvider'
import { ArrowLeft } from 'lucide-react'

export default function AnalysisResultsPage() {
  const location = useLocation()
  
  // Extract state if navigated from processing, else use standby default
  const state = location.state || {
    providerId: 'gemini',
    selectedModules: ['damage_assessment', 'infrastructure_analysis', 'resource_detection', 'situational_intelligence', 'risk_assessment'],
    filesCount: 0
  }

  const provider = getProviderById(state.providerId)
  const providerName = provider ? provider.name : 'Google Gemini Pro Vision'

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-6 text-left animate-in fade-in duration-300">
      <PageHeader 
        title="Disaster Intelligence Diagnostic Results" 
        description="Review deep-learning segment classifications, blockage corridors, and risk assessment predictions."
        action={
          <div className="flex items-center gap-3">
            <ActionButton to="/dashboard/analysis" variant="secondary" icon={ArrowLeft}>
              Back to Hub
            </ActionButton>
          </div>
        }
      />

      <div className="w-full">
        <ResultsLayout 
          providerName={providerName}
          selectedModules={state.selectedModules}
          filesCount={state.filesCount}
        />
      </div>
    </div>
  )
}
