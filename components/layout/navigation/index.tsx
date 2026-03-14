'use client'

import cn from 'clsx'
import { BarChart3, Home, Trophy } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Link } from '@/components/ui/link'
import s from './navigation.module.css'

const TABS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/challenges', label: 'Challenges', icon: Trophy },
  { href: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
] as const

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className={s.nav}>
      {TABS.map((tab) => {
        const Icon = tab.icon
        const isActive = pathname.startsWith(tab.href)

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(s.tab, isActive && s.isActive)}
          >
            <span className={s.icon}>
              <Icon size={20} />
            </span>
            <span className={s.label}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
