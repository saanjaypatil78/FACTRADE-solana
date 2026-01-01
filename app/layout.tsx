import type { Metadata } from "next";
import "./globals.css";
import { SolanaProvider } from "./components/SolanaProvider";

export const metadata: Metadata = {
  title: "FACTRADE - Solana DeFi Platform",
  description: "Earn passive income through staking, rewards, and governance on Solana blockchain",
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  openGraph: {
    title: 'FACTRADE - Solana DeFi Platform',
    description: 'Earn passive income through staking, rewards, and governance on Solana blockchain',
    siteName: 'FACTRADE',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FACTRADE - Solana DeFi Platform',
    description: 'Earn passive income through staking, rewards, and governance on Solana blockchain',
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
      </body>
    </html>
  );
}
