'use client'

import { Link } from '@/components/ui/link'
import { formatBTC, formatAddress } from '@/utils/format'
import s from './claim-success.module.css'

interface ClaimSuccessProps {
  amount: number
  txHash: string
  className?: string
}

export function ClaimSuccess({ amount, txHash, className }: ClaimSuccessProps) {
  const shareText = encodeURIComponent(
    'I just completed a 30-day fitness challenge and earned BTC! \u{1F3C3}\u200D\u2642\uFE0F\u{1F4AA} #StarkZap #Starknet',
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
          >
            <path
              className={s.checkmarkPath}
              d="M5 13l4 4L19 7"
            />
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
          <Link href={shareUrl}>
            <button className={s.shareButton} type="button">
              Share on X
            </button>
          </Link>

          <Link href="/">
            <button className={s.backButton} type="button">
              Back to Challenges
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
