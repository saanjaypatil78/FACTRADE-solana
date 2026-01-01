#!/usr/bin/env ts-node

/**
 * FACTRADE Token Distribution Script
 * 
 * This script distributes FACT tokens according to the tokenomics specification
 * 
 * Usage:
 *   npx ts-node scripts/distribute-tokens.ts <MINT_ADDRESS>
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { mintTokensToDistribution, getTokenDistribution, tokenomics } from '../programs/factrade-token/token-config';
import * as fs from 'fs';
import * as path from 'path';

interface DistributionWallet {
  category: string;
  address: string;
  amount: number;
}

/**
 * Load wallet from file
 */
function loadWallet(walletPath?: string): Keypair {
  const defaultPath = path.join(process.env.HOME || '', '.config', 'solana', 'id.json');
  const filePath = walletPath || process.env.WALLET_PATH || defaultPath;
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Wallet file not found at ${filePath}`);
  }

  const secretKey = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

/**
 * Load distribution wallets from config file
 */
function loadDistributionWallets(): DistributionWallet[] {
  const configPath = path.join(process.cwd(), 'distribution-wallets.json');
  
  if (!fs.existsSync(configPath)) {
    console.log('⚠️  Distribution wallet config not found. Creating template...\n');
    
    const distribution = getTokenDistribution();
    const template = {
      publicSale: {
        address: "PASTE_PUBLIC_SALE_WALLET_ADDRESS_HERE",
        amount: distribution.publicSale,
        description: "Tokens available for public sale"
      },
      team: {
        address: "PASTE_TEAM_WALLET_ADDRESS_HERE",
        amount: distribution.team,
        description: "Team allocation with vesting"
      },
      liquidity: {
        address: "PASTE_LIQUIDITY_WALLET_ADDRESS_HERE",
        amount: distribution.liquidity,
        description: "Liquidity provision for DEX"
      },
      ecosystem: {
        address: "PASTE_ECOSYSTEM_WALLET_ADDRESS_HERE",
        amount: distribution.ecosystem,
        description: "Ecosystem development and partnerships"
      },
      reserve: {
        address: "PASTE_RESERVE_WALLET_ADDRESS_HERE",
        amount: distribution.reserve,
        description: "Reserve fund for future development"
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(`✓ Template created at: ${configPath}`);
    console.log('  Please update the wallet addresses and run this script again.\n');
    process.exit(0);
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const wallets: DistributionWallet[] = [];

  for (const [category, data] of Object.entries(config)) {
    const wallet = data as any;
    if (wallet.address && !wallet.address.includes('PASTE_')) {
      wallets.push({
        category,
        address: wallet.address,
        amount: wallet.amount
      });
    }
  }

  return wallets;
}

/**
 * Main distribution function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      FACTRADE Token Distribution Script                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Get mint address from command line
  const mintAddress = process.argv[2];
  if (!mintAddress) {
    console.error('❌ Error: Mint address is required');
    console.log('Usage: npx ts-node scripts/distribute-tokens.ts <MINT_ADDRESS>\n');
    process.exit(1);
  }

  console.log(`🪙 Token Mint: ${mintAddress}\n`);

  // Get network configuration
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const rpcUrl = process.env.SOLANA_RPC_URL || 
    (network === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com');

  console.log(`📋 Configuration:`);
  console.log(`   Network: ${network}`);
  console.log(`   RPC URL: ${rpcUrl}\n`);

  // Load wallet
  console.log('🔐 Loading wallet...');
  const payer = loadWallet();
  const mintAuthority = payer; // Assuming same wallet is mint authority
  console.log(`   ✓ Wallet loaded: ${payer.publicKey.toString()}\n`);

  // Connect to cluster
  console.log('🌐 Connecting to Solana cluster...');
  const connection = new Connection(rpcUrl, 'confirmed');
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`   ✓ Connected to ${network}`);
  console.log(`   ✓ Balance: ${(balance / 1e9).toFixed(4)} SOL\n`);

  // Load distribution wallets
  console.log('📊 Loading distribution wallets...');
  const distributionWallets = loadDistributionWallets();
  
  if (distributionWallets.length === 0) {
    console.error('❌ No distribution wallets configured');
    process.exit(1);
  }

  console.log(`   ✓ Found ${distributionWallets.length} wallets\n`);

  // Display distribution plan
  console.log('Distribution Plan:');
  let totalAmount = 0;
  for (const wallet of distributionWallets) {
    console.log(`   ${wallet.category.padEnd(12)}: ${wallet.amount.toLocaleString().padStart(15)} ${tokenomics.symbol} → ${wallet.address}`);
    totalAmount += wallet.amount;
  }
  console.log(`   ${'─'.repeat(70)}`);
  console.log(`   ${'TOTAL'.padEnd(12)}: ${totalAmount.toLocaleString().padStart(15)} ${tokenomics.symbol}\n`);

  // Confirm distribution
  if (network === 'mainnet-beta' || network === 'mainnet') {
    console.log('⚠️  WARNING: You are about to distribute tokens on MAINNET!');
    console.log('   This action is irreversible.');
    console.log('   Press Ctrl+C to cancel, or wait 10 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // Distribute tokens
  console.log('🚀 Distributing tokens...\n');
  const mint = new PublicKey(mintAddress);
  const results = [];

  for (const wallet of distributionWallets) {
    try {
      console.log(`   Minting ${wallet.amount.toLocaleString()} ${tokenomics.symbol} to ${wallet.category}...`);
      await mintTokensToDistribution(
        connection,
        payer,
        mint,
        mintAuthority,
        new PublicKey(wallet.address),
        wallet.amount
      );
      console.log(`   ✓ Success\n`);
      results.push({ ...wallet, status: 'success' });
    } catch (error: any) {
      console.error(`   ✗ Failed: ${error.message}\n`);
      results.push({ ...wallet, status: 'failed', error: error.message });
    }
  }

  // Save distribution results
  const distributionDir = path.join(process.cwd(), 'deployments');
  if (!fs.existsSync(distributionDir)) {
    fs.mkdirSync(distributionDir, { recursive: true });
  }

  const resultsFile = path.join(
    distributionDir,
    `distribution-${network}-${Date.now()}.json`
  );

  const distributionResult = {
    mintAddress,
    network,
    distributedAt: new Date().toISOString(),
    distributedBy: payer.publicKey.toString(),
    results
  };

  fs.writeFileSync(resultsFile, JSON.stringify(distributionResult, null, 2));

  // Summary
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ Distribution Complete!\n');
  console.log(`   Successful: ${successful}/${distributionWallets.length}`);
  console.log(`   Failed:     ${failed}/${distributionWallets.length}`);
  console.log(`   Results:    ${resultsFile}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('⚠️  Some distributions failed. Check the results file for details.\n');
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Distribution failed:', error.message);
    console.error(error);
    process.exit(1);
  });
