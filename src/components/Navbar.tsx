import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, Globe } from 'lucide-react'
import Logo from './Logo'
import { useTheme } from '../context/ThemeContext'
import { useLanguage, SUPPORTED_LANGUAGES } from '../context/LanguageContext'

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme()
  const { currentLanguage, setLanguage, t } = useLanguage()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let active = false
    let ticking = false

    const updateScroll = () => {
      ticking = false
      const scrolled = window.scrollY > 20
      if (scrolled !== active) {
        active = scrolled
        setIsScrolled(scrolled)
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(updateScroll)
      }
    }

    updateScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const handleIntakeClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: 'report' | 'help') => {
    e.preventDefault()
    setMobileMenuOpen(false)

    const dispatchTabEvent = () => {
      window.dispatchEvent(new CustomEvent('set-intake-tab', { detail: tab }))
    }

    if (location.pathname !== '/') {
      navigate('/', { state: { openIntake: tab } })
    } else {
      dispatchTabEvent()
    }
  }

  // Handle scroll after route change to home
  useEffect(() => {
    if (location.pathname === '/' && location.state) {
      const state = location.state as { scrollTo?: string; openIntake?: 'report' | 'help' }
      if (state.scrollTo) {
        const element = document.getElementById(state.scrollTo)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
      }
      if (state.openIntake) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('set-intake-tab', { detail: state.openIntake }))
        }, 150)
      }
      // Clear history state to prevent scrolling/opening on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-canvas-dark/85 backdrop-blur-md border-b border-hairline-dark/40 py-3 shadow-lg shadow-black/10'
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo & Top Left Links */}
        <div className="flex items-center gap-6">
          <Link to="/" aria-label="WeatherGPT Home" className="text-white">
            <Logo iconSizeClass="h-8 w-auto" />
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-muted-dark hover:text-[#00ed64] transition-colors duration-200"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/features"
            className="text-sm font-medium text-muted-dark hover:text-[#00ed64] transition-colors duration-200"
          >
            {t('nav.features')}
          </Link>
          <Link
            to="/how-it-works"
            className="text-sm font-medium text-muted-dark hover:text-[#00ed64] transition-colors duration-200"
          >
            {t('nav.howItWorks')}
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-muted-dark hover:text-[#00ed64] transition-colors duration-200"
          >
            {t('nav.contact')}
          </Link>
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Regional Language Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 dark:border-[#1c2333] bg-white/50 dark:bg-white/[0.04] backdrop-blur-xs text-xs font-medium text-slate-700 dark:text-slate-300">
            <Globe className="w-3.5 h-3.5 text-brand-green shrink-0" />
            <select
              value={currentLanguage.code}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-0 text-slate-800 dark:text-white font-medium focus:outline-hidden cursor-pointer text-xs"
              title="Select Site Language"
              aria-label="Select Site Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white dark:bg-[#121212] text-slate-900 dark:text-white">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          <a
            href="#intake"
            onClick={(e) => handleIntakeClick(e, 'report')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border border-red-500/25 hover:border-red-500/50 bg-red-500/5 hover:bg-red-500/15 text-red-400 shadow-sm transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-red-500/10 cursor-pointer"
          >
            Report Event
          </a>
          <a
            href="#intake"
            onClick={(e) => handleIntakeClick(e, 'help')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold border border-brand-green/20 hover:border-brand-green/45 bg-brand-green/5 hover:bg-brand-green/15 text-brand-green/90 hover:text-brand-green shadow-sm transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg hover:shadow-brand-green/10 cursor-pointer"
          >
            Ask Weather
          </a>
          <div className="w-px h-4 bg-slate-200 dark:bg-white/[0.08] mx-1" />
          <button
            type="button"
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-[#1c2333] flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-slate-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <Link
            to="/dashboard"
            className="px-5 py-2 rounded-full text-xs font-bold bg-[#00ed64] hover:bg-[#00b545] text-[#001e2b] shadow-md shadow-[#00ed64]/10 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            {t('nav.dashboard')}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden transition-colors duration-200 text-muted-dark hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b overflow-hidden bg-canvas-dark border-hairline-dark/60"
          >
            <div className="px-6 py-6 flex flex-col gap-5">
              {/* Mobile Language Selector */}
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-brand-green shrink-0" />
                  <span className="text-muted-dark font-medium">Language</span>
                </div>
                <select
                  value={currentLanguage.code}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent border-0 text-white font-semibold text-xs focus:outline-hidden cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-[#121212] text-white">
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              <a
                href="#intake"
                onClick={(e) => handleIntakeClick(e, 'report')}
                className="text-base font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 text-red-400 hover:text-red-300"
              >
                Report Event
              </a>
              <a
                href="#intake"
                onClick={(e) => handleIntakeClick(e, 'help')}
                className="text-base font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:translate-x-1 text-brand-green hover:text-brand-green-dark"
              >
                Ask Weather
              </a>
              <div className="w-full h-px my-1 bg-hairline-dark/40" />
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium transition-colors duration-200 text-muted-dark hover:text-white"
              >
                {t('nav.home')}
              </Link>
              <Link
                to="/features"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium transition-colors duration-200 text-muted-dark hover:text-white"
              >
                {t('nav.features')}
              </Link>
              <Link
                to="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium transition-colors duration-200 text-muted-dark hover:text-white"
              >
                {t('nav.howItWorks')}
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium transition-colors duration-200 text-muted-dark hover:text-white"
              >
                {t('nav.contact')}
              </Link>
              <div className="w-full h-px my-2 bg-hairline-dark/40" />
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-1 transition-colors duration-200 text-[#00ed64] hover:text-white"
              >
                {t('nav.dashboard')}
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
