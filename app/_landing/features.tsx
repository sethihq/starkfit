'use client'

import cn from 'clsx'
import { Shield, TrendingUp, UserCheck, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import s from '../page.module.css'

const FEATURES = [
  {
    title: 'Zero friction',
    desc: 'No gas fees. No seed phrases. Connect and go.',
    Icon: Zap,
  },
  {
    title: 'Real stakes',
    desc: 'Bitcoin on the line. Not points. Not badges. Money.',
    Icon: Shield,
  },
  {
    title: 'Idle yield',
    desc: 'Your locked BTC earns while you walk.',
    Icon: TrendingUp,
  },
  {
    title: 'Proof of work',
    desc: 'Steps verified onchain. No faking commitment.',
    Icon: UserCheck,
  },
]

export function FeaturesSection() {
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
      { threshold: 0.1 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className={s.features}>
      <div className={s.featuresHeader}>
        <p className={s.featuresLabel}>Why StarkFit</p>
        <h2 className={s.featuresTitle}>Accountability you can't negotiate with</h2>
      </div>

      <div className={s.featuresGrid}>
        {FEATURES.map((feature, i) => (
          <div
            key={feature.title}
            className={cn(s.feature, s.fadeUp, isVisible && s.isVisible)}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <feature.Icon
              className={s.featureIcon}
              strokeWidth={1.5}
            />
            <h3 className={s.featureTitle}>{feature.title}</h3>
            <p className={s.featureDesc}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
