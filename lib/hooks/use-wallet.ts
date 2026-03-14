'use client'

/**
 * Wallet connection hook using starknetkit.
 *
 * Opens the starknetkit modal which supports:
 * - Ready (ArgentX) browser extension
 * - Braavos browser extension
 * - Ready web wallet (email login, no extension needed)
 * - Argent Mobile (WalletConnect QR)
 */

import { useState, useEffect } from 'react'
import {
  connect as starknetkitConnect,
  disconnect as starknetkitDisconnect,
} from 'starknetkit'
import type { StarknetWindowObject } from 'starknetkit'
import { useChallengeStore } from '@/hooks/use-challenge-store'

interface UseWalletReturn {
  address: string | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  wallet: StarknetWindowObject | null
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null)
  const [connecting, setConnecting] = useState(false)

  const storeWallet = useChallengeStore((state) => state.wallet)
  const storeConnect = useChallengeStore((state) => state.connectWallet)
  const storeDisconnect = useChallengeStore((state) => state.disconnectWallet)

  // Attempt silent reconnect on mount
  useEffect(() => {
    async function reconnect() {
      try {
        const result = await starknetkitConnect({
          modalMode: 'neverAsk',
        })

        if (
          result &&
          result.wallet &&
          result.connectorData?.account
        ) {
          setWallet(result.wallet)
          storeConnect(result.connectorData.account)
        }
      } catch (_error: unknown) {
        // Silent reconnect failed -- no action needed
      }
    }

    reconnect()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function connect() {
    setConnecting(true)

    try {
      const result = await starknetkitConnect({
        modalMode: 'alwaysAsk',
        modalTheme: 'dark',
        dappName: 'StarkZap',
      })

      if (
        result &&
        result.wallet &&
        result.connectorData?.account
      ) {
        setWallet(result.wallet)
        storeConnect(result.connectorData.account)
      }
    } catch (_error: unknown) {
      // Connection cancelled or failed -- user can retry
    } finally {
      setConnecting(false)
    }
  }

  async function disconnect() {
    try {
      await starknetkitDisconnect({ clearLastWallet: true })
    } catch (_error: unknown) {
      // Disconnect error -- clear state anyway
    }

    setWallet(null)
    storeDisconnect()
  }

  return {
    address: storeWallet.address,
    connected: storeWallet.connected,
    connecting,
    connect,
    disconnect,
    wallet,
  }
}
