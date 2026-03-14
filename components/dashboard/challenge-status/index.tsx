'use client'

import cn from 'clsx'
import type { ComponentProps } from 'react'
import { Badge } from '@/components/ui/badge'
import { useCountdown } from '@/hooks/use-countdown'
import type { Challenge } from '@/hooks/use-challenge-store'
import { getDayNumber } from '@/utils/challenge'
import s from './challenge-status.module.css'

interface ChallengeStatusProps extends ComponentProps<'div'> {
  challenge: Challenge
}

export function ChallengeStatus({
  challenge,
  className,
  ...props
}: ChallengeStatusProps) {
  const countdown = useCountdown(challenge.endTimestamp)
  const currentDay = getDayNumber(challenge)
  const dayProgress = (currentDay / challenge.duration) * 100

  return (
    <div className={cn(s.root, className)} {...props}>
      <div className={s.left}>
        <span className={s.name}>{challenge.name}</span>
        <span className={s.dayInfo}>
          Day {currentDay} of {challenge.duration}
        </span>
      </div>

      <div className={s.right}>
        <div className={s.progressBarWrapper}>
          <div
            className={s.progressBarFill}
            style={{ width: `${dayProgress}%` }}
          />
        </div>

        <span className={s.countdown}>{countdown.formatted}</span>

        <Badge variant={challenge.status}>{challenge.status}</Badge>
      </div>
    </div>
  )
}
