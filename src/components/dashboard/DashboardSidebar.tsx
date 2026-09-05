import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  MessagesSquare, 
  Search, 
  Radar, 
  ShieldAlert, 
  AreaChart, 
  SlidersHorizontal, 
  PanelLeftClose, 
  PanelLeftOpen,
  CloudRain,
  Sun,
  Moon,
  LogOut
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onCollapseToggle: () => void
  onSelectChat?: (query: string) => void
}

export default function DashboardSidebar({
  isCollapsed,
  onCollapseToggle
}: DashboardSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between border-r dark:border-white/[0.08] border-slate-200 dark:bg-[#0d0d0d] bg-white dark:text-[#a8b3bc] text-slate-600 transition-[width] duration-200 ease-in-out select-none shrink-0 h-full ${
        isCollapsed ? 'w-[58px]' : 'w-[260px]'
      }`}
    >
      {/* Top Header & Nav Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Top Header: WeatherGPT Brand & Panel Actions */}
        <div className="h-12 px-3.5 flex items-center justify-between shrink-0 border-b dark:border-white/[0.08] border-slate-200">
          {!isCollapsed ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <CloudRain className="w-5 h-5 text-brand-green" />
                <span className="font-sans text-sm font-bold tracking-wider dark:text-white text-slate-900 uppercase">
                  WEATHER<span className="text-brand-green">GPT</span>
                </span>
              </Link>
              <div className="flex items-center gap-1 dark:text-[#a8b3bc] text-slate-500">
                <button
                  onClick={onCollapseToggle}
                  className="p-1 rounded dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors duration-120 cursor-pointer"
                  title="Collapse sidebar"
                  aria-label="Toggle sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
                <button
                  className="p-1 rounded dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors duration-120 cursor-pointer"
                  title="Search weather queries"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onCollapseToggle}
              className="w-full h-full flex items-center justify-center dark:text-[#a8b3bc] text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors duration-120 cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* WeatherGPT Meteorological Navigation Sections */}
        <div className="px-2 pt-2.5 flex flex-col gap-0.5 shrink-0 text-xs">
          {/* 1. Weather AI Chats */}
          <Link
            to="/dashboard"
            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:hover:text-white hover:text-slate-900 transition-colors ${
              location.pathname === '/dashboard' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600'
            }`}
            title="Weather AI Chats"
          >
            <MessagesSquare className="w-4 h-4 shrink-0 text-brand-green transition-transform duration-200 group-hover:scale-110" />
            {!isCollapsed && <span className="truncate font-sans">Chats</span>}
          </Link>

          {/* 2. Live Weather GIS Map */}
          <Link
            to="/dashboard/map"
            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:hover:text-white hover:text-slate-900 transition-colors ${
              location.pathname === '/dashboard/map' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600'
            }`}
            title="Live Weather GIS Map"
          >
            <Radar className="w-4 h-4 shrink-0 text-brand-green transition-transform duration-200 group-hover:scale-110" />
            {!isCollapsed && <span className="truncate font-sans">Live Weather Map</span>}
          </Link>

          {/* 3. Severe Alerts & Bulletins */}
          <Link
            to="/dashboard/alerts"
            className={`group flex items-center justify-between px-2.5 py-2 rounded-lg dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:hover:text-white hover:text-slate-900 transition-colors ${
              location.pathname === '/dashboard/alerts' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600'
            }`}
            title="Active Severe Weather Bulletins"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <ShieldAlert className="w-4 h-4 shrink-0 text-brand-green transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && <span className="truncate font-sans">Alerts &amp; Warnings</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-brand-green/30 text-brand-green bg-brand-green/10">
                6 Active
              </span>
            )}
          </Link>

          {/* 4. Climate & Monsoon Analytics */}
          <Link
            to="/dashboard/climate"
            className={`group flex items-center justify-between px-2.5 py-2 rounded-lg dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:hover:text-white hover:text-slate-900 transition-colors ${
              location.pathname === '/dashboard/climate' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600'
            }`}
            title="Monsoon & Climate Trends"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <AreaChart className="w-4 h-4 shrink-0 text-brand-green transition-transform duration-200 group-hover:scale-110" />
              {!isCollapsed && <span className="truncate font-sans">Climate Analytics</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-brand-green/30 text-brand-green bg-brand-green/10">
                LPA
              </span>
            )}
          </Link>

          {/* 5. Meteorological Settings */}
          <Link
            to="/dashboard/settings"
            className={`group flex items-center gap-2.5 px-2.5 py-2 rounded-lg dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:hover:text-white hover:text-slate-900 transition-colors ${
              location.pathname === '/dashboard/settings' ? 'dark:bg-[#181818] bg-slate-100 dark:text-white text-slate-900 font-medium border border-brand-green/30' : 'dark:text-[#a8b3bc] text-slate-600'
            }`}
            title="System Preferences & Units"
          >
            <SlidersHorizontal className="w-4 h-4 shrink-0 text-brand-green transition-transform duration-200 group-hover:scale-110" />
            {!isCollapsed && <span className="truncate font-sans">Settings &amp; Units</span>}
          </Link>

          {/* 6. Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`group flex items-center justify-between w-full px-2.5 py-2 rounded-lg dark:hover:bg-white/[0.06] hover:bg-slate-100 dark:hover:text-white hover:text-slate-900 dark:text-[#a8b3bc] text-slate-600 transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle dark mode and light mode"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              {isDark ? (
                <Moon className="w-4 h-4 shrink-0 text-brand-green transition-transform duration-200 group-hover:scale-110" />
              ) : (
                <Sun className="w-4 h-4 shrink-0 text-brand-green transition-transform duration-200 group-hover:scale-110" />
              )}
              {!isCollapsed && (
                <span className="truncate font-sans font-medium">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <div className="w-8 h-4 rounded-full dark:bg-white/[0.12] bg-slate-200 p-0.5 flex items-center transition-colors">
                <div
                  className={`w-3 h-3 rounded-full bg-brand-green transition-transform duration-200 ease-out shadow-xs ${
                    isDark ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            )}
          </button>
        </div>

        {/* Flexible spacer */}
        <div className="flex-1" />
      </div>

      {/* Bottom User Profile & Session Controls */}
      <div className="border-t dark:border-white/[0.08] border-slate-200 p-2 flex flex-col gap-1 shrink-0 text-xs dark:bg-[#0d0d0d] bg-white">
        <div
          className={`flex items-center justify-between p-1.5 rounded-lg dark:hover:bg-white/[0.04] hover:bg-slate-100 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-brand-green/20 border border-brand-green/40 text-brand-green flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
              WG
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs dark:text-white text-slate-900 truncate font-medium leading-tight">Shubham</span>
                <span className="text-[10px] text-[#7c8c9a] font-normal leading-tight">Weather Analyst</span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handleLogout}
                title="Sign Out"
                className="w-6 h-6 rounded flex items-center justify-center text-[#7c8c9a] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {isCollapsed && (
          <div className="flex flex-col gap-1 items-center">
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="w-full py-1.5 flex items-center justify-center text-[#7c8c9a] hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
