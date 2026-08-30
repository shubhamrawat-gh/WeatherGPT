import { NavLink } from 'react-router-dom'
import { Map, MapPin, ShieldAlert, Layers } from 'lucide-react'

export default function MapToolbar() {
  const tabs = [
    { to: '/dashboard/maps', label: 'Console Map', icon: Map, end: true },
    { to: '/dashboard/maps/resources', label: 'Resource Discovery', icon: MapPin, end: false },
    { to: '/dashboard/maps/incidents', label: 'Incident Overlays', icon: ShieldAlert, end: false },
    { to: '/dashboard/maps/layers', label: 'Layer Controls', icon: Layers, end: false },
  ]

  return (
    <div className="flex items-center gap-2 border-b border-hairline-dark/45 bg-surface-dark/15 px-4 h-12 w-full select-none overflow-x-auto shrink-0 scrollbar-none">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 h-full border-b-2 text-xs font-semibold font-sans tracking-wide transition-all duration-150 shrink-0 ${
              isActive
                ? 'border-brand-green text-brand-green bg-brand-green/[0.03]'
                : 'border-transparent text-muted-dark hover:text-white hover:bg-surface-dark/20'
            }`
          }
        >
          <tab.icon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </div>
  )
}
