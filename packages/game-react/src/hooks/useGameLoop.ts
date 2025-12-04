import { useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../stores/gameStore'

const CYCLE_DURATION = 2000 // 2 seconds for full cycle

export function useGameLoop() {
  const frameIdRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const { isPlaying, updatePosition } = useGameStore()

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp
    }

    const elapsed = timestamp - startTimeRef.current
    const progress = (elapsed % CYCLE_DURATION) / CYCLE_DURATION
    
    // Sine wave for smooth oscillation
    const position = 50 + 50 * Math.sin(progress * Math.PI * 2)
    
    updatePosition(position)

    frameIdRef.current = requestAnimationFrame(animate)
  }, [updatePosition])

  const start = useCallback(() => {
    startTimeRef.current = 0
    frameIdRef.current = requestAnimationFrame(animate)
  }, [animate])

  const stop = useCallback(() => {
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current)
      frameIdRef.current = null
    }
  }, [])

  // Start/stop based on isPlaying state
  useEffect(() => {
    if (isPlaying) {
      start()
    } else {
      stop()
    }

    return () => {
      stop()
    }
  }, [isPlaying, start, stop])

  return { start, stop }
}