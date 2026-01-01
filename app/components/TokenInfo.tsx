'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import tokenomics from '../../programs/factrade-token/tokenomics.json';

// Utility function to convert camelCase to Title Case
function camelToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
}

export function TokenInfo() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [publicKey, connection]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Token Overview with enhanced hover effects */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800 card-hover glow-hover transition-all duration-500">
        <h2 className="text-3xl font-bold mb-2 text-purple-600 dark:text-purple-400 transition-all duration-300 hover:scale-105 inline-block cursor-default">
          {tokenomics.name}
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-4 transition-all duration-300 hover:text-zinc-800 dark:hover:text-zinc-200">
          Symbol: <span className="font-semibold text-black dark:text-white">{tokenomics.symbol}</span>
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-500 mb-6 transition-all duration-300 hover:text-zinc-700 dark:hover:text-zinc-300">
          {tokenomics.description}
        </p>

        {publicKey && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4 transition-all duration-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:scale-105 cursor-pointer">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Wallet Balance</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 transition-all duration-300 hover:text-purple-700">
              {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
            </p>
          </div>
        )}
      </div>

      {/* Tokenomics Details with interactive cards */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800 card-hover transition-all duration-500">
        <h3 className="text-2xl font-bold mb-6 text-black dark:text-white transition-all duration-300 hover:text-purple-600 cursor-default">
          Tokenomics
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 transition-all duration-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:scale-105 hover:shadow-lg cursor-pointer group">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 transition-all duration-300 group-hover:text-purple-600">Total Supply</p>
            <p className="text-xl font-bold text-black dark:text-white transition-all duration-300 group-hover:text-purple-600">
              {tokenomics.totalSupply.toLocaleString()} {tokenomics.symbol}
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:scale-105 hover:shadow-lg cursor-pointer group">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 transition-all duration-300 group-hover:text-blue-600">Decimals</p>
            <p className="text-xl font-bold text-black dark:text-white transition-all duration-300 group-hover:text-blue-600">
              {tokenomics.decimals}
            </p>
          </div>
        </div>

        <h4 className="text-lg font-semibold mb-4 text-black dark:text-white transition-all duration-300 hover:text-purple-600 cursor-default">
          Token Distribution
        </h4>
        <div className="space-y-3">
          {Object.entries(tokenomics.distribution).map(([key, value], index) => (
            <div key={key} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:scale-102 hover:shadow-md cursor-pointer group"
              style={{ transitionDelay: `${index * 50}ms` }}>
              <div className="flex-1">
                <p className="font-semibold text-black dark:text-white capitalize transition-all duration-300 group-hover:text-purple-600">
                  {camelToTitleCase(key)}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 transition-all duration-300 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                  {value.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:text-purple-700">
                  {value.percentage}%
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 transition-all duration-300 group-hover:text-zinc-700">
                  {value.amount.toLocaleString()} {tokenomics.symbol}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Features with hover effects */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800 card-hover transition-all duration-500">
        <h3 className="text-2xl font-bold mb-6 text-black dark:text-white transition-all duration-300 hover:text-purple-600 cursor-default">
          Token Features
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(tokenomics.features).map(([key, value], index) => (
            <div key={key} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 text-center transition-all duration-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-blue-50 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20 hover:scale-110 hover:shadow-lg cursor-pointer"
              style={{ transitionDelay: `${index * 75}ms` }}>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 capitalize mb-2 transition-all duration-300 hover:text-purple-600">
                {key}
              </p>
              <p className={`text-lg font-bold transition-all duration-300 ${
                typeof value === 'boolean'
                  ? value
                    ? 'text-green-600 dark:text-green-400 hover:scale-125'
                    : 'text-red-600 dark:text-red-400 hover:scale-125'
                  : 'text-black dark:text-white hover:text-purple-600'
              }`}>
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
