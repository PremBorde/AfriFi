"use client";
import { useEffect, useRef, useState } from "react";

interface MetricCardProps {
  icon: string;
  label: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  sub?: string;
  animIndex?: number; // 1-4 for stagger class
}

// Fix 1: easeOutQuart curve for countUp
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function fmt(value: number, prefix = "", suffix = ""): string {
  if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(2)}M${suffix}`;
  if (value >= 1_000) return `${prefix}${value.toLocaleString("en-US")}${suffix}`;
  return `${prefix}${value.toLocaleString("en-US")}${suffix}`;
}

export function useCountUp(
  target: number,
  duration = 1200,
  trigger = true
): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;
    startRef.current = null;
    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      setCurrent(Math.round(easedProgress * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, trigger]);

  return current;
}

export default function MetricCard({
  icon,
  label,
  value,
  prefix = "",
  suffix = "",
  sub,
  animIndex = 1,
}: MetricCardProps) {
  const isNumeric = typeof value === "number";
  const counted = useCountUp(isNumeric ? (value as number) : 0);
  const displayValue = isNumeric ? fmt(counted, prefix, suffix) : value;

  return (
    <div
      className={`card anim-metric-${animIndex}`}
      style={{
        padding: "12px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        flex: 1,
        minWidth: "160px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "16px" }}>{icon}</span>
        {sub && (
          <span
            style={{
              fontSize: "9px",
              color: "var(--accent-green)",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              background: "rgba(16,185,129,0.1)",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            {sub}
          </span>
        )}
      </div>
      <div>
        <div
          className="mono"
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.1,
            letterSpacing: "-0.5px",
          }}
        >
          {displayValue}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", fontWeight: 500 }}>
          {label}
        </div>
      </div>
    </div>
  );
}
