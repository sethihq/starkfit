# Ready Wallet (formerly Argent) -- Research for StarkZap Integration

**Date:** 2026-03-14
**Status:** Research complete

---

## What Is Ready Wallet?

Ready is the rebranded Argent wallet. Argent was the original Starknet wallet, pioneering account abstraction and social recovery (Guardians) since 2018. In 2025-2026 they rebranded to "Ready" and repositioned as "the onchain alternative to your bank."

### Product Surface

| Platform | Type | Status |
|----------|------|--------|
| **Mobile app** | iOS + Android native wallet | Production (primary product) |
| **Browser extension** | ArgentX (now Ready extension) | Production |
| **Web wallet** | Email/password, no install needed | Production |
| **Ready Card** | Mastercard debit card for spending USDC | Production |

### Key Features

- Buy, swap, spend, earn, invest crypto
- Earn up to 9% on BTC, ETH, USDC
- Spend USDC anywhere Mastercard is accepted (zero FX fees)
- 6 currencies, 150 countries
- Self-custodial ("we never have access to your assets")
- Social recovery via Guardians
- Native account abstraction on Starknet

### Supported Assets

BTC, ETH, USDC (and Starknet ecosystem tokens via the extension/web wallet).

---

## Developer Tools

Ready provides two developer-facing SDKs:

### 1. StarknetKit (primary SDK)

**npm:** `starknetkit`
**Latest version:** v2.9.0 (docs), v2.3.2 (last GitHub release)
**License:** MIT
**GitHub:** [argentlabs/starknetkit](https://github.com/argentlabs/starknetkit) (32 stars, 31 forks)
**Docs:** [starknetkit.com](https://www.starknetkit.com/) and [docs.ready.co](https://docs.ready.co/)

StarknetKit is a wallet connection SDK for Starknet dapps. It provides a modal UI for users to choose their wallet and handles the connection lifecycle.

**Install:**
```bash
npm install starknetkit
# or
bun add starknetkit
```

**Core API:**
```typescript
import { connect, disconnect } from "starknetkit"

// Basic connection -- opens modal with all available wallets
const wallet = await connect()

// Reconnect silently on page load
const wallet = await connect({ modalMode: "neverAsk" })

// Disconnect
await disconnect({ clearLastWallet: true })

// Handle web wallet logout
handleWebwalletLogoutEvent()

// Monitor account changes
const connectedWallet = getSelectedConnectorWallet()
connectedWallet?.on("accountsChanged", () => { /* handle */ })
```

**Default Connectors (4 wallets out of the box):**
1. Ready Wallet (browser extension, formerly ArgentX)
2. Braavos
3. Web Wallet (email/password, no extension needed)
4. Argent Mobile (via WalletConnect QR)

**Available Connector Modules:**
- `Argent` -- Ready/ArgentX browser extension
- `BraavosMobile` -- Braavos mobile via WalletConnect
- `Controller` -- Cartridge Controller
- `Injected` -- Generic injected wallet
- `KeplrMobile` -- Keplr mobile connector
- `Webwallet` -- Ready's web wallet (email-based)

**Custom connector configuration:**
```typescript
import { connect } from "starknetkit"
import { WebWalletConnector } from "starknetkit/connectors"
import { ArgentMobileConnector } from "starknetkit/connectors"

const wallet = await connect({
  connectors: [
    new WebWalletConnector(),
    new ArgentMobileConnector(),
  ]
})
```

**Source Code Structure:**
```
src/
  connectors/      # Wallet connector implementations
    Argent/        # Ready/ArgentX extension
    BraavosMobile/ # Braavos mobile
    Controller/    # Cartridge Controller
    Injected/      # Generic injected
    KeplrMobile/   # Keplr mobile
    Webwallet/     # Ready web wallet
    connector.ts   # Base Connector abstract class
  errors/          # Error types
  helpers/         # Utility functions
  hooks/           # React hooks
  modal/           # Modal UI components
  starknet-react/  # starknet-react integration
  types/           # TypeScript types
  main.ts          # Entry point
```

**Base Connector Interface:**
```typescript
abstract class Connector extends EventEmitter<ConnectorEvents> {
  abstract id: string
  abstract name: string
  abstract icon: { dark: string; light: string }
  abstract available(): boolean
  abstract ready(): Promise<boolean>
  abstract connect(): Promise<ConnectorData>
  abstract disconnect(): Promise<void>
  abstract account(): Promise<AccountInterface | null>
  abstract chainId(): Promise<bigint>
  abstract request(call: RpcCall): Promise<unknown>
}
```

**starknet-react Integration:**
StarknetKit provides a `StarknetReactWrapper` component in `src/starknet-react/` that wraps StarknetKit connectors for use with `@starknet-react/core`. This means you can use StarknetKit's modal within a starknet-react provider setup.

### 2. Ready Web Wallet SDK

A lighter-weight SDK specifically for the email/password web wallet. Users authenticate with email and password -- no browser extension, no seed phrases, no downloads.

**Target audience:** Non-crypto-native users who should not be exposed to wallet concepts.

**Docs:** Referenced at docs.ready.co (specific pages returned 404 at time of research).

---

## Integration Paths for StarkZap

### Path A: StarknetKit as Primary Wallet Connection Layer

Use StarknetKit to handle all wallet connections, then bridge the connected wallet to the StarkZap SDK.

```typescript
import { connect } from "starknetkit"
import { StarkZap } from "starkzap"

// 1. Connect wallet via StarknetKit modal
const { wallet, connectorData } = await connect()

// 2. Extract the starknet.js Account from the connected wallet
const account = wallet.account // starknet.js AccountInterface

// 3. Bridge to StarkZap using the InjectedStarkzapWallet pattern
class InjectedStarkzapWallet extends BaseWallet {
  constructor(private account: AccountInterface) { /* ... */ }
  // Wraps starknet.js Account into StarkZap wallet interface
}

const starkzapWallet = new InjectedStarkzapWallet(account)

// 4. Use StarkZap SDK features (staking, swaps, transfers)
await starkzapWallet.stake(poolAddress, amount)
```

**Pros:**
- Supports Ready, Braavos, web wallet, and mobile wallets
- Single modal UI for all wallet types
- StarknetKit handles WalletConnect, QR codes, etc.

**Cons:**
- Requires custom `InjectedStarkzapWallet` adapter (already proven in StarkYield)
- Two separate SDKs to manage
- Does not use StarkZap's built-in Privy/Cartridge onboarding

### Path B: StarkZap OnboardStrategy + Ready Extension

Use StarkZap's native onboarding for social login (Privy) and gaming (Cartridge), then support Ready/ArgentX as an injected browser wallet alongside them.

```typescript
const sdk = new StarkZap({ network: "mainnet" })

// Social login users
const { wallet } = await sdk.onboard({
  strategy: OnboardStrategy.Privy,
  feeMode: { mode: "sponsored" },
  deploy: "if_needed",
})

// Ready/ArgentX extension users (via custom adapter)
// Users who already have Ready installed can connect directly
const injectedAccount = await window.starknet.enable()
const wallet = new InjectedStarkzapWallet(injectedAccount)
```

**Pros:**
- StarkZap's Privy integration handles social login natively
- Ready extension users can still connect
- No additional SDK dependency

**Cons:**
- No unified modal UI for wallet selection
- Web wallet (email-based) not accessible without StarknetKit
- Manual injected wallet detection

### Path C: Hybrid -- StarknetKit for Wallet Selection + StarkZap for Features

Use StarknetKit purely as the wallet-picker modal. Once connected, pass the account to StarkZap for all DeFi operations.

This is the most flexible approach and is what production apps like StarkYield already do.

---

## Compatibility with StarkZap SDK

### Direct Compatibility

StarkZap SDK has three onboard strategies: `Signer`, `Privy`, and `Cartridge`. There is **no built-in `Ready` or `StarknetKit` strategy**. However, the `InjectedStarkzapWallet` adapter pattern (proven in StarkYield) bridges any starknet.js `AccountInterface` to the StarkZap wallet interface.

### The Bridge Pattern

The key insight is that StarknetKit produces a standard starknet.js `AccountInterface` on successful connection. StarkZap's `BaseWallet` can be extended to wrap any `AccountInterface`. This bridge already exists in production code.

```
StarknetKit connect() --> AccountInterface --> InjectedStarkzapWallet --> StarkZap features
```

### What Works Together

| Feature | StarknetKit | StarkZap | Together |
|---------|-------------|----------|----------|
| Ready extension | Yes | Via adapter | Yes |
| Braavos | Yes | Via adapter | Yes |
| Web wallet (email) | Yes | No | Yes (via adapter) |
| Privy social login | No | Yes (native) | Choose one |
| Cartridge gaming | Yes (connector) | Yes (native) | Either path works |
| Gasless tx | No | Yes (AVNU paymaster) | StarkZap handles |
| Staking | No | Yes | StarkZap handles |
| Swaps | No | Yes (AVNU/Ekubo) | StarkZap handles |
| Modal UI | Yes | No | StarknetKit handles |

---

## Can It Work Alongside Privy/Cartridge?

**Yes, but they serve different user segments.** The recommended architecture:

```
User arrives at StarkZap app
  |
  +--> Has Ready/Braavos extension?  --> StarknetKit connect (injected)
  |                                       --> InjectedStarkzapWallet adapter
  |                                       --> StarkZap SDK features
  |
  +--> New to crypto?               --> StarkZap Privy onboard (social login)
  |                                       --> Native StarkZap wallet
  |                                       --> StarkZap SDK features
  |
  +--> Gamer?                       --> StarkZap Cartridge onboard (passkeys)
                                          --> Session keys, no popups
                                          --> StarkZap SDK features
```

The wallet connection layer is separate from the feature layer. All paths converge on the same StarkZap SDK for staking, swaps, and transfers.

---

## Integration Complexity for Hackathon

| Approach | Time Estimate | Complexity | What You Get |
|----------|---------------|------------|--------------|
| Ready extension only (injected) | 2-4 hours | Low | Ready + Braavos users can connect |
| StarknetKit full modal | 4-8 hours | Medium | All wallets including web wallet |
| StarknetKit + StarkZap adapter | 8-12 hours | Medium-High | Full wallet selection + DeFi features |
| Hybrid (Privy + StarknetKit) | 12-16 hours | High | Social login + extension wallets + DeFi |

### Recommended Hackathon Approach

For a hackathon, **skip StarknetKit**. Use StarkZap's built-in Privy strategy for social login (the primary user flow), and optionally detect injected Ready/Braavos wallets for crypto-native users. Reasons:

1. StarkZap already handles onboarding with Privy (email, Google, Apple)
2. Adding StarknetKit introduces a second SDK, second modal, and adapter code
3. Ready's web wallet (email-based) overlaps with Privy's email login
4. The adapter pattern (`InjectedStarkzapWallet`) is boilerplate but takes time
5. Hackathon judges care about the product, not how many wallets you support

**If you must support Ready:** The simplest path is detecting `window.starknet` (Ready/ArgentX extension) and wrapping it with `InjectedStarkzapWallet`. This takes 1-2 hours and covers the most common case (crypto-native users who already have Ready installed).

---

## Key Takeaways

1. **Ready = Argent rebranded.** Same team, same wallet, same extension (ArgentX). Now positioned as a consumer finance app.

2. **StarknetKit is a wallet picker, not a DeFi SDK.** It connects wallets. StarkZap does the DeFi operations. They complement each other but overlap on wallet connection.

3. **The bridge exists.** `InjectedStarkzapWallet` adapter pattern (from StarkYield) connects any StarknetKit wallet to StarkZap features. Proven in production.

4. **For hackathon: Privy > StarknetKit.** Privy gives you social login with zero wallet friction. StarknetKit gives you a wallet picker modal -- useful for crypto-native users but not the primary hackathon audience.

5. **Web wallet is the interesting angle.** Ready's email-based web wallet (no extension, no download) could complement Privy's social login for users who want a "real" wallet but not a browser extension. But this overlaps with Privy and adds complexity.

6. **No direct StarkZap integration exists.** There is no `OnboardStrategy.Ready` or `OnboardStrategy.StarknetKit`. Custom adapter code is required.

---

## Links

- Ready website: https://www.ready.co/
- Ready developer docs: https://docs.ready.co/
- StarknetKit website: https://www.starknetkit.com/
- StarknetKit npm: https://www.npmjs.com/package/starknetkit
- StarknetKit GitHub: https://github.com/argentlabs/starknetkit
- StarknetKit docs (via Ready): https://docs.ready.co/ (StarknetKit section)
