import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-canvas-dark transition-colors duration-300">
        <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" role="status" aria-label="Loading" />
      </div>
    )
  }

  if (!user) {
    // Redirect to login, but preserve the attempted route location in state
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
