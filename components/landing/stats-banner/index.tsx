'use client'

import cn from 'clsx'
import { useEffect, useRef, useState } from 'react'
import s from './stats-banner.module.css'

interface StatItem {
  value: string
  numericValue: number
  prefix: string
  suffix: string
  label: string
}

const STATS: StatItem[] = [
  {
    value: '0.24 BTC',
    numericValue: 0.24,
    prefix: '',
    suffix: ' BTC',
    label: 'Total Staked',
  },
  {
    value: '3',
    numericValue: 3,
    prefix: '',
    suffix: '',
    label: 'Active Challenges',
  },
  { value: '47', numericValue: 47, prefix: '', suffix: '', label: 'Winners' },
  {
    value: '2.4M',
    numericValue: 2.4,
    prefix: '',
    suffix: 'M',
    label: 'Steps Tracked',
  },
]

function animateValue(
  start: number,
  end: number,
  duration: number,
  onUpdate: (value: number) => void,
  onComplete: () => void
) {
  const startTime = performance.now()

  function tick(now: number) {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    // ease-out-quart
    const eased = 1 - (1 - progress) ** 4
    const current = start + (end - start) * eased
    onUpdate(current)

    if (progress < 1) {
      requestAnimationFrame(tick)
    } else {
      onComplete()
    }
  }

  requestAnimationFrame(tick)
}

export function StatsBanner() {
  const sectionRef = useRef<HTMLElement>(null)
  const hasAnimatedRef = useRef(false)
  const [displayValues, setDisplayValues] = useState<string[]>(
    STATS.map((stat) => `${stat.prefix}0${stat.suffix}`)
  )
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true
            setIsVisible(true)

            for (const [i, stat] of STATS.entries()) {
              const delay = i * 120
              setTimeout(() => {
                animateValue(
                  0,
                  stat.numericValue,
                  1400,
                  (val) => {
                    setDisplayValues((prev) => {
                      const next = [...prev]
                      if (Number.isInteger(stat.numericValue)) {
                        next[i] =
                          `${stat.prefix}${Math.round(val)}${stat.suffix}`
                      } else {
                        const decimals = stat.suffix === ' BTC' ? 2 : 1
                        next[i] =
                          `${stat.prefix}${val.toFixed(decimals)}${stat.suffix}`
                      }
                      return next
                    })
                  },
                  () => {
                    setDisplayValues((prev) => {
                      const next = [...prev]
                      next[i] = stat.value
                      return next
                    })
                  }
                )
              }, delay)
            }

            observer.unobserve(section)
          }
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={s.stats}>
      <div className={s.grid}>
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={cn(s.stat, s.fadeUp, isVisible && s.isVisible)}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <p className={s.value}>{displayValues[i]}</p>
            <p className={s.label}>{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
