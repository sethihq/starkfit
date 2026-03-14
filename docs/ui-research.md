# Fitness Challenge App UI Research

> Compiled research on design patterns, color schemes, component patterns, and implementation techniques for a Web3 fitness challenge app with dark theme.

---

## 1. Color Schemes: Dark Theme with Fitness/Energy Vibes

### Recommended Dark Palette

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background (deepest) | Near-black | `#0A0A0F` / `#0D0D12` | App background |
| Surface | Dark charcoal | `#141419` / `#1A1A22` | Card backgrounds |
| Surface elevated | Lighter charcoal | `#1E1E28` / `#242430` | Modals, dropdowns |
| Border | Subtle gray | `#2A2A35` / `#333340` | Card borders, dividers |
| Text primary | Off-white | `#F0F0F5` / `#E8E8ED` | Headings, key numbers |
| Text secondary | Muted gray | `#8888A0` / `#6B6B80` | Labels, descriptions |
| Text tertiary | Dim gray | `#555568` | Timestamps, metadata |

### Accent Color System (Energy/Fitness Vibes)

| Accent | Hex Range | Emotion | Usage |
|--------|-----------|---------|-------|
| Electric green | `#00FF88` to `#22C55E` | Energy, success, GO | Steps progress, achievements |
| Neon lime | `#84FF00` to `#A3E635` | Active, vibrant | Active challenges, live status |
| Vivid purple | `#8B5CF6` to `#A855F7` | Crypto, premium | Staking, token displays |
| Hot orange | `#FF6B35` to `#F97316` | Urgency, calories | Calories burned, streak alerts |
| Electric blue | `#3B82F6` to `#60A5FA` | Trust, data | Charts, distance |
| Warm gold | `#FACC15` to `#FCD34D` | Reward, achievement | Badges, leaderboard crown |
| Coral/red | `#EF4444` to `#F87171` | Alert, heartbeat | Heart rate, warnings |

### Gradient Combos (for progress rings and CTAs)

```css
/* Energy gradient (primary action) */
background: linear-gradient(135deg, #00FF88, #00D4FF);

/* Staking/crypto gradient */
background: linear-gradient(135deg, #8B5CF6, #EC4899);

/* Achievement/gold gradient */
background: linear-gradient(135deg, #FACC15, #F97316);

/* Dark glass card */
background: rgba(20, 20, 25, 0.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.06);
```

### Key Design Principles from Research

- **Behance fitness app studies** use layered gray backgrounds (`grey-800` through `grey-900`) with a single bright accent (`#0057ff` blue) for interactive elements
- **Success states** use green (`green-400`), creating clear contrast against dark backgrounds
- Cards use subtle borders (`grey-700`) with `box-shadow: 0 1px 10px rgba(0,0,0,0.1)` for depth
- Dark themes should have at least 3 surface levels to create depth hierarchy

---

## 2. Dashboard Layout Patterns

### Mobile-First Fitness Dashboard Structure

```
+----------------------------------+
|  Header: Logo + Wallet + Avatar  |
+----------------------------------+
|  [Today's Challenge Card]        |
|  Large hero with progress ring   |
+----------------------------------+
|  Quick Stats Row                 |
|  [Steps] [Calories] [Distance]  |
+----------------------------------+
|  [Staking / Earnings Card]       |
|  Token balance + daily earnings  |
+----------------------------------+
|  [Active Challenges]             |
|  Horizontal scroll cards         |
+----------------------------------+
|  [Leaderboard Preview]           |
|  Top 3 podium + your rank       |
+----------------------------------+
|  Bottom Nav                      |
|  Home | Challenges | Stake | Me  |
+----------------------------------+
```

### Spacing System (from Behance design systems)

| Token | Value | Usage |
|-------|-------|-------|
| `sp-1` | 4px | Icon padding |
| `sp-2` | 8px | Tight gaps |
| `sp-3` | 12px | Inline spacing |
| `sp-4` | 16px | Card padding (small) |
| `sp-5` | 20px | Section gaps |
| `sp-6` | 24px | Card padding (default) |
| `sp-8` | 32px | Container padding |
| `sp-10` | 40px | Section separators |

### Card Design Token

```css
.stat-card {
  background: var(--surface);           /* #141419 */
  border: 1px solid var(--border);       /* #2A2A35 */
  border-radius: 16px;                   /* Larger radius = modern feel */
  padding: 20px 24px;
  box-shadow: 0 1px 10px rgba(0, 0, 0, 0.1);
}
```

### Typography Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Hero number | 48-64px | 800-900 | Step count, main metric |
| Section heading | 20-24px | 700 | "Today's Challenge" |
| Card title | 16-18px | 600 | Card headers |
| Body | 14-16px | 400 | Descriptions |
| Label | 12px | 600 | "STEPS", "CALORIES" |
| Caption | 11px | 400 | Timestamps |

**Font recommendations**: Inter, Space Grotesk, or JetBrains Mono for numbers (monospace numbers prevent layout shift during animation).

---

## 3. Circular Progress Ring Implementation

### Method A: SVG stroke-dasharray (Recommended for React)

This is the most flexible approach with full animation control.

```tsx
interface ProgressRingProps {
  progress: number     // 0-100
  size?: number        // px
  strokeWidth?: number // px
  color?: string
}

function ProgressRing({
  progress,
  size = 200,
  strokeWidth = 8,
  color = '#00FF88'
}: ProgressRingProps) {
  const radius = (size / 2) - (strokeWidth * 2)
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-700 ease-out"
      />
    </svg>
  )
}
```

**Key math:**
- `circumference = radius * 2 * PI`
- `offset = circumference - (percent / 100 * circumference)`
- Rotate SVG -90deg so progress starts at top (12 o'clock position)
- `strokeLinecap="round"` for smooth rounded ends

### Method B: CSS conic-gradient (Simpler, less flexible)

```tsx
function ProgressRingCSS({ progress, size = 200 }: { progress: number; size?: number }) {
  const angle = (progress / 100) * 360

  return (
    <div
      className="rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(
          from 0deg,
          #00FF88 0deg,
          #00FF88 ${angle}deg,
          rgba(255,255,255,0.08) ${angle}deg,
          rgba(255,255,255,0.08) 360deg
        )`
      }}
    >
      {/* Inner circle to create ring effect */}
      <div
        className="rounded-full bg-[#0A0A0F] flex items-center justify-center"
        style={{ width: size - 24, height: size - 24 }}
      >
        <span className="text-4xl font-bold text-white">
          {progress}%
        </span>
      </div>
    </div>
  )
}
```

**Tradeoffs:**
- Conic-gradient is simpler but harder to animate smoothly and cannot have rounded ends
- SVG method supports `stroke-linecap="round"`, gradient strokes, and smooth CSS transitions
- SVG is better for accessibility (can attach ARIA attributes to the SVG element)

### Method C: Gradient Progress Ring (Premium feel)

```tsx
function GradientProgressRing({ progress, size = 200 }: { progress: number; size?: number }) {
  const strokeWidth = 8
  const radius = (size / 2) - (strokeWidth * 2)
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference
  const gradientId = 'progress-gradient'

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00FF88" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="transparent"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="transparent"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-[stroke-dashoffset] duration-1000 ease-out"
      />
    </svg>
  )
}
```

### Animation Techniques for Progress Rings

```css
/* Smooth reveal on mount */
@keyframes ring-reveal {
  from { stroke-dashoffset: var(--circumference); }
  to   { stroke-dashoffset: var(--target-offset); }
}

.progress-ring__circle {
  animation: ring-reveal 1.5s ease-out forwards;
}

/* Pulsing glow effect */
@keyframes ring-glow {
  0%, 100% { filter: drop-shadow(0 0 4px rgba(0, 255, 136, 0.3)); }
  50%      { filter: drop-shadow(0 0 12px rgba(0, 255, 136, 0.6)); }
}

/* Number counting animation (use framer-motion or manual) */
@keyframes count-up {
  from { --num: 0; }
  to   { --num: var(--target); }
}
```

---

## 4. Tailwind CSS Animation Utilities

### Built-in Animations

| Class | Effect | Fitness App Usage |
|-------|--------|-------------------|
| `animate-spin` | 360deg rotation, 1s linear infinite | Loading states |
| `animate-ping` | Scale + fade, 1s infinite | Live activity dot, notification badge |
| `animate-pulse` | Opacity fade, 2s infinite | Skeleton loaders, inactive states |
| `animate-bounce` | Vertical bounce, 1s infinite | Scroll indicators, CTA attention |

### Custom Fitness Animations in Tailwind v4

```css
@theme {
  /* Step counter tick */
  --animate-count: count 0.3s ease-out;
  @keyframes count {
    0% { transform: scale(1); }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }

  /* Achievement unlock */
  --animate-unlock: unlock 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  @keyframes unlock {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }

  /* Glow pulse for active elements */
  --animate-glow: glow 2s ease-in-out infinite;
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 136, 0.2); }
    50% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.4); }
  }

  /* Slide up for cards entering view */
  --animate-slide-up: slide-up 0.5s ease-out;
  @keyframes slide-up {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
}
```

### Accessibility: Respect `prefers-reduced-motion`

```html
<svg class="motion-safe:animate-spin"><!-- spinner --></svg>
<div class="motion-safe:animate-glow"><!-- active challenge --></div>
```

### Arbitrary Animation Values

```html
<div class="animate-[slide-up_0.5s_ease-out_forwards]">
  <!-- content -->
</div>
```

---

## 5. Leaderboard UI Patterns

### Top 3 Podium Design

```
        [1st]
         /\
        /  \
  [2nd]/    \[3rd]
  =====/======\=====

  Crown icon on #1
  Gold / Silver / Bronze color coding
  Avatar + name + step count
  Slight upward animation on load
```

**Design details:**
- 1st place: Gold (`#FACC15`) border/glow, crown badge, largest avatar (64px), elevated position
- 2nd place: Silver (`#C0C0C0`) border, slightly smaller avatar (52px), left position
- 3rd place: Bronze (`#CD7F32`) border, same as 2nd, right position
- Use `transform: translateY(-Xpx)` to create visual height hierarchy

### List Leaderboard (Ranks 4+)

```
+------------------------------------------+
| #4  [Avatar]  Username       12,450 steps|
|     [Rank change indicator: up/down/same]|
+------------------------------------------+
| #5  [Avatar]  Username       11,200 steps|
+------------------------------------------+
| ...                                      |
+------------------------------------------+
| #42 [Avatar]  You (highlighted)  8,100   |
|     [Sticky at bottom or scrolled-to]    |
+------------------------------------------+
```

**Design patterns:**
- Current user row: highlighted with accent border-left or subtle background tint
- Rank change indicators: green up-arrow, red down-arrow, gray dash for unchanged
- Alternating row backgrounds: `bg-surface` / `bg-surface-alt` for readability
- Sticky user position: always visible at bottom with "You" badge
- Step count right-aligned with monospace font for alignment

### Leaderboard Component Patterns

```tsx
// Rank badge with color coding
function RankBadge({ rank }: { rank: number }) {
  const styles = {
    1: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    2: 'bg-gray-400/20 text-gray-300 border-gray-400/30',
    3: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
  }
  return (
    <span className={`
      inline-flex items-center justify-center
      w-8 h-8 rounded-full border text-sm font-bold
      ${styles[rank] || 'bg-white/5 text-gray-400 border-white/10'}
    `}>
      {rank}
    </span>
  )
}
```

---

## 6. Web3 Fitness App Design Patterns (STEPN / Sweat Economy / Move-to-Earn)

### STEPN Design Language

- **Primary palette**: Dark navy/black background with neon green (`#B8FF04`) as primary accent
- **Energy system**: Displayed as a battery-style meter or segmented bar (e.g., 2/10 energy)
- **NFT sneaker cards**: Rounded corner cards with sneaker image, stats below (Efficiency, Luck, Comfort, Resilience), rarity color border (Common=gray, Uncommon=green, Rare=blue, Epic=purple, Legendary=gold)
- **Earnings display**: Token amount with token icon, real-time counter during activity
- **Map integration**: Dark-themed map for route tracking during walks/runs

### Common Web3 Fitness UI Components

| Component | Pattern |
|-----------|---------|
| Token balance | Icon + amount + USD equivalent, top-right or in-header |
| Staking card | APY badge, staked amount, earnings counter, claim button |
| Challenge card | Title, duration bar, reward pool, participants count, join CTA |
| Energy meter | Segmented bar (like battery), or circular with segments |
| NFT display | Card with image, rarity border color, level badge, stats grid |
| Wallet connect | Top-right button, truncated address, network indicator |
| Reward claim | Animated token icon, amount, "Claim" CTA with gradient |

### Staking Challenge UI Pattern

```
+-----------------------------------------------+
| DAILY 10K CHALLENGE                  [ACTIVE]  |
|                                                |
|   [Progress Ring: 7,842 / 10,000 steps]        |
|                                                |
|   Staked: 100 STRK          Potential: 115 STRK|
|   Time left: 14h 23m                           |
|                                                |
|   [=========>---------]  78.4%                 |
|                                                |
|   48 participants  |  Prize pool: 2,400 STRK   |
+-----------------------------------------------+
```

### Token Display Patterns

```tsx
// Compact token amount
function TokenAmount({ amount, symbol, icon }: TokenProps) {
  return (
    <div className="flex items-center gap-2">
      <img src={icon} alt={symbol} className="w-5 h-5" />
      <span className="font-mono font-bold text-white">
        {amount.toLocaleString()}
      </span>
      <span className="text-sm text-gray-400">{symbol}</span>
    </div>
  )
}
```

---

## 7. Gamification UI Patterns

### Core Gamification Elements for Fitness

| Pattern | Implementation | Psychology |
|---------|---------------|------------|
| **Daily streak** | Flame icon + counter, calendar heatmap | Loss aversion |
| **Progress rings** | Circular SVG, 3 concentric rings (steps/cal/dist) | Goal gradient |
| **Badges/achievements** | Locked (grayscale) vs unlocked (colored), grid display | Collection drive |
| **Challenges** | Time-limited, group-based, progress bar | Competition |
| **Leaderboard** | Weekly reset, friend-only option, rank changes | Social comparison |
| **Milestone rewards** | Token rewards at step thresholds (5K, 10K, 15K) | Variable rewards |
| **Level system** | XP bar, level number, title progression | Mastery feeling |

### Streak Display

```
+---+---+---+---+---+---+---+
| M | T | W | T | F | S | S |  <- day labels
| * | * | * | * | * |   |   |  <- filled = completed
+---+---+---+---+---+---+---+
       7-day streak: 5 days
```

**Design notes:**
- Use green filled circles for completed days
- Current day has pulsing ring animation
- Missed days show empty circle with subtle red tint
- Display streak flame icon that grows with longer streaks

### Achievement Badge Grid

```tsx
function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {badges.map(badge => (
        <div
          key={badge.id}
          className={`
            flex flex-col items-center gap-2 p-3 rounded-xl
            ${badge.unlocked
              ? 'bg-white/5'
              : 'bg-white/[0.02] opacity-40 grayscale'
            }
          `}
        >
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${badge.unlocked
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
              : 'bg-gray-800'
            }
          `}>
            <span className="text-2xl">{badge.icon}</span>
          </div>
          <span className="text-xs text-center text-gray-400">
            {badge.name}
          </span>
        </div>
      ))}
    </div>
  )
}
```

### Challenge Card

```tsx
function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const progressPct = (challenge.current / challenge.target) * 100

  return (
    <div className="bg-[#141419] border border-[#2A2A35] rounded-2xl p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">
            {challenge.type}
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            {challenge.title}
          </h3>
        </div>
        <span className="text-xs text-gray-400">
          {challenge.timeLeft}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-cyan-400
                     transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">
          {challenge.current.toLocaleString()} / {challenge.target.toLocaleString()} steps
        </span>
        <span className="font-mono font-bold text-green-400">
          {progressPct.toFixed(1)}%
        </span>
      </div>

      {/* Footer: stake + participants */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-sm font-medium">
            Staked: {challenge.staked} STRK
          </span>
        </div>
        <div className="flex -space-x-2">
          {/* Participant avatars */}
          {challenge.participants.slice(0, 3).map((p, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full border-2 border-[#141419] bg-gray-700"
            />
          ))}
          {challenge.participants.length > 3 && (
            <span className="text-xs text-gray-400 ml-2">
              +{challenge.participants.length - 3}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 8. Key UI Components Checklist

### Must-Have Components

- [ ] **Progress Ring** - SVG-based, gradient stroke, animated on load
- [ ] **Stat Card** - Large number + label + icon, glass morphism background
- [ ] **Challenge Card** - Title, progress bar, stake amount, participants, timer
- [ ] **Leaderboard List** - Rank, avatar, name, steps, rank change indicator
- [ ] **Podium (Top 3)** - Elevated layout with gold/silver/bronze styling
- [ ] **Token Balance** - Icon + amount + symbol, header placement
- [ ] **Streak Calendar** - 7-day row with filled/empty circles
- [ ] **Achievement Badge** - Locked/unlocked states, icon + name
- [ ] **Staking Panel** - Input, APY display, earnings counter, claim button
- [ ] **Activity Feed** - Recent completions, friend activity
- [ ] **Bottom Navigation** - 4-5 tabs with icons + labels
- [ ] **Wallet Connect Button** - Truncated address, network dot

### Nice-to-Have Components

- [ ] **Animated counter** - Number ticking up on data load
- [ ] **Confetti/particle** - On achievement unlock or challenge completion
- [ ] **Route map** - Dark theme map showing walking route
- [ ] **Energy meter** - Battery-style segmented display
- [ ] **Notification toast** - "Challenge completed!" with haptic feel
- [ ] **Pull to refresh** - With step count animation

---

## 9. Design System Recommendations

### Tailwind v4 Theme Configuration

```css
@theme {
  /* Colors */
  --color-bg: #0A0A0F;
  --color-surface: #141419;
  --color-surface-elevated: #1E1E28;
  --color-border: #2A2A35;
  --color-text-primary: #F0F0F5;
  --color-text-secondary: #8888A0;
  --color-text-tertiary: #555568;

  --color-accent-green: #00FF88;
  --color-accent-purple: #8B5CF6;
  --color-accent-orange: #F97316;
  --color-accent-blue: #3B82F6;
  --color-accent-gold: #FACC15;

  /* Spacing */
  --spacing-card: 20px;
  --spacing-section: 32px;

  /* Border radius */
  --radius-card: 16px;
  --radius-button: 12px;
  --radius-badge: 8px;
  --radius-full: 9999px;

  /* Animations */
  --animate-ring-reveal: ring-reveal 1.5s ease-out forwards;
  --animate-count-bump: count-bump 0.3s ease-out;
  --animate-glow-pulse: glow-pulse 2s ease-in-out infinite;
  --animate-slide-up: slide-up 0.5s ease-out forwards;
  --animate-badge-unlock: badge-unlock 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes ring-reveal {
    from { stroke-dashoffset: var(--circumference); }
    to   { stroke-dashoffset: var(--target-offset); }
  }

  @keyframes count-bump {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.12); }
    100% { transform: scale(1); }
  }

  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 136, 0.2); }
    50%      { box-shadow: 0 0 20px rgba(0, 255, 136, 0.4); }
  }

  @keyframes slide-up {
    0%   { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }

  @keyframes badge-unlock {
    0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
    100% { transform: scale(1) rotate(0); opacity: 1; }
  }
}
```

### Glass Morphism Card Utility

```css
.glass-card {
  background: rgba(20, 20, 25, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}
```

---

## 10. Reference Apps and Inspiration

| App | Key Takeaway |
|-----|--------------|
| **STEPN** | Neon green on dark, energy meter, NFT sneaker cards, real-time earning counter |
| **Sweat Economy** | Step-to-crypto conversion, clean token displays, staking UI |
| **Apple Fitness** | 3-ring system (move/exercise/stand), bold colors on black, summary cards |
| **Nike Run Club** | Route maps, achievement badges, streak tracking, social leaderboards |
| **Strava** | Activity feed, segment leaderboards, kudos system, heatmaps |
| **Fitbit** | Dashboard stat cards, sleep/activity breakdown, challenge invites |
| **Habito / Duolingo** | Streak flames, XP system, league leaderboards (weekly reset) |
| **StepBet** | Betting/staking on step goals, group challenges, payout visualization |

### Design Principles to Follow

1. **Numbers should be heroes** -- step counts, earnings, and streaks should be the largest visual elements
2. **Progress should feel alive** -- animate rings, pulse active challenges, count up numbers
3. **Dark != flat** -- use surface layers, subtle borders, and glass morphism for depth
4. **Crypto should feel earned** -- connect token displays directly to fitness achievements
5. **Competition drives engagement** -- leaderboards, rank changes, and social proof everywhere
6. **Reduce friction to zero** -- one-tap joins, auto-tracking, instant feedback

---

## 11. Technical Implementation Notes

### SVG Progress Ring: The Complete Formula

```
radius = (containerSize / 2) - (strokeWidth * 2)
circumference = 2 * Math.PI * radius
strokeDasharray = circumference
strokeDashoffset = circumference - (progressPercent / 100 * circumference)
```

Always rotate the SVG `-90deg` so the arc starts from the 12 o'clock position. Use `stroke-linecap="round"` for polished rounded ends.

### Transition Classes for Fitness UI

```html
<!-- Progress bar fill -->
<div class="transition-all duration-700 ease-out" />

<!-- Number counter -->
<span class="transition-[transform] duration-300 ease-out" />

<!-- Card entrance -->
<div class="transition-[opacity,transform] duration-500 ease-out" />

<!-- Ring progress -->
<circle class="transition-[stroke-dashoffset] duration-1000 ease-out" />
```

### Accessibility Considerations

- Progress rings must have `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Respect `prefers-reduced-motion`: wrap animations in `motion-safe:` prefix
- Ensure 4.5:1 contrast ratio for text on dark backgrounds
- Leaderboard rows need proper `role="row"` semantics
- Token amounts should be readable by screen readers (include unit names)

---

*Research compiled from: Behance design systems, CSS-Tricks SVG techniques, MDN conic-gradient and stroke-dasharray documentation, Tailwind CSS animation docs, and analysis of STEPN, Sweat Economy, Apple Fitness, and Strava design patterns.*
