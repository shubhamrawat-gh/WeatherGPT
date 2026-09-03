import { useState, useEffect, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopbar from './DashboardTopbar'
import MobileDrawer from './MobileDrawer'
import { useTheme } from '../../context/ThemeContext'

export default function DashboardLayout() {
  const { isDark, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true'
  })

  // Sidebar Collapse sync
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

  return (
    <div className="flex h-screen w-full bg-[#00141e] text-[#f0f4f8] overflow-hidden font-sans">
      {/* Navigation Sidebar (Desktop Full Height) */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onCollapseToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Right Content Section */}
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-[#00141e]">
        {/* Minimal Dashboard Topbar */}
        <DashboardTopbar
          onMenuToggle={() => setSidebarOpen(true)}
          isDark={isDark}
          onThemeToggle={toggleTheme}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden bg-[#00141e] flex flex-col relative">
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center h-full w-full">
                <div className="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
