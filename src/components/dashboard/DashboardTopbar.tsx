import { Link, useNavigate } from 'react-router-dom'
import { Menu, Settings, Sun, Moon, LogOut, Globe } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext'

interface DashboardTopbarProps {
  onMenuToggle: () => void
  isDark: boolean
  onThemeToggle: () => void
}

export default function DashboardTopbar({ onMenuToggle, isDark, onThemeToggle }: DashboardTopbarProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { currentLanguage, setLanguage, t } = useLanguage()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="lg:hidden h-11 border-b dark:border-white/[0.08] border-slate-200 dark:bg-[#0a0a0a] bg-white dark:text-[#a8b3bc] text-slate-600 flex items-center justify-between px-3 shrink-0 select-none z-10 font-sans">
      {/* Left: Mobile hamburger + Minimal brand */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-md dark:text-[#a8b3bc] text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Link to="/dashboard" className="flex items-center gap-1.5">
          <span className="font-sans text-xs font-bold tracking-wider dark:text-white text-slate-900 uppercase">
            WEATHER<span className="text-brand-green">GPT</span>
          </span>
        </Link>
      </div>

      {/* Right: Clean minimal actions */}
      <div className="flex items-center gap-1.5">
        {/* Language Selector Dropdown */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md text-[11px]">
          <Globe className="w-3 h-3 text-brand-green shrink-0" />
          <select
            value={currentLanguage.code}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border-0 text-slate-800 dark:text-white font-medium focus:outline-hidden cursor-pointer text-xs pr-1"
            title="Select Regional Language"
            aria-label="Select Regional Language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-white dark:bg-[#121212] text-slate-900 dark:text-white">
                {lang.nativeName} ({lang.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          title={isDark ? t('sidebar.lightMode') : t('sidebar.darkMode')}
          className="w-7 h-7 rounded-md flex items-center justify-center dark:text-[#a8b3bc] text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors duration-120 cursor-pointer"
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-brand-green" /> : <Moon className="w-3.5 h-3.5 text-brand-green" />}
        </button>

        {/* Settings Link */}
        <Link
          to="/dashboard/settings"
          title={t('sidebar.settings')}
          className="w-7 h-7 rounded-md flex items-center justify-center dark:text-[#a8b3bc] text-slate-600 dark:hover:text-white hover:text-slate-900 dark:hover:bg-white/[0.06] hover:bg-slate-100 transition-colors duration-120 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
        </Link>

        {/* Sign Out */}
        <button
          onClick={handleLogout}
          title={t('sidebar.logout')}
          className="w-7 h-7 rounded-md flex items-center justify-center dark:text-[#a8b3bc] text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-120 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  )
}
