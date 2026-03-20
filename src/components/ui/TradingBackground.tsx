"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/layout/ThemeContext";

type Candle = {
  x: number;
  open: number;
  close: number;
  high: number;
  low: number;
  speed: number;
  opacity: number;
};

const COLS = 40;
const CANDLE_W = 8;
const GAP = 22;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makeCandle(x: number, baseY: number): Candle {
  const open = baseY + randomBetween(-18, 18);
  const close = open + randomBetween(-22, 22);
  const top = Math.min(open, close);
  const bottom = Math.max(open, close);
  return {
    x,
    open,
    close,
    high: top - randomBetween(4, 14),
    low: bottom + randomBetween(4, 14),
    speed: randomBetween(0.05, 0.15),
    opacity: randomBetween(0.025, 0.06),
  };
}

export default function TradingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const pathname = usePathname();
  const effectiveTheme = pathname === "/" ? "dark" : theme;

  useEffect(() => {
    // Accessibility/perf: if the user prefers reduced motion, don't animate.
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let candles: Candle[] = [];
    let offset = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const baseY = canvas.height / 2;
      candles = Array.from({ length: COLS }, (_, i) =>
        makeCandle(i * (CANDLE_W + GAP), baseY)
      );
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      offset += 0.25;

      candles.forEach((c, i) => {
        const x = (c.x + offset) % (canvas.width + CANDLE_W + GAP) - CANDLE_W;
        const isBull = c.close < c.open; // close lower = going up visually
        const color = isBull
          ? effectiveTheme === "light" ? "#10B981" : "#10B981"
          : effectiveTheme === "light" ? "#F97316" : "#F43F5E";
        const alphaScale = effectiveTheme === "light" ? 0.6 : 1;

        ctx.globalAlpha = c.opacity * alphaScale;

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + CANDLE_W / 2, c.high);
        ctx.lineTo(x + CANDLE_W / 2, c.low);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const top = Math.min(c.open, c.close);
        const bodyH = Math.abs(c.open - c.close) || 2;
        ctx.fillRect(x, top, CANDLE_W, bodyH);

        // Slowly drift candle price
        c.open += (Math.sin(Date.now() * 0.0005 + i) * c.speed);
        c.close += (Math.cos(Date.now() * 0.0005 + i * 1.3) * c.speed);
        const newTop = Math.min(c.open, c.close);
        const newBot = Math.max(c.open, c.close);
        c.high = newTop - randomBetween(3, 5) * 0.1 + c.high * 0.9;
        c.low = newBot + randomBetween(3, 5) * 0.1 + c.low * 0.1;

        // Keep within viewport vertically
        const mid = canvas.height / 2;
        if (c.open > mid + 120 || c.open < mid - 120) {
          c.open += (mid - c.open) * 0.01;
          c.close += (mid - c.close) * 0.01;
        }
      });

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [effectiveTheme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
