# StarkZap SDK -- Technical Capabilities Research

> Research compiled 2026-03-14 from GitHub source, documentation, and ecosystem projects.

---

## What StarkZap Is

StarkZap is a TypeScript SDK that brings Bitcoin, stablecoins, and DeFi to any web or mobile app via Starknet. It abstracts blockchain complexity behind a clean API, handling wallet creation, transaction signing, gasless execution, staking, swaps, and lending. The tagline: "Bitcoin in your app in minutes."

**Repository:** [keep-starknet-strange/starkzap](https://github.com/keep-starknet-strange/starkzap)
**License:** MIT
**Language:** 79.4% TypeScript, 13.3% MDX, 6.7% JavaScript
**Stats:** 85 stars, 21 forks, 68 commits
**Core contributors:** 0xLucqs, micbakos, 0xsisyfos, Akashneelesh, Abdel @ StarkWare

---

## Installation

```bash
npm install starkzap
```

**Peer dependencies:**
- `starknet` (v9+) -- included automatically
- `@cartridge/controller` -- optional, for Cartridge wallet flows

**Optional integrations:**
- `@privy-io/node` -- server-side Privy signing
- Privy Expo SDK -- mobile social login
- AVNU Paymaster -- gasless transaction sponsorship (URL config only)

---

## SDK Architecture

### Source Module Map

```
src/
  abi/           -- Contract ABI definitions
  account/       -- Account presets and management
    index.ts
    presets.ts
  erc20/         -- ERC20 token operations
    token/
    erc20.ts
    index.ts
  lending/       -- Lending protocol integration (Vesu)
    vesu/
    client.ts
    interface.ts
    utils.ts
    index.ts
  network/       -- Network config and presets
    index.ts
    presets.ts
  signer/        -- Signing adapters
    adapter.ts
    interface.ts
    privy.ts
    stark.ts
    index.ts
  staking/       -- Delegation pool operations
    validator/
    staking.ts
    presets.ts
    index.ts
  swap/          -- DEX integrations
    avnu.ts
    ekubo.ts
    ekubo.helpers.ts
    interface.ts
    utils.ts
    index.ts
  tx/            -- Transaction builder
    builder.ts
    index.ts
  types/         -- Type definitions
    address.ts
    amount.ts
    config.ts
    onboard.ts
    pool.ts
    sponsorship.ts
    token.ts
    tx.ts
    validator.ts
    wallet.ts
  utils/         -- Helpers
  wallet/        -- Wallet implementations
    accounts/
    base.ts
    cartridge.ts
    interface.ts
    utils.ts
    index.ts
  cartridge.ts   -- Cartridge entry point
  index.ts       -- Main barrel export
  sdk.ts         -- Core StarkZap class
```

---

## Core API Reference

### StarkZap Class

The primary entry point. Handles configuration, provider setup, and wallet connection.

```typescript
import { StarkZap, StarkSigner, OnboardStrategy, Amount, fromAddress, sepoliaTokens } from "starkzap";
```

#### Constructor

```typescript
const sdk = new StarkZap(config: SDKConfig);
```

**SDKConfig options:**

| Option | Type | Description |
|--------|------|-------------|
| `network` | `"mainnet" \| "sepolia"` | Network preset (recommended) |
| `rpcUrl` | `string` | Custom RPC endpoint (overrides preset) |
| `chainId` | `ChainId` | Target chain (overrides preset) |
| `paymaster` | `PaymasterOptions` | Gasless config (defaults to AVNU) |
| `explorer` | `ExplorerConfig` | Block explorer (`"voyager"` or `"starkscan"` or custom URL) |
| `staking` | `StakingConfig` | Override staking contract address |

Resolution priority: explicit params > network preset defaults. Both `rpcUrl` and `chainId` are required from one source or the other.

#### Core Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `onboard(options)` | `Promise<OnboardResult>` | High-level wallet connection with strategy selection |
| `connectWallet(options)` | `Promise<Wallet>` | Lower-level wallet connection |
| `connectCartridge(options)` | `Promise<CartridgeWalletInterface>` | Cartridge auth popup (web only) |
| `stakingTokens()` | `Promise<Token[]>` | List tokens enabled for staking |
| `getStakerPools(staker)` | `Promise<Pool[]>` | Get validator delegation pools |
| `getProvider()` | `RpcProvider` | Get underlying RPC provider |
| `callContract(call)` | `Promise<...>` | Read-only contract call |

---

### Onboarding System

The `sdk.onboard()` method is the recommended entry point. It handles strategy selection, signer construction, account deployment, and wallet connection automatically.

#### Three Strategies

**1. Signer Strategy** -- Direct private key

```typescript
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Signer,
  account: { signer: new StarkSigner("0xPRIVATE_KEY") },
  deploy: "if_needed",
});
```

**2. Privy Strategy** -- Social login (email, Google, etc.)

```typescript
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Privy,
  privy: {
    resolve: async () => privyResolveResult
  },
  feeMode: { mode: "sponsored" },
  deploy: "if_needed",
});
```

**3. Cartridge Strategy** -- Gaming wallet with passkeys

```typescript
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Cartridge,
  cartridge: {
    policies: [{ target: "0xCONTRACT", method: "my_function" }],
    preset: "my-game",
    url: "https://custom-cartridge-url.com",
  },
  deploy: "if_needed",
});
```

#### Shared Onboard Options

| Option | Type | Description |
|--------|------|-------------|
| `feeMode` | `FeeMode` | `{ mode: "sponsored" }` or `{ mode: "default", gasToken: "0x..." }` |
| `timeBounds` | `PaymasterTimeBounds` | Transaction validity window |
| `deploy` | `"if_needed" \| "never"` | Auto-deploy account contract |
| `onProgress` | `(event) => void` | Progress callback |
| `swapProviders` | `SwapProvider[]` | Additional swap providers to register |
| `defaultSwapProviderId` | `string` | Default swap provider ID |

#### OnboardResult

```typescript
{ wallet: Wallet, strategy: string, deployed: boolean, metadata?: unknown }
```

---

### Wallet Interface

The connected wallet object. This is what you use for all on-chain operations.

#### Account Management

| Method | Returns | Description |
|--------|---------|-------------|
| `address` | `Address` | Wallet's Starknet address (readonly) |
| `isDeployed()` | `Promise<boolean>` | Check if account exists on-chain |
| `ensureReady(options?)` | `Promise<void>` | Prepare wallet, deploy if needed |
| `deploy(options?)` | `Promise<Tx>` | Deploy account contract |
| `disconnect()` | `Promise<void>` | Clean up wallet resources |
| `getAccount()` | `Account` | Get underlying starknet.js Account |
| `getProvider()` | `RpcProvider` | Get RPC provider |
| `getChainId()` | `ChainId` | Get connected chain |
| `getFeeMode()` | `FeeMode` | Get default fee mode |
| `getClassHash()` | `string` | Get account class hash |

#### Transaction Execution

| Method | Returns | Description |
|--------|---------|-------------|
| `execute(calls, options?)` | `Promise<Tx>` | Execute one or multiple contract calls |
| `tx()` | `TxBuilder` | Create fluent transaction builder |
| `estimateFee(calls)` | `Promise<EstimateFeeResponse>` | Estimate execution cost |
| `preflight(options)` | `Promise<PreflightResult>` | Simulate before sending |
| `callContract(call)` | `Promise<...>` | Read-only call (no tx) |
| `signMessage(typedData)` | `Promise<Signature>` | Sign EIP-712 style message |

#### ERC20 Token Operations

| Method | Returns | Description |
|--------|---------|-------------|
| `erc20(token)` | `Erc20` | Get ERC20 instance for a token |
| `transfer(token, transfers[], options?)` | `Promise<Tx>` | Transfer tokens to recipients |
| `balanceOf(token)` | `Promise<Amount>` | Get wallet balance for a token |

```typescript
const balance = await wallet.balanceOf(sepoliaTokens.STRK);
const tx = await wallet.transfer(sepoliaTokens.STRK, [
  { to: fromAddress("0xRECIPIENT"), amount: Amount.parse("10", token) },
]);
await tx.wait();
```

#### Swap Operations

| Method | Returns | Description |
|--------|---------|-------------|
| `getQuote(request)` | `Promise<SwapQuote>` | Fetch swap quote |
| `swap(request, options?)` | `Promise<Tx>` | Execute token swap |
| `registerSwapProvider(provider, default?)` | `void` | Add swap provider |
| `setDefaultSwapProvider(id)` | `void` | Set default by ID |
| `getSwapProvider(id)` | `SwapProvider` | Get provider by ID |
| `getDefaultSwapProvider()` | `SwapProvider` | Get current default |
| `listSwapProviders()` | `string[]` | List registered IDs |

**Supported DEXs:** AVNU (aggregator), Ekubo (direct)

**SwapInput type:**
```typescript
{
  tokenIn: Token,
  tokenOut: Token,
  amount: Amount,
  slippage?: number,      // basis points
  providerId?: string,    // optional specific DEX
}
```

**SwapQuote response:**
```typescript
{
  amountInBase: bigint,
  amountOutBase: bigint,
  routes?: number,
  priceImpact?: number,   // basis points
  providerId: string,
}
```

#### Lending Operations

| Method | Returns | Description |
|--------|---------|-------------|
| `lending()` | `LendingClient` | Access lending helpers |

**Supported protocol:** Vesu

**LendingAction types:** `"deposit"`, `"withdraw"`, `"borrow"`, `"repay"`

**LendingProvider interface methods:**
- `supportsChain(chainId)` -- chain compatibility check
- `getMarkets(chainId)` -- list available markets
- `prepareDeposit/Withdraw/Borrow/Repay(request, context)` -- build tx calls
- `prepareWithdrawMax(request, context)` -- withdraw maximum
- `getPosition(request)` -- get user position
- `getHealth(request)` -- get collateralization status
- `quoteProjectedHealth(request)` -- simulate health after action

**LendingPosition data:**
```typescript
{
  collateralShares: bigint,
  nominalDebt: bigint,
  amountInBase: bigint,
  usdValue: number,
  collateralizationStatus: string,
}
```

#### Staking & Delegation

| Method | Returns | Description |
|--------|---------|-------------|
| `staking(poolAddress)` | `Promise<Staking>` | Get Staking instance for pool |
| `stakingInStaker(stakerAddr, token)` | `Promise<Staking>` | Create from validator |
| `enterPool(pool, amount, options?)` | `Promise<Tx>` | Join pool as new member |
| `addToPool(pool, amount, options?)` | `Promise<Tx>` | Increase existing stake |
| `stake(pool, amount, options?)` | `Promise<Tx>` | Auto enter or add |
| `claimPoolRewards(pool, options?)` | `Promise<Tx>` | Claim staking rewards |
| `exitPoolIntent(pool, amount, options?)` | `Promise<Tx>` | Start exit (cooldown) |
| `exitPool(pool, options?)` | `Promise<Tx>` | Finalize withdrawal |
| `isPoolMember(pool)` | `Promise<boolean>` | Check membership |
| `getPoolPosition(pool)` | `Promise<PoolMember \| null>` | Get stake details |
| `getPoolCommission(pool)` | `Promise<number>` | Get validator commission |

**Staking class static methods:**
- `Staking.fromPool(poolAddress)` -- create from pool contract
- `Staking.fromStaker(stakerAddress, token)` -- create from validator
- `Staking.activeTokens()` -- list stakeable tokens
- `Staking.getStakerPools(staker)` -- get all pools for a validator

**Staking features:**
- Auto-approval of token transfers
- Amount validation against token specs
- Timeout management via AbortSignal
- Exit process: `exitIntent()` (cooldown) then `exit()` (finalize)

---

### Signer Interface

Minimal contract for custom signing implementations.

```typescript
interface SignerInterface {
  getPubKey(): Promise<string>;
  signRaw(hash: string): Promise<Signature>;  // [r, s] tuple
}
```

**Built-in implementations:**
- `StarkSigner` -- direct Stark private key
- `PrivySigner` -- Privy-managed signing via server or mobile SDK
- `SignerAdapter` -- bridges custom signers with starknet.js

**Extension points:** hardware wallets, MPC, any custom signing backend.

---

### Transaction Builder

Fluent API for batching multiple calls into a single atomic transaction.

```typescript
const result = await wallet.tx()
  .add(call1)
  .add(call2)
  .add(call3)
  .execute(options?);
```

---

### Key Primitives

**Address:**
```typescript
import { fromAddress } from "starkzap";
const addr = fromAddress("0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7");
```

**Amount:**
```typescript
import { Amount } from "starkzap";
const amount = Amount.parse("10.5", token);  // human-readable to base units
// amount.formatted() -- back to human-readable
```

**ChainId:**
```typescript
ChainId.MAINNET  // "SN_MAIN"
ChainId.SEPOLIA  // "SN_SEPOLIA"
ChainId.from("SN_MAIN")
ChainId.fromFelt252("0x...")
```

**Token presets:**
```typescript
import { sepoliaTokens } from "starkzap";
sepoliaTokens.STRK
sepoliaTokens.ETH
// Regenerate with: npm run generate:tokens / npm run generate:tokens:sepolia
```

---

## Gasless Transactions (Paymaster)

Gas fees can be fully sponsored so users pay nothing.

### How It Works

1. Configure paymaster at SDK init (AVNU paymaster is the default)
2. Set `feeMode: { mode: "sponsored" }` during onboarding or per-transaction
3. The paymaster signs the transaction and covers gas costs
4. Backend should proxy paymaster requests to keep API keys server-side

### Two Fee Modes

| Mode | Config | Who Pays |
|------|--------|----------|
| Sponsored | `{ mode: "sponsored" }` | AVNU paymaster covers gas |
| Default | `{ mode: "default", gasToken: "0x..." }` | User pays in specified token |

### Production Pattern (from Winky-Starkzap)

```typescript
// Frontend
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Privy,
  deploy: "if_needed",
  feeMode: { mode: "sponsored" },
});

await wallet.execute([{
  contractAddress: CONTRACT_ADDRESS,
  entrypoint: "record_blink",
}]);

// Backend holds AVNU API key
// POST /api/wallet/sign -- proxies signing
// POST /api/paymaster -- proxies paymaster requests
```

### Limitations

- Requires AVNU paymaster URL configuration
- API keys must be kept server-side for security
- Paymaster may have rate limits or spending caps
- Only works on supported networks (mainnet, sepolia)

---

## Social Login (Privy Integration)

### How It Works

Users authenticate with email, Google, Apple, or other social providers. Privy manages the cryptographic key material. No seed phrases, no browser extensions.

### Architecture

```
User (email/Google) -> Privy Auth -> PrivySigner -> StarkZap Wallet -> Starknet
```

### Implementation

**Server-side (Node.js):**
```typescript
import { StarkZap, OnboardStrategy } from "starkzap";

const sdk = new StarkZap({ network: "sepolia" });
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Privy,
  privy: {
    resolve: async () => ({
      // Privy auth token resolution
    }),
  },
  feeMode: { mode: "sponsored" },
  deploy: "if_needed",
});
```

**Mobile (React Native / Expo):**
- Uses Privy Expo SDK
- Same `OnboardStrategy.Privy` flow

### What Privy Provides

- Email + password authentication
- Google, Apple, Twitter OAuth
- Phone number verification
- Embedded wallet creation (no extensions)
- Key recovery without seed phrases

---

## Cartridge Controller (Gaming Integration)

### How It Works

Cartridge provides a gaming-optimized wallet with passkey authentication, session keys, and gas sponsorship. Users sign in with social accounts or biometrics (Face ID, fingerprint).

### Architecture

```
User (passkey/social) -> Cartridge Controller -> Session Keys -> StarkZap Wallet -> Starknet
```

### Implementation

```typescript
import { StarkZap, OnboardStrategy } from "starkzap";

const sdk = new StarkZap({ network: "sepolia" });
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Cartridge,
  cartridge: {
    policies: [
      { target: "0xGAME_CONTRACT", method: "make_move" },
      { target: "0xGAME_CONTRACT", method: "claim_reward" },
    ],
    preset: "my-game",
  },
});
```

**CartridgeWalletInterface extends WalletInterface with:**
- `getController()` -- access underlying Cartridge controller
- `username()` -- get Cartridge username

### What Cartridge Provides

- Passkey (biometric) authentication
- Social login (Google, Discord, etc.)
- Session keys: pre-approve specific contract calls, no popups per transaction
- Gas sponsorship: Cartridge covers gas for approved games
- Username system
- Web-only (throws on native/server runtimes)

### Gaming Use Case (Flappy Bird Example)

```typescript
// SDK init with Cartridge
const sdk = new StarkZap({ network: "sepolia" });

// Game hooks
__starknetOnScore = async (score) => {
  await wallet.execute([{
    contractAddress: GAME_CONTRACT,
    entrypoint: "update_score",
    calldata: [score],
  }]);
};

// Read leaderboard
const provider = wallet.getProvider();
const contract = new Contract(abi, GAME_CONTRACT, provider);
const topScores = await contract.get_leaderboard();
```

---

## Bitcoin Staking

### What's Available

StarkZap provides native staking operations for tokens on Starknet, including STRK and wrapped BTC (WBTC).

### Staking Workflow

1. **Discover pools:** `sdk.stakingTokens()` + `sdk.getStakerPools(validator)`
2. **Enter a pool:** `wallet.enterPool(pool, amount)`
3. **Add to existing stake:** `wallet.addToPool(pool, amount)`
4. **Smart stake:** `wallet.stake(pool, amount)` -- auto-detects enter vs add
5. **Claim rewards:** `wallet.claimPoolRewards(pool)`
6. **Exit intent:** `wallet.exitPoolIntent(pool, amount)` -- starts cooldown
7. **Finalize exit:** `wallet.exitPool(pool)` -- after cooldown completes
8. **Check position:** `wallet.getPoolPosition(pool)`
9. **Check membership:** `wallet.isPoolMember(pool)`

### StarkYield Example (Production App)

```typescript
const stakingSdk = new StarkZap({
  network: process.env.NEXT_PUBLIC_STARKNET_NETWORK,
  paymaster: { nodeUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL },
});

// Custom adapter bridges browser wallets (ArgentX, Braavos) to StarkZap
class InjectedStarkzapWallet extends BaseWallet {
  // Wraps starknet.js Account into StarkZap wallet interface
}

// Query positions, stake, unstake, claim rewards
const position = await wallet.getPoolPosition(poolAddress);
await wallet.stake(poolAddress, Amount.parse("100", strkToken));
await wallet.claimPoolRewards(poolAddress);
```

---

## Framework Integration

### React / Next.js

No official React provider or hooks package exists. Integration is imperative (not declarative).

**Pattern from ecosystem projects:**

```typescript
// lib/starkzap.ts
import { StarkZap } from "starkzap";

export const sdk = new StarkZap({
  network: process.env.NEXT_PUBLIC_STARKNET_NETWORK || "sepolia",
  paymaster: { nodeUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL },
});

// hooks/use-wallet.ts (custom)
const [wallet, setWallet] = useState<Wallet | null>(null);

async function connect() {
  const { wallet } = await sdk.onboard({
    strategy: OnboardStrategy.Privy,
    feeMode: { mode: "sponsored" },
    deploy: "if_needed",
  });
  setWallet(wallet);
}
```

**Backend API pattern (Winky-Starkzap):**
```
Frontend (Next.js) <-> Express API (holds keys) <-> StarkZap SDK <-> Starknet
```

### React Native / Expo

- Uses Privy Expo SDK for mobile social login
- Same `StarkZap` class and `OnboardStrategy.Privy` flow
- No Cartridge support (web-only)

### Node.js Backend

- Full SDK support
- `StarkSigner` with server-managed keys
- Privy server SDK (`@privy-io/node`)

---

## Ecosystem Projects

### Consumer Apps

| Project | What It Does | Key StarkZap Features Used |
|---------|-------------|---------------------------|
| [Winky-Starkzap](https://github.com/starkience/winky-starkzap) | Blink-triggered transactions via webcam | Privy login, gasless tx, AVNU paymaster |
| [Gift App](https://github.com/Akashneelesh/giftapp-starkzap) | Token gifting with staking yield | Privy, Cartridge, staking |
| [StarkSplit](https://github.com/azeemshaik025/stark-split) | Expense splitting with gasless settlements | Gasless tx, STRK staking |
| [RafflePunk](https://github.com/RealAdii/rafflepunk) | Community raffle platform | Wallet integration |

### Gaming Apps

| Project | What It Does | Key StarkZap Features Used |
|---------|-------------|---------------------------|
| [Flappy Bird](https://flappybird-starkzap.vercel.app/) | Classic game with on-chain scores | Cartridge controller, gasless tx |
| [Starkfleet](https://fleet.supbro.fun/) | Privacy-preserving battleship | Wallet integration |
| [Type Racer](https://typeracer-mainnet.vercel.app/) | Typing competition with on-chain words | Transaction execution |

### DeFi Apps

| Project | What It Does | Key StarkZap Features Used |
|---------|-------------|---------------------------|
| [StarkYield](https://starkyield.vercel.app/) | BTC and STRK staking dashboard | Staking, wallet adapter, rewards |
| [StarkZap Demo](https://github.com/EjembiEmmanuel/starkzap-demo) | Endur liquid staking test UI | Staking (deposit/withdraw), APY/TVL queries |

---

## Integration Complexity Assessment

| Feature | Complexity | Time Estimate | Notes |
|---------|-----------|---------------|-------|
| Basic wallet + transfers | Low | 1-2 hours | `onboard()` + `transfer()` |
| Gasless transactions | Low-Medium | 2-4 hours | Needs backend proxy for API keys |
| Privy social login | Medium | 4-8 hours | Privy account setup + backend endpoint |
| Cartridge gaming | Medium | 4-8 hours | Policy configuration + session keys |
| Token swaps | Low | 1-2 hours | Built-in AVNU/Ekubo providers |
| Staking | Medium | 4-8 hours | Pool discovery + position management UI |
| Lending (Vesu) | Medium-High | 8-16 hours | Complex position/health management |
| Full DeFi dashboard | High | 2-4 weeks | Combines staking + swaps + lending + portfolio |
| Mobile (React Native) | Medium | 1-2 weeks | Privy Expo SDK setup + native UI |

---

## Limitations

1. **No React hooks/provider package.** Integration is imperative. You build your own state management around the SDK.
2. **Cartridge is web-only.** Throws on native/server runtimes.
3. **Paymaster rate limits.** AVNU paymaster may have spending caps or rate limits in production.
4. **No official UI components.** No connect button, no modal, no transaction history widget. You build everything.
5. **Starknet-only.** Does not support Ethereum L1 or other L2s directly.
6. **Limited lending support.** Only Vesu protocol currently integrated.
7. **Limited swap providers.** AVNU and Ekubo only.
8. **Documentation gaps.** Official docs at `docs.starknet.io/build/starkzap` exist but the guide.md in repo is the most complete reference.
9. **Early ecosystem.** 85 stars, ~10 known production apps. Still maturing.
10. **No TypeDoc or generated API docs.** You read source code or the guide.

---

## Development Commands

```bash
npm install
npm run typecheck
npm test
npm run test:integration      # requires starknet-devnet running
npm run lint
npm run prettier
npm run build
npm run generate:tokens       # regenerate mainnet token presets
npm run generate:tokens:sepolia
npm run generate:validators
npm run generate:validators:sepolia
```

---

## Summary: What You Can Build

| Category | What's Possible |
|----------|----------------|
| **Payments** | Token transfers, batch payments, gasless send |
| **Authentication** | Social login (email, Google, Apple), passkeys, no seed phrases |
| **Gaming** | On-chain scores, session keys, no-popup transactions, leaderboards |
| **DeFi** | Staking dashboards, token swaps, lending/borrowing, yield tracking |
| **Consumer** | Gift cards, expense splitting, raffles, loyalty programs |
| **IoT/Hardware** | Blink-to-transact, sensor-triggered on-chain events |
| **Mobile** | React Native apps with social login and gasless transactions |
| **Backend** | Automated trading, treasury management, batch operations |

The SDK covers the full lifecycle: authenticate user, create wallet, execute transactions, manage DeFi positions. The gap is UI -- you build that yourself.
