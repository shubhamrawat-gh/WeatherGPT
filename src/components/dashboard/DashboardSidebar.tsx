import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, LogOut, User, Settings as SettingsIcon } from 'lucide-react'
import Logo from '../Logo'
import { navigationConfig } from './navigationConfig'
import NavigationItem from './NavigationItem'
import { useAuth } from '../../context/AuthContext'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onCollapseToggle: () => void
}

export default function DashboardSidebar({ isCollapsed, onCollapseToggle }: DashboardSidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      const parts = name.trim().split(/\s+/)
      if (parts.length > 1) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return 'OP'
  }

  const displayName = user?.displayName || 'RescueLens Operator'
  const email = user?.email || 'operator@rescuelens.gov'
  const initials = getInitials(user?.displayName || null, user?.email || null)

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between border-r border-slate-200 dark:border-hairline-dark/45 bg-white dark:bg-[#001721] text-slate-800 dark:text-white transition-all duration-300 relative select-none shrink-0 ${
        isCollapsed ? 'w-[80px]' : 'w-[280px]'
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div className="pt-6">
        <div className={`px-6 flex items-center justify-between mb-8 ${isCollapsed ? 'justify-center' : ''}`}>
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <Logo showText={false} iconSizeClass="h-7 w-auto" />
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col text-left shrink-0"
              >
                <span className="font-mono text-xs font-bold tracking-widest text-slate-900 dark:text-white uppercase leading-none">
                  RescueLens AI
                </span>
                <span className="text-[8px] font-mono tracking-wider text-slate-400 dark:text-muted-dark/50 mt-1">
                  Disaster Intelligence Platform
                </span>
              </motion.div>
            )}
          </Link>
        </div>

        {/* Navigation Groups */}
        <div className={`px-4 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-220px)] ${isCollapsed ? 'items-center' : ''}`}>
          {navigationConfig.map((group, groupIdx) => (
            <div key={groupIdx} className="flex flex-col gap-2 w-full">
              {!isCollapsed ? (
                <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-muted-dark/45 tracking-widest uppercase px-3 text-left">
                  {group.title}
                </span>
              ) : (
                <div className="h-px bg-slate-100 dark:bg-hairline-dark/30 my-1 w-8 mx-auto" />
              )}
              
              <nav className="flex flex-col gap-1 w-full">
                {group.links.map((link) => (
                  <NavigationItem
                    key={link.to}
                    link={link}
                    isCollapsed={isCollapsed}
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Bottom User Panel & Collapse Toggle */}
      <div className="flex flex-col">
        {/* User Panel */}
        <div className="p-4 border-t border-slate-200 dark:border-hairline-dark/40 bg-slate-50/50 dark:bg-canvas-dark/20 flex flex-col gap-3">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-brand-teal-deep border border-slate-200 dark:border-[#1c2d38] flex items-center justify-center text-slate-600 dark:text-brand-green font-bold text-xs uppercase shrink-0">
              {initials}
            </div>
            
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-left leading-tight overflow-hidden"
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{displayName}</div>
                <div className="text-[10px] text-slate-400 dark:text-muted-dark/60 font-mono truncate">{email}</div>
              </motion.div>
            )}
          </div>

          {/* Quick Actions Panel - hidden when collapsed */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-1 text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-500 dark:text-muted-dark/75 mt-1 border-t border-slate-100 dark:border-hairline-dark/30 pt-2"
            >
              <Link
                to="/dashboard/settings"
                className="flex flex-col items-center justify-center py-1.5 rounded hover:bg-slate-100 dark:hover:bg-surface-dark/40 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <User className="w-3.5 h-3.5 mb-1 text-slate-400 dark:text-muted-dark" />
                <span>Profile</span>
              </Link>
              <Link
                to="/dashboard/settings"
                className="flex flex-col items-center justify-center py-1.5 rounded hover:bg-slate-100 dark:hover:bg-surface-dark/40 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <SettingsIcon className="w-3.5 h-3.5 mb-1 text-slate-400 dark:text-muted-dark" />
                <span>Config</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex flex-col items-center justify-center py-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mb-1 text-red-500" />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Collapse Toggle Trigger */}
        <button
          onClick={onCollapseToggle}
          className="h-10 border-t border-slate-200 dark:border-hairline-dark/40 flex items-center justify-center text-slate-400 dark:text-muted-dark hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-surface-dark/30 transition-all cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider font-semibold">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}
