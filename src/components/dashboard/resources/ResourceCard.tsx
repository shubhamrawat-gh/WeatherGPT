import type { Resource } from '../../../services/resource'
import ResourceStatusBadge from './ResourceStatusBadge'
import { 
  MapPin, 
  Phone, 
  Radio, 
  Clock,
  HeartPulse,
  Home,
  Utensils,
  Droplet,
  Users,
  ShieldAlert,
  Activity,
  HandHelping
} from 'lucide-react'

interface ResourceCardProps {
  resource: Resource
  onSelectOnMap?: (resource: Resource) => void
}

export default function ResourceCard({ resource, onSelectOnMap }: ResourceCardProps) {
  // Category Icon Mapping
  const iconMap = {
    HeartPulse,
    Home,
    Utensils,
    Droplet,
    Users,
    ShieldAlert,
    Activity,
    HandHelping
  }

  const IconComponent = iconMap[resource.category as keyof typeof iconMap] || ShieldAlert

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-hairline-dark/50 bg-surface-dark/15 hover:border-brand-green/35 transition-all duration-200 text-left font-sans">
      
      {/* Header Info */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green shrink-0">
            <IconComponent className="w-4 h-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h4 className="text-xs font-semibold text-white truncate max-w-[180px] sm:max-w-[240px]">
              {resource.name}
            </h4>
            <span className="text-[10px] text-muted-dark/85 capitalize">
              {resource.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 items-end shrink-0">
          <ResourceStatusBadge type="availability" value={resource.availability} />
          <ResourceStatusBadge type="verification" value={resource.verification} />
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1 border-t border-b border-hairline-dark/25 py-2.5">
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            {resource.location.address ? (
              <span className="text-[10px] text-white leading-normal">
                {resource.location.address}
              </span>
            ) : null}
            <span className="text-[8px] font-mono text-muted-dark">
              Coordinates: {resource.location.latitude.toFixed(6)}, {resource.location.longitude.toFixed(6)}
            </span>
          </div>
        </div>
      </div>

      {/* Capacity & Contacts Grid */}
      <div className="grid grid-cols-2 gap-4 text-[10px]">
        {/* Capacity Details */}
        {resource.capacity ? (
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-mono font-bold text-brand-green/85 uppercase tracking-wider">Capacity Status</span>
            <span className="text-white font-semibold">
              {resource.capacity.current} / {resource.capacity.max} {resource.capacity.unit || 'Units'}
            </span>
            <div className="w-full bg-canvas-dark border border-hairline-dark/60 rounded-full h-1 mt-0.5 overflow-hidden">
              <div 
                className="bg-brand-green h-full rounded-full" 
                style={{ width: `${Math.min(100, (resource.capacity.current / resource.capacity.max) * 100)}%` }} 
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-[8px] font-mono font-bold text-muted-dark uppercase tracking-wider">Capacity Status</span>
            <span className="text-muted-dark font-mono text-[9px]">NOT DETERMINED</span>
          </div>
        )}

        {/* Contacts details */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[8px] font-mono font-bold text-brand-green/85 uppercase tracking-wider">Emergency Contacts</span>
          <div className="flex flex-col gap-1 text-[9px] text-muted-dark leading-normal">
            {resource.contact?.phone ? (
              <div className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-muted-dark" />
                <span>{resource.contact.phone}</span>
              </div>
            ) : null}
            {resource.contact?.radioChannel ? (
              <div className="flex items-center gap-1 font-mono">
                <Radio className="w-3 h-3 text-muted-dark" />
                <span>CH: {resource.contact.radioChannel}</span>
              </div>
            ) : null}
            {!resource.contact?.phone && !resource.contact?.radioChannel ? (
              <span className="text-[8px] font-mono">NO STAGED DETAILS</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Footer / Telemetry metadata */}
      <div className="flex items-center justify-between mt-1 pt-2 border-t border-hairline-dark/20">
        <div className="flex items-center gap-1 text-[8px] text-muted-dark/60 font-mono">
          <Clock className="w-2.5 h-2.5" />
          <span>Sync: {resource.updatedAt}</span>
        </div>

        {onSelectOnMap ? (
          <button 
            type="button"
            onClick={() => onSelectOnMap(resource)}
            className="text-[9px] font-mono font-bold text-brand-green hover:text-brand-green-dark cursor-pointer transition-colors focus:outline-none"
          >
            LOCATE ON RADAR →
          </button>
        ) : null}
      </div>

    </div>
  )
}
