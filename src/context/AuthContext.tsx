import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../services/firebase'

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL?: string | null
  role?: string
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  loginAsDemo: (customEmail?: string, customName?: string) => void
  logout: () => Promise<void>
}

const DEFAULT_DEMO_USER: AuthUser = {
  uid: 'ner-ops-commander-01',
  email: 'demo@weathergpt.ai',
  displayName: 'WeatherGPT Specialist',
  photoURL: null,
  role: 'MDoNER Logistics Operations Director',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Check if there is an active saved session in localStorage
    try {
      const saved = localStorage.getItem('weathergpt_auth_session')
      if (saved) {
        return JSON.parse(saved)
      }
    } catch {
      // ignore
    }
    // Default to authenticated demo operator so all routes work out of the box
    return DEFAULT_DEMO_USER
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    // Listen to Firebase Auth state change if configured
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          const authUser: AuthUser = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'WeatherGPT Specialist',
            photoURL: currentUser.photoURL,
          }
          if (mounted) {
            setUser(authUser)
            try {
              localStorage.setItem('weathergpt_auth_session', JSON.stringify(authUser))
            } catch {}
          }
        }
      })
      return () => {
        mounted = false
        unsubscribe()
      }
    } catch (e) {
      console.warn('Firebase onAuthStateChanged offline fallback:', e)
    }
  }, [])

  const loginAsDemo = (customEmail?: string, customName?: string) => {
    const demoUser: AuthUser = {
      uid: 'demo-' + Math.random().toString(36).substring(2, 9),
      email: customEmail || 'demo@weathergpt.ai',
      displayName: customName || 'WeatherGPT Specialist',
      photoURL: null,
    }
    setUser(demoUser)
    try {
      localStorage.setItem('weathergpt_auth_session', JSON.stringify(demoUser))
    } catch {}
  }

  const logout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
    } catch (error) {
      console.warn('Firebase logout notice:', error)
    } finally {
      setUser(null)
      try {
        localStorage.removeItem('weathergpt_auth_session')
      } catch {}
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginAsDemo, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
