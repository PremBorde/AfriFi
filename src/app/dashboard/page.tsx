"use client";
import { useCallback, useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import MetricCard from "@/components/dashboard/MetricCard";
import dynamic from "next/dynamic";
const GlobeVisualizer = dynamic(() => import("@/components/dashboard/GlobeVisualizer"), { ssr: false });
import LiveTransferList from "@/components/dashboard/LiveTransferList";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import LiveFeedTable, { type Tx } from "@/components/dashboard/LiveFeedTable";
import ChartRow from "@/components/dashboard/ChartRow";
import TxModal from "@/components/dashboard/TxModal";
import Toast from "@/components/ui/Toast";
import { motion, type Variants, useReducedMotion } from "framer-motion";


const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// ---- Live simulation data ----
const NAMES = ["0xAf3...f1e", "0x7f1...3aD", "0xB3e...9fA", "0x2aA...7cB", "0xDd4...b2F"];
let txCounter = 100;

function makeTx(): Tx {
  const amount   = Math.floor(Math.random() * 4500) + 500;
  const rate     = 1455;
  const fiatCur  = Math.random() > 0.5 ? "NGN" : "KES";
  const fiatRate = fiatCur === "NGN" ? rate : 130;
  const statuses: Tx["status"][] = ["COMPLETED", "COMPLETED", "COMPLETED", "PENDING"];
  const status   = statuses[Math.floor(Math.random() * statuses.length)];
  const id       = String(++txCounter);
  return {
    id,
    sender:    NAMES[Math.floor(Math.random() * NAMES.length)],
    recipient: NAMES[Math.floor(Math.random() * NAMES.length)],
    amount,
    fiatValue: amount * fiatRate,
    fiatCur,
    status,
    timestamp: new Date().toLocaleString(),
    txHash:    `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
  };
}

export default function DashboardPage() {
  const reduceMotion = useReducedMotion();
  const [walletAddress, setWalletAddress]   = useState<string>("");
  const [showToast, setShowToast]           = useState(false);
  const [toastMsg, setToastMsg]             = useState("");
  const [globeFlash, setGlobeFlash]         = useState(0);
  const [selectedTx, setSelectedTx]         = useState<Tx | null>(null);
  const [newTx, setNewTx]                   = useState<Tx | undefined>(undefined);


  // Metrics state — updated by live simulation
  const [totalSent,       setTotalSent]       = useState(1714330);
  const [settlements,     setSettlements]     = useState(234);
  const [feeSaved,        setFeeSaved]        = useState(137146);
  const [oracleRate]                          = useState(1455);

  // Fix 5: Wallet connect handler
  const handleWalletConnect = useCallback((address: string) => {
    setWalletAddress(address);
    setToastMsg("✓ Session Key Active — Injective inEVM");
    setShowToast(true);

    // Pulse network badge 3x faster for 1 second
    const badge = document.getElementById("network-badge");
    if (badge) {
      badge.classList.add("fast-pulse");
      setTimeout(() => badge.classList.remove("fast-pulse"), 1000);
    }
  }, []);

  // Live transaction simulation (setInterval)
  useEffect(() => {
    const interval = setInterval(() => {
      const tx = makeTx();
      setNewTx(tx);
      setTotalSent((v) => v + tx.amount);
      setSettlements((v) => v + 1);
      setFeeSaved((v) => v + Math.round(tx.amount * 0.08));
      // Fix 3: trigger globe flash
      setGlobeFlash((v) => v + 1);
    }, 4500); // new tx every 4.5s

    return () => clearInterval(interval);
  }, []);

  return (
    <>      {/* Fix 5: Toast */}
      <Toast message={toastMsg} show={showToast} onDone={() => setShowToast(false)} />

      {/* TX Modal */}
      {selectedTx && (
        <TxModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}

      {/* Fix 4: Header with stagger class */}
      <Header
        walletAddress={walletAddress}
        onWalletConnect={handleWalletConnect}
      />

      <motion.main
        variants={staggerContainer}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
        className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-5 md:px-6"
      >
        {/* ── METRIC STRIP ── */}
        <motion.div
          variants={fadeInUp}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            icon="💸"
            label="Simulated Trading Volume (USDC)"
            value={totalSent}
            prefix="$"
            animIndex={1}
          />
          <MetricCard
            icon="⚡"
            label="Avg Execution Speed"
            value="< 1s"
            sub="inEVM"
            animIndex={2}
          />
          <MetricCard
            icon="💰"
            label="Wallet Friction Removed"
            value={feeSaved}
            prefix="$"
            sub="via AA flow"
            animIndex={3}
          />
          <MetricCard
            icon="📡"
            label="Demo Reference Rate"
            value={`${oracleRate.toLocaleString("en-US")} NGN`}
            animIndex={4}
          />
        </motion.div>

        {/* ── MIDDLE ROW (Globe + side panels) ── */}
        <motion.div
          variants={fadeInUp}
          className="anim-middle-row grid min-h-[300px] gap-4 xl:grid-cols-[260px_minmax(0,1fr)_300px]"
        >
          {/* LEFT: Active Orders + Session Metrics */}
          <div className="card flex flex-col gap-5 overflow-hidden p-5">
            <LiveTransferList />
            <div className="border-t border-[var(--border-light)] pt-4">
              <div className="mb-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)]">
                Session Metrics
              </div>
              {[
                { label: "Session Window", value: "24h" },
                { label: "One-Click Actions",  value: settlements.toLocaleString("en-US") },
                { label: "Total Volume", value: `$${totalSent.toLocaleString("en-US")}` },
              ].map(({ label, value }) => (
                <div key={label} className="mb-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-[var(--text-muted)]">{label}</span>
                  <span className="mono text-[13px] font-bold text-[var(--accent-blue)]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER: Globe */}
          <div className="card flex flex-col p-[18px]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-extrabold">Global Settlement Flow</div>
                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                  Africa-to-global execution routed through Injective inEVM
                </div>
              </div>
              <div
                className="rounded-full border border-[var(--card-border)] px-[10px] py-[7px] font-mono text-[11px] text-[var(--accent-blue)]"
                style={{ background: "color-mix(in srgb, var(--accent-blue) 8%, transparent)" }}
              >
                Real-time map
              </div>
            </div>
            <div className="min-h-[280px] flex-1">
              <GlobeVisualizer
                flashTrigger={globeFlash}
              />
            </div>
          </div>

          {/* RIGHT: Live Tape + Portfolio */}
          <div
            className="card"
            style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "20px", overflow: "hidden" }}
          >
            {/* Live Tape */}
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                Live Tape
                <span style={{ marginLeft: "8px", width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block", boxShadow: "0 0 6px var(--accent-green)", animation: "arcFlash 1.2s ease-in-out infinite" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                {newTx ? (
                  <div className="new-row" style={{ padding: "10px 12px", background: "var(--surface-strong)", borderRadius: "12px", border: "1px solid var(--card-border)", fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace" }}>
                    <span style={{ color: "var(--accent-green)" }}>NEW</span>{" "}
                    {newTx.sender} → {newTx.recipient.slice(0,8)}... · ${newTx.amount.toLocaleString("en-US")}
                  </div>
                ) : null}
                {[
                  { time: "21:45:07", sender: "0xAf3...f1e", amount: "$5,000" },
                  { time: "21:44:52", sender: "0x7f1...3aD", amount: "$1,200" },
                  { time: "21:44:31", sender: "0xB3e...9fA", amount: "$800"   },
                  { time: "21:44:19", sender: "0x2aA...7cB", amount: "$3,000" },
                  { time: "21:44:01", sender: "0xDd4...b2F", amount: "$350"   },
                ].map((row, i) => (
                  <div key={i} style={{ padding: "10px 12px", background: "var(--surface-strong)", borderRadius: "12px", border: "1px solid var(--card-border)", fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>{row.time}</span>
                    <span>{row.sender}</span>
                    <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>{row.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Summary */}
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
              <PortfolioSummary walletAddress={walletAddress} />
            </div>
          </div>
        </motion.div>


        {/* ── CHARTS ROW ── */}
        <motion.div variants={fadeInUp}>
          <ChartRow />
        </motion.div>

        {/* ── LIVE FEED TABLE ── */}
        <motion.div variants={fadeInUp} style={{ marginTop: "4px" }}>
          <LiveFeedTable newTx={newTx} onRowClick={(tx) => setSelectedTx(tx)} />
        </motion.div>
      </motion.main>
    </>
  );
}
