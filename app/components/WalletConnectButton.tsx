'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletConnectButton() {
  return (
    <div className="flex items-center justify-center">
      <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 transition-colors" />
    </div>
  );
}
