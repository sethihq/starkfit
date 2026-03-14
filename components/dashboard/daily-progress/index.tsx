'use client'

import cn from 'clsx'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import { AnimatedNumber } from '@/components/ui/animated-number'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/ui/progress-ring'
import { useGoogleFit } from '@/hooks/use-google-fit'
import { useStepSimulator } from '@/hooks/use-step-simulator'
import { getProgress } from '@/utils/challenge'
import { formatPercent, formatSteps } from '@/utils/format'
import s from './daily-progress.module.css'

interface DailyProgressProps extends ComponentProps<'div'> {
  challengeId: string
  participantId: string
  currentSteps: number
  targetSteps: number
}

function GoogleFitIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2L7 7l5 5 5-5-5-5z" fill="#4285F4" />
      <path d="M7 7L2 12l5 5 5-5-5-5z" fill="#EA4335" />
      <path d="M12 12l-5 5 5 5 5-5-5-5z" fill="#34A853" />
      <path d="M17 7l-5 5 5 5 5-5-5-5z" fill="#FBBC05" />
    </svg>
  )
}

function SourceBadge({ isConnected }: { isConnected: boolean }) {
  if (isConnected) {
    return (
      <span className={cn(s.sourceBadge, s.isReal)}>
        <GoogleFitIcon />
        Google Fit
      </span>
    )
  }

  return (
    <span className={s.sourceBadge}>
      <svg
        width="12"
        height="12"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 5v3l2 2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      Simulated
    </span>
  )
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
  const googleFit = useGoogleFit()

  // Only run the simulator when Google Fit is NOT connected
  useStepSimulator(
    challengeId,
    participantId,
    isSyncing && !googleFit.isConnected
  )

  const progress = getProgress(currentSteps, targetSteps)
  const isComplete = currentSteps >= targetSteps
  const progressColor = progress < 50 ? 'danger' : 'accent'
  const ringColor = isComplete ? 'accent' : progressColor

  function handleSimulatedSync() {
    setIsSyncing(true)

    // Stop syncing after 6 seconds
    setTimeout(() => {
      setIsSyncing(false)
    }, 6000)
  }

  async function handleGoogleFitSync() {
    await googleFit.syncSteps()
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

      <SourceBadge isConnected={googleFit.isConnected} />

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
        <div className={s.actions}>
          {googleFit.isConnected ? (
            <>
              <Button
                variant="primary"
                size="lg"
                loading={googleFit.isLoading}
                onClick={handleGoogleFitSync}
                className={s.syncButton}
                icon={<GoogleFitIcon />}
              >
                {googleFit.isLoading ? 'Syncing...' : 'Sync Google Fit'}
              </Button>
              <button
                type="button"
                className={s.disconnectButton}
                onClick={googleFit.disconnect}
              >
                Disconnect Google Fit
              </button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="lg"
                loading={isSyncing}
                onClick={handleSimulatedSync}
                className={s.syncButton}
              >
                {isSyncing ? 'Syncing Steps...' : 'Sync Steps'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={googleFit.connect}
                icon={<GoogleFitIcon />}
              >
                Connect Google Fit
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
