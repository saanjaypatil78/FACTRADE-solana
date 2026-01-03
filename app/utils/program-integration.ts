import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Signer,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

/**
 * Program IDs for FACTRADE Solana programs
 * These are placeholder addresses - replace with actual deployed program addresses
 */
export const PROGRAM_IDS = {
  get STAKING() { return new PublicKey('11111111111111111111111111111112') },
  get REWARDS() { return new PublicKey('11111111111111111111111111111113') },
  get GOVERNANCE() { return new PublicKey('11111111111111111111111111111114') },
  get TAX_DISTRIBUTION() { return new PublicKey('11111111111111111111111111111115') },
  get REFERRAL_REWARDS() { return new PublicKey('11111111111111111111111111111116') },
  get LAUNCHPAD() { return new PublicKey('11111111111111111111111111111117') },
};

/**
 * Staking Program Integration
 */
export interface StakeParams {
  userPublicKey: PublicKey;
  amount: number;
  lockPeriod: number; // in days
}

export async function createStakeInstruction(
  params: StakeParams
): Promise<TransactionInstruction> {
  // Derive PDAs for staking
  const [stakingPool] = await PublicKey.findProgramAddress(
    [Buffer.from('staking_pool')],
    PROGRAM_IDS.STAKING
  );

  const [userStake] = await PublicKey.findProgramAddress(
    [Buffer.from('user_stake'), params.userPublicKey.toBuffer()],
    PROGRAM_IDS.STAKING
  );

  // Create instruction data with proper buffer sizing
  const data = Buffer.alloc(17); // 1 (instruction) + 8 (amount) + 1 (lock period) + 7 (padding)
  data.writeUInt8(0, 0); // Instruction index for stake
  data.writeBigUInt64LE(BigInt(params.amount), 1);
  data.writeUInt8(params.lockPeriod, 9);

  return new TransactionInstruction({
    programId: PROGRAM_IDS.STAKING,
    keys: [
      { pubkey: params.userPublicKey, isSigner: true, isWritable: true },
      { pubkey: stakingPool, isSigner: false, isWritable: true },
      { pubkey: userStake, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export async function createUnstakeInstruction(
  userPublicKey: PublicKey
): Promise<TransactionInstruction> {
  const [stakingPool] = await PublicKey.findProgramAddress(
    [Buffer.from('staking_pool')],
    PROGRAM_IDS.STAKING
  );

  const [userStake] = await PublicKey.findProgramAddress(
    [Buffer.from('user_stake'), userPublicKey.toBuffer()],
    PROGRAM_IDS.STAKING
  );

  const data = Buffer.alloc(1);
  data.writeUInt8(1, 0); // Instruction index for unstake

  return new TransactionInstruction({
    programId: PROGRAM_IDS.STAKING,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true },
      { pubkey: stakingPool, isSigner: false, isWritable: true },
      { pubkey: userStake, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Rewards Program Integration
 */
export async function createClaimRewardsInstruction(
  userPublicKey: PublicKey
): Promise<TransactionInstruction> {
  const [rewardsPool] = await PublicKey.findProgramAddress(
    [Buffer.from('rewards_pool')],
    PROGRAM_IDS.REWARDS
  );

  const [userRewards] = await PublicKey.findProgramAddress(
    [Buffer.from('user_rewards'), userPublicKey.toBuffer()],
    PROGRAM_IDS.REWARDS
  );

  const data = Buffer.alloc(1);
  data.writeUInt8(0, 0); // Instruction index for claim

  return new TransactionInstruction({
    programId: PROGRAM_IDS.REWARDS,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true },
      { pubkey: rewardsPool, isSigner: false, isWritable: true },
      { pubkey: userRewards, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export async function createCompoundRewardsInstruction(
  userPublicKey: PublicKey
): Promise<TransactionInstruction> {
  const [rewardsPool] = await PublicKey.findProgramAddress(
    [Buffer.from('rewards_pool')],
    PROGRAM_IDS.REWARDS
  );

  const [userRewards] = await PublicKey.findProgramAddress(
    [Buffer.from('user_rewards'), userPublicKey.toBuffer()],
    PROGRAM_IDS.REWARDS
  );

  const data = Buffer.alloc(1);
  data.writeUInt8(1, 0); // Instruction index for compound

  return new TransactionInstruction({
    programId: PROGRAM_IDS.REWARDS,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true },
      { pubkey: rewardsPool, isSigner: false, isWritable: true },
      { pubkey: userRewards, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Tax Distribution Program Integration
 */
export interface TaxStats {
  totalCollected: number;
  totalBurned: number;
  marketingAllocation: number;
  treasuryAllocation: number;
  holderRewardsAllocation: number;
}

export async function fetchTaxStats(
  connection: Connection
): Promise<TaxStats> {
  try {
    const [taxConfig] = await PublicKey.findProgramAddress(
      [Buffer.from('tax_config')],
      PROGRAM_IDS.TAX_DISTRIBUTION
    );

    const accountInfo = await connection.getAccountInfo(taxConfig);
    
    if (!accountInfo) {
      return {
        totalCollected: 0,
        totalBurned: 0,
        marketingAllocation: 0,
        treasuryAllocation: 0,
        holderRewardsAllocation: 0,
      };
    }

    // Parse account data (simplified - actual parsing depends on program structure)
    // Using BigInt to avoid precision loss for large numbers
    const data = accountInfo.data;
    return {
      totalCollected: Number(data.readBigUInt64LE(8)) / 1e9, // Convert to FACT tokens
      totalBurned: Number(data.readBigUInt64LE(16)) / 1e9,
      marketingAllocation: Number(data.readBigUInt64LE(24)) / 1e9,
      treasuryAllocation: Number(data.readBigUInt64LE(32)) / 1e9,
      holderRewardsAllocation: Number(data.readBigUInt64LE(40)) / 1e9,
    };
  } catch (error) {
    console.error('Error fetching tax stats:', error);
    return {
      totalCollected: 0,
      totalBurned: 0,
      marketingAllocation: 0,
      treasuryAllocation: 0,
      holderRewardsAllocation: 0,
    };
  }
}

/**
 * Referral Rewards Program Integration
 */
export interface ReferralStats {
  totalEarned: number;
  level1Earnings: number;
  level2Earnings: number;
  level3Earnings: number;
  level4Earnings: number;
  level5Earnings: number;
  totalReferrals: number;
  directReferrals: number;
}

export async function fetchReferralStats(
  connection: Connection,
  userPublicKey: PublicKey
): Promise<ReferralStats> {
  try {
    const [referralAccount] = await PublicKey.findProgramAddress(
      [Buffer.from('referral'), userPublicKey.toBuffer()],
      PROGRAM_IDS.REFERRAL_REWARDS
    );

    const accountInfo = await connection.getAccountInfo(referralAccount);
    
    if (!accountInfo) {
      return {
        totalEarned: 0,
        level1Earnings: 0,
        level2Earnings: 0,
        level3Earnings: 0,
        level4Earnings: 0,
        level5Earnings: 0,
        totalReferrals: 0,
        directReferrals: 0,
      };
    }

    // Parse account data
    const data = accountInfo.data;
    return {
      totalEarned: Number(data.readBigUInt64LE(8)),
      level1Earnings: Number(data.readBigUInt64LE(16)),
      level2Earnings: Number(data.readBigUInt64LE(24)),
      level3Earnings: Number(data.readBigUInt64LE(32)),
      level4Earnings: Number(data.readBigUInt64LE(40)),
      level5Earnings: Number(data.readBigUInt64LE(48)),
      totalReferrals: Number(data.readUInt32LE(56)),
      directReferrals: Number(data.readUInt32LE(60)),
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return {
      totalEarned: 0,
      level1Earnings: 0,
      level2Earnings: 0,
      level3Earnings: 0,
      level4Earnings: 0,
      level5Earnings: 0,
      totalReferrals: 0,
      directReferrals: 0,
    };
  }
}

export async function createRegisterReferralInstruction(
  userPublicKey: PublicKey,
  referrerPublicKey: PublicKey
): Promise<TransactionInstruction> {
  const [referralAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('referral'), userPublicKey.toBuffer()],
    PROGRAM_IDS.REFERRAL_REWARDS
  );

  const data = Buffer.concat([
    Buffer.from([0]), // Instruction index for register
    referrerPublicKey.toBuffer(),
  ]);

  return new TransactionInstruction({
    programId: PROGRAM_IDS.REFERRAL_REWARDS,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true },
      { pubkey: referralAccount, isSigner: false, isWritable: true },
      { pubkey: referrerPublicKey, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export async function createClaimReferralEarningsInstruction(
  userPublicKey: PublicKey
): Promise<TransactionInstruction> {
  const [referralAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('referral'), userPublicKey.toBuffer()],
    PROGRAM_IDS.REFERRAL_REWARDS
  );

  const [rewardsPool] = await PublicKey.findProgramAddress(
    [Buffer.from('referral_rewards_pool')],
    PROGRAM_IDS.REFERRAL_REWARDS
  );

  const data = Buffer.alloc(1);
  data.writeUInt8(2, 0); // Instruction index for claim earnings

  return new TransactionInstruction({
    programId: PROGRAM_IDS.REFERRAL_REWARDS,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true },
      { pubkey: referralAccount, isSigner: false, isWritable: true },
      { pubkey: rewardsPool, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Governance Program Integration
 */
export async function createVoteInstruction(
  userPublicKey: PublicKey,
  proposalId: number,
  vote: boolean
): Promise<TransactionInstruction> {
  const [proposal] = await PublicKey.findProgramAddress(
    [Buffer.from('proposal'), Buffer.from(proposalId.toString())],
    PROGRAM_IDS.GOVERNANCE
  );

  const [voteRecord] = await PublicKey.findProgramAddress(
    [Buffer.from('vote'), userPublicKey.toBuffer(), Buffer.from(proposalId.toString())],
    PROGRAM_IDS.GOVERNANCE
  );

  const data = Buffer.alloc(6);
  data.writeUInt8(2, 0); // Instruction index for vote
  data.writeUInt32LE(proposalId, 1);
  data.writeUInt8(vote ? 1 : 0, 5);

  return new TransactionInstruction({
    programId: PROGRAM_IDS.GOVERNANCE,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true },
      { pubkey: proposal, isSigner: false, isWritable: true },
      { pubkey: voteRecord, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Launchpad Program Integration
 */
export interface LaunchpadProject {
  name: string;
  symbol: string;
  totalSupply: number;
  price: number;
  softCap: number;
  hardCap: number;
  startTime: number;
  endTime: number;
}

export async function createLaunchpadProjectInstruction(
  userPublicKey: PublicKey,
  project: LaunchpadProject
): Promise<TransactionInstruction> {
  const [launchpadAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('launchpad'), Buffer.from(project.symbol)],
    PROGRAM_IDS.LAUNCHPAD
  );

  // Encode project data efficiently using a single buffer
  const nameBuffer = Buffer.alloc(32);
  Buffer.from(project.name).copy(nameBuffer);
  
  const symbolBuffer = Buffer.alloc(8);
  Buffer.from(project.symbol).copy(symbolBuffer);
  
  // Pre-allocate buffer for all numeric values (8 bytes * 6 fields = 48 bytes)
  const numericData = Buffer.alloc(48);
  numericData.writeBigUInt64LE(BigInt(project.totalSupply), 0);
  numericData.writeBigUInt64LE(BigInt(project.price), 8);
  numericData.writeBigUInt64LE(BigInt(project.softCap), 16);
  numericData.writeBigUInt64LE(BigInt(project.hardCap), 24);
  numericData.writeBigUInt64LE(BigInt(project.startTime), 32);
  numericData.writeBigUInt64LE(BigInt(project.endTime), 40);
  
  const data = Buffer.concat([
    Buffer.from([0]), // Instruction index for create project
    nameBuffer,
    symbolBuffer,
    numericData,
  ]);

  return new TransactionInstruction({
    programId: PROGRAM_IDS.LAUNCHPAD,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true },
      { pubkey: launchpadAccount, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export async function createInvestInstruction(
  userPublicKey: PublicKey,
  projectSymbol: string,
  amount: number
): Promise<TransactionInstruction> {
  const [launchpadAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('launchpad'), Buffer.from(projectSymbol)],
    PROGRAM_IDS.LAUNCHPAD
  );

  const [investorAccount] = await PublicKey.findProgramAddress(
    [Buffer.from('investor'), userPublicKey.toBuffer(), Buffer.from(projectSymbol)],
    PROGRAM_IDS.LAUNCHPAD
  );

  const data = Buffer.alloc(9);
  data.writeUInt8(1, 0); // Instruction index for invest
  data.writeBigUInt64LE(BigInt(amount), 1);

  return new TransactionInstruction({
    programId: PROGRAM_IDS.LAUNCHPAD,
    keys: [
      { pubkey: userPublicKey, isSigner: true, isWritable: true },
      { pubkey: launchpadAccount, isSigner: false, isWritable: true },
      { pubkey: investorAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Helper function to send and confirm transaction
 */
export async function sendAndConfirmTransactionWithRetry(
  connection: Connection,
  transaction: Transaction,
  signers: Signer[]
): Promise<string> {
  try {
    const signature = await connection.sendTransaction(transaction, signers, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });

    await connection.confirmTransaction(signature, 'confirmed');
    return signature;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}
