'use client'

import { useState } from 'react'
import { useChallengeStore } from '@/hooks/use-challenge-store'
import {
  ChallengeFilters,
  type FilterValue,
} from '@/components/challenges/challenge-filters'
import { ChallengeCard } from '@/components/challenges/challenge-card'
import s from './challenges.module.css'

export default function ChallengesPage() {
  const challenges = useChallengeStore((state) => state.challenges)
  const [filter, setFilter] = useState<FilterValue>('all')

  const filtered =
    filter === 'all'
      ? challenges
      : challenges.filter((c) => c.status === filter)

  return (
    <div className={s.page}>
      <h1 className={s.title}>Challenges</h1>

      <ChallengeFilters value={filter} onChange={setFilter} />

      {filtered.length > 0 ? (
        <div className={s.grid}>
          {filtered.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          <p>No {filter} challenges found</p>
        </div>
      )}
    </div>
  )
}
