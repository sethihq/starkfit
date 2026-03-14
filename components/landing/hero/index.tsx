'use client'

import cn from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from '@/components/ui/link'
import s from './hero.module.css'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const targets = section.querySelectorAll(`.${s.fadeUp}`)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            const delay = el.dataset.delay ?? '0'
            const visibleClass = s.isVisible
            if (!visibleClass) return
            setTimeout(() => {
              el.classList.add(visibleClass)
            }, Number(delay))
            observer.unobserve(el)
          }
        }
      },
      { threshold: 0.1 },
    )

    for (const target of targets) {
      observer.observe(target)
    }

    return () => observer.disconnect()
  }, [])

  function handleScrollToHowItWorks() {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} className={s.hero}>
      <div className={s.inner}>
        {/* Pill badge */}
        <div className={cn(s.pillRow, s.fadeUp)} data-delay="0">
          <div className={s.pillBorderTop} />
          <div className={s.pillWrap}>
            <div className={s.pill}>
              <span className={s.pillDot} />
              <span className={s.pillText}>Powered by Starknet</span>
            </div>
          </div>
          <div className={s.pillBorderBottom} />
        </div>

        {/* Headline */}
        <h1 className={cn(s.headline, s.fadeUp)} data-delay="100">
          Move or{' '}
          <span className={s.headlineAccent}>lose</span>
        </h1>

        {/* Subheadline */}
        <p className={cn(s.subheadline, s.fadeUp)} data-delay="200">
          Stake BTC. Walk 7,000 steps. Miss a day, lose your stake. Survivors split the pool.
        </p>

        {/* CTAs */}
        <div className={cn(s.ctas, s.fadeUp)} data-delay="300">
          <Link href="/challenges" className={s.ctaPrimary}>
            Enter a Challenge
            <ArrowRight className={s.ctaIcon} />
          </Link>
          <button
            type="button"
            className={s.ctaSecondary}
            onClick={handleScrollToHowItWorks}
          >
            How It Works
          </button>
        </div>

        {/* Floating stat */}
        <div className={cn(s.floatStat, s.fadeUp)} data-delay="400">
          <div className={s.floatStatInner}>
            <span className={s.floatStatDot} />
            <span>0.24 BTC on the line right now</span>
          </div>
        </div>
      </div>
    </section>
  )
}
