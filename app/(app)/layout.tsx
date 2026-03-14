import type { ReactNode } from 'react'
import { Wrapper } from '@/components/layout/wrapper'
import { Navigation } from '@/components/layout/navigation'
import s from './layout.module.css'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <Wrapper theme="dark" lenis={false}>
      <div className={s.layout}>{children}</div>
      <Navigation />
    </Wrapper>
  )
}
