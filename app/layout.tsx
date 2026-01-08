import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { SolanaProvider } from "./components/SolanaProvider";

export const metadata: Metadata = {
  title: "FACTRADE - Solana DeFi Platform",
  description: "Earn passive income through staking, rewards, and governance on Solana blockchain with FACTRADE token",
  metadataBase: new URL('https://factrade-solana.vercel.app'),
  applicationName: 'FACTRADE',
  authors: [{ name: 'FACTRADE Team' }],
  keywords: ['Solana', 'DeFi', 'FACTRADE', 'FACT token', 'Staking', 'Rewards', 'Governance', 'Passive Income', 'Cryptocurrency'],
  openGraph: {
    title: 'FACTRADE - Solana DeFi Platform',
    description: 'Earn passive income through staking, rewards, and governance on Solana blockchain with FACTRADE token',
    siteName: 'FACTRADE',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FACTRADE - Solana DeFi Platform',
    description: 'Earn passive income through staking, rewards, and governance on Solana blockchain with FACTRADE token',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SolanaProvider>
          {children}
        </SolanaProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
