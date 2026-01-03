'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Transaction } from '@solana/web3.js';
import { createClaimRewardsInstruction, createCompoundRewardsInstruction } from '../utils/program-integration';

interface RewardsData {
  pendingRewards: string;
  claimedRewards: string;
  currentAPY: string;
  nextCompound: string;
}

export function RewardsInterface() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isClaiming, setIsClaiming] = useState(false);
  const [isCompounding, setIsCompounding] = useState(false);
  const [rewardsData, setRewardsData] = useState<RewardsData>({
    pendingRewards: '0',
    claimedRewards: '0',
    currentAPY: '15.5',
    nextCompound: 'N/A',
  });

  const handleClaimRewards = async () => {
    if (!publicKey || !connection) return;
    
    setIsClaiming(true);
    try {
      const instruction = await createClaimRewardsInstruction(publicKey);

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      alert('Rewards claimed successfully!');
    } catch (error) {
      console.error('Claim error:', error);
      alert('Claim failed. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleCompound = async () => {
    if (!publicKey || !connection) return;
    
    setIsCompounding(true);
    try {
      const instruction = await createCompoundRewardsInstruction(publicKey);

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      alert('Rewards compounded successfully!');
    } catch (error) {
      console.error('Compound error:', error);
      alert('Compound failed. Please try again.');
    } finally {
      setIsCompounding(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Rewards Overview */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-8 border border-green-200 dark:border-green-800">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Rewards Dashboard
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Track and claim your staking rewards. Auto-compound for maximum returns!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Pending Rewards</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
              {publicKey ? `${rewardsData.pendingRewards} FACT` : '—'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              ≈ $0.00 USD
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Total Claimed</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {publicKey ? `${rewardsData.claimedRewards} FACT` : '—'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              Lifetime earnings
            </p>
          </div>
        </div>
      </div>

      {/* APY & Stats */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
          Current APY Statistics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Current APY</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {rewardsData.currentAPY}%
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Dynamic based on TVL
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Base APY</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              12%
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              Minimum guaranteed
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Max APY</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              25%
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
              At low TVL
            </p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Dynamic APY Mechanism
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                The APY automatically adjusts based on Total Value Locked (TVL). Lower TVL = Higher APY to attract stakers. Higher TVL = Lower APY for sustainability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Claim & Compound Actions */}
      {publicKey ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
            Actions
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h4 className="text-lg font-bold text-black dark:text-white mb-2">
                Claim Rewards
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Withdraw your pending rewards to your wallet
              </p>
              <button
                onClick={handleClaimRewards}
                disabled={isClaiming || rewardsData.pendingRewards === '0'}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClaiming ? 'Claiming...' : 'Claim Rewards'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <h4 className="text-lg font-bold text-black dark:text-white mb-2">
                Auto-Compound
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                Reinvest rewards automatically for compound growth
              </p>
              <button
                onClick={handleCompound}
                disabled={isCompounding || rewardsData.pendingRewards === '0'}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompounding ? 'Compounding...' : 'Compound Now'}
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Compounding Tip
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                  Compounding reinvests your rewards back into staking, maximizing your returns through compound interest. This is more profitable than claiming in most cases!
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-zinc-400 dark:text-zinc-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              Connect your wallet to view and claim rewards
            </p>
          </div>
        </div>
      )}

      {/* Rewards History */}
      {publicKey && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
            Rewards History
          </h3>
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            No reward history yet. Start staking to earn rewards!
          </div>
        </div>
      )}
    </div>
  );
}
