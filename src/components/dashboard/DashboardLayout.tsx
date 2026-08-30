import { useState, useEffect, Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopbar from './DashboardTopbar'
import MobileDrawer from './MobileDrawer'
import ClickSpark from '../ClickSpark'

export default function DashboardLayout() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })
  const [isDark, setIsDark] = useState(() => {
    // Default to dark theme as RescueLens is an operations console
    return localStorage.getItem('theme') !== 'light'
  })

  // Theme Sync effect
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  // Sidebar Collapse sync
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  const handleMenuToggle = () => {
    setSidebarOpen((prev) => !prev)
  }

  const handleSidebarClose = () => {
    setSidebarOpen(false)
  }

  const isDashboardHome = location.pathname === '/dashboard' || location.pathname === '/dashboard/'

  return (
    <ClickSpark
      sparkColor="#00ed64"
      sparkSize={10}
      sparkRadius={20}
      sparkCount={10}
      duration={400}
    >
      <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-canvas-dark text-slate-800 dark:text-white overflow-hidden transition-colors duration-300">
        {/* Top Navigation Bar - full viewport width */}
        {!isDashboardHome && (
          <DashboardTopbar 
            onMenuToggle={handleMenuToggle} 
            isDark={isDark} 
            onThemeToggle={() => setIsDark(!isDark)} 
          />
        )}

        {/* Main Body Section below the Header */}
        <div className="flex flex-row flex-grow w-full overflow-hidden relative">
          
          {/* Navigation Sidebar (Desktop-only, collapsible) */}
          <DashboardSidebar 
            isOpen={sidebarOpen} 
            onClose={handleSidebarClose} 
            isCollapsed={isSidebarCollapsed}
            onCollapseToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          />

          {/* Mobile Drawer (Slides out when toggled) */}
          <MobileDrawer 
            isOpen={sidebarOpen} 
            onClose={handleSidebarClose} 
          />

          {/* Dashboard Content Container */}
          <main className="flex-grow overflow-y-auto bg-slate-50 dark:bg-canvas-dark flex flex-col transition-colors duration-300">
            <Suspense fallback={
              <div className="flex-grow flex items-center justify-center bg-slate-50 dark:bg-canvas-dark h-full w-full transition-colors duration-300">
                <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading" />
              </div>
            }>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </ClickSpark>
  )
}
