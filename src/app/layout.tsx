import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AfriFi — Cross-Border Remittances on Injective inEVM",
  description:
    "Send stablecoins across Africa instantly with near-zero fees. Powered by Injective inEVM — the world's fastest financial blockchain.",
  keywords: ["AfriFi", "remittance", "Injective", "inEVM", "stablecoin", "USDC", "Africa", "crypto"],
  openGraph: {
    title: "AfriFi — Cross-Border Remittances",
    description: "Near-zero fee, instant cross-border payments on Injective inEVM",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`} style={{ background: "var(--bg-deep)", color: "var(--text-primary)" }}>
        {children}
      </body>
    </html>
  );
}
