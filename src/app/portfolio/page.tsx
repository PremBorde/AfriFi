"use client";
import DexPortfolio from "@/components/dex/Portfolio";
import Header from "@/components/layout/Header";

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", fontFamily: "'Geist Sans', sans-serif" }}>
        <DexPortfolio />
      </main>
    </>
  );
}
