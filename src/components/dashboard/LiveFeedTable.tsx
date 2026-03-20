"use client";
import { useEffect, useState } from "react";

export interface Tx {
  id:        string;
  sender:    string;
  recipient: string;
  amount:    number;
  fiatValue: number;
  fiatCur:   string;
  status:    "COMPLETED" | "PENDING" | "FAILED";
  timestamp: string;
  txHash:    string;
}

const MOCK_TXS: Tx[] = [
  { id:"1", sender:"0xAf3...f1e", recipient:"0x9c2...e41", amount:2500, fiatValue:3637500, fiatCur:"NGN", status:"COMPLETED", timestamp:"2025-03-18 21:45", txHash:"0xabc1" },
  { id:"2", sender:"0x7f1...3aD", recipient:"0x4b8...c23", amount:1200, fiatValue:156000,  fiatCur:"KES", status:"COMPLETED", timestamp:"2025-03-18 21:30", txHash:"0xabc2" },
  { id:"3", sender:"0xB3e...9fA", recipient:"0x1d5...b6c", amount:800,  fiatValue:1160000, fiatCur:"NGN", status:"PENDING",   timestamp:"2025-03-18 21:22", txHash:"0xabc3" },
  { id:"4", sender:"0x2aA...7cB", recipient:"0x8f0...11d", amount:5000, fiatValue:650000,  fiatCur:"KES", status:"COMPLETED", timestamp:"2025-03-18 21:10", txHash:"0xabc4" },
  { id:"5", sender:"0xDd4...b2F", recipient:"0x3e7...9a1", amount:350,  fiatValue:508500,  fiatCur:"NGN", status:"FAILED",    timestamp:"2025-03-18 21:05", txHash:"0xabc5" },
];

interface Props {
  newTx?: Tx;
  onRowClick?: (tx: Tx) => void;
}

export default function LiveFeedTable({ newTx, onRowClick }: Props) {
  const [rows, setRows] = useState<Tx[]>(MOCK_TXS);
  const [newRowId, setNewRowId] = useState<string | null>(null);

  useEffect(() => {
    if (!newTx) return;
    setRows((prev) => [newTx, ...prev.slice(0, 19)]); // keep last 20
    setNewRowId(newTx.id);
    const t = setTimeout(() => setNewRowId(null), 2000);
    return () => clearTimeout(t);
  }, [newTx]);

  const statusBadge = (status: Tx["status"]) => {
    if (status === "COMPLETED") return <span className="badge-green">COMPLETED</span>;
    if (status === "PENDING")   return <span className="badge-yellow">PENDING</span>;
    return <span className="badge-red">FAILED</span>;
  };

  return (
    <div className="card anim-table" id="history" style={{ padding: "20px 0", overflow: "hidden" }}>
      <div style={{ padding: "0 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: "15px" }}>Live Execution Feed</span>
          <span style={{ marginLeft: "12px", fontSize: "12px", color: "var(--text-muted)" }}>
            Updates in real-time as <code style={{ color: "var(--accent-blue)", fontSize: "11px" }}>SessionTradeExecuted</code> events fire
          </span>
        </div>
        <button
          onClick={() => {
            const csv = ["Sender,Recipient,Amount(USDC),Fiat,Status,Time",
              ...rows.map(r => `${r.sender},${r.recipient},${r.amount},${r.fiatValue} ${r.fiatCur},${r.status},${r.timestamp}`)
            ].join("\n");
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            a.download = "afrifi-executions.csv";
            a.click();
          }}
          style={{
            background: "var(--surface-strong)",
            border: "1px solid var(--card-border)",
            borderRadius: "999px",
            padding: "8px 14px",
            fontSize: "11px",
            color: "var(--text-muted)",
            cursor: "pointer",
            fontFamily: "'IBM Plex Mono', monospace",
            transition: "color 0.2s, border-color 0.2s, transform 0.2s",
          }}
        >
          ↓ Export CSV
        </button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="data-table" role="grid" aria-label="Execution history">
          <thead>
            <tr>
              <th scope="col">Sender</th>
              <th scope="col">Recipient</th>
              <th scope="col">Amount (USDC)</th>
              <th scope="col">Fiat Value</th>
              <th scope="col">Status</th>
              <th scope="col">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tx) => (
              <tr
                key={tx.id}
                className={newRowId === tx.id ? "new-row" : ""}
                onClick={() => onRowClick?.(tx)}
                role="row"
                aria-label={`Transaction ${tx.id}: ${tx.amount} USDC from ${tx.sender}`}
              >
                <td className="mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{tx.sender}</td>
                <td className="mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>{tx.recipient}</td>
                <td className="mono" style={{ fontWeight: 600 }}>${tx.amount.toLocaleString("en-US")}</td>
                <td className="mono" style={{ color: "var(--accent-green)", fontSize: "12px" }}>
                  {tx.fiatValue.toLocaleString("en-US")} {tx.fiatCur}
                </td>
                <td>{statusBadge(tx.status)}</td>
                <td style={{ fontSize: "11px", color: "var(--text-muted)" }}>{tx.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
