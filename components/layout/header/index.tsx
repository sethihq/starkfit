'use client'

import cn from 'clsx'
import { Link } from '@/components/ui/link'
import { useWallet } from '@/hooks/use-wallet'
import s from './header.module.css'

function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function Header() {
  const { address, connected, connecting, connect, disconnect } = useWallet()

  return (
    <header className={cn(s.header)}>
      <Link href="/" className={cn(s.logo)}>
        <span className={cn(s.logoIcon)}>&#9889;</span>
        <span>StarkFit</span>
      </Link>

      {connected && address ? (
        <div className={cn(s.walletInfo)}>
          <span className={cn(s.walletAddress)}>
            <span className={cn(s.walletDot, s.isConnected)} />
            {truncateAddress(address)}
          </span>
          <button
            type="button"
            className={cn(s.disconnectButton)}
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={cn(s.connectButton)}
          onClick={connect}
          disabled={connecting}
        >
          <span className={cn(s.walletDot)} />
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </header>
  )
}
