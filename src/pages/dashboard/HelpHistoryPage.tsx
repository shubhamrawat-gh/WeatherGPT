import { History, ArrowLeft, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Layout & Dashboard Components
import PageHeader from '../../components/dashboard/PageHeader'
import ActionButton from '../../components/dashboard/ActionButton'
import EmptyState from '../../components/dashboard/help/EmptyState'
import SEO from '../../components/SEO'

export default function HelpHistoryPage() {
  const navigate = useNavigate()

  return (
    <>
      <SEO 
        title="Request History | RescueLens AI Console" 
        description="Review previously submitted emergency assistance logs and response outcomes." 
      />

      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-6 text-left">
        {/* Page Header */}
        <PageHeader 
          title="Assistance Request History" 
          description="Review submitted resource allocations, response agency logs, and dispatch states."
          action={
            <ActionButton 
              onClick={() => navigate('/dashboard/help')} 
              variant="secondary" 
              icon={ArrowLeft}
            >
              Back to Center
            </ActionButton>
          }
        />

        {/* Empty History Queue */}
        <div className="w-full rounded-xl border border-hairline-dark/50 bg-surface-dark/10 p-6 md:p-12 min-h-[400px] flex items-center justify-center">
          <EmptyState 
            icon={History}
            title="No Assistance Requests Available"
            description="Your submitted requests will appear here once backend database services are connected. Staged telemetry is currently simulated."
            badgeText="History Offline"
            action={
              <ActionButton 
                to="/dashboard/help/request" 
                variant="primary" 
                icon={Heart}
              >
                File First Request
              </ActionButton>
            }
          />
        </div>
      </div>
    </>
  )
}
