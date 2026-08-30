import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../services/firebase'
import SEO from '../components/SEO'
import AuthLayout from '../components/auth/AuthLayout'
import { Mail, Lock, Eye, EyeOff, ArrowRight, MapPin, Brain, Users, ClipboardList } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  
  const navigate = useNavigate()
  const location = useLocation()

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (!email) {
      newErrors.email = 'Email address is required.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      const origin = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(origin, { replace: true })
    } catch (error: any) {
      console.error(error)
      let message = 'Invalid email or password.'
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.'
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Invalid credentials. Please check your email and password.'
      } else {
        message = error.message || 'An error occurred during sign-in.'
      }
      setErrors({ form: message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setErrors({})
    try {
      await signInWithPopup(auth, googleProvider)
      const origin = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(origin, { replace: true })
    } catch (error: any) {
      console.error(error)
      let message = 'Google Sign-in failed. Please try again.'
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in window closed before completing.'
      } else {
        message = error.message || 'Google Sign-in failed.'
      }
      setErrors({ form: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO 
        title="Login | RescueLens Console" 
        description="Access the RescueLens emergency operations platform." 
      />

      <AuthLayout maxWidthClass="max-w-5xl">
        {/* Rounded lg (12px) card container as specified in design.md */}
        <div className="w-full bg-canvas-dark rounded-xl overflow-hidden border border-hairline-dark shadow-2xl flex flex-col md:flex-row min-h-[580px]">
          
          {/* Left Pane - Command Center marketing in signature brand-teal-deep */}
          <div className="w-full md:w-1/2 bg-[#001721] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden text-left border-b md:border-b-0 md:border-r border-hairline-dark/60">
            {/* Subtle grid decoration overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c2d38_1px,transparent_1px),linear-gradient(to_bottom,#1c2d38_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-medium text-white tracking-tight leading-tight select-none">
                  Your emergency<br />command center.
                </h2>
                <p className="text-muted-dark text-xs md:text-sm mt-3 leading-relaxed">
                  Coordinate crisis responses, optimize resource distribution, and deploy real-time intelligence for swift, data-driven emergency management.
                </p>
              </div>

              {/* Bullet Features with Category Accent encoding */}
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-[#0b2734] border border-hairline-dark flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-brand-green" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Real-time Geospatial Mapping</h4>
                    <p className="text-[11px] text-muted-dark/80 mt-0.5">Visualize and track crisis locations and assets instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-[#0b2734] border border-hairline-dark flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-brand-green" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">AI-powered Insights</h4>
                    <p className="text-[11px] text-muted-dark/80 mt-0.5">Automate resource analysis and smart predictive forecasting.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-[#0b2734] border border-hairline-dark flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-brand-green" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Multi-agency Coordination</h4>
                    <p className="text-[11px] text-muted-dark/80 mt-0.5">Seamless situational sharing across all responding teams.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-[#0b2734] border border-hairline-dark flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-brand-green" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Incident Intake & Tracking</h4>
                    <p className="text-[11px] text-muted-dark/80 mt-0.5">Rapid data logging for dispatch centers and field operators.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Pane - Rich dark documentation/interaction surface */}
          <div className="w-full md:w-1/2 bg-[#0a202c] p-8 md:p-10 flex flex-col justify-center text-left">
            <div className="mb-6">
              <h1 className="text-2xl font-medium text-white tracking-tight">Welcome back</h1>
              <p className="text-xs text-muted-dark mt-1">Sign in to access your emergency dashboard.</p>
            </div>

            {errors.form ? (
              <div 
                className="p-3 mb-4 text-xs bg-red-950/40 border border-red-900/60 text-red-400 rounded font-sans"
                role="alert"
              >
                {errors.form}
              </div>
            ) : null}

            {/* Google Sign In Button - Outlined on Dark style matching button-secondary-on-dark */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-11 rounded-full border border-hairline-dark bg-transparent hover:bg-[#122c3b]/40 text-white text-xs font-bold transition-all duration-150 ease-out hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-5 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hairline-dark"></div>
              </div>
              <span className="relative bg-[#0a202c] px-3 text-[10px] text-muted-dark/50 font-medium uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              
              {/* Email Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <label htmlFor="email" className="text-[11px] font-bold text-muted-dark tracking-wider">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-dark/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="responder@agency.org"
                    required
                    autoComplete="username"
                    className={`w-full h-11 pl-10 pr-4 rounded-md bg-[#001e2b] border text-white placeholder-muted-dark/30 text-xs focus:outline-none transition-all duration-150 ${
                      errors.email
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                        : 'border-hairline-dark focus:border-brand-green focus:ring-1 focus:ring-brand-green/20'
                    }`}
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] text-red-400 font-medium mt-0.5">{errors.email}</span>
                )}
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[11px] font-bold text-muted-dark tracking-wider">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-[10px] font-bold text-brand-green hover:text-brand-green-dark transition-colors duration-150"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-dark/60">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    autoComplete="current-password"
                    className={`w-full h-11 pl-10 pr-10 rounded-md bg-[#001e2b] border text-white placeholder-muted-dark/30 text-xs focus:outline-none transition-all duration-150 ${
                      errors.password
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                        : 'border-hairline-dark focus:border-brand-green focus:ring-1 focus:ring-brand-green/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-dark hover:text-white focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[10px] text-red-400 font-medium mt-0.5">{errors.password}</span>
                )}
              </div>

              {/* Submit Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-brand-green hover:bg-brand-green-dark text-brand-teal-deep text-xs font-bold tracking-wide transition-all duration-150 ease-out hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-brand-teal-deep border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-xs text-muted-dark">
                Don't have an account?{' '}
                <Link to="/login" className="font-bold text-brand-green hover:text-brand-green-dark transition-colors duration-150">
                  Sign up for free
                </Link>
              </span>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  )
}
