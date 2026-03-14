import cn from 'clsx'
import type { ComponentProps } from 'react'
import s from './card.module.css'

interface CardProps extends ComponentProps<'div'> {
  hover?: boolean
}

export function Card({
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div className={cn(s.card, hover && s.isHoverable, className)} {...props}>
      {children}
    </div>
  )
}
