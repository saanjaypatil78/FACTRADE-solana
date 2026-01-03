'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { 
  fetchReferralStats, 
  ReferralStats, 
  createRegisterReferralInstruction,
  createClaimReferralEarningsInstruction,
  sendAndConfirmTransactionWithRetry,
} from '../utils/program-integration';
import { useAccountSync } from '../utils/blockchain-sync';
import { PublicKey, Transaction } from '@solana/web3.js';

export function ReferralDashboard() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [referralStats, setReferralStats] = useState<ReferralStats>({
    totalEarned: 0,
    level1Earnings: 0,
    level2Earnings: 0,
    level3Earnings: 0,
    level4Earnings: 0,
    level5Earnings: 0,
    totalReferrals: 0,
    directReferrals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [referrerAddress, setReferrerAddress] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Auto-sync with blockchain
  useEffect(() => {
    const loadReferralStats = async () => {
      if (connection && publicKey) {
        setLoading(true);
        const stats = await fetchReferralStats(connection, publicKey);
        setReferralStats(stats);
        setLoading(false);
      }
    };

    loadReferralStats();
  }, [connection, publicKey]);

  // Real-time sync using blockchain-sync
  useAccountSync(
    connection,
    publicKey,
    async () => {
      if (connection && publicKey) {
        const stats = await fetchReferralStats(connection, publicKey);
        setReferralStats(stats);
      }
    },
    { interval: 1000, enabled: !!connection && !!publicKey }
  );

  const handleRegisterReferrer = async () => {
    if (!publicKey || !connection || !referrerAddress) {
      alert('Please connect wallet and enter referrer address');
      return;
    }

    setIsRegistering(true);
    try {
      const referrerPubkey = new PublicKey(referrerAddress);
      const instruction = await createRegisterReferralInstruction(publicKey, referrerPubkey);
      
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      alert('Successfully registered with referrer!');
      setReferrerAddress('');
      
      // Reload stats
      const stats = await fetchReferralStats(connection, publicKey);
      setReferralStats(stats);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please check the referrer address and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleClaimEarnings = async () => {
    if (!publicKey || !connection) return;

    setIsClaiming(true);
    try {
      const instruction = await createClaimReferralEarningsInstruction(publicKey);
      
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      alert('Successfully claimed referral earnings!');
      
      // Reload stats
      const stats = await fetchReferralStats(connection, publicKey);
      setReferralStats(stats);
    } catch (error) {
      console.error('Claim error:', error);
      alert('Claim failed. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatAmount = (amount: number) => {
    return (amount / 1e9).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const levelData = [
    {
      level: 1,
      name: 'Level 1',
      percentage: 40,
      earnings: referralStats.level1Earnings,
      color: 'from-purple-500 to-purple-600',
      icon: '👥',
      description: 'Direct referrals',
    },
    {
      level: 2,
      name: 'Level 2',
      percentage: 20,
      earnings: referralStats.level2Earnings,
      color: 'from-blue-500 to-blue-600',
      icon: '🤝',
      description: 'Second-tier referrals',
    },
    {
      level: 3,
      name: 'Level 3',
      percentage: 15,
      earnings: referralStats.level3Earnings,
      color: 'from-green-500 to-green-600',
      icon: '🌟',
      description: 'Third-tier referrals',
    },
    {
      level: 4,
      name: 'Level 4',
      percentage: 15,
      earnings: referralStats.level4Earnings,
      color: 'from-yellow-500 to-orange-600',
      icon: '✨',
      description: 'Fourth-tier referrals',
    },
    {
      level: 5,
      name: 'Level 5',
      percentage: 10,
      earnings: referralStats.level5Earnings,
      color: 'from-pink-500 to-red-600',
      icon: '💫',
      description: 'Fifth-tier referrals',
    },
  ];

  const referralLink = publicKey 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/ref/${publicKey.toBase58()}`
    : '';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Referral Overview Header */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-800">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          5-Level Referral Dashboard
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Earn rewards from 5 levels of referrals. Share your link and earn from all trading activity!
        </p>

        {/* Earnings Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Earned</p>
              <span className="text-2xl">💰</span>
            </div>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {publicKey ? (loading ? '...' : `${formatAmount(referralStats.totalEarned)}`) : '—'}
            </p>
            <p className="text-xs text-zinc-500">FACT tokens</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Referrals</p>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {publicKey ? (loading ? '...' : referralStats.totalReferrals) : '—'}
            </p>
            <p className="text-xs text-zinc-500">All levels combined</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Direct Referrals</p>
              <span className="text-2xl">🤝</span>
            </div>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
              {publicKey ? (loading ? '...' : referralStats.directReferrals) : '—'}
            </p>
            <p className="text-xs text-zinc-500">Level 1 only</p>
          </div>
        </div>

        {/* Claim Button */}
        {publicKey && referralStats.totalEarned > 0 && (
          <div className="flex justify-center">
            <button
              onClick={handleClaimEarnings}
              disabled={isClaiming}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isClaiming ? 'Claiming...' : `Claim ${formatAmount(referralStats.totalEarned)} FACT`}
            </button>
          </div>
        )}
      </div>

      {/* Level Breakdown */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
          Earnings by Level
        </h3>

        <div className="space-y-4">
          {levelData.map((level) => (
            <div
              key={level.level}
              className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl`}>
                    {level.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-black dark:text-white">{level.name}</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{level.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-black dark:text-white">
                    {publicKey ? (loading ? '...' : formatAmount(level.earnings)) : '—'}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{level.percentage}% share</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r ${level.color} transition-all duration-500`}
                  style={{
                    width: `${publicKey && referralStats.totalEarned > 0
                      ? (level.earnings / referralStats.totalEarned) * 100
                      : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referral Link */}
      {publicKey && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">
            Your Referral Link
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Share this link to earn rewards from your referrals' trading activity:
          </p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-mono text-black dark:text-white"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                alert('Referral link copied to clipboard!');
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Register Referrer */}
      {publicKey && referralStats.totalReferrals === 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">
            Register with a Referrer
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Have a referral code? Enter the referrer's wallet address to join their network:
          </p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={referrerAddress}
              onChange={(e) => setReferrerAddress(e.target.value)}
              placeholder="Enter referrer wallet address"
              className="flex-1 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-black dark:text-white"
            />
            <button
              onClick={handleRegisterReferrer}
              disabled={isRegistering || !referrerAddress}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isRegistering ? 'Registering...' : 'Register'}
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl p-8 border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
          How Referral Rewards Work
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
            <div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Share Your Link</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Share your unique referral link with friends, family, and community members.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
            <div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Build Your Network</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                When people register using your link, they become part of your referral tree up to 5 levels deep.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
            <div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Earn from Trading</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Earn 25% of transaction taxes from all buy/sell transactions across your 5-level network.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
            <div>
              <h4 className="font-semibold text-black dark:text-white mb-1">Claim Anytime</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Your rewards accumulate automatically. Claim them anytime directly to your wallet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
