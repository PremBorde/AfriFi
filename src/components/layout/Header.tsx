"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onWalletConnect?: (address: string) => void;
  walletAddress?: string;
}

export default function Header({ onWalletConnect, walletAddress }: HeaderProps) {
  const pathname = usePathname();
  const [connecting, setConnecting] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Setup",     href: "/setup" },
    { label: "Terminal",  href: "/trade" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "History",   href: "/dashboard#history" },
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
        gap: "18px",
        padding: "12px 24px",
        minHeight: "76px",
        background: "var(--header-bg)",
        borderBottom: "1px solid var(--header-border)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      {/* LOGO */}
      <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", lineHeight: 0 }}>
        <Image
          src="/instainject-logo.png"
          alt="InstaInject"
          width={675}
          height={361}
          priority
          unoptimized
          quality={100}
          sizes="(max-width: 640px) 64px, 80px"
          style={{ display: "block", maxHeight: 48, width: "auto", height: "auto", objectFit: "contain" }}
        />
      </Link>

      {/* NAV */}
      <nav style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center", flex: 1 }}>
        {navLinks.map(({ label, href }) => {
          const baseHref = href.split("#")[0];
          const active = pathname === baseHref || (baseHref === "/dashboard" && href.includes("#") && pathname === "/dashboard");
          return (
            <Link
              key={label}
              href={href}
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: active ? 600 : 500,
                color: active ? "var(--text-primary)" : "var(--text-muted)",
                background: active ? "var(--surface-strong)" : "transparent",
                border: `1px solid ${active ? "var(--card-border)" : "transparent"}`,
                boxShadow: active ? "0 10px 24px rgba(37, 99, 235, 0.08)" : "none",
                textDecoration: "none",
                transition: "background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s",
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* RIGHT SIDE */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", justifyContent: "flex-end" }}>
        <ThemeToggle />
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
            background: walletAddress ? "color-mix(in srgb, var(--accent-blue) 10%, var(--surface-strong))" : "var(--surface-strong)",
            border: `1px solid ${walletAddress ? "color-mix(in srgb, var(--accent-blue) 22%, var(--card-border))" : "var(--card-border)"}`,
            borderRadius: "999px",
            padding: "9px 16px",
            fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            color: walletAddress ? "var(--accent-green)" : "var(--text-primary)",
            cursor: connecting ? "not-allowed" : "pointer",
            transition: "all 0.25s",
            boxShadow: walletAddress ? "0 12px 24px rgba(37, 99, 235, 0.08)" : "0 8px 18px rgba(15, 23, 42, 0.05)",
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
              Creating Session...
            </>
          ) : (
            "Create Session"
          )}
        </button>
      </div>
    </header>
  );
}
