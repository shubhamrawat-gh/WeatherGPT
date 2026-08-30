import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface AuthFooterProps {
  primaryLinkText?: string
  primaryLinkTo?: string
  secondaryLinkText?: string
  secondaryLinkTo?: string
  showBackToHome?: boolean
  noteText?: string
}

export default function AuthFooter({
  primaryLinkText,
  primaryLinkTo,
  secondaryLinkText,
  secondaryLinkTo,
  showBackToHome = true,
  noteText = 'Secure access for authorized responders and platform users.',
}: AuthFooterProps) {
  const hasLinks = primaryLinkText || secondaryLinkText || showBackToHome

  return (
    <div className="flex flex-col gap-6 w-full">
      {hasLinks ? (
        <div className="flex flex-col gap-3 pt-4 border-t border-hairline-dark/40 text-xs select-none">
          {/* Main secondary navigation row */}
          <div className="flex items-center justify-between text-muted-dark">
            {primaryLinkText && primaryLinkTo ? (
              <Link to={primaryLinkTo} className="hover:text-white transition-colors duration-200">
                {primaryLinkText}
              </Link>
            ) : <div />}

            {secondaryLinkText && secondaryLinkTo ? (
              <Link to={secondaryLinkTo} className="text-brand-green hover:underline">
                {secondaryLinkText}
              </Link>
            ) : <div />}
          </div>

          {/* Back to Home row */}
          {showBackToHome ? (
            <Link 
              to="/" 
              className="inline-flex items-center gap-1 text-muted-dark hover:text-white transition-colors duration-200 mt-1 self-start group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back to Home
            </Link>
          ) : null}
        </div>
      ) : null}

      {/* Security warning note */}
      {noteText ? (
        <p className="text-[10px] text-muted-dark/60 tracking-wider text-center select-none m-0 uppercase font-mono leading-relaxed">
          {noteText}
        </p>
      ) : null}
    </div>
  )
}
