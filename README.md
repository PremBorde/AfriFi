# AfriFi (InstaInject UI)

AfriFi is a production-grade Next.js UI for an **ERC-4337 + session-key trading flow** on Injective inEVM. The app focuses on a fast, “no popup” user experience: create a session once, then execute trades with minimal friction.

## Pages

- `/` — Landing page
- `/dashboard` — Trading command center (analytics + live activity)
- `/setup` — Session key setup flow
- `/trade` — Trading terminal
- `/portfolio` — Portfolio + session controls

Reality check:

- `/dashboard` uses simulated activity/metrics for the “live tape” experience.
- `/trade` prices (mid price + chart) are fetched from a relay (`NEXT_PUBLIC_RELAY_URL`).
- Trades are submitted as ERC-4337 user operations to the relay; confirmation status + `txHash` come back from the relay.
- `/portfolio` trade history is stored in browser `sessionStorage` (demo UX), not indexed from chain.

## Tech Stack

- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Ethers v6
- Recharts + Three/Globe visualizations
- Shadcn-style UI conventions (custom buttons live in `src/components/ui`)

## Prerequisites

- Node.js 20+ (recommended)
- npm (or pnpm/yarn/bun — examples below use npm)

## Clone

```bash
git clone https://github.com/PremBorde/AfriFi.git
cd AfriFi
```

## Install

```bash
npm install
```

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Network / AA config
NEXT_PUBLIC_ENTRYPOINT=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
NEXT_PUBLIC_CHAIN_ID=1439

# Contracts (set these for real on-chain flows)
NEXT_PUBLIC_SMART_ACCOUNT_FACTORY=
NEXT_PUBLIC_VAULT_CONTRACT=
NEXT_PUBLIC_SESSION_KEY_CONTRACT=
NEXT_PUBLIC_PAYMASTER_CONTRACT=

# Backend / relay used by price feeds + userOp submission
# Defaults to http://localhost:8787 if unset
NEXT_PUBLIC_RELAY_URL=http://localhost:8787
```

Notes:

- If the relay isn’t running (or the URL is wrong), terminal/price features that fetch data will fail.
- Contract addresses are required if you want the on-chain session key / smart account flows to actually execute.

## Run (Dev)

```bash
npm run dev
```

Open http://localhost:3000

## UI / Components (Shadcn + Tailwind conventions)
This repo uses a “shadcn-like” structure for reusable UI pieces and composes them in the feature pages.

- Reusable components:
  - `src/components/ui/` (default place for shadcn-style primitives and app-specific animated buttons)
  - `src/components/ui/button.tsx` (base button primitives)
  - `src/components/ui/interactive-hover-button.tsx` (setup action button with buffering/loading visual)
  - `src/components/ui/animated-generate-button-shadcn-tailwind.tsx` (1-click Buy/Sell animated button)
- App/page composition:
  - `src/components/dex/*` and `src/components/dex-pages/*` build the trading UI using the shared components above.
- Theming:
  - `src/app/globals.css` defines the light/dark tokens (`--background`, `--foreground`, etc.).
  - When adding UI elements, prefer token-based colors so light mode stays readable.

## Production Build

```bash
npm run build
npm start
```

## Lint

```bash
npm run lint
```

## Assets

- App logo is served from `public/instainject-logo.png`.

## Custom Buttons Used in This UI
### `InteractiveHoverButton`
Location: `src/components/ui/interactive-hover-button.tsx`

Use this for Setup-page actions like `Connect Wallet`, `Deposit`, `Add Stake`, and similar flows.

Props:
- `text` (idle label)
- `loadingText` (while connecting/buffering)
- `successText` (after success)
- `classes` (optional extra Tailwind classes)

### `AnimatedGenerateButton`
Location: `src/components/ui/animated-generate-button-shadcn-tailwind.tsx`

Use this for “1-click” actions like `1-CLICK BUY` / `1-CLICK SELL`.

Props:
- `generating` (shows loading/buffering state)
- `labelIdle` (idle text)
- `labelActive` (loading text)
- `highlightHueDeg` (accent color hue per action)

## Dependencies to Keep
Button animations rely on:
- `lucide-react`
- `framer-motion`
- `clsx`
- `tailwind-merge`

## Troubleshooting

- Blank/failed charts or terminal data: verify `NEXT_PUBLIC_RELAY_URL` and that the relay server is reachable.
- Wallet flows not working: ensure you’re on the expected network and all `NEXT_PUBLIC_*_CONTRACT` addresses are set.
