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
// StarkZap SDK: social login via Privy (email, Google — no seed phrases)
import { starkzap } from '@/lib/services/starkzap'

interface UseWalletReturn {
  address: string | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  wallet: StarknetWindowObject | null
  // StarkZap SDK: social login via Privy strategy
  connectWithEmail: (email: string) => Promise<void>
  connectingEmail: boolean
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<StarknetWindowObject | null>(null)
  const [connecting, setConnecting] = useState(false)
  // StarkZap SDK: track email-based login state
  const [connectingEmail, setConnectingEmail] = useState(false)

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

  /**
   * StarkZap SDK: connect wallet via email (Privy social login)
   *
   * Creates a smart wallet using email — no browser extension needed.
   * Uses OnboardStrategy.Privy under the hood.
   */
  async function connectWithEmail(email: string) {
    setConnectingEmail(true)

    try {
      // StarkZap SDK: Privy social login — gasless wallet creation
      const result = await starkzap.initializeWallet(email)
      storeConnect(result.address)
      console.log('[StarkZap SDK] Email wallet connected:', result.address, '| Status:', result.status)
    } catch (_error: unknown) {
      // StarkZap SDK: email login failed — user can retry
    } finally {
      setConnectingEmail(false)
    }
  }

  return {
    address: storeWallet.address,
    connected: storeWallet.connected,
    connecting,
    connect,
    disconnect,
    wallet,
    // StarkZap SDK: social login
    connectWithEmail,
    connectingEmail,
  }
}
