'use client'

import cn from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from '@/components/ui/link'
import s from '../page.module.css'

export function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(section)
          }
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={s.cta}>
      <div className={cn(s.ctaInner, s.fadeUp, isVisible && s.isVisible)}>
        <h2 className={s.ctaTitle}>Discipline pays. Literally.</h2>
        <Link href="/challenges" className={s.ctaButton}>
          Start Walking
          <ArrowRight className={s.ctaButtonIcon} />
        </Link>
        <p className={s.ctaSubtext}>
          Built on Starknet
          <span className={s.ctaSubtextDot}>&middot;</span>
          Powered by StarkZap SDK
        </p>
      </div>
    </section>
  )
}
