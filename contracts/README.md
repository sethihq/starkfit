# StarkFit Smart Contracts

Cairo smart contracts for the BTC Fitness Challenge on Starknet.

## Architecture

```
Google Fit API
      |
      v
Off-chain Oracle Server (verifies step data)
      |
      v
+----------------+       +---------------------+
|  StepOracle    | ----> |  FitnessChallenge   |
|  (Verifier)    |       |  (Core Logic)       |
+----------------+       +---------------------+
                                |
                                v
                          WBTC ERC-20
                          (Staking / Rewards)
```

### FitnessChallenge (`fitness_challenge.cairo`)

The core contract that manages the entire challenge lifecycle:

- **Create Challenge** -- Anyone can create a challenge specifying stake amount, duration, and step target
- **Join Challenge** -- Users stake WBTC to join (ERC-20 `transferFrom`)
- **Submit Steps** -- Oracle-only function to record daily step counts
- **Eliminate** -- Remove participants who missed their daily step target
- **Claim Reward** -- After challenge ends, survivors split the pool minus 5% platform fee

**Prize formula**: `reward = total_pool * 95% / active_participants`

### StepOracle (`step_oracle.cairo`)

Bridge between off-chain Google Fit data and on-chain step recording:

- Authorized oracle signer submits verified step counts
- Supports batch submissions to save gas
- Prevents duplicate submissions per (challenge, participant, day)
- Forwards verified data to the FitnessChallenge contract

## Build

```bash
# Install Scarb (Cairo package manager)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# Build contracts
cd contracts
scarb build

# Run tests
scarb test
```

## Deploy

Contracts are deployed on Starknet and interact with the StarkZap SDK for gasless transactions. The frontend uses StarkZap's paymaster to sponsor user gas fees, making the app feel like a traditional web2 experience.

### Constructor Arguments

**FitnessChallenge**:
| Parameter | Description |
|-----------|-------------|
| `owner` | Admin address (can update oracle, fee recipient) |
| `wbtc_token` | WBTC ERC-20 contract address on Starknet |
| `oracle` | StepOracle contract address |
| `fee_recipient` | Address that receives 5% platform fee |

**StepOracle**:
| Parameter | Description |
|-----------|-------------|
| `owner` | Admin address |
| `oracle_signer` | Off-chain oracle's Starknet account |
| `challenge_contract` | FitnessChallenge contract address |

## Key Design Decisions

1. **Separate Oracle Contract** -- Isolates verification logic from challenge management. Oracle can be upgraded independently.
2. **Batch Step Submission** -- Reduces transaction count for the oracle, especially important for challenges with many participants.
3. **Pull-based Rewards** -- Participants claim their own rewards (no push/airdrop), reducing admin gas costs and eliminating reentrancy risk.
4. **Per-claim Fee Distribution** -- Platform fee is deducted proportionally when each survivor claims, simplifying the accounting.
5. **Elimination by Anyone** -- After a day passes, any address can trigger elimination of a participant who missed their target, creating a permissionless enforcement mechanism.
