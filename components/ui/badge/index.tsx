import cn from 'clsx'
import type { ReactNode } from 'react'
import s from './badge.module.css'

type BadgeVariant = 'active' | 'eliminated' | 'completed' | 'upcoming' | 'winner'

interface BadgeProps {
  variant: BadgeVariant
  children: ReactNode
}

export function Badge({ variant, children }: BadgeProps) {
  return <span className={cn(s.badge, s[variant])}>{children}</span>
}
