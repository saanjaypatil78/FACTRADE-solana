'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

interface Proposal {
  id: number;
  title: string;
  description: string;
  type: 'parameter' | 'treasury' | 'upgrade' | 'general';
  status: 'active' | 'passed' | 'rejected';
  yesVotes: number;
  noVotes: number;
  endTime: string;
  quorum: number;
}

export function GovernanceInterface() {
  const { publicKey } = useWallet();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [proposals] = useState<Proposal[]>([
    {
      id: 1,
      title: 'Increase Staking Rewards for 30-Day Lock',
      description: 'Proposal to increase the APR for 30-day staking from 20% to 25% to attract more long-term stakers.',
      type: 'parameter',
      status: 'active',
      yesVotes: 45000000,
      noVotes: 12000000,
      endTime: '2026-01-05T00:00:00Z',
      quorum: 10,
    },
    {
      id: 2,
      title: 'Treasury Allocation for Marketing',
      description: 'Allocate 50M FACT tokens from treasury for Q1 2026 marketing campaign.',
      type: 'treasury',
      status: 'active',
      yesVotes: 38000000,
      noVotes: 25000000,
      endTime: '2026-01-03T00:00:00Z',
      quorum: 10,
    },
  ]);

  const getProposalTypeColor = (type: string) => {
    const colors = {
      parameter: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      treasury: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      upgrade: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      general: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    };
    return colors[type as keyof typeof colors] || colors.general;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      passed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const calculatePercentages = (yes: number, no: number) => {
    const total = yes + no;
    if (total === 0) return { yesPercent: 0, noPercent: 0 };
    return {
      yesPercent: Math.round((yes / total) * 100),
      noPercent: Math.round((no / total) * 100),
    };
  };

  const handleVote = (proposalId: number, vote: 'yes' | 'no') => {
    if (!publicKey) {
      alert('Please connect your wallet to vote');
      return;
    }
    console.log(`Voting ${vote} on proposal ${proposalId}`);
    alert(`Vote ${vote.toUpperCase()} submitted successfully!`);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Governance Overview */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Governance
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Shape the future of FACTRADE. Vote on proposals and create your own!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Proposals</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              2
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Your Voting Power</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {publicKey ? '0' : '—'}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Min. to Propose</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              100K
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Quorum</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              10%
            </p>
          </div>
        </div>
      </div>

      {/* Create Proposal Button */}
      {publicKey && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Proposal
          </button>
        </div>
      )}

      {/* Create Proposal Form */}
      {showCreateForm && publicKey && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
            Create New Proposal
          </h3>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter proposal title"
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Type
              </label>
              <select className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent">
                <option value="parameter">Parameter Change</option>
                <option value="treasury">Treasury Spend</option>
                <option value="upgrade">Protocol Upgrade</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Detailed description of your proposal"
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Submit Proposal
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.map((proposal) => {
          const { yesPercent, noPercent } = calculatePercentages(proposal.yesVotes, proposal.noVotes);
          const totalVotes = proposal.yesVotes + proposal.noVotes;
          
          return (
            <div
              key={proposal.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProposalTypeColor(proposal.type)}`}>
                      {proposal.type.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                      {proposal.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-black dark:text-white mb-2">
                    {proposal.title}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {proposal.description}
                  </p>
                </div>
              </div>

              {/* Voting Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    Yes: {yesPercent}% ({(proposal.yesVotes / 1000000).toFixed(1)}M FACT)
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    No: {noPercent}% ({(proposal.noVotes / 1000000).toFixed(1)}M FACT)
                  </span>
                </div>
                <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
                  <div
                    className="bg-green-600 dark:bg-green-500 transition-all"
                    style={{ width: `${yesPercent}%` }}
                  />
                  <div
                    className="bg-red-600 dark:bg-red-500 transition-all"
                    style={{ width: `${noPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  <span>Total Votes: {(totalVotes / 1000000).toFixed(1)}M FACT</span>
                  <span>Quorum: {proposal.quorum}% ({proposal.quorum >= 10 ? '✓' : '✗'})</span>
                </div>
              </div>

              {/* Vote Buttons */}
              {proposal.status === 'active' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVote(proposal.id, 'yes')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    Vote Yes
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 'no')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                  >
                    Vote No
                  </button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-500">
                Voting ends: {new Date(proposal.endTime).toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
          How Governance Works
        </h4>
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
            <span>Your voting power is determined by your FACT token holdings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
            <span>Proposals require 10% quorum and majority vote to pass</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
            <span>Minimum 100,000 FACT required to create proposals</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
            <span>Voting period is 7 days from proposal creation</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
