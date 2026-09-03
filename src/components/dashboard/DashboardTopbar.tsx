import { Link, useNavigate } from 'react-router-dom'
import { Menu, Settings, Sun, Moon, LogOut, Radio } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface DashboardTopbarProps {
  onMenuToggle: () => void
  isDark: boolean
  onThemeToggle: () => void
}

export default function DashboardTopbar({ onMenuToggle, isDark, onThemeToggle }: DashboardTopbarProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="h-11 border-b border-[#1c2d38] bg-[#001e2b] text-[#a8b3bc] flex items-center justify-between px-4 shrink-0 select-none z-10 font-sans">
      {/* Left: Mobile hamburger + Minimal title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-[#a8b3bc] hover:text-white hover:bg-[#002d3f] transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-brand-green animate-pulse" />
          <span className="text-xs font-mono text-[#a8b3bc]">
            WeatherGPT Telemetry Active
          </span>
        </div>
      </div>

      {/* Right: Clean minimal actions */}
      <div className="flex items-center gap-1.5">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          title="Toggle Theme"
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#a8b3bc] hover:text-white hover:bg-[#002d3f] transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Settings Link */}
        <Link
          to="/dashboard/settings"
          title="Settings"
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#a8b3bc] hover:text-white hover:bg-[#002d3f] transition-colors cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
        </Link>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="w-7 h-7 rounded-md flex items-center justify-center text-[#a8b3bc] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
