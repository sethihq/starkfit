import cn from 'clsx'
import type { ComponentProps, ReactNode } from 'react'
import s from './stat-card.module.css'

interface StatCardProps extends ComponentProps<'div'> {
  value: string
  label: string
  icon?: ReactNode
}

export function StatCard({
  value,
  label,
  icon,
  className,
  ...props
}: StatCardProps) {
  return (
    <div className={cn(s.card, className)} {...props}>
      {icon && <div className={s.icon}>{icon}</div>}
      <span className={s.value}>{value}</span>
      <span className={s.label}>{label}</span>
    </div>
  )
}
