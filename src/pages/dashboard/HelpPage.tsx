import { useNavigate } from 'react-router-dom'
import { 
  HelpCircle, 
  PhoneCall, 
  History, 
  HeartPulse, 
  LifeBuoy, 
  Utensils, 
  Droplet, 
  Home, 
  Truck, 
  Radio,
  ClipboardList
} from 'lucide-react'

// Dashboard & Help Components
import PageHeader from '../../components/dashboard/PageHeader'
import ActionButton from '../../components/dashboard/ActionButton'
import RequestCategoryCard from '../../components/dashboard/help/RequestCategoryCard'
import EmptyState from '../../components/dashboard/help/EmptyState'
import SEO from '../../components/SEO'

export default function HelpPage() {
  const navigate = useNavigate()

  const categories = [
    { 
      name: 'Medical', 
      title: 'Medical Assistance', 
      icon: HeartPulse, 
      description: 'Urgent medical care, triage requests, and first-aid supply staging.' 
    },
    { 
      name: 'Rescue', 
      title: 'Search & Rescue', 
      icon: LifeBuoy, 
      description: 'Emergency rescue, debris clearance, and missing persons tracking.' 
    },
    { 
      name: 'Food', 
      title: 'Food Supplies', 
      icon: Utensils, 
      description: 'Rations, hot meals, baby formula, and distribution centers coordination.' 
    },
    { 
      name: 'Water', 
      title: 'Water Supplies', 
      icon: Droplet, 
      description: 'Potable water, purification tablets, and bulk water storage tankers.' 
    },
    { 
      name: 'Shelter', 
      title: 'Shelter Support', 
      icon: Home, 
      description: 'Emergency shelters, tents, blankets, and temporary housing locator.' 
    },
    { 
      name: 'Evacuation', 
      title: 'Evacuation Support', 
      icon: Truck, 
      description: 'Emergency transport, safe zones routing, and mobility assistance.' 
    },
    { 
      name: 'Communication', 
      title: 'Emergency Communication', 
      icon: Radio, 
      description: 'Satellite uplinks, local radio channels, and rescue dispatch networks.' 
    },
    { 
      name: 'Other', 
      title: 'Other Assistance', 
      icon: HelpCircle, 
      description: 'Miscellaneous emergencies, power grids help, or logistics coordination.' 
    },
  ]

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/dashboard/help/request?category=${categoryName}`)
  }

  return (
    <>
      <SEO 
        title="Emergency Assistance Center | RescueLens AI Console" 
        description="Request emergency assistance and monitor live dispatch queues." 
      />

      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto px-6 py-6 text-left">
        {/* Page Header */}
        <PageHeader 
          title="Emergency Assistance Center" 
          description="Request critical emergency support, coordinate volunteer resources, and route supplies to rescue staging grounds."
          action={
            <div className="flex items-center gap-3">
              <ActionButton 
                to="/dashboard/help/history" 
                variant="secondary" 
                icon={History}
              >
                View History
              </ActionButton>
              
              <ActionButton 
                to="/dashboard/help/request" 
                variant="primary" 
                icon={PhoneCall}
              >
                Request Assistance
              </ActionButton>
            </div>
          }
        />

        {/* Categories Grid */}
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-sans m-0">
              Assistance Categories
            </h3>
            <p className="text-xs text-muted-dark/80 m-0 font-sans">
              Select a category to pre-configure and dispatch an assistance request wizard.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <RequestCategoryCard
                key={cat.name}
                icon={cat.icon}
                title={cat.title}
                description={cat.description}
                onClick={() => handleCategoryClick(cat.name)}
              />
            ))}
          </div>
        </div>

        {/* Active Requests Queue: Empty State */}
        <div className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col gap-1 border-b border-hairline-dark/40 pb-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-sans m-0">
              Active Staging Queue
            </h3>
            <p className="text-xs text-muted-dark/80 m-0 font-sans">
              Live updates of assistance requests currently pending dispatch pipelines.
            </p>
          </div>

          <div className="w-full rounded-xl border border-hairline-dark/50 bg-surface-dark/10 p-6 md:p-12 min-h-[300px] flex items-center justify-center">
            <EmptyState 
              icon={ClipboardList}
              title="No Staged Assistance Requests"
              description="No emergency requests are currently active or logged from this node. Your filed requests will show up in the history queue."
              badgeText="Queue Active"
            />
          </div>
        </div>
      </div>
    </>
  )
}
