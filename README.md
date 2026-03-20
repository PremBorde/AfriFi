# AfriFi (InstaInject UI)

AfriFi is a production-grade Next.js UI for an **ERC-4337 + session-key trading flow** on Injective inEVM. The app focuses on a fast, “no popup” user experience: create a session once, then execute trades with minimal friction.

## Pages

- `/` — Landing page
- `/dashboard` — Trading command center (analytics + live activity)
- `/setup` — Session key setup flow
- `/trade` — Trading terminal
- `/portfolio` — Portfolio + session controls

## Tech Stack

- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Ethers v6
- Recharts + Three/Globe visualizations

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

## Troubleshooting

- Blank/failed charts or terminal data: verify `NEXT_PUBLIC_RELAY_URL` and that the relay server is reachable.
- Wallet flows not working: ensure you’re on the expected network and all `NEXT_PUBLIC_*_CONTRACT` addresses are set.
