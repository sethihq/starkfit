# StarkZap SDK -- BTC Staking & Fitness Challenge Research

> Research compiled 2026-03-14 from GitHub source code, npm registry, Starknet docs, and ecosystem analysis.

---

## 1. StarkZap Staking API -- Complete Method Reference

The SDK exposes staking through two layers: `WalletInterface` (high-level) and the `Staking` class (low-level). Both work with **any stakeable token** -- STRK and BTC variants alike.

### 1a. Wallet-Level Methods (Recommended)

These live on the connected `wallet` object returned by `sdk.onboard()`.

```typescript
// Pool discovery
const tokens = await sdk.stakingTokens();              // Returns Token[] (STRK, WBTC, etc.)
const pools = await sdk.getStakerPools(validatorAddr); // Returns Pool[]

// Join a pool (new member)
await wallet.enterPool(poolAddress, Amount.parse("0.01", wbtcToken), options?);

// Add to existing stake (already a member)
await wallet.addToPool(poolAddress, Amount.parse("0.005", wbtcToken), options?);

// Smart stake -- auto-detects enter vs add
await wallet.stake(poolAddress, Amount.parse("0.01", wbtcToken), options?);

// Claim accumulated rewards
await wallet.claimPoolRewards(poolAddress, options?);

// Two-step exit process
await wallet.exitPoolIntent(poolAddress, Amount.parse("0.005", wbtcToken), options?);
// ... wait for cooldown window ...
await wallet.exitPool(poolAddress, options?);

// Query position and membership
const isMember = await wallet.isPoolMember(poolAddress);          // boolean
const position = await wallet.getPoolPosition(poolAddress);       // PoolMember | null
const commission = await wallet.getPoolCommission(poolAddress);   // number (percentage)
```

### 1b. Staking Class (Low-Level)

The `Staking` class provides direct access and "populate" methods that build raw Call objects without executing.

```typescript
import { Staking } from "starkzap";

// Factory methods
const staking = await Staking.fromPool(poolAddress, provider, config, options?);
const staking = await Staking.fromStaker(stakerAddress, token, provider, config);

// Static queries
const tokens = await Staking.activeTokens(provider, config);     // Token[]
const pools = await Staking.getStakerPools(provider, stakerAddr, config); // Pool[]

// Instance methods
await staking.enter(wallet, amount, options?);    // Join pool
await staking.add(wallet, amount, options?);      // Add to stake
await staking.stake(wallet, amount, options?);     // Auto enter/add

await staking.claimRewards(wallet, options?);
await staking.exitIntent(wallet, amount, options?);
await staking.exit(wallet, options?);

const position = await staking.getPosition(walletOrAddress); // PoolMember | null
const commission = await staking.getCommission();             // number
const isMember = await staking.isMember(wallet);              // boolean

// Populate methods (build calls without executing)
const calls: Call[] = staking.populateEnter(walletAddress, amount);
const calls: Call[] = staking.populateAdd(walletAddress, amount);
const call: Call = staking.populateClaimRewards(walletAddress);
const call: Call = staking.populateExitIntent(amount);
const call: Call = staking.populateExit(walletAddress);
```

### 1c. Key Types

```typescript
interface Pool {
  poolContract: Address;      // Pool contract address
  token: Token;               // Token this pool accepts
  amount: bigint;             // Total validator stake
}

interface PoolMember {
  staked: Amount;             // Active stake
  rewards: Amount;            // Unclaimed rewards
  total: Amount;              // staked + rewards
  unpooling: Amount;          // Amount in exit queue
  unpoolTime: number;         // Exit completion timestamp
  commissionPercent: number;  // Validator fee %
  rewardAddress: Address;     // Where rewards go
}

interface Validator {
  name: string;
  stakerAddress: Address;
  logoUrl: URL | null;
}
```

---

## 2. BTC Tokens on Starknet

### 2a. Mainnet BTC Tokens (Live)

| Token | Symbol | Decimals | Address | Notes |
|-------|--------|----------|---------|-------|
| Wrapped BTC | WBTC | 8 | `0x03fe2b97c...` | Standard wrapped Bitcoin |
| Starknet tBTC | tBTC | 18 | `0x04daa177...` | Threshold BTC |
| Lombard Staked Bitcoin | LBTC | 8 | `0x036834a4...` | Pre-staked BTC (Lombard) |
| Solv BTC | SolvBTC | 18 | `0x059e034d...` | Solv Protocol BTC |
| Endur xWBTC | xWBTC | 8 | `0x06a567e6...` | Liquid staked WBTC (Endur) |
| Endur xtBTC | xtBTC | 18 | `0x043a35c1...` | Liquid staked tBTC (Endur) |
| Endur xLBTC | xLBTC | 8 | `0x07dd3c80...` | Liquid staked LBTC (Endur) |
| Endur xsBTC | xsBTC | 18 | `0x058f3dc5...` | Liquid staked sBTC (Endur) |
| ForgeYieldsWBTC | fyWBTC | 8 | `0x04dd39de...` | Yield-bearing WBTC |
| Midas Re7 BTC | mRe7BTC | 18 | `0x04e4fb1a...` | Midas yield BTC |

### 2b. Sepolia Test BTC Tokens

| Token | Symbol | Decimals | Address |
|-------|--------|----------|---------|
| Mock BTC | mBTC | 18 | `0x00aa2ba1...` |
| Mock tBTC | tBTC | 18 | `0x0315e7b7...` |
| Wrapped Bitcoin | WBTC | 8 | `0x020d208b...` |
| TestBTC1 | TBTC1 | 8 | `0x044ad077...` |
| TestBTC2 | TBTC2 | 8 | `0x07e97477...` |

Multiple WBTC addresses exist on Sepolia for testing different scenarios.

---

## 3. Staking Contract Architecture

### 3a. Contract Addresses

| Chain | Staking Contract |
|-------|-----------------|
| Mainnet | `0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7` |
| Sepolia | `0x03745ab04a431fc02871a139be6b93d9260b0ff3e779ad9c8b377183b23109f1` |

### 3b. How Staking Works on Starknet

Starknet uses a **validator delegation model**:

1. **Validators** run nodes and register with the staking contract (minimum 20K STRK)
2. **Validators create pools** for specific tokens (STRK, WBTC, etc.)
3. **Delegators** join pools by staking tokens -- no minimum requirement
4. **Rewards** accrue in STRK regardless of which token was staked
5. **LSTs** (Liquid Staking Tokens) are available from day one via Endur (xSTRK, xWBTC, etc.)

### 3c. Delegation Flow

```
User stakes WBTC
  -> Approved to Pool Contract
  -> Pool tracks position (staked, rewards, unpooling)
  -> STRK rewards accrue over time
  -> User can claim rewards or exit (with cooldown)
```

### 3d. Exit Process

The exit is a two-step process with a cooldown window:

1. `exitPoolIntent(amount)` -- declares exit intent, amount stops earning immediately
2. Wait for cooldown period (chain-determined)
3. `exitPool()` -- finalizes withdrawal, tokens return to wallet

Only one exit intent can be active at a time.

### 3e. Validators Available

**Mainnet:** 200+ validators including Binance, Braavos, Nethermind, Nansen, P2P.org, Figment, Validation Cloud.

**Sepolia:** 18 validators including moonli.me, Keplr, Nethermind, Cumulo, Chorus One.

---

## 4. SDK Configuration for BTC Staking

### 4a. Minimum Setup

```typescript
import { StarkZap, OnboardStrategy, StarkSigner, Amount, fromAddress } from "starkzap";

// SDK with staking config
const sdk = new StarkZap({
  network: "sepolia",
  staking: {
    contract: fromAddress(
      "0x03745ab04a431fc02871a139be6b93d9260b0ff3e779ad9c8b377183b23109f1"
    ),
  },
});

// Connect wallet
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Signer,
  account: { signer: new StarkSigner("0xPRIVATE_KEY") },
  deploy: "if_needed",
});
```

### 4b. Discovering BTC Pools

```typescript
// Get all stakeable tokens
const tokens = await sdk.stakingTokens();
const btcToken = tokens.find(t => t.symbol === "WBTC");

// Find a validator's pools
const pools = await sdk.getStakerPools(fromAddress("0xVALIDATOR_ADDRESS"));
const btcPool = pools.find(p => p.token.symbol === "WBTC");
```

### 4c. Complete BTC Staking Flow

```typescript
// 1. Check balance
const balance = await wallet.balanceOf(wbtcToken);
console.log(`WBTC balance: ${balance.formatted()}`);

// 2. Stake BTC
const stakeTx = await wallet.stake(
  btcPool.poolContract,
  Amount.parse("0.01", wbtcToken)
);
await stakeTx.wait();

// 3. Check position
const position = await wallet.getPoolPosition(btcPool.poolContract);
console.log(`Staked: ${position.staked.formatted()}`);
console.log(`Rewards: ${position.rewards.formatted()}`);

// 4. Claim rewards
const claimTx = await wallet.claimPoolRewards(btcPool.poolContract);
await claimTx.wait();

// 5. Exit (two-step)
const exitIntentTx = await wallet.exitPoolIntent(
  btcPool.poolContract,
  Amount.parse("0.005", wbtcToken)
);
await exitIntentTx.wait();

// ... after cooldown ...
const exitTx = await wallet.exitPool(btcPool.poolContract);
await exitTx.wait();
```

---

## 5. Mocking Contract Calls for a Hackathon Demo

The SDK has no built-in mock mode. Three strategies for a hackathon demo:

### 5a. Strategy 1: Mock the Wallet (Recommended for Hackathon)

Wrap the wallet interface to intercept staking calls and return fake data.

```typescript
import type { WalletInterface } from "starkzap";

class MockWallet implements Partial<WalletInterface> {
  private positions: Map<string, PoolMember> = new Map();

  async stake(poolAddress: Address, amount: Amount): Promise<MockTx> {
    const existing = this.positions.get(poolAddress.toString());
    if (existing) {
      // Simulate addToPool
      existing.staked = Amount.fromBase(
        existing.staked.base + amount.base,
        amount.token
      );
    } else {
      // Simulate enterPool
      this.positions.set(poolAddress.toString(), {
        staked: amount,
        rewards: Amount.parse("0", amount.token),
        total: amount,
        unpooling: Amount.parse("0", amount.token),
        unpoolTime: 0,
        commissionPercent: 5,
        rewardAddress: this.address,
      });
    }
    return new MockTx();
  }

  async getPoolPosition(poolAddress: Address): Promise<PoolMember | null> {
    return this.positions.get(poolAddress.toString()) ?? null;
  }

  async claimPoolRewards(poolAddress: Address): Promise<MockTx> {
    const position = this.positions.get(poolAddress.toString());
    if (position) {
      position.rewards = Amount.parse("0", position.rewards.token);
    }
    return new MockTx();
  }
}

class MockTx {
  hash = "0xMOCK_TX_HASH";
  async wait() { return { status: "ACCEPTED_ON_L2" }; }
}
```

### 5b. Strategy 2: Use Sepolia Testnet (Best for Demo Credibility)

Real transactions on testnet. Requires a funded account.

```typescript
const sdk = new StarkZap({ network: "sepolia" });

// Use Starknet Sepolia Faucet to get test STRK
// Then swap STRK -> test WBTC on AVNU
// Then stake test WBTC on a Sepolia validator pool
```

Available Sepolia BTC tokens: mBTC, WBTC, tBTC, TBTC1, TBTC2.
Available Sepolia validators: 18 including Nethermind, Keplr, Chorus One.

### 5c. Strategy 3: Direct Contract Calls with Fake Provider

Mock the RPC provider to return canned responses.

```typescript
class MockProvider {
  async callContract({ contractAddress, entrypoint, calldata }) {
    if (entrypoint === "pool_member_info") {
      return {
        result: [
          "0x38D7EA4C68000",  // staked: 0.001 BTC
          "0x5AF3107A4000",   // rewards: 0.0001 BTC
          "0x0",              // unpooling: 0
          "0x0",              // unpoolTime: 0
          "0x5",              // commission: 5%
        ],
      };
    }
    return { result: ["0x1"] };
  }
}
```

### 5d. Strategy 4: Populate + Display (No Execution)

Use the `populate*` methods to build calls and show them in the UI without sending.

```typescript
const staking = await Staking.fromPool(poolAddress, provider, config);
const calls = staking.populateEnter(walletAddress, amount);

// Display in UI: "This would stake 0.01 WBTC to Nethermind pool"
// Show the contract address, entrypoint, and calldata
// No actual transaction needed
```

---

## 6. Ecosystem Projects Using StarkZap Staking

### 6a. StarkYield (Production App)

**URL:** https://starkyield.vercel.app/
**GitHub:** github.com/nicblockchain/starkyield (private or moved)

- BTC and STRK staking dashboard
- Custom adapter bridges browser wallets (ArgentX, Braavos) to StarkZap
- Uses `wallet.getPoolPosition()`, `wallet.stake()`, `wallet.claimPoolRewards()`
- Position consolidation across multiple validators

```typescript
// Pattern from StarkYield
class InjectedStarkzapWallet extends BaseWallet {
  // Wraps starknet.js Account into StarkZap wallet interface
}

const position = await wallet.getPoolPosition(poolAddress);
await wallet.stake(poolAddress, Amount.parse("100", strkToken));
await wallet.claimPoolRewards(poolAddress);
```

### 6b. StarkZap Demo (Endur LST Integration)

**GitHub:** github.com/EjembiEmmanuel/starkzap-demo

- Endur liquid staking test UI
- getAPY, getTVL from Endur API
- Deposit/withdraw STRK via Endur
- Uses Vite + TypeScript

### 6c. Gift App

- Token gifting with integrated staking yields
- Uses Privy, Cartridge, and staking modules

### 6d. StarkSplit

- Bill-splitting with gasless settlements and STRK staking
- Auto-stakes idle balances

---

## 7. Fitness + Staking Projects in Web3

### 7a. No Fitness+Staking Projects Exist on Starknet

After thorough research: **zero fitness challenge, move-to-earn, or health dApps exist on Starknet as of March 2026.** This is a wide open space.

The closest Starknet project is **Focus Tree** -- a web3 focus/wellness app where users grow a virtual garden by staying off their phone. It has crypto incentives but is not fitness or staking related.

### 7b. Move-to-Earn Projects on Other Chains

| Project | Chain | How It Works | Staking Mechanic |
|---------|-------|-------------|-----------------|
| **STEPN** | Solana, BNB, Ethereum, Polygon, Astar | Buy NFT sneakers, walk/run to earn GST/GMT tokens. GPS-verified activity. | GMT staking for governance + yield. NFT sneakers are staked assets. |
| **Sweatcoin/Sweat Economy** | NEAR | Steps counted via phone. Earn SWEAT tokens. | SWEAT staking for higher earning rates and premium features. |
| **Step App** | Avalanche | NFT sneakers, GPS-tracked movement. Earn FITFI tokens. | FITFI staking required to participate. |
| **Genopets** | Solana | RPG game where physical activity evolves your pet. | Gene crystal staking for enhanced rewards. |
| **Dustland** | Polygon | Audio adventure fitness game. Run/walk to progress story. | NFT staking for early access and boosts. |
| **WIRTUAL** | BNB, Ethereum | Multi-sport tracking (run, swim, cycle). Earn WIRTUAL tokens. | Token staking for multiplied rewards. |
| **OliveX/DOE** | BNB | Fitness metaverse. Exercise games with NFT rewards. | DOE token staking. |
| **Walken** | Solana | Walk-to-earn with NFT characters. Casual fitness game. | Token staking for character upgrades. |

### 7c. Common Patterns in Fitness+Staking

Every successful fitness+staking project shares these mechanics:

1. **Stake to participate:** Users lock tokens/NFTs before earning is possible
2. **Activity verification:** GPS, accelerometer, or health API data proves movement
3. **Reward distribution:** Rewards proportional to (activity * stake * multiplier)
4. **Cooldown on exit:** Unstaking takes time (prevents hit-and-run gaming)
5. **Social challenges:** Group goals, leaderboards, time-bound competitions
6. **Tiered rewards:** Bigger stakes unlock higher earning rates

### 7d. Why Fitness+Staking on Starknet Is a Strong Play

| Factor | Advantage |
|--------|-----------|
| Zero competition | No M2E or fitness apps on Starknet |
| BTC staking narrative | "Stake BTC and earn by working out" is a novel hook |
| Gasless via AVNU | Users never see gas fees -- critical for fitness app UX |
| Social login via Cartridge/Privy | No wallet setup -- sign in with Google and start moving |
| Starknet Foundation backing | StarkZap is officially endorsed; fitness app would benefit |
| BTC DeFi narrative | Starknet's #1 brand push is Bitcoin DeFi; a fitness app using BTC staking aligns perfectly |

---

## 8. Hackathon Demo Architecture: Fitness Challenge + BTC Staking

### 8a. How It Could Work

```
User signs in (Cartridge/Privy -- no wallet setup)
  -> Stakes WBTC/STRK into a challenge pool (StarkZap SDK)
  -> Completes fitness challenges (steps, workouts, etc.)
  -> On-chain progress tracked via contract calls
  -> Challenge completion triggers reward claim
  -> Failure to complete = stake slashed (redistributed to completers)
```

### 8b. StarkZap Methods Mapped to Fitness Challenge

| Feature | StarkZap Method | Notes |
|---------|----------------|-------|
| Create challenge pool | `wallet.enterPool()` | User stakes into validator pool |
| Join existing challenge | `wallet.addToPool()` | Add stake to running challenge |
| Auto-join | `wallet.stake()` | Handles enter vs add automatically |
| Check stake | `wallet.getPoolPosition()` | Show user their staked amount |
| Complete challenge | `wallet.claimPoolRewards()` | Claim earned STRK rewards |
| Forfeit/timeout | `wallet.exitPoolIntent()` | Start exit (simulate "slash") |
| Withdraw after cooldown | `wallet.exitPool()` | Get remaining tokens back |
| Check membership | `wallet.isPoolMember()` | Verify user is in challenge |

### 8c. Custom Challenge Contract (For Full Implementation)

StarkZap's staking is validator delegation, not challenge-specific. A production fitness app would need a custom Cairo contract that wraps the staking logic:

```cairo
// Simplified challenge contract pseudocode
#[starknet::contract]
mod FitnessChallenge {
    // Stores challenge metadata
    struct Challenge {
        creator: ContractAddress,
        stake_token: ContractAddress,
        min_stake: u256,
        goal_steps: u64,
        deadline: u64,
        total_staked: u256,
    }

    // Records participant progress
    struct Participant {
        staked: u256,
        steps_completed: u64,
        joined_at: u64,
    }

    #[external(v0)]
    fn create_challenge(ref self: ContractState, ...) { }

    #[external(v0)]
    fn join_challenge(ref self: ContractState, challenge_id: u64, amount: u256) { }

    #[external(v0)]
    fn record_progress(ref self: ContractState, challenge_id: u64, steps: u64) { }

    #[external(v0)]
    fn complete_challenge(ref self: ContractState, challenge_id: u64) { }
}
```

### 8d. Hackathon Shortcut: Use StarkZap Staking as the "Challenge Pool"

For a hackathon demo, you can use StarkZap's existing staking infrastructure as a proxy for challenge pools:

1. **"Stake to join challenge"** = `wallet.stake(validatorPool, btcAmount)`
2. **"Challenge progress"** = tracked off-chain or via simple contract calls
3. **"Earn rewards for completing"** = `wallet.claimPoolRewards(validatorPool)`
4. **"Forfeit on failure"** = `wallet.exitPoolIntent()` + `exitPool()`

The rewards users earn from staking are real STRK rewards from Starknet's staking system. The fitness challenge layer sits on top as application logic.

### 8e. Transaction Builder for Challenge Operations

Batch multiple operations into one transaction:

```typescript
// Single atomic transaction: approve + stake + record challenge join
const result = await wallet.tx()
  .add({
    contractAddress: CHALLENGE_CONTRACT,
    entrypoint: "join_challenge",
    calldata: [challengeId, btcAmount],
  })
  .add({
    contractAddress: BTC_TOKEN,
    entrypoint: "approve",
    calldata: [POOL_ADDRESS, btcAmount],
  })
  .execute({ feeMode: { mode: "sponsored" } });
```

---

## 9. Key Findings Summary

### What the SDK Can Do Today

- Stake any supported token (STRK, WBTC, tBTC, LBTC, SolvBTC) into validator delegation pools
- Full lifecycle: discover pools, enter, add, claim rewards, exit (with cooldown)
- 200+ mainnet validators, 18 Sepolia validators
- Gasless execution via AVNU Paymaster
- Social login via Privy or Cartridge (no seed phrases)
- 10 BTC-variant tokens on mainnet, 8 on Sepolia testnet
- `populate*` methods enable building calls without executing (for dry-run UI)

### What the SDK Cannot Do

- No BTC-specific staking logic -- staking is generic, works the same for all tokens
- No challenge/competition mechanics -- that is application-layer logic
- No mock mode -- you mock the wallet or use Sepolia testnet
- No activity verification (GPS, health data) -- integrate HealthKit/Google Fit yourself
- No custom pool creation -- pools are created by validators, not by apps

### The Opportunity

Zero fitness/health/M2E projects on Starknet. The combination of BTC staking + gasless UX + social login + fitness challenges would be a first. StarkZap provides the staking and wallet infrastructure. The fitness layer is application code.

---

## 10. References

| Source | URL | What It Provided |
|--------|-----|-----------------|
| StarkZap GitHub | github.com/keep-starknet-strange/starkzap | Source code, staking module, types, presets |
| StarkZap npm | npmjs.com/package/starkzap | v1.0.0, ~978 downloads/month |
| Starknet staking | starknet.io/staking | BTC staking mechanism, validators, LSTs |
| StarkZap guide.md | GitHub raw | Staking code examples, configuration |
| StarkYield | starkyield.vercel.app | Production staking dashboard using SDK |
| StarkZap Demo | GitHub | Endur LST integration demo |
| Starknet blog | starknet.io/blog | Bitcoin DeFi narrative, STRK20, strkBTC |
| awesome-starkzap | GitHub | Ecosystem project inventory |

---

*Compiled from direct source code analysis, npm registry, GitHub API, and Starknet ecosystem documentation.*
