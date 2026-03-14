'use client'

import cn from 'clsx'
import { AnimatedNumber } from '@/components/ui/animated-number'
import type { Challenge } from '@/hooks/use-challenge-store'
import { calculatePrizePool, getActiveParticipants } from '@/utils/challenge'
import { formatBTC } from '@/utils/format'
import s from './prize-breakdown.module.css'

const PLATFORM_FEE_RATE = 0.05

interface PrizeBreakdownProps {
  challenge: Challenge
  className?: string
}

export function PrizeBreakdown({ challenge, className }: PrizeBreakdownProps) {
  const totalPool = calculatePrizePool(challenge)
  const platformFee = totalPool * PLATFORM_FEE_RATE
  const yieldGenerated = challenge.yieldGenerated
  const prizePool = totalPool - platformFee
  const winners = getActiveParticipants(challenge)
  const winnerCount = winners.length
  const perWinner = winnerCount > 0 ? prizePool / winnerCount : 0

  return (
    <div className={cn(s.root, className)}>
      <p className={s.title}>Prize Breakdown</p>

      <div className={s.flow}>
        {/* Total Pool */}
        <div className={s.row}>
          <span className={s.rowLabel}>
            Total Pool ({challenge.participants.length} x{' '}
            {formatBTC(challenge.stakeAmount)})
          </span>
          <AnimatedNumber
            value={totalPool}
            formatFn={(n) => formatBTC(n)}
            className={cn(s.rowValue)}
          />
        </div>

        {/* Platform Fee */}
        <div className={cn(s.row, s.indented)}>
          <span className={s.rowLabel}>Platform Fee (5%)</span>
          <span className={cn(s.rowValue, s.isMuted)}>
            -{formatBTC(platformFee)}
          </span>
        </div>

        {/* Yield Generated */}
        <div className={cn(s.row, s.indented)}>
          <span className={s.rowLabel}>Yield Generated (kept by platform)</span>
          <span className={cn(s.rowValue, s.isMuted)}>
            {formatBTC(yieldGenerated)}
          </span>
        </div>

        {/* Vertical connector */}
        <div className={s.verticalLine} />

        {/* Prize Pool */}
        <div className={s.row}>
          <span className={s.rowLabel}>Prize Pool</span>
          <AnimatedNumber
            value={prizePool}
            formatFn={(n) => formatBTC(n)}
            className={cn(s.rowValue)}
          />
        </div>

        {/* Per Winner */}
        <div className={s.winnerRow}>
          <span className={s.winnerLabel}>Per Winner ({winnerCount})</span>
          <AnimatedNumber
            value={perWinner}
            formatFn={(n) => formatBTC(n)}
            className={cn(s.winnerValue)}
          />
        </div>
      </div>
    </div>
  )
}
