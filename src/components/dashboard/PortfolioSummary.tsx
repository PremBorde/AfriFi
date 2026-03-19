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
        Portfolio Summary
      </div>

      {/* Balance */}
      <div
        id="wallet-balance"
        style={{
          marginBottom: "16px",
          transition: "opacity 0.4s",
          opacity: balanceVisible ? 1 : 0.4,
        }}
      >
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "4px" }}>Wallet Balance</div>
        <div className="mono" style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
          {balanceVisible ? "$13,272.38" : "•••••••"}
        </div>
        <div style={{ fontSize: "11px", color: "var(--accent-green)", marginTop: "2px", fontFamily: "'IBM Plex Mono', monospace" }}>
          USDC · Injective inEVM
        </div>
      </div>

      {/* Mini sparkline */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>Recent Activity</div>
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
          { label: "Total Sent",      value: "$42,150" },
          { label: "Transfers",        value: "38" },
          { label: "Avg. Per Tx",      value: "$1,109" },
          { label: "Fee Saved",        value: "$3,372" },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "var(--bg-deep)", borderRadius: "8px", padding: "10px 12px" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
            <div className="mono" style={{ fontSize: "15px", fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
