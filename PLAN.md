# BTC Fitness Challenge -- Implementation Plan

> Stake Bitcoin. Walk 7,000 steps. Winners split the pool.

Hackathon product built on Starknet via StarkZap SDK. Users stake BTC into a challenge pool, complete daily step goals for 30 days, and winners split the prize. All blockchain interactions are mocked for hackathon. Step data is simulated. The app looks like a fitness product, not a crypto product.

---

## Architecture Overview

```
User -> Landing -> Browse Challenges -> Join (mock stake) -> Dashboard -> Daily Steps -> Leaderboard -> Results -> Claim
```

All data lives in Zustand stores seeded with deterministic mock data. No backend. No database. State resets on refresh (acceptable for hackathon). A "Simulate Day" button lets the presenter advance through the challenge lifecycle during a demo.

```
                     +-------------------+
                     |   Next.js App     |
                     |   (App Router)    |
                     +---------+---------+
                               |
            +------------------+------------------+
            |                  |                  |
   +--------v--------+ +------v-------+ +--------v--------+
   |   Marketing     | |   Challenge  | |   Dashboard     |
   |   /home         | |   /challenges| |   /dashboard    |
   |   (landing)     | |   /challenges| |   /leaderboard  |
   |                 | |   /[id]      | |   /results      |
   +-----------------+ +--------------+ |   /claim        |
                                        +-----------------+
                               |
                     +---------v---------+
                     | Zustand Store     |
                     | (all app state)   |
                     +---------+---------+
                               |
              +----------------+----------------+
              |                |                |
     +--------v--------+ +----v-----+ +--------v--------+
     | Mock Wallet      | | Mock     | | Step Simulator  |
     | Service          | | Contract | | (setInterval)   |
     +-----------------+ +----------+ +-----------------+
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | Zustand (single store, sliced) | Satus convention. Simple. No server state needed. |
| Routing | App Router with route groups | Marketing pages separate from app pages |
| Blockchain | Mock service layer | Hackathon -- no real contracts. Service interface stays clean for future integration. |
| Step data | Simulated with interval timer | Steps count up in real-time during demo. Satisfying to watch. |
| Animations | GSAP + CSS transitions | Progress ring, number counters, hero reveal. GSAP already in Satus deps. |
| Design | Dark theme, neon green accents | Fitness app aesthetic. High contrast. Reads well on stage/screen share. |
| Layout | Mobile-first, single column | Fitness apps are phone apps. Demo looks best at mobile viewport. |
| Data persistence | In-memory only | Resets on refresh. Use "Simulate Day" button for demo flow control. |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Satus `setup:project` fails or produces unexpected structure | Medium | High | Scaffold manually. We know the conventions from CLAUDE.md. |
| GSAP progress ring animation complexity | Medium | Medium | Fallback to CSS `conic-gradient` + transition if SVG approach takes too long. |
| Biome lint rules block progress | Low | Medium | Run `bun lint:fix` frequently. Keep sorted Tailwind classes, use `import type`. |
| Demo flow breaks on refresh (state loss) | High | Low | Acceptable. Add localStorage persistence as stretch goal. |
| Too many components for hackathon timeline | Medium | High | Phase 3 (core experience) is the MVP. Landing/results are polish. |

---

## Design Direction

### Color Palette

```
Background:       #0A0A0A  (near-black)
Surface:          #141414  (card backgrounds)
Surface-hover:    #1A1A1A  (interactive surfaces)
Border:           #262626  (subtle dividers)
Text-primary:     #FAFAFA  (white)
Text-secondary:   #A1A1AA  (zinc-400)
Text-muted:       #52525B  (zinc-600)
Accent:           #22C55E  (green-500 -- active, success, CTA)
Accent-glow:      #22C55E33 (green with alpha for glow/ring effects)
Danger:           #EF4444  (red-500 -- eliminated, failed)
Warning:          #F59E0B  (amber-500 -- approaching deadline)
BTC-orange:       #F7931A  (Bitcoin brand -- used sparingly for BTC amounts)
```

### Typography

- Headings: system font stack, bold, tight tracking (`-0.02em`)
- Body: system font stack, regular weight
- Numbers/stats: `font-variant-numeric: tabular-nums` for step counts and BTC amounts

### Visual Language

- Cards with 1px borders (`border-[#262626]`), no box shadows
- Circular progress rings for step tracking (SVG + GSAP)
- Status pills: green (active), red (eliminated), amber (pending)
- Micro-animations on state changes (number count-up, ring fill, status transitions)
- Gradient CTA buttons (green gradient, subtle)
- Mobile-native spacing: 16px horizontal padding, 12px card gaps

---

## File Structure

```
app/
  layout.tsx                              # Root layout: dark theme, fonts, metadata
  (marketing)/
    home/
      page.tsx                            # Landing page (Server Component)
  (app)/
    layout.tsx                            # App layout with bottom navigation
    challenges/
      page.tsx                            # Challenge explorer
      [id]/
        page.tsx                          # Challenge detail
    dashboard/
      page.tsx                            # Active challenge dashboard
    leaderboard/
      page.tsx                            # Leaderboard
    results/
      page.tsx                            # Challenge results
    claim/
      page.tsx                            # Reward claim

components/
  ui/
    image/
      index.tsx                           # Image wrapper (Satus convention)
    link/
      index.tsx                           # Link wrapper (Satus convention)
    button/
      index.tsx                           # Button with variants (primary, secondary, ghost)
      button.module.css
    card/
      index.tsx                           # Card container with border
      card.module.css
    badge/
      index.tsx                           # Status badge (active / eliminated / completed / upcoming)
      badge.module.css
    modal/
      index.tsx                           # Modal overlay (backdrop + centered content)
      modal.module.css
    progress-ring/
      index.tsx                           # SVG circular progress, GSAP animated
      progress-ring.module.css
    stat-card/
      index.tsx                           # Numeric stat with label beneath
      stat-card.module.css
    animated-number/
      index.tsx                           # GSAP count-up number animation
  layout/
    header/
      index.tsx                           # App header: logo + wallet connect button
      header.module.css
    footer/
      index.tsx                           # Minimal footer
      footer.module.css
    wrapper/
      index.tsx                           # Page wrapper (padding, max-width, transitions)
      wrapper.module.css
    navigation/
      index.tsx                           # Bottom tab bar (Dashboard, Challenges, Leaderboard)
      navigation.module.css
  landing/
    hero/
      index.tsx                           # Hero: headline, subhead, CTA, floating BTC stat
      hero.module.css
    how-it-works/
      index.tsx                           # 3-step explainer: Stake -> Walk -> Win
      how-it-works.module.css
    stats-banner/
      index.tsx                           # Platform stats ticker (total staked, challenges, winners)
      stats-banner.module.css
  challenges/
    challenge-card/
      index.tsx                           # Challenge preview card for explorer grid
      challenge-card.module.css
    challenge-filters/
      index.tsx                           # Filter bar: All / Active / Upcoming / Completed
      challenge-filters.module.css
    challenge-detail-header/
      index.tsx                           # Challenge name, status, key stats (stake, duration, target, pool)
      challenge-detail-header.module.css
    participant-list/
      index.tsx                           # Participant list with status indicators
      participant-list.module.css
    join-modal/
      index.tsx                           # Join confirmation: stake amount, wallet balance, confirm button
      join-modal.module.css
  dashboard/
    daily-progress/
      index.tsx                           # Large progress ring + step count + "Sync Steps" button
      daily-progress.module.css
    streak-tracker/
      index.tsx                           # Day-by-day row of circles (green/red/gray/amber)
      streak-tracker.module.css
    challenge-status/
      index.tsx                           # Challenge info bar: day X of Y, time remaining, pool, active count
      challenge-status.module.css
  leaderboard/
    leaderboard-table/
      index.tsx                           # Full participant table with column headers
      leaderboard-table.module.css
    leaderboard-row/
      index.tsx                           # Single row: rank, avatar, name, today steps, streak, status badge
      leaderboard-row.module.css
  results/
    prize-breakdown/
      index.tsx                           # Visual distribution: pool -> fee -> prize -> per winner
      prize-breakdown.module.css
    winner-card/
      index.tsx                           # Winner: avatar, name, streak, prize amount
      winner-card.module.css
  claim/
    claim-card/
      index.tsx                           # Prize amount display + claim button
      claim-card.module.css
    claim-success/
      index.tsx                           # Success animation: checkmark, amount, "sent to wallet"
      claim-success.module.css

lib/
  hooks/
    use-challenge-store.ts                # Zustand: challenges, participants, wallet, user state, all actions
    use-step-simulator.ts                 # Hook: setInterval that increments steps with random amounts
    use-countdown.ts                      # Hook: returns time remaining (hours:minutes:seconds) until end of day/challenge
    use-animated-value.ts                 # Hook: wraps GSAP tween for numeric animations
  utils/
    mock-data.ts                          # Seed factory: 4 challenges, 12 participants, step histories
    format.ts                             # formatBTC(), formatSteps(), formatDuration(), formatAddress()
    challenge.ts                          # calculatePrizePool(), getWinners(), isEliminated(), getDayNumber()
    constants.ts                          # STEP_TARGET=7000, PLATFORM_FEE=0.05, CHALLENGE_DURATION=30, etc.
  services/
    wallet.ts                             # Mock: connectWallet(), disconnectWallet(), getBalance()
    challenge-contract.ts                 # Mock: joinChallenge(), submitDailySteps(), claimReward()
  styles/
    css/
      root.css                            # CSS custom properties: colors, spacing, typography, radii
    config.ts                             # Tailwind v4 theme extension (if needed beyond root.css)
```

---

## Data Flow

### Zustand Store: `use-challenge-store.ts`

Single store. All application state. The store is the source of truth for every component.

```typescript
// Types

interface Challenge {
  id: string
  name: string
  stakeAmount: number              // in BTC (e.g., 0.01)
  dailyStepTarget: number          // 7000
  duration: number                 // days
  maxParticipants: number
  participants: Participant[]
  startTimestamp: number
  endTimestamp: number
  status: 'upcoming' | 'active' | 'completed'
  currentDay: number
  yieldGenerated: number           // platform revenue display
}

interface Participant {
  id: string
  name: string
  address: string                  // truncated mock address
  avatar: string                   // emoji
  status: 'active' | 'eliminated'
  currentStreak: number
  eliminatedOnDay: number | null
  todaySteps: number
  stepHistory: number[]            // steps per completed day
}

interface WalletState {
  connected: boolean
  address: string | null
  balance: { btc: number; strk: number }
}

interface Participation {
  challengeId: string
  joinedAt: number
  status: 'active' | 'eliminated' | 'completed' | 'winner'
}

interface DayRecord {
  day: number
  steps: number
  completed: boolean
}

// Store shape

interface ChallengeStore {
  // Wallet
  wallet: WalletState
  connectWallet: () => void
  disconnectWallet: () => void

  // Challenges
  challenges: Challenge[]
  getChallenge: (id: string) => Challenge | undefined

  // User participation
  activeChallengeId: string | null
  participation: Participation | null
  todaySteps: number
  stepHistory: DayRecord[]

  // Actions
  joinChallenge: (challengeId: string) => void
  incrementSteps: (amount: number) => void
  submitDailySteps: () => void
  claimReward: () => void

  // Demo controls
  simulateDay: () => void
  resetDemo: () => void
}
```

### Data Flow Diagram

```
User interaction (button click, timer tick)
  -> Zustand action (joinChallenge, incrementSteps, simulateDay)
    -> Synchronous state mutation
      -> Components re-render via useStore selectors
        -> GSAP animations trigger on value changes (useEffect with refs)
```

No async operations. No API calls. Everything is synchronous state mutations on mock data.

### Step Simulator (`use-step-simulator.ts`)

Runs `setInterval` that calls `store.incrementSteps(random(50, 200))` every 2-3 seconds. Creates a live step-tracking illusion during the demo. Stops when daily target is reached. Resets on `simulateDay()`.

The user can also click a "Sync Steps" button to jump `todaySteps` to a specific value (e.g., 7,500) for demo purposes.

### Countdown Hook (`use-countdown.ts`)

Returns `{ hours, minutes, seconds }` until the end of the current day (midnight) or end of challenge. Updates every second via `setInterval`. Displayed as `HH:MM:SS` in the dashboard.

---

## Mock Data Strategy

### Seed Challenges (4 total)

| Name | Stake | Duration | Participants | Status | Current Day |
|------|-------|----------|-------------|--------|-------------|
| "January Grind" | 0.01 BTC | 30 days | 5/5 | completed | 30 |
| "Spring Sprint" | 0.005 BTC | 14 days | 8/10 | active | 9 |
| "BTC Builders" | 0.02 BTC | 30 days | 3/5 | active | 3 |
| "Weekend Warrior" | 0.001 BTC | 7 days | 12/15 | upcoming | 0 |

### Seed Participants (12 unique names)

```
Alex K.     0x1a2b...3c4d   avatar: running emoji
Jordan M.   0x5e6f...7a8b   avatar: fire emoji
Sam W.      0x9c0d...1e2f   avatar: lightning emoji
Casey R.    0x3a4b...5c6d   avatar: star emoji
Riley T.    0x7e8f...9a0b   avatar: medal emoji
Morgan L.   0x1c2d...3e4f   avatar: muscle emoji
Taylor P.   0x5a6b...7c8d   avatar: trophy emoji
Quinn S.    0x9e0f...1a2b   avatar: heart emoji
Avery N.    0x3c4d...5e6f   avatar: sparkle emoji
Drew H.     0x7a8b...9c0d   avatar: check emoji
Blake J.    0x1e2f...3a4b   avatar: walking emoji
Reese D.    0x5c6d...7e8f   avatar: target emoji
```

### Step Data Generation Rules

- Past days: random between 4,000-12,000 steps
- ~70% of daily values are above 7,000 (realistic completion rate)
- Eliminated participants have exactly one day where steps < 7,000
- The user's participant ("You") always shows `todaySteps` from the store
- Completed challenge ("January Grind"): 3 winners out of 5 (2 eliminated on days 8 and 19)

---

## Animation Plan

### GSAP Animations (5 key moments)

**1. Progress Ring** (`components/ui/progress-ring/index.tsx`)
- SVG `<circle>` with `stroke-dasharray` and `stroke-dashoffset`
- GSAP tweens `stroke-dashoffset` from full circumference to target percentage
- Stroke color transitions via GSAP: red (0-50%) -> amber (50-85%) -> green (85%+)
- Duration: 1.2s, ease: `power2.out`
- Re-triggers on every step increment (smooth catch-up animation)

**2. Step Counter** (`components/ui/animated-number/index.tsx`)
- GSAP `gsap.to()` tweening a `{ value }` object from previous to new count
- Value displayed via `Intl.NumberFormat` for comma separation (e.g., "6,430")
- Duration: 0.8s, ease: `power1.out`
- Used for step counts, BTC amounts, and platform stats

**3. Landing Hero** (`components/landing/hero/index.tsx`)
- GSAP timeline on mount:
  - Headline words stagger up (`y: 40 -> 0, opacity: 0 -> 1`, stagger: 0.06s)
  - Subheadline fades in (0.3s delay)
  - CTA button scales from 0.95 to 1 with opacity
  - Stats numbers count up from 0
- Total timeline: ~1.5s

**4. Join Confirmation** (`components/challenges/join-modal/index.tsx`)
- Modal background: opacity 0 -> 1 (0.2s)
- Modal content: `y: 100 -> 0` (0.4s, ease: `power3.out`) -- slides up like a mobile sheet
- Success state: SVG checkmark path draws on via `stroke-dashoffset` animation (0.6s)

**5. Claim Reward** (`components/claim/claim-success/index.tsx`)
- GSAP timeline:
  - Checkmark circle scales in (`scale: 0 -> 1`, 0.4s, bounce ease)
  - BTC amount text scales up (`scale: 0.5 -> 1, opacity: 0 -> 1`, 0.3s)
  - "Sent to your wallet" text fades in (0.2s)
- Total: ~1.2s

### CSS Transitions (everywhere else)

- Card hover: `transform: scale(1.02)`, 200ms ease
- Badge color changes: 300ms `background-color` transition
- Button press: `transform: scale(0.98)` on `:active`, 100ms
- Navigation tab switch: 200ms opacity + transform
- Streak circles: 300ms `background-color` transition when status changes

---

## Component Tree Per Page

### 1. Landing Page `/` (Server Component)

```
HomePage
  Hero
    h1 "Stake. Walk. Win."
    p  "Stake BTC. Walk 7,000 steps daily. Miss a day, lose your stake..."
    Button "Start a Challenge" -> /challenges
    AnimatedNumber (total BTC staked across all challenges)
  HowItWorks
    StepCard 1: "Stake BTC" -- icon + description
    StepCard 2: "Walk Daily" -- icon + description
    StepCard 3: "Win the Pool" -- icon + description
  StatsBanner
    StatCard "0.15 BTC" label="Total Staked"
    StatCard "4" label="Challenges"
    StatCard "8" label="Winners"
```

### 2. Challenge Explorer `/challenges` (Client)

```
ChallengesPage
  h1 "Challenges"
  ChallengeFilters
    Badge "All" (selected)
    Badge "Active"
    Badge "Upcoming"
    Badge "Completed"
  div.grid
    ChallengeCard (repeated)
      Challenge name
      Badge (status)
      StatCard (stake amount)
      StatCard (duration)
      p "X / Y participants"
      Link -> /challenges/[id]
```

### 3. Challenge Detail `/challenges/[id]` (Client)

```
ChallengeDetailPage
  ChallengeDetailHeader
    h1 (challenge name)
    Badge (status)
    div.stats-grid
      StatCard "0.01 BTC" label="Stake"
      StatCard "30 days" label="Duration"
      StatCard "7,000" label="Daily Goal"
      StatCard "0.05 BTC" label="Pool Size"
  ParticipantList
    LeaderboardRow (per participant)
  Button "Join Challenge" -> opens JoinModal
  JoinModal
    h2 "Join Challenge"
    p "You will stake 0.01 BTC"
    p "Your balance: 0.05 BTC"
    Button "Confirm & Stake"
    (success state)
    Checkmark + "You're in!"
    Button "Go to Dashboard" -> /dashboard
```

### 4. Dashboard `/dashboard` (Client)

```
DashboardPage
  ChallengeStatus
    p "Spring Sprint -- Day 9 of 14"
    Countdown (time remaining today)
    div.stats-row
      StatCard "8" label="Active"
      StatCard "0.04 BTC" label="Pool"
  DailyProgress
    ProgressRing (large, centered, 200px)
    AnimatedNumber (step count) + " / 7,000"
    p "In Progress" or "Goal Completed"
    Button "Sync Steps" (demo helper)
  StreakTracker
    p "Day 9 Streak"
    div.circles (row of 14 circles)
      circle.green (days 1-8, completed)
      circle.amber (day 9, today, in progress)
      circle.gray (days 10-14, future)
  Button "Simulate Next Day" (demo control, subtle/small)
```

### 5. Leaderboard `/leaderboard` (Client)

```
LeaderboardPage
  h1 "Leaderboard"
  p "Spring Sprint"
  LeaderboardTable
    thead: Rank | User | Today | Streak | Status
    LeaderboardRow (repeated)
      td: rank number
      td: emoji + name
      td: step count (with color coding)
      td: streak count + "days"
      td: Badge (active / eliminated)
```

### 6. Results `/results` (Client)

```
ResultsPage
  h1 "Challenge Complete"
  Badge "Completed"
  p "January Grind"
  PrizeBreakdown
    div.bar "Total Pool: 0.05 BTC"
    div.bar "Platform Fee (5%): 0.0025 BTC"
    div.bar "Prize Pool: 0.0475 BTC"
    div.bar "Per Winner (3): 0.01583 BTC"
  h2 "Winners"
  div.grid
    WinnerCard (repeated x3)
      emoji avatar
      name
      "30-day streak"
      "0.01583 BTC"
```

### 7. Claim `/claim` (Client)

```
ClaimPage
  (before claim)
  ClaimCard
    h2 "You completed the challenge"
    p "January Grind -- 30 Day Streak"
    AnimatedNumber "0.01583 BTC" (large)
    Button "Claim Reward"
  (after claim)
  ClaimSuccess
    Checkmark animation (SVG)
    AnimatedNumber "0.01583 BTC"
    p "Sent to your wallet"
    p "0x1a2b...3c4d"
    Button "Back to Challenges" -> /challenges
```

---

## Implementation Phases

### Phase 1: Foundation (2-3 hours)

**Goal**: App compiles. Routes exist. Dark theme renders. UI primitives ready.

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 1.1 | Run `bun run setup:project` or manually create `app/`, `components/`, `lib/` directories | Directories | 15 min |
| 1.2 | Root layout: dark bg, system font, metadata ("BTC Fitness Challenge") | `app/layout.tsx` | 20 min |
| 1.3 | CSS custom properties for color palette, spacing, typography | `lib/styles/css/root.css` | 15 min |
| 1.4 | Create all route files with placeholder `<div>` content | 9 page files | 20 min |
| 1.5 | `Image` wrapper stub | `components/ui/image/index.tsx` | 5 min |
| 1.6 | `Link` wrapper stub | `components/ui/link/index.tsx` | 5 min |
| 1.7 | `Button` component (primary, secondary, ghost variants) | `components/ui/button/` | 15 min |
| 1.8 | `Card` component (border, padding, background) | `components/ui/card/` | 10 min |
| 1.9 | `Badge` component (active, eliminated, completed, upcoming) | `components/ui/badge/` | 10 min |
| 1.10 | `StatCard` component (value + label) | `components/ui/stat-card/` | 10 min |
| 1.11 | `Header` with app name + wallet connect button | `components/layout/header/` | 20 min |
| 1.12 | Bottom `Navigation` tabs (Dashboard, Challenges, Leaderboard) | `components/layout/navigation/` | 20 min |
| 1.13 | `Wrapper` page container | `components/layout/wrapper/` | 10 min |
| 1.14 | App layout (wraps app routes with Header + Navigation) | `app/(app)/layout.tsx` | 10 min |
| 1.15 | `constants.ts` -- STEP_TARGET, PLATFORM_FEE, etc. | `lib/utils/constants.ts` | 10 min |
| 1.16 | `format.ts` -- formatBTC, formatSteps, formatDuration, formatAddress | `lib/utils/format.ts` | 15 min |

**Parallelizable**: 1.5-1.10 (all UI primitives can be scaffolded simultaneously), 1.11-1.14 (layout components), 1.15-1.16 (utils)

**Milestone**: Navigate between all 9 routes. Dark theme. Consistent layout with header and bottom nav.

---

### Phase 2: Data Layer (1-2 hours)

**Goal**: Mock data populates. Store drives state. Simulator works.

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 2.1 | TypeScript interfaces (Challenge, Participant, WalletState, etc.) | Top of `lib/hooks/use-challenge-store.ts` | 20 min |
| 2.2 | Mock data factory (4 challenges, 12 participants, step histories) | `lib/utils/mock-data.ts` | 30 min |
| 2.3 | Zustand store with all state + actions | `lib/hooks/use-challenge-store.ts` | 40 min |
| 2.4 | Mock wallet service (connect, disconnect, balance) | `lib/services/wallet.ts` | 15 min |
| 2.5 | Mock challenge contract service (join, submit, claim) | `lib/services/challenge-contract.ts` | 15 min |
| 2.6 | Challenge utility functions (calculatePrizePool, getWinners, getDayNumber) | `lib/utils/challenge.ts` | 15 min |
| 2.7 | Step simulator hook (setInterval, random increments) | `lib/hooks/use-step-simulator.ts` | 20 min |
| 2.8 | Countdown hook (time remaining in day/challenge) | `lib/hooks/use-countdown.ts` | 15 min |

**Parallelizable**: 2.4-2.6 (services + utils are independent), 2.7-2.8 (hooks, after store in 2.3)

**Milestone**: `useStore()` in a test component shows challenge data. Step counter increments in real-time.

---

### Phase 3: Core Experience (2-3 hours)

**Goal**: End-to-end demo flow works. Browse -> Join -> Track -> Leaderboard.

This is the MVP. If time runs out, this phase alone is a working demo.

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 3.1 | `ProgressRing` with GSAP SVG animation | `components/ui/progress-ring/` | 30 min |
| 3.2 | `AnimatedNumber` with GSAP count-up | `components/ui/animated-number/` | 15 min |
| 3.3 | `Modal` base component | `components/ui/modal/` | 15 min |
| 3.4 | Challenge Explorer page + `ChallengeCard` + `ChallengeFilters` | `app/(app)/challenges/page.tsx`, `components/challenges/challenge-card/`, `components/challenges/challenge-filters/` | 30 min |
| 3.5 | Challenge Detail page + `ChallengeDetailHeader` + `ParticipantList` | `app/(app)/challenges/[id]/page.tsx`, `components/challenges/challenge-detail-header/`, `components/challenges/participant-list/` | 30 min |
| 3.6 | `JoinModal` (stake confirmation, success state) | `components/challenges/join-modal/` | 25 min |
| 3.7 | Dashboard page + `DailyProgress` + `StreakTracker` + `ChallengeStatus` | `app/(app)/dashboard/page.tsx`, `components/dashboard/daily-progress/`, `components/dashboard/streak-tracker/`, `components/dashboard/challenge-status/` | 45 min |
| 3.8 | Wire step simulator to dashboard (live counting) | Integration in dashboard page | 10 min |
| 3.9 | Leaderboard page + `LeaderboardTable` + `LeaderboardRow` | `app/(app)/leaderboard/page.tsx`, `components/leaderboard/leaderboard-table/`, `components/leaderboard/leaderboard-row/` | 25 min |
| 3.10 | "Simulate Next Day" button on dashboard | Dashboard page | 10 min |

**Parallelizable**: 3.1-3.3 (animation + modal primitives), 3.4-3.5 (challenge pages), 3.7 and 3.9 (dashboard + leaderboard)

**Critical path**: 3.1 (ProgressRing) -> 3.7 (Dashboard). The progress ring is the visual centerpiece of the entire demo.

**Milestone**: Full demo loop -- browse challenges, join one, see steps counting up with animated ring, view leaderboard with other participants.

---

### Phase 4: Landing + Results + Claim (1-2 hours)

**Goal**: First impression (landing) and end-game (results, claim) are polished.

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 4.1 | `Hero` with GSAP stagger text animation | `components/landing/hero/` | 30 min |
| 4.2 | `HowItWorks` section (3 step cards) | `components/landing/how-it-works/` | 20 min |
| 4.3 | `StatsBanner` with animated numbers | `components/landing/stats-banner/` | 15 min |
| 4.4 | Assemble landing page | `app/(marketing)/home/page.tsx` | 10 min |
| 4.5 | Results page + `PrizeBreakdown` + `WinnerCard` | `app/(app)/results/page.tsx`, `components/results/prize-breakdown/`, `components/results/winner-card/` | 30 min |
| 4.6 | Claim page + `ClaimCard` + `ClaimSuccess` animation | `app/(app)/claim/page.tsx`, `components/claim/claim-card/`, `components/claim/claim-success/` | 25 min |

**Parallelizable**: 4.1-4.3 (landing sections), 4.5-4.6 (end-game pages)

**Milestone**: Complete narrative arc from "what is this?" (landing) through "you won!" (claim).

---

### Phase 5: Polish (1-2 hours)

**Goal**: Demo-ready. No visual glitches. Smooth flow.

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 5.1 | Page transition animations (opacity fade via Wrapper) | `components/layout/wrapper/` | 15 min |
| 5.2 | "Reset Demo" button in header (resets store to initial state) | Header component | 10 min |
| 5.3 | Mobile responsive pass (test at 375px, 390px, 430px) | All CSS modules | 20 min |
| 5.4 | Empty/loading states for all pages | Various | 15 min |
| 5.5 | Run `bun run check` -- fix all Biome lint + TypeScript errors | All files | 20 min |
| 5.6 | Test full demo flow end-to-end (see Demo Script below) | Manual | 15 min |
| 5.7 | Footer component | `components/layout/footer/` | 10 min |

---

## Estimated Total Effort

| Phase | Time | Cumulative |
|-------|------|------------|
| Phase 1: Foundation | 2-3h | 2-3h |
| Phase 2: Data Layer | 1-2h | 3-5h |
| Phase 3: Core Experience | 2-3h | 5-8h |
| Phase 4: Landing + Results | 1-2h | 6-10h |
| Phase 5: Polish | 1-2h | 7-12h |

**Minimum viable demo**: Phases 1-3 (5-8 hours). User walks through full challenge lifecycle with live step tracking.

**Polished demo**: All phases (7-12 hours). Landing hooks judges. Results/claim close the narrative.

**With parallel agents**: 4-6 hours total. UI primitives, utils, and feature components can be built simultaneously.

---

## Complete File List (55 files)

### App Routes (9 files)

| File | Purpose | Server/Client |
|------|---------|---------------|
| `app/layout.tsx` | Root layout: dark theme, system font, metadata | Server |
| `app/(marketing)/home/page.tsx` | Landing page with hero, how-it-works, stats | Server |
| `app/(app)/layout.tsx` | App shell with header + bottom navigation | Client |
| `app/(app)/challenges/page.tsx` | Challenge explorer with filters | Client |
| `app/(app)/challenges/[id]/page.tsx` | Challenge detail with join flow | Client |
| `app/(app)/dashboard/page.tsx` | Active challenge dashboard with step tracking | Client |
| `app/(app)/leaderboard/page.tsx` | Participant rankings | Client |
| `app/(app)/results/page.tsx` | Completed challenge results | Client |
| `app/(app)/claim/page.tsx` | Reward claim with success animation | Client |

### UI Primitives (17 files)

| Component | Files |
|-----------|-------|
| `components/ui/image/index.tsx` | Image wrapper (Satus) |
| `components/ui/link/index.tsx` | Link wrapper (Satus) |
| `components/ui/button/index.tsx` + `button.module.css` | Button variants |
| `components/ui/card/index.tsx` + `card.module.css` | Card container |
| `components/ui/badge/index.tsx` + `badge.module.css` | Status badges |
| `components/ui/modal/index.tsx` + `modal.module.css` | Modal overlay |
| `components/ui/progress-ring/index.tsx` + `progress-ring.module.css` | GSAP SVG ring |
| `components/ui/stat-card/index.tsx` + `stat-card.module.css` | Stat display |
| `components/ui/animated-number/index.tsx` | GSAP count-up |

### Layout Components (8 files)

| Component | Files |
|-----------|-------|
| `components/layout/header/index.tsx` + `header.module.css` | App header |
| `components/layout/footer/index.tsx` + `footer.module.css` | Footer |
| `components/layout/wrapper/index.tsx` + `wrapper.module.css` | Page wrapper |
| `components/layout/navigation/index.tsx` + `navigation.module.css` | Bottom tabs |

### Feature Components (26 files)

| Component | Files |
|-----------|-------|
| `components/landing/hero/index.tsx` + `hero.module.css` | Hero section |
| `components/landing/how-it-works/index.tsx` + `how-it-works.module.css` | 3-step explainer |
| `components/landing/stats-banner/index.tsx` + `stats-banner.module.css` | Platform stats |
| `components/challenges/challenge-card/index.tsx` + `challenge-card.module.css` | Explorer card |
| `components/challenges/challenge-filters/index.tsx` + `challenge-filters.module.css` | Filter bar |
| `components/challenges/challenge-detail-header/index.tsx` + `challenge-detail-header.module.css` | Detail header |
| `components/challenges/participant-list/index.tsx` + `participant-list.module.css` | Participants |
| `components/challenges/join-modal/index.tsx` + `join-modal.module.css` | Join confirmation |
| `components/dashboard/daily-progress/index.tsx` + `daily-progress.module.css` | Step ring |
| `components/dashboard/streak-tracker/index.tsx` + `streak-tracker.module.css` | Day circles |
| `components/dashboard/challenge-status/index.tsx` + `challenge-status.module.css` | Info bar |
| `components/leaderboard/leaderboard-table/index.tsx` + `leaderboard-table.module.css` | Table |
| `components/leaderboard/leaderboard-row/index.tsx` + `leaderboard-row.module.css` | Row |
| `components/results/prize-breakdown/index.tsx` + `prize-breakdown.module.css` | Distribution |
| `components/results/winner-card/index.tsx` + `winner-card.module.css` | Winner display |
| `components/claim/claim-card/index.tsx` + `claim-card.module.css` | Claim CTA |
| `components/claim/claim-success/index.tsx` + `claim-success.module.css` | Success animation |

### Lib (10 files)

| File | Purpose |
|------|---------|
| `lib/hooks/use-challenge-store.ts` | Zustand store: all state + actions |
| `lib/hooks/use-step-simulator.ts` | Step data generation via setInterval |
| `lib/hooks/use-countdown.ts` | Time remaining countdown |
| `lib/hooks/use-animated-value.ts` | GSAP number tween wrapper |
| `lib/utils/mock-data.ts` | Seed data factory |
| `lib/utils/format.ts` | Formatting utilities |
| `lib/utils/challenge.ts` | Prize pool math + helpers |
| `lib/utils/constants.ts` | All magic numbers |
| `lib/services/wallet.ts` | Mock wallet |
| `lib/services/challenge-contract.ts` | Mock contract |

### Styles (2 files)

| File | Purpose |
|------|---------|
| `lib/styles/css/root.css` | CSS custom properties |
| `lib/styles/config.ts` | Tailwind theme extension |

---

## Satus Convention Compliance

Every file must follow these rules. Violations will fail Biome lint or TypeScript checks.

- [x] CSS Modules imported as `s` (`import s from './x.module.css'`)
- [x] Path aliases only (`@/components/*`, `@/hooks/*`, `@/utils/*`) -- zero `../` imports
- [x] Named function declarations (`export function X()`) -- not arrow functions
- [x] kebab-case filenames (`challenge-card.tsx`, not `ChallengeCard.tsx`)
- [x] CamelCase CSS class names (`.isActive`, `.progressRing`)
- [x] Server Components by default -- `'use client'` only where hooks/events needed
- [x] No `useMemo`, `useCallback`, `React.memo` (React Compiler handles optimization)
- [x] No `any` types -- use `unknown` + type narrowing
- [x] `import type` for type-only imports
- [x] Sorted Tailwind classes in `className`, `cn()`, `clsx()`
- [x] `@/components/ui/image` and `@/components/ui/link` wrappers, never raw `<img>` or `<a>`
- [x] Zustand for global state, React state for component-local state
- [x] `clsx` imported as `cn` for class composition
- [x] GSAP for complex animations, CSS transitions for simple ones
- [x] `bun run check` must pass before any commit

---

## Demo Flow Script (for hackathon presentation)

**Total demo time: ~3 minutes**

1. **Open landing page** -- hero animation plays, stats count up from 0
2. **Click "Start a Challenge"** -- navigate to challenge explorer
3. **Show challenge grid** -- filter between Active / Upcoming / Completed
4. **Click "Spring Sprint"** -- see challenge detail: 0.005 BTC stake, 8 participants, day 9
5. **Click "Join Challenge"** -- modal slides up, shows stake amount + wallet balance
6. **Click "Confirm & Stake"** -- checkmark animation, "You're in!"
7. **Click "Go to Dashboard"** -- redirect to dashboard
8. **Watch the progress ring** -- steps count up in real-time (50-200 per tick)
9. **See streak tracker** -- 8 green circles (past days) + 1 amber (today)
10. **Steps hit 7,000** -- ring turns green, text changes to "Goal Completed"
11. **Click "Leaderboard"** -- see all 8 participants ranked. 2 are eliminated (red badges).
12. **Click "Simulate Day" a few times** -- advance to challenge end
13. **Navigate to Results** -- show completed challenge prize breakdown (0.0475 BTC / 3 winners)
14. **Navigate to Claim** -- see prize amount (0.01583 BTC)
15. **Click "Claim Reward"** -- success animation: checkmark, amount, "Sent to your wallet"
16. **Click "Back to Challenges"** -- full circle

---

## Stretch Goals (if time permits)

1. **localStorage persistence** -- store state survives page refresh via Zustand `persist` middleware
2. **Haptic feedback** -- `navigator.vibrate(50)` on goal completion
3. **Sound effects** -- subtle chime on goal hit and reward claim (small mp3)
4. **Challenge creation form** -- let users create custom challenges
5. **Animated confetti** -- CSS particles on claim success
6. **OG image generation** -- dynamic OG images for challenge sharing
7. **PWA manifest** -- installable as mobile home screen app

---

## Delegation Notes

### For Scaffolder (parallel, Phase 1)
All UI primitives follow the same pattern. Scaffold in one batch:

```tsx
// Pattern for every UI primitive
import s from './component-name.module.css'
import cn from 'clsx'
import type { ComponentProps } from 'react'

interface ComponentNameProps extends ComponentProps<'div'> {
  variant?: 'primary' | 'secondary'
}

export function ComponentName({ variant = 'primary', className, ...props }: ComponentNameProps) {
  return <div className={cn(s.root, s[variant], className)} {...props} />
}
```

Scaffold: `button`, `card`, `badge`, `stat-card`, `modal`, `header`, `footer`, `wrapper`, `navigation`.

Route placeholder files can also be scaffolded.

### For Implementer (sequential, Phases 2-4)
- `use-challenge-store.ts` is the most complex file. Build store first, wire components after.
- `progress-ring/index.tsx` requires GSAP + SVG `stroke-dashoffset` math. This is the visual hero.
- `mock-data.ts` must be deterministic so the demo is reproducible every time.
- `animated-number/index.tsx` is reused in 5+ places -- make it robust.

### For Reviewer
- Verify every file follows Satus conventions (CSS Module `s`, path aliases, named functions).
- Verify zero `any` types. All `import type` where needed.
- Run `bun run check` before approval.
- Visual review: does the dark theme look consistent? Do animations feel smooth?

---

*Plan complete. Delegate to implementer for execution.*
