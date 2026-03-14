import cn from 'clsx'
import type { Participant } from '@/hooks/use-challenge-store'
import { formatAddress, formatSteps } from '@/utils/format'
import s from './participant-list.module.css'

interface ParticipantListProps {
  participants: Participant[]
  showSteps?: boolean
}

export function ParticipantList({
  participants,
  showSteps = false,
}: ParticipantListProps) {
  const sorted = [...participants].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1
    if (a.status !== 'active' && b.status === 'active') return 1
    return b.todaySteps - a.todaySteps
  })

  return (
    <div className={s.list}>
      <h3 className={s.heading}>Participants</h3>
      {sorted.map((participant) => (
        <div key={participant.id} className={s.participant}>
          <div className={s.avatar}>{participant.avatar}</div>
          <div className={s.info}>
            <div className={s.nameRow}>
              <span className={s.name}>{participant.name}</span>
              <span
                className={cn(
                  s.statusDot,
                  participant.status === 'active'
                    ? s.isDotActive
                    : s.isDotEliminated
                )}
              />
            </div>
            <span className={s.address}>
              {formatAddress(participant.address)}
            </span>
          </div>
          <div className={s.meta}>
            {showSteps && (
              <span className={s.steps}>
                {formatSteps(participant.todaySteps)} steps
              </span>
            )}
            <span className={s.streak}>
              {participant.status === 'active'
                ? `${participant.currentStreak} day streak`
                : `Eliminated day ${participant.eliminatedOnDay}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
