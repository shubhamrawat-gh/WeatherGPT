import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { NavItem } from './navigationConfig'

interface NavigationItemProps {
  link: NavItem
  isCollapsed: boolean
  onClose?: () => void
}

export default function NavigationItem({ link, isCollapsed, onClose }: NavigationItemProps) {
  const Icon = link.icon

  return (
    <NavLink
      to={link.to}
      onClick={onClose}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 select-none ${
          isActive
            ? 'bg-brand-green/10 text-brand-green font-semibold dark:bg-brand-green/5'
            : 'text-slate-600 dark:text-muted-dark hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark/40'
        } ${isCollapsed ? 'justify-center' : 'justify-between'}`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator bar on the left */}
          {isActive && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-brand-green shadow-[0_0_8px_#00ed64]"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}

          <div className="flex items-center gap-3">
            <Icon 
              className={`w-4.5 h-4.5 transition-colors duration-200 shrink-0 ${
                isActive 
                  ? 'text-brand-green drop-shadow-[0_0_6px_rgba(0,237,100,0.4)]' 
                  : 'text-slate-500 dark:text-muted-dark group-hover:text-slate-900 dark:group-hover:text-white'
              }`} 
              aria-hidden="true" 
            />
            
            {!isCollapsed && (
              <span className="tracking-wide text-xs">{link.label}</span>
            )}
          </div>

          {/* Badge (only if not collapsed) */}
          {!isCollapsed && link.badge && (
            <span
              className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold tracking-wider select-none shrink-0 ${
                link.badge.type === 'danger'
                  ? 'bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400'
                  : 'bg-emerald-100 dark:bg-[#0b2734] border border-emerald-200 dark:border-brand-green/20 text-emerald-700 dark:text-brand-green'
              }`}
            >
              {link.badge.text}
            </span>
          )}

          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-16 scale-0 group-hover:scale-100 bg-slate-900 dark:bg-surface-dark border border-slate-800 dark:border-hairline-dark text-white text-[10px] font-mono tracking-wider font-semibold py-1.5 px-3 rounded shadow-lg transition-all duration-150 origin-left z-50 pointer-events-none whitespace-nowrap">
              {link.label}
              {link.badge && ` (${link.badge.text})`}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}
