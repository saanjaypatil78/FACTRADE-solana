'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import { PublicKey } from '@solana/web3.js';

type LockPeriod = '7' | '14' | '30';

interface StakingStats {
  totalStaked: string;
  myStaked: string;
  apr: string;
  lockPeriod: LockPeriod;
}

export function StakingInterface() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<LockPeriod>('7');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);

  const lockPeriods = [
    { days: '7', apr: '5%', multiplier: '1x', unbonding: '7 days' },
    { days: '14', apr: '10%', multiplier: '1.5x', unbonding: '14 days' },
    { days: '30', apr: '20%', multiplier: '2x', unbonding: '30 days' },
  ];

  const handleStake = async () => {
    if (!publicKey || !amount) return;
    
    setIsStaking(true);
    try {
      // TODO: Implement actual staking transaction
      console.log(`Staking ${amount} FACT for ${selectedPeriod} days`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      alert(`Successfully staked ${amount} FACT for ${selectedPeriod} days!`);
      setAmount('');
    } catch (error) {
      console.error('Staking error:', error);
      alert('Staking failed. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!publicKey) return;
    
    setIsUnstaking(true);
    try {
      // TODO: Implement actual unstaking transaction
      console.log('Initiating unstake...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      alert('Unstake initiated! Your tokens will be available after the unbonding period.');
    } catch (error) {
      console.error('Unstaking error:', error);
      alert('Unstaking failed. Please try again.');
    } finally {
      setIsUnstaking(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Staking Overview */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Stake & Earn
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Lock your FACT tokens to earn passive rewards. Longer lock periods = Higher APR!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Value Locked</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              456.7M FACT
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Your Staked</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {publicKey ? '0 FACT' : '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Stakers</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              12,485
            </p>
          </div>
        </div>
      </div>

      {/* Staking Options */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
          Choose Lock Period
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {lockPeriods.map((period) => (
            <button
              key={period.days}
              onClick={() => setSelectedPeriod(period.days as LockPeriod)}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedPeriod === period.days
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-400'
              }`}
            >
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {period.days}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Days Lock</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">APR:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{period.apr}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Multiplier:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{period.multiplier}</span>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                    Unbonding: {period.unbonding}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Stake Form */}
        {publicKey ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Amount to Stake
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
                <span className="absolute right-4 top-3 text-zinc-600 dark:text-zinc-400 font-medium">
                  FACT
                </span>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-500 mt-2">
                Available: 0 FACT
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStake}
                disabled={!amount || isStaking}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStaking ? 'Staking...' : `Stake for ${selectedPeriod} Days`}
              </button>
              <button
                onClick={handleUnstake}
                disabled={isUnstaking}
                className="flex-1 bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white font-bold py-3 px-6 rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnstaking ? 'Processing...' : 'Unstake'}
              </button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Note:</strong> After unstaking, your tokens will be locked for the unbonding period ({
                  lockPeriods.find(p => p.days === selectedPeriod)?.unbonding
                }). You can withdraw them once the period ends.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-zinc-600 dark:text-zinc-400">
              Connect your wallet to start staking
            </p>
          </div>
        )}
      </div>

      {/* Your Stakes */}
      {publicKey && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
            Your Active Stakes
          </h3>
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            No active stakes yet. Start staking to earn rewards!
          </div>
        </div>
      )}
    </div>
  );
}
