#!/usr/bin/env ts-node

/**
 * FACTRADE Programs Initialization Script
 * 
 * This script initializes all three Solana programs:
 * - Staking Program
 * - Rewards Program  
 * - Governance Program
 * 
 * Usage:
 *   SOLANA_NETWORK=devnet npx ts-node scripts/initialize-programs.ts <TOKEN_MINT_ADDRESS>
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';

interface ProgramConfig {
  programId: string;
  name: string;
  initialized: boolean;
  accounts?: {
    [key: string]: string;
  };
}

interface InitializationResult {
  network: string;
  tokenMint: string;
  initializedAt: string;
  initializedBy: string;
  programs: {
    staking: ProgramConfig;
    rewards: ProgramConfig;
    governance: ProgramConfig;
  };
}

/**
 * Load wallet from file
 */
function loadWallet(): Keypair {
  const walletPath = process.env.WALLET_PATH || 
                     path.join(process.env.HOME || '', '.config', 'solana', 'id.json');
  
  if (!fs.existsSync(walletPath)) {
    throw new Error(`Wallet file not found at ${walletPath}`);
  }

  const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

/**
 * Load program IDs from Anchor.toml
 */
function loadProgramIds(network: string): { [key: string]: string } {
  const anchorTomlPath = path.join(process.cwd(), 'solana-programs', 'Anchor.toml');
  
  if (!fs.existsSync(anchorTomlPath)) {
    throw new Error('Anchor.toml not found');
  }

  const anchorToml = fs.readFileSync(anchorTomlPath, 'utf-8');
  const programIds: { [key: string]: string } = {};

  // Parse program IDs from Anchor.toml
  // This is a simple parser - adjust if needed
  const networkSection = `[programs.${network}]`;
  const lines = anchorToml.split('\n');
  let inSection = false;

  for (const line of lines) {
    if (line.trim() === networkSection) {
      inSection = true;
      continue;
    }
    
    if (inSection) {
      if (line.trim().startsWith('[')) {
        break; // Entered a new section
      }
      
      const match = line.match(/^(\w+)\s*=\s*"([^"]+)"/);
      if (match) {
        programIds[match[1]] = match[2];
      }
    }
  }

  return programIds;
}

/**
 * Main initialization function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    FACTRADE Programs Initialization Script                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Get token mint address
  const tokenMintAddress = process.argv[2];
  if (!tokenMintAddress) {
    console.error('❌ Error: Token mint address is required');
    console.log('Usage: npx ts-node scripts/initialize-programs.ts <TOKEN_MINT_ADDRESS>\n');
    process.exit(1);
  }

  console.log(`🪙 Token Mint: ${tokenMintAddress}\n`);

  // Get network configuration
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const rpcUrl = process.env.SOLANA_RPC_URL || 
    (network === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : 'https://api.devnet.solana.com');

  console.log(`📋 Configuration:`);
  console.log(`   Network: ${network}`);
  console.log(`   RPC URL: ${rpcUrl}\n`);

  // Load wallet
  console.log('🔐 Loading wallet...');
  const authority = loadWallet();
  console.log(`   ✓ Authority: ${authority.publicKey.toString()}\n`);

  // Connect to cluster
  console.log('🌐 Connecting to Solana cluster...');
  const connection = new Connection(rpcUrl, 'confirmed');
  const balance = await connection.getBalance(authority.publicKey);
  console.log(`   ✓ Connected to ${network}`);
  console.log(`   ✓ Balance: ${(balance / 1e9).toFixed(4)} SOL\n`);

  if (balance / 1e9 < 0.5) {
    console.warn('⚠️  WARNING: Low balance. You need at least 0.5 SOL for initialization.');
    if (network === 'devnet') {
      console.log('   Run: solana airdrop 2\n');
    }
  }

  // Load program IDs
  console.log('📦 Loading program IDs...');
  const programIds = loadProgramIds(network);
  console.log(`   ✓ Staking Program:    ${programIds.staking_program || 'NOT_FOUND'}`);
  console.log(`   ✓ Rewards Program:    ${programIds.rewards_program || 'NOT_FOUND'}`);
  console.log(`   ✓ Governance Program: ${programIds.governance_program || 'NOT_FOUND'}\n`);

  if (!programIds.staking_program || !programIds.rewards_program || !programIds.governance_program) {
    console.error('❌ Error: Missing program IDs in Anchor.toml');
    console.log('   Please deploy the programs first using: cd solana-programs && anchor deploy\n');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log('Note: This is a template script. Actual initialization requires:');
  console.log('1. Programs to be deployed to the network');
  console.log('2. Anchor client generated from IDL');
  console.log('3. Proper instruction calls for each program\n');
  console.log('To initialize manually, use:');
  console.log('   cd solana-programs');
  console.log('   anchor test --skip-build --skip-deploy\n');
  console.log('Or use the Anchor CLI directly for each program:');
  console.log('   anchor run initialize-staking');
  console.log('   anchor run initialize-rewards');
  console.log('   anchor run initialize-governance');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Create result template
  const result: InitializationResult = {
    network,
    tokenMint: tokenMintAddress,
    initializedAt: new Date().toISOString(),
    initializedBy: authority.publicKey.toString(),
    programs: {
      staking: {
        programId: programIds.staking_program,
        name: 'Staking Program',
        initialized: false,
        accounts: {
          stakingPool: 'TO_BE_INITIALIZED',
          stakeVault: 'TO_BE_INITIALIZED'
        }
      },
      rewards: {
        programId: programIds.rewards_program,
        name: 'Rewards Program',
        initialized: false,
        accounts: {
          rewardsPool: 'TO_BE_INITIALIZED',
          rewardVault: 'TO_BE_INITIALIZED'
        }
      },
      governance: {
        programId: programIds.governance_program,
        name: 'Governance Program',
        initialized: false,
        accounts: {
          governance: 'TO_BE_INITIALIZED'
        }
      }
    }
  };

  // Save initialization template
  const deploymentDir = path.join(process.cwd(), 'deployments');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const resultsFile = path.join(
    deploymentDir,
    `programs-${network}-template.json`
  );

  fs.writeFileSync(resultsFile, JSON.stringify(result, null, 2));

  console.log('✅ Template Created!\n');
  console.log(`   Template saved to: ${resultsFile}`);
  console.log('   Update this file after manual initialization\n');

  console.log('📝 Staking Program Parameters:');
  console.log('   - unbonding_period_7:  604800 (7 days in seconds)');
  console.log('   - unbonding_period_14: 1209600 (14 days in seconds)');
  console.log('   - unbonding_period_30: 2592000 (30 days in seconds)');
  console.log('   - reward_multiplier_7:  1000 (1x, scaled by 1000)');
  console.log('   - reward_multiplier_14: 1500 (1.5x, scaled by 1000)');
  console.log('   - reward_multiplier_30: 2000 (2x, scaled by 1000)');
  console.log('   - min_stake_amount: 1000000000 (1 token with 9 decimals)\n');

  console.log('📝 Rewards Program Parameters:');
  console.log('   - base_apy: 1200 (12%, scaled by 100)');
  console.log('   - min_apy:  1200 (12%, scaled by 100)');
  console.log('   - max_apy:  2500 (25%, scaled by 100)');
  console.log('   - compound_frequency: 86400 (daily, in seconds)');
  console.log('   - emergency_pause: false\n');

  console.log('📝 Governance Program Parameters:');
  console.log('   - voting_period: 604800 (7 days in seconds)');
  console.log('   - min_voting_power: 100000000000000 (100,000 tokens with 9 decimals)');
  console.log('   - quorum_percentage: 10 (10%)\n');
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Initialization failed:', error.message);
    console.error(error);
    process.exit(1);
  });
