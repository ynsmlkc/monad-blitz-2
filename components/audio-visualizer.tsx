"use client"

import { useEffect, useRef } from "react"

interface AudioVisualizerProps {
  isActive: boolean
  audioLevel: number
}

export default function AudioVisualizer({ isActive, audioLevel }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const barsRef = useRef<number[]>([])

  const BAR_COUNT = 40
  const BAR_WIDTH = 4
  const BAR_GAP = 6
  const MIN_HEIGHT = 4
  const MAX_HEIGHT = 120

  useEffect(() => {
    // Initialize bars with random heights
    if (barsRef.current.length === 0) {
      barsRef.current = Array(BAR_COUNT)
        .fill(0)
        .map(() => MIN_HEIGHT)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height)

      const totalWidth = BAR_COUNT * (BAR_WIDTH + BAR_GAP) - BAR_GAP
      const startX = (rect.width - totalWidth) / 2

      barsRef.current.forEach((height, index) => {
        const x = startX + index * (BAR_WIDTH + BAR_GAP)
        const y = (rect.height - height) / 2

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, y + height)

        if (isActive) {
          // Blue gradient when active
          gradient.addColorStop(0, "oklch(0.75 0.22 240)")
          gradient.addColorStop(0.5, "oklch(0.65 0.22 240)")
          gradient.addColorStop(1, "oklch(0.55 0.18 240)")
        } else {
          // Muted gradient when inactive
          gradient.addColorStop(0, "oklch(0.85 0.05 240)")
          gradient.addColorStop(0.5, "oklch(0.75 0.05 240)")
          gradient.addColorStop(1, "oklch(0.65 0.05 240)")
        }

        ctx.fillStyle = gradient
        ctx.fillRect(x, y, BAR_WIDTH, height)
      })

      // Update bar heights
      barsRef.current = barsRef.current.map((currentHeight, index) => {
        if (isActive) {
          // When recording, animate based on audio level
          const targetHeight = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * audioLevel * (0.5 + Math.random() * 0.5)
          const speed = 0.3
          return currentHeight + (targetHeight - currentHeight) * speed
        } else {
          // When not recording, slowly return to minimum
          const speed = 0.1
          return currentHeight + (MIN_HEIGHT - currentHeight) * speed
        }
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, audioLevel])

  return (
    <div className="relative w-full max-w-xl">
      <canvas ref={canvasRef} className="w-full h-[200px]" style={{ width: "100%", height: "200px" }} />

      {isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-primary/5 rounded-lg blur-3xl animate-pulse" />
        </div>
      )}
    </div>
  )
}
