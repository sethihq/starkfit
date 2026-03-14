import cn from 'clsx'
import { Badge } from '@/components/ui/badge'
import type { Participant } from '@/hooks/use-challenge-store'
import { formatBTC } from '@/utils/format'
import s from './winner-card.module.css'

interface WinnerCardProps {
  participant: Participant
  duration: number
  prizeAmount: number
  stakeAmount: number
  className?: string
}

export function WinnerCard({
  participant,
  duration,
  prizeAmount,
  stakeAmount,
  className,
}: WinnerCardProps) {
  const isEliminated = participant.status === 'eliminated'

  return (
    <div className={cn(s.card, isEliminated && s.isEliminated, className)}>
      <span className={s.avatar}>{participant.avatar}</span>

      <div className={s.info}>
        <span className={s.name}>
          {participant.name}
          {!isEliminated && <Badge variant="winner">Winner</Badge>}
          {isEliminated && <Badge variant="eliminated">Eliminated</Badge>}
        </span>

        {!isEliminated && (
          <span className={s.streak}>
            {participant.currentStreak}/{duration} Days
          </span>
        )}

        {isEliminated && participant.eliminatedOnDay !== null && (
          <span className={s.eliminatedDay}>
            Eliminated on Day {participant.eliminatedOnDay}
          </span>
        )}
      </div>

      <span className={s.prize}>
        {isEliminated
          ? `Contributed ${formatBTC(stakeAmount)}`
          : formatBTC(prizeAmount)}
      </span>
    </div>
  )
}
