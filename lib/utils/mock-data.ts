/**
 * Mock data factory for BTC Fitness Challenge
 *
 * Generates realistic seed data for hackathon demo.
 */

import type { Challenge, Participant } from '@/hooks/use-challenge-store'

const AVATARS = [
  '\u{1F525}',
  '\u{1F4AA}',
  '\u{1F3C3}',
  '\u{26A1}',
  '\u{1F60E}',
  '\u{1F3AF}',
  '\u{1F680}',
  '\u{1F31F}',
  '\u{1F9D7}',
  '\u{1F3CB}',
  '\u{1F947}',
  '\u{1F48E}',
]

const NAMES = [
  'Alex',
  'Jordan',
  'Casey',
  'Morgan',
  'Riley',
  'Taylor',
  'Avery',
  'Quinn',
  'Blake',
  'Drew',
  'Sage',
  'Reese',
]

function generateAddress(seed: number): string {
  const hex = '0123456789abcdef'
  let addr = '0x'
  for (let i = 0; i < 40; i++) {
    addr += hex[(seed * (i + 7) * 31) % 16]
  }
  return addr
}

function generateStepHistory(
  days: number,
  target: number,
  eliminatedOnDay: number | null
): number[] {
  const history: number[] = []

  for (let day = 0; day < days; day++) {
    if (eliminatedOnDay !== null && day >= eliminatedOnDay) {
      break
    }

    if (eliminatedOnDay !== null && day === eliminatedOnDay - 1) {
      // The day they failed - below target
      history.push(target - 2000 - Math.floor(Math.random() * 2000))
    } else {
      // Normal day - mostly above target with some variance
      const aboveTarget = Math.random() > 0.15
      if (aboveTarget) {
        history.push(target + Math.floor(Math.random() * 5000))
      } else {
        // Close to target but still above
        history.push(target + Math.floor(Math.random() * 500))
      }
    }
  }

  return history
}

function createParticipant(
  index: number,
  target: number,
  completedDays: number,
  eliminatedOnDay: number | null
): Participant {
  const history = generateStepHistory(completedDays, target, eliminatedOnDay)
  const isElim = eliminatedOnDay !== null
  const currentStreak = isElim
    ? 0
    : history.reduce((streak, steps) => {
        return steps >= target ? streak + 1 : 0
      }, 0)

  return {
    id: `participant-${index}`,
    name: NAMES[index % NAMES.length] ?? `User${index}`,
    address: generateAddress(index + 1),
    avatar: AVATARS[index % AVATARS.length] ?? '\u{1F525}',
    status: isElim ? 'eliminated' : 'active',
    currentStreak,
    eliminatedOnDay,
    todaySteps: isElim ? 0 : 3000 + Math.floor(Math.random() * 6000),
    stepHistory: history,
  }
}

function createChallenge(config: {
  id: string
  name: string
  stakeAmount: number
  dailyStepTarget: number
  duration: number
  maxParticipants: number
  status: 'upcoming' | 'active' | 'completed'
  currentDay: number
  participantCount: number
  eliminatedParticipants: Array<{ index: number; day: number }>
  yieldGenerated: number
}): Challenge {
  const now = Date.now()
  const dayMs = 86400000

  let startTimestamp: number
  let endTimestamp: number

  if (config.status === 'upcoming') {
    startTimestamp = now + 2 * dayMs
    endTimestamp = startTimestamp + config.duration * dayMs
  } else if (config.status === 'active') {
    startTimestamp = now - config.currentDay * dayMs
    endTimestamp = startTimestamp + config.duration * dayMs
  } else {
    // completed
    endTimestamp = now - 1 * dayMs
    startTimestamp = endTimestamp - config.duration * dayMs
  }

  const eliminatedMap = new Map(
    config.eliminatedParticipants.map((e) => [e.index, e.day])
  )

  const completedDays =
    config.status === 'completed' ? config.duration : config.currentDay

  const participants: Participant[] = []
  for (let i = 0; i < config.participantCount; i++) {
    const elimDay = eliminatedMap.get(i) ?? null
    participants.push(
      createParticipant(i, config.dailyStepTarget, completedDays, elimDay)
    )
  }

  return {
    id: config.id,
    name: config.name,
    stakeAmount: config.stakeAmount,
    dailyStepTarget: config.dailyStepTarget,
    duration: config.duration,
    maxParticipants: config.maxParticipants,
    participants,
    startTimestamp,
    endTimestamp,
    status: config.status,
    currentDay: config.currentDay,
    yieldGenerated: config.yieldGenerated,
  }
}

export function createMockData(): Challenge[] {
  return [
    // 1. New Year Resolution - active, day 12, 1 eliminated
    createChallenge({
      id: 'challenge-1',
      name: 'New Year Resolution',
      stakeAmount: 0.01,
      dailyStepTarget: 7000,
      duration: 30,
      maxParticipants: 5,
      status: 'active',
      currentDay: 12,
      participantCount: 4,
      eliminatedParticipants: [{ index: 2, day: 8 }],
      yieldGenerated: 0.00083,
    }),

    // 2. Weekend Warriors - upcoming, 3 joined
    createChallenge({
      id: 'challenge-2',
      name: 'Weekend Warriors',
      stakeAmount: 0.005,
      dailyStepTarget: 7000,
      duration: 7,
      maxParticipants: 10,
      status: 'upcoming',
      currentDay: 0,
      participantCount: 3,
      eliminatedParticipants: [],
      yieldGenerated: 0,
    }),

    // 3. Iron Will - active, day 25, all active, high stakes
    createChallenge({
      id: 'challenge-3',
      name: 'Iron Will',
      stakeAmount: 0.05,
      dailyStepTarget: 7000,
      duration: 60,
      maxParticipants: 3,
      status: 'active',
      currentDay: 25,
      participantCount: 3,
      eliminatedParticipants: [],
      yieldGenerated: 0.00412,
    }),

    // 4. Starter Sprint - completed, 3 of 8 eliminated
    createChallenge({
      id: 'challenge-4',
      name: 'Starter Sprint',
      stakeAmount: 0.002,
      dailyStepTarget: 7000,
      duration: 14,
      maxParticipants: 8,
      status: 'completed',
      currentDay: 14,
      participantCount: 8,
      eliminatedParticipants: [
        { index: 1, day: 4 },
        { index: 4, day: 9 },
        { index: 6, day: 11 },
      ],
      yieldGenerated: 0.00156,
    }),
  ]
}
