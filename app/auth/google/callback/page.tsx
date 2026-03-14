'use client'

/**
 * Google OAuth callback page
 *
 * Handles the implicit OAuth flow redirect from Google.
 * Extracts the access_token from the URL hash fragment,
 * sends it to the parent window via postMessage, then closes.
 */

import { useEffect, useState } from 'react'

type CallbackStatus = 'processing' | 'success' | 'error'

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<CallbackStatus>('processing')

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const token = params.get('access_token')

    if (token) {
      // Store token directly in case postMessage fails (same origin)
      localStorage.setItem('google_fit_access_token', token)

      // Notify the opener window
      if (window.opener) {
        window.opener.postMessage(
          { type: 'GOOGLE_FIT_TOKEN', token },
          window.location.origin
        )
      }

      setStatus('success')

      // Close popup after a brief delay so the user sees confirmation
      setTimeout(() => {
        window.close()
      }, 1500)
    } else {
      const error = params.get('error')
      console.error('Google OAuth error:', error ?? 'No access token received')
      setStatus('error')

      // Redirect to dashboard after showing error
      setTimeout(() => {
        if (window.opener) {
          window.close()
        } else {
          window.location.href = '/dashboard'
        }
      }, 3000)
    }
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        fontFamily: 'system-ui, sans-serif',
        color: '#e5e5e5',
        backgroundColor: '#0a0a0a',
      }}
    >
      {status === 'processing' && (
        <>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid #333',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p>Connecting to Google Fit...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </>
      )}

      {status === 'success' && (
        <>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Success"
            role="img"
          >
            <circle cx="24" cy="24" r="22" stroke="#4ade80" strokeWidth="3" />
            <path
              d="M14 24l7 7 13-13"
              stroke="#4ade80"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p>Connected! This window will close automatically.</p>
        </>
      )}

      {status === 'error' && (
        <>
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Error"
            role="img"
          >
            <circle cx="24" cy="24" r="22" stroke="#f87171" strokeWidth="3" />
            <path
              d="M17 17l14 14M31 17L17 31"
              stroke="#f87171"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p>Failed to connect. Redirecting...</p>
        </>
      )}
    </div>
  )
}
