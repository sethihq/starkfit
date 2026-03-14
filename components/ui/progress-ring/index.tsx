'use client'

import cn from 'clsx'
import type { ComponentProps, ReactNode } from 'react'
import s from './progress-ring.module.css'

interface ProgressRingProps extends Omit<ComponentProps<'div'>, 'children'> {
  progress: number
  size?: number
  strokeWidth?: number
  color?: 'accent' | 'danger'
  children?: ReactNode
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 6,
  color = 'accent',
  children,
  className,
  ...props
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const offset = circumference - (clampedProgress / 100) * circumference

  const gradientId = `progress-gradient-${color}`

  return (
    <div
      className={cn(s.wrapper, className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      {...props}
    >
      <svg
        className={s.svg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {color === 'accent' ? (
              <>
                <stop offset="0%" stopColor="oklch(0.863 0 0)" />
                <stop offset="100%" stopColor="oklch(0.933 0 0)" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="oklch(0.302 0 0)" />
                <stop offset="100%" stopColor="oklch(0.348 0 0)" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle
          className={s.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <circle
          className={s.progress}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && <div className={s.center}>{children}</div>}
    </div>
  )
}
