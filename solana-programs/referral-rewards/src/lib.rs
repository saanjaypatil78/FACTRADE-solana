use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("refRewrDs111111111111111111111111111111111");

#[program]
pub mod referral_rewards {
    use super::*;

    pub fn initialize_referral_config(
        ctx: Context<InitializeReferralConfig>,
        tax_allocation_percentage: u8,
        level1_share: u8,
        level2_share: u8,
        level3_share: u8,
        level4_share: u8,
        level5_share: u8,
    ) -> Result<()> {
        let referral_config = &mut ctx.accounts.referral_config;
        
        require!(
            level1_share + level2_share + level3_share + level4_share + level5_share == 100,
            ErrorCode::InvalidLevelDistribution
        );
        
        referral_config.authority = ctx.accounts.authority.key();
        referral_config.token_mint = ctx.accounts.token_mint.key();
        referral_config.reward_pool = ctx.accounts.reward_pool.key();
        referral_config.tax_allocation_percentage = tax_allocation_percentage;
        referral_config.level1_share = level1_share;
        referral_config.level2_share = level2_share;
        referral_config.level3_share = level3_share;
        referral_config.level4_share = level4_share;
        referral_config.level5_share = level5_share;
        referral_config.total_referrals = 0;
        referral_config.total_rewards_distributed = 0;
        referral_config.bump = ctx.bumps.referral_config;

        emit!(ReferralConfigInitialized {
            config: referral_config.key(),
            authority: referral_config.authority,
            tax_allocation_percentage,
        });

        Ok(())
    }

    pub fn register_referral(
        ctx: Context<RegisterReferral>,
        referrer: Pubkey,
    ) -> Result<()> {
        let referral_account = &mut ctx.accounts.referral_account;
        
        require!(
            referrer != ctx.accounts.user.key(),
            ErrorCode::CannotReferSelf
        );
        
        referral_account.user = ctx.accounts.user.key();
        referral_account.referrer = referrer;
        
        // Build referral tree by fetching parent's referral chain
        if ctx.accounts.parent_referral_account.is_some() {
            let parent = ctx.accounts.parent_referral_account.as_ref().unwrap();
            referral_account.level_2 = parent.referrer;
            referral_account.level_3 = parent.level_2;
            referral_account.level_4 = parent.level_3;
            referral_account.level_5 = parent.level_4;
        } else {
            referral_account.level_2 = Pubkey::default();
            referral_account.level_3 = Pubkey::default();
            referral_account.level_4 = Pubkey::default();
            referral_account.level_5 = Pubkey::default();
        }
        
        referral_account.total_volume = 0;
        referral_account.total_earned = 0;
        referral_account.referral_count = 0;
        referral_account.bump = ctx.bumps.referral_account;

        let referral_config = &mut ctx.accounts.referral_config;
        referral_config.total_referrals = referral_config.total_referrals
            .checked_add(1)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        emit!(ReferralRegistered {
            user: ctx.accounts.user.key(),
            referrer,
            level_2: referral_account.level_2,
            level_3: referral_account.level_3,
            level_4: referral_account.level_4,
            level_5: referral_account.level_5,
        });

        Ok(())
    }

    pub fn distribute_referral_rewards(
        ctx: Context<DistributeReferralRewards>,
        trading_volume: u64,
    ) -> Result<()> {
        let referral_config = &ctx.accounts.referral_config;
        let referral_account = &ctx.accounts.referral_account;
        
        // Calculate total referral reward pool from trading volume
        let total_reward_pool = (trading_volume as u128)
            .checked_mul(referral_config.tax_allocation_percentage as u128)
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_div(100)
            .ok_or(ErrorCode::ArithmeticOverflow)? as u64;

        require!(total_reward_pool > 0, ErrorCode::RewardPoolTooSmall);

        let mut rewards = Vec::new();

        // Level 1 (Direct referrer) - 40%
        if referral_account.referrer != Pubkey::default() {
            let level1_amount = (total_reward_pool as u128)
                .checked_mul(referral_config.level1_share as u128)
                .ok_or(ErrorCode::ArithmeticOverflow)?
                .checked_div(100)
                .ok_or(ErrorCode::ArithmeticOverflow)? as u64;
            if level1_amount > 0 {
                rewards.push((referral_account.referrer, level1_amount, 1u8));
            }
        }

        // Level 2 - 20%
        if referral_account.level_2 != Pubkey::default() {
            let level2_amount = (total_reward_pool as u128)
                .checked_mul(referral_config.level2_share as u128)
                .ok_or(ErrorCode::ArithmeticOverflow)?
                .checked_div(100)
                .ok_or(ErrorCode::ArithmeticOverflow)? as u64;
            if level2_amount > 0 {
                rewards.push((referral_account.level_2, level2_amount, 2u8));
            }
        }

        // Level 3 - 15%
        if referral_account.level_3 != Pubkey::default() {
            let level3_amount = (total_reward_pool as u128)
                .checked_mul(referral_config.level3_share as u128)
                .ok_or(ErrorCode::ArithmeticOverflow)?
                .checked_div(100)
                .ok_or(ErrorCode::ArithmeticOverflow)? as u64;
            if level3_amount > 0 {
                rewards.push((referral_account.level_3, level3_amount, 3u8));
            }
        }

        // Level 4 - 15%
        if referral_account.level_4 != Pubkey::default() {
            let level4_amount = (total_reward_pool as u128)
                .checked_mul(referral_config.level4_share as u128)
                .ok_or(ErrorCode::ArithmeticOverflow)?
                .checked_div(100)
                .ok_or(ErrorCode::ArithmeticOverflow)? as u64;
            if level4_amount > 0 {
                rewards.push((referral_account.level_4, level4_amount, 4u8));
            }
        }

        // Level 5 - 10%
        if referral_account.level_5 != Pubkey::default() {
            let level5_amount = (total_reward_pool as u128)
                .checked_mul(referral_config.level5_share as u128)
                .ok_or(ErrorCode::ArithmeticOverflow)?
                .checked_div(100)
                .ok_or(ErrorCode::ArithmeticOverflow)? as u64;
            if level5_amount > 0 {
                rewards.push((referral_account.level_5, level5_amount, 5u8));
            }
        }

        // Distribute rewards from reward pool
        let seeds = &[
            b"referral_config",
            referral_config.token_mint.as_ref(),
            &[referral_config.bump],
        ];
        let signer = &[&seeds[..]];

        // Note: Actual token transfers would require passing recipient token accounts
        // for each level. To keep the instruction simple, this function only
        // calculates and emits reward events. A separate batch transfer instruction
        // or off-chain service should be used to actually distribute tokens based on
        // the emitted events. This is a common pattern in Solana programs to avoid
        // account limit issues when dealing with many recipients.
        for (recipient, amount, level) in rewards.iter() {
            emit!(ReferralRewardDistributed {
                recipient: *recipient,
                amount: *amount,
                level: *level,
                user: ctx.accounts.user.key(),
                trading_volume,
            });
        }

        // Update statistics
        let referral_account = &mut ctx.accounts.referral_account;
        referral_account.total_volume = referral_account.total_volume
            .checked_add(trading_volume)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        let referral_config = &mut ctx.accounts.referral_config;
        referral_config.total_rewards_distributed = referral_config.total_rewards_distributed
            .checked_add(total_reward_pool)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        Ok(())
    }

    pub fn initialize_referral_stats(
        ctx: Context<InitializeReferralStats>,
    ) -> Result<()> {
        let referral_stats = &mut ctx.accounts.referral_stats;
        referral_stats.user = ctx.accounts.user.key();
        referral_stats.pending_rewards = 0;
        referral_stats.total_claimed = 0;
        referral_stats.bump = ctx.bumps.referral_stats;

        Ok(())
    }

    pub fn claim_referral_earnings(
        ctx: Context<ClaimReferralEarnings>,
    ) -> Result<()> {
        let referral_stats = &mut ctx.accounts.referral_stats;
        
        require!(referral_stats.pending_rewards > 0, ErrorCode::NoRewardsToClaim);

        let referral_config = &ctx.accounts.referral_config;
        let seeds = &[
            b"referral_config",
            referral_config.token_mint.as_ref(),
            &[referral_config.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.reward_pool.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: referral_config.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::transfer(cpi_ctx, referral_stats.pending_rewards)?;

        referral_stats.total_claimed = referral_stats.total_claimed
            .checked_add(referral_stats.pending_rewards)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
        let claimed_amount = referral_stats.pending_rewards;
        referral_stats.pending_rewards = 0;

        emit!(ReferralEarningsClaimed {
            user: ctx.accounts.user.key(),
            amount: claimed_amount,
        });

        Ok(())
    }

    pub fn update_referral_config(
        ctx: Context<UpdateReferralConfig>,
        tax_allocation_percentage: Option<u8>,
    ) -> Result<()> {
        let referral_config = &mut ctx.accounts.referral_config;
        
        if let Some(percentage) = tax_allocation_percentage {
            require!(percentage <= 100, ErrorCode::InvalidPercentage);
            referral_config.tax_allocation_percentage = percentage;
        }

        emit!(ReferralConfigUpdated {
            config: referral_config.key(),
            tax_allocation_percentage: referral_config.tax_allocation_percentage,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeReferralConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ReferralConfig::INIT_SPACE,
        seeds = [b"referral_config", token_mint.key().as_ref()],
        bump
    )]
    pub referral_config: Account<'info, ReferralConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_mint: Account<'info, Mint>,

    /// CHECK: Reward pool token account
    pub reward_pool: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterReferral<'info> {
    #[account(
        mut,
        seeds = [b"referral_config", referral_config.token_mint.as_ref()],
        bump = referral_config.bump
    )]
    pub referral_config: Account<'info, ReferralConfig>,

    #[account(
        init,
        payer = user,
        space = 8 + ReferralAccount::INIT_SPACE,
        seeds = [b"referral_account", user.key().as_ref()],
        bump
    )]
    pub referral_account: Account<'info, ReferralAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    /// Optional parent referral account to build the tree
    pub parent_referral_account: Option<Account<'info, ReferralAccount>>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeReferralRewards<'info> {
    #[account(
        mut,
        seeds = [b"referral_config", referral_config.token_mint.as_ref()],
        bump = referral_config.bump
    )]
    pub referral_config: Account<'info, ReferralConfig>,

    #[account(
        mut,
        seeds = [b"referral_account", user.key().as_ref()],
        bump = referral_account.bump
    )]
    pub referral_account: Account<'info, ReferralAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub reward_pool: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct InitializeReferralStats<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + ReferralStats::INIT_SPACE,
        seeds = [b"referral_stats", user.key().as_ref()],
        bump
    )]
    pub referral_stats: Account<'info, ReferralStats>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimReferralEarnings<'info> {
    #[account(
        seeds = [b"referral_config", referral_config.token_mint.as_ref()],
        bump = referral_config.bump
    )]
    pub referral_config: Account<'info, ReferralConfig>,

    #[account(
        mut,
        seeds = [b"referral_stats", user.key().as_ref()],
        bump = referral_stats.bump
    )]
    pub referral_stats: Account<'info, ReferralStats>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub reward_pool: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateReferralConfig<'info> {
    #[account(
        mut,
        seeds = [b"referral_config", referral_config.token_mint.as_ref()],
        bump = referral_config.bump,
        has_one = authority
    )]
    pub referral_config: Account<'info, ReferralConfig>,

    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct ReferralConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub reward_pool: Pubkey,
    pub tax_allocation_percentage: u8,
    pub level1_share: u8,
    pub level2_share: u8,
    pub level3_share: u8,
    pub level4_share: u8,
    pub level5_share: u8,
    pub total_referrals: u64,
    pub total_rewards_distributed: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ReferralAccount {
    pub user: Pubkey,
    pub referrer: Pubkey,
    pub level_2: Pubkey,
    pub level_3: Pubkey,
    pub level_4: Pubkey,
    pub level_5: Pubkey,
    pub total_volume: u64,
    pub total_earned: u64,
    pub referral_count: u32,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct ReferralStats {
    pub user: Pubkey,
    pub pending_rewards: u64,
    pub total_claimed: u64,
    pub bump: u8,
}

#[event]
pub struct ReferralConfigInitialized {
    pub config: Pubkey,
    pub authority: Pubkey,
    pub tax_allocation_percentage: u8,
}

#[event]
pub struct ReferralRegistered {
    pub user: Pubkey,
    pub referrer: Pubkey,
    pub level_2: Pubkey,
    pub level_3: Pubkey,
    pub level_4: Pubkey,
    pub level_5: Pubkey,
}

#[event]
pub struct ReferralRewardDistributed {
    pub recipient: Pubkey,
    pub amount: u64,
    pub level: u8,
    pub user: Pubkey,
    pub trading_volume: u64,
}

#[event]
pub struct ReferralEarningsClaimed {
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct ReferralConfigUpdated {
    pub config: Pubkey,
    pub tax_allocation_percentage: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Level distribution percentages must sum to 100")]
    InvalidLevelDistribution,
    #[msg("Cannot refer yourself")]
    CannotReferSelf,
    #[msg("Reward pool amount is too small")]
    RewardPoolTooSmall,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    #[msg("Invalid percentage value")]
    InvalidPercentage,
    #[msg("Arithmetic overflow in calculation")]
    ArithmeticOverflow,
}
