'use client'

/**
 * Google Fit integration hook
 *
 * Manages OAuth connection, step data fetching, and store synchronization.
 * Access token is persisted in localStorage for hackathon demo purposes.
 */

import { useEffect, useRef, useState } from 'react'
import { useChallengeStore } from '@/hooks/use-challenge-store'
import {
  buildOAuthUrl,
  getStepCount,
  getTodayRange,
} from '@/lib/services/google-fit'

const STORAGE_KEY = 'google_fit_access_token'
const OAUTH_POPUP_NAME = 'google-fit-auth'
const OAUTH_POPUP_FEATURES = 'width=500,height=600,menubar=no,toolbar=no'

interface UseGoogleFitReturn {
  steps: number | null
  isLoading: boolean
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  syncSteps: () => Promise<void>
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

function setStoredToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token)
}

function removeStoredToken(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function useGoogleFit(): UseGoogleFitReturn {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [localSteps, setLocalSteps] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const setStoreSteps = useChallengeStore((state) => state.setSteps)
  const activeChallengeId = useChallengeStore(
    (state) => state.activeChallengeId
  )
  const challenges = useChallengeStore((state) => state.challenges)

  // Hydrate token from localStorage on mount
  useEffect(() => {
    const stored = getStoredToken()
    if (stored) {
      setAccessToken(stored)
    }
  }, [])

  // Listen for OAuth callback messages from the popup
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return

      const data = event.data as Record<string, unknown> | undefined
      if (
        data &&
        typeof data === 'object' &&
        data.type === 'GOOGLE_FIT_TOKEN'
      ) {
        const token = data.token
        if (typeof token === 'string') {
          setStoredToken(token)
          setAccessToken(token)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  const isConnected = accessToken !== null

  // Auto-sync steps when Google Fit is connected (on mount or after OAuth)
  const hasSyncedRef = useRef(false)
  useEffect(() => {
    if (!accessToken) {
      hasSyncedRef.current = false
      return
    }

    if (hasSyncedRef.current) return
    hasSyncedRef.current = true

    // Fetch real steps immediately when connected
    async function autoSync() {
      setIsLoading(true)
      try {
        const { start, end } = getTodayRange()
        const totalSteps = await getStepCount(accessToken!, start, end)
        setLocalSteps(totalSteps)

        if (activeChallengeId) {
          const challenge = challenges.find((c) => c.id === activeChallengeId)
          if (challenge) {
            const participant = challenge.participants[0]
            if (participant) {
              setStoreSteps(activeChallengeId, participant.id, totalSteps)
            }
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('Auto-sync Google Fit failed:', message)

        if (message.includes('401')) {
          removeStoredToken()
          setAccessToken(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    void autoSync()
  }, [accessToken, activeChallengeId, challenges, setStoreSteps])

  function connect() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.error(
        'NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Cannot initiate Google Fit OAuth.'
      )
      return
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`
    const authUrl = buildOAuthUrl(clientId, redirectUri)

    window.open(authUrl, OAUTH_POPUP_NAME, OAUTH_POPUP_FEATURES)
  }

  function disconnect() {
    removeStoredToken()
    setAccessToken(null)
    setLocalSteps(null)
  }

  async function syncSteps() {
    if (!accessToken) return

    setIsLoading(true)

    try {
      const { start, end } = getTodayRange()
      const totalSteps = await getStepCount(accessToken, start, end)
      setLocalSteps(totalSteps)

      // Replace the step count with real Google Fit data (not additive)
      if (activeChallengeId) {
        const challenge = challenges.find((c) => c.id === activeChallengeId)
        if (challenge) {
          const participant = challenge.participants[0]
          if (participant) {
            setStoreSteps(activeChallengeId, participant.id, totalSteps)
          }
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to sync Google Fit steps:', message)

      // Token might be expired
      if (message.includes('401')) {
        removeStoredToken()
        setAccessToken(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    steps: localSteps,
    isLoading,
    isConnected,
    connect,
    disconnect,
    syncSteps,
  }
}
