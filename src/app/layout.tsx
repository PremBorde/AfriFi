import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TradingBackground from "@/components/ui/TradingBackground";
import { ThemeProvider } from "@/components/layout/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AfriFi — 1-Click Trading Terminal on Injective inEVM",
  description:
    "Gasless, popup-free trading on Injective inEVM using ERC-4337 smart accounts, paymasters, and on-chain session keys enforced in Solidity.",
  keywords: ["AfriFi", "ERC-4337", "account abstraction", "Injective", "inEVM", "session keys", "paymaster", "gasless trading"],
  openGraph: {
    title: "AfriFi — 1-Click Trading Terminal",
    description: "Popup-free, gasless trading on Injective inEVM with ERC-4337 session keys",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} style={{ background: "var(--bg-deep)", color: "var(--text-primary)" }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var isHome = false;
                  try {
                    isHome = window.location && window.location.pathname === '/';
                  } catch (e) {}

                  var stored = localStorage.getItem('theme');
                  var next = isHome ? 'dark' : (stored === 'dark' ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', next);
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <TradingBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
