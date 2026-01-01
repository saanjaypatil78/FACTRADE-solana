#!/usr/bin/env ts-node

/**
 * FACTRADE Token Deployment Script
 * 
 * This script deploys the FACT token to Solana blockchain according to
 * the tokenomics specification in programs/factrade-token/tokenomics.json
 * 
 * Usage:
 *   SOLANA_NETWORK=devnet npx ts-node scripts/deploy-token.ts
 *   SOLANA_NETWORK=mainnet-beta npx ts-node scripts/deploy-token.ts
 */

import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { 
  createFactradeToken, 
  mintTokensToDistribution, 
  getTokenDistribution,
  tokenomics 
} from '../programs/factrade-token/token-config';
import * as fs from 'fs';
import * as path from 'path';
import { homedir } from 'os';

interface DeploymentConfig {
  network: string;
  rpcUrl: string;
  walletPath: string;
}

interface DeploymentResult {
  network: string;
  mintAddress: string;
  mintAuthority: string;
  freezeAuthority: string | null;
  decimals: number;
  totalSupply: number;
  deployedAt: string;
  deployedBy: string;
  tokenName: string;
  tokenSymbol: string;
  distribution: {
    publicSale: number;
    team: number;
    liquidity: number;
    ecosystem: number;
    reserve: number;
  };
  features: {
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
    transferFee: number;
  };
  explorerUrl: string;
}

/**
 * Load wallet from file or environment
 */
function loadWallet(): Keypair {
  const walletPath = process.env.WALLET_PATH || 
                     path.join(homedir(), '.config', 'solana', 'id.json');
  
  if (!fs.existsSync(walletPath)) {
    throw new Error(
      `Wallet file not found at ${walletPath}\n` +
      `Please create a wallet using: solana-keygen new --outfile ${walletPath}`
    );
  }

  const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

/**
 * Get deployment configuration based on network
 */
function getDeploymentConfig(): DeploymentConfig {
  const network = process.env.SOLANA_NETWORK || 'devnet';
  
  let rpcUrl: string;
  if (process.env.SOLANA_RPC_URL) {
    rpcUrl = process.env.SOLANA_RPC_URL;
  } else if (network === 'mainnet-beta' || network === 'mainnet') {
    rpcUrl = 'https://api.mainnet-beta.solana.com';
  } else if (network === 'devnet') {
    rpcUrl = 'https://api.devnet.solana.com';
  } else if (network === 'testnet') {
    rpcUrl = 'https://api.testnet.solana.com';
  } else {
    rpcUrl = 'http://127.0.0.1:8899'; // localnet
  }

  const walletPath = process.env.WALLET_PATH || 
                     path.join(homedir(), '.config', 'solana', 'id.json');

  return { network, rpcUrl, walletPath };
}

/**
 * Get explorer URL for the network
 */
function getExplorerUrl(mintAddress: string, network: string): string {
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/address/${mintAddress}${cluster}`;
}

/**
 * Main deployment function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        FACTRADE Token Deployment Script                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Get configuration
  const config = getDeploymentConfig();
  console.log('📋 Configuration:');
  console.log(`   Network: ${config.network}`);
  console.log(`   RPC URL: ${config.rpcUrl}`);
  console.log(`   Wallet:  ${config.walletPath}\n`);

  // Load wallet
  console.log('🔐 Loading wallet...');
  const payer = loadWallet();
  console.log(`   ✓ Wallet loaded: ${payer.publicKey.toString()}\n`);

  // Connect to cluster
  console.log('🌐 Connecting to Solana cluster...');
  const connection = new Connection(config.rpcUrl, 'confirmed');
  
  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  const balanceSOL = balance / 1e9;
  console.log(`   ✓ Connected to ${config.network}`);
  console.log(`   ✓ Balance: ${balanceSOL.toFixed(4)} SOL\n`);

  if (balanceSOL < 0.5) {
    console.warn('⚠️  WARNING: Low balance. You need at least 0.5 SOL for deployment.');
    if (config.network === 'devnet') {
      console.log('   Run: solana airdrop 2\n');
    }
  }

  // Display token information
  console.log('🪙 Token Information:');
  console.log(`   Name:         ${tokenomics.name}`);
  console.log(`   Symbol:       ${tokenomics.symbol}`);
  console.log(`   Decimals:     ${tokenomics.decimals}`);
  console.log(`   Total Supply: ${tokenomics.totalSupply.toLocaleString()} ${tokenomics.symbol}`);
  console.log(`   Mintable:     ${tokenomics.features.mintable}`);
  console.log(`   Burnable:     ${tokenomics.features.burnable}`);
  console.log(`   Pausable:     ${tokenomics.features.pausable}\n`);

  // Display distribution
  const distribution = getTokenDistribution();
  console.log('📊 Token Distribution:');
  console.log(`   Public Sale:  ${distribution.publicSale.toLocaleString()} ${tokenomics.symbol} (${tokenomics.distribution.publicSale.percentage}%)`);
  console.log(`   Team:         ${distribution.team.toLocaleString()} ${tokenomics.symbol} (${tokenomics.distribution.team.percentage}%)`);
  console.log(`   Liquidity:    ${distribution.liquidity.toLocaleString()} ${tokenomics.symbol} (${tokenomics.distribution.liquidity.percentage}%)`);
  console.log(`   Ecosystem:    ${distribution.ecosystem.toLocaleString()} ${tokenomics.symbol} (${tokenomics.distribution.ecosystem.percentage}%)`);
  console.log(`   Reserve:      ${distribution.reserve.toLocaleString()} ${tokenomics.symbol} (${tokenomics.distribution.reserve.percentage}%)\n`);

  // Confirm deployment
  if (config.network === 'mainnet-beta' || config.network === 'mainnet') {
    console.log('⚠️  WARNING: You are about to deploy to MAINNET!');
    console.log('   This action is irreversible and will use real SOL.');
    console.log('   Press Ctrl+C to cancel, or wait 10 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // Create token mint
  console.log('🚀 Creating token mint...');
  const mintAddress = await createFactradeToken(
    connection,
    payer,
    payer.publicKey, // mint authority
    null // no freeze authority (tokens cannot be frozen)
  );
  console.log(`   ✓ Token mint created!`);
  console.log(`   ✓ Mint address: ${mintAddress.toString()}\n`);

  // Prepare deployment result
  const deploymentResult: DeploymentResult = {
    network: config.network,
    mintAddress: mintAddress.toString(),
    mintAuthority: payer.publicKey.toString(),
    freezeAuthority: null,
    decimals: tokenomics.decimals,
    totalSupply: tokenomics.totalSupply,
    deployedAt: new Date().toISOString(),
    deployedBy: payer.publicKey.toString(),
    tokenName: tokenomics.name,
    tokenSymbol: tokenomics.symbol,
    distribution,
    features: tokenomics.features,
    explorerUrl: getExplorerUrl(mintAddress.toString(), config.network),
  };

  // Save deployment info
  const deploymentDir = path.join(process.cwd(), 'deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentDir, 
    `token-${config.network}-${Date.now()}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentResult, null, 2));
  
  // Also save as latest
  const latestFile = path.join(deploymentDir, `token-${config.network}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentResult, null, 2));

  console.log('✅ Deployment Complete!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Token Mint Address: ${mintAddress.toString()}`);
  console.log(`Explorer URL: ${deploymentResult.explorerUrl}`);
  console.log(`Deployment Info: ${deploymentFile}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📝 Next Steps:');
  console.log('   1. Verify token on Solana Explorer');
  console.log('   2. Update .env files with mint address:');
  console.log(`      NEXT_PUBLIC_TOKEN_MINT_ADDRESS=${mintAddress.toString()}`);
  console.log('   3. Initialize staking, rewards, and governance programs');
  console.log('   4. Distribute tokens according to tokenomics\n');

  console.log('💡 To distribute tokens, use:');
  console.log(`   npx ts-node scripts/distribute-tokens.ts ${mintAddress.toString()}\n`);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Deployment failed:', error.message);
    console.error(error);
    process.exit(1);
  });
