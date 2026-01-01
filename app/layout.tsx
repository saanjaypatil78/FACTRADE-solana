import type { Metadata } from "next";
import "./globals.css";
import { SolanaProvider } from "./components/SolanaProvider";

export const metadata: Metadata = {
  title: "FACTRADE - Solana Token Platform",
  description: "Decentralized Trading Platform powered by Solana",
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
