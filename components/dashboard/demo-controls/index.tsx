'use client'

import cn from 'clsx'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { useChallengeStore } from '@/hooks/use-challenge-store'
import s from './demo-controls.module.css'

interface DemoControlsProps extends ComponentProps<'div'> {
  challengeId: string
  participantId: string
}

export function DemoControls({
  challengeId,
  participantId,
  className,
  ...props
}: DemoControlsProps) {
  const simulateDay = useChallengeStore((state) => state.simulateDay)
  const updateSteps = useChallengeStore((state) => state.updateSteps)

  function handleSimulateDay() {
    simulateDay()
  }

  function handleAddSteps() {
    updateSteps(challengeId, participantId, 1000)
  }

  return (
    <div className={cn(s.root, className)} {...props}>
      <div className={s.header}>
        <svg
          className={s.icon}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M8 1v14M1 8h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle
            cx="8"
            cy="8"
            r="6.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
        <span className={s.label}>Demo Controls</span>
      </div>

      <div className={s.actions}>
        <Button variant="secondary" size="sm" onClick={handleSimulateDay}>
          Simulate Day
        </Button>
        <Button variant="secondary" size="sm" onClick={handleAddSteps}>
          Add 1,000 Steps
        </Button>
      </div>
    </div>
  )
}
