import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Map, 
  AlertTriangle, 
  TrendingUp, 
  Sliders, 
  Radio, 
  ChevronDown, 
  PanelLeftClose, 
  PanelLeftOpen,
  CloudRain
} from 'lucide-react'

interface DashboardSidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed: boolean
  onCollapseToggle: () => void
  onSelectChat?: (query: string) => void
}

// Strictly WeatherGPT meteorological queries
const WEATHER_QUERIES = [
  { id: '1', title: 'Bay of Bengal cyclonic depression...', query: 'What is the current cyclone status in Bay of Bengal?' },
  { id: '2', title: 'Mumbai 3-day precipitation forecast...', query: 'Provide 3-day rainfall forecast for Mumbai and coastal Konkan' },
  { id: '3', title: 'Kharif paddy crop sowing advisory...', query: 'What agro-advisory applies to paddy sowing in Eastern India this week?' },
  { id: '4', title: 'Northwest India heatwave bulletin...', query: 'Are there any active heatwave alerts in Rajasthan or Vidarbha?' },
  { id: '5', title: 'Southwest monsoon LPA departure...', query: 'Show long period average rainfall departures for current monsoon season' },
  { id: '6', title: 'Coastal Gujarat maritime swell alert...', query: 'Give maritime swell warnings and wave heights for Gujarat coastline' },
  { id: '7', title: 'Brahmaputra river basin flood watch...', query: 'What is the flood inundation telemetry in Assam and Brahmaputra valley?' },
  { id: '8', title: 'Himachal cloudburst & landslide risk...', query: 'Assess landslide risk and cloudburst potential in Shimla and Kullu' },
  { id: '9', title: 'Western Ghats rainfall accumulation...', query: 'What is the 24-hour rainfall accumulation in Ghat regions?' },
  { id: '10', title: 'Delhi NCR air quality & fog forecast...', query: 'What is the atmospheric dispersion and AQI forecast for Delhi NCR?' }
]

export default function DashboardSidebar({
  isCollapsed,
  onCollapseToggle,
  onSelectChat
}: DashboardSidebarProps) {
  const location = useLocation()
  const [activeChatId, setActiveChatId] = useState('1')

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between border-r border-[#1c2d38] bg-[#001e2b] text-[#a8b3bc] transition-all duration-200 select-none shrink-0 h-full ${
        isCollapsed ? 'w-[58px]' : 'w-[260px]'
      }`}
    >
      {/* Top Header & Nav Section */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Top Header: WeatherGPT Brand & Panel Actions */}
        <div className="h-12 px-3.5 flex items-center justify-between shrink-0 border-b border-[#1c2d38]/50">
          {!isCollapsed ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <CloudRain className="w-5 h-5 text-brand-green" />
                <span className="font-sans text-sm font-bold tracking-wider text-white uppercase">
                  WEATHER<span className="text-brand-green">GPT</span>
                </span>
              </Link>
              <div className="flex items-center gap-1 text-[#a8b3bc]">
                <button
                  onClick={onCollapseToggle}
                  className="p-1 rounded hover:text-white hover:bg-[#002d3f] transition-colors cursor-pointer"
                  title="Collapse sidebar"
                  aria-label="Toggle sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
                <button
                  className="p-1 rounded hover:text-white hover:bg-[#002d3f] transition-colors cursor-pointer"
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
              className="mx-auto p-1.5 rounded text-[#a8b3bc] hover:text-white hover:bg-[#002d3f] transition-colors cursor-pointer"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* New Weather Query Button */}
        <div className="px-2.5 pt-2.5 pb-2 shrink-0">
          <Link
            to="/dashboard"
            className={`w-full bg-[#002d3f] hover:bg-[#003d4f] text-white font-medium text-xs rounded-lg transition-colors flex items-center cursor-pointer border border-[#1c2d38] shadow-sm ${
              isCollapsed ? 'justify-center py-2 px-0' : 'gap-2.5 px-3 py-2'
            }`}
            title="Start new weather query"
          >
            <Plus className="w-4 h-4 shrink-0 text-brand-green" />
            {!isCollapsed && <span className="font-sans">New Weather Query</span>}
          </Link>
        </div>

        {/* WeatherGPT Meteorological Navigation Sections */}
        <div className="px-2 flex flex-col gap-0.5 shrink-0 text-xs">
          {/* 1. Live Weather GIS Map */}
          <Link
            to="/dashboard/map"
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#002d3f] hover:text-white transition-colors ${
              location.pathname === '/dashboard/map' ? 'bg-[#002d3f] text-white font-medium border border-brand-green/30' : 'text-[#a8b3bc]'
            }`}
            title="Live Weather GIS Map"
          >
            <Map className="w-4 h-4 shrink-0 text-brand-green" />
            {!isCollapsed && <span className="truncate font-sans">Live Weather Map</span>}
          </Link>

          {/* 2. Severe Alerts & Bulletins */}
          <Link
            to="/dashboard/alerts"
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#002d3f] hover:text-white transition-colors ${
              location.pathname === '/dashboard/alerts' ? 'bg-[#002d3f] text-white font-medium border border-brand-green/30' : 'text-[#a8b3bc]'
            }`}
            title="Active Severe Weather Bulletins"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              {!isCollapsed && <span className="truncate font-sans">Alerts &amp; Warnings</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-red-500/40 text-red-400 bg-red-500/10">
                6 Active
              </span>
            )}
          </Link>

          {/* 3. Climate & Monsoon Analytics */}
          <Link
            to="/dashboard/climate"
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-[#002d3f] hover:text-white transition-colors ${
              location.pathname === '/dashboard/climate' ? 'bg-[#002d3f] text-white font-medium border border-brand-green/30' : 'text-[#a8b3bc]'
            }`}
            title="Monsoon & Climate Trends"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <TrendingUp className="w-4 h-4 shrink-0 text-blue-400" />
              {!isCollapsed && <span className="truncate font-sans">Climate Analytics</span>}
            </div>
            {!isCollapsed && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-brand-green/30 text-brand-green bg-brand-green/10">
                LPA
              </span>
            )}
          </Link>

          {/* 4. Meteorological Settings */}
          <Link
            to="/dashboard/settings"
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-[#002d3f] hover:text-white transition-colors ${
              location.pathname === '/dashboard/settings' ? 'bg-[#002d3f] text-white font-medium border border-brand-green/30' : 'text-[#a8b3bc]'
            }`}
            title="System Preferences & Units"
          >
            <Sliders className="w-4 h-4 shrink-0 text-[#7c8c9a]" />
            {!isCollapsed && <span className="truncate font-sans">Settings &amp; Units</span>}
          </Link>
        </div>

        {/* Recent Weather Queries Section */}
        {!isCollapsed && (
          <div className="mt-4 flex-1 flex flex-col overflow-hidden">
            {/* Section Header */}
            <div className="px-3 py-1.5 flex items-center justify-between text-xs text-[#7c8c9a] shrink-0 border-t border-[#1c2d38]/50">
              <span className="font-mono text-[10px] uppercase tracking-wider">Recent Weather Queries</span>
            </div>

            {/* Queries List */}
            <div className="flex-1 overflow-y-auto px-1.5 py-1 flex flex-col gap-0.5 scrollbar-thin">
              {WEATHER_QUERIES.map((item) => {
                const isActive = activeChatId === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveChatId(item.id)
                      if (onSelectChat) onSelectChat(item.query)
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-xs transition-colors cursor-pointer group ${
                      isActive
                        ? 'text-white bg-[#002d3f] font-medium'
                        : 'text-[#a8b3bc] hover:text-white hover:bg-[#002d3f]/60'
                    }`}
                  >
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0 shadow-[0_0_6px_rgba(0,237,100,0.6)]" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full border border-[#5c6c7a] group-hover:border-brand-green shrink-0" />
                    )}
                    <span className="truncate font-sans font-normal leading-normal">
                      {item.title}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Weather Telemetry & User Profile */}
      <div className="border-t border-[#1c2d38] p-2 flex flex-col gap-1 shrink-0 text-xs bg-[#001e2b]">
        {/* Telemetry Status */}
        <div
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[#a8b3bc] ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title="IMD & Radar Telemetry Connected"
        >
          <Radio className="w-3.5 h-3.5 shrink-0 text-brand-green animate-pulse" />
          {!isCollapsed && (
            <span className="text-[11px] font-mono text-[#a8b3bc]">
              IMD Radar / INSAT Synced
            </span>
          )}
        </div>

        {/* User Profile Bar */}
        <div
          className={`flex items-center justify-between p-1.5 rounded-lg hover:bg-[#002d3f] transition-colors cursor-pointer ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 rounded-full bg-brand-green/20 border border-brand-green/40 text-brand-green flex items-center justify-center font-bold text-[10px] shrink-0 font-mono">
              WG
            </div>
            {!isCollapsed && (
              <div className="flex items-center gap-1 text-xs text-white truncate font-medium">
                <span>Shubham</span>
                <span className="text-[#7c8c9a] font-normal">· Weather Analyst</span>
                <ChevronDown className="w-3 h-3 text-[#7c8c9a] ml-0.5 shrink-0" />
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
