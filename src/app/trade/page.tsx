"use client";
import DexTerminal from "@/components/dex/Terminal";
import Header from "@/components/layout/Header";

export default function TradePage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", fontFamily: "'Geist Sans', sans-serif" }}>
        <DexTerminal />
      </main>
    </>
  );
}
