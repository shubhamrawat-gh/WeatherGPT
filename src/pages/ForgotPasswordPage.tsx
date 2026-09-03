import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import SEO from '../components/SEO'
import AuthLayout from '../components/auth/AuthLayout'
import AuthCard from '../components/auth/AuthCard'
import AuthHeader from '../components/auth/AuthHeader'
import AuthInput from '../components/auth/AuthInput'
import AuthButton from '../components/auth/AuthButton'
import AuthFooter from '../components/auth/AuthFooter'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)

    if (!email) {
      setEmailError('Email address is required.')
      return
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }

  return (
    <>
      <SEO 
        title="Forgot Password | WeatherGPT Console" 
        description="Request password recovery instructions for your WeatherGPT account." 
      />

      <AuthLayout>
        <AuthCard>
          {submitted ? (
            <div className="text-center flex flex-col items-center gap-6 py-4">
              <div className="w-12 h-12 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center shadow-lg shadow-brand-green/5">
                <CheckCircle className="w-6 h-6 text-brand-green" aria-hidden="true" />
              </div>
              
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-white m-0">Recovery Email Sent</h2>
                <p className="text-sm text-muted-dark leading-relaxed max-w-xs m-0">
                  Recovery instructions sent. Check your inbox at <span className="text-white font-mono">{email}</span> for further steps.
                </p>
              </div>

              <AuthButton onClick={() => setSubmitted(false)} showArrow={false}>
                Try another email
              </AuthButton>

              <AuthFooter showBackToHome={false} />
            </div>
          ) : (
            <>
              <AuthHeader 
                title="Reset Your Password" 
                subtitle="Enter your email address and we will send password recovery instructions." 
              />

              <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                <AuthInput 
                  label="Email Address" 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={setEmail} 
                  placeholder="responder@agency.org"
                  error={emailError}
                  required
                  autoComplete="email"
                />

                <AuthButton loading={loading}>
                  Send Recovery Link
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
