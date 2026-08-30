import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-hairline-dark/40 mb-6">
      <div className="flex flex-col gap-1.5 text-left">
        <h1 className="text-xl font-bold tracking-tight text-white m-0 select-none">
          {title}
        </h1>
        {description ? (
          <p className="text-xs text-muted-dark leading-relaxed m-0 max-w-2xl select-none">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex items-center gap-3">
          {action}
        </div>
      ) : null}
    </div>
  )
}
