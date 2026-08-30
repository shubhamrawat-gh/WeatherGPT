import { HeartPulse, LifeBuoy, Utensils, Droplet, Home, Truck, Radio, HelpCircle } from 'lucide-react'

interface HelpRequestData {
  category: string
  priority: string
  description: string
  country: string
  region: string
  area: string
  coordinates?: string
  fullName: string
  phone: string
  email: string
  organization?: string
}

interface ReviewPanelProps {
  data: HelpRequestData
}

export default function ReviewPanel({ data }: ReviewPanelProps) {
  const categoryIcons: Record<string, any> = {
    'Medical': HeartPulse,
    'Rescue': LifeBuoy,
    'Food': Utensils,
    'Water': Droplet,
    'Shelter': Home,
    'Evacuation': Truck,
    'Communication': Radio,
    'Other': HelpCircle,
  }

  const Icon = categoryIcons[data.category] || HelpCircle

  const getPriorityColor = (lvl: string) => {
    switch (lvl) {
      case 'Low':
        return 'text-slate-400 border-slate-800 bg-slate-950/20'
      case 'Medium':
        return 'text-brand-green border-brand-teal-mid bg-brand-teal/20'
      case 'High':
        return 'text-amber-400 border-amber-800 bg-amber-950/20'
      case 'Critical':
        return 'text-red-400 border-red-800 bg-red-950/20 animate-pulse'
      default:
        return 'text-white border-hairline-dark'
    }
  }

  return (
    <div className="flex flex-col gap-6 text-left select-none">
      <div className="flex flex-col gap-1.5 border-b border-hairline-dark/40 pb-4">
        <h3 className="text-base font-semibold text-white m-0 font-sans">
          Review Assistance Request
        </h3>
        <p className="text-xs text-muted-dark/80 m-0 font-sans">
          Verify operational values before committing the record to staging buffers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Request & Core Details */}
        <div className="flex flex-col gap-5 bg-surface-dark/15 border border-hairline-dark/30 rounded-xl p-5">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-dark m-0">
            Request Info
          </h4>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-teal-deep border border-hairline-dark/60 flex items-center justify-center text-brand-green">
              <Icon className="w-4.5 h-4.5" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-dark font-sans leading-none">Category</span>
              <span className="text-sm font-semibold text-white mt-1 leading-normal font-sans">
                {data.category} Assistance
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-dark font-sans">Priority Level</span>
            <div className="flex">
              <span className={`text-[10px] font-mono tracking-wider font-bold border rounded px-2.5 py-0.5 uppercase ${getPriorityColor(data.priority)}`}>
                {data.priority}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-dark font-sans">Situation Description</span>
            <p className="text-xs text-white leading-relaxed m-0 font-sans whitespace-pre-wrap bg-canvas-dark/40 border border-hairline-dark/35 rounded-lg p-3">
              {data.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Right: Location & Contacts */}
        <div className="flex flex-col gap-6">
          {/* Location Summary */}
          <div className="flex flex-col gap-4 bg-surface-dark/15 border border-hairline-dark/30 rounded-xl p-5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-dark m-0">
              Location details
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-dark font-mono uppercase tracking-wider">Country</span>
                <span className="text-xs font-medium text-white mt-1 font-sans">{data.country}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-dark font-mono uppercase tracking-wider">Region / State</span>
                <span className="text-xs font-medium text-white mt-1 font-sans">{data.region}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-dark font-mono uppercase tracking-wider">Area / City</span>
                <span className="text-xs font-medium text-white mt-1 font-sans">{data.area}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-muted-dark font-mono uppercase tracking-wider">GPS Coordinates</span>
                <span className="text-xs font-mono text-brand-green/85 mt-1">{data.coordinates || 'Not Specified'}</span>
              </div>
            </div>
          </div>

          {/* Contact Summary */}
          <div className="flex flex-col gap-4 bg-surface-dark/15 border border-hairline-dark/30 rounded-xl p-5">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-dark m-0">
              Contact Information
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted-dark font-mono uppercase tracking-wider">Full Name</span>
                <span className="text-xs font-medium text-white mt-1 font-sans">{data.fullName}</span>
              </div>
              <div className="flex flex-col col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted-dark font-mono uppercase tracking-wider">Phone</span>
                <span className="text-xs font-mono text-white mt-1">{data.phone}</span>
              </div>
              <div className="flex flex-col col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted-dark font-mono uppercase tracking-wider">Email Address</span>
                <span className="text-xs font-mono text-white mt-1 truncate">{data.email}</span>
              </div>
              <div className="flex flex-col col-span-2 sm:col-span-1">
                <span className="text-[10px] text-muted-dark font-mono uppercase tracking-wider">Organization</span>
                <span className="text-xs font-medium text-white mt-1 font-sans">{data.organization || 'None / Individual'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
