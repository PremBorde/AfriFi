"use client";
import { useRef, useState } from "react";

interface Props {
  oracleRate?: number; // 1 USDC = X NGN
  onSendSuccess?: (txHash: string) => void;
  onNewTransaction?: () => void;
}

// Fix 6: Particle burst helper
function burstParticles(buttonEl: HTMLElement) {
  const wrapper = buttonEl.closest(".send-card-wrapper") as HTMLElement;
  if (!wrapper) return;

  const btnRect = buttonEl.getBoundingClientRect();
  const wrapRect = wrapper.getBoundingClientRect();
  const cx = btnRect.left - wrapRect.left + btnRect.width / 2;
  const cy = btnRect.top  - wrapRect.top  + btnRect.height / 2;

  for (let i = 0; i < 16; i++) {
    const angle    = (i / 16) * 360;
    const distance = 40 + Math.random() * 40; // 40–80px
    const tx = Math.cos((angle * Math.PI) / 180) * distance;
    const ty = Math.sin((angle * Math.PI) / 180) * distance;
    const color = i % 2 === 0 ? "#10B981" : "#0EA5E9";

    const p = document.createElement("div");
    p.style.cssText = `
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${color};
      box-shadow: 0 0 6px ${color};
      left: ${cx - 3}px;
      top:  ${cy - 3}px;
      pointer-events: none;
      z-index: 50;
      transition: none;
      --tx: ${tx}px;
      --ty: ${ty}px;
      animation: particleBurst 0.6s ease-out forwards;
    `;
    wrapper.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

export default function SendForm({ oracleRate = 1455, onSendSuccess, onNewTransaction }: Props) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount]       = useState("");
  const [status, setStatus]       = useState<"idle" | "pending" | "confirmed" | "error">("idle");
  const [txHash, setTxHash]       = useState("");
  const [error, setError]         = useState("");
  const btnRef = useRef<HTMLButtonElement>(null);

  const fiatValue = amount ? (parseFloat(amount) * oracleRate).toLocaleString("en-US") : "—";

  const isValidAddress = (addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr);
  const isValidAmount  = (amt: string) => parseFloat(amt) > 0;

  const handleSend = async () => {
    setError("");
    if (!isValidAddress(recipient)) {
      setError("Invalid Ethereum address format.");
      return;
    }
    if (!isValidAmount(amount)) {
      setError("Please enter a valid USDC amount.");
      return;
    }

    setStatus("pending");
    // Simulate blockchain confirmation (UI-only)
    await new Promise((r) => setTimeout(r, 1400));

    const mockHash = `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`;
    setTxHash(mockHash);
    setStatus("confirmed");

    // Fix 6: Particle burst
    if (btnRef.current) burstParticles(btnRef.current);

    onSendSuccess?.(mockHash);
    onNewTransaction?.();

    // Reset after 3 seconds
    setTimeout(() => {
      setStatus("idle");
      setRecipient("");
      setAmount("");
      setTxHash("");
    }, 4000);
  };

  return (
    <div className="send-card-wrapper relative">
      <div
        className="card relative z-10 transition-all duration-500 ease-out"
        id="send"
        style={{ 
          padding: "24px", 
          maxWidth: "500px",
          ...(status === "confirmed" ? {
            boxShadow: "0 0 40px rgba(16, 185, 129, 0.3), inset 0 0 20px rgba(16, 185, 129, 0.1)",
            borderColor: "rgba(16, 185, 129, 0.5)",
          } : {})
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontWeight: 700, fontSize: "17px", marginBottom: "4px" }}>1-Click Action Demo</h2>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            Session-protected execution · Injective inEVM
          </div>
        </div>

        {/* Recipient */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Target Address
          </label>
          <input
            className="input-field"
            type="text"
            placeholder="0x..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={status === "pending"}
            aria-label="Recipient wallet address"
          />
        </div>

        {/* Amount */}
        <div style={{ marginBottom: "8px" }}>
          <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Amount (USDC)
          </label>
          <div style={{ position: "relative" }}>
            <input
              className="input-field"
              type="number"
              placeholder="0.00"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={status === "pending"}
              style={{ paddingRight: "60px" }}
              aria-label="Amount in USDC"
            />
            <span style={{
              position: "absolute", right: "14px", top: "50%",
              transform: "translateY(-50%)", fontSize: "12px",
              color: "var(--accent-blue)", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600,
            }}>USDC</span>
          </div>
        </div>

        {/* Fiat preview */}
        <div
          style={{
            background: "var(--bg-deep)",
            border: "1px solid var(--border-light)",
            borderRadius: "8px",
            padding: "12px 14px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Quoted output</span>
          <span className="mono" style={{ fontSize: "15px", fontWeight: 700, color: amount ? "var(--accent-green)" : "var(--text-muted)" }}>
            ≈ {fiatValue} NGN
          </span>
        </div>

        {/* Fee breakdown */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "var(--text-muted)",
            marginBottom: "20px",
            padding: "0 2px",
          }}
        >
          <span>Gas fee via ERC-4337 paymaster</span>
          <span className="mono" style={{ color: "var(--accent-green)", fontWeight: 700 }}>Sponsored</span>
        </div>

        {/* Oracle rate label */}
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px", fontFamily: "'IBM Plex Mono', monospace" }}>
          Oracle Rate: 1 USDC = {oracleRate.toLocaleString("en-US")} NGN
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "var(--accent-red)", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* CTA Button */}
        <button
          ref={btnRef}
          className="btn-primary"
          onClick={handleSend}
          disabled={status === "pending"}
          style={{
            width: "100%",
            fontSize: "15px",
            padding: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: status === "confirmed"
              ? "linear-gradient(135deg, var(--accent-green), #059669)"
              : undefined,
          }}
          aria-label="Execute demo trade"
        >
          {status === "pending"   && <><span className="spinner" /> Executing on Injective...</>}
          {status === "confirmed" && <>✓ Trade Sent — {txHash.slice(0, 12)}...</>}
          {status === "error"     && "Failed — Try Again"}
          {status === "idle"      && "Execute Demo Trade →"}
        </button>

        {/* Success tx hash */}
        {status === "confirmed" && (
          <div style={{ marginTop: "12px", fontSize: "11px", color: "var(--text-muted)", fontFamily: "'IBM Plex Mono', monospace", textAlign: "center" }}>
            <span style={{ color: "var(--accent-green)" }}>✓</span>{" "}
            Execution: <strong style={{ color: "var(--text-primary)" }}>&lt; 1s</strong> ·{" "}
            <a href={`https://inevm.explorer.injective.network/tx/${txHash}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "none" }}>
              View on Explorer ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
