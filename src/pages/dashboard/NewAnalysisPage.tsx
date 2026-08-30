import PageHeader from '../../components/dashboard/PageHeader'
import AnalysisWorkflow from '../../components/dashboard/analysis/AnalysisWorkflow'
import ActionButton from '../../components/dashboard/ActionButton'
import { ArrowLeft } from 'lucide-react'

export default function NewAnalysisPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-6 text-left animate-in fade-in duration-300">
      <PageHeader 
        title="Disaster Analysis Ingestion Wizard" 
        description="Ingest aerial mapping grids, drone frames, or satellite orthophotos and configure pipeline models."
        action={
          <ActionButton to="/dashboard/analysis" variant="secondary" icon={ArrowLeft}>
            Back to Hub
          </ActionButton>
        }
      />

      <div className="w-full">
        <AnalysisWorkflow />
      </div>
    </div>
  )
}
