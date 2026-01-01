'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletConnectButton() {
  return (
    <div className="flex items-center justify-center group">
      <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !transition-all !duration-300 hover:!scale-105 hover:!shadow-xl !rounded-lg ripple-effect" />
      <style jsx global>{`
        .wallet-adapter-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .wallet-adapter-button:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 10px 25px rgba(147, 51, 234, 0.4) !important;
        }
        .wallet-adapter-button:active {
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
}
