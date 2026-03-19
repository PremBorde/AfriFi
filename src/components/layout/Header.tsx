"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onWalletConnect?: (address: string) => void;
  walletAddress?: string;
}

export default function Header({ onWalletConnect, walletAddress }: HeaderProps) {
  const pathname = usePathname();
  const [connecting, setConnecting] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Send", href: "/dashboard#send" },
    { label: "History", href: "/dashboard#history" },
  ];

  const handleConnect = async () => {
    setConnecting(true);
    // Simulate wallet connection (UI-only)
    await new Promise((r) => setTimeout(r, 800));
    const mockAddress = "0xAf3a9c1B2d4E5F6789abcdef0123456789f1e";
    setConnecting(false);
    onWalletConnect?.(mockAddress);
  };

  const truncate = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header
      className="anim-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        height: "60px",
        background: "rgba(15, 23, 42, 0.4)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {/* LOGO */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "9px" }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "8px",
            background: "linear-gradient(135deg, var(--accent-blue), var(--accent-cyan))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 14px var(--glow-blue)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <path d="M10 6L14 8.5V12.5L10 15L6 12.5V8.5L10 6Z" fill="white" fillOpacity="0.4"/>
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: "17px", color: "var(--text-primary)", letterSpacing: "-0.3px" }}>
          Afri<span style={{ color: "var(--accent-blue)" }}>Fi</span>
        </span>
      </Link>

      {/* NAV */}
      <nav style={{ display: "flex", gap: "4px" }}>
        {navLinks.map(({ label, href }) => {
          const active = pathname === href || (href.includes("#") && pathname === "/dashboard");
          return (
            <Link
              key={label}
              href={href}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                background: active ? "rgba(255,255,255,0.06)" : "transparent",
                textDecoration: "none",
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* RIGHT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Network badge */}
        <div className="network-badge" id="network-badge" style={{ fontSize: "11px" }}>
          <span className="dot" />
          Injective inEVM
        </div>

        {/* Wallet button */}
        <button
          id="connect-wallet-btn"
          onClick={handleConnect}
          disabled={connecting}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            background: walletAddress ? "rgba(16,185,129,0.1)" : "var(--bg-deep)",
            border: `1px solid ${walletAddress ? "rgba(16,185,129,0.4)" : "var(--border-light)"}`,
            borderRadius: "8px",
            padding: "7px 14px",
            fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 500,
            color: walletAddress ? "var(--accent-green)" : "var(--text-primary)",
            cursor: connecting ? "not-allowed" : "pointer",
            transition: "all 0.25s",
          }}
        >
          {walletAddress ? (
            <>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-green)", boxShadow: "0 0 8px var(--accent-green)", display: "inline-block" }} />
              {truncate(walletAddress)}
            </>
          ) : connecting ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
              Connecting...
            </>
          ) : (
            "Connect Wallet"
          )}
        </button>
      </div>
    </header>
  );
}
