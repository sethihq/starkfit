'use client'

import cn from 'clsx'
import type { Challenge } from '@/hooks/use-challenge-store'
import { Link } from '@/components/ui/link'
import { LeaderboardRow } from '@/components/leaderboard/leaderboard-row'
import s from './leaderboard-table.module.css'

interface LeaderboardTableProps {
  challenge: Challenge | undefined
  currentUserParticipantId: string
  className?: string
}

function sortParticipants(challenge: Challenge) {
  const active = challenge.participants
    .filter((p) => p.status === 'active')
    .sort((a, b) => b.todaySteps - a.todaySteps)

  const eliminated = challenge.participants
    .filter((p) => p.status === 'eliminated')
    .sort((a, b) => (b.eliminatedOnDay ?? 0) - (a.eliminatedOnDay ?? 0))

  return { active, eliminated }
}

export function LeaderboardTable({
  challenge,
  currentUserParticipantId,
  className,
}: LeaderboardTableProps) {
  if (!challenge) {
    return (
      <div className={cn(s.table, className)}>
        <div className={s.empty}>
          <p className={s.emptyTitle}>No active challenge</p>
          <p className={s.emptyDescription}>
            Join a challenge to see the leaderboard
          </p>
          <Link href="/" className={s.emptyLink}>
            Browse challenges
          </Link>
        </div>
      </div>
    )
  }

  const { active, eliminated } = sortParticipants(challenge)

  return (
    <div className={cn(s.table, className)} role="table" aria-label="Leaderboard">
      <div className={s.header} role="row">
        <span className={s.headerCell} role="columnheader">
          Rank
        </span>
        <span className={s.headerCell} role="columnheader">
          Player
        </span>
        <span className={s.headerCellRight} role="columnheader">
          Today&apos;s Steps
        </span>
        <span className={cn(s.headerCellRight, s.headerCellStreak)} role="columnheader">
          Streak
        </span>
        <span className={cn(s.headerCellRight, s.headerCellStatus)} role="columnheader">
          Status
        </span>
      </div>

      <div className={s.body} role="rowgroup">
        {active.map((participant, index) => (
          <LeaderboardRow
            key={participant.id}
            participant={participant}
            rank={index + 1}
            dailyStepTarget={challenge.dailyStepTarget}
            isCurrentUser={participant.id === currentUserParticipantId}
          />
        ))}

        {eliminated.map((participant) => (
          <LeaderboardRow
            key={participant.id}
            participant={participant}
            rank={null}
            dailyStepTarget={challenge.dailyStepTarget}
            isCurrentUser={participant.id === currentUserParticipantId}
          />
        ))}
      </div>
    </div>
  )
}
