import { useSearchParams, useNavigate } from 'react-router-dom'

// Layout & Form Components
import PageHeader from '../../components/dashboard/PageHeader'
import HelpRequestForm from '../../components/dashboard/help/HelpRequestForm'
import SEO from '../../components/SEO'

export default function NewHelpRequestPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  // Extract pre-selected category if available (e.g. ?category=Medical)
  const initialCategory = searchParams.get('category') || ''

  return (
    <>
      <SEO 
        title="Request Assistance | RescueLens AI Console" 
        description="Launch an emergency assistance dispatch request for volunteers and supplies." 
      />

      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-6 py-6 text-left">
        {/* Page Header */}
        <PageHeader 
          title="Intake Assistance Request" 
          description="File emergency requests for medical, food, shelter, or search & rescue resources. Input details carefully for dispatch staging."
        />

        {/* Wizard Form */}
        <div className="w-full">
          <HelpRequestForm 
            initialCategory={initialCategory} 
            onReturn={() => navigate('/dashboard/help')} 
          />
        </div>
      </div>
    </>
  )
}
