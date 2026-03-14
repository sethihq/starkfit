/**
 * Wallet service
 *
 * Provides mock balance data for hackathon demo.
 * Real wallet connection is handled by starknetkit via the useWallet hook.
 */

const MOCK_BALANCE = {
  btc: 0.1542,
  strk: 2847.32,
}

export function getMockBalance(): { btc: number; strk: number } {
  return { ...MOCK_BALANCE }
}
