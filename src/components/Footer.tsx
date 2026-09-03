import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-[#1c2d38] bg-[#001e2b] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <Link to="/">
          <Logo iconSizeClass="h-6 w-auto" className="text-white" />
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium">
          <Link to="/" className="text-[#a8b3bc] hover:text-[#00ed64] transition-colors duration-200">
            Home
          </Link>
          <Link to="/features" className="text-[#a8b3bc] hover:text-[#00ed64] transition-colors duration-200">
            Features
          </Link>
          <Link to="/how-it-works" className="text-[#a8b3bc] hover:text-[#00ed64] transition-colors duration-200">
            How It Works
          </Link>
          <Link to="/contact" className="text-[#a8b3bc] hover:text-[#00ed64] transition-colors duration-200">
            Contact
          </Link>
          <span className="text-brand-green/80 font-mono text-[11px]">
            SIH26068 · Team ZeroLatency
          </span>
        </div>

        <p className="text-[11px] font-mono text-[#a8b3bc]/85">
          &copy; {currentYear} WeatherGPT. Conversational AI for Weather & Climate Intelligence.
        </p>
      </div>
    </footer>
  )
}
