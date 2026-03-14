'use client'

import cn from 'clsx'
import { useEffect, useRef } from 'react'
import type { ComponentProps } from 'react'
import type { Challenge, Participant } from '@/hooks/use-challenge-store'
import s from './streak-tracker.module.css'

interface StreakTrackerProps extends ComponentProps<'div'> {
  challenge: Challenge
  participant: Participant
}

type DayStatus = 'completed' | 'failed' | 'current' | 'future'

function getDayStatus(
  dayIndex: number,
  currentDay: number,
  stepHistory: number[],
  dailyStepTarget: number,
): DayStatus {
  const dayNumber = dayIndex + 1

  if (dayNumber < currentDay) {
    // Past day -- check step history
    const steps = stepHistory[dayIndex]
    if (steps !== undefined && steps >= dailyStepTarget) {
      return 'completed'
    }
    return 'failed'
  }

  if (dayNumber === currentDay) {
    return 'current'
  }

  return 'future'
}

function CheckIcon() {
  return (
    <svg
      className={s.icon}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M13.333 4L6 11.333 2.667 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg
      className={s.icon}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 4L4 12M4 4l8 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DotIcon() {
  return (
    <svg
      className={s.icon}
      viewBox="0 0 8 8"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="4" />
    </svg>
  )
}

export function StreakTracker({
  challenge,
  participant,
  className,
  ...props
}: StreakTrackerProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to current day
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const currentDayElement = track.querySelector('[data-current="true"]')
    if (currentDayElement instanceof HTMLElement) {
      currentDayElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [challenge.currentDay])

  const days = Array.from({ length: challenge.duration }, (_, i) => {
    const status = getDayStatus(
      i,
      challenge.currentDay,
      participant.stepHistory,
      challenge.dailyStepTarget,
    )
    return { dayNumber: i + 1, status }
  })

  return (
    <div className={cn(s.root, className)} {...props}>
      <span className={s.title}>Streak</span>
      <div ref={trackRef} className={s.track}>
        {days.map((day) => (
          <div
            key={day.dayNumber}
            className={s.day}
            data-current={day.status === 'current' ? 'true' : undefined}
          >
            <div
              className={cn(
                s.circle,
                day.status === 'completed' && s.isCompleted,
                day.status === 'failed' && s.isFailed,
                day.status === 'current' && s.isCurrent,
                day.status === 'future' && s.isFuture,
              )}
            >
              {day.status === 'completed' && <CheckIcon />}
              {day.status === 'failed' && <XIcon />}
              {day.status === 'current' && <DotIcon />}
            </div>
            <span className={s.dayLabel}>D{day.dayNumber}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
