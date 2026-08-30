import { ShieldAlert, AlertTriangle } from 'lucide-react'
import PageHeader from '../../components/dashboard/PageHeader'
import EmptyState from '../../components/dashboard/EmptyState'
import ActionButton from '../../components/dashboard/ActionButton'

export default function IncidentsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-6 text-left">
      <PageHeader 
        title="Disaster Incident Reports" 
        description="Review, verify, and log ongoing emergency incidents and damage assessments."
        action={
          <ActionButton to="/dashboard/incidents/new" icon={ShieldAlert}>
            Report Incident
          </ActionButton>
        }
      />

      {/* Main Container */}
      <div className="w-full rounded-xl border border-hairline-dark/50 bg-surface-dark/10 p-6 md:p-12 min-h-[400px] flex items-center justify-center">
        <EmptyState 
          icon={ShieldAlert}
          title="No Incidents Reported"
          description="Incident reporting capabilities have been scaffolded. Click 'Report Incident' to launch the operational multi-step incident reporting wizard."
          badgeText="Operations Portal Active"
          action={
            <ActionButton 
              to="/dashboard/incidents/new" 
              variant="secondary" 
              icon={AlertTriangle}
            >
              Report First Incident
            </ActionButton>
          }
        />
      </div>
    </div>
  )
}
