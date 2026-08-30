import React from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  children: React.ReactNode
  onClick?: () => void
  to?: string
  variant?: 'primary' | 'secondary' | 'danger'
  icon?: LucideIcon
  className?: string
  disabled?: boolean
  type?: 'submit' | 'button'
  loading?: boolean
}

export default function ActionButton({
  children,
  onClick,
  to,
  variant = 'primary',
  icon: Icon,
  className = '',
  disabled = false,
  type = 'button',
  loading = false,
}: ActionButtonProps) {
  const isButtonDisabled = disabled || loading
  
  const baseClasses = 'inline-flex items-center justify-center gap-2 text-xs font-semibold rounded-full shadow-lg transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100 focus:outline-none px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-brand-green hover:bg-brand-green-dark text-canvas-dark shadow-brand-green/5',
    secondary: 'bg-transparent border border-hairline-dark hover:bg-surface-dark text-white',
    danger: 'bg-red-950/40 border border-red-900/60 hover:bg-red-900/40 text-red-400',
  }

  const content = loading ? (
    <div 
      className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" 
      role="status"
      aria-label="Loading"
    />
  ) : (
    <>
      {Icon ? <Icon className="w-3.5 h-3.5" aria-hidden="true" /> : null}
      {children}
    </>
  )

  if (to) {
    return (
      <Link 
        to={isButtonDisabled ? '#' : to} 
        className={`${baseClasses} ${variantClasses[variant]} ${isButtonDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
        onClick={(e) => {
          if (isButtonDisabled) {
            e.preventDefault()
          } else if (onClick) {
            onClick()
          }
        }}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isButtonDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {content}
    </button>
  )
}
