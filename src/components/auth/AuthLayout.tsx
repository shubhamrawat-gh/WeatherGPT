import React from 'react'

interface AuthLayoutProps {
  children: React.ReactNode
  maxWidthClass?: string
}

export default function AuthLayout({ children, maxWidthClass = 'max-w-md' }: AuthLayoutProps) {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c2d38_1px,transparent_1px),linear-gradient(to_bottom,#1c2d38_1px,transparent_1px)] bg-[size:32px_32px] opacity-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Subtle background glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-green/2.5 blur-3xl pointer-events-none -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-brand-teal/10 blur-3xl pointer-events-none -bottom-40 -right-40" />

      {/* Inner Centered Content */}
      <div className={`w-full ${maxWidthClass} relative z-10`}>
        {children}
      </div>
    </div>
  )
}

