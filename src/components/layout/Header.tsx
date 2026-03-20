"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

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
      className={cn(
        "anim-header sticky top-0 z-[100]",
        "flex min-h-[76px] w-full items-center justify-between gap-4",
        "border-b border-[var(--header-border)] bg-[var(--header-bg)]",
        "px-4 py-3 md:px-6",
        "backdrop-blur-xl",
        "shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
      )}
    >
      {/* LOGO */}
      {/* Keep logo sizing controlled by max-height to prevent layout shifts */}
      <Link href="/" className="flex items-center leading-none" style={{ textDecoration: "none" }}>
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
      <nav className="flex flex-1 flex-wrap items-center justify-center gap-1.5 px-2" aria-label="Primary">
        {navLinks.map(({ label, href }) => {
          const baseHref = href.split("#")[0];
          const active = pathname === baseHref || (baseHref === "/dashboard" && href.includes("#") && pathname === "/dashboard");
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full border px-3.5 py-2 text-[13px] font-medium",
                "transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-blue)_30%,transparent)]",
                active
                  ? "border-[var(--card-border)] bg-[var(--surface-strong)] text-[var(--text-primary)] shadow-[0_10px_24px_rgba(37,99,235,0.08)]"
                  : "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-tint)] hover:text-[var(--text-primary)]"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* RIGHT SIDE */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <ThemeToggle />
        {/* Network badge */}
        <div className="network-badge" id="network-badge" style={{ fontSize: "11px" }}>
          <span className="dot" />
          Injective inEVM
        </div>

        {/* Wallet button */}
        <button
          id="connect-wallet-btn"
          type="button"
          onClick={handleConnect}
          disabled={connecting}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2.5",
            "text-xs font-semibold",
            "font-mono",
            "transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--accent-blue)_30%,transparent)]",
            connecting ? "cursor-not-allowed opacity-70" : "cursor-pointer",
            walletAddress
              ? "border-[color-mix(in_srgb,var(--accent-blue)_22%,var(--card-border))] bg-[color-mix(in_srgb,var(--accent-blue)_10%,var(--surface-strong))] text-[var(--accent-green)] shadow-[0_12px_24px_rgba(37,99,235,0.08)]"
              : "border-[var(--card-border)] bg-[var(--surface-strong)] text-[var(--text-primary)] shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
          )}
        >
          {walletAddress ? (
            <>
              <span className="inline-block h-[7px] w-[7px] rounded-full bg-[var(--accent-green)] shadow-[0_0_8px_var(--accent-green)]" />
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
