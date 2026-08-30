import type { ReactNode } from 'react'

interface MapSectionProps {
  map: ReactNode
  panel: ReactNode
}

export default function MapSection({ map, panel }: MapSectionProps) {
  return (
    <div className="flex flex-col lg:flex-row w-full flex-grow overflow-hidden relative min-h-0">
      {/* Side Control Panel */}
      <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-hairline-dark/45 bg-canvas-dark/40 backdrop-blur-sm flex flex-col overflow-y-auto shrink-0 min-h-0 max-h-[40vh] lg:max-h-none">
        <div className="p-5 flex flex-col gap-4">
          {panel}
        </div>
      </div>

      {/* Map Viewport */}
      <div className="flex-grow relative min-h-[400px] lg:min-h-0 h-full">
        {map}
      </div>
    </div>
  )
}
