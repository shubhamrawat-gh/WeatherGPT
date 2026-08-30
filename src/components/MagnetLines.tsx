import { useRef, useEffect, useState } from 'react'
import './MagnetLines.css'

interface MagnetLinesProps {
  rows?: number
  columns?: number
  containerSize?: string
  lineColor?: string
  lineWidth?: string
  lineHeight?: string
  baseAngle?: number
  className?: string
  style?: React.CSSProperties
}

export default function MagnetLines({
  rows = 9,
  columns = 9,
  containerSize = '80vmin',
  lineColor = '#efefef',
  lineWidth = '1vmin',
  lineHeight = '6vmin',
  baseAngle = -10,
  className = '',
  style = {},
}: MagnetLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const coordsRef = useRef<{ x: number; y: number }[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Observe visibility to avoid tracking pointer events when offscreen
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.02 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Cache coordinates relative to the page document
  useEffect(() => {
    if (!isVisible) return

    const updateCoords = () => {
      const container = containerRef.current
      if (!container) return
      const items = container.querySelectorAll<HTMLSpanElement>('span')
      const coords: { x: number; y: number }[] = []

      items.forEach((item) => {
        const rect = item.getBoundingClientRect()
        coords.push({
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY + rect.height / 2,
        })
      })
      coordsRef.current = coords
    }

    // Small timeout to allow layout settlement
    const timer = setTimeout(updateCoords, 100)

    window.addEventListener('resize', updateCoords)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateCoords)
    }
  }, [isVisible, rows, columns])

  // Track pointer movements using cached coordinates
  useEffect(() => {
    if (!isVisible) return

    const container = containerRef.current
    if (!container) return

    const items = container.querySelectorAll<HTMLSpanElement>('span')

    const onPointerMove = (e: { pageX: number; pageY: number }) => {
      const pointerX = e.pageX
      const pointerY = e.pageY
      const coords = coordsRef.current

      if (coords.length !== items.length) return

      items.forEach((item, idx) => {
        const { x: centerX, y: centerY } = coords[idx]

        const b = pointerX - centerX
        const a = pointerY - centerY
        const c = Math.sqrt(a * a + b * b) || 1
        const r =
          ((Math.acos(b / c) * 180) / Math.PI) * (pointerY > centerY ? 1 : -1)

        item.style.setProperty('--rotate', `${r}deg`)
      })
    }

    const handlePointerMove = (e: PointerEvent) => {
      onPointerMove({ pageX: e.pageX, pageY: e.pageY })
    }

    window.addEventListener('pointermove', handlePointerMove)

    if (items.length && coordsRef.current.length === items.length) {
      const middleIndex = Math.floor(items.length / 2)
      const centerCoord = coordsRef.current[middleIndex]
      onPointerMove({ pageX: centerCoord.x, pageY: centerCoord.y })
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [isVisible, rows, columns])

  const total = rows * columns
  const spans = Array.from({ length: total }, (_, i) => (
    <span
      key={i}
      style={
        {
          '--rotate': `${baseAngle}deg`,
          backgroundColor: lineColor,
          width: lineWidth,
          height: lineHeight,
        } as React.CSSProperties
      }
    />
  ))

  return (
    <div
      ref={containerRef}
      className={`magnetLines-container ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        width: containerSize,
        height: containerSize,
        ...style,
      }}
    >
      {spans}
    </div>
  )
}
