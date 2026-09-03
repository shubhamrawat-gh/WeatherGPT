import { NavLink } from 'react-router-dom'
import type { NavItem } from './navigationConfig'

interface NavigationItemProps {
  link: NavItem
  isCollapsed: boolean
  onClick?: () => void
}

export default function NavigationItem({ link, isCollapsed, onClick }: NavigationItemProps) {
  const Icon = link.icon

  return (
    <NavLink
      to={link.to}
      end={link.to === '/dashboard'}
      onClick={onClick}
      title={isCollapsed ? link.label : undefined}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors select-none ${
          isActive
            ? 'bg-brand-green/10 text-brand-green font-semibold'
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]'
        } ${isCollapsed ? 'justify-center px-2' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active left indicator bar */}
          {isActive && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-brand-green" />
          )}

          <Icon
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive ? 'text-brand-green' : 'text-slate-400 group-hover:text-slate-200'
            }`}
          />

          {!isCollapsed && (
            <span className="truncate flex-1 text-left font-sans">{link.label}</span>
          )}

          {!isCollapsed && link.badge && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium ${
                link.badge.type === 'danger'
                  ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                  : 'bg-brand-green/15 text-brand-green border border-brand-green/20'
              }`}
            >
              {link.badge.text}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}
