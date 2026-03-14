'use client'

/**
 * Step counting simulator hook
 *
 * Runs a setInterval that increments a participant's step count
 * by a random amount every 2 seconds. Used during live demo.
 */

import { useEffect } from 'react'
import { useChallengeStore } from '@/hooks/use-challenge-store'

export function useStepSimulator(
  challengeId: string,
  participantId: string,
  enabled: boolean
): void {
  const updateSteps = useChallengeStore((state) => state.updateSteps)

  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      const steps = Math.floor(Math.random() * 151) + 50 // 50-200
      updateSteps(challengeId, participantId, steps)
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [challengeId, participantId, enabled, updateSteps])
}
