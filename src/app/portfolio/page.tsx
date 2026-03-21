"use client";
import DexPortfolio from "@/components/dex-pages/Portfolio";
import Header from "@/components/layout/Header";

export default function PortfolioPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-6 py-8">
        <DexPortfolio />
      </main>
    </>
  );
}
