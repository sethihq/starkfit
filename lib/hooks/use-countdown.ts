'use client'

/**
 * Countdown timer hook
 *
 * Returns time remaining until a target timestamp,
 * updating every second.
 */

import { useEffect, useState } from 'react'

interface CountdownResult {
  hours: number
  minutes: number
  seconds: number
  formatted: string
}

function calculateRemaining(targetTimestamp: number): CountdownResult {
  const diff = Math.max(0, targetTimestamp - Date.now())

  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number): string => String(n).padStart(2, '0')
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`

  return { hours, minutes, seconds, formatted }
}

export function useCountdown(targetTimestamp: number): CountdownResult {
  const [remaining, setRemaining] = useState(() =>
    calculateRemaining(targetTimestamp),
  )

  useEffect(() => {
    setRemaining(calculateRemaining(targetTimestamp))

    const interval = setInterval(() => {
      const next = calculateRemaining(targetTimestamp)
      setRemaining(next)

      if (next.hours === 0 && next.minutes === 0 && next.seconds === 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [targetTimestamp])

  return remaining
}
