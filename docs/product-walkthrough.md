# BTC Fitness Challenge on Starknet — Product Walkthrough

## Core Idea
A **fitness commitment protocol**. Users stake Bitcoin into a challenge pool and must complete **7,000 steps daily** for a fixed duration (e.g. 30 days). Miss your daily goal = lose your stake. Remaining participants split the prize pool.

The staked BTC is placed into a **yield strategy** during the challenge. Yield = platform revenue. Platform also takes a small fee from prize distribution.

---

## 1. Main User Flow

1. User connects wallet (Argent X / Braavos)
2. User browses available fitness challenges
3. User selects a challenge and stakes BTC
4. Challenge begins
5. Daily verification: did user complete 7,000 steps?
6. Missed goal = eliminated, stake stays in pool
7. Challenge ends: remaining participants split pool
8. Platform takes fee + keeps yield

**Three UI states:**
- Before joining a challenge
- While participating in a challenge
- After the challenge finishes

---

## 2. Challenge Creation Structure

Challenge parameters (stored in smart contract):

- `stakeAmount` — e.g. 0.01 BTC
- `dailyStepTarget` — 7,000 steps
- `duration` — e.g. 30 days
- `maxParticipants`
- `startTimestamp`
- `endTimestamp`

**Example UI Card:**
```
Challenge Name
Stake: 0.01 BTC
Duration: 30 Days
Participants: 3 / 5
Daily Goal: 7,000 Steps
[Join Challenge]
```

---

## 3. Joining a Challenge

1. User clicks Join
2. Wallet transaction opens
3. Smart contract `joinChallenge()` called
4. User deposits BTC into challenge pool
5. On confirmation: "You are now participating in this challenge"

Post-join display:
- Start date
- Next step verification time
- Participant list

---

## 4. Daily Step Verification

Core mechanic. Every day verify user reached 7,000 steps.

**Step data sources:**
- Apple Health
- Google Fit
- Wearable integrations

**Flow:**
1. Fetch user step data
2. Send to backend verification service
3. Backend submits to Starknet contract

**Contract function:** `submitDailySteps(user, steps)`
- steps >= 7000 → user stays active
- steps < 7000 → user eliminated

**Daily Progress Dashboard:**
```
Today's Steps: 6,430 / 7,000
Status: In Progress
```
or
```
Today's Steps: 8,200 / 7,000
Status: Goal Completed ✓
```

---

## 5. Elimination Logic

- Contract marks user as eliminated
- Status updates to "Eliminated from Challenge"
- Stake stays in pool
- Cannot re-enter

**Leaderboard shows:**
- Active Players
- Eliminated Players

---

## 6. Prize Pool Mechanics

**Example:**
- 5 players join, each stakes 0.01 BTC
- Total Pool = 0.05 BTC
- 2 players fail, 3 complete

**Distribution:**
```
Pool: 0.05 BTC
Platform Fee (5%): 0.0025 BTC
Prize: 0.0475 BTC
Per Winner (3): 0.01583 BTC
```

---

## 7. Yield Generation

During challenge, pool BTC deployed into yield strategy:
- BTC staking wrapper
- DeFi yield strategy
- BTC L2 yield

Yield = platform revenue (not distributed to participants).

**Display:**
```
Challenge Pool: 0.05 BTC
Yield Generated: 0.0007 BTC
```

---

## 8. Leaderboard

| User | Today's Steps | Streak | Status |
|------|--------------|--------|--------|
| User A | 9,200 | Day 12 | Active |
| User B | 7,500 | Day 12 | Active |
| User C | 3,000 | Day 8 | Eliminated |

---

## 9. Final Claim

Winners click **Claim Reward** → `claimReward()` → BTC sent to wallet.

Display: "You completed the challenge and earned 0.01583 BTC."

---

## 10. Core Pages

1. Landing page
2. Challenge explorer
3. Challenge detail page
4. Join challenge modal
5. Active challenge dashboard
6. Daily progress tracker
7. Leaderboard
8. Challenge results page
9. Reward claim page

---

## 11. Smart Contract Functions

```
createChallenge()
joinChallenge()
submitDailySteps()
markEliminated()
endChallenge()
claimReward()
```

---

## 12. Summary

Key frontend pieces:
- Wallet connection
- Challenge browsing UI
- Stake transaction UI
- Daily progress tracking
- Leaderboard updates
- Reward claim interface

**Lifecycle:** Join → Track Steps → Stay Active → Win Rewards
