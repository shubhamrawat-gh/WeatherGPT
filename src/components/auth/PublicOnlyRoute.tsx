import type { ReactNode } from 'react'

interface PublicOnlyRouteProps {
  children: ReactNode
}

export default function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  return <>{children}</>
}
