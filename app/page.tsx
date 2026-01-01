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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950 animate-gradient">
      {/* Header with enhanced interactivity */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300 hover:shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center scale-hover transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 cursor-pointer">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div className="cursor-pointer">
                <h1 className="text-2xl font-bold text-black dark:text-white transition-all duration-300 group-hover:text-gradient-animate">
                  FACTRADE
                </h1>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 transition-all duration-300 group-hover:text-purple-600">
                  Solana Token Platform
                </p>
              </div>
            </div>
            <div className="scale-hover">
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with floating animation */}
        <div className="text-center mb-12 float-animation">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-animate bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Earn Passive Income with FACTRADE
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto transition-all duration-300 hover:text-zinc-800 dark:hover:text-zinc-200">
            Stake your FACT tokens, earn dynamic APY rewards, and participate in governance.
            Your complete DeFi platform on Solana.
          </p>
        </div>

        {/* Navigation Tabs with enhanced hover effects */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 overflow-hidden group ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl scale-105 glow-hover'
                    : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 hover:scale-105'
                }`}
              >
                {/* Ripple effect overlay */}
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
                
                <span className="text-xl transform transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12">
                  {tab.icon}
                </span>
                <span className="relative z-10">{tab.name}</span>
                
                {/* Active indicator */}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full transform scale-x-100 transition-transform duration-300"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content with smooth transitions */}
        <div className="mt-8 transition-all duration-500 ease-in-out">
          <div className={`transition-opacity duration-300 ${activeTab === 'overview' ? 'opacity-100' : 'hidden opacity-0'}`}>
            <TokenInfo />
          </div>
          <div className={`transition-opacity duration-300 ${activeTab === 'stake' ? 'opacity-100' : 'hidden opacity-0'}`}>
            <StakingInterface />
          </div>
          <div className={`transition-opacity duration-300 ${activeTab === 'rewards' ? 'opacity-100' : 'hidden opacity-0'}`}>
            <RewardsInterface />
          </div>
          <div className={`transition-opacity duration-300 ${activeTab === 'governance' ? 'opacity-100' : 'hidden opacity-0'}`}>
            <GovernanceInterface />
          </div>
        </div>
      </main>

      {/* Footer with hover effects */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-20 transition-all duration-300 hover:border-purple-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            <p className="transition-all duration-300 hover:text-purple-600 cursor-default">
              © {new Date().getFullYear()} FACTRADE. Built on Solana.
            </p>
            <p className="mt-2 transition-all duration-300 hover:text-zinc-800 dark:hover:text-zinc-200">
              Connect your wallet to view token details and interact with the platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
