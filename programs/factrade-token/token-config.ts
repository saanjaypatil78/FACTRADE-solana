import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
} from '@solana/spl-token';

import tokenomics from './tokenomics.json';

/**
 * FACTRADE Token Configuration
 * This file defines the exact tokenomics and token creation parameters
 */

export const FACTRADE_TOKEN_CONFIG = {
  name: tokenomics.name,
  symbol: tokenomics.symbol,
  decimals: tokenomics.decimals,
  totalSupply: tokenomics.totalSupply,
  distribution: tokenomics.distribution,
  features: tokenomics.features,
  taxSystem: tokenomics.taxSystem,
};

export interface TokenDistribution {
  publicSale: number;
  team: number;
  liquidity: number;
  ecosystem: number;
  reserve: number;
}

/**
 * Get token distribution amounts based on tokenomics
 */
export function getTokenDistribution(): TokenDistribution {
  return {
    publicSale: tokenomics.distribution.publicSale.amount,
    team: tokenomics.distribution.team.amount,
    liquidity: tokenomics.distribution.liquidity.amount,
    ecosystem: tokenomics.distribution.ecosystem.amount,
    reserve: tokenomics.distribution.reserve.amount,
  };
}

/**
 * Create FACTRADE token mint
 * This function creates the token mint with exact tokenomics specifications
 */
export async function createFactradeToken(
  connection: Connection,
  payer: Keypair,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null
): Promise<PublicKey> {
  const mintKeypair = Keypair.generate();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      tokenomics.decimals,
      mintAuthority,
      freezeAuthority,
      TOKEN_PROGRAM_ID
    )
  );

  await connection.sendTransaction(transaction, [payer, mintKeypair]);
  
  return mintKeypair.publicKey;
}

/**
 * Mint tokens according to distribution
 */
export async function mintTokensToDistribution(
  connection: Connection,
  payer: Keypair,
  mint: PublicKey,
  mintAuthority: Keypair,
  destinationWallet: PublicKey,
  amount: number
): Promise<void> {
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mint,
    destinationWallet
  );

  // Create associated token account if it doesn't exist
  const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
  
  const transaction = new Transaction();
  
  if (!accountInfo) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        associatedTokenAddress,
        destinationWallet,
        mint
      )
    );
  }

  // Mint tokens to the destination
  transaction.add(
    createMintToInstruction(
      mint,
      associatedTokenAddress,
      mintAuthority.publicKey,
      amount * (10 ** tokenomics.decimals)
    )
  );

  await connection.sendTransaction(transaction, [payer, mintAuthority]);
}

/**
 * Calculate tax amount based on transaction type
 */
export function calculateTaxAmount(
  amount: number,
  transactionType: 'buy' | 'sell' | 'transfer'
): number {
  if (!tokenomics.taxSystem?.enabled) {
    return 0;
  }

  const taxBps = transactionType === 'buy' 
    ? tokenomics.taxSystem.buyTax
    : transactionType === 'sell'
    ? tokenomics.taxSystem.sellTax
    : tokenomics.taxSystem.transferTax;

  return Math.floor((amount * taxBps) / 10000);
}

/**
 * Calculate tax distribution breakdown
 */
export function calculateTaxDistribution(taxAmount: number) {
  if (!tokenomics.taxSystem?.enabled) {
    return null;
  }

  const distribution = tokenomics.taxSystem.taxDistribution;
  
  return {
    marketing: Math.floor((taxAmount * distribution.marketing) / 100),
    treasury: Math.floor((taxAmount * distribution.treasury) / 100),
    burn: Math.floor((taxAmount * distribution.burn) / 100),
    holderRewards: Math.floor((taxAmount * distribution.holderRewards) / 100),
  };
}

/**
 * Calculate referral rewards distribution across 5 levels
 */
export function calculateReferralRewards(
  tradingVolume: number
): {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  total: number;
} | null {
  if (!tokenomics.taxSystem?.referralRewards?.enabled) {
    return null;
  }

  const referralConfig = tokenomics.taxSystem.referralRewards;
  const totalRewardPool = Math.floor(
    (tradingVolume * referralConfig.taxAllocation) / 100
  );

  const levels = referralConfig.levelDistribution;
  
  return {
    level1: Math.floor((totalRewardPool * levels.level1) / 100),
    level2: Math.floor((totalRewardPool * levels.level2) / 100),
    level3: Math.floor((totalRewardPool * levels.level3) / 100),
    level4: Math.floor((totalRewardPool * levels.level4) / 100),
    level5: Math.floor((totalRewardPool * levels.level5) / 100),
    total: totalRewardPool,
  };
}

/**
 * Get tax configuration
 */
export function getTaxConfig() {
  return tokenomics.taxSystem || null;
}

export { tokenomics };
