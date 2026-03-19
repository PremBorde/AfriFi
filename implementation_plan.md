# AfriFi — Remittance Dashboard on Injective inEVM

A full-stack Next.js dashboard combining two design inspirations:
1. **Globe Visualizer** (from the reference image): A neon-lit 3D globe with glowing transfer arcs, live transaction labels, and city pins — the emotional "wow" factor.
2. **DefiLlama Style**: Crisp dark-mode data cards, metric strips, sortable tables, and line charts — the analytical layer that proves AfriFi's value to hackathon judges.

The final result is a single unified dashboard that feels both cinematic and data-trustworthy.

---

## Reference Image Analysis

The reference globe image already defines the core layout we are building towards:

| Zone | What's in it | Our Implementation |
|---|---|---|
| Top Left | "Active Transfers" panel with FROM/TO/AMOUNT/STATUS list | `<LiveTransferList>` component |
| Center | 3D globe with glowing neon arcs for active transfers | `<GlobeVisualizer>` using `react-globe.gl` |
| Top Right | "Live Tape" — streaming transaction feed | `<LiveTape>` component |
| Bottom Left | "Global Reach" stats (countries, recipients, volume) | `<GlobalReachCard>` |
| Bottom Right | "Portfolio Summary" with balance + mini chart | `<PortfolioSummary>` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS variables |
| UI Primitives | shadcn/ui |
| Globe | `react-globe.gl` (WebGL-based 3D globe) |
| Charts | `recharts` (line, bar, pie charts) |
| Web3 | `viem` + `wagmi` v2 |
| Smart Contracts | Solidity + Hardhat |
| Fonts | Inter (Google Fonts) |
| Icons | Lucide React |

---

## Proposed Changes

### Component: Design System & Tokens

#### [NEW] globals.css
Defines the full color system as CSS variables matching the spec:
```
--bg-deep:     #0F172A   (page background)
--bg-card:     #1E293B   (card backgrounds)
--accent-blue: #0EA5E9   (Injective brand, links, highlights)
--accent-green:#10B981   (success states, "Completed" badges)
--accent-red:  #EF4444   (error states, "Failed" badges)
--text-primary:#F1F5F9
--text-muted:  #64748B
--border:      #334155
```
Inter font import and base styles.

#### [NEW] tailwind.config.ts
Extends Tailwind with the custom color tokens above as named utilities (e.g., `bg-card`, `text-accent-blue`), so every component uses the design system by name, not by hex code.

---

### Component: Project Bootstrap

#### [NEW] package.json + Next.js Setup
Run `npx create-next-app@latest ./ --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"` to bootstrap a clean project in `d:\AfriFi`.

Additional packages to install:
- `react-globe.gl` — 3D WebGL globe
- `recharts` — charts library
- `wagmi` `viem` — Web3 connectivity
- `shadcn/ui` — UI primitives
- `@tanstack/react-table` — sortable data tables
- `lucide-react` — icons
- `framer-motion` — row slide-in animations

---

### Component: Network & Web3 Configuration

#### [NEW] `src/lib/wagmi.ts`
Configures `wagmi` with the **Injective inEVM Testnet** as a custom chain:
```typescript
const injectiveTestnet = defineChain({
  id: 1738,
  name: 'Injective inEVM Testnet',
  network: 'injective-inevm-testnet',
  nativeCurrency: { name: 'INJ', symbol: 'INJ', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://inevm-rpc.injective.network'] },
  },
  blockExplorers: {
    default: { name: 'Injective Explorer', url: 'https://inevm.explorer.injective.network' },
  },
})
```

#### [NEW] `src/providers/Web3Provider.tsx`
Wraps the app in `WagmiProvider` + `QueryClientProvider`. Auto-detects MetaMask and falls back to a read-only public RPC.

---

### Component: Smart Contracts

#### [NEW] `contracts/InjectiveRemit.sol`
Core remittance contract:
- `sendRemittance(address recipient, uint256 amount)` — transfers USDC, emits `RemittanceSent`.
- `getLatestExchangeRate()` — reads from an on-chain oracle (mocked as a settable value for the hackathon).
- Event: `RemittanceSent(sender, recipient, amount, exchangeRate, timestamp)`.

#### [NEW] `contracts/MockUSDC.sol`
ERC-20 token for testnet testing. Has a public `mint()` function so any tester can get tokens.

#### [NEW] `contracts/MockOracle.sol`
Simple oracle contract with a `setRate(uint256 rate)` owner function and a `latestAnswer()` view function. This simulates the Chainlink-style oracle the real app would use.

#### [NEW] `hardhat.config.ts`
Configured with the Injective inEVM testnet:
```typescript
networks: {
  injective_testnet: {
    url: 'https://inevm-rpc.injective.network',
    chainId: 1738,
    accounts: [process.env.PRIVATE_KEY!],
  }
}
```

#### [NEW] `scripts/deploy.ts`
Hardhat deploy script that deploys MockUSDC → MockOracle → InjectiveRemit in order, logs all addresses, and writes them to `src/lib/contracts.json`.

---

### Component: Pages & Layout

#### [NEW] `src/app/layout.tsx`
Root layout: imports Inter font, wraps children in `Web3Provider`, sets dark background.

#### [NEW] `src/app/page.tsx` — Landing Page
A cinematic hero page:
- **Full-screen background**: Abstract Africa continent silhouette with glowing particle nodes (CSS + SVG animation).
- **Headline**: "Send Money Across Africa. Instantly. For Free."
- **Sub-text**: "Powered by Injective inEVM — the world's fastest financial blockchain."
- **CTA button**: "Open Dashboard →" linking to `/dashboard`.
- A scrolling ticker at the top showing recent mock transactions.

#### [NEW] `src/app/dashboard/page.tsx` — Main Dashboard
This is the core deliverable. The layout matches the reference image:

```
┌─────────────────── Header Bar ───────────────────────┐
│ Logo  |  Dashboard  Send  History  |  [inEVM badge]  │
├───────────────────────────────────────────────────────┤
│         Metric Strip (4 cards across top)             │
├──────────────┬──────────────────┬─────────────────────┤
│ Active       │                  │  Live Tape          │
│ Transfers    │   Globe          │  (streaming feed)   │
│ (left panel) │   Visualizer     │                     │
├──────────────┤   (center)       ├─────────────────────┤
│ Global Reach │                  │  Portfolio Summary  │
│ Stats        │                  │  + Mini Chart       │
├──────────────┴──────────────────┴─────────────────────┤
│     Send Form Card                                    │
├───────────────────────────────────────────────────────┤
│     Live Feed Table  (full-width, sortable)           │
├───────────────────────────────────────────────────────┤
│     Charts Row: Volume | Fee Savings | Fiat Split     │
└───────────────────────────────────────────────────────┘
```

#### [NEW] `src/app/send/page.tsx`
A dedicated Send page for mobile users with a large, focused Send Form and step-by-step progress indicator.

---

### Component: UI Components

#### [NEW] `src/components/layout/Header.tsx`
Navigation bar. Key elements:
- AfriFi logo (SVG).
- Nav links: Dashboard, Send, History.
- Right side: Network badge `<NetworkBadge>` showing green dot + "Injective inEVM" text.
- `<ConnectWalletButton>` from wagmi — shows address when connected.

#### [NEW] `src/components/layout/NetworkBadge.tsx`
Small pill component. Uses `useChainId()` hook from wagmi. Green dot if on correct chain (1738), red dot if wrong network with a "Switch Network" tooltip.

#### [NEW] `src/components/dashboard/MetricCard.tsx`
Reusable card with:
- Icon (Lucide).
- Title (text-muted).
- Value (large, monospaced font).
- Trend indicator (up/down arrow with %).

Four instances on the dashboard:
1. **Total Sent** — USDC amount + fiat equivalent.
2. **Avg Fee Saved** — "vs 8% Western Union".
3. **Settlement Speed** — "< 1 second".
4. **Oracle Rate** — "1 USDC = 1,455 NGN".

#### [NEW] `src/components/dashboard/GlobeVisualizer.tsx`
The centerpiece of the UI. Uses `react-globe.gl`:
- Dark globe texture (Earth at night NASA image).
- **Arc layer**: Glowing neon arcs (cyan/green) between city coordinates for each active transfer.
- **Point layer**: Glowing pulsing dots on sender/receiver cities (Lagos, Nairobi, London, NYC, etc.).
- **Label layer**: Floating city name labels.
- **HTML layer**: Popup labels for in-progress transfers (e.g., "TRANSFER ID: #4NJ3 | $5,000 | PENDING").
- Slow auto-rotation with mouse drag to explore.
- On click of an arc → opens `<TxModal>` with that transaction's details.

#### [NEW] `src/components/dashboard/LiveTransferList.tsx`
Left-panel vertical list of active transfers (matching the reference image's top-left panel):
- Each row: FROM flag + city → TO flag + city, AMOUNT, STATUS badge.
- Status badges: "COMPLETED" (green), "PENDING" (yellow), "FAILED" (red).
- Uses `framer-motion` `AnimatePresence` for new row slide-in.

#### [NEW] `src/components/dashboard/LiveTape.tsx`
Right-panel streaming feed (matching the reference image's right side):
- Scrolling list of recent on-chain `RemittanceSent` events.
- Columns: Timestamp, Sender (truncated), Amount.
- New rows glow green for 2 seconds on entry.
- Reads events via `wagmi`'s `useWatchContractEvent` hook.

#### [NEW] `src/components/dashboard/GlobalReachCard.tsx`
Bottom-left stats panel:
- Countries Connected: **54** (all of Africa).
- Recipients Reached: live count from on-chain events.
- Total Transfer Volume: USDC sum of all `RemittanceSent` events.

#### [NEW] `src/components/dashboard/PortfolioSummary.tsx`
Bottom-right panel:
- Wallet balance in USDC (reads from MockUSDC contract).
- Mini sparkline chart of the user's personal send history (using `recharts` `LineChart`).

#### [NEW] `src/components/dashboard/SendForm.tsx`
The primary action card:
- **Recipient Address** input with ENS/address validation.
- **Amount (USDC)** input — monospaced number input.
- **Fiat Preview** — dynamic text: "≈ 145,500 NGN" — reads `getLatestExchangeRate()` from contract.
- **Fee Breakdown** — "Network Fee: **0 INJ**" (hardcoded zero, the point!).
- **Send Button** — full-width. States: Default → Pending (spinner) → Confirmed (checkmark + tx hash).
- On success → opens `<TxModal>`.

#### [NEW] `src/components/dashboard/LiveFeedTable.tsx`
Full-width sortable table at the bottom of the dashboard:
- Built with `@tanstack/react-table`.
- Columns: Sender | Recipient | Amount (USDC) | Fiat Value | Status | Time.
- New rows slide in via `framer-motion`.
- Click row → open `<TxModal>`.
- Export CSV button for judges to verify data.

#### [NEW] `src/components/dashboard/TxModal.tsx`
Popup modal for transaction details:
- TX Hash (copyable).
- Block Number.
- Oracle Rate used.
- Confirmation Time (e.g., "0.8 seconds").
- "View on Injective Explorer" external link → inEVM block explorer.
- Shareable claim code for recipient.

#### [NEW] `src/components/dashboard/ChartRow.tsx`
Three charts in a row (recharts):
1. **Line Chart**: Remittance volume over the past 7 days.
2. **Pie Chart**: Distribution by fiat currency (NGN 60%, KES 25%, GHS 15%).
3. **Bar Chart**: AfriFi fee vs Western Union fee side-by-side (the strongest visual argument for the judges).

#### [NEW] `src/hooks/useRemittanceContract.ts`
Custom React hook encapsulating all contract interactions:
- `sendRemittance(recipient, amount)` — calls `sendRemittance` on the contract.
- `useOracleRate()` — reads and auto-refreshes exchange rate every 30s.
- `useTransactionHistory()` — reads all past `RemittanceSent` events.
- `useWatchNewTransactions()` — subscribes to live events.

#### [NEW] `src/lib/contracts.json`
Auto-generated by the deploy script. Stores deployed contract addresses so the frontend always reads from the right contract.

---

## Page Flow Diagrams

### Flow A: Send Funds
```
Landing Page → Connect Wallet → Dashboard
→ Fill SendForm (address + amount)
→ Oracle rate auto-populates fiat preview
→ Click "Send USDC"
→ MetaMask popup for approval
→ Pending state (spinner on button)
→ TxModal opens (hash + block + time < 1s)
→ Globe animates new arc
→ LiveTape + LiveFeedTable row slides in
```

### Flow B: Judge Demo
```
Dashboard → Globe shows global transfers visually
→ Scroll down → MetricCards show 0 fees, <1s speed
→ ChartRow → Bar chart proves fee savings vs WU
→ Click any table row → TxModal → "View on Injective Explorer"
```

---

## Verification Plan

### Step 1: Smart Contract Tests
Run Hardhat tests to verify contract logic before frontend work:
```powershell
cd d:\AfriFi
npx hardhat test
```
Tests to write in `test/InjectiveRemit.ts`:
- `sendRemittance()` — transfers USDC from sender to recipient correctly.
- `RemittanceSent` event is emitted with correct parameters.
- `getLatestExchangeRate()` returns the MockOracle's set rate.
- MockUSDC `mint()` function works.

### Step 2: Contract Deployment to inEVM Testnet
```powershell
cd d:\AfriFi
npx hardhat run scripts/deploy.ts --network injective_testnet
```
Verify: All three contracts appear on `https://inevm.explorer.injective.network`.

### Step 3: Frontend Local Dev Server
```powershell
cd d:\AfriFi
npm run dev
```
Open `http://localhost:3000`.

### Step 4: Browser Visual Verification (automated via browser tool)
Check the following visually:
- [ ] Landing page hero renders with Africa silhouette.
- [ ] Dashboard loads with globe in center.
- [ ] Globe arcs are visible and animating.
- [ ] All 4 MetricCards display data.
- [ ] Network badge shows "Injective inEVM" with green dot.
- [ ] SendForm fiat preview updates when amount is typed.
- [ ] LiveFeedTable shows mock historical transactions.
- [ ] Charts render in the bottom row.

### Step 5: End-to-End Send Flow Test
1. Connect MetaMask to Injective inEVM Testnet (Chain ID: 1738).
2. Mint MockUSDC: call `mint()` on the MockUSDC contract via the explorer.
3. Fill SendForm: paste a test recipient address, enter `10` USDC.
4. Click "Send USDC" → approve in MetaMask.
5. Verify:
   - TxModal opens in < 5 seconds.
   - Confirmation time shows < 2 seconds.
   - LiveTape receives the new transaction row.
   - Globe animates a new arc.
   - TX hash links correctly to the inEVM explorer.

### Step 6: Responsiveness Check
Resize browser to 768px width — verify the globe shrinks proportionally and the metric cards stack vertically.
