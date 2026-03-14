/**
 * Formatting utilities for the BTC Fitness Challenge
 */

export function formatBTC(amount: number): string {
  const formatted = amount.toFixed(5).replace(/0+$/, '').replace(/\.$/, '')
  return `${formatted} BTC`
}

export function formatSteps(steps: number): string {
  return steps.toLocaleString('en-US')
}

export function formatDuration(days: number): string {
  return `${days} Day${days === 1 ? '' : 's'}`
}

export function formatAddress(addr: string): string {
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}
