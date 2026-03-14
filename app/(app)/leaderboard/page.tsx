'use client'

import type { ChangeEvent } from 'react'
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table'
import { useChallengeStore } from '@/hooks/use-challenge-store'
import { formatBTC } from '@/utils/format'
import s from './leaderboard.module.css'

const USER_PARTICIPANT_ID = 'participant-0'

export default function LeaderboardPage() {
  const challenges = useChallengeStore((state) => state.challenges)
  const activeChallengeId = useChallengeStore(
    (state) => state.activeChallengeId
  )

  const activeChallenges = challenges.filter(
    (c) => c.status === 'active' || c.status === 'completed'
  )

  const selectedId = activeChallengeId ?? activeChallenges[0]?.id
  const selectedChallenge = challenges.find((c) => c.id === selectedId)

  const activeCount =
    selectedChallenge?.participants.filter((p) => p.status === 'active')
      .length ?? 0
  const totalCount = selectedChallenge?.participants.length ?? 0
  const totalPool = selectedChallenge
    ? selectedChallenge.stakeAmount * totalCount
    : 0

  function handleChallengeChange(event: ChangeEvent<HTMLSelectElement>) {
    useChallengeStore.setState({ activeChallengeId: event.target.value })
  }

  return (
    <div className={s.page}>
      <div className={s.content}>
        <div className={s.header}>
          <h1 className={s.title}>Leaderboard</h1>
          {selectedChallenge && (
            <p className={s.subtitle}>
              <span className={s.challengeName}>{selectedChallenge.name}</span>
              {' \u2014 '}
              <span className={s.challengeDay}>
                Day {selectedChallenge.currentDay} of{' '}
                {selectedChallenge.duration}
              </span>
            </p>
          )}
        </div>

        {activeChallenges.length > 1 && (
          <div className={s.selector}>
            <label className={s.selectorLabel} htmlFor="challenge-select">
              Challenge
            </label>
            <select
              id="challenge-select"
              className={s.selectorSelect}
              value={selectedId}
              onChange={handleChallengeChange}
            >
              {activeChallenges.map((challenge) => (
                <option key={challenge.id} value={challenge.id}>
                  {challenge.name} (Day {challenge.currentDay}/
                  {challenge.duration})
                </option>
              ))}
            </select>
          </div>
        )}

        <LeaderboardTable
          challenge={selectedChallenge}
          currentUserParticipantId={USER_PARTICIPANT_ID}
        />

        {selectedChallenge && (
          <div className={s.summary}>
            <div className={s.summaryItem}>
              <span className={s.summaryLabel}>Players Active</span>
              <span className={s.summaryValue}>
                {activeCount} of {totalCount}
              </span>
            </div>
            <div className={s.summaryItem}>
              <span className={s.summaryLabel}>Total Pool</span>
              <span className={s.summaryValueAccent}>
                {formatBTC(totalPool)}
              </span>
            </div>
            <div className={s.summaryItem}>
              <span className={s.summaryLabel}>Daily Target</span>
              <span className={s.summaryValue}>
                {selectedChallenge.dailyStepTarget.toLocaleString()} steps
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
