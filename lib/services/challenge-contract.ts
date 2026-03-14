/**
 * Mock challenge contract service
 *
 * Simulates blockchain contract calls with artificial delays.
 * No real transactions occur.
 */

function generateTxHash(): string {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)]
  }
  return hash
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function joinChallenge(
  _challengeId: string
): Promise<{ txHash: string }> {
  await delay(1200 + Math.random() * 800)
  return { txHash: generateTxHash() }
}

export async function submitDailySteps(
  _challengeId: string,
  _steps: number
): Promise<boolean> {
  await delay(1000 + Math.random() * 1000)
  return true
}

export async function claimReward(
  _challengeId: string
): Promise<{ txHash: string; amount: number }> {
  await delay(1500 + Math.random() * 500)
  return {
    txHash: generateTxHash(),
    amount: 0.015 + Math.random() * 0.01,
  }
}
