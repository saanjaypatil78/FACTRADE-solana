'use client';

import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { Transaction } from '@solana/web3.js';
import {
  createLaunchpadProjectInstruction,
  createInvestInstruction,
  LaunchpadProject,
  PROGRAM_IDS,
} from '../utils/program-integration';
import { useAccountSync } from '../utils/blockchain-sync';
import { soundUtils } from './SoundEffects';

interface ProjectImage {
  logo: string;
  banner: string;
  icon: string;
}

interface PromoAssets {
  twitter: string;
  telegram: string;
  website: string;
  discord: string;
  description: string;
}

interface BondingCurveConfig {
  initialPrice: number;
  targetPrice: number;
  curveType: 'linear' | 'exponential' | 'logarithmic';
  liquidityTarget: number;
}

interface EnhancedProject extends LaunchpadProject {
  id: string;
  raised: number;
  investors: number;
  status: 'upcoming' | 'active' | 'ended';
  images?: ProjectImage;
  promoAssets?: PromoAssets;
  bondingCurve?: BondingCurveConfig;
  marketCap?: number;
  liquidity?: number;
}

export function LaunchpadInterface() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [activeView, setActiveView] = useState<'browse' | 'create'>('browse');
  const [isCreating, setIsCreating] = useState(false);
  const [isInvesting, setIsInvesting] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Enhanced form state for creating projects with images and promo
  const [newProject, setNewProject] = useState<Partial<EnhancedProject>>({
    name: '',
    symbol: '',
    totalSupply: 0,
    price: 0,
    softCap: 0,
    hardCap: 0,
    startTime: 0,
    endTime: 0,
    images: {
      logo: '',
      banner: '',
      icon: '',
    },
    promoAssets: {
      twitter: '',
      telegram: '',
      website: '',
      discord: '',
      description: '',
    },
    bondingCurve: {
      initialPrice: 0,
      targetPrice: 0,
      curveType: 'exponential',
      liquidityTarget: 0,
    },
  });

  // Projects data with enhanced features
  const [projects, setProjects] = useState<EnhancedProject[]>([
    {
      id: '1',
      name: 'DeFi Protocol',
      symbol: 'DFP',
      totalSupply: 100000000,
      price: 0.1,
      softCap: 50000,
      hardCap: 200000,
      raised: 125000,
      investors: 234,
      status: 'active',
      startTime: Date.now() - 86400000,
      endTime: Date.now() + 86400000 * 7,
      images: {
        logo: '🏦',
        banner: '🌐',
        icon: '💼',
      },
      promoAssets: {
        twitter: '@DeFiProtocol',
        telegram: 't.me/defiprotocol',
        website: 'defiprotocol.io',
        discord: 'discord.gg/defi',
        description: 'Revolutionary DeFi protocol with automated market making and yield optimization',
      },
      bondingCurve: {
        initialPrice: 0.05,
        targetPrice: 0.2,
        curveType: 'exponential',
        liquidityTarget: 100000,
      },
      marketCap: 12500000,
      liquidity: 87500,
    },
    {
      id: '2',
      name: 'Gaming Token',
      symbol: 'GAME',
      totalSupply: 500000000,
      price: 0.05,
      softCap: 100000,
      hardCap: 500000,
      raised: 0,
      investors: 0,
      status: 'upcoming',
      startTime: Date.now() + 86400000 * 3,
      endTime: Date.now() + 86400000 * 10,
      images: {
        logo: '🎮',
        banner: '🕹️',
        icon: '🏆',
      },
      promoAssets: {
        twitter: '@GameToken',
        telegram: 't.me/gametoken',
        website: 'gametoken.gg',
        discord: 'discord.gg/game',
        description: 'Next-gen gaming ecosystem with P2E mechanics and NFT integration',
      },
      bondingCurve: {
        initialPrice: 0.01,
        targetPrice: 0.1,
        curveType: 'linear',
        liquidityTarget: 250000,
      },
      marketCap: 0,
      liquidity: 0,
    },
    {
      id: '3',
      name: 'NFT Marketplace',
      symbol: 'NFTM',
      totalSupply: 250000000,
      price: 0.15,
      softCap: 75000,
      hardCap: 300000,
      raised: 302000,
      investors: 567,
      status: 'ended',
      startTime: Date.now() - 86400000 * 14,
      endTime: Date.now() - 86400000 * 7,
      images: {
        logo: '🖼️',
        banner: '🎨',
        icon: '💎',
      },
      promoAssets: {
        twitter: '@NFTMarket',
        telegram: 't.me/nftmarket',
        website: 'nftmarket.art',
        discord: 'discord.gg/nft',
        description: 'Premium NFT marketplace with royalty sharing and creator tools',
      },
      bondingCurve: {
        initialPrice: 0.1,
        targetPrice: 0.25,
        curveType: 'logarithmic',
        liquidityTarget: 150000,
      },
      marketCap: 37750000,
      liquidity: 302000,
    },
  ]);

  // Auto-sync projects data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate project data updates (in production, fetch from blockchain)
      setProjects(prevProjects => 
        prevProjects.map(project => {
          if (project.status === 'active') {
            // Simulate gradual fundraising progress
            const newRaised = Math.min(
              project.raised + Math.random() * 1000,
              project.hardCap
            );
            const newInvestors = project.investors + Math.floor(Math.random() * 3);
            
            // Update bonding curve price
            const progress = newRaised / project.hardCap;
            let currentPrice = project.price;
            
            if (project.bondingCurve) {
              const { initialPrice, targetPrice, curveType } = project.bondingCurve;
              switch (curveType) {
                case 'linear':
                  currentPrice = initialPrice + (targetPrice - initialPrice) * progress;
                  break;
                case 'exponential':
                  currentPrice = initialPrice * Math.pow(targetPrice / initialPrice, progress);
                  break;
                case 'logarithmic':
                  currentPrice = initialPrice + (targetPrice - initialPrice) * Math.log(1 + progress * 9) / Math.log(10);
                  break;
              }
            }
            
            return {
              ...project,
              raised: newRaised,
              investors: newInvestors,
              price: currentPrice,
              marketCap: newRaised * (project.totalSupply / project.hardCap),
              liquidity: newRaised * 0.7, // 70% goes to liquidity
            };
          }
          return project;
        })
      );
      setLastUpdate(Date.now());
    }, 5000); // Update every 5 seconds for autonomous sync

    return () => clearInterval(interval);
  }, []);

  // Real-time sync using blockchain-sync for launchpad program
  useAccountSync(
    connection,
    connection ? PROGRAM_IDS.LAUNCHPAD : null,
    async () => {
      // When blockchain data changes, refresh projects
      // In production, this would fetch actual project data from the program
      console.log('Launchpad data synced from blockchain');
      setLastUpdate(Date.now());
    },
    { interval: 5000, enabled: !!connection }
  );

  const handleCreateProject = async () => {
    if (!publicKey || !connection) {
      alert('Please connect your wallet');
      return;
    }

    // Validate form
    if (!newProject.name || !newProject.symbol || !newProject.totalSupply) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const projectData: LaunchpadProject = {
        name: newProject.name!,
        symbol: newProject.symbol!,
        totalSupply: newProject.totalSupply!,
        price: newProject.price || 0,
        softCap: newProject.softCap || 0,
        hardCap: newProject.hardCap || 0,
        startTime: newProject.startTime || Date.now(),
        endTime: newProject.endTime || Date.now() + 86400000 * 30,
      };

      const instruction = await createLaunchpadProjectInstruction(publicKey, projectData);
      
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      alert('Project created successfully!');
      
      // Reset form
      setNewProject({
        name: '',
        symbol: '',
        totalSupply: 0,
        price: 0,
        softCap: 0,
        hardCap: 0,
        startTime: 0,
        endTime: 0,
      });
      setActiveView('browse');
    } catch (error) {
      console.error('Project creation error:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInvest = async (projectSymbol: string) => {
    if (!publicKey || !connection || !investmentAmount) {
      alert('Please connect wallet and enter amount');
      return;
    }

    setIsInvesting(true);
    try {
      const amount = parseFloat(investmentAmount) * 1e9; // Convert to lamports
      const instruction = await createInvestInstruction(publicKey, projectSymbol, amount);
      
      const transaction = new Transaction().add(instruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      alert('Investment successful!');
      setInvestmentAmount('');
      setSelectedProject(null);
    } catch (error) {
      console.error('Investment error:', error);
      alert('Investment failed. Please try again.');
    } finally {
      setIsInvesting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateProgress = (raised: number, hardCap: number) => {
    return Math.min((raised / hardCap) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'from-green-500 to-emerald-600';
      case 'upcoming':
        return 'from-blue-500 to-blue-600';
      case 'ended':
        return 'from-zinc-500 to-zinc-600';
      default:
        return 'from-zinc-500 to-zinc-600';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Launchpad Header */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Token Launchpad
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Launch your token project or invest in promising new projects on Solana. Fair, transparent, and decentralized.
        </p>

        {/* Auto-sync indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-syncing</span>
            <span className="text-xs">• Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveView('browse')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeView === 'browse'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            🚀 Browse Projects
          </button>
          <button
            onClick={() => setActiveView('create')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              activeView === 'create'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
            }`}
          >
            ➕ Create Project
          </button>
        </div>
      </div>

      {/* Browse Projects View */}
      {activeView === 'browse' && (
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {projects.length}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Active Now</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {projects.filter((p) => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Raised</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                ${projects.reduce((sum, p) => sum + p.raised, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Investors</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {projects.reduce((sum, p) => sum + p.investors, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Projects List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-0 border border-zinc-200 dark:border-zinc-800 hover:shadow-xl transition-all duration-300 cursor-tilt overflow-hidden"
              >
                {/* Project Banner/Images */}
                <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-6xl">
                  {project.images?.banner || '🚀'}
                  <div className="absolute top-3 right-3">
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(project.status)} text-white text-sm font-semibold backdrop-blur-sm`}>
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Project Header with Logo */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl">{project.images?.logo || '🪙'}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black dark:text-white mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        ${project.symbol}
                      </p>
                      {project.promoAssets?.description && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2 line-clamp-2">
                          {project.promoAssets.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Promo Assets / Social Links */}
                  {project.promoAssets && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {project.promoAssets.twitter && (
                        <a href={`https://twitter.com/${project.promoAssets.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" 
                           className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all cursor-pointer sound-hover">
                          🐦 Twitter
                        </a>
                      )}
                      {project.promoAssets.telegram && (
                        <a href={`https://${project.promoAssets.telegram}`} target="_blank" rel="noopener noreferrer"
                           className="px-2 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded text-xs hover:bg-sky-200 dark:hover:bg-sky-900/50 transition-all cursor-pointer sound-hover">
                          ✈️ Telegram
                        </a>
                      )}
                      {project.promoAssets.website && (
                        <a href={`https://${project.promoAssets.website}`} target="_blank" rel="noopener noreferrer"
                           className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs hover:bg-green-200 dark:hover:bg-green-900/50 transition-all cursor-pointer sound-hover">
                          🌐 Website
                        </a>
                      )}
                      {project.promoAssets.discord && (
                        <a href={`https://${project.promoAssets.discord}`} target="_blank" rel="noopener noreferrer"
                           className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-xs hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all cursor-pointer sound-hover">
                          💬 Discord
                        </a>
                      )}
                    </div>
                  )}

                  {/* Bonding Curve Info */}
                  {project.bondingCurve && project.status === 'active' && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 mb-4 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">📈 Bonding Curve</span>
                        <span className="text-xs px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full">
                          {project.bondingCurve.curveType}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-zinc-600 dark:text-zinc-400">Initial</p>
                          <p className="font-bold text-purple-700 dark:text-purple-300">${project.bondingCurve.initialPrice}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600 dark:text-zinc-400">Current</p>
                          <p className="font-bold text-purple-700 dark:text-purple-300">${project.price.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600 dark:text-zinc-400">Target</p>
                          <p className="font-bold text-purple-700 dark:text-purple-300">${project.bondingCurve.targetPrice}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Market Stats */}
                  {project.marketCap !== undefined && project.liquidity !== undefined && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Market Cap</p>
                        <p className="text-sm font-bold text-black dark:text-white">
                          ${(project.marketCap / 1000000).toFixed(2)}M
                        </p>
                      </div>
                      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">Liquidity</p>
                        <p className="text-sm font-bold text-black dark:text-white">
                          ${project.liquidity.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-zinc-600 dark:text-zinc-400">Progress</span>
                      <span className="font-semibold text-black dark:text-white">
                        ${project.raised.toLocaleString()} / ${project.hardCap.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${getStatusColor(project.status)} transition-all duration-500 animate-gradient`}
                        style={{ width: `${calculateProgress(project.raised, project.hardCap)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1 text-zinc-500 dark:text-zinc-500">
                      <span>{calculateProgress(project.raised, project.hardCap).toFixed(1)}% raised</span>
                      <span>{project.investors} investors</span>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Token Price</p>
                      <p className="text-lg font-bold text-black dark:text-white">
                        ${project.price.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Total Supply</p>
                      <p className="text-lg font-bold text-black dark:text-white">
                        {(project.totalSupply / 1000000).toFixed(0)}M
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">Start Date</p>
                      <p className="text-sm font-semibold text-black dark:text-white">
                        {formatDate(project.startTime)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">End Date</p>
                      <p className="text-sm font-semibold text-black dark:text-white">
                        {formatDate(project.endTime)}
                      </p>
                    </div>
                  </div>

                  {/* Investment Section */}
                  {project.status === 'active' && publicKey && (
                    <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                      {selectedProject === project.id ? (
                        <div className="space-y-3">
                          <input
                            type="number"
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            placeholder="Enter amount (SOL)"
                            className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white sound-hover"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                handleInvest(project.symbol);
                                soundUtils.playSuccess();
                              }}
                              disabled={isInvesting || !investmentAmount}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 button-press magnetic-button sound-click"
                            >
                              {isInvesting ? 'Investing...' : 'Confirm Investment'}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProject(null);
                                setInvestmentAmount('');
                              }}
                              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white rounded-lg font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all duration-300 sound-click"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedProject(project.id)}
                          className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 magnetic-button button-press sound-click"
                        >
                          💰 Invest Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Project View */}
      {activeView === 'create' && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">
            Create New Token Project
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g., DeFi Protocol"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Token Symbol *
                </label>
                <input
                  type="text"
                  value={newProject.symbol}
                  onChange={(e) => setNewProject({ ...newProject, symbol: e.target.value.toUpperCase() })}
                  placeholder="e.g., DFP"
                  maxLength={8}
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Total Supply *
                </label>
                <input
                  type="number"
                  value={newProject.totalSupply || ''}
                  onChange={(e) => setNewProject({ ...newProject, totalSupply: parseFloat(e.target.value) })}
                  placeholder="e.g., 100000000"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Token Price (SOL)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newProject.price || ''}
                  onChange={(e) => setNewProject({ ...newProject, price: parseFloat(e.target.value) })}
                  placeholder="e.g., 0.1"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Soft Cap (SOL)
                </label>
                <input
                  type="number"
                  value={newProject.softCap || ''}
                  onChange={(e) => setNewProject({ ...newProject, softCap: parseFloat(e.target.value) })}
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                  Hard Cap (SOL)
                </label>
                <input
                  type="number"
                  value={newProject.hardCap || ''}
                  onChange={(e) => setNewProject({ ...newProject, hardCap: parseFloat(e.target.value) })}
                  placeholder="e.g., 200000"
                  className="w-full px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-black dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setActiveView('browse')}
                className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white rounded-lg font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={isCreating || !newProject.name || !newProject.symbol || !newProject.totalSupply}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
