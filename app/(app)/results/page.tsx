'use client'

import { PrizeBreakdown } from '@/components/results/prize-breakdown'
import { WinnerCard } from '@/components/results/winner-card'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { StatCard } from '@/components/ui/stat-card'
import { useChallengeStore } from '@/hooks/use-challenge-store'
import {
  calculatePrizePool,
  getActiveParticipants,
  getEliminatedParticipants,
} from '@/utils/challenge'
import { formatBTC, formatDuration } from '@/utils/format'
import s from './results.module.css'

const PLATFORM_FEE_RATE = 0.05

export default function ResultsPage() {
  const challenges = useChallengeStore((state) => state.challenges)
  const userParticipation = useChallengeStore(
    (state) => state.userParticipation
  )

  const completedChallenge = challenges.find((c) => c.status === 'completed')

  if (!completedChallenge) {
    return (
      <div className={s.page}>
        <div className={s.content}>
          <p className={s.title}>No completed challenges yet.</p>
        </div>
      </div>
    )
  }

  const winners = getActiveParticipants(completedChallenge)
  const eliminated = getEliminatedParticipants(completedChallenge)
  const totalPool = calculatePrizePool(completedChallenge)
  const prizePool = totalPool * (1 - PLATFORM_FEE_RATE)
  const perWinner = winners.length > 0 ? prizePool / winners.length : 0

  const userStatus = userParticipation.get(completedChallenge.id)
  const isWinner = userStatus === 'winner'

  return (
    <div className={s.page}>
      <div className={s.content}>
        {/* Header */}
        <div className={s.header}>
          <h1 className={s.title}>Challenge Results</h1>
          <p className={s.challengeName}>{completedChallenge.name}</p>
        </div>

        {/* Stats */}
        <div className={s.statsRow}>
          <StatCard
            value={String(completedChallenge.participants.length)}
            label="Participants"
          />
          <StatCard value={String(winners.length)} label="Winners" />
          <StatCard
            value={formatDuration(completedChallenge.duration)}
            label="Duration"
          />
        </div>

        {/* Prize Breakdown */}
        <PrizeBreakdown challenge={completedChallenge} />

        {/* Winners */}
        <div className={s.section}>
          <p className={s.sectionTitle}>Winners</p>
          <div className={s.winnersList}>
            {winners.map((winner) => (
              <WinnerCard
                key={winner.id}
                participant={winner}
                duration={completedChallenge.duration}
                prizeAmount={perWinner}
                stakeAmount={completedChallenge.stakeAmount}
              />
            ))}
          </div>
        </div>

        {/* Eliminated */}
        {eliminated.length > 0 && (
          <div className={s.section}>
            <p className={s.sectionTitle}>Eliminated</p>
            <div className={s.winnersList}>
              {eliminated.map((participant) => (
                <WinnerCard
                  key={participant.id}
                  participant={participant}
                  duration={completedChallenge.duration}
                  prizeAmount={0}
                  stakeAmount={completedChallenge.stakeAmount}
                />
              ))}
            </div>
          </div>
        )}

        {/* Claim CTA */}
        {isWinner && (
          <div className={s.claimCta}>
            <span className={s.claimCtaText}>
              You won{' '}
              <span className={s.claimCtaAmount}>{formatBTC(perWinner)}</span>
            </span>
            <Link href="/claim">
              <Button variant="primary" size="lg">
                Claim Reward
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
