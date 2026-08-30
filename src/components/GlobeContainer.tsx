import { lazy, Suspense, forwardRef, useImperativeHandle, useRef } from 'react'

const Globe3D = lazy(() => import('./Globe3D'))

export interface GlobeContainerRef {
  getGlobeInstance: () => any
}

interface GlobeContainerProps {
  onCountrySelect?: (country: any) => void
  onCountryHover?: (country: any) => void
  incidents?: any[]
  resources?: any[]
  hotspots?: any[]
  showIncidents?: boolean
  showResources?: boolean
  showHotspots?: boolean
  interactive?: boolean
  autoRotate?: boolean
  cameraResetTrigger?: number
  disableRegionHover?: boolean
}

const GlobeContainer = forwardRef<GlobeContainerRef, GlobeContainerProps & { disableTelemetry?: boolean }>((props, ref) => {
  const globe3DRef = useRef<any>(null)

  useImperativeHandle(ref, () => ({
    getGlobeInstance: () => globe3DRef.current?.getGlobeInstance()
  }))

  return (
    <div className="w-full h-full relative aspect-square mx-auto flex items-center justify-center min-h-[300px]" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
      {/* Background atmospheric glow (multi-layered, animated) */}
      <div className="absolute w-[85%] h-[85%] rounded-full bg-[radial-gradient(circle,rgba(0,237,100,0.12)_0%,rgba(0,104,74,0.04)_50%,transparent_70%)] blur-2xl pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute w-[75%] h-[75%] rounded-full bg-[radial-gradient(circle,rgba(0,237,100,0.08)_0%,rgba(0,61,79,0.03)_60%,transparent_80%)] blur-xl pointer-events-none" />

      <Suspense fallback={
        <div className="relative w-full h-full flex flex-col items-center justify-center select-none font-mono text-[9px] text-muted-dark tracking-widest uppercase">
          {/* Wireframe grids placeholder matching the console aesthetic */}
          <div className="absolute inset-0 rounded-full border border-brand-green/15" />
          <div className="absolute w-[90%] h-[90%] rounded-full border border-dashed border-brand-green/10 animate-pulse" />
          <div className="absolute w-[80%] h-[80%] rounded-full border border-brand-green/10" />
          <div className="absolute w-[60%] h-[60%] rounded-full border border-dashed border-brand-green/5" />
          
          <div className="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-[9px] text-brand-green/85">Loading 3D Staging...</span>
        </div>
      }>
        <Globe3D ref={globe3DRef} {...props} />
      </Suspense>
    </div>
  )
})

export default GlobeContainer
