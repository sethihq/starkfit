import cn from 'clsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import type { Challenge } from '@/hooks/use-challenge-store'
import { formatBTC, formatDuration, formatSteps } from '@/utils/format'
import s from './challenge-card.module.css'

interface ChallengeCardProps {
  challenge: Challenge
}

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <div className={s.card}>
      <div className={s.header}>
        <h3 className={s.name}>{challenge.name}</h3>
        <Badge variant={challenge.status}>{challenge.status}</Badge>
      </div>

      <div className={s.stats}>
        <div className={s.stat}>
          <span className={s.statLabel}>Stake</span>
          <span className={cn(s.statValue, s.isBtcOrange)}>
            {formatBTC(challenge.stakeAmount)}
          </span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>Duration</span>
          <span className={s.statValue}>
            {formatDuration(challenge.duration)}
          </span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>Participants</span>
          <span className={s.statValue}>
            {challenge.participants.length} / {challenge.maxParticipants}
          </span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>Daily Goal</span>
          <span className={s.statValue}>
            {formatSteps(challenge.dailyStepTarget)}
          </span>
        </div>
      </div>

      <div className={s.footer}>
        <Link href={`/challenges/${challenge.id}`}>
          <Button variant="secondary" size="sm">
            View Details
          </Button>
        </Link>
      </div>
    </div>
  )
}
