'use client'

import { Link } from '@/components/ui/link'
import { formatAddress, formatBTC } from '@/utils/format'
import s from './claim-success.module.css'

interface ClaimSuccessProps {
  amount: number
  txHash: string
  className?: string
}

export function ClaimSuccess({ amount, txHash, className }: ClaimSuccessProps) {
  const shareText = encodeURIComponent(
    'I just completed a 30-day fitness challenge and earned BTC! \u{1F3C3}\u200D\u2642\uFE0F\u{1F4AA} #StarkZap #Starknet'
  )
  const shareUrl = `https://x.com/intent/tweet?text=${shareText}`

  return (
    <div className={className}>
      <div className={s.root}>
        {/* Animated checkmark */}
        <div className={s.checkmarkContainer}>
          <svg
            className={s.checkmarkSvg}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path className={s.checkmarkPath} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className={s.title}>Reward Claimed!</h2>

        <p className={s.amountText}>
          <span className={s.amountHighlight}>{formatBTC(amount)}</span> sent to
          your wallet
        </p>

        {/* StarkZap SDK: claimed-via badge */}
        <div className={s.sdkBadge}>
          <span className={s.sdkBadgeIcon}>&#x26A1;</span>
          <span className={s.sdkBadgeLabel}>Claimed via StarkZap SDK</span>
          <span className={s.sdkBadgeSub}>Gasless via AVNU Paymaster</span>
        </div>

        <div className={s.txHash}>{formatAddress(txHash)}</div>

        <div className={s.actions}>
          <Link href={shareUrl} className={s.shareButton}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Share on X
          </Link>

          <Link href="/" className={s.backButton}>
            Back to Challenges
          </Link>
        </div>
      </div>
    </div>
  )
}
