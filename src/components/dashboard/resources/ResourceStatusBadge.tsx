import type { ResourceAvailability, ResourceVerification } from '../../../services/resource'

interface ResourceStatusBadgeProps {
  type: 'availability' | 'verification'
  value: ResourceAvailability | ResourceVerification
}

export default function ResourceStatusBadge({ type, value }: ResourceStatusBadgeProps) {
  const styles = {
    // Availability States
    available: 'bg-brand-green/10 border-brand-green/25 text-brand-green',
    limited: 'bg-yellow-950/30 border-yellow-800/35 text-yellow-500',
    critical: 'bg-red-950/30 border-red-800/35 text-red-400',
    inactive: 'bg-surface-dark/40 border-hairline-dark/40 text-muted-dark',
    
    // Verification States
    verified: 'bg-brand-green/15 border-brand-green/30 text-brand-green',
    pending: 'bg-yellow-950/30 border-yellow-800/35 text-yellow-500',
    unverified: 'bg-red-950/30 border-red-800/35 text-red-400'
  }

  const label = value.toUpperCase()
  const activeClass = styles[value as keyof typeof styles] || styles.inactive

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border font-mono text-[8px] font-bold tracking-widest ${activeClass}`}>
      {type === 'verification' && value === 'verified' ? '✓ ' : ''}
      {label}
    </span>
  )
}
