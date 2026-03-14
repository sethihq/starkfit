'use client'

import cn from 'clsx'
import { useState } from 'react'
import type { ComponentProps } from 'react'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/ui/progress-ring'
import { useStepSimulator } from '@/hooks/use-step-simulator'
import { formatSteps, formatPercent } from '@/utils/format'
import { getProgress } from '@/utils/challenge'
import s from './daily-progress.module.css'

interface DailyProgressProps extends ComponentProps<'div'> {
  challengeId: string
  participantId: string
  currentSteps: number
  targetSteps: number
}

export function DailyProgress({
  challengeId,
  participantId,
  currentSteps,
  targetSteps,
  className,
  ...props
}: DailyProgressProps) {
  const [isSyncing, setIsSyncing] = useState(false)

  useStepSimulator(challengeId, participantId, isSyncing)

  const progress = getProgress(currentSteps, targetSteps)
  const isComplete = currentSteps >= targetSteps
  const ringColor = isComplete ? 'accent' : progress < 50 ? 'danger' : 'accent'

  function handleSync() {
    setIsSyncing(true)

    // Stop syncing after 6 seconds
    setTimeout(() => {
      setIsSyncing(false)
    }, 6000)
  }

  return (
    <div
      className={cn(s.root, isComplete && s.isComplete, className)}
      {...props}
    >
      <div className={s.ringContainer}>
        <ProgressRing
          progress={progress}
          size={240}
          strokeWidth={8}
          color={ringColor}
        >
          <div className={s.ringContent}>
            <AnimatedNumber
              value={currentSteps}
              formatFn={formatSteps}
              className={s.stepCount ?? ''}
            />
            <span className={s.stepsLabel}>steps</span>
          </div>
        </ProgressRing>
      </div>

      <span className={s.target}>/ {formatSteps(targetSteps)} steps</span>

      <span className={s.percentage}>{formatPercent(progress)} complete</span>

      {isComplete ? (
        <div className={s.completeBadge}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M13.333 4L6 11.333 2.667 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Goal Complete!
        </div>
      ) : (
        <Button
          variant="primary"
          size="lg"
          loading={isSyncing}
          onClick={handleSync}
          className={s.syncButton}
        >
          {isSyncing ? 'Syncing Steps...' : 'Sync Steps'}
        </Button>
      )}
    </div>
  )
}
