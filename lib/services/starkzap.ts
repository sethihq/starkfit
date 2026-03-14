/**
 * StarkZap SDK -- Integration Service
 *
 * Wraps the StarkZap SDK for BTC staking in fitness challenges.
 * Uses gasless transactions via AVNU Paymaster (feeMode: "sponsored").
 *
 * For hackathon demo: each SDK call attempts real execution first,
 * then falls back to mock behavior with detailed console logs showing
 * exactly what the SDK call would do.
 */

import type { StarkSDK, WalletInterface } from 'starkzap'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// StarkZap SDK: Sepolia staking contract (auto-configured by network preset)
const STAKING_CONTRACT =
  '0x03745ab04a431fc02871a139be6b93d9260b0ff3e779ad9c8b377183b23109f1'

// StarkZap SDK: WBTC token config for Amount.parse()
const WBTC_DECIMALS = 8
const WBTC_SYMBOL = 'WBTC'

// StarkZap SDK: Sepolia validator pool (Nethermind)
const DEFAULT_POOL_ADDRESS =
  '0x04a84a3b1a64c4e992b904e93b127d4e5543c2c2e71f2e3b0f06e40c0e8277f5'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StakeResult {
  txHash: string
  amount: number
  poolAddress: string
  status: 'confirmed' | 'mock'
}

interface ClaimResult {
  txHash: string
  rewardsAmount: number
  status: 'confirmed' | 'mock'
}

interface PoolBalance {
  staked: number
  rewards: number
  total: number
  isMember: boolean
}

interface WalletInitResult {
  address: string
  status: 'connected' | 'mock'
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateMockTxHash(): string {
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

// ---------------------------------------------------------------------------
// StarkZap Service
// ---------------------------------------------------------------------------

class StarkZapService {
  private sdkInstance: StarkSDK | null = null
  private walletInstance: WalletInterface | null = null
  private initialized = false

  /**
   * StarkZap SDK: Initialize the SDK client
   *
   * Creates a StarkZap (StarkSDK) instance configured for Sepolia testnet.
   * The SDK auto-configures staking contract, RPC, and paymaster.
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // StarkZap SDK: import and initialize
      const { StarkZap, fromAddress } = await import('starkzap')

      this.sdkInstance = new StarkZap({
        network: 'sepolia',
        staking: {
          contract: fromAddress(STAKING_CONTRACT),
        },
      })

      this.initialized = true
      console.log('[StarkZap SDK] Initialized on Sepolia network')
      console.log('[StarkZap SDK] Staking contract:', STAKING_CONTRACT)
    } catch (_error: unknown) {
      // StarkZap SDK: graceful fallback for hackathon demo
      console.log(
        '[StarkZap SDK] Running in demo mode -- SDK calls will be simulated'
      )
      console.log('[StarkZap SDK] Would initialize with:', {
        network: 'sepolia',
        stakingContract: STAKING_CONTRACT,
      })
      this.initialized = true
    }
  }

  /**
   * StarkZap SDK: Social login via Privy strategy
   *
   * Creates a smart wallet for the user using email-based onboarding.
   * No seed phrases, no browser extensions -- just email or Google login.
   *
   * Uses sdk.onboard({ strategy: OnboardStrategy.Privy, privy: { resolve } })
   */
  async initializeWallet(email: string): Promise<WalletInitResult> {
    await this.initialize()

    try {
      if (this.sdkInstance) {
        // StarkZap SDK: onboard with Privy social login
        const { OnboardStrategy } = await import('starkzap')

        const result = await this.sdkInstance.onboard({
          strategy: OnboardStrategy.Privy,
          privy: {
            // Privy resolve function would be provided by Privy SDK integration
            resolve: async () => ({
              walletId: `privy-${email}`,
              publicKey: '0x0',
            }),
          },
          deploy: 'if_needed',
          feeMode: 'sponsored',
        })

        this.walletInstance = result.wallet
        const address = result.wallet.address as string

        console.log('[StarkZap SDK] Wallet connected via Privy:', address)
        return { address, status: 'connected' }
      }
    } catch (_error: unknown) {
      console.log('[StarkZap SDK] Privy onboard fallback -- demo mode')
    }

    // StarkZap SDK: mock fallback for hackathon demo
    await delay(800)
    const mockAddress = `0x0${email
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 10)
      .padEnd(10, '0')}${'0'.repeat(53)}`

    console.log('[StarkZap SDK] initializeWallet() called with:', {
      strategy: 'OnboardStrategy.Privy',
      email,
      deploy: 'if_needed',
      feeMode: 'sponsored',
    })
    console.log('[StarkZap SDK] Mock wallet address:', mockAddress)

    return { address: mockAddress, status: 'mock' }
  }

  /**
   * StarkZap SDK: Stake BTC into a challenge pool (gasless)
   *
   * Uses wallet.stake() which auto-detects enterPool vs addToPool.
   * Transaction fees are sponsored via AVNU Paymaster -- zero gas for user.
   *
   * Maps to fitness challenge: "Stake to join challenge"
   */
  async stakeIntoChallengePool(
    challengeId: string,
    amount: number
  ): Promise<StakeResult> {
    await this.initialize()

    const poolAddress = this.getPoolForChallenge(challengeId)

    try {
      if (this.walletInstance) {
        // StarkZap SDK: gasless BTC staking
        const { Amount, fromAddress } = await import('starkzap')

        // StarkZap SDK: Amount.parse(value, decimals, symbol) for WBTC
        const stakeAmount = Amount.parse(
          amount.toString(),
          WBTC_DECIMALS,
          WBTC_SYMBOL
        )

        // StarkZap SDK: gasless via AVNU Paymaster (feeMode: "sponsored")
        const tx = await this.walletInstance.stake(
          fromAddress(poolAddress),
          stakeAmount,
          { feeMode: 'sponsored' }
        )

        await tx.wait()

        console.log(
          '[StarkZap SDK] Staked',
          amount,
          'WBTC into pool:',
          poolAddress
        )
        console.log('[StarkZap SDK] Tx hash:', tx.hash)
        console.log('[StarkZap SDK] Fee mode: sponsored (gasless via AVNU)')

        return {
          txHash: tx.hash,
          amount,
          poolAddress,
          status: 'confirmed',
        }
      }
    } catch (_error: unknown) {
      console.log('[StarkZap SDK] stakeIntoChallengePool fallback -- demo mode')
    }

    // StarkZap SDK: mock fallback for hackathon demo
    await delay(1200 + Math.random() * 800)
    const mockTxHash = generateMockTxHash()

    console.log('[StarkZap SDK] stakeIntoChallengePool() called with:', {
      challengeId,
      amount: `${amount} WBTC`,
      poolAddress,
      feeMode: 'sponsored (gasless via AVNU Paymaster)',
      sdkCall: `wallet.stake(fromAddress("${poolAddress}"), Amount.parse("${amount}", ${WBTC_DECIMALS}, "${WBTC_SYMBOL}"), { feeMode: "sponsored" })`,
    })

    return {
      txHash: mockTxHash,
      amount,
      poolAddress,
      status: 'mock',
    }
  }

  /**
   * StarkZap SDK: Claim challenge rewards (gasless)
   *
   * Uses wallet.claimPoolRewards() to collect STRK staking rewards.
   * In the fitness challenge context: winner claims their share of the prize pool.
   *
   * Maps to fitness challenge: "Claim winnings after completing challenge"
   */
  async claimChallengeReward(challengeId: string): Promise<ClaimResult> {
    await this.initialize()

    const poolAddress = this.getPoolForChallenge(challengeId)

    try {
      if (this.walletInstance) {
        // StarkZap SDK: gasless reward claim
        const { fromAddress } = await import('starkzap')

        const tx = await this.walletInstance.claimPoolRewards(
          fromAddress(poolAddress),
          { feeMode: 'sponsored' }
        )

        await tx.wait()

        console.log('[StarkZap SDK] Rewards claimed from pool:', poolAddress)
        console.log('[StarkZap SDK] Tx hash:', tx.hash)

        return {
          txHash: tx.hash,
          rewardsAmount: 0, // Real amount comes from position query
          status: 'confirmed',
        }
      }
    } catch (_error: unknown) {
      console.log('[StarkZap SDK] claimChallengeReward fallback -- demo mode')
    }

    // StarkZap SDK: mock fallback for hackathon demo
    await delay(1500 + Math.random() * 500)
    const mockTxHash = generateMockTxHash()
    const mockRewards = 0.015 + Math.random() * 0.01

    console.log('[StarkZap SDK] claimChallengeReward() called with:', {
      challengeId,
      poolAddress,
      feeMode: 'sponsored (gasless via AVNU Paymaster)',
      sdkCall: `wallet.claimPoolRewards(fromAddress("${poolAddress}"), { feeMode: "sponsored" })`,
    })

    return {
      txHash: mockTxHash,
      rewardsAmount: mockRewards,
      status: 'confirmed',
    }
  }

  /**
   * StarkZap SDK: Query pool position and balance
   *
   * Uses wallet.getPoolPosition() to check staked amount, rewards, and membership.
   * Used to display real-time challenge stake info in the UI.
   */
  async getPoolBalance(challengeId: string): Promise<PoolBalance> {
    await this.initialize()

    const poolAddress = this.getPoolForChallenge(challengeId)

    try {
      if (this.walletInstance) {
        // StarkZap SDK: query pool position
        const { fromAddress } = await import('starkzap')

        const pool = fromAddress(poolAddress)
        const position = await this.walletInstance.getPoolPosition(pool)
        const isMember = await this.walletInstance.isPoolMember(pool)

        if (position) {
          // PoolMember.staked, .rewards, .total are Amount instances
          const staked = Number.parseFloat(position.staked.toUnit())
          const rewards = Number.parseFloat(position.rewards.toUnit())

          console.log('[StarkZap SDK] Pool position:', {
            staked,
            rewards,
            total: staked + rewards,
            isMember,
          })

          return { staked, rewards, total: staked + rewards, isMember }
        }
      }
    } catch (_error: unknown) {
      console.log('[StarkZap SDK] getPoolBalance fallback -- demo mode')
    }

    // StarkZap SDK: mock fallback for hackathon demo
    console.log('[StarkZap SDK] getPoolBalance() called with:', {
      challengeId,
      poolAddress,
      sdkCall: `wallet.getPoolPosition(fromAddress("${poolAddress}"))`,
    })

    return {
      staked: 0.01,
      rewards: 0.0003,
      total: 0.0103,
      isMember: true,
    }
  }

  /**
   * Maps a challenge ID to a validator pool address.
   * In production, this would be a lookup table or on-chain registry.
   * For hackathon demo, all challenges map to the same Sepolia pool.
   */
  private getPoolForChallenge(_challengeId: string): string {
    // StarkZap SDK: each challenge maps to a validator staking pool
    // In production, different challenges could use different validators
    return DEFAULT_POOL_ADDRESS
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

/** StarkZap SDK: singleton service instance for the entire app */
export const starkzap = new StarkZapService()

// Re-export types for consumers
export type { StakeResult, ClaimResult, PoolBalance, WalletInitResult }
