'use client'

import { useEffect } from 'react'
import { Wrapper } from '@/components/layout/wrapper'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <Wrapper theme="dark" className="font-mono">
      <div className="dr-gap-y-24 my-auto flex flex-col items-center justify-center">
        <h1 className="mb-4 font-bold text-4xl text-[var(--color-c12)]">
          Something went wrong
        </h1>
        <p className="mb-6 text-[var(--color-c8)] text-lg">
          A critical error occurred. Please refresh the page or try again.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-[var(--color-c5)] text-sm hover:text-[var(--color-c8)]">
              Error Details (Development Only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-[var(--color-c2)] p-4 text-[var(--color-c8)] text-xs">
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            type="button"
            className="rounded bg-[var(--color-c12)] px-6 py-3 font-semibold text-[var(--color-c1)] transition-opacity hover:opacity-90"
          >
            Try Again
          </button>
          <button
            onClick={() => {
              window.location.href = '/'
            }}
            type="button"
            className="rounded border border-[var(--color-c4)] px-6 py-3 text-[var(--color-c12)] transition-colors hover:bg-[var(--color-c2)]"
          >
            Go Home
          </button>
        </div>
      </div>
    </Wrapper>
  )
}
