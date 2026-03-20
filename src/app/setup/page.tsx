import DexSetup from "@/components/dex/Setup";
import Header from "@/components/layout/Header";

export const metadata = {
  title: "AfriFi — Session Setup",
  description: "Set up your ERC-4337 session key for gasless, popup-free trading on Injective inEVM.",
};

export default function SetupPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", fontFamily: "'Geist Sans', sans-serif" }}>
        <DexSetup />
      </main>
    </>
  );
}
