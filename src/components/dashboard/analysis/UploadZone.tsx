import { useState, useRef } from 'react'
import type { DragEvent } from 'react'
import { UploadCloud, File, Trash2, ShieldAlert } from 'lucide-react'

interface UploadZoneProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

export default function UploadZone({ files, onFilesChange }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      onFilesChange([...files, ...droppedFiles])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files)
      onFilesChange([...files, ...selectedFiles])
    }
  }

  const removeFile = (indexToRemove: number) => {
    onFilesChange(files.filter((_, idx) => idx !== indexToRemove))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeLabel = (type: string) => {
    if (type.includes('image')) {
      if (type.includes('tiff') || type.includes('geotiff')) return 'Satellite GeoTIFF'
      return 'Incident Photograph'
    }
    if (type.includes('pdf') || type.includes('document')) return 'Document Report'
    return 'Data Feed File'
  }

  return (
    <div className="flex flex-col gap-5 select-none w-full text-left">
      {/* Dashed drop area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-xl border border-dashed transition-all duration-200 cursor-pointer ${
          isDragActive
            ? 'bg-brand-green/5 border-brand-green'
            : 'bg-surface-dark/15 border-hairline-dark hover:border-hairline-dark-strong/80 hover:bg-surface-dark/25'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.tif,.tiff,.pdf,.json"
          aria-label="Upload file picker"
        />
        
        <div className="w-10 h-10 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green mb-4">
          <UploadCloud className="w-5 h-5" />
        </div>

        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
          Drag &amp; Drop Disaster Imagery
        </h4>
        <p className="text-[10px] text-muted-dark/85 max-w-xs leading-normal m-0 mb-4">
          Support formats: Satellite Orthophotos (GeoTIFF), Drone imagery, high-resolution JPGs/PNGs, or local PDF hazard logs.
        </p>

        <span className="text-[10px] font-mono font-bold text-brand-green uppercase tracking-widest px-3 py-1 bg-brand-teal-deep/80 border border-brand-green/20 rounded-full">
          Select Files
        </span>
      </div>

      {/* Uploaded files queue */}
      {files.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
            Staged Files Ingestion Queue ({files.length})
          </span>
          
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3 rounded-lg border border-hairline-dark/45 bg-surface-dark/20 text-xs text-white"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-7 h-7 rounded bg-brand-teal-deep/50 border border-hairline-dark/70 flex items-center justify-center text-brand-green shrink-0">
                    <File className="w-4 h-4" />
                  </div>
                  
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="font-sans font-semibold truncate">
                      {file.name}
                    </span>
                    <span className="font-mono text-[9px] text-muted-dark/80">
                      {formatFileSize(file.size)} | {getFileTypeLabel(file.type)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(idx)
                  }}
                  className="w-8 h-8 rounded border border-hairline-dark hover:border-red-900/40 text-muted-dark hover:text-red-400 hover:bg-red-950/20 flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none"
                  aria-label={`Remove file ${file.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-surface-dark/40 border border-hairline-dark/30 flex gap-3 items-center text-[10px] text-muted-dark font-sans">
          <ShieldAlert className="w-4 h-4 text-brand-green shrink-0" />
          <span>No disaster datasets staged. Select files to construct the ingestion boundary parameters.</span>
        </div>
      )}
    </div>
  )
}
