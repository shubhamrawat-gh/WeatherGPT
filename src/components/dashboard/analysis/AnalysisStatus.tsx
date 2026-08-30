interface AnalysisStatusProps {
  status: 'queued' | 'processing' | 'completed' | 'failed'
  className?: string
}

export default function AnalysisStatus({ status, className = '' }: AnalysisStatusProps) {
  const configs = {
    queued: {
      label: 'IN QUEUE',
      bg: 'bg-yellow-950/20 border-yellow-700/30 text-yellow-400',
      dot: 'bg-yellow-400'
    },
    processing: {
      label: 'PROCESSING',
      bg: 'bg-blue-950/25 border-blue-800/30 text-blue-400',
      dot: 'bg-blue-400 animate-pulse'
    },
    completed: {
      label: 'COMPLETED',
      bg: 'bg-brand-green/5 border-brand-green/20 text-brand-green',
      dot: 'bg-brand-green'
    },
    failed: {
      label: 'FAILED',
      bg: 'bg-red-950/20 border-red-900/30 text-red-400',
      dot: 'bg-red-400'
    }
  }

  const active = configs[status] || configs.queued

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-mono font-bold tracking-wider rounded border uppercase select-none ${active.bg} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active.dot}`} />
      {active.label}
    </span>
  )
}
