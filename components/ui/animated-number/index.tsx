'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number
  formatFn?: (n: number) => string
  className?: string
}

function defaultFormat(n: number): string {
  return String(Math.round(n))
}

export function AnimatedNumber({
  value,
  duration = 500,
  formatFn = defaultFormat,
  className,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(value)
  const previousRef = useRef(value)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const from = previousRef.current
    const to = value
    const diff = to - from

    if (diff === 0) return

    const start = performance.now()

    function step(now: number) {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - (1 - t) ** 3
      const current = from + diff * eased

      setDisplay(current)

      if (t < 1) {
        frameRef.current = requestAnimationFrame(step)
      } else {
        previousRef.current = to
      }
    }

    frameRef.current = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatFn(display)}
    </span>
  )
}
