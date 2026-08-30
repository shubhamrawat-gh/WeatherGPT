import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogOut, User, Settings as SettingsIcon } from 'lucide-react'
import Logo from '../Logo'
import { navigationConfig } from './navigationConfig'
import NavigationItem from './NavigationItem'
import { useAuth } from '../../context/AuthContext'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    onClose()
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Fade-in */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />

          {/* Drawer Slide-in */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-white dark:bg-[#001721] border-r border-slate-200 dark:border-hairline-dark/45 flex flex-col justify-between pt-5 pb-6 lg:hidden shadow-2xl"
          >
            {/* Header / Logo */}
            <div>
              <div className="px-6 flex items-center justify-between mb-8">
                <Link to="/" onClick={onClose} className="flex items-center gap-2">
                  <Logo showText={false} iconSizeClass="h-7 w-auto" />
                  <div className="flex flex-col text-left">
                    <span className="font-mono text-xs font-bold tracking-widest text-slate-900 dark:text-white uppercase">
                      RescueLens AI
                    </span>
                    <span className="text-[8px] font-mono tracking-wider text-slate-400 dark:text-muted-dark/50">
                      Disaster Platform
                    </span>
                  </div>
                </Link>
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-muted-dark dark:hover:text-white hover:bg-slate-100 dark:hover:bg-surface-dark/40 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation links */}
              <div className="px-4 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                {navigationConfig.map((group, groupIdx) => (
                  <div key={groupIdx} className="flex flex-col gap-2">
                    <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-muted-dark/45 tracking-widest uppercase px-3 text-left">
                      {group.title}
                    </span>
                    <nav className="flex flex-col gap-1">
                      {group.links.map((link) => (
                        <NavigationItem
                          key={link.to}
                          link={link}
                          isCollapsed={false}
                          onClose={onClose}
                        />
                      ))}
                    </nav>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom User Panel */}
            <div className="px-6 pt-4 border-t border-slate-200 dark:border-hairline-dark/40 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-brand-teal-deep border border-slate-200 dark:border-[#1c2d38] flex items-center justify-center text-slate-600 dark:text-brand-green font-bold text-xs uppercase shrink-0">
                  {initials}
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{displayName}</div>
                  <div className="text-[10px] text-slate-400 dark:text-muted-dark/60 font-mono">{email}</div>
                </div>
              </div>

              {/* Actions list */}
              <div className="grid grid-cols-3 gap-1 text-[10px] font-mono tracking-wider uppercase font-semibold text-slate-500 dark:text-muted-dark/75">
                <Link
                  to="/dashboard/settings"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-100 dark:hover:bg-surface-dark/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <User className="w-3.5 h-3.5 mb-1 text-slate-400 dark:text-muted-dark" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/dashboard/settings"
                  onClick={onClose}
                  className="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-100 dark:hover:bg-surface-dark/40 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <SettingsIcon className="w-3.5 h-3.5 mb-1 text-slate-400 dark:text-muted-dark" />
                  <span>Config</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex flex-col items-center justify-center p-2 rounded hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 mb-1 text-red-500" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
