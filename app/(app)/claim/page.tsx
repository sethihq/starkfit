'use client'

import { useState } from 'react'
import { Wrapper } from '@/components/layout/wrapper'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { ClaimCard } from '@/components/claim/claim-card'
import { ClaimSuccess } from '@/components/claim/claim-success'
import { useChallengeStore } from '@/hooks/use-challenge-store'
import { claimReward as claimRewardContract } from '@/lib/services/challenge-contract'
import {
  calculatePrizePool,
  getActiveParticipants,
} from '@/utils/challenge'
import s from './claim.module.css'

type ClaimState = 'unclaimed' | 'claiming' | 'claimed'

const PLATFORM_FEE_RATE = 0.05
const USER_PARTICIPANT_ID = 'participant-0'

export default function ClaimPage() {
  const challenges = useChallengeStore((state) => state.challenges)
  const userParticipation = useChallengeStore((state) => state.userParticipation)
  const storeClaimReward = useChallengeStore((state) => state.claimReward)

  const [claimState, setClaimState] = useState<ClaimState>('unclaimed')
  const [txHash, setTxHash] = useState('')
  const [claimedAmount, setClaimedAmount] = useState(0)

  const completedChallenge = challenges.find((c) => c.status === 'completed')

  if (!completedChallenge) {
    return (
      <Wrapper theme="dark">
        <div className={s.page}>
          <div className={s.content}>
            <div className={s.notEligible}>
              <p className={s.notEligibleTitle}>No completed challenges</p>
              <p className={s.notEligibleText}>
                Complete a challenge first to claim your reward.
              </p>
              <Link href="/">
                <Button variant="secondary">Back to Challenges</Button>
              </Link>
            </div>
          </div>
        </div>
      </Wrapper>
    )
  }

  const userStatus = userParticipation.get(completedChallenge.id)
  const isWinner = userStatus === 'winner'
  const alreadyClaimed = userStatus === 'completed'

  const winners = getActiveParticipants(completedChallenge)
  const totalPool = calculatePrizePool(completedChallenge)
  const prizePool = totalPool * (1 - PLATFORM_FEE_RATE)
  const perWinner = winners.length > 0 ? prizePool / winners.length : 0

  const userParticipant = completedChallenge.participants.find(
    (p) => p.id === USER_PARTICIPANT_ID,
  )
  const streakDays = userParticipant?.currentStreak ?? 0
  const totalSteps = userParticipant?.stepHistory.reduce((a, b) => a + b, 0) ?? 0

  const challengeId = completedChallenge.id

  async function handleClaim() {
    if (claimState !== 'unclaimed') return

    setClaimState('claiming')

    try {
      const result = await claimRewardContract(challengeId)
      setTxHash(result.txHash)
      setClaimedAmount(perWinner)
      storeClaimReward(challengeId)
      setClaimState('claimed')
    } catch {
      setClaimState('unclaimed')
    }
  }

  if (!isWinner && !alreadyClaimed && claimState !== 'claimed') {
    return (
      <Wrapper theme="dark">
        <div className={s.page}>
          <div className={s.content}>
            <div className={s.notEligible}>
              <p className={s.notEligibleTitle}>Not eligible</p>
              <p className={s.notEligibleText}>
                You did not win this challenge.
              </p>
              <Link href="/results">
                <Button variant="secondary">View Results</Button>
              </Link>
            </div>
          </div>
        </div>
      </Wrapper>
    )
  }

  return (
    <Wrapper theme="dark">
      <div className={s.page}>
        <div className={s.content}>
          {claimState === 'claimed' || alreadyClaimed ? (
            <ClaimSuccess
              amount={claimedAmount || perWinner}
              txHash={txHash || '0x0000000000000000000000000000000000000000000000000000000000000000'}
            />
          ) : (
            <ClaimCard
              challenge={completedChallenge}
              prizeAmount={perWinner}
              streakDays={streakDays}
              totalSteps={totalSteps}
              loading={claimState === 'claiming'}
              onClaim={handleClaim}
            />
          )}
        </div>
      </div>
    </Wrapper>
  )
}
