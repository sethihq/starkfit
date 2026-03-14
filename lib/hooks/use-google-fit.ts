'use client'

/**
 * Google Fit integration hook
 *
 * Manages OAuth connection, step data fetching, and store synchronization.
 * Access token is persisted in localStorage for hackathon demo purposes.
 */

import { useEffect, useState } from 'react'
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
  const [steps, setSteps] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const updateSteps = useChallengeStore((state) => state.updateSteps)
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
    setSteps(null)
  }

  async function syncSteps() {
    if (!accessToken) return

    setIsLoading(true)

    try {
      const { start, end } = getTodayRange()
      const totalSteps = await getStepCount(accessToken, start, end)
      setSteps(totalSteps)

      // Update the active challenge with real step data
      if (activeChallengeId) {
        const challenge = challenges.find((c) => c.id === activeChallengeId)
        if (challenge) {
          const participant = challenge.participants[0]
          if (participant) {
            // Calculate the delta from what's already recorded
            const delta = Math.max(0, totalSteps - participant.todaySteps)
            if (delta > 0) {
              updateSteps(activeChallengeId, participant.id, delta)
            }
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

  return { steps, isLoading, isConnected, connect, disconnect, syncSteps }
}
