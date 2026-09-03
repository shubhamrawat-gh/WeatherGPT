import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import SEO from '../components/SEO'
import AuthLayout from '../components/auth/AuthLayout'
import AuthCard from '../components/auth/AuthCard'
import AuthHeader from '../components/auth/AuthHeader'
import AuthInput from '../components/auth/AuthInput'
import AuthButton from '../components/auth/AuthButton'
import AuthFooter from '../components/auth/AuthFooter'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!password) {
      newErrors.password = 'New password is required.'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <>
      <SEO 
        title="Reset Password | WeatherGPT Console" 
        description="Set a new password for your WeatherGPT account." 
      />

      <AuthLayout>
        <AuthCard>
          {submitted ? (
            <div className="text-center flex flex-col items-center gap-6 py-4">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center shadow-lg shadow-brand-green/5">
                <CheckCircle className="w-6 h-6 text-brand-green" aria-hidden="true" />
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-white m-0">Password Updated</h2>
                <p className="text-sm text-muted-dark leading-relaxed max-w-xs m-0">
                  Password updated successfully. You can now log in using your new credentials.
                </p>
              </div>

              <Link to="/login" className="w-full">
                <AuthButton type="button" showArrow={false}>
                  Back to Login
                </AuthButton>
              </Link>

              <AuthFooter showBackToHome={false} />
            </div>
          ) : (
            <>
              <AuthHeader 
                title="Reset Your Password" 
                subtitle="Enter your new password below to update your account credentials." 
              />

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <AuthInput 
                  label="New Password" 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={setPassword} 
                  placeholder="••••••••"
                  error={errors.password}
                  required
                  autoComplete="new-password"
                />

                <AuthInput 
                  label="Confirm Password" 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={setConfirmPassword} 
                  placeholder="••••••••"
                  error={errors.confirmPassword}
                  required
                  autoComplete="new-password"
                />

                <AuthButton loading={loading}>
                  Update Password
                </AuthButton>
              </form>

              <AuthFooter 
                primaryLinkText="Back to Login" 
                primaryLinkTo="/login" 
                showBackToHome={true}
              />
            </>
          )}
        </AuthCard>
      </AuthLayout>
    </>
  )
}
