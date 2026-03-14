'use client'

import { Wrapper } from '@/components/layout/wrapper'
import { Link } from '@/components/ui/link'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { ChallengeStatus } from '@/components/dashboard/challenge-status'
import { DailyProgress } from '@/components/dashboard/daily-progress'
import { StreakTracker } from '@/components/dashboard/streak-tracker'
import { DemoControls } from '@/components/dashboard/demo-controls'
import { useChallengeStore } from '@/hooks/use-challenge-store'
import { calculatePrizePool, getActiveParticipants } from '@/utils/challenge'
import { formatBTC } from '@/utils/format'
import s from './dashboard.module.css'

const USER_PARTICIPANT_ID = 'participant-0'

function DashboardContent() {
  const challenges = useChallengeStore((state) => state.challenges)
  const activeChallengeId = useChallengeStore(
    (state) => state.activeChallengeId,
  )

  const challenge = challenges.find((c) => c.id === activeChallengeId)

  if (!challenge) {
    return (
      <div className={s.emptyState}>
        <span className={s.emptyTitle}>No Active Challenge</span>
        <p className={s.emptyDescription}>
          You are not currently participating in any challenge. Browse available
          challenges to get started.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">
            Browse Challenges
          </Button>
        </Link>
      </div>
    )
  }

  const participant = challenge.participants.find(
    (p) => p.id === USER_PARTICIPANT_ID,
  )

  if (!participant) {
    return (
      <div className={s.emptyState}>
        <span className={s.emptyTitle}>Not a Participant</span>
        <p className={s.emptyDescription}>
          You have not joined this challenge yet.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">
            Browse Challenges
          </Button>
        </Link>
      </div>
    )
  }

  const prizePool = calculatePrizePool(challenge)
  const activePlayers = getActiveParticipants(challenge)

  return (
    <>
      <ChallengeStatus challenge={challenge} />

      <DailyProgress
        challengeId={challenge.id}
        participantId={participant.id}
        currentSteps={participant.todaySteps}
        targetSteps={challenge.dailyStepTarget}
      />

      <StreakTracker challenge={challenge} participant={participant} />

      <div className={s.statsGrid}>
        <StatCard
          value={formatBTC(prizePool)}
          label="Prize Pool"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 2.667C10 2.667 9.333 2 8 2S6 2.667 6 2.667M4 14h8M6 14v-2.667M10 14v-2.667M8 2v2M5.333 4h5.334c.736 0 1.333.597 1.333 1.333v2.667c0 1.473-1.194 2.667-2.667 2.667H6.667A2.667 2.667 0 014 8V5.333C4 4.597 4.597 4 5.333 4z"
                stroke="var(--color-c11)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <StatCard
          value={String(activePlayers.length)}
          label="Active Players"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 14v-1.333A2.667 2.667 0 008.333 10H3.667A2.667 2.667 0 001 12.667V14M14.667 14v-1.333a2.667 2.667 0 00-2-2.58M10.333 2.087a2.667 2.667 0 010 5.16M6 7.333A2.667 2.667 0 106 2a2.667 2.667 0 000 5.333z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <StatCard
          value={formatBTC(challenge.stakeAmount)}
          label="Your Stake"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 1.333v13.334M11.333 3.333H6.333a2 2 0 000 4h3.334a2 2 0 010 4H4"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <StatCard
          value={formatBTC(challenge.yieldGenerated)}
          label="Yield Generated"
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 4l-4.667 4.667L6.667 6 2 10.667M14 4h-4M14 4v4"
                stroke="var(--color-c12)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
      </div>

      <div className={s.demoControlsWrapper}>
        <DemoControls
          challengeId={challenge.id}
          participantId={participant.id}
        />
      </div>
    </>
  )
}

export default function DashboardPage() {
  return (
    <Wrapper theme="dark" lenis={{}}>
      <div className={s.page}>
        <div className={s.content}>
          <DashboardContent />
        </div>
      </div>
    </Wrapper>
  )
}
