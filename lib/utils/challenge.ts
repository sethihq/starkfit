/**
 * Challenge calculation utilities
 */

import type { Challenge, Participant } from '@/hooks/use-challenge-store'

export function calculatePrizePool(challenge: Challenge): number {
  return challenge.stakeAmount * challenge.participants.length
}

export function calculateWinnerPrize(challenge: Challenge): number {
  const pool = calculatePrizePool(challenge)
  const active = getActiveParticipants(challenge)
  const activeCount = active.length

  if (activeCount === 0) return 0

  // Total pool + accumulated yield split among survivors
  return (pool + challenge.yieldGenerated) / activeCount
}

export function getActiveParticipants(challenge: Challenge): Participant[] {
  return challenge.participants.filter((p) => p.status === 'active')
}

export function getEliminatedParticipants(challenge: Challenge): Participant[] {
  return challenge.participants.filter((p) => p.status === 'eliminated')
}

export function isEliminated(participant: Participant): boolean {
  return participant.status === 'eliminated'
}

export function getDayNumber(challenge: Challenge): number {
  if (challenge.status === 'upcoming') return 0
  if (challenge.status === 'completed') return challenge.duration
  return challenge.currentDay
}

export function getProgress(steps: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(100, Math.round((steps / target) * 100))
}
