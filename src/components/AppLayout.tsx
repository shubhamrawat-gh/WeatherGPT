import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ClickSpark from './ClickSpark'

export default function AppLayout() {
  return (
    <ClickSpark
      sparkColor="#00ed64"
      sparkSize={10}
      sparkRadius={20}
      sparkCount={10}
      duration={400}
    >
      <div className="flex flex-col min-h-screen bg-canvas-dark text-ink-dark">
        {/* Navigation */}
        <Navbar />

        {/* Main content slot */}
        <main className="flex-grow pt-20">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </ClickSpark>
  )
}

