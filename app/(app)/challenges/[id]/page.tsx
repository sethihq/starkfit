'use client'

import cn from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { use, useState } from 'react'
import { useChallengeStore } from '@/hooks/use-challenge-store'
import { formatBTC, formatDuration, formatSteps } from '@/utils/format'
import { calculatePrizePool } from '@/utils/challenge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/components/ui/link'
import { ParticipantList } from '@/components/challenges/participant-list'
import { JoinModal } from '@/components/challenges/join-modal'
import s from './challenge-detail.module.css'

interface ChallengeDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ChallengeDetailPage({
  params,
}: ChallengeDetailPageProps) {
  const { id } = use(params)
  const challenges = useChallengeStore((state) => state.challenges)
  const wallet = useChallengeStore((state) => state.wallet)
  const userParticipation = useChallengeStore(
    (state) => state.userParticipation,
  )
  const joinChallenge = useChallengeStore((state) => state.joinChallenge)
  const [joinModalOpen, setJoinModalOpen] = useState(false)

  const challenge = challenges.find((c) => c.id === id)

  if (!challenge) {
    return (
      <div className={s.page}>
        <Link href="/challenges" className={s.backLink}>
          <ArrowLeft size={16} />
          Back to Challenges
        </Link>
        <div className={s.notFound}>
          <h2 className={s.notFoundTitle}>Challenge not found</h2>
          <p className={s.notFoundText}>
            This challenge does not exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  const participationStatus = userParticipation.get(challenge.id)
  const hasJoined = participationStatus !== undefined
  const prizePool = calculatePrizePool(challenge)

  return (
    <div className={s.page}>
      <Link href="/challenges" className={s.backLink}>
        <ArrowLeft size={16} />
        Back to Challenges
      </Link>

      <div className={s.header}>
        <h1 className={s.name}>{challenge.name}</h1>
        <Badge variant={challenge.status}>{challenge.status}</Badge>
      </div>

      <div className={s.statsRow}>
        <div className={s.stat}>
          <span className={s.statLabel}>Stake Amount</span>
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
          <span className={s.statLabel}>Daily Target</span>
          <span className={s.statValue}>
            {formatSteps(challenge.dailyStepTarget)}
          </span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>Prize Pool</span>
          <span className={cn(s.statValue, s.isBtcOrange)}>
            {formatBTC(prizePool)}
          </span>
        </div>
        <div className={s.stat}>
          <span className={s.statLabel}>Yield Generated</span>
          <span className={s.statValue}>
            {formatBTC(challenge.yieldGenerated)}
          </span>
        </div>
      </div>

      <div className={s.joinSection}>
        {hasJoined ? (
          <div className={s.joinedBadge}>
            <span className={s.joinedDot} />
            You're In!
          </div>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setJoinModalOpen(true)}
            disabled={
              challenge.status === 'completed' ||
              challenge.participants.length >= challenge.maxParticipants
            }
          >
            Join Challenge
          </Button>
        )}
      </div>

      <div className={s.participantSection}>
        <ParticipantList
          participants={challenge.participants}
          showSteps={challenge.status === 'active'}
        />
      </div>

      <JoinModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        challenge={challenge}
        wallet={wallet}
        onJoin={joinChallenge}
      />
    </div>
  )
}
