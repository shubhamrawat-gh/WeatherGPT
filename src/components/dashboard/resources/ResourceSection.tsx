import React from 'react'

interface ResourceSectionProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function ResourceSection({
  children,
  title,
  subtitle,
  action
}: ResourceSectionProps) {
  return (
    <div className="flex flex-col gap-4 w-full text-left font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-hairline-dark/20 pb-2.5">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-mono text-xs tracking-widest text-brand-green uppercase select-none m-0">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-[10px] text-muted-dark leading-normal m-0 select-none">
              {subtitle}
            </p>
          ) : null}
        </div>
        
        {action ? (
          <div className="flex items-center gap-2 shrink-0">
            {action}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="w-full">
        {children}
      </div>

    </div>
  )
}
