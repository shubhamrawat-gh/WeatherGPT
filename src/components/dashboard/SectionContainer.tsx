import React from 'react'

interface SectionContainerProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export default function SectionContainer({
  children,
  title,
  className = '',
}: SectionContainerProps) {
  return (
    <div className={`flex flex-col gap-4 w-full text-left ${className}`}>
      {title ? (
        <h2 className="font-mono text-xs tracking-widest text-brand-green uppercase select-none">
          {title}
        </h2>
      ) : null}
      <div className="w-full">
        {children}
      </div>
    </div>
  )
}
