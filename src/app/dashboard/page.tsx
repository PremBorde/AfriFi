"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import MetricCard from "@/components/dashboard/MetricCard";
import dynamic from "next/dynamic";
const GlobeVisualizer = dynamic(() => import("@/components/dashboard/GlobeVisualizer"), { ssr: false });
import type { Arc } from "@/components/dashboard/GlobeVisualizer";
import LiveTransferList from "@/components/dashboard/LiveTransferList";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import SendForm from "@/components/dashboard/SendForm";
import LiveFeedTable, { type Tx } from "@/components/dashboard/LiveFeedTable";
import ChartRow from "@/components/dashboard/ChartRow";
import TxModal from "@/components/dashboard/TxModal";
import Toast from "@/components/ui/Toast";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import { motion } from "framer-motion";

const fadeInUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// ---- Live simulation data ----
const NAMES = ["0xAf3...f1e", "0x7f1...3aD", "0xB3e...9fA", "0x2aA...7cB", "0xDd4...b2F"];
const CITIES = ["Lagos", "Nairobi", "Accra"];
const FLAGS  = { Lagos:"🇳🇬", Nairobi:"🇰🇪", Accra:"🇬🇭" };
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
    setToastMsg("✓ Wallet Connected — Injective inEVM");
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

  // Handle send form success (also triggers globe flash + new row)
  const handleSendSuccess = useCallback((txHash: string) => {
    const tx: Tx = {
      id:        String(++txCounter),
      sender:    walletAddress || "0xAf3...f1e",
      recipient: "0x9c2...e41",
      amount:    100,
      fiatValue: 100 * oracleRate,
      fiatCur:   "NGN",
      status:    "COMPLETED",
      timestamp: new Date().toLocaleString(),
      txHash,
    };
    setNewTx(tx);
    setGlobeFlash((v) => v + 1);
    setTotalSent((v) => v + 100);
    setSettlements((v) => v + 1);
  }, [walletAddress, oracleRate]);

  const handleNewTxFromForm = useCallback(() => {
    setGlobeFlash((v) => v + 1);
  }, []);

  // --- NEW: Video Background Loop ---
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;
    const fadeDuration = 0.5;

    const tick = () => {
      if (!video.duration || isNaN(video.duration)) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const { currentTime, duration } = video;
      if (currentTime < fadeDuration) {
        video.style.opacity = (currentTime / fadeDuration).toString();
      } else if (duration - currentTime < fadeDuration) {
        video.style.opacity = Math.max(0, (duration - currentTime) / fadeDuration).toString();
      } else {
        video.style.opacity = "1";
      }
      rafId = requestAnimationFrame(tick);
    };

    const onEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => { video.currentTime = 0; video.play().catch(() => {}); }, 100);
    };

    video.addEventListener("ended", onEnded);
    rafId = requestAnimationFrame(tick);
    video.play().catch(() => {});
    return () => { cancelAnimationFrame(rafId); video.removeEventListener("ended", onEnded); };
  }, []);

  return (
    <>
      {/* --- Animated Video Background for Dashboard --- */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
          style={{ opacity: 0, filter: "hue-rotate(200deg) saturate(1.5)" }}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260308_114720_3dabeb9e-2c39-4907-b747-bc3544e2d5b7.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background/90" />
      </div>

      {/* Fix 5: Toast */}
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
        initial="hidden"
        animate="visible"
        style={{
          padding: "20px 24px",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          fontFamily: "'Geist Sans', sans-serif",
        }}
      >
        {/* ── METRIC STRIP ── */}
        <motion.div
          variants={fadeInUp}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
          }}
        >
          <MetricCard
            icon="💸"
            label="Total Remittances (USDC)"
            value={totalSent}
            prefix="$"
            animIndex={1}
          />
          <MetricCard
            icon="⚡"
            label="Avg Settlement Speed"
            value="< 1s"
            sub="inEVM"
            animIndex={2}
          />
          <MetricCard
            icon="💰"
            label="Total Fees Saved"
            value={feeSaved}
            prefix="$"
            sub="vs WU 8%"
            animIndex={3}
          />
          <MetricCard
            icon="📡"
            label="Oracle Rate (1 USDC)"
            value={`${oracleRate.toLocaleString()} NGN`}
            animIndex={4}
          />
        </motion.div>

        {/* ── MIDDLE ROW (Globe + side panels) ── */}
        <motion.div
          variants={fadeInUp}
          className="anim-middle-row"
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr 220px",
            gap: "14px",
            minHeight: "300px",
          }}
        >
          {/* LEFT: Active Transfers + Global Reach */}
          <div
            className="card"
            style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "20px", overflow: "hidden" }}
          >
            <LiveTransferList />
            <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                Global Reach
              </div>
              {[
                { label: "Countries Connected", value: "54" },
                { label: "Recipients Reached",  value: settlements.toLocaleString() },
                { label: "Total Volume",         value: `$${totalSent.toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{label}</span>
                  <span className="mono" style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-blue)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER: Globe */}
          <div
            className="card"
            style={{ padding: "16px", display: "flex", flexDirection: "column" }}
          >
            <div style={{ textAlign: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700 }}>
                💡 Injective Remittance Hub
              </span>
            </div>
            <div style={{ flex: 1, minHeight: "280px" }}>
              <GlobeVisualizer
                flashTrigger={globeFlash}
                onArcClick={(arc) => {
                  // Create a pseudo Tx from an arc click
                  const pseudoTx: Tx = {
                    id:        arc.id,
                    sender:    arc.from.city,
                    recipient: arc.to.city,
                    amount:    parseInt(arc.amount.replace(/\D/g, "")),
                    fiatValue: parseInt(arc.amount.replace(/\D/g, "")) * 1455,
                    fiatCur:   "NGN",
                    status:    arc.status,
                    timestamp: new Date().toLocaleString(),
                    txHash:    `0x${arc.id}deadbeef0000000000000000000000000000000000000000000000000000`,
                  };
                  setSelectedTx(pseudoTx);
                }}
              />
            </div>
          </div>

          {/* RIGHT: Live Tape + Portfolio */}
          <div
            className="card"
            style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "20px", overflow: "hidden" }}
          >
            {/* Live Tape */}
            <div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                Live Tape
                <span style={{ marginLeft: "8px", width: 6, height: 6, borderRadius: "50%", background: "var(--accent-green)", display: "inline-block", boxShadow: "0 0 6px var(--accent-green)", animation: "arcFlash 1.2s ease-in-out infinite" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "160px", overflowY: "auto" }}>
                {newTx ? (
                  <div className="new-row" style={{ padding: "8px 10px", background: "var(--bg-deep)", borderRadius: "6px", fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace" }}>
                    <span style={{ color: "var(--accent-green)" }}>NEW</span>{" "}
                    {newTx.sender} → {newTx.recipient.slice(0,8)}... · ${newTx.amount.toLocaleString()}
                  </div>
                ) : null}
                {[
                  { time: "21:45:07", sender: "0xAf3...f1e", amount: "$5,000" },
                  { time: "21:44:52", sender: "0x7f1...3aD", amount: "$1,200" },
                  { time: "21:44:31", sender: "0xB3e...9fA", amount: "$800"   },
                  { time: "21:44:19", sender: "0x2aA...7cB", amount: "$3,000" },
                  { time: "21:44:01", sender: "0xDd4...b2F", amount: "$350"   },
                ].map((row, i) => (
                  <div key={i} style={{ padding: "8px 10px", background: "var(--bg-deep)", borderRadius: "6px", fontSize: "11px", fontFamily: "'IBM Plex Mono', monospace", display: "flex", justifyContent: "space-between" }}>
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

        {/* ── SEND FORM + CHARTS ── */}
        <motion.div variants={fadeInUp} style={{ display: "grid", gridTemplateColumns: "500px 1fr", gap: "16px", alignItems: "stretch" }}>
          <SendForm
            oracleRate={oracleRate}
            onSendSuccess={handleSendSuccess}
            onNewTransaction={handleNewTxFromForm}
          />
          <AnalyticsWidget />
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
