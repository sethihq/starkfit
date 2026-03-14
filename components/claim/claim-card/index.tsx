'use client'

import cn from 'clsx'
import type { Challenge } from '@/hooks/use-challenge-store'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { formatBTC, formatSteps } from '@/utils/format'
import s from './claim-card.module.css'

interface ClaimCardProps {
  challenge: Challenge
  prizeAmount: number
  streakDays: number
  totalSteps: number
  loading: boolean
  onClaim: () => void
  className?: string
}

export function ClaimCard({
  challenge,
  prizeAmount,
  streakDays,
  totalSteps,
  loading,
  onClaim,
  className,
}: ClaimCardProps) {
  return (
    <div className={cn(s.card, className)}>
      <h1 className={s.celebrationHeader}>You Won!</h1>
      <p className={s.challengeName}>{challenge.name}</p>

      <div className={s.prizeAmount}>
        <AnimatedNumber
          value={prizeAmount}
          formatFn={(n) => formatBTC(n)}
        />
      </div>

      <div className={s.statsGrid}>
        <div className={s.statItem}>
          <div className={s.statValue}>{streakDays}/{challenge.duration}</div>
          <div className={s.statLabel}>Streak Days</div>
        </div>
        <div className={s.statItem}>
          <div className={s.statValue}>{formatSteps(totalSteps)}</div>
          <div className={s.statLabel}>Total Steps</div>
        </div>
      </div>

      <button
        className={cn(s.claimButton, loading && s.isLoading)}
        onClick={onClaim}
        disabled={loading}
        type="button"
      >
        {loading && (
          <span className={s.spinner} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
              />
            </svg>
          </span>
        )}
        {loading ? 'Claiming...' : 'Claim Reward'}
      </button>
    </div>
  )
}
