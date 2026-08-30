import { useState, useRef } from 'react'
import { UploadCloud, Image, FileVideo, X } from 'lucide-react'

interface UploadZoneProps {
  files: File[]
  onFilesChange: (files: File[]) => void
}

export default function UploadZone({ files, onFilesChange }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const processFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const validFiles: File[] = []
    
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      // Accept images and future video formats
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        validFiles.push(file)
      }
    }

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    processFiles(e.dataTransfer.files)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files)
  }

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToRemove)
    onFilesChange(updatedFiles)
  }

  const triggerInputClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-4 w-full text-left">
      <span className="text-xs font-semibold text-muted-dark uppercase tracking-wider select-none">
        Upload Evidence
      </span>

      {/* Drag & Drop Area */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerInputClick}
        className={`w-full min-h-[220px] rounded-xl border border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 bg-surface-dark/10 ${
          isDragActive
            ? 'border-brand-green bg-brand-green/5 shadow-lg shadow-brand-green/5'
            : 'border-hairline-dark hover:border-brand-green/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleChange}
          className="hidden"
          aria-label="Upload incident evidence"
        />

        <div className="w-10 h-10 rounded-lg bg-brand-green/5 border border-brand-green/20 flex items-center justify-center text-brand-green mb-4">
          <UploadCloud className="w-5 h-5" aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold text-white m-0">
          Drag and drop your files here
        </p>
        <p className="text-xs text-muted-dark leading-relaxed mt-2 max-w-xs m-0">
          Accepts disaster screenshots or drone footage (Images and Videos). Max file size 50MB.
        </p>
      </div>

      {/* File List Preview */}
      {files.length > 0 ? (
        <div className="flex flex-col gap-2 mt-2">
          <span className="text-[10px] font-mono tracking-widest text-muted-dark uppercase select-none">
            Selected Files ({files.length})
          </span>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {files.map((file, index) => {
              const isVideo = file.type.startsWith('video/')
              const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2)

              return (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-hairline-dark/50 bg-canvas-dark/40 text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5 text-muted-dark min-w-0">
                    {isVideo ? (
                      <FileVideo className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
                    ) : (
                      <Image className="w-4 h-4 text-brand-green shrink-0" aria-hidden="true" />
                    )}
                    <span className="text-white truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                    <span className="opacity-60 shrink-0">({fileSizeMB} MB)</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFile(index)
                    }}
                    className="text-muted-dark hover:text-white transition-colors duration-200 focus:outline-none p-1"
                    aria-label={`Remove file ${file.name}`}
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
