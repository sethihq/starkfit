# Eidos8004 Landing Page -- Complete Analysis

> Source: `/Users/apple/Desktop/projects/eidos8004/frontend/`
> Stack: Next.js 16.1.6, React 19, Tailwind v4, Geist fonts, lucide-react icons
> No GSAP. No Lenis. All animations are pure CSS + IntersectionObserver.

---

## Table of Contents

1. [File Tree](#file-tree)
2. [Tech Stack and Config](#tech-stack-and-config)
3. [Root Layout](#root-layout)
4. [Landing Page (page.tsx)](#landing-page)
5. [Navbar](#navbar)
6. [Footer](#footer)
7. [Button Component](#button-component)
8. [WalletButton Component](#walletbutton-component)
9. [MorphingIcon Component](#morphingicon-component)
10. [FlowPulse Component](#flowpulse-component)
11. [ProtocolStack Component](#protocolstack-component)
12. [Sound System](#sound-system)
13. [Global CSS and Design Tokens](#global-css-and-design-tokens)
14. [Color System](#color-system)
15. [Font Configuration](#font-configuration)
16. [Animation Patterns](#animation-patterns)
17. [Layout and Spacing Patterns](#layout-and-spacing-patterns)
18. [Section Structure](#section-structure)
19. [Key Design Decisions](#key-design-decisions)

---

## File Tree

```
frontend/src/
  app/
    globals.css                    # Design tokens, animations, custom CSS
    layout.tsx                     # Root layout (fonts, providers, navbar, toaster)
    page.tsx                       # Landing page (hero, stats, how-it-works, features, CTA)
    not-found.tsx                  # 404 page
    favicon.ico
  components/
    landing/
      ProtocolStack.tsx            # ASCII art protocol architecture section
    layout/
      Navbar.tsx                   # Fixed top navigation
      Footer.tsx                   # Footer with brand + links
    ui/
      Button.tsx                   # Primary/secondary/ghost/danger button
      WalletButton.tsx             # Wallet connect/disconnect
      MorphingIcon.tsx             # Icon with stroke-draw animation
      FlowPulse.tsx                # Dynamic border pulse animation system
      Card.tsx                     # Generic card component
      Skeleton.tsx                 # Loading skeleton
  context/
    Web3Context.tsx                # Ethereum wallet provider
  hooks/
    useDesignNFT.ts                # Smart contract hook (stats on landing)
    useAgentRegistry.ts            # Smart contract hook (stats on landing)
    useAttributionValidator.ts     # Smart contract hook (stats on landing)
    useRoyaltyDistribution.ts      # Smart contract hook (stats on landing)
  lib/
    sounds.ts                      # Web Audio API click/success/error sounds
    mock-fallback.ts               # Graceful fallback when contracts unavailable
    contracts.ts                   # Contract instances
    network-config.ts              # Chain configuration
    types.ts                       # TypeScript interfaces
```

---

## Tech Stack and Config

### package.json

```json
{
  "dependencies": {
    "calligraph": "^1.3.0",
    "ethers": "6",
    "geist": "^1.7.0",
    "lucide-react": "^0.577.0",
    "next": "16.1.6",
    "pinata-web3": "^0.5.4",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hot-toast": "^2.6.0",
    "recharts": "^3.8.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### postcss.config.mjs

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## Root Layout

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/app/layout.tsx`

```tsx
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare } from 'geist/font/pixel';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from '@/context/Web3Context';
import { Navbar } from '@/components/layout/Navbar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eidos8004 -- AI Design Attribution',
  description: 'Own your creative legacy. Earn royalties when AI agents use your designs. Powered by EIP-8004 on-chain attribution.',
  openGraph: {
    title: 'Eidos8004',
    description: 'Own your creative legacy. Earn royalties when AI agents use your designs.',
    type: 'website',
    siteName: 'Eidos8004',
  },
  twitter: {
    card: 'summary',
    title: 'Eidos8004',
    description: 'Own your creative legacy. Earn royalties when AI agents use your designs.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(r=>r.forEach(sw=>sw.unregister()));caches.keys().then(k=>k.forEach(c=>caches.delete(c)));}`,
          }}
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable} antialiased bg-c1 text-c12`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-c2 focus:text-c12 focus:px-4 focus:py-2 focus:border focus:border-c3 focus:text-sm focus:font-mono"
        >
          Skip to content
        </a>
        <Web3Provider>
          <Navbar />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--c2)',
                color: 'var(--c12)',
                border: '1px solid var(--c3)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'var(--font-geist-mono)',
              },
              success: {
                iconTheme: {
                  primary: 'var(--success)',
                  secondary: 'var(--c1)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--error)',
                  secondary: 'var(--c1)',
                },
              },
            }}
          />
        </Web3Provider>
      </body>
    </html>
  );
}
```

Key patterns:
- Three Geist font variants loaded as CSS variables via `font.variable`
- Body uses `bg-c1 text-c12` (darkest bg, lightest fg)
- Skip-to-content link for accessibility
- Web3Provider wraps everything
- Navbar is outside `{children}` so it appears on all pages
- Service worker cleanup script in `<head>`

---

## Landing Page

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/app/page.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ArrowUpRight, Link2, Zap, Bot, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { WalletButton } from '@/components/ui/WalletButton';
import { Footer } from '@/components/layout/Footer';
import { MorphingIcon } from '@/components/ui/MorphingIcon';
import { FlowPulse } from '@/components/ui/FlowPulse';
import { playClick } from '@/lib/sounds';
import { ProtocolStack } from '@/components/landing/ProtocolStack';
import { useDesignNFT } from '@/hooks/useDesignNFT';
import { useAgentRegistry } from '@/hooks/useAgentRegistry';
import { useAttributionValidator } from '@/hooks/useAttributionValidator';
import { useRoyaltyDistribution } from '@/hooks/useRoyaltyDistribution';
import { withMockFallback } from '@/lib/mock-fallback';

const FALLBACK_STATS = {
  designers: '1,200+',
  paidOut: '$850K+',
  agents: '67',
  attributions: '24K+',
};

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K+`;
  }
  return n.toLocaleString();
}

export default function Home() {
  const { totalDesigns } = useDesignNFT();
  const { totalAgents } = useAgentRegistry();
  const { totalAttributions } = useAttributionValidator();
  const { totalDistributed } = useRoyaltyDistribution();

  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState([
    { value: FALLBACK_STATS.designers, label: 'Designers' },
    { value: FALLBACK_STATS.paidOut, label: 'Paid Out' },
    { value: FALLBACK_STATS.agents, label: 'AI Agents' },
    { value: FALLBACK_STATS.attributions, label: 'Attributions' },
  ]);

  useEffect(() => {
    async function fetchStats() {
      const [designs, agents, attributions, distributed] = await Promise.all([
        withMockFallback(() => totalDesigns(), null),
        withMockFallback(() => totalAgents(), null),
        withMockFallback(() => totalAttributions(), null),
        withMockFallback(() => totalDistributed(), null),
      ]);

      setStats([
        {
          value: designs !== null ? formatCount(designs) : FALLBACK_STATS.designers,
          label: 'Designers',
        },
        {
          value: distributed !== null ? `$${distributed}` : FALLBACK_STATS.paidOut,
          label: 'Paid Out',
        },
        {
          value: agents !== null ? String(agents) : FALLBACK_STATS.agents,
          label: 'AI Agents',
        },
        {
          value: attributions !== null ? formatCount(attributions) : FALLBACK_STATS.attributions,
          label: 'Attributions',
        },
      ]);
      setStatsLoading(false);
    }

    fetchStats();
  }, [totalDesigns, totalAgents, totalAttributions, totalDistributed]);
  return (
    <div className="min-h-screen bg-c1 relative overflow-x-hidden">
      {/* Vertical guide lines */}
      <div className="absolute inset-0 pointer-events-none z-10" aria-hidden="true">
        <div className="max-w-[960px] mx-auto h-full relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-c2 flow-line-v" />
          <div className="absolute right-6 top-0 bottom-0 w-px bg-c2 flow-line-v" />
        </div>
      </div>

      {/* Content column */}
      <div className="max-w-[960px] mx-auto px-6">

        {/* Hero */}
        <section className="border-t border-c2 flow-line">
          <div className="px-8 pb-28 text-center">
            <div className="pt-44 mb-10">
              <div className="-mx-8 border-t border-dashed border-c3" />
              <div className="flex justify-center">
                <div className="inline-flex items-center px-3 py-1.5 border-x border-dashed border-c3 bg-c2">
                  <span className="text-[11px] text-c7 font-mono tracking-wider uppercase">EIP-8004</span>
                </div>
              </div>
              <div className="-mx-8 border-t border-dashed border-c3" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-pixel tracking-[-0.02em] text-c12 leading-[1.1] uppercase">
              Own Your
              <br />
              Creative Legacy
            </h1>

            <p className="mt-8 text-sm text-c7 max-w-sm mx-auto leading-relaxed font-mono">
              Designers earn royalties when AI agents use their work.
              Blockchain-verified attribution. Instant settlement.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => { window.location.href = '/dashboard'; }}
                className="group"
              >
                Start Earning
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                How It Works
              </Button>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-t border-c2 flow-line">
          <div className="px-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x sm:divide-c2">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center py-8">
                  <p className="text-2xl font-semibold text-c12 tabular-nums tracking-tight font-mono">
                    <span className={statsLoading ? 'animate-skeleton inline-block opacity-40' : ''}>
                      {stat.value}
                    </span>
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-c6 font-mono">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hatch divider */}
        <div className="border-t border-c2 overflow-hidden">
          <div className="section-hatch" />
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="border-t border-c2 flow-line">
          <div className="px-8 pt-10 pb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
              How It Works
            </p>
            <h2 className="text-2xl font-pixel uppercase tracking-tight text-c11">
              Three steps to perpetual royalties
            </h2>
          </div>

          <div className="border-t border-c2 flow-line grid grid-cols-1 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Upload & Mint',
                desc: 'Upload your designs. Mint them as dynamic NFTs with custom royalty rates, categories, and license terms.',
              },
              {
                step: '02',
                title: 'Agents Discover',
                desc: 'Verified AI agents browse the on-chain registry, find your work, and request usage through smart contracts.',
              },
              {
                step: '03',
                title: 'Earn Royalties',
                desc: 'Every attribution triggers an instant payment. Track earnings, manage permissions, export reports.',
              },
            ].map((item, i) => (
              <div key={item.step} className={`py-8 px-6 ${i > 0 ? 'sm:border-l border-c2' : ''}`}>
                <span className="text-[10px] font-mono text-c5 uppercase tracking-[0.2em] block mb-3">
                  {item.step}
                </span>
                <h3 className="text-base font-medium text-c11">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm text-c7 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Hatch divider */}
        <div className="border-t border-c2 overflow-hidden">
          <div className="section-hatch" />
        </div>

        {/* Features */}
        <section className="border-t border-c2 flow-line">
          <div className="px-8 pt-10 pb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
              Why Eidos
            </p>
            <h2 className="text-2xl font-pixel uppercase tracking-tight text-c11">
              Built for creators in the age of AI
            </h2>
          </div>

          <div className="border-t border-c2 flow-line">
            {[
              {
                title: 'On-Chain Attribution',
                desc: 'Immutable proof of creative ownership. Every usage is recorded on Polygon with full provenance.',
                icon: Link2,
              },
              {
                title: 'Instant Royalties',
                desc: 'Real-time ETH payments via smart contracts. No invoices, no 60-day payment terms.',
                icon: Zap,
              },
              {
                title: 'Agent Registry',
                desc: 'AI agents register with verified identities, trust scores, and declared capabilities.',
                icon: Bot,
              },
              {
                title: 'Full Transparency',
                desc: 'Every attribution is tracked, timestamped, and publicly verifiable on-chain.',
                icon: null,
              },
            ].map((feature, i) => (
              <div key={feature.title} className={`py-8 px-6 sm:inline-block sm:w-1/2 sm:align-top ${i % 2 !== 0 ? 'sm:border-l border-c2' : ''} ${i >= 2 ? 'border-t border-c2' : ''}`}>
                {feature.icon ? (
                  <MorphingIcon icon={feature.icon} className="w-5 h-5 text-c5 mb-3" />
                ) : (
                  <Eye className="w-5 h-5 text-c5 mb-3 icon-blink" strokeWidth={1.5} />
                )}
                <h3 className="text-[15px] font-medium text-c11 mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-c7 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Hatch divider */}
        <div className="border-t border-c2 overflow-hidden">
          <div className="section-hatch" />
        </div>

        {/* Protocol Architecture */}
        <ProtocolStack />

        {/* Hatch divider */}
        <div className="border-t border-c2 overflow-hidden">
          <div className="section-hatch" />
        </div>

        {/* CTA */}
        <section className="border-t border-c2 flow-line">
          <div className="px-8 py-16 text-center">
            <h2 className="text-2xl font-pixel uppercase tracking-tight text-c11">
              Start building your attribution layer
            </h2>
            <p className="mt-4 text-c6 text-sm font-mono">
              Connect your wallet to begin minting and earning.
            </p>
            <div className="mt-8 inline-flex flex-col sm:flex-row items-center gap-3">
              <WalletButton />
              <Button
                variant="secondary"
                onClick={() => { window.open('https://eips.ethereum.org/EIPS/eip-8004', '_blank'); }}
              >
                Read the EIP
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </section>

      </div>

      <Footer />
      <FlowPulse />
    </div>
  );
}
```

### Section Order (top to bottom)

1. **Vertical guide lines** -- Two 1px lines at left/right edges of content column
2. **Hero** -- Pill badge, headline, subtext, two CTA buttons
3. **Stats strip** -- 4-column grid with live blockchain stats
4. **Hatch divider** -- 45-degree striped pattern (40px tall)
5. **How It Works** -- 3-step horizontal grid
6. **Hatch divider**
7. **Features** -- 2x2 grid with animated icons
8. **Hatch divider**
9. **Protocol Stack** -- ASCII art architecture diagram with Calligraph text animation
10. **Hatch divider**
11. **CTA** -- Final call to action with wallet connect
12. **Footer** -- Brand + links + copyright

---

## Navbar

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/components/layout/Navbar.tsx`

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { WalletButton } from '@/components/ui/WalletButton';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/agents', label: 'Agents' },
  { href: '/docs', label: 'Docs' },
];

function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide navbar on dashboard routes
  if (pathname.startsWith('/dashboard')) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-c1/80 backdrop-blur-xl border-b border-c3">
      <div className="max-w-[960px] mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-0.5 shrink-0">
            <span className="text-base font-semibold text-c12 tracking-tight">Eidos</span>
            <span className="text-base font-normal text-c7">8004</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? 'text-c12'
                      : 'text-c7 hover:text-c12'
                    }
                  `.trim()}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Wallet */}
          <div className="hidden md:block">
            <WalletButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-c7 hover:text-c12 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-c3 bg-c1/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? 'text-c12 bg-c2'
                      : 'text-c7 hover:text-c12 hover:bg-c2'
                    }
                  `.trim()}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-c3">
              <WalletButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export { Navbar };
```

Key patterns:
- Fixed position, `bg-c1/80 backdrop-blur-xl`
- Same `max-w-[960px] mx-auto px-6` as page content
- Height: `h-14`
- Active link: `text-c12`, inactive: `text-c7 hover:text-c12`
- Hides on dashboard routes (dashboard has its own sidebar)
- Mobile menu uses `animate-fade-in`

---

## Footer

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/components/layout/Footer.tsx`

```tsx
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const links = [
  { href: '/docs', label: 'Docs', external: false },
  { href: 'https://github.com/eidos8004', label: 'GitHub', external: true },
  { href: 'https://eips.ethereum.org/EIPS/eip-8004', label: 'EIP-8004', external: true },
];

function Footer() {
  return (
    <footer>
      <div className="max-w-[960px] mx-auto px-6">
        <div className="border-t border-c2 flow-line grid grid-cols-1 sm:grid-cols-2">

          {/* Left -- Brand + description */}
          <div className="py-14 px-6">
            <div className="flex items-center gap-1 mb-4">
              <span className="text-base font-semibold text-c12 tracking-tight">Eidos</span>
              <span className="text-base font-normal text-c7">8004</span>
            </div>
            <p className="text-sm text-c6 leading-relaxed max-w-xs">
              On-chain attribution for the age of AI.
              Designers own their work. Agents pay for usage.
            </p>
            <p className="mt-6 text-[10px] font-mono text-c5 uppercase tracking-[0.2em]">
              Polygon Amoy Testnet
            </p>
          </div>

          {/* Right -- Links */}
          <div className="py-14 px-6">
            <p className="text-[10px] font-mono text-c5 uppercase tracking-[0.2em] mb-4">
              Links
            </p>
            <div className="grid grid-cols-2 gap-y-3">
              {links.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-c7 hover:text-c12 transition-colors duration-150 inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 text-c5 group-hover:text-c12 transition-colors" />
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-c7 hover:text-c12 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="border-t border-c2 flow-line py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] font-mono text-c5 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Eidos Protocol
          </span>
          <span className="text-[10px] font-mono text-c4 uppercase tracking-[0.2em]">
            Built on Ethereum &middot; Verified on Polygon
          </span>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
```

---

## Button Component

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/components/ui/Button.tsx`

```tsx
'use client';

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { playClick } from '@/lib/sounds';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-zinc-200 text-zinc-950',
    'border border-zinc-400/50',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),inset_0_-1px_0_0_rgba(0,0,0,0.1),0_1px_2px_0_rgba(0,0,0,0.3)]',
    'hover:bg-zinc-100',
    'active:bg-zinc-300 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.15)]',
  ].join(' '),
  secondary: [
    'bg-zinc-900 text-zinc-300',
    'border border-zinc-700/50',
    'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_1px_2px_0_rgba(0,0,0,0.5)]',
    'hover:bg-zinc-800 hover:text-zinc-200',
    'active:bg-zinc-950 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.4)]',
  ].join(' '),
  ghost: [
    'text-zinc-400',
    'hover:text-white hover:bg-white/[0.04]',
    'active:bg-white/[0.06]',
  ].join(' '),
  danger: [
    'bg-red-950/50 text-red-400',
    'border border-red-500/25',
    'shadow-[inset_0_1px_0_0_rgba(255,100,100,0.08),inset_0_-1px_0_0_rgba(0,0,0,0.2),0_1px_2px_0_rgba(0,0,0,0.4)]',
    'hover:bg-red-950/70',
    'active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)]',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className = '', onClick, children, disabled, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        playClick();
        onClick?.(e);
      }
    };

    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center font-medium font-mono
          transition-all duration-100 ease-out
          disabled:opacity-50 disabled:cursor-not-allowed
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${loading ? 'cursor-wait' : ''}
          ${className}
        `.trim()}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-3.5 w-3.5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
```

Key patterns:
- No border-radius (sharp rectangular buttons)
- Uses complex inset box-shadows for depth illusion
- Primary: light button (white-ish), Secondary: dark button
- `font-mono` on all buttons
- Every click plays a Web Audio API tone
- Loading state with inline SVG spinner

---

## WalletButton Component

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/components/ui/WalletButton.tsx`

```tsx
'use client';

import { useWeb3 } from '@/context/Web3Context';
import { Button } from './Button';
import { Wallet } from 'lucide-react';

interface WalletButtonProps {
  className?: string;
}

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBalance(balance: string): string {
  const num = parseFloat(balance);
  if (num === 0) return '0 ETH';
  if (num < 0.001) return '<0.001 ETH';
  return `${num.toFixed(3)} ETH`;
}

function WalletButton({ className = '' }: WalletButtonProps) {
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWeb3();

  if (isConnected && address) {
    return (
      <div className={`flex items-center gap-2 ${className}`.trim()}>
        <span className="hidden sm:block text-xs text-zinc-500 font-mono tabular-nums">
          {formatBalance(balance)}
        </span>
        <button
          onClick={disconnectWallet}
          className="inline-flex items-center gap-2 h-8 px-3 bg-zinc-900 border border-zinc-700/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),inset_0_-1px_0_0_rgba(0,0,0,0.3),0_1px_2px_0_rgba(0,0,0,0.5)] transition-all duration-100 hover:bg-zinc-800 active:bg-zinc-950 active:shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.4)]"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
          <span className="font-mono text-xs text-zinc-400">{truncateAddress(address)}</span>
        </button>
      </div>
    );
  }

  return (
    <Button variant="primary" size="sm" onClick={connectWallet} className={className}>
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </Button>
  );
}

export { WalletButton };
```

---

## MorphingIcon Component

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/components/ui/MorphingIcon.tsx`

```tsx
'use client';

import type { LucideIcon } from 'lucide-react';

interface MorphingIconProps {
  icon: LucideIcon;
  className?: string;
}

function MorphingIcon({ icon: Icon, className }: MorphingIconProps) {
  return <Icon className={`${className} icon-morph`} strokeWidth={1.5} />;
}

export { MorphingIcon };
```

The animation is defined in CSS (see Animation Patterns below). It draws and undraws the SVG stroke in a continuous loop using `stroke-dasharray` and `stroke-dashoffset`.

---

## FlowPulse Component

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/components/ui/FlowPulse.tsx`

```tsx
'use client';

import { useEffect } from 'react';

function FlowPulse() {
  useEffect(() => {
    const hLines = Array.from(document.querySelectorAll('.flow-line'));
    const vLines = Array.from(document.querySelectorAll('.flow-line-v'));

    if (!hLines.length && !vLines.length) return;

    // Speed variation
    // Horizontal = faster (current through short traces)
    // Vertical = slower (current through long guides)
    const hSpeed = 1.0;
    const vSpeed = 2.0;
    const branchOverlap = 0.3; // H/V overlap for branching feel

    // Total cycle time
    const hTotal = hLines.length * hSpeed;
    const vTotal = vLines.length * vSpeed;
    const totalTime = hTotal + vTotal - (vLines.length > 0 ? branchOverlap : 0);

    // Keyframe window percentages
    const hPct = (hSpeed / totalTime) * 100;
    const vPct = (vSpeed / totalTime) * 100;

    // Dynamic keyframes
    const style = document.createElement('style');
    style.id = 'flow-pulse-keyframes';
    style.textContent = `
      @keyframes flow-h {
        0% { left: -70px; opacity: 0; }
        0.5% { opacity: 1; }
        ${(hPct - 0.5).toFixed(2)}% { left: 100%; opacity: 1; }
        ${hPct.toFixed(2)}% { opacity: 0; }
        100% { opacity: 0; }
      }
      @keyframes flow-v {
        0% { top: -70px; opacity: 0; }
        0.5% { opacity: 1; }
        ${(vPct - 0.5).toFixed(2)}% { top: 100%; opacity: 1; }
        ${vPct.toFixed(2)}% { opacity: 0; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Color shift -- c5 (top) -> c9 (bottom)
    const pageHeight = document.documentElement.scrollHeight || 1;

    let delay = 0;

    hLines.forEach((el) => {
      const html = el as HTMLElement;
      html.style.setProperty('--flow-total', `${totalTime}s`);
      html.style.setProperty('--flow-delay', `${delay.toFixed(2)}s`);

      // Position-based color: oklch lightness from c5(0.348) to c9(0.649)
      const rect = html.getBoundingClientRect();
      const elY = rect.top + window.scrollY;
      const progress = Math.min(elY / pageHeight, 1);
      const lightness = 0.348 + progress * (0.649 - 0.348);
      html.style.setProperty('--flow-color', `oklch(${lightness.toFixed(3)} 0 0)`);

      delay += hSpeed;
    });

    // Branching -- V pulses start with overlap
    if (vLines.length > 0) delay -= branchOverlap;

    vLines.forEach((el) => {
      const html = el as HTMLElement;
      html.style.setProperty('--flow-total', `${totalTime}s`);
      html.style.setProperty('--flow-delay', `${delay.toFixed(2)}s`);
      html.style.setProperty('--flow-color', `oklch(0.500 0 0)`);
      delay += vSpeed;
    });

    return () => {
      document.getElementById('flow-pulse-keyframes')?.remove();
    };
  }, []);

  return null;
}

export { FlowPulse };
```

This is the most distinctive visual effect on the page. It creates a "comet trail" light pulse that travels along every section border (horizontal) and the two vertical guide lines. Each line gets a staggered animation delay so pulses cascade down the page sequentially. The color shifts from darker (top) to lighter (bottom) based on position.

---

## ProtocolStack Component

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/components/landing/ProtocolStack.tsx`

This is a large component (397 lines) that renders an ASCII art diagram of the protocol architecture. See the full source in the [Landing Page section](#landing-page) file tree.

Key patterns:
- Builds ASCII art using colored `<span>` segments
- Uses `Calligraph` library for text typewriter animation
- IntersectionObserver triggers the animation when scrolled into view
- 4 layers animate bottom-to-top with staggered delays (0ms, 300ms, 600ms, 900ms)
- CSS classes: `.stack-layer` (slide-up), `.stack-desc` (slide-right)
- Layer descriptions use `Calligraph` component for character-by-character text reveal

**Layer data:**

| Layer | Left Label | Right Label | Title |
|-------|-----------|-------------|-------|
| 0 (bottom) | CHAIN | VAULT | Base Layer |
| 1 | AGENTS | TRUST | Agent Registry |
| 2 | ATTRIB | VERIFY | Attribution Engine |
| 3 (top) | ROYALTY | SETTLE | Settlement |

---

## Sound System

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/lib/sounds.ts`

```tsx
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    try {
      audioContext = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

export function playClick() {
  playTone(800, 0.05, 'sine', 0.05);
}

export function playSuccess() {
  setTimeout(() => playTone(523, 0.1, 'sine', 0.06), 0);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.06), 80);
}

export function playError() {
  setTimeout(() => playTone(400, 0.12, 'square', 0.04), 0);
  setTimeout(() => playTone(300, 0.18, 'square', 0.04), 100);
}

export function playNotification() {
  setTimeout(() => playTone(440, 0.08, 'sine', 0.05), 0);
  setTimeout(() => playTone(554, 0.08, 'sine', 0.05), 60);
  setTimeout(() => playTone(659, 0.12, 'sine', 0.05), 120);
}
```

No audio files -- all sounds are generated via Web Audio API oscillators. Click sound: 800Hz sine wave, 50ms, volume 0.05.

---

## Global CSS and Design Tokens

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/app/globals.css`

```css
@import "tailwindcss";

:root {
  /* Gray scale */
  --c1: oklch(0.162 0 0);
  --c2: oklch(0.195 0 0);
  --c3: oklch(0.254 0 0);
  --c4: oklch(0.302 0 0);
  --c5: oklch(0.348 0 0);
  --c6: oklch(0.396 0 0);
  --c7: oklch(0.459 0 0);
  --c8: oklch(0.549 0 0);
  --c9: oklch(0.649 0 0);
  --c10: oklch(0.72 0 0);
  --c11: oklch(0.863 0 0);
  --c12: oklch(0.933 0 0);

  /* Semantic */
  --background: var(--c1);
  --foreground: var(--c12);
  --card: var(--c2);
  --card-elevated: var(--c3);
  --border: var(--c3);
  --border-hover: var(--c4);
  --accent: #3b82f6;
  --accent-hover: #2563eb;
  --success: #22c55e;
  --warning: #eab308;
  --error: #ef4444;
  --muted: var(--c7);
  --muted-border: var(--c3);
  --text-secondary: var(--c9);
  --protocol-accent: oklch(0.72 0.15 155);
}

@theme inline {
  /* Gray scale */
  --color-c1: var(--c1);
  --color-c2: var(--c2);
  --color-c3: var(--c3);
  --color-c4: var(--c4);
  --color-c5: var(--c5);
  --color-c6: var(--c6);
  --color-c7: var(--c7);
  --color-c8: var(--c8);
  --color-c9: var(--c9);
  --color-c10: var(--c10);
  --color-c11: var(--c11);
  --color-c12: var(--c12);

  /* Remap zinc to oklch */
  --color-zinc-950: var(--c1);
  --color-zinc-900: var(--c2);
  --color-zinc-800: var(--c3);
  --color-zinc-700: var(--c5);
  --color-zinc-600: var(--c6);
  --color-zinc-500: var(--c7);
  --color-zinc-400: var(--c8);
  --color-zinc-300: var(--c9);
  --color-zinc-200: var(--c10);
  --color-zinc-100: var(--c11);
  --color-zinc-50: var(--c12);

  /* Semantic */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-elevated: var(--card-elevated);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-error: var(--error);
  --color-muted: var(--muted);
  --color-muted-border: var(--muted-border);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-pixel: var(--font-geist-pixel-square);
}

html {
  overflow: hidden;
  height: 100%;
  overscroll-behavior: none;
}

body {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: none;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

/* Slanted line section divider */
.section-hatch {
  height: 40px;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    var(--c2) 4px,
    var(--c2) 5px
  );
}

/* Flowing pulse through borders */
.flow-line {
  position: relative;
  overflow: hidden;
  contain: paint;
}

.flow-line-v {
  contain: paint;
}

/* Horizontal pulse -- comet tail */
.flow-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -70px;
  height: 1px;
  width: 70px;
  background: linear-gradient(90deg,
    transparent 0%,
    color-mix(in oklch, var(--flow-color, var(--c7)) 15%, transparent) 12%,
    color-mix(in oklch, var(--flow-color, var(--c7)) 50%, transparent) 35%,
    var(--flow-color, var(--c7)) 70%,
    color-mix(in oklch, var(--flow-color, var(--c7)), white 25%) 88%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  animation: flow-h var(--flow-total, 20s) linear infinite;
  animation-delay: var(--flow-delay, 0s);
}

/* Vertical pulse -- comet tail */
.flow-line-v::after {
  content: '';
  position: absolute;
  left: 0;
  top: -70px;
  width: 1px;
  height: 70px;
  background: linear-gradient(180deg,
    transparent 0%,
    color-mix(in oklch, var(--flow-color, var(--c7)) 15%, transparent) 12%,
    color-mix(in oklch, var(--flow-color, var(--c7)) 50%, transparent) 35%,
    var(--flow-color, var(--c7)) 70%,
    color-mix(in oklch, var(--flow-color, var(--c7)), white 25%) 88%,
    transparent 100%
  );
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  animation: flow-v var(--flow-total, 20s) linear infinite;
  animation-delay: var(--flow-delay, 0s);
}

/* Protocol architecture diagram */
.protocol-node {
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.protocol-node.is-visible {
  opacity: 1;
  clip-path: inset(0 0 0 0);
}

.protocol-line-h {
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  transition: clip-path 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.protocol-line-v {
  opacity: 0;
  clip-path: inset(0 0 100% 0);
  transition: clip-path 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.protocol-line-h.is-visible,
.protocol-line-v.is-visible {
  opacity: 1;
  clip-path: inset(0 0 0 0);
}

@keyframes protocol-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.protocol-status-dot {
  color: var(--protocol-accent);
  animation: protocol-blink 1.2s step-end infinite;
}

/* Protocol stack -- bottom-to-top layer fade */
.stack-layer {
  opacity: 0;
  transform: translateY(8px);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.stack-layer.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Protocol stack -- right-side layer descriptions */
.stack-desc {
  opacity: 0;
  transform: translateX(12px);
  transition:
    opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.stack-desc.is-visible {
  opacity: 1;
  transform: translateX(0);
}

/* Icon morph -- looping stroke draw */
.icon-morph path,
.icon-morph line,
.icon-morph circle,
.icon-morph polyline,
.icon-morph rect {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: morph-draw 3.5s ease-in-out infinite;
}

@keyframes morph-draw {
  0% { stroke-dashoffset: 100; }
  20% { stroke-dashoffset: 0; }
  80% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 100; }
}

/* Eye blink animation */
.icon-blink {
  animation: eye-blink 4.5s ease-in-out infinite;
  transform-origin: center;
}

@keyframes eye-blink {
  0%, 42%, 50%, 100% {
    transform: scaleY(1);
    opacity: 1;
  }
  45%, 47% {
    transform: scaleY(0.1);
    opacity: 0.6;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Selection */
::selection {
  background: rgba(59, 130, 246, 0.3);
  color: #ffffff;
}

/* Tabular numbers for data */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

/* Dot grid background pattern */
.dot-grid {
  background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Construction grid */
.construction-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    radial-gradient(rgba(255, 255, 255, 0.03) 0.5px, transparent 0.5px);
  background-size:
    60px 60px,
    60px 60px,
    60px 60px;
  background-position:
    0 0,
    0 0,
    30px 30px;
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Gradient orb animation for hero */
@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

/* Skeleton pulse */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.05; }
  50% { opacity: 0.15; }
}

.animate-skeleton {
  animation: skeleton-pulse 2s ease-in-out infinite;
}

/* Modal backdrop */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.2s ease-out;
}
```

---

## Color System

The project uses a 12-step gray scale in OKLCH color space, all with 0 chroma (pure neutrals).

| Token | OKLCH Lightness | Approximate Hex | Usage |
|-------|----------------|-----------------|-------|
| `c1`  | 0.162 | ~#111111 | Background (darkest) |
| `c2`  | 0.195 | ~#1a1a1a | Card background, borders |
| `c3`  | 0.254 | ~#262626 | Elevated cards, borders |
| `c4`  | 0.302 | ~#333333 | Hover borders |
| `c5`  | 0.348 | ~#3f3f3f | Labels, step numbers, icons |
| `c6`  | 0.396 | ~#4b4b4b | Muted text, stat labels |
| `c7`  | 0.459 | ~#5a5a5a | Body text, secondary text |
| `c8`  | 0.549 | ~#6e6e6e | De-emphasized text |
| `c9`  | 0.649 | ~#868686 | Light text |
| `c10` | 0.72  | ~#9a9a9a | Even lighter text |
| `c11` | 0.863 | ~#c4c4c4 | Headings, titles |
| `c12` | 0.933 | ~#e5e5e5 | Primary text (lightest) |

**Accent colors:**
- `--accent`: #3b82f6 (blue-500)
- `--accent-hover`: #2563eb (blue-600)
- `--success`: #22c55e (green-500)
- `--warning`: #eab308 (yellow-500)
- `--error`: #ef4444 (red-500)
- `--protocol-accent`: oklch(0.72 0.15 155) (green)

The zinc scale is remapped to match the custom c1-c12 tokens, so `zinc-950` = `c1`, `zinc-50` = `c12`. This means existing Tailwind zinc classes are consistent with the custom palette.

---

## Font Configuration

Three Geist font variants loaded via the `geist` npm package:

| Font | Variable | Tailwind Class | Usage |
|------|----------|----------------|-------|
| Geist Sans | `--font-geist-sans` | `font-sans` | Body text (default) |
| Geist Mono | `--font-geist-mono` | `font-mono` | Labels, stats, buttons, code |
| Geist Pixel Square | `--font-geist-pixel-square` | `font-pixel` | Headlines (h1, h2), 404 page |

Loaded in layout.tsx:
```tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { GeistPixelSquare } from 'geist/font/pixel';

// Applied to body:
className={`${GeistSans.variable} ${GeistMono.variable} ${GeistPixelSquare.variable}`}
```

Typography patterns:
- All headlines: `font-pixel uppercase`
- All labels/metadata: `text-[10px] font-mono uppercase tracking-[0.2em]`
- Body text: `text-sm text-c7 leading-relaxed`
- Stats: `font-mono tabular-nums`
- Buttons: `font-mono font-medium`

---

## Animation Patterns

### 1. Flow Pulse (border comet trails)

The signature effect. A 70px gradient "comet" travels along every `.flow-line` (horizontal) and `.flow-line-v` (vertical) border. Each element gets sequentially staggered timing via CSS custom properties. The gradient uses `color-mix()` in OKLCH space, with the head being brighter than the tail (25% white mixed in). Colors shift from c5 to c9 based on vertical position on the page.

### 2. Icon Morph (stroke draw)

All lucide icons wrapped in `MorphingIcon` get a continuous SVG stroke animation:
- `stroke-dasharray: 100; stroke-dashoffset: 100;`
- Animates offset from 100 -> 0 (draw) -> back to 100 (undraw) over 3.5s

### 3. Eye Blink

The `Eye` icon in the features section has a `scaleY` animation that simulates blinking every 4.5s.

### 4. Protocol Stack (IntersectionObserver)

ASCII art layers slide up 8px with fade-in when the section enters the viewport. Staggered delays: 0ms, 300ms, 600ms, 900ms bottom-to-top. Text descriptions use the `Calligraph` library for character-by-character typewriter reveal.

### 5. Section Hatch Divider

45-degree striped pattern using repeating-linear-gradient. 40px tall. Uses `var(--c2)` for stripe color.

### 6. Skeleton Pulse

Stats use a custom skeleton pulse that oscillates opacity between 0.05 and 0.15 over 2s.

### 7. Reduced Motion

Full `prefers-reduced-motion` support: all animations and transitions are disabled when the user prefers reduced motion.

---

## Layout and Spacing Patterns

### Content Column

```
max-w-[960px] mx-auto px-6
```

Every section of the page uses this exact container. The `px-6` matches the position of the vertical guide lines.

### Vertical Guide Lines

Two absolute-positioned 1px lines (`bg-c2`) at `left-6` and `right-6` of the content column, spanning the full page height. These lines have the `.flow-line-v` class for vertical comet pulse animation.

### Section Pattern

Every section follows this structure:
```
border-t border-c2 flow-line
  px-8 (inner padding beyond the vertical guides)
```

The `flow-line` class adds the horizontal comet trail effect on the top border.

### Section Headers

Consistent pattern across all sections:
```html
<p className="text-[10px] uppercase tracking-[0.2em] text-c5 font-mono mb-4">
  Section Label
</p>
<h2 className="text-2xl font-pixel uppercase tracking-tight text-c11">
  Section Title
</h2>
```

### Hatch Dividers Between Sections

```html
<div className="border-t border-c2 overflow-hidden">
  <div className="section-hatch" />
</div>
```

---

## Section Structure

### Hero Section
- Top padding: `pt-44` (176px, accounting for fixed navbar)
- Bottom padding: `pb-28`
- Centered layout
- Components: Pill badge > h1 > description > two CTA buttons

### Stats Strip
- 4-column grid (`grid-cols-2 sm:grid-cols-4`)
- Divided by vertical borders on desktop (`sm:divide-x sm:divide-c2`)
- Each stat: large mono number + tiny uppercase label

### How It Works
- Section header + 3-column grid
- Each step: step number (01, 02, 03) + title + description
- Columns divided by vertical borders on desktop

### Features
- Section header + 2x2 grid (using inline-block layout)
- Each feature: animated icon + title + description
- Divided by borders between columns and rows

### Protocol Stack
- Section header + 2-column layout (3fr + 2fr)
- Left: ASCII art diagram (animated)
- Right: Layer descriptions (animated with Calligraph)

### CTA
- Centered text + wallet button + secondary button
- Padding: `py-16`

### Footer
- 2-column grid: brand + links
- Copyright bar below

---

## Key Design Decisions

1. **No border-radius anywhere.** All elements are sharp rectangles. This is intentional -- gives a technical/engineering aesthetic.

2. **Monochromatic palette.** The entire color system is achromatic OKLCH with zero chroma. The only colors are the semantic accents (blue, green, yellow, red) used sparingly for buttons and status indicators.

3. **Three font hierarchy.** Pixel font for impact (headlines), mono for data and labels, sans for body text. This creates a clear visual hierarchy without relying on color.

4. **Border-driven layout.** Sections are defined by `border-t border-c2` rather than background color changes or padding gaps. The flow pulse animation reinforces this by traveling along the borders.

5. **Sound design.** Every button click produces a subtle Web Audio tone. No audio files needed.

6. **ASCII art as visual.** The protocol architecture section uses pre-formatted ASCII art rather than SVG or images. This reinforces the technical identity.

7. **CSS-only animations.** No GSAP, no Framer Motion, no Lenis. All animations use CSS transitions, keyframes, and IntersectionObserver. The FlowPulse component dynamically injects keyframes via a style tag.

8. **Tailwind v4 with `@theme inline`.** The `@theme inline` block registers custom CSS properties as Tailwind tokens, allowing `bg-c1`, `text-c7`, etc. in class names.

9. **Graceful degradation.** Blockchain data uses `withMockFallback` to show hardcoded stats when smart contracts are unavailable. Stats show skeleton animation while loading.

10. **Accessibility.** Skip-to-content link, `aria-hidden` on decorative elements, `aria-label` on mobile menu button, `prefers-reduced-motion` support, focus-visible ring on buttons.

---

## External Dependencies Used on Landing Page

| Package | Version | Purpose |
|---------|---------|---------|
| `geist` | ^1.7.0 | Sans, Mono, and Pixel Square fonts |
| `lucide-react` | ^0.577.0 | SVG icons (ArrowRight, ArrowUpRight, Link2, Zap, Bot, Eye, Menu, X, Wallet) |
| `calligraph` | ^1.3.0 | Character-by-character text animation in ProtocolStack |
| `react-hot-toast` | ^2.6.0 | Toast notifications (configured in layout, not visible on landing) |
| `ethers` | 6 | Blockchain interaction for live stats |

---

## Mock Fallback System

**File:** `/Users/apple/Desktop/projects/eidos8004/frontend/src/lib/mock-fallback.ts`

```tsx
let onMockFallbackUsed: (() => void) | null = null

export function setMockFallbackListener(cb: (() => void) | null): void {
  onMockFallbackUsed = cb
}

export async function withMockFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const result = await fn();
    if (Array.isArray(result) && result.length === 0) {
      onMockFallbackUsed?.()
      return fallback;
    }
    return result;
  } catch {
    onMockFallbackUsed?.()
    return fallback;
  }
}
```

When blockchain calls fail, the landing page shows hardcoded fallback stats:
- Designers: 1,200+
- Paid Out: $850K+
- AI Agents: 67
- Attributions: 24K+
