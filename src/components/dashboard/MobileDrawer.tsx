import { AnimatePresence, motion } from 'framer-motion'
import { X, MessagesSquare, Radar, ShieldAlert, AreaChart, SlidersHorizontal, CloudRain, Sun, Moon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          {/* Drawer Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-64 max-w-[80vw] h-full dark:bg-[#0d0d0d] bg-white border-r dark:border-white/[0.08] border-slate-200 dark:text-[#a8b3bc] text-slate-600 flex flex-col justify-between p-3 z-10 shadow-2xl"
          >
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Header */}
              <div className="h-10 flex items-center justify-between mb-2 border-b dark:border-white/[0.08] border-slate-200 pb-2">
                <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-brand-green" />
                  <span className="font-sans text-xs font-bold tracking-wider dark:text-white text-slate-900 uppercase">
                    WEATHER<span className="text-brand-green">GPT</span>
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-1 rounded text-[#7c8c9a] dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors duration-120"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Primary Links */}
              <div className="flex flex-col gap-1 text-xs mb-3">
                <Link
                  to="/dashboard"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-120 ${
                    location.pathname === '/dashboard' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100'
                  }`}
                >
                  <MessagesSquare className="w-4 h-4 text-brand-green" />
                  <span>Chats</span>
                </Link>

                <Link
                  to="/dashboard/map"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-120 ${
                    location.pathname === '/dashboard/map' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100'
                  }`}
                >
                  <Radar className="w-4 h-4 text-brand-green" />
                  <span>Live Weather Map</span>
                </Link>

                <Link
                  to="/dashboard/alerts"
                  onClick={onClose}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors duration-120 ${
                    location.pathname === '/dashboard/alerts' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-brand-green" />
                    <span>Alerts &amp; Warnings</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-brand-green/30 text-brand-green bg-brand-green/10">
                    6 Active
                  </span>
                </Link>

                <Link
                  to="/dashboard/climate"
                  onClick={onClose}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors duration-120 ${
                    location.pathname === '/dashboard/climate' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AreaChart className="w-4 h-4 text-brand-green" />
                    <span>Climate Analytics</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-brand-green/30 text-brand-green bg-brand-green/10">
                    LPA
                  </span>
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-120 ${
                    location.pathname === '/dashboard/settings' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-brand-green" />
                  <span>Settings &amp; Units</span>
                </Link>

                {/* Dark / Light Mode Toggle */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="group flex items-center justify-between w-full px-2.5 py-2 rounded-lg transition-colors duration-120 dark:text-[#a8b3bc] text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 cursor-pointer"
                  title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? (
                      <Moon className="w-4 h-4 text-brand-green" />
                    ) : (
                      <Sun className="w-4 h-4 text-brand-green" />
                    )}
                    <span className="font-medium">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                  </div>
                  <div className="w-8 h-4 rounded-full dark:bg-white/[0.12] bg-slate-200 p-0.5 flex items-center transition-colors">
                    <div
                      className={`w-3 h-3 rounded-full bg-brand-green transition-transform duration-200 ease-out shadow-xs ${
                        isDark ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              </div>

              {/* Flexible spacer */}
              <div className="flex-1" />
            </div>

            {/* Bottom User Profile */}
            <div className="border-t dark:border-white/[0.08] border-slate-200 pt-2 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2 px-2 py-1 dark:text-white text-slate-900">
                <div className="w-6 h-6 rounded-full bg-brand-green/20 border border-brand-green/40 text-brand-green flex items-center justify-center font-bold text-[10px] font-mono">
                  WG
                </div>
                <span className="text-xs font-medium">Shubham · Weather Analyst</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
