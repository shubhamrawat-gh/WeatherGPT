import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface AuthInputProps {
  label: string
  id: string
  type: 'text' | 'email' | 'password'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string | null
  required?: boolean
  autoComplete?: string
}

export default function AuthInput({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoComplete,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  
  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev)
  }

  // Calculate actual input type dynamically
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="flex flex-col gap-2 w-full text-left">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-semibold text-muted-dark uppercase tracking-wider select-none"
        >
          {label}
        </label>
      </div>

      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none transition-all duration-200 ${
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/35'
              : 'border-hairline-dark focus:border-brand-green focus:ring-1 focus:ring-brand-green/35'
          } ${isPassword ? 'pr-10' : ''}`}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-3 top-3.5 text-muted-dark hover:text-white transition-colors duration-200 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <span 
          id={`${id}-error`} 
          className="text-xs text-red-400 font-mono tracking-wide mt-1"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  )
}
