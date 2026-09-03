

interface LogoProps {
  className?: string
  showText?: boolean
  textSizeClass?: string
  iconSizeClass?: string
}

export default function Logo({ 
  className = '', 
  showText = true, 
  textSizeClass = 'font-mono text-base font-bold tracking-wider',
  iconSizeClass = 'h-7 w-auto'
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      {/* WeatherGPT Network Glyph */}
      <svg 
        className={`${iconSizeClass} text-current group-hover:text-brand-green transition-colors duration-200`}
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hexagonal / Weather intelligence hub shape */}
        <polygon 
          points="20,4 34,12 34,28 20,36 6,28 6,12" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinejoin="round" 
          className="text-brand-green/40 group-hover:text-brand-green transition-colors duration-200" 
          fill="none"
        />
        {/* Interconnected data source pathways */}
        <path 
          d="M20 4 L20 20 M20 20 L34 28 M20 20 L6 28 M6 12 L20 20 M34 12 L20 20" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          className="text-white/60 group-hover:text-white transition-colors duration-200"
        />
        {/* Central AI node */}
        <circle cx="20" cy="20" r="3.5" fill="#00ed64" />
        <circle cx="20" cy="4" r="2" fill="currentColor" opacity="0.8" />
        <circle cx="34" cy="12" r="2" fill="currentColor" opacity="0.8" />
        <circle cx="34" cy="28" r="2" fill="currentColor" opacity="0.8" />
        <circle cx="20" cy="36" r="2" fill="currentColor" opacity="0.8" />
        <circle cx="6" cy="28" r="2" fill="currentColor" opacity="0.8" />
        <circle cx="6" cy="12" r="2" fill="currentColor" opacity="0.8" />
      </svg>
      {showText ? (
        <div className="flex flex-col text-left">
          <span className={`text-current group-hover:text-brand-green transition-colors duration-200 ${textSizeClass}`}>
            WEATHER<span className="text-brand-green font-black">GPT</span>
          </span>
        </div>
      ) : null}
    </div>
  )
}

