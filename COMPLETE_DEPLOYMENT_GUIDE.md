# Complete Deployment Guide for FACTRADE Solana Platform

This guide provides step-by-step instructions to deploy the FACTRADE token and Solana programs to the blockchain.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deploy Token](#deploy-token)
4. [Deploy Programs](#deploy-programs)
5. [Initialize Programs](#initialize-programs)
6. [Distribute Tokens](#distribute-tokens)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- **Node.js** 18+ and npm
- **Solana CLI** v1.18+
- **Anchor CLI** v0.29.0
- **Rust** (for building programs)

### Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"
export PATH="/home/runner/.local/share/solana/install/active_release/bin:$PATH"
solana --version
```

### Install Anchor
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked
anchor --version
```

### Install Project Dependencies
```bash
npm install
```

---

## Environment Setup

### 1. Create Solana Wallet

For **devnet** (testing):
```bash
solana-keygen new --outfile ~/.config/solana/id.json
solana config set --url https://api.devnet.solana.com
solana airdrop 2
```

For **mainnet** (production):
```bash
solana-keygen new --outfile ~/.config/solana/mainnet.json
solana config set --keypair ~/.config/solana/mainnet.json
solana config set --url https://api.mainnet-beta.solana.com
# Transfer SOL to this wallet (minimum 5 SOL recommended)
```

### 2. Configure Environment Variables

Create `.env.local`:
```bash
# Network (devnet, testnet, or mainnet-beta)
SOLANA_NETWORK=devnet

# RPC URL (optional, defaults to public endpoints)
SOLANA_RPC_URL=https://api.devnet.solana.com

# Wallet path (optional, defaults to ~/.config/solana/id.json)
WALLET_PATH=~/.config/solana/id.json
```

### 3. Verify Configuration
```bash
solana config get
solana balance
```

Ensure you have at least 2 SOL for devnet or 5 SOL for mainnet deployment.

---

## Deploy Token

### Step 1: Review Tokenomics

Check the token configuration in `programs/factrade-token/tokenomics.json`:
- Token Name: FACTRADE Token
- Symbol: FACT
- Decimals: 9
- Total Supply: 1,000,000,000 FACT
- Distribution: Public Sale 40%, Team 20%, Liquidity 15%, Ecosystem 15%, Reserve 10%

### Step 2: Deploy Token to Devnet

```bash
SOLANA_NETWORK=devnet npx ts-node scripts/deploy-token.ts
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║        FACTRADE Token Deployment Script                   ║
╚════════════════════════════════════════════════════════════╝

📋 Configuration:
   Network: devnet
   RPC URL: https://api.devnet.solana.com

🔐 Loading wallet...
   ✓ Wallet loaded: YOUR_WALLET_ADDRESS

🌐 Connecting to Solana cluster...
   ✓ Connected to devnet
   ✓ Balance: 2.0000 SOL

🪙 Token Information:
   Name:         FACTRADE Token
   Symbol:       FACT
   Decimals:     9
   Total Supply: 1,000,000,000 FACT

🚀 Creating token mint...
   ✓ Token mint created!
   ✓ Mint address: YOUR_TOKEN_MINT_ADDRESS

✅ Deployment Complete!
═══════════════════════════════════════════════════════════
Token Mint Address: YOUR_TOKEN_MINT_ADDRESS
Explorer URL: https://explorer.solana.com/address/YOUR_TOKEN_MINT_ADDRESS?cluster=devnet
Deployment Info: deployments/token-devnet-TIMESTAMP.json
═══════════════════════════════════════════════════════════
```

### Step 3: Save Token Mint Address

The token mint address will be saved in `deployments/token-devnet-latest.json`. 

**Important:** Save this address - you'll need it for all subsequent steps!

```bash
# View deployment info
cat deployments/token-devnet-latest.json
```

### Step 4: Update Configuration

Update `.env.local` with your token mint address:
```bash
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=YOUR_TOKEN_MINT_ADDRESS
```

---

## Deploy Programs

### Step 1: Build Programs

```bash
cd solana-programs
anchor build
```

This compiles all three programs:
- Staking Program
- Rewards Program
- Governance Program

### Step 2: Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

**Output:**
```
Deploying cluster: devnet
Upgrade authority: YOUR_WALLET_ADDRESS

Deploying program "staking_program"...
Program Id: STAKING_PROGRAM_ID

Deploying program "rewards_program"...
Program Id: REWARDS_PROGRAM_ID

Deploying program "governance_program"...
Program Id: GOVERNANCE_PROGRAM_ID

Deploy success
```

### Step 3: Update Anchor.toml

The program IDs are automatically updated in `Anchor.toml`. Verify:
```bash
cat Anchor.toml
```

### Step 4: Update Environment Variables

Add program IDs to `.env.local`:
```bash
NEXT_PUBLIC_STAKING_PROGRAM_ID=STAKING_PROGRAM_ID
NEXT_PUBLIC_REWARDS_PROGRAM_ID=REWARDS_PROGRAM_ID
NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID=GOVERNANCE_PROGRAM_ID
```

---

## Initialize Programs

### Using Anchor Tests (Recommended)

The easiest way to initialize programs is using Anchor tests:

```bash
cd solana-programs
anchor test --skip-build --skip-deploy
```

### Manual Initialization (Advanced)

If you prefer manual initialization:

```bash
npx ts-node scripts/initialize-programs.ts YOUR_TOKEN_MINT_ADDRESS
```

This script provides the parameters needed for manual initialization.

#### Staking Program

```typescript
// Initialize staking pool with these parameters:
{
  unbonding_period_7: 604800,      // 7 days in seconds
  unbonding_period_14: 1209600,    // 14 days in seconds
  unbonding_period_30: 2592000,    // 30 days in seconds
  reward_multiplier_7: 1000,       // 1x (scaled by 1000)
  reward_multiplier_14: 1500,      // 1.5x (scaled by 1000)
  reward_multiplier_30: 2000,      // 2x (scaled by 1000)
  min_stake_amount: 1000000000     // 1 FACT (with 9 decimals)
}
```

#### Rewards Program

```typescript
// Initialize rewards pool with these parameters:
{
  base_apy: 1200,              // 12% (scaled by 100)
  min_apy: 1200,               // 12% (scaled by 100)
  max_apy: 2500,               // 25% (scaled by 100)
  compound_frequency: 86400,   // Daily (in seconds)
  emergency_pause: false
}
```

#### Governance Program

```typescript
// Initialize governance with these parameters:
{
  voting_period: 604800,                    // 7 days in seconds
  min_voting_power: 100000000000000,        // 100,000 FACT (with 9 decimals)
  quorum_percentage: 10                     // 10%
}
```

---

## Distribute Tokens

### Step 1: Configure Distribution Wallets

First run will create a template:
```bash
npx ts-node scripts/distribute-tokens.ts YOUR_TOKEN_MINT_ADDRESS
```

This creates `distribution-wallets.json` with a template.

### Step 2: Update Wallet Addresses

Edit `distribution-wallets.json` and replace placeholder addresses:
```json
{
  "publicSale": {
    "address": "YOUR_PUBLIC_SALE_WALLET_ADDRESS",
    "amount": 400000000,
    "description": "Tokens available for public sale"
  },
  "team": {
    "address": "YOUR_TEAM_WALLET_ADDRESS",
    "amount": 200000000,
    "description": "Team allocation with vesting"
  },
  "liquidity": {
    "address": "YOUR_LIQUIDITY_WALLET_ADDRESS",
    "amount": 150000000,
    "description": "Liquidity provision for DEX"
  },
  "ecosystem": {
    "address": "YOUR_ECOSYSTEM_WALLET_ADDRESS",
    "amount": 150000000,
    "description": "Ecosystem development and partnerships"
  },
  "reserve": {
    "address": "YOUR_RESERVE_WALLET_ADDRESS",
    "amount": 100000000,
    "description": "Reserve fund for future development"
  }
}
```

### Step 3: Execute Distribution

```bash
npx ts-node scripts/distribute-tokens.ts YOUR_TOKEN_MINT_ADDRESS
```

**Output:**
```
╔════════════════════════════════════════════════════════════╗
║      FACTRADE Token Distribution Script                   ║
╚════════════════════════════════════════════════════════════╝

Distribution Plan:
   publicSale  :   400,000,000 FACT → WALLET_ADDRESS
   team        :   200,000,000 FACT → WALLET_ADDRESS
   liquidity   :   150,000,000 FACT → WALLET_ADDRESS
   ecosystem   :   150,000,000 FACT → WALLET_ADDRESS
   reserve     :   100,000,000 FACT → WALLET_ADDRESS
   ──────────────────────────────────────────────────────────
   TOTAL       : 1,000,000,000 FACT

🚀 Distributing tokens...
   ✓ Success for all wallets

✅ Distribution Complete!
```

---

## Verification

### Verify Token on Explorer

Visit Solana Explorer:
- Devnet: `https://explorer.solana.com/address/YOUR_TOKEN_MINT_ADDRESS?cluster=devnet`
- Mainnet: `https://explorer.solana.com/address/YOUR_TOKEN_MINT_ADDRESS`

### Verify Token Supply

```bash
spl-token supply YOUR_TOKEN_MINT_ADDRESS
```

Expected output: `1000000000`

### Verify Token Accounts

```bash
spl-token accounts YOUR_TOKEN_MINT_ADDRESS
```

Should show all distribution wallet accounts with correct balances.

### Verify Programs

Check each program is deployed:
```bash
solana program show STAKING_PROGRAM_ID
solana program show REWARDS_PROGRAM_ID
solana program show GOVERNANCE_PROGRAM_ID
```

### Test Frontend Connection

```bash
npm run dev
```

Visit `http://localhost:3000` and:
1. Connect your wallet
2. Verify token balance displays
3. Test staking interface
4. Check rewards display
5. View governance proposals

---

## Mainnet Deployment

### ⚠️ IMPORTANT WARNINGS

1. **Test Everything on Devnet First**
2. **Backup Your Wallet Keys**
3. **Double-Check All Addresses**
4. **Have Sufficient SOL (5+ recommended)**
5. **This is Irreversible**

### Mainnet Deployment Steps

```bash
# Set network to mainnet
export SOLANA_NETWORK=mainnet-beta
solana config set --url https://api.mainnet-beta.solana.com

# Deploy token
npx ts-node scripts/deploy-token.ts

# Deploy programs
cd solana-programs
anchor deploy --provider.cluster mainnet-beta

# Initialize programs (use Anchor tests or manual)
anchor test --skip-build --skip-deploy

# Distribute tokens
npx ts-node scripts/distribute-tokens.ts YOUR_TOKEN_MINT_ADDRESS
```

---

## Troubleshooting

### Issue: "Insufficient balance"

**Solution:**
```bash
# For devnet
solana airdrop 2

# For mainnet
# Transfer SOL from exchange or another wallet
```

### Issue: "Transaction failed"

**Causes:**
- Network congestion
- Insufficient compute units
- Account already exists

**Solution:**
- Wait and retry
- Increase priority fee
- Check account states

### Issue: "Program deployment failed"

**Solution:**
```bash
# Increase program size if needed
solana program extend PROGRAM_ID ADDITIONAL_BYTES

# Verify sufficient balance
solana balance
```

### Issue: "Token mint failed"

**Solution:**
- Ensure wallet has sufficient SOL
- Check network status
- Verify no duplicate mint attempts

### Issue: "Distribution failed"

**Solution:**
- Verify wallet addresses are correct
- Check mint authority matches
- Ensure destination wallets exist

---

## Post-Deployment Checklist

- [ ] Token mint deployed and verified on Explorer
- [ ] All three programs deployed successfully
- [ ] Programs initialized with correct parameters
- [ ] Tokens distributed to all wallets
- [ ] Frontend updated with contract addresses
- [ ] Frontend tested and working
- [ ] Deployment info saved and backed up
- [ ] Wallet keys securely stored
- [ ] Documentation updated
- [ ] Team notified of deployment

---

## Security Best Practices

1. **Never share private keys**
2. **Use hardware wallets for mainnet**
3. **Implement multi-sig for program upgrades**
4. **Regular security audits**
5. **Monitor program accounts**
6. **Have emergency pause mechanisms**
7. **Test extensively on devnet**
8. **Gradual rollout strategy**

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/saanjaypatil78/FACTRADE-solana/issues
- Review documentation in this repository
- Consult Solana documentation: https://docs.solana.com
- Anchor documentation: https://www.anchor-lang.com

---

## Next Steps After Deployment

1. **Register Token**
   - Submit to Solana token registry
   - List on CoinGecko/CoinMarketCap

2. **Create Liquidity**
   - Provide liquidity on Raydium/Orca
   - Set up trading pairs

3. **Marketing**
   - Announce launch
   - Share contract addresses
   - Community engagement

4. **Monitoring**
   - Set up alerting
   - Track metrics
   - Monitor transactions

5. **Ongoing Development**
   - Implement additional features
   - Regular updates
   - Community feedback

---

**Last Updated:** 2026-01-01
**Version:** 1.0.0
