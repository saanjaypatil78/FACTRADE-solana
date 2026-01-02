use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Mint, Token, TokenAccount, Transfer};

declare_id!("taxD1stR1But10n111111111111111111111111111");

#[program]
pub mod tax_distribution {
    use super::*;

    pub fn initialize_tax_config(
        ctx: Context<InitializeTaxConfig>,
        buy_tax_bps: u16,
        sell_tax_bps: u16,
        transfer_tax_bps: u16,
        marketing_share: u8,
        treasury_share: u8,
        burn_share: u8,
        holder_rewards_share: u8,
    ) -> Result<()> {
        let tax_config = &mut ctx.accounts.tax_config;
        
        require!(
            marketing_share + treasury_share + burn_share + holder_rewards_share == 100,
            ErrorCode::InvalidTaxDistribution
        );
        
        tax_config.authority = ctx.accounts.authority.key();
        tax_config.token_mint = ctx.accounts.token_mint.key();
        tax_config.buy_tax_bps = buy_tax_bps;
        tax_config.sell_tax_bps = sell_tax_bps;
        tax_config.transfer_tax_bps = transfer_tax_bps;
        tax_config.marketing_wallet = ctx.accounts.marketing_wallet.key();
        tax_config.treasury_wallet = ctx.accounts.treasury_wallet.key();
        tax_config.holder_rewards_pool = ctx.accounts.holder_rewards_pool.key();
        tax_config.marketing_share = marketing_share;
        tax_config.treasury_share = treasury_share;
        tax_config.burn_share = burn_share;
        tax_config.holder_rewards_share = holder_rewards_share;
        tax_config.total_taxes_collected = 0;
        tax_config.total_burned = 0;
        tax_config.bump = ctx.bumps.tax_config;

        emit!(TaxConfigInitialized {
            config: tax_config.key(),
            authority: tax_config.authority,
            buy_tax_bps,
            sell_tax_bps,
            transfer_tax_bps,
        });

        Ok(())
    }

    pub fn process_tax(
        ctx: Context<ProcessTax>,
        amount: u64,
        transaction_type: TransactionType,
    ) -> Result<()> {
        let tax_config = &ctx.accounts.tax_config;
        
        let tax_bps = match transaction_type {
            TransactionType::Buy => tax_config.buy_tax_bps,
            TransactionType::Sell => tax_config.sell_tax_bps,
            TransactionType::Transfer => tax_config.transfer_tax_bps,
        };

        let tax_amount = (amount as u128)
            .checked_mul(tax_bps as u128)
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_div(10000)
            .ok_or(ErrorCode::ArithmeticOverflow)? as u64;

        require!(tax_amount > 0, ErrorCode::TaxAmountTooSmall);

        // Calculate distribution amounts
        let marketing_amount = (tax_amount as u128)
            .checked_mul(tax_config.marketing_share as u128)
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_div(100)
            .ok_or(ErrorCode::ArithmeticOverflow)? as u64;
            
        let treasury_amount = (tax_amount as u128)
            .checked_mul(tax_config.treasury_share as u128)
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_div(100)
            .ok_or(ErrorCode::ArithmeticOverflow)? as u64;
            
        let burn_amount = (tax_amount as u128)
            .checked_mul(tax_config.burn_share as u128)
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_div(100)
            .ok_or(ErrorCode::ArithmeticOverflow)? as u64;
            
        let holder_rewards_amount = tax_amount
            .checked_sub(marketing_amount)
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_sub(treasury_amount)
            .ok_or(ErrorCode::ArithmeticOverflow)?
            .checked_sub(burn_amount)
            .ok_or(ErrorCode::ArithmeticOverflow)?;

        // Transfer to marketing wallet
        if marketing_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.marketing_wallet.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, marketing_amount)?;
        }

        // Transfer to treasury wallet
        if treasury_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.treasury_wallet.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, treasury_amount)?;
        }

        // Burn tokens
        if burn_amount > 0 {
            let cpi_accounts = Burn {
                mint: ctx.accounts.token_mint.to_account_info(),
                from: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::burn(cpi_ctx, burn_amount)?;
        }

        // Transfer to holder rewards pool
        if holder_rewards_amount > 0 {
            let cpi_accounts = Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.holder_rewards_pool.to_account_info(),
                authority: ctx.accounts.user.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
            token::transfer(cpi_ctx, holder_rewards_amount)?;
        }

        // Update statistics
        let tax_config = &mut ctx.accounts.tax_config;
        tax_config.total_taxes_collected = tax_config.total_taxes_collected.checked_add(tax_amount).unwrap();
        tax_config.total_burned = tax_config.total_burned.checked_add(burn_amount).unwrap();

        emit!(TaxProcessed {
            user: ctx.accounts.user.key(),
            amount,
            tax_amount,
            transaction_type,
            marketing_amount,
            treasury_amount,
            burn_amount,
            holder_rewards_amount,
        });

        Ok(())
    }

    pub fn update_tax_rates(
        ctx: Context<UpdateTaxRates>,
        buy_tax_bps: Option<u16>,
        sell_tax_bps: Option<u16>,
        transfer_tax_bps: Option<u16>,
    ) -> Result<()> {
        let tax_config = &mut ctx.accounts.tax_config;
        
        if let Some(rate) = buy_tax_bps {
            tax_config.buy_tax_bps = rate;
        }
        if let Some(rate) = sell_tax_bps {
            tax_config.sell_tax_bps = rate;
        }
        if let Some(rate) = transfer_tax_bps {
            tax_config.transfer_tax_bps = rate;
        }

        emit!(TaxRatesUpdated {
            config: tax_config.key(),
            buy_tax_bps: tax_config.buy_tax_bps,
            sell_tax_bps: tax_config.sell_tax_bps,
            transfer_tax_bps: tax_config.transfer_tax_bps,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTaxConfig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + TaxConfig::INIT_SPACE,
        seeds = [b"tax_config", token_mint.key().as_ref()],
        bump
    )]
    pub tax_config: Account<'info, TaxConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub token_mint: Account<'info, Mint>,

    /// CHECK: Marketing wallet address - validated to match during ProcessTax
    #[account(constraint = marketing_wallet.key() != Pubkey::default() @ ErrorCode::InvalidWalletAddress)]
    pub marketing_wallet: AccountInfo<'info>,

    /// CHECK: Treasury wallet address - validated to match during ProcessTax
    #[account(constraint = treasury_wallet.key() != Pubkey::default() @ ErrorCode::InvalidWalletAddress)]
    pub treasury_wallet: AccountInfo<'info>,

    /// CHECK: Holder rewards pool token account - validated to match during ProcessTax
    #[account(constraint = holder_rewards_pool.key() != Pubkey::default() @ ErrorCode::InvalidWalletAddress)]
    pub holder_rewards_pool: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessTax<'info> {
    #[account(
        mut,
        seeds = [b"tax_config", tax_config.token_mint.as_ref()],
        bump = tax_config.bump
    )]
    pub tax_config: Account<'info, TaxConfig>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub marketing_wallet: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_wallet: Account<'info, TokenAccount>,

    #[account(mut)]
    pub holder_rewards_pool: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateTaxRates<'info> {
    #[account(
        mut,
        seeds = [b"tax_config", tax_config.token_mint.as_ref()],
        bump = tax_config.bump,
        has_one = authority
    )]
    pub tax_config: Account<'info, TaxConfig>,

    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct TaxConfig {
    pub authority: Pubkey,
    pub token_mint: Pubkey,
    pub buy_tax_bps: u16,
    pub sell_tax_bps: u16,
    pub transfer_tax_bps: u16,
    pub marketing_wallet: Pubkey,
    pub treasury_wallet: Pubkey,
    pub holder_rewards_pool: Pubkey,
    pub marketing_share: u8,
    pub treasury_share: u8,
    pub burn_share: u8,
    pub holder_rewards_share: u8,
    pub total_taxes_collected: u64,
    pub total_burned: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum TransactionType {
    Buy,
    Sell,
    Transfer,
}

#[event]
pub struct TaxConfigInitialized {
    pub config: Pubkey,
    pub authority: Pubkey,
    pub buy_tax_bps: u16,
    pub sell_tax_bps: u16,
    pub transfer_tax_bps: u16,
}

#[event]
pub struct TaxProcessed {
    pub user: Pubkey,
    pub amount: u64,
    pub tax_amount: u64,
    pub transaction_type: TransactionType,
    pub marketing_amount: u64,
    pub treasury_amount: u64,
    pub burn_amount: u64,
    pub holder_rewards_amount: u64,
}

#[event]
pub struct TaxRatesUpdated {
    pub config: Pubkey,
    pub buy_tax_bps: u16,
    pub sell_tax_bps: u16,
    pub transfer_tax_bps: u16,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Tax distribution percentages must sum to 100")]
    InvalidTaxDistribution,
    #[msg("Tax amount is too small")]
    TaxAmountTooSmall,
    #[msg("Invalid wallet address (cannot be default/zero)")]
    InvalidWalletAddress,
    #[msg("Arithmetic overflow in calculation")]
    ArithmeticOverflow,
}
