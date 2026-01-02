# Tax and Referral System Documentation

## Overview

This document describes the transaction tax system and 5-level referral rewards system that have been integrated into the FACTRADE token ecosystem.

## Transaction Tax System

The FACTRADE token now implements a transaction-based tax system with different rates based on transaction type:

### Tax Rates
- **Buy Transactions**: 2% (200 basis points)
- **Sell Transactions**: 2% (200 basis points)
- **Transfer Transactions**: 1% (100 basis points)

### Tax Distribution
Taxes collected from each transaction are automatically distributed as follows:
- **25% → Marketing Wallet**: Funds platform marketing and growth initiatives
- **25% → Treasury Wallet**: Reserved for platform operations and development
- **25% → Burn**: Permanently removed from circulation (deflationary mechanism)
- **25% → Holder Rewards Pool**: Distributed to token holders proportionally

## 5-Level Referral Rewards System

The referral system incentivizes community growth by rewarding users across 5 levels of referrals.

### Referral Allocation
- **25% of transaction taxes** are allocated to the referral rewards pool
- This pool is distributed across 5 levels of referrers based on trading volume

### Level Distribution
| Level | Description | Share of Referral Pool |
|-------|-------------|------------------------|
| Level 1 | Direct referrals | 40% |
| Level 2 | Second-tier referrals | 20% |
| Level 3 | Third-tier referrals | 15% |
| Level 4 | Fourth-tier referrals | 15% |
| Level 5 | Fifth-tier referrals | 10% |

### How It Works

1. **User Registration**: Users register with a referrer address
2. **Referral Tree Building**: The system automatically tracks up to 5 levels of referrers
3. **Volume Tracking**: All buy and sell transactions contribute to trading volume
4. **Reward Calculation**: On each transaction, rewards are calculated and distributed to all levels
5. **Claiming**: Users can claim their accumulated referral earnings at any time

### Example Calculation

For a $1,000 buy transaction:
1. Total tax: $1,000 × 2% = $20
2. Referral pool allocation: $20 × 25% = $5
3. Distribution:
   - Level 1 (Direct referrer): $5 × 40% = $2.00
   - Level 2: $5 × 20% = $1.00
   - Level 3: $5 × 15% = $0.75
   - Level 4: $5 × 15% = $0.75
   - Level 5: $5 × 10% = $0.50

## Smart Contract Programs

### Tax Distribution Program

**Program ID**: `taxD1stR1But10n111111111111111111111111111`

**Key Features**:
- Configurable tax rates per transaction type
- Automatic distribution to marketing, treasury, burn, and rewards
- Real-time statistics tracking (total taxes collected, total burned)
- Authority-controlled tax rate updates

**Main Instructions**:
- `initialize_tax_config`: Initialize the tax configuration
- `process_tax`: Process tax on a transaction
- `update_tax_rates`: Update tax rates (authority only)

### Referral Rewards Program

**Program ID**: `refRewrDs111111111111111111111111111111111`

**Key Features**:
- 5-level referral tree tracking
- Automatic reward calculation based on trading volume
- Configurable level distribution percentages
- Claim mechanism for accumulated rewards

**Main Instructions**:
- `initialize_referral_config`: Initialize the referral configuration
- `register_referral`: Register a new user with a referrer
- `distribute_referral_rewards`: Calculate and distribute rewards
- `claim_referral_earnings`: Claim accumulated earnings
- `update_referral_config`: Update configuration (authority only)

## Integration in token-config.ts

The token configuration has been updated to include helper functions for tax and referral calculations:

```typescript
// Calculate tax amount based on transaction type
calculateTaxAmount(amount, transactionType)

// Get breakdown of tax distribution
calculateTaxDistribution(taxAmount)

// Calculate referral rewards across 5 levels
calculateReferralRewards(tradingVolume)

// Get tax configuration
getTaxConfig()
```

## tokenomics.json Updates

The `tokenomics.json` file now includes:

```json
{
  "taxSystem": {
    "enabled": true,
    "buyTax": 200,
    "sellTax": 200,
    "transferTax": 100,
    "taxDistribution": {
      "marketing": 25,
      "treasury": 25,
      "burn": 25,
      "holderRewards": 25
    },
    "referralRewards": {
      "enabled": true,
      "taxAllocation": 25,
      "levels": 5,
      "levelDistribution": {
        "level1": 40,
        "level2": 20,
        "level3": 15,
        "level4": 15,
        "level5": 10
      }
    }
  }
}
```

## Deployment Notes

1. **Initialize Tax Config**: Deploy and initialize the tax distribution program with:
   - Marketing wallet address
   - Treasury wallet address
   - Holder rewards pool address
   - Tax rates and distribution percentages

2. **Initialize Referral Config**: Deploy and initialize the referral rewards program with:
   - Reward pool address
   - Tax allocation percentage (25%)
   - Level distribution percentages

3. **Testing**: Before mainnet deployment, thoroughly test on devnet:
   - Tax calculations for all transaction types
   - Referral registration and tree building
   - Reward distribution across all 5 levels
   - Claiming functionality

## Security Considerations

- All tax and reward calculations use checked arithmetic to prevent overflow
- Authority-controlled functions are properly gated
- Referral self-referencing is prevented
- All percentages must sum to 100% (validated on initialization)

## Future Enhancements

- Real-time dashboard showing tax statistics
- Referral tree visualization
- Leaderboard for top referrers
- Trading volume analytics
- Automated distribution scheduler (230-second cycles as per specification)
