'use client'

import cn from 'clsx'
import type { Participant } from '@/hooks/use-challenge-store'
import { Badge } from '@/components/ui/badge'
import { formatAddress, formatSteps } from '@/utils/format'
import s from './leaderboard-row.module.css'

interface LeaderboardRowProps {
  participant: Participant
  rank: number | null
  dailyStepTarget: number
  isCurrentUser: boolean
}

function getRankAccent(rank: number | null): string | undefined {
  if (rank === 1) return s.isGold
  if (rank === 2) return s.isSilver
  if (rank === 3) return s.isBronze
  return undefined
}

function getStepsClass(steps: number, target: number, isEliminated: boolean) {
  if (isEliminated) return s.stepsNeutral
  if (steps >= target) return s.stepsOnTrack
  return s.stepsBehind
}

export function LeaderboardRow({
  participant,
  rank,
  dailyStepTarget,
  isCurrentUser,
}: LeaderboardRowProps) {
  const isEliminated = participant.status === 'eliminated'
  const rankAccent = getRankAccent(rank)
  const hasLongStreak = participant.currentStreak >= 10

  return (
    <div
      className={cn(
        s.row,
        isEliminated && s.isEliminated,
        isCurrentUser && !rankAccent && s.isCurrentUser,
        rankAccent,
      )}
      role="row"
    >
      <span className={cn(s.rank, !isEliminated && s.rankActive)} role="cell">
        {rank !== null ? `#${rank}` : '\u2014'}
      </span>

      <div className={s.player} role="cell">
        <span className={s.avatar} aria-hidden="true">
          {participant.avatar}
        </span>
        <div className={s.playerInfo}>
          <span className={s.playerName}>
            {isCurrentUser ? `${participant.name} (You)` : participant.name}
          </span>
          <span className={s.playerAddress}>
            {formatAddress(participant.address)}
          </span>
        </div>
      </div>

      <span
        className={cn(
          s.steps,
          getStepsClass(participant.todaySteps, dailyStepTarget, isEliminated),
        )}
        role="cell"
      >
        {isEliminated ? '\u2014' : formatSteps(participant.todaySteps)}
      </span>

      <span
        className={cn(s.streak, hasLongStreak && s.streakFire)}
        role="cell"
      >
        {isEliminated
          ? `Day ${participant.eliminatedOnDay}`
          : `Day ${participant.currentStreak}${hasLongStreak ? ' \uD83D\uDD25' : ''}`}
      </span>

      <div className={s.status} role="cell">
        <Badge variant={participant.status}>
          {participant.status === 'active' ? 'Active' : 'Eliminated'}
        </Badge>
      </div>
    </div>
  )
}
