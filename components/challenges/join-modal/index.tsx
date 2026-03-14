'use client'

import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { Challenge, WalletState } from '@/hooks/use-challenge-store'
// StarkZap SDK: gasless BTC staking for fitness challenges
import { joinChallenge as joinChallengeContract } from '@/lib/services/challenge-contract'
import { formatBTC } from '@/utils/format'
import s from './join-modal.module.css'

interface JoinModalProps {
  open: boolean
  onClose: () => void
  challenge: Challenge
  wallet: WalletState
  onJoin: (challengeId: string) => void
}

export function JoinModal({
  open,
  onClose,
  challenge,
  wallet,
  onJoin,
}: JoinModalProps) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      // StarkZap SDK: this triggers wallet.stake() via the challenge store
      // Transaction is gasless via AVNU Paymaster (feeMode: "sponsored")
      await joinChallengeContract(challenge.id)
      onJoin(challenge.id)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Join Challenge">
      <div className={s.body}>
        <p className={s.challengeName}>{challenge.name}</p>

        {/* StarkZap SDK: powered-by badge */}
        <div className={s.sdkBadge}>
          <span className={s.sdkBadgeIcon}>&#x26A1;</span>
          <span className={s.sdkBadgeText}>Powered by StarkZap SDK</span>
        </div>

        <div className={s.stakeRow}>
          <span className={s.stakeLabel}>Stake Required</span>
          <span className={s.stakeAmount}>
            {formatBTC(challenge.stakeAmount)}
          </span>
        </div>

        <div className={s.balance}>
          <span className={s.balanceLabel}>Wallet Balance</span>
          <span className={s.balanceValue}>
            {formatBTC(wallet.balance.btc)}
          </span>
        </div>

        {/* StarkZap SDK: gasless transaction indicator */}
        <div className={s.gasless}>
          <span className={s.gaslessIcon}>&#x2728;</span>
          <span className={s.gaslessText}>
            Gasless Transaction via AVNU Paymaster
          </span>
        </div>

        <div className={s.warning}>
          <AlertTriangle size={16} className={s.warningIcon} />
          <span>Missing a day means losing your stake</span>
        </div>

        <div className={s.actions}>
          <Button
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleConfirm}
            className={s.confirmButton}
          >
            Confirm & Stake
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={loading}
            className={s.cancelButton}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  )
}
