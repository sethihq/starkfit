'use client'

import cn from 'clsx'
import { useEffect, useRef, useState } from 'react'
import s from './how-it-works.module.css'

const STEPS = [
  {
    step: '01',
    title: 'Put skin in the game',
    desc: 'Lock Bitcoin into a challenge pool. The amount you risk is the amount you respect.',
  },
  {
    step: '02',
    title: 'Move or lose',
    desc: '7,000 steps. Every day. No exceptions. One miss and your stake feeds the pool.',
  },
  {
    step: '03',
    title: 'Survivors split the pot',
    desc: 'Finish the challenge. Collect your stake plus everyone who quit.',
  },
]

export function HowItWorks() {
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
      { threshold: 0.15 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" ref={sectionRef} className={s.section}>
      <div className={s.header}>
        <p className={s.label}>How It Works</p>
        <h2 className={s.title}>Commitment has three steps</h2>
      </div>

      <div className={s.grid}>
        {STEPS.map((item, i) => (
          <div
            key={item.step}
            className={cn(s.step, s.fadeUp, isVisible && s.isVisible)}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <span className={s.stepNumber}>{item.step}</span>
            <h3 className={s.stepTitle}>{item.title}</h3>
            <p className={s.stepDesc}>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
