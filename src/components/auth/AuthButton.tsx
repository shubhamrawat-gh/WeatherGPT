import React from 'react'
import { ArrowRight } from 'lucide-react'

interface AuthButtonProps {
  children: React.ReactNode
  type?: 'submit' | 'button'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  showArrow?: boolean
}

export default function AuthButton({
  children,
  type = 'submit',
  loading = false,
  disabled = false,
  onClick,
  showArrow = true,
}: AuthButtonProps) {
  const isButtonDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isButtonDisabled}
      className="w-full h-12 relative overflow-hidden rounded-lg bg-brand-green hover:bg-brand-green-dark text-canvas-dark text-sm font-bold tracking-wide shadow-xl shadow-brand-green/20 hover:shadow-brand-green/35 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 group focus:outline-none focus:ring-2 focus:ring-brand-green/45 focus:ring-offset-2 focus:ring-offset-canvas-dark cursor-pointer font-sans uppercase"
    >
      {loading ? (
        <div 
          className="w-5 h-5 border-2 border-canvas-dark border-t-transparent rounded-full animate-spin" 
          role="status"
          aria-label="Loading"
        />
      ) : (
        <>
          {children}
          {showArrow ? (
            <ArrowRight 
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" 
              aria-hidden="true" 
            />
          ) : null}
        </>
      )}
    </button>
  )
}
