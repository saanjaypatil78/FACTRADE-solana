'use client';

import { useState } from 'react';
import { WalletConnectButton } from "./components/WalletConnectButton";
import { TokenInfo } from "./components/TokenInfo";
import { StakingInterface } from "./components/StakingInterface";
import { RewardsInterface } from "./components/RewardsInterface";
import { GovernanceInterface } from "./components/GovernanceInterface";

type Tab = 'overview' | 'stake' | 'rewards' | 'governance';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview' as Tab, name: 'Overview', icon: '📊' },
    { id: 'stake' as Tab, name: 'Stake', icon: '🔒' },
    { id: 'rewards' as Tab, name: 'Rewards', icon: '💰' },
    { id: 'governance' as Tab, name: 'Governance', icon: '🗳️' },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  FACTRADE
                </h1>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Solana Token Platform
                </p>
              </div>
            </div>
            <WalletConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Earn Passive Income with FACTRADE
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Stake your FACT tokens, earn dynamic APY rewards, and participate in governance.
            Your complete DeFi platform on Solana.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'overview' && <TokenInfo />}
          {activeTab === 'stake' && <StakingInterface />}
          {activeTab === 'rewards' && <RewardsInterface />}
          {activeTab === 'governance' && <GovernanceInterface />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p>© {new Date().getFullYear()} FACTRADE. Built on Solana.</p>
            <p className="mt-2">
              Connect your wallet to view token details and interact with the platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
