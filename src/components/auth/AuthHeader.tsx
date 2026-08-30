import { Link } from 'react-router-dom'
import Logo from '../Logo'

interface AuthHeaderProps {
  title: string
  subtitle: string
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Brand logo badge */}
      <Link 
        to="/" 
        className="mb-5 group transition-transform duration-200 hover:scale-[1.02]"
        aria-label="RescueLens Home"
      >
        <Logo showText={false} iconSizeClass="h-12 w-auto" />
      </Link>

      
      <h1 className="text-2xl font-bold tracking-tight text-white m-0">
        {title}
      </h1>
      
      <p className="text-sm text-muted-dark mt-2 leading-relaxed max-w-xs m-0">
        {subtitle}
      </p>
    </div>
  )
}
