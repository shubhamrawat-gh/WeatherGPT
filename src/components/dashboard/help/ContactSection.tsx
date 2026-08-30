import FormField from '../incidents/FormField'

interface ContactSectionProps {
  fullName: string
  setFullName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  email: string
  setEmail: (v: string) => void
  organization: string
  setOrganization: (v: string) => void
  errors: Record<string, string>
}

export default function ContactSection({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  organization,
  setOrganization,
  errors,
}: ContactSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Full Name" id="help-fullname" error={errors.fullName} required>
          <input
            id="help-fullname"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. John Doe"
            className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
              errors.fullName
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
            }`}
          />
        </FormField>

        <FormField label="Phone Number" id="help-phone" error={errors.phone} required>
          <input
            id="help-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +1 555 123 4567"
            className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
              errors.phone
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
            }`}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Email Address" id="help-email" error={errors.email} required>
          <input
            id="help-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. john.doe@example.com"
            className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
              errors.email
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
            }`}
          />
        </FormField>

        <FormField label="Organization (Optional)" id="help-org">
          <input
            id="help-org"
            type="text"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="e.g. Red Cross / Independent"
            className="w-full h-12 px-4 rounded-lg bg-surface-dark border border-hairline-dark focus:border-brand-green focus:ring-brand-green/35 text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200"
          />
        </FormField>
      </div>
    </div>
  )
}
