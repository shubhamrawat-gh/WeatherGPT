import { MapPin, UploadCloud, Info } from 'lucide-react'

interface ReviewPanelProps {
  data: {
    title: string
    type: string
    severity: string
    description: string
    country: string
    region: string
    coordinates: string
  }
  files: File[]
}

export default function ReviewPanel({ data, files }: ReviewPanelProps) {
  const fileNames = files.map(f => f.name)

  return (
    <div className="flex flex-col gap-6 w-full text-left select-none">
      
      {/* 1. Incident Info Summary */}
      <div className="flex flex-col gap-3.5 p-4 rounded-xl border border-hairline-dark/45 bg-surface-dark/10">
        <div className="flex items-center gap-2 text-brand-green pb-2 border-b border-hairline-dark/20">
          <Info className="w-4 h-4" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Incident Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-muted-dark block mb-1">Title</span>
            <span className="text-white font-sans font-medium text-sm">{data.title || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-dark block mb-1">Type</span>
            <span className="text-white font-sans font-medium text-sm">{data.type || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-dark block mb-1">Severity Level</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              data.severity === 'Critical'
                ? 'bg-red-950/65 border border-red-900/60 text-red-400'
                : data.severity === 'High'
                ? 'bg-orange-950/65 border border-orange-900/60 text-orange-400'
                : data.severity === 'Medium'
                ? 'bg-yellow-950/65 border border-yellow-900/60 text-yellow-400'
                : 'bg-green-950/65 border border-green-900/60 text-green-400'
            }`}>
              {data.severity.toUpperCase()}
            </span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-dark block mb-1">Operational Description</span>
            <p className="text-white font-sans leading-relaxed m-0 text-xs">
              {data.description || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Location details Summary */}
      <div className="flex flex-col gap-3.5 p-4 rounded-xl border border-hairline-dark/45 bg-surface-dark/10">
        <div className="flex items-center gap-2 text-brand-green pb-2 border-b border-hairline-dark/20">
          <MapPin className="w-4 h-4" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Geospatial Bounds</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div>
            <span className="text-muted-dark block mb-1">Country</span>
            <span className="text-white font-sans font-medium">{data.country || 'N/A'}</span>
          </div>
          <div>
            <span className="text-muted-dark block mb-1">Region / Province</span>
            <span className="text-white font-sans font-medium">{data.region || 'N/A'}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-dark block mb-1">GPS Coordinates</span>
            <span className="text-brand-green font-mono">{data.coordinates || 'Pending target selection'}</span>
          </div>
        </div>
      </div>

      {/* 3. Evidence files Summary */}
      <div className="flex flex-col gap-3.5 p-4 rounded-xl border border-hairline-dark/45 bg-surface-dark/10">
        <div className="flex items-center gap-2 text-brand-green pb-2 border-b border-hairline-dark/20">
          <UploadCloud className="w-4 h-4" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Media Evidence</span>
        </div>

        <div className="text-xs font-mono">
          {files.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
              {fileNames.map((name, index) => (
                <div key={`${name}-${index}`} className="flex items-center gap-2 text-white">
                  <span className="text-brand-green font-bold">&bull;</span>
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-muted-dark">No files attached. Operational assessments will proceed without imagery.</span>
          )}
        </div>
      </div>

    </div>
  )
}
