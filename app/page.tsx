import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { StatsBanner } from '@/components/landing/stats-banner'
import { Wrapper } from '@/components/layout/wrapper'
import { CtaSection } from './_landing/cta'
import { FeaturesSection } from './_landing/features'
import s from './page.module.css'

export default function Home() {
  return (
    <Wrapper theme="dark" lenis={{}}>
      <div className={s.page}>
        {/* Vertical guide lines */}
        <div className={s.guideLines} aria-hidden="true">
          <div className={s.guideInner}>
            <div className={`${s.guideLine} ${s.guideLineLeft}`} />
            <div className={`${s.guideLine} ${s.guideLineRight}`} />
          </div>
        </div>

        {/* Content column */}
        <div className={s.content}>
          <Hero />

          <StatsBanner />

          {/* Hatch divider */}
          <div className={s.hatch}>
            <div className={s.hatchInner} />
          </div>

          <HowItWorks />

          {/* Hatch divider */}
          <div className={s.hatch}>
            <div className={s.hatchInner} />
          </div>

          <FeaturesSection />

          {/* Hatch divider */}
          <div className={s.hatch}>
            <div className={s.hatchInner} />
          </div>

          <CtaSection />
        </div>
      </div>
    </Wrapper>
  )
}
