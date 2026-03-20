"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const SPARKLINE = [
  { v: 4200 }, { v: 5800 }, { v: 5100 }, { v: 7200 },
  { v: 6900 }, { v: 8400 }, { v: 9100 }, { v: 8700 }, { v: 10200 },
];

interface Props {
  walletAddress?: string;
}

export default function PortfolioSummary({ walletAddress }: Props) {
  const [balanceVisible, setBalanceVisible] = useState(false);

  useEffect(() => {
    if (walletAddress) setBalanceVisible(true);
    else setBalanceVisible(false);
  }, [walletAddress]);

  return (
    <div>
      <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
        Session Summary
      </div>

      {/* Balance */}
      <div
        id="wallet-balance"
        style={{
          marginBottom: "18px",
          padding: "16px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-blue) 8%, var(--surface-strong)), color-mix(in srgb, var(--accent-cyan) 6%, var(--surface-strong)))",
          border: "1px solid var(--card-border)",
          transition: "opacity 0.4s",
          opacity: balanceVisible ? 1 : 0.4,
        }}
      >
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Trading Balance</div>
        <div className="mono" style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
          {balanceVisible ? "$13,272.38" : "•••••••"}
        </div>
        <div style={{ fontSize: "11px", color: "var(--accent-green)", marginTop: "2px", fontFamily: "'IBM Plex Mono', monospace" }}>
          USDC vault · Injective inEVM
        </div>
      </div>

      {/* Mini sparkline */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>Session Activity</div>
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={SPARKLINE}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="var(--accent-blue)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {[
          { label: "Total Volume", value: "$42,150" },
          { label: "Orders", value: "38" },
          { label: "Avg. Trade", value: "$1,109" },
          { label: "Prompts Removed", value: "76" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--surface-strong)", borderRadius: "14px", padding: "12px", border: "1px solid var(--card-border)" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div className="mono" style={{ fontSize: "15px", fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
