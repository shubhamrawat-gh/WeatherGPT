import { AnimatePresence, motion } from 'framer-motion'
import { X, Plus, Map, AlertTriangle, TrendingUp, Sliders, Radio, CloudRain } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const WEATHER_QUERIES = [
  { id: '1', title: 'Bay of Bengal cyclonic depression...' },
  { id: '2', title: 'Mumbai 3-day precipitation forecast...' },
  { id: '3', title: 'Kharif paddy crop sowing advisory...' },
  { id: '4', title: 'Northwest India heatwave bulletin...' },
  { id: '5', title: 'Southwest monsoon LPA departure...' },
]

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const location = useLocation()

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
            className="relative w-64 max-w-[80vw] h-full bg-[#001e2b] border-r border-[#1c2d38] text-[#a8b3bc] flex flex-col justify-between p-3 z-10 shadow-2xl"
          >
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Header */}
              <div className="h-10 flex items-center justify-between mb-2 border-b border-[#1c2d38]/50 pb-2">
                <Link to="/dashboard" onClick={onClose} className="flex items-center gap-2">
                  <CloudRain className="w-5 h-5 text-brand-green" />
                  <span className="font-sans text-xs font-bold tracking-wider text-white uppercase">
                    WEATHER<span className="text-brand-green">GPT</span>
                  </span>
                </Link>
                <button
                  onClick={onClose}
                  className="p-1 rounded text-[#7c8c9a] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* New Query Button */}
              <Link
                to="/dashboard"
                onClick={onClose}
                className="w-full bg-[#002d3f] hover:bg-[#003d4f] text-white font-medium text-xs rounded-lg py-2 px-3 flex items-center gap-2 mb-3 border border-[#1c2d38]"
              >
                <Plus className="w-4 h-4 text-brand-green" />
                <span>New Weather Query</span>
              </Link>

              {/* Primary Links */}
              <div className="flex flex-col gap-1 text-xs mb-3">
                <Link
                  to="/dashboard/map"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${
                    location.pathname === '/dashboard/map' ? 'bg-[#002d3f] text-white font-medium' : 'text-[#a8b3bc]'
                  }`}
                >
                  <Map className="w-4 h-4 text-brand-green" />
                  <span>Live Weather Map</span>
                </Link>

                <Link
                  to="/dashboard/alerts"
                  onClick={onClose}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${
                    location.pathname === '/dashboard/alerts' ? 'bg-[#002d3f] text-white font-medium' : 'text-[#a8b3bc]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Alerts &amp; Warnings</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-red-500/40 text-red-400 bg-red-500/10">
                    6 Active
                  </span>
                </Link>

                <Link
                  to="/dashboard/climate"
                  onClick={onClose}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg ${
                    location.pathname === '/dashboard/climate' ? 'bg-[#002d3f] text-white font-medium' : 'text-[#a8b3bc]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span>Climate Analytics</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-brand-green/30 text-brand-green bg-brand-green/10">
                    LPA
                  </span>
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${
                    location.pathname === '/dashboard/settings' ? 'bg-[#002d3f] text-white font-medium' : 'text-[#a8b3bc]'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-[#7c8c9a]" />
                  <span>Settings &amp; Units</span>
                </Link>
              </div>

              {/* Recent Weather Queries */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-mono text-[#7c8c9a] uppercase">
                  <span>Recent Queries</span>
                </div>
                <div className="flex-1 overflow-y-auto flex flex-col gap-1 py-1">
                  {WEATHER_QUERIES.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-2 px-2 py-1.5 text-xs text-[#a8b3bc] truncate">
                      {i === 0 ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full border border-[#5c6c7a] shrink-0" />
                      )}
                      <span className="truncate">{c.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Telemetry & User */}
            <div className="border-t border-[#1c2d38] pt-2 flex flex-col gap-1.5 text-xs">
              <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-mono text-[#a8b3bc]">
                <Radio className="w-3.5 h-3.5 text-brand-green animate-pulse" />
                <span>IMD &amp; INSAT Synced</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 text-white">
                <div className="w-6 h-6 rounded-full bg-brand-green/20 border border-brand-green/40 text-brand-green flex items-center justify-center font-bold text-[10px] font-mono">
                  WG
                </div>
                <span className="text-xs">Shubham · Weather Analyst</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
