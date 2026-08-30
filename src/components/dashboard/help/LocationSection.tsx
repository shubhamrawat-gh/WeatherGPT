import { MapPin } from 'lucide-react'
import FormField from '../incidents/FormField'

interface LocationSectionProps {
  country: string
  setCountry: (v: string) => void
  region: string
  setRegion: (v: string) => void
  area: string
  setArea: (v: string) => void
  coordinates: string
  setCoordinates: (v: string) => void
  errors: Record<string, string>
}

export default function LocationSection({
  country,
  setCountry,
  region,
  setRegion,
  area,
  setArea,
  coordinates,
  setCoordinates,
  errors,
}: LocationSectionProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Country" id="help-country" error={errors.country} required>
          <input
            id="help-country"
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. Bangladesh"
            className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
              errors.country
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
            }`}
          />
        </FormField>

        <FormField label="Region / State / Province" id="help-region" error={errors.region} required>
          <input
            id="help-region"
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="e.g. Sylhet Division"
            className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
              errors.region
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
            }`}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField label="Area / City / Neighborhood" id="help-area" error={errors.area} required>
          <input
            id="help-area"
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Companiganj Upazila"
            className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
              errors.area
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
            }`}
          />
        </FormField>

        <FormField label="GPS Coordinates (Optional)" id="help-coordinates" error={errors.coordinates}>
          <input
            id="help-coordinates"
            type="text"
            value={coordinates}
            onChange={(e) => setCoordinates(e.target.value)}
            placeholder="e.g. 25.0783, 91.8152"
            className={`w-full h-12 px-4 rounded-lg bg-surface-dark border text-white placeholder-muted-dark/40 text-sm focus:outline-none focus:ring-1 transition-all duration-200 ${
              errors.coordinates
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/35'
                : 'border-hairline-dark focus:border-brand-green focus:ring-brand-green/35'
            }`}
          />
        </FormField>
      </div>

      {/* Future Map Selection Placeholder */}
      <div className="rounded-xl border border-dashed border-hairline-dark/60 bg-surface-dark/5 p-6 text-center flex flex-col items-center justify-center gap-2.5 mt-4 select-none">
        <div className="w-9 h-9 rounded-lg bg-brand-green/5 border border-brand-green/10 flex items-center justify-center text-brand-green/60">
          <MapPin className="w-5 h-5 animate-pulse" />
        </div>
        <span className="text-xs font-semibold text-white font-sans">Geospatial Map Selection Pending</span>
        <p className="text-[11px] text-muted-dark/80 leading-relaxed max-w-sm m-0 font-sans">
          A visual map selector is planned for future coordination tools. Staging operations currently rely on text-bound location identifiers.
        </p>
      </div>
    </div>
  )
}
