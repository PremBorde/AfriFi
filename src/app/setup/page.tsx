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
      <main className="mx-auto w-full max-w-[1100px] px-6 py-8">
        <DexSetup />
      </main>
    </>
  );
}
