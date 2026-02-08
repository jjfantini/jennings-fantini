import { useCallback, useRef } from 'react'

type TouchPoint = {
  x: number
  y: number
  time: number
}

type UseTouchGesturesOptions = {
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
  onDoubleTap?: () => void
  swipeThreshold?: number
  tapThresholdMs?: number
  doubleTapThresholdMs?: number
}

export const useTouchGestures = (options: UseTouchGesturesOptions) => {
  const {
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
    onTap,
    onDoubleTap,
    swipeThreshold = 20,
    tapThresholdMs = 250,
    doubleTapThresholdMs = 300
  } = options

  const startRef = useRef<TouchPoint | null>(null)
  const lastTapRef = useRef<number>(0)

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0]
    startRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
  }, [])

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!startRef.current) return
      const touch = event.touches[0]
      const diffX = touch.clientX - startRef.current.x
      const diffY = touch.clientY - startRef.current.y

      if (Math.abs(diffX) < swipeThreshold && Math.abs(diffY) < swipeThreshold) return

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) onSwipeRight?.()
        if (diffX < 0) onSwipeLeft?.()
      } else {
        if (diffY > 0) onSwipeDown?.()
        if (diffY < 0) onSwipeUp?.()
      }

      startRef.current = { x: touch.clientX, y: touch.clientY, time: startRef.current.time }
    },
    [onSwipeDown, onSwipeLeft, onSwipeRight, onSwipeUp, swipeThreshold]
  )

  const handleTouchEnd = useCallback(() => {
    if (!startRef.current) return
    const touchDuration = Date.now() - startRef.current.time
    if (touchDuration <= tapThresholdMs) {
      const now = Date.now()
      const timeSinceLastTap = now - lastTapRef.current
      if (timeSinceLastTap <= doubleTapThresholdMs) {
        onDoubleTap?.()
        lastTapRef.current = 0
      } else {
        onTap?.()
        lastTapRef.current = now
      }
    }
    startRef.current = null
  }, [doubleTapThresholdMs, onDoubleTap, onTap, tapThresholdMs])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  }
}
