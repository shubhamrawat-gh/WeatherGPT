import React from 'react'

interface FormFieldProps {
  label: string
  id: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export default function FormField({
  label,
  id,
  error,
  required = false,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2 w-full text-left font-sans select-none">
      <label
        htmlFor={id}
        className="text-xs font-semibold text-muted-dark uppercase tracking-wider flex items-center gap-1"
      >
        {label}
        {required ? (
          <span className="text-red-500 font-bold" aria-hidden="true">*</span>
        ) : null}
      </label>

      <div className="relative w-full">
        {children}
      </div>

      {error ? (
        <span
          id={`${id}-error`}
          className="text-xs text-red-400 font-mono tracking-wide mt-0.5"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  )
}
