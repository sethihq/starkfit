import cn from 'clsx'
import { Link } from '@/components/ui/link'
import { TWITTER_URL } from '@/utils/constants'
import s from './footer.module.css'

export function Footer() {
  return (
    <footer className={cn(s.footer)}>
      <div className={cn(s.starknet)}>
        <span className={cn(s.starknetDot)} />
        <span>Built on Starknet</span>
      </div>
      <div className={cn(s.links)}>
        <Link
          href={TWITTER_URL}
          className={cn(s.link)}
          aria-label="StarkFit on X"
        >
          X / Twitter
        </Link>
      </div>
    </footer>
  )
}
