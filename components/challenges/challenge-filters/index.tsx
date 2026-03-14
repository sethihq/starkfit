'use client'

import cn from 'clsx'
import s from './challenge-filters.module.css'

type FilterValue = 'all' | 'active' | 'upcoming' | 'completed'

interface ChallengeFiltersProps {
  value: FilterValue
  onChange: (filter: FilterValue) => void
}

const FILTERS: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
]

export type { FilterValue }

export function ChallengeFilters({ value, onChange }: ChallengeFiltersProps) {
  return (
    <div className={s.filters} role="tablist">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          role="tab"
          aria-selected={value === filter.value}
          className={cn(s.pill, value === filter.value && s.isActive)}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
