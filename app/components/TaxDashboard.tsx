'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { fetchTaxStats, TaxStats } from '../utils/program-integration';
import { useAccountSync } from '../utils/blockchain-sync';
import { PublicKey } from '@solana/web3.js';
import { PROGRAM_IDS } from '../utils/program-integration';

export function TaxDashboard() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [taxStats, setTaxStats] = useState<TaxStats>({
    totalCollected: 0,
    totalBurned: 0,
    marketingAllocation: 0,
    treasuryAllocation: 0,
    holderRewardsAllocation: 0,
  });
  const [loading, setLoading] = useState(true);

  // Auto-sync with blockchain
  useEffect(() => {
    const loadTaxStats = async () => {
      if (connection) {
        setLoading(true);
        const stats = await fetchTaxStats(connection);
        setTaxStats(stats);
        setLoading(false);
      }
    };

    loadTaxStats();
  }, [connection]);

  // Real-time sync using blockchain-sync
  useAccountSync(
    connection,
    publicKey ? PROGRAM_IDS.TAX_DISTRIBUTION : null,
    async () => {
      if (connection) {
        const stats = await fetchTaxStats(connection);
        setTaxStats(stats);
      }
    },
    { interval: 1000, enabled: !!connection }
  );

  const formatAmount = (amount: number) => {
    return (amount / 1e9).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const taxDistributionData = [
    {
      name: 'Marketing',
      percentage: 25,
      amount: taxStats.marketingAllocation,
      color: 'from-blue-500 to-blue-600',
      icon: '📢',
    },
    {
      name: 'Treasury',
      percentage: 25,
      amount: taxStats.treasuryAllocation,
      color: 'from-purple-500 to-purple-600',
      icon: '🏛️',
    },
    {
      name: 'Burn',
      percentage: 25,
      amount: taxStats.totalBurned,
      color: 'from-orange-500 to-red-600',
      icon: '🔥',
    },
    {
      name: 'Holder Rewards',
      percentage: 25,
      amount: taxStats.holderRewardsAllocation,
      color: 'from-green-500 to-emerald-600',
      icon: '💎',
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Tax Overview Header */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-8 border border-orange-200 dark:border-orange-800">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Tax Distribution Dashboard
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Real-time tracking of transaction taxes and their distribution across the ecosystem.
          All transactions are taxed (2% buy/sell, 1% transfer) and automatically distributed.
        </p>

        {/* Total Collected Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Tax Collected</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {loading ? '...' : `${formatAmount(taxStats.totalCollected)} FACT`}
            </p>
            <p className="text-xs text-zinc-500">
              From all buy, sell, and transfer transactions
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Burned</p>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400 mb-1">
              {loading ? '...' : `${formatAmount(taxStats.totalBurned)} FACT`}
            </p>
            <p className="text-xs text-zinc-500">
              Permanently removed from circulation
            </p>
          </div>
        </div>
      </div>

      {/* Tax Distribution Breakdown */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
          Distribution Breakdown (25% each)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {taxDistributionData.map((item) => (
            <div
              key={item.name}
              className={`bg-gradient-to-br ${item.color} rounded-xl p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-2xl font-bold">{item.percentage}%</span>
              </div>
              <p className="text-sm opacity-90 mb-2">{item.name}</p>
              <p className="text-2xl font-bold">
                {loading ? '...' : formatAmount(item.amount)}
              </p>
              <p className="text-xs opacity-75 mt-1">FACT</p>
            </div>
          ))}
        </div>

        {/* Tax Information */}
        <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
          <h4 className="text-lg font-bold mb-4 text-black dark:text-white flex items-center gap-2">
            <span>📊</span>
            Tax Structure
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Buy Tax</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">2%</p>
              <p className="text-xs text-zinc-500 mt-1">200 basis points</p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Sell Tax</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">2%</p>
              <p className="text-xs text-zinc-500 mt-1">200 basis points</p>
            </div>
            
            <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">Transfer Tax</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">1%</p>
              <p className="text-xs text-zinc-500 mt-1">100 basis points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Impact & Benefits */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
          Ecosystem Impact
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📢</span>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-1">Marketing Growth</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  25% funds platform marketing, community growth, and partnerships to expand the ecosystem.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🏛️</span>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-1">Treasury Reserve</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  25% allocated to treasury for development, operations, and long-term sustainability.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-1">Deflationary Burn</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  25% permanently burned to reduce supply, creating scarcity and potential value appreciation.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">💎</span>
              </div>
              <div>
                <h4 className="font-semibold text-black dark:text-white mb-1">Holder Rewards</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  25% distributed to token holders proportionally, rewarding long-term supporters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
