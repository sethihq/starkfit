'use client'

/**
 * BTC Fitness Challenge — Zustand store
 *
 * Main state management for challenges, participants, and wallet.
 * All data is mocked for hackathon demo.
 */

import { create } from 'zustand'
// StarkZap SDK: gasless BTC staking for fitness challenges
import { starkzap } from '@/lib/services/starkzap'
import { getMockBalance } from '@/lib/services/wallet'
import { createMockData } from '@/utils/mock-data'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Participant {
  id: string
  name: string
  address: string
  avatar: string
  status: 'active' | 'eliminated'
  currentStreak: number
  eliminatedOnDay: number | null
  todaySteps: number
  stepHistory: number[]
}

export interface Challenge {
  id: string
  name: string
  stakeAmount: number
  dailyStepTarget: number
  duration: number
  maxParticipants: number
  participants: Participant[]
  startTimestamp: number
  endTimestamp: number
  status: 'upcoming' | 'active' | 'completed'
  currentDay: number
  yieldGenerated: number
}

export interface WalletState {
  connected: boolean
  address: string | null
  balance: { btc: number; strk: number }
}

interface ChallengeStore {
  // State
  challenges: Challenge[]
  wallet: WalletState
  activeChallengeId: string | null
  userParticipation: Map<
    string,
    'active' | 'eliminated' | 'completed' | 'winner'
  >

  // Actions
  connectWallet: (address: string) => void
  disconnectWallet: () => void
  joinChallenge: (challengeId: string) => void
  updateSteps: (
    challengeId: string,
    participantId: string,
    steps: number
  ) => void
  setSteps: (challengeId: string, participantId: string, steps: number) => void
  simulateDay: () => void
  claimReward: (challengeId: string) => void
  syncSteps: () => void
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const USER_PARTICIPANT_ID = 'participant-0'

const initialWallet: WalletState = {
  connected: false,
  address: null,
  balance: { btc: 0, strk: 0 },
}

function buildInitialParticipation(
  challenges: Challenge[]
): Map<string, 'active' | 'eliminated' | 'completed' | 'winner'> {
  const map = new Map<
    string,
    'active' | 'eliminated' | 'completed' | 'winner'
  >()

  for (const challenge of challenges) {
    const userParticipant = challenge.participants.find(
      (p) => p.id === USER_PARTICIPANT_ID
    )
    if (!userParticipant) continue

    if (challenge.status === 'completed') {
      map.set(
        challenge.id,
        userParticipant.status === 'active' ? 'winner' : 'eliminated'
      )
    } else {
      map.set(challenge.id, userParticipant.status)
    }
  }

  return map
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useChallengeStore = create<ChallengeStore>((set, get) => {
  const mockChallenges = createMockData()

  return {
    challenges: mockChallenges,
    wallet: initialWallet,
    activeChallengeId: 'challenge-1',
    userParticipation: buildInitialParticipation(mockChallenges),

    connectWallet(address: string) {
      const balance = getMockBalance()
      set({
        wallet: {
          connected: true,
          address,
          balance,
        },
      })
    },

    disconnectWallet() {
      set({ wallet: initialWallet })
    },

    joinChallenge(challengeId: string) {
      const { challenges, wallet, userParticipation } = get()

      if (!wallet.connected) return

      const challenge = challenges.find((c) => c.id === challengeId)

      // StarkZap SDK: stake BTC into challenge pool (gasless via AVNU Paymaster)
      if (challenge) {
        starkzap
          .stakeIntoChallengePool(challengeId, challenge.stakeAmount)
          .then((result) => {
            console.log(
              '[StarkZap SDK] Challenge stake confirmed:',
              result.txHash,
              '| Amount:',
              result.amount,
              'WBTC | Pool:',
              result.poolAddress
            )
          })
          .catch((error: unknown) => {
            console.error('[StarkZap SDK] Stake failed:', error)
          })
      }

      set({
        challenges: challenges.map((c) => {
          if (c.id !== challengeId) return c
          if (c.participants.length >= c.maxParticipants) return c

          const alreadyJoined = c.participants.some(
            (p) => p.address === wallet.address
          )
          if (alreadyJoined) return c

          const newParticipant: Participant = {
            id: `user-${wallet.address}`,
            name: 'You',
            address: wallet.address ?? '',
            avatar: '\u{1F3AF}',
            status: 'active',
            currentStreak: 0,
            eliminatedOnDay: null,
            todaySteps: 0,
            stepHistory: [],
          }

          return {
            ...c,
            participants: [...c.participants, newParticipant],
          }
        }),
        userParticipation: new Map(userParticipation).set(
          challengeId,
          'active'
        ),
      })
    },

    updateSteps(challengeId: string, participantId: string, steps: number) {
      const { challenges } = get()

      set({
        challenges: challenges.map((challenge) => {
          if (challenge.id !== challengeId) return challenge

          return {
            ...challenge,
            participants: challenge.participants.map((p) => {
              if (p.id !== participantId) return p
              return { ...p, todaySteps: p.todaySteps + steps }
            }),
          }
        }),
      })
    },

    setSteps(challengeId: string, participantId: string, steps: number) {
      const { challenges } = get()

      set({
        challenges: challenges.map((challenge) => {
          if (challenge.id !== challengeId) return challenge

          return {
            ...challenge,
            participants: challenge.participants.map((p) => {
              if (p.id !== participantId) return p
              return { ...p, todaySteps: steps }
            }),
          }
        }),
      })
    },

    simulateDay() {
      const { challenges, userParticipation } = get()
      const newParticipation = new Map(userParticipation)

      set({
        challenges: challenges.map((challenge) => {
          if (challenge.status !== 'active') return challenge

          const nextDay = challenge.currentDay + 1
          const isCompleted = nextDay > challenge.duration

          const updatedParticipants = challenge.participants.map((p) => {
            if (p.status === 'eliminated') return p

            const metTarget = p.todaySteps >= challenge.dailyStepTarget
            const newHistory = [...p.stepHistory, p.todaySteps]

            if (!metTarget) {
              // Eliminated
              if (p.id === USER_PARTICIPANT_ID) {
                newParticipation.set(challenge.id, 'eliminated')
              }
              return {
                ...p,
                status: 'eliminated' as const,
                eliminatedOnDay: challenge.currentDay,
                currentStreak: 0,
                todaySteps: 0,
                stepHistory: newHistory,
              }
            }

            // Survived
            return {
              ...p,
              currentStreak: p.currentStreak + 1,
              todaySteps: 0,
              stepHistory: newHistory,
            }
          })

          if (isCompleted) {
            const userP = updatedParticipants.find(
              (p) => p.id === USER_PARTICIPANT_ID
            )
            if (userP && userP.status === 'active') {
              newParticipation.set(challenge.id, 'winner')
            }
          }

          return {
            ...challenge,
            currentDay: isCompleted ? challenge.duration : nextDay,
            status: isCompleted ? ('completed' as const) : challenge.status,
            participants: updatedParticipants,
            yieldGenerated:
              challenge.yieldGenerated + challenge.stakeAmount * 0.0001,
          }
        }),
        userParticipation: newParticipation,
      })
    },

    claimReward(challengeId: string) {
      const { userParticipation } = get()
      const status = userParticipation.get(challengeId)
      if (status !== 'winner') return

      // StarkZap SDK: claim challenge rewards (gasless via AVNU Paymaster)
      starkzap
        .claimChallengeReward(challengeId)
        .then((result) => {
          console.log(
            '[StarkZap SDK] Reward claimed:',
            result.txHash,
            '| Rewards:',
            result.rewardsAmount,
            'STRK'
          )
        })
        .catch((error: unknown) => {
          console.error('[StarkZap SDK] Claim failed:', error)
        })

      const newParticipation = new Map(userParticipation)
      newParticipation.set(challengeId, 'completed')
      set({ userParticipation: newParticipation })
    },

    syncSteps() {
      const { challenges } = get()

      set({
        challenges: challenges.map((challenge) => {
          if (challenge.status !== 'active') return challenge

          return {
            ...challenge,
            participants: challenge.participants.map((p) => {
              if (p.status === 'eliminated') return p
              if (p.id === USER_PARTICIPANT_ID) return p

              // Simulate other participants getting random steps
              const extraSteps = Math.floor(Math.random() * 300) + 100
              return { ...p, todaySteps: p.todaySteps + extraSteps }
            }),
          }
        }),
      })
    },
  }
})
