# FACTRADE Token Deployment Guide - Devnet to Mainnet

## Prerequisites

Before deploying to Solana devnet, ensure you have:

1. **Solana CLI** installed and configured
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   solana --version
   ```

2. **Anchor Framework** installed
   ```bash
   cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
   anchor --version
   ```

3. **Node.js and npm** (already installed based on package.json)

4. **Solana Wallet** with devnet SOL
   ```bash
   # Generate a new keypair (or use existing)
   solana-keygen new --outfile ~/.config/solana/devnet-deployer.json
   
   # Set Solana to use devnet
   solana config set --url https://api.devnet.solana.com
   
   # Airdrop SOL for deployment fees
   solana airdrop 2 --keypair ~/.config/solana/devnet-deployer.json
   ```

## Phase 1: Initial Devnet Deployment

### Step 1: Configure Anchor for Devnet

Update `solana-programs/Anchor.toml`:
```toml
[provider]
cluster = "Devnet"
wallet = "~/.config/solana/devnet-deployer.json"
```

### Step 2: Build the Programs

```bash
cd /path/to/FACTRADE-solana/solana-programs

# Clean previous builds
anchor clean

# Build all programs
anchor build

# This will generate:
# - target/deploy/tax_distribution.so
# - target/deploy/referral_rewards.so
# - target/idl/tax_distribution.json
# - target/idl/referral_rewards.json
```

### Step 3: Deploy to Devnet

```bash
# Deploy all programs to devnet
anchor deploy --provider.cluster devnet

# Note the program IDs output - you'll need these!
# Example output:
# Program Id: taxD1stR1But10n111111111111111111111111111
# Program Id: refRewrDs111111111111111111111111111111111
```

### Step 4: Update Program IDs

After deployment, update the actual program IDs in:

**solana-programs/Anchor.toml**:
```toml
[programs.devnet]
tax_distribution = "YOUR_ACTUAL_TAX_PROGRAM_ID"
referral_rewards = "YOUR_ACTUAL_REFERRAL_PROGRAM_ID"
```

**Rebuild with correct IDs**:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

### Step 5: Initialize Program Configurations

Create a deployment script `solana-programs/scripts/initialize-devnet.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

async function initialize() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Load programs
  const taxProgram = anchor.workspace.TaxDistribution;
  const referralProgram = anchor.workspace.ReferralRewards;

  // Define wallet addresses (use your devnet wallets)
  const marketingWallet = new PublicKey("YOUR_MARKETING_WALLET");
  const treasuryWallet = new PublicKey("YOUR_TREASURY_WALLET");
  const holderRewardsPool = new PublicKey("YOUR_REWARDS_POOL");

  console.log("Initializing tax distribution config...");
  
  // Initialize tax config
  const [taxConfig] = await PublicKey.findProgramAddress(
    [Buffer.from("tax_config"), tokenMint.toBuffer()],
    taxProgram.programId
  );

  await taxProgram.methods
    .initializeTaxConfig(
      200,  // buy_tax_bps (2%)
      200,  // sell_tax_bps (2%)
      100,  // transfer_tax_bps (1%)
      25,   // marketing_share
      25,   // treasury_share
      25,   // burn_share
      25    // holder_rewards_share
    )
    .accounts({
      taxConfig,
      authority: provider.wallet.publicKey,
      tokenMint: tokenMint,
      marketingWallet,
      treasuryWallet,
      holderRewardsPool,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Tax config initialized!");

  console.log("Initializing referral config...");
  
  // Initialize referral config
  const [referralConfig] = await PublicKey.findProgramAddress(
    [Buffer.from("referral_config"), tokenMint.toBuffer()],
    referralProgram.programId
  );

  await referralProgram.methods
    .initializeReferralConfig(
      25,  // tax_allocation_percentage
      40,  // level1_share
      20,  // level2_share
      15,  // level3_share
      15,  // level4_share
      10   // level5_share
    )
    .accounts({
      referralConfig,
      authority: provider.wallet.publicKey,
      tokenMint: tokenMint,
      rewardPool: rewardPoolTokenAccount,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .rpc();

  console.log("Referral config initialized!");
}

initialize().catch(console.error);
```

Run initialization:
```bash
ts-node scripts/initialize-devnet.ts
```

## Phase 2: Testing on Devnet

### Create Test Scripts

**Test Tax Processing** (`solana-programs/tests/test-tax-devnet.ts`):
```typescript
import * as anchor from "@coral-xyz/anchor";
import { assert } from "chai";

describe("Tax Distribution - Devnet", () => {
  it("processes buy tax correctly", async () => {
    const provider = anchor.AnchorProvider.env();
    const program = anchor.workspace.TaxDistribution;
    
    const amount = 1000 * 1e9; // 1000 tokens
    
    const tx = await program.methods
      .processTax(new anchor.BN(amount), { buy: {} })
      .accounts({
        // ... your accounts
      })
      .rpc();
    
    console.log("Tax processed:", tx);
    
    // Verify tax was collected
    // Expected: 20 tokens taxed (2%)
  });
});
```

**Test Referral Registration**:
```typescript
describe("Referral System - Devnet", () => {
  it("registers referral correctly", async () => {
    const program = anchor.workspace.ReferralRewards;
    
    const referrerPubkey = new PublicKey("REFERRER_ADDRESS");
    
    const tx = await program.methods
      .registerReferral(referrerPubkey)
      .accounts({
        // ... your accounts
      })
      .rpc();
    
    console.log("Referral registered:", tx);
  });
});
```

Run tests:
```bash
anchor test --provider.cluster devnet
```

### Manual Testing Checklist

- [ ] Deploy token mint on devnet
- [ ] Initialize tax configuration
- [ ] Initialize referral configuration
- [ ] Test buy transaction with tax
- [ ] Test sell transaction with tax
- [ ] Test transfer with tax
- [ ] Register test referrals (5 levels)
- [ ] Test referral reward distribution
- [ ] Test reward claiming
- [ ] Verify burns are working
- [ ] Check all wallet balances

## Phase 3: Continuous Development Workflow

### Development Branch Strategy

```bash
# Your branches:
# - main: Production (mainnet)
# - devnet: Devnet deployment
# - feature/*: Feature branches

# Current workflow:
git checkout devnet
git pull origin devnet

# Make changes to programs
# ... edit solana-programs/tax-distribution/src/lib.rs

# Build and test locally
cd solana-programs
anchor build
anchor test

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Commit and push
git add .
git commit -m "Update: improved tax calculation"
git push origin devnet

# After testing on devnet, merge to main for mainnet
git checkout main
git merge devnet
git push origin main
```

### Automated Deployment Pipeline (GitHub Actions)

Create `.github/workflows/deploy-devnet.yml`:

```yaml
name: Deploy to Solana Devnet

on:
  push:
    branches: [devnet, copilot/update-token-contract-for-tax]
  pull_request:
    branches: [devnet]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Solana
        run: |
          sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
          echo "$HOME/.local/share/solana/install/active_release/bin" >> $GITHUB_PATH
      
      - name: Install Anchor
        run: |
          cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli
      
      - name: Setup Wallet
        run: |
          echo "${{ secrets.SOLANA_DEVNET_PRIVATE_KEY }}" > ~/.config/solana/id.json
          solana config set --url https://api.devnet.solana.com
      
      - name: Build Programs
        run: |
          cd solana-programs
          anchor build
      
      - name: Deploy to Devnet
        run: |
          cd solana-programs
          anchor deploy --provider.cluster devnet
      
      - name: Run Tests
        run: |
          cd solana-programs
          anchor test --provider.cluster devnet
```

### Environment-Specific Configuration

**Create config files**:

`solana-programs/config/devnet.json`:
```json
{
  "cluster": "devnet",
  "marketingWallet": "YOUR_DEVNET_MARKETING_WALLET",
  "treasuryWallet": "YOUR_DEVNET_TREASURY_WALLET",
  "programIds": {
    "taxDistribution": "YOUR_DEVNET_TAX_PROGRAM_ID",
    "referralRewards": "YOUR_DEVNET_REFERRAL_PROGRAM_ID"
  }
}
```

`solana-programs/config/mainnet.json`:
```json
{
  "cluster": "mainnet-beta",
  "marketingWallet": "YOUR_MAINNET_MARKETING_WALLET",
  "treasuryWallet": "YOUR_MAINNET_TREASURY_WALLET",
  "programIds": {
    "taxDistribution": "YOUR_MAINNET_TAX_PROGRAM_ID",
    "referralRewards": "YOUR_MAINNET_REFERRAL_PROGRAM_ID"
  }
}
```

## Phase 4: Enhancement and Iteration

### Code Update Process

1. **Make changes** in feature branch
2. **Test locally** with `anchor test`
3. **Deploy to devnet** with `anchor deploy --provider.cluster devnet`
4. **Monitor transactions** on Solana Explorer (devnet)
5. **Run integration tests** on devnet
6. **Get team approval**
7. **Merge to main** and deploy to mainnet

### Monitoring Devnet Deployments

```bash
# Watch program logs
solana logs --url devnet YOUR_PROGRAM_ID

# Check program info
solana program show --url devnet YOUR_PROGRAM_ID

# View transaction
solana confirm --url devnet TRANSACTION_SIGNATURE
```

### Useful Devnet Tools

- **Solana Explorer (Devnet)**: https://explorer.solana.com/?cluster=devnet
- **Solscan (Devnet)**: https://solscan.io/?cluster=devnet
- **Anchor Playground**: https://beta.solpg.io/

## Phase 5: Mainnet Deployment (After Devnet Testing)

### Pre-Mainnet Checklist

- [ ] All tests passing on devnet
- [ ] Security audit completed
- [ ] All features tested extensively
- [ ] Economic model validated
- [ ] Emergency procedures documented
- [ ] Mainnet wallets prepared and secured
- [ ] Sufficient SOL for deployment (~10 SOL recommended)

### Mainnet Deployment

```bash
# Switch to mainnet
solana config set --url https://api.mainnet-beta.solana.com
solana config set --keypair ~/.config/solana/mainnet-deployer.json

# Verify wallet balance
solana balance

# Deploy to mainnet (ONE-TIME, IRREVERSIBLE)
cd solana-programs
anchor build --verifiable  # Verifiable build for transparency
anchor deploy --provider.cluster mainnet

# Initialize configurations (with mainnet wallets)
ts-node scripts/initialize-mainnet.ts
```

## Quick Reference Commands

```bash
# Devnet workflow
solana config set --url https://api.devnet.solana.com
cd solana-programs
anchor build
anchor deploy --provider.cluster devnet
anchor test --provider.cluster devnet

# Check deployment
solana program show YOUR_PROGRAM_ID --url devnet

# View logs
solana logs YOUR_PROGRAM_ID --url devnet

# Mainnet workflow (when ready)
solana config set --url https://api.mainnet-beta.solana.com
anchor deploy --provider.cluster mainnet
```

## Support and Resources

- **Solana Documentation**: https://docs.solana.com/
- **Anchor Documentation**: https://www.anchor-lang.com/
- **Solana Stack Exchange**: https://solana.stackexchange.com/
- **Discord**: Solana Discord server

## Security Notes

- **Never commit private keys** to Git
- **Use environment variables** for sensitive data
- **Test thoroughly on devnet** before mainnet
- **Have an upgrade authority** for program updates
- **Monitor mainnet transactions** closely after deployment
- **Have emergency pause mechanisms** (if implemented)

---

**Remember**: Devnet is your playground. Deploy often, test thoroughly, break things safely. Only move to mainnet when everything is battle-tested on devnet.
