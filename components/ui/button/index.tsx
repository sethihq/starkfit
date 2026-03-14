import cn from 'clsx'
import type { ComponentProps, ReactNode } from 'react'
import s from './button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        s.button,
        s[variant],
        s[size],
        loading && s.isLoading,
        disabled && s.isDisabled,
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={s.spinner} aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            />
          </svg>
        </span>
      )}
      {icon && !loading && <span className={s.icon}>{icon}</span>}
      {children && <span className={s.label}>{children}</span>}
    </button>
  )
}
