# Viral Crypto/Web3 Hackathon Patterns -- Deep Research

> Research compiled for StarkZap hackathon strategy.
> Sources: Documented viral crypto projects 2022-2025, public post-mortems, growth analyses.

---

## Table of Contents

1. [Viral Case Studies](#1-viral-case-studies)
2. [Telegram Mini Games Phenomenon](#2-telegram-mini-games-phenomenon)
3. [Viral Onchain Games](#3-viral-onchain-games)
4. [Farcaster Frames -- Viral In-Feed Experiences](#4-farcaster-frames--viral-in-feed-experiences)
5. [Gasless / Frictionless UX Patterns](#5-gasless--frictionless-ux-patterns)
6. [Starknet Ecosystem & Past Hackathon Winners](#6-starknet-ecosystem--past-hackathon-winners)
7. [Crypto Typing / TypeRacer Concepts](#7-crypto-typing--typeracer-concepts)
8. [Core Viral Mechanics Taxonomy](#8-core-viral-mechanics-taxonomy)
9. [Actionable Ideas for a Starknet Hackathon](#9-actionable-ideas-for-a-starknet-hackathon)
10. [The Viral Hackathon Project Playbook](#10-the-viral-hackathon-project-playbook)

---

## 1. Viral Case Studies

### 1.1 pump.fun (Solana, Jan 2024 -- present)

**What it is:** One-click meme coin launchpad on Solana. Anyone can create a token with a name, image, and bonding curve in seconds.

**Why it went viral:**
- **Zero friction creation:** Creating a token takes <60 seconds, no code needed, costs ~$2
- **Bonding curve mechanics:** Tokens launch on a bonding curve (price rises with each buy), creating immediate price action and FOMO
- **Built-in social feed:** Live feed of new tokens being created, with comments, creating a doom-scrolling experience
- **PvP gambling disguised as trading:** Every token is a micro-casino. Early buyers can 100x if it catches on
- **Meme culture native:** Incentivizes creativity -- the funniest/most topical meme wins attention
- **Screenshot culture:** People sharing massive gains/losses on Twitter creates organic content
- **Revenue:** Generated $100M+ in fees within months, processing millions of token launches

**Key viral mechanics:**
- Creation as engagement (user-generated content)
- Financial FOMO (price curves visible in real-time)
- Loss/gain porn (shareable screenshots)
- Low barrier to entry
- Real-time social feed (addictive refresh loop)

**Lesson for hackathons:** Let users CREATE something (a token, a bet, a challenge) rather than just consume. Every creation is a potential viral moment.

---

### 1.2 friend.tech (Base, Aug 2023)

**What it is:** Social app where you buy/sell "keys" (shares) of people. Each person has a bonding curve for their keys. Owning keys grants access to a private chat.

**Why it went viral:**
- **Financialized social status:** You could literally speculate on people's social value
- **Invite-only + airdrop farming:** Early users got points, creating FOMO for those without access
- **Twitter identity integration:** Linked directly to Twitter accounts, making it inherently shareable
- **Bonding curves on people:** Price of someone's keys goes up as more people buy -- creates social FOMO
- **Celebrity/influencer adoption:** Crypto Twitter influencers pumped their own keys, driving followers to buy
- **TVL:** Hit $50M+ TVL within weeks of launch
- **Revenue:** Earned $50M+ in protocol fees

**Key viral mechanics:**
- Social speculation (bet on people you know)
- Identity-linked (tied to existing Twitter identity)
- Invite-only exclusivity
- Points/airdrop speculation
- Influencer-aligned incentives (creators profit from their own popularity)

**Lesson for hackathons:** Tie the experience to real social identity. When people can show off their rank/status and it's linked to their Twitter, they share it.

---

### 1.3 Farcaster Frames (Jan 2024)

**What it is:** Interactive mini-apps embedded directly in Farcaster social feed posts. Users can click buttons, play games, mint NFTs, swap tokens -- all without leaving the social feed.

**Why it went viral:**
- **In-feed interactivity:** First social protocol to allow onchain actions embedded in posts
- **$DEGEN tipping:** The $DEGEN token let users tip each other in the feed, creating an attention economy
- **Frame launch frenzy:** Developers built hundreds of frames in days (games, polls, mints, quizzes)
- **Viral frames:** Specific frames went massively viral:
  - **$DEGEN tipping frame:** Tip tokens to anyone in your feed
  - **Bracket prediction frames:** March Madness-style brackets onchain
  - **NFT minting frames:** One-click mint directly in-feed
  - **Onchain games:** Simple games (rock-paper-scissors, coin flips) playable in-feed
- **DAU spike:** Farcaster went from ~2K DAU to 40K+ DAU within weeks of frames launch

**Key viral mechanics:**
- Zero-click onchain actions (no wallet popup, no gas, just click)
- In-feed discovery (viral through social sharing, not app stores)
- Composability (anyone can build a frame, remix existing ones)
- Social proof (see friends interacting with frames)

**Lesson for hackathons:** If your experience can be embedded in a social feed and interacted with in one click, it spreads orders of magnitude faster than a standalone app.

---

### 1.4 Dark Forest (ETH, 2020-2022)

**What it is:** Fully onchain real-time strategy game using zero-knowledge proofs. Players explore an infinite universe, conquer planets, and battle -- all onchain with fog-of-war via ZK.

**Why it went viral in crypto circles:**
- **First real ZK game:** Proved that ZK proofs could enable hidden information games onchain
- **Emergent social dynamics:** Alliances, betrayals, wars -- all happening onchain
- **Plugin ecosystem:** Players built bots and plugins to automate strategies
- **Competitive rounds:** Time-limited rounds with leaderboards created urgency
- **Community-driven:** Active Discord with real-time war coordination

**Key viral mechanics:**
- Novel technology demonstration (ZK for gaming)
- Competitive leaderboards with time pressure
- Emergent social gameplay
- Plugin/mod ecosystem (community extends the game)

**Lesson for hackathons:** Novel use of core chain technology (ZK proofs on Starknet) in a game context captures developer and investor attention.

---

### 1.5 Loot (NFT, Aug 2021)

**What it is:** 8,000 NFTs containing only plain text -- randomized adventure gear lists. No images, no game, no roadmap. Just text on a black background.

**Why it went viral:**
- **Radical simplicity:** Just text. No art, no game. Let the community build everything
- **Composability as a feature:** Other projects could build on top of Loot
- **Community world-building:** Dozens of derivative projects launched within days
- **Floor price:** Hit 10+ ETH within days of free mint

**Lesson for hackathons:** Sometimes the most viral thing is the most minimal thing. Leave room for imagination and community participation.

---

### 1.6 Polymarket (2024 US Election)

**What it is:** Prediction market platform. Users bet on real-world event outcomes.

**Why it went viral:**
- **US election coverage:** Became THE source for election odds, cited by mainstream media
- **Real money on the line:** Stakes make it compelling content
- **Embeddable odds:** Media outlets embedded Polymarket odds in articles
- **Volume:** $1B+ in election betting volume

**Key viral mechanics:**
- Real-world relevance (everyone cares about elections)
- Shareable data (odds/probabilities are inherently tweetable)
- Skin in the game (financial stakes create engagement)
- Media amplification

---

## 2. Telegram Mini Games Phenomenon

### 2.1 Notcoin (2024)

**What it is:** Tap-to-earn game on Telegram. Users tap a coin to earn points, later convertible to $NOT token.

**Stats:**
- 35M+ players before token launch
- $NOT token launched on TON blockchain
- Hit $1B+ market cap within days of token launch

**Why it went viral:**
- **Telegram-native:** No app download needed, just open in Telegram
- **Tap-to-earn simplicity:** Anyone can tap a button
- **Referral rewards:** Invite friends for bonus points
- **Token speculation:** Players farmed points expecting an airdrop
- **Social proof:** Leagues and teams created community competition

### 2.2 Hamster Kombat (2024)

**What it is:** Telegram game where you run a crypto exchange. Tap to earn, upgrade your exchange, climb leaderboards.

**Stats:**
- 300M+ players at peak (largest crypto game ever by user count)
- YouTube channel hit 30M+ subscribers
- Multi-language global expansion

**Why it went viral:**
- **Simple core loop:** Tap, earn, upgrade, repeat
- **Daily rewards:** Must return daily to maintain combos/streaks
- **Referral system:** Multi-level referral bonuses
- **Global accessibility:** Available in dozens of languages
- **Speculative farming:** Users expected massive airdrop

### 2.3 Catizen (2024)

- Cat-themed idle game on Telegram
- 20M+ players
- Gamified DeFi mechanics (staking cats, breeding, trading)

### 2.4 Common Patterns Across Telegram Games

| Pattern | Implementation |
|---------|---------------|
| **Zero friction entry** | No wallet, no download, just Telegram bot |
| **Tap-to-earn** | Simplest possible game mechanic |
| **Referral loops** | Invite friends = more rewards |
| **Daily retention hooks** | Streaks, daily combos, time-limited events |
| **Speculative farming** | Points that might become tokens |
| **Leaderboards** | Personal, friends, global rankings |
| **Social proof in groups** | Share progress in Telegram groups |

---

## 3. Viral Onchain Games

### 3.1 Axie Infinity (2021) -- The OG

- Play-to-earn Pokemon-style game
- 2.7M daily active users at peak
- Viral in Philippines/Southeast Asia as actual income source
- **Viral mechanic:** Economic opportunity (earn real money playing)

### 3.2 StepN (2022)

- Move-to-earn: Walk/run with NFT sneakers to earn tokens
- 3M+ monthly active users at peak
- **Viral mechanic:** Gamified real-world activity + token rewards

### 3.3 Pixels (2024)

- Farming game on Ronin chain
- 1M+ DAU
- **Viral mechanic:** Free-to-play with token earning, low barrier entry

### 3.4 Parallel (2024)

- Onchain TCG (trading card game)
- High-quality art and gameplay
- **Viral mechanic:** Competitive esports-style play + NFT cards with real value

### 3.5 Primodium (Fully Onchain, 2024)

- Fully onchain factory-building strategy game
- Built on MUD framework (onchain game engine)
- **Viral mechanic:** Open-source, composable, community mods

### 3.6 Words3 (Fully Onchain)

- Onchain Scrabble with ETH prizes
- Players pay to place letters, earn ETH for high-scoring words
- **Viral mechanic:** Competitive word game + real money stakes

---

## 4. Farcaster Frames -- Viral In-Feed Experiences

### What Made Frames Viral

1. **Embedded experience:** Users interact without leaving the feed
2. **One-click actions:** No wallet popups, no gas confirmations for many interactions
3. **Social distribution:** Every interaction can appear in friends' feeds
4. **Developer velocity:** Simple spec, anyone could build a frame in hours

### Most Viral Frame Patterns

| Frame Type | Example | Why It Worked |
|------------|---------|---------------|
| **Betting/Prediction** | "Who wins tonight?" | Skin in the game + shareable |
| **Minting** | One-click NFT mints | Collectible + social proof |
| **Tipping** | $DEGEN tips | Social currency + generosity |
| **Games** | Rock-paper-scissors | Quick, competitive, shareable result |
| **Polls** | "Hot take: X or Y?" | Low effort to engage, creates debate |
| **Quizzes** | "Guess the price" | Test knowledge + compare with friends |
| **Leaderboards** | "Top casters this week" | Status + competition |

### Frame Viral Loop

```
User sees frame in feed
  -> Interacts (one click)
    -> Result posted to their feed
      -> Friends see result
        -> Friends interact
          -> Exponential spread
```

---

## 5. Gasless / Frictionless UX Patterns

### Why Gasless Matters for Virality

Every friction point kills viral coefficients. In crypto, the biggest friction points are:
1. **Wallet creation** -- solved by embedded wallets (Privy, Dynamic, Capsule)
2. **Gas fees** -- solved by paymasters / session keys / account abstraction
3. **Transaction signing** -- solved by session keys (especially on Starknet with native AA)
4. **Bridge/swap** -- solved by chain abstraction

### Projects That Used Frictionless UX for Growth

| Project | Friction Removed | Result |
|---------|-----------------|--------|
| **Farcaster Frames** | No wallet popup for interactions | 40K+ DAU spike |
| **pump.fun** | One-click token creation | Millions of token launches |
| **Telegram games** | No wallet at all initially | 300M+ users |
| **Privy-powered apps** | Embedded wallet, email login | 10x conversion vs MetaMask |
| **Beam (Merit Circle)** | Chain abstraction for gaming | Seamless cross-chain gaming |

### Starknet-Specific Advantages for Gasless UX

Starknet has **native account abstraction**, which means:
- **Session keys:** Users approve a session once, then all transactions are auto-signed
- **Paymasters:** dApps can sponsor gas fees for users
- **Multicall:** Bundle multiple actions into one transaction
- **No separate EOA:** Every account is a smart contract by default

This is a MASSIVE advantage for building viral apps. Starknet's native AA is more powerful than ERC-4337 on Ethereum L1.

---

## 6. Starknet Ecosystem & Past Hackathon Winners

### Notable Starknet Hackathon Projects

**Blockchain Gaming:**
- **Realms/Eternum (Dojo):** Onchain strategy game built with Dojo engine. Persistent world, resource management, PvP battles
- **Influence:** Space strategy MMO fully onchain on Starknet
- **Cartridge:** Gaming platform and controller wallet for Starknet games
- **Loot Survivor:** Onchain arcade game based on Loot NFTs, built with Dojo

**DeFi:**
- **JediSwap:** AMM DEX on Starknet
- **Ekubo:** Concentrated liquidity AMM (most capital-efficient on Starknet)
- **zkLend:** Lending/borrowing protocol

**Infrastructure:**
- **Dojo:** Onchain game engine (ECS framework for Starknet/Cairo)
- **Madara:** Starknet sequencer framework
- **Garaga:** Pairing-based crypto library for Cairo

### What Starknet Hackathon Judges Look For

Based on past hackathon patterns:
1. **Novel use of Cairo/Starknet features** (ZK proofs, native AA, provable compute)
2. **Working demo** (not just slides)
3. **User experience** (judges are tired of clunky crypto UX)
4. **Technical innovation** (pushing what's possible onchain)
5. **Composability** (can others build on top of it?)

### Starknet-Specific Tech to Leverage

| Technology | Viral Potential |
|------------|----------------|
| **Native Account Abstraction** | Gasless, sessionless UX -- feels like web2 |
| **Cairo provable compute** | Verifiable game state, provable fairness |
| **Blockchain storage proofs** | Verify state across chains without bridges |
| **Dojo game engine** | Rapid fully-onchain game development |
| **STARK proofs** | Hidden information games (like Dark Forest) |
| **Multicall** | Batch complex actions into one UX step |

---

## 7. Crypto Typing / TypeRacer Concepts

### Existing Space

The crypto typing game space is essentially **empty**. This is a blue ocean opportunity. Relevant adjacent projects:

- **TypeRacer (web2):** Classic competitive typing game, millions of users. Races against others, WPM leaderboards
- **Monkeytype (web2):** Modern typing test, minimalist design, hugely popular
- **Words3 (web3):** Onchain Scrabble -- proves word games work onchain with stakes
- **No notable onchain TypeRacer exists** as of early 2025

### Why Typing Games Have Viral Potential

1. **Universal skill:** Everyone can type. No crypto knowledge needed to play
2. **Competitive by nature:** WPM is a comparable, shareable metric
3. **Quick sessions:** 30-60 second races = perfect for viral loops
4. **Spectator value:** Watching fast typists is genuinely entertaining
5. **Shareable results:** "I just typed 120 WPM onchain" is naturally tweetable
6. **Skill-based:** Unlike meme coins, skill determines outcome (more defensible)

### Potential Onchain Typing Game Mechanics

- **Stake-to-race:** Players put up tokens, winner takes the pot
- **WPM NFTs:** Mint your high score as a provably-verified NFT
- **Leaderboard seasons:** Weekly/daily competitions with prizes
- **Challenge links:** "Beat my score" shareable links
- **Live multiplayer:** Race against others in real-time
- **Typing-to-earn:** Earn tokens based on WPM (with anti-bot measures via Cairo proofs)

---

## 8. Core Viral Mechanics Taxonomy

### The 7 Viral Vectors for Crypto Projects

#### 1. FINANCIAL FOMO
- Bonding curves (pump.fun, friend.tech)
- Airdrop farming (Telegram games, LayerZero)
- Staking rewards with compounding visuals
- Loss/gain porn (shareable P&L screenshots)

**Implementation:** Show real-time value accrual. Make paper gains visible and shareable.

#### 2. SOCIAL STATUS
- Leaderboards (global, friends, seasonal)
- Badges / achievement NFTs
- Profile-linked scores (Twitter/Farcaster integration)
- Exclusive access tiers

**Implementation:** Public rankings that tie to social identity. "Top 1% of players."

#### 3. COMPETITION / PVP
- Head-to-head matches
- Tournaments with brackets
- Betting on outcomes
- Challenge links ("I bet I can beat you")

**Implementation:** Direct challenges are the most viral unit. Every challenge sent = potential new user.

#### 4. CREATION / UGC
- Create tokens (pump.fun)
- Create challenges/rooms
- Create memes/content
- Remix/fork mechanics

**Implementation:** Let users create things others interact with. Creators recruit their audience.

#### 5. SOCIAL LOOPS
- Referral bonuses (Hamster Kombat)
- Team/guild mechanics
- "Play with friends" multiplayer
- Share result screenshots
- Auto-post achievements to social feeds

**Implementation:** Make sharing the default, not an opt-in. Every completed action should have a "share" moment.

#### 6. RETENTION HOOKS
- Daily streaks (Snapchat-style)
- Time-limited events
- Decaying rewards (play now or lose out)
- Progressive skill unlocks
- Season passes

**Implementation:** Give users a reason to come back tomorrow. Streaks are the most powerful retention tool.

#### 7. SIMPLICITY / ACCESSIBILITY
- One-click actions
- No wallet needed to start
- Mobile-first design
- 30-second onboarding
- Familiar game mechanics (typing, tapping, guessing)

**Implementation:** If onboarding takes more than 30 seconds, most users bounce. Especially in crypto where trust is low.

---

### Viral Coefficient Formula

```
K = i * c

K = viral coefficient
i = number of invites/shares per user
c = conversion rate per invite

K > 1 = exponential growth
K < 1 = paid growth needed
```

**How to maximize K:**
- Increase i: Make sharing feel rewarding, not spammy (challenge links > "invite friends for 10% bonus")
- Increase c: Make the landing experience instantly engaging (playable in <5 seconds)

---

## 9. Actionable Ideas for a Starknet Hackathon

### IDEA 1: ZapType -- Onchain TypeRacer with Stakes

**Concept:** Competitive typing races where players stake STRK. Fastest accurate typist wins the pot. Provably fair via Cairo.

**Viral mechanics:**
- Challenge links: "Think you can beat 110 WPM? Put your money where your mouth is" (shareable URL)
- WPM leaderboard with Twitter/wallet identity
- Score NFTs: Mint your verified WPM as a provable achievement
- Gasless play via Starknet session keys
- Real-time multiplayer races (spectatable)

**Starknet angle:** Cairo proves typing results are legitimate (anti-bot), session keys enable gasless play, native AA for smooth UX.

**Why it could go viral:**
- Everyone can type (universal)
- Competitive + financial stakes
- Shareable results ("I just won 50 STRK typing at 115 WPM")
- Challenge links create viral loop
- Novel (no onchain typing game exists)

---

### IDEA 2: ZapBet -- One-Click Micro-Betting on Anything

**Concept:** Create a bet on anything ("Will ETH hit $5K this week?"), share the link, friends pick sides and stake. Resolved by oracle or consensus.

**Viral mechanics:**
- Every bet created = a shareable link
- Twitter integration for identity
- Bet feeds (trending bets, friends' bets)
- Low minimum stakes (0.01 STRK)

**Starknet angle:** Gasless betting via paymasters, provable randomness, instant settlement.

---

### IDEA 3: ZapDuel -- 1v1 Onchain Skill Challenges

**Concept:** Challenge anyone to a 1v1 in various micro-games (typing race, trivia, reaction time, memory). Stake tokens on the outcome.

**Viral mechanics:**
- Challenge links sent via Twitter DM / timeline
- Every duel result is auto-posted
- Progressive ranking system
- Multi-game variety (typing, trivia, reaction, memory)

**Starknet angle:** Session keys for rapid-fire games, Cairo for provable game state, multicall for batch game actions.

---

### IDEA 4: ZapWords -- Onchain Word Game with Daily Puzzles

**Concept:** Like Wordle meets onchain verification. Daily word puzzles where scores are provably verified. Top scorers share results, compete on leaderboards.

**Viral mechanics:**
- Daily puzzle = daily engagement hook
- Shareable result grids (like Wordle's colored squares)
- Streak system (consecutive days played)
- Weekly prizes for top solvers

**Starknet angle:** Cairo verifies puzzle solutions are legitimate, preventing cheating.

---

### IDEA 5: ZapRace -- Gasless Onchain Racing with Betting

**Concept:** Simple racing game (keyboard-mash or skill-based) with spectator betting. Watch races live, bet on who wins.

**Viral mechanics:**
- Spectator betting creates passive viral loop
- Race results shareable
- Tournament brackets
- Stream-friendly (Twitch/YouTube integration potential)

---

## 10. The Viral Hackathon Project Playbook

### Pre-Hackathon Checklist

- [ ] Core mechanic must be explainable in one sentence
- [ ] First interaction must happen in <10 seconds (no wallet setup)
- [ ] Every completed action must have a "share moment"
- [ ] Leaderboard must be visible without login
- [ ] Challenge/invite links must work for non-users
- [ ] Mobile web must work (most Twitter users are on mobile)
- [ ] Visual result must be screenshot-worthy

### The 30-Second Rule

If a judge or Twitter user cannot understand and try your project in 30 seconds, it will not go viral. The most viral hackathon projects share this trait:

```
See it -> Try it -> Share it (all within 60 seconds)
```

### Hackathon Demo Strategy

1. **Live demo, not slides:** Show the actual product working
2. **Challenge a judge:** "Try to beat my typing score" -- interactive demos win
3. **Show the viral loop:** Demo the sharing mechanic explicitly
4. **Show Starknet tech:** Explicitly call out session keys, gasless UX, provable compute
5. **Show traction if any:** Even 50 test users during the hackathon shows product-market fit

### Twitter Launch Strategy (During Hackathon)

1. **Build in public thread:** Document progress with screenshots/videos
2. **Playable link in tweet:** Make it accessible without any download
3. **Challenge CT (Crypto Twitter):** "Can you beat 100 WPM onchain?" with a link
4. **Tag relevant accounts:** @StarknetFndn, @Starknet, @StarkWareLtd, hackathon sponsors
5. **Results screenshot template:** Make results auto-generate shareable images

### Key Metrics to Optimize

| Metric | Target | Why |
|--------|--------|-----|
| Time to first action | <10 seconds | Conversion |
| Actions before share moment | <3 | Viral spread |
| Share rate | >10% of sessions | Viral coefficient |
| Return rate (D1) | >30% | Retention |
| Challenge acceptance rate | >20% | Network effects |

---

## Summary: What Makes Crypto Hackathon Projects Go Viral

### The Pattern (distilled from all case studies)

1. **Instantly playable** -- No wallet, no gas, no signup. Just play.
2. **Financially meaningful** -- Stakes, rewards, or speculative value (even small amounts).
3. **Socially shareable** -- Results that look good in a tweet. Challenge links that pull in friends.
4. **Competitively engaging** -- Leaderboards, rankings, head-to-head matches. Humans are competitive.
5. **Culturally relevant** -- Memes, trends, topical events. Ride existing cultural waves.
6. **Technically novel** -- Uses chain-specific features in a way that makes people say "I didn't know you could do that onchain."
7. **Retention-hooked** -- Daily puzzles, streaks, seasons. Give people a reason to come back.

### The Anti-Patterns (what kills virality)

- Requiring MetaMask popup before any interaction
- Complex tokenomics nobody can explain
- "DeFi protocol" with no differentiator
- Dashboard with no game/social mechanic
- Requiring bridge from another chain to try it
- Mobile-unfriendly design
- Slow transactions (>5 second confirmation)

### The Golden Formula for Starknet Hackathons

```
Familiar game mechanic (typing, betting, word games)
  + Onchain stakes (STRK, provable achievements)
  + Gasless UX (session keys, paymasters)
  + Social sharing (challenge links, leaderboards)
  + Cairo superpowers (provable fairness, ZK)
  = Viral hackathon project
```

---

## Appendix: Source Projects Reference

| Project | Year | Peak Users | Core Viral Mechanic |
|---------|------|-----------|---------------------|
| pump.fun | 2024 | Millions of tokens | UGC creation + bonding curves |
| friend.tech | 2023 | 900K+ wallets | Social speculation |
| Notcoin | 2024 | 35M players | Telegram tap-to-earn + airdrop |
| Hamster Kombat | 2024 | 300M players | Referrals + airdrop farming |
| Catizen | 2024 | 20M players | Idle game + token speculation |
| Farcaster Frames | 2024 | 40K+ DAU | In-feed interactive experiences |
| Dark Forest | 2020-22 | 10K+ players | ZK-enabled hidden info game |
| Polymarket | 2024 | $1B+ volume | Prediction markets + real events |
| Words3 | 2023 | Thousands | Onchain word game + ETH prizes |
| StepN | 2022 | 3M+ MAU | Move-to-earn + NFT sneakers |
| Loot | 2021 | 8K NFTs | Radical simplicity + composability |
| Axie Infinity | 2021 | 2.7M DAU | Play-to-earn economics |

---

*Research compiled March 2025. All data points reference publicly documented metrics from project launches, blockchain analytics, and published growth analyses.*
