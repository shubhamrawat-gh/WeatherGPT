import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  User, 
  ChevronDown, 
  Flame, 
  Activity, 
  Brain, 
  Settings as SettingsIcon, 
  HelpCircle, 
  LogOut,
  MapPin
} from 'lucide-react'

const motionElement = motion

interface DashboardTopbarProps {
  onMenuToggle: () => void
  isDark: boolean
  onThemeToggle: () => void
}

export default function DashboardTopbar({ onMenuToggle, isDark, onThemeToggle }: DashboardTopbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    setIsUserMenuOpen(false)
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

  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Get current page title and breadcrumb based on location
  const getHeaderMeta = (pathname: string) => {
    if (pathname === '/dashboard') return { title: 'Operations Dashboard', breadcrumb: 'Home / Dashboard' }
    if (pathname.startsWith('/dashboard/incidents')) return { title: 'Live Incident Feed', breadcrumb: 'Home / Incidents' }
    if (pathname.startsWith('/dashboard/maps')) return { title: 'Geospatial Awareness Plane', breadcrumb: 'Home / Maps' }
    if (pathname.startsWith('/dashboard/analysis')) return { title: 'AI Predictive Analysis', breadcrumb: 'Home / AI Insights' }
    if (pathname.startsWith('/dashboard/help')) return { title: 'Comms & Broadcasts', breadcrumb: 'Home / Help' }
    if (pathname.startsWith('/dashboard/settings')) return { title: 'Systems Settings & Compliance', breadcrumb: 'Home / Settings' }
    if (pathname.startsWith('/dashboard/resources')) return { title: 'Resource Management Dispatch', breadcrumb: 'Home / Resources' }
    return { title: 'Operations Console', breadcrumb: 'Home / Console' }
  }

  const { title, breadcrumb } = getHeaderMeta(location.pathname)

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.getElementById('global-search-input')
        searchInput?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (searchRef.current && !searchRef.current.contains(target)) {
        setIsSearchFocused(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search suggestions mock data
  const suggestions = [
    { type: 'incident', text: 'Wildfire Sector 4-Alpha', icon: Flame, color: 'text-orange-500' },
    { type: 'seismic', text: 'M5.8 Epicenter - USGS Seismograph', icon: Activity, color: 'text-red-500' },
    { type: 'resource', text: 'Ground Logistics Vehicle Fleet', icon: MapPin, color: 'text-brand-green' },
    { type: 'intelligence', text: 'Gemini Disaster Analysis Briefing', icon: Brain, color: 'text-indigo-400' }
  ]

  const filteredSuggestions = suggestions.filter(s => 
    s.text.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const notifications = [
    { id: 1, text: 'CRITICAL: Wildfire detected by NASA FIRMS in Sector 4-Alpha.', time: '2m ago', unread: true, icon: Flame, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
    { id: 2, text: 'USGS: M5.8 quake registered near Central Rift fault-line.', time: '15m ago', unread: true, icon: Activity, color: 'text-red-500 bg-red-500/10 border-red-500/20' },
    { id: 3, text: 'Air-Rescue Asset #3 dispatched for relief dispatch.', time: '1h ago', unread: false, icon: MapPin, color: 'text-brand-green bg-brand-green/10 border-brand-green/20' },
    { id: 4, text: 'Gemini: Situation Summary compiled for EOC Directors.', time: '3h ago', unread: false, icon: Brain, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="h-[84px] sticky top-0 right-0 left-0 z-30 border-b border-slate-200 dark:border-hairline-dark/30 bg-white/90 dark:bg-[#001017]/90 backdrop-blur-md flex items-center justify-between px-6 select-none transition-colors duration-300">
      
      {/* Left: Hamburger & Page Title Breadcrumb */}
      <div className="flex items-center gap-4 text-left">
        {/* Hamburger Menu Toggle (Mobile only) */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-muted-dark dark:hover:text-white dark:hover:bg-surface-dark/40 transition-colors focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        {/* Page Title & Breadcrumb */}
        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-mono tracking-wide text-slate-400 dark:text-muted-dark/50 leading-none">
            {breadcrumb}
          </span>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white m-0 mt-1.5 font-sans leading-none">
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchRef} className="relative w-80 md:w-96 max-w-lg">
        <div className="relative flex items-center">
          <Search className="w-4.5 h-4.5 text-slate-400 dark:text-muted-dark/50 absolute left-3.5 pointer-events-none" />
          <input 
            id="global-search-input"
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search telemetry, events, files..." 
            className="w-full h-11 pl-11 pr-12 rounded-lg bg-slate-100 dark:bg-[#000a0f]/60 border border-slate-200 dark:border-hairline-dark/40 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-muted-dark/30 focus:outline-none focus:border-brand-green/30 dark:focus:border-brand-green/30 focus:bg-white dark:focus:bg-[#000a0f] focus:shadow-md dark:focus:shadow-none transition-all duration-200"
          />
          <div className="absolute right-3 hidden md:flex items-center gap-0.5 bg-slate-200 dark:bg-[#122c3b] px-1.5 py-0.5 rounded text-[8px] font-mono text-slate-500 dark:text-muted-dark/60 font-semibold border border-slate-300 dark:border-hairline-dark/60 select-none">
            <span>⌘</span><span>K</span>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {isSearchFocused && (
            <motionElement.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#001721] border border-slate-200 dark:border-hairline-dark/40 rounded-xl shadow-xl overflow-hidden z-50 p-2"
            >
              <div className="text-[9px] font-mono font-bold tracking-widest text-slate-400 dark:text-muted-dark/50 px-3 py-2 uppercase text-left border-b border-slate-100 dark:border-hairline-dark/30">
                Search Inferences
              </div>
              
              <div className="flex flex-col mt-1 max-h-60 overflow-y-auto">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-surface-dark/40 text-left transition-colors cursor-pointer"
                    >
                      <item.icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                      <span className="flex-grow truncate">{item.text}</span>
                      <span className="text-[9px] font-mono text-slate-400 dark:text-muted-dark/40 uppercase bg-slate-100 dark:bg-canvas-dark px-1.5 py-0.5 rounded">
                        {item.type}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 dark:text-muted-dark/50 py-4 text-center">
                    No matching coordinates or logs found.
                  </div>
                )}
              </div>
            </motionElement.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right: Metrics & Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        <div ref={notificationsRef} className="relative">
          <button 
            type="button" 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="w-10 h-10 rounded-lg border border-slate-200 dark:border-hairline-dark/50 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-muted-dark dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer relative"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border border-white dark:border-[#001017]" />
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motionElement.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#001721] border border-slate-200 dark:border-hairline-dark/40 rounded-xl shadow-xl overflow-hidden z-50 p-2"
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-hairline-dark/30">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-muted-dark/50 uppercase">
                    Incident Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-bold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="flex flex-col mt-1 divide-y divide-slate-100 dark:divide-hairline-dark/20 max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-surface-dark/30 transition-colors flex items-start gap-3 text-left">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${notif.color}`}>
                        <notif.icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className={`text-xs leading-normal truncate ${notif.unread ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                          {notif.text}
                        </p>
                        <span className="text-[9px] font-mono text-slate-400 dark:text-muted-dark/50 mt-1 block">
                          {notif.time}
                        </span>
                      </div>
                      {notif.unread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </motionElement.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Button */}
        <button 
          type="button" 
          onClick={onThemeToggle}
          className="w-10 h-10 rounded-lg border border-slate-200 dark:border-hairline-dark/50 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-muted-dark dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer"
          aria-label="Toggle visual theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* User Account Settings Dropdown */}
        <div ref={userMenuRef} className="relative">
          <button 
            type="button" 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 dark:border-[#1c2d38] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer bg-slate-50/50 dark:bg-brand-teal-deep/20"
            aria-label="User account details"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-brand-teal-deep border border-slate-300 dark:border-[#1c2d38] flex items-center justify-center text-slate-600 dark:text-brand-green font-bold text-xs">
              {initials}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 dark:text-muted-dark" />
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <motionElement.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#001721] border border-slate-200 dark:border-hairline-dark/40 rounded-xl shadow-xl overflow-hidden z-50 p-1.5"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-hairline-dark/20 text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{displayName}</p>
                  <p className="text-[9px] font-mono text-slate-400 dark:text-muted-dark/50 truncate mt-0.5">{email}</p>
                </div>
                
                <div className="flex flex-col mt-1">
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-surface-dark/40 text-left transition-colors cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400 dark:text-muted-dark" />
                    <span>Profile Panel</span>
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-surface-dark/40 text-left transition-colors cursor-pointer"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-slate-400 dark:text-muted-dark" />
                    <span>Compliance Configuration</span>
                  </Link>
                  <Link
                    to="/dashboard/help"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-surface-dark/40 text-left transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-muted-dark" />
                    <span>Operations Help</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition-colors cursor-pointer border-t border-slate-100 dark:border-hairline-dark/20 mt-1 pt-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              </motionElement.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
