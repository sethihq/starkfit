import type { ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Navigation } from '@/components/layout/navigation'
import { Theme } from '@/components/layout/theme'
import s from './layout.module.css'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Theme theme="dark" global>
      <Header />
      <main id="main-content" className="relative flex grow flex-col">
        <div className={s.layout}>{children}</div>
      </main>
      <Navigation />
    </Theme>
  )
}
