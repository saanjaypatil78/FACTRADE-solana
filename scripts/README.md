# FACTRADE Deployment Scripts

This directory contains automated deployment scripts for the FACTRADE Solana platform.

## Available Scripts

### 1. `deploy-token.ts`
Deploys the FACT SPL token to Solana blockchain.

**Usage:**
```bash
SOLANA_NETWORK=devnet npx ts-node scripts/deploy-token.ts
```

**What it does:**
- Creates a new SPL token mint with 9 decimals
- Configures according to tokenomics.json specifications
- Saves deployment info to `deployments/` directory
- Returns token mint address

**Environment Variables:**
- `SOLANA_NETWORK`: Target network (devnet, testnet, mainnet-beta)
- `SOLANA_RPC_URL`: Custom RPC endpoint (optional)
- `WALLET_PATH`: Path to wallet keypair (optional)

**Output:**
- Token mint address
- Explorer URL
- Deployment JSON file with complete info

---

### 2. `distribute-tokens.ts`
Distributes tokens to configured wallets according to tokenomics.

**Usage:**
```bash
npx ts-node scripts/distribute-tokens.ts <TOKEN_MINT_ADDRESS>
```

**What it does:**
- Reads wallet addresses from `distribution-wallets.json`
- Mints tokens to each distribution category
- Tracks distribution results
- Saves distribution report

**First Run:**
Creates a template `distribution-wallets.json` that you need to configure with actual wallet addresses.

**Distribution Categories:**
- Public Sale: 400,000,000 FACT (40%)
- Team: 200,000,000 FACT (20%)
- Liquidity: 150,000,000 FACT (15%)
- Ecosystem: 150,000,000 FACT (15%)
- Reserve: 100,000,000 FACT (10%)

---

### 3. `initialize-programs.ts`
Provides configuration template for initializing Solana programs.

**Usage:**
```bash
npx ts-node scripts/initialize-programs.ts <TOKEN_MINT_ADDRESS>
```

**What it does:**
- Loads program IDs from Anchor.toml
- Displays recommended initialization parameters
- Creates initialization template
- Provides manual initialization instructions

**Programs Initialized:**
1. **Staking Program**
   - Lock periods: 7, 14, 30 days
   - Reward multipliers: 1x, 1.5x, 2x
   - Min stake: 1 FACT

2. **Rewards Program**
   - Base APY: 12%
   - Dynamic APY range: 12-25%
   - Daily compounding

3. **Governance Program**
   - Voting period: 7 days
   - Min voting power: 100,000 FACT
   - Quorum: 10%

---

## Quick Start

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Wallet
```bash
# For devnet testing
solana-keygen new --outfile ~/.config/solana/id.json
solana config set --url https://api.devnet.solana.com
solana airdrop 2
```

### Step 3: Deploy Token
```bash
SOLANA_NETWORK=devnet npm run deploy:token
```

### Step 4: Configure Distribution
Edit `distribution-wallets.json` with your wallet addresses.

### Step 5: Distribute Tokens
```bash
npm run distribute:tokens YOUR_TOKEN_MINT_ADDRESS
```

### Step 6: Deploy Programs
```bash
cd solana-programs
anchor build
anchor deploy --provider.cluster devnet
```

### Step 7: Initialize Programs
```bash
cd solana-programs
anchor test --skip-build --skip-deploy
```

---

## NPM Scripts

The following shortcuts are available in `package.json`:

```bash
# Deploy token
npm run deploy:token

# Deploy Solana programs
npm run deploy:programs

# Initialize programs
npm run init:programs <TOKEN_MINT_ADDRESS>

# Distribute tokens
npm run distribute:tokens <TOKEN_MINT_ADDRESS>
```

---

## Directory Structure

```
scripts/
├── deploy-token.ts           # Token deployment script
├── distribute-tokens.ts      # Token distribution script
├── initialize-programs.ts    # Program initialization template
└── README.md                 # This file

deployments/
├── token-devnet-latest.json              # Latest token deployment
├── token-devnet-TIMESTAMP.json           # Historical deployments
├── distribution-devnet-TIMESTAMP.json    # Distribution records
└── programs-devnet-template.json         # Program initialization template
```

---

## Configuration Files

### `tokenomics.json`
Located at `programs/factrade-token/tokenomics.json`

Defines complete token specifications:
- Token metadata (name, symbol, decimals)
- Total supply
- Distribution percentages
- Token features

### `distribution-wallets.json`
Created by first run of `distribute-tokens.ts`

Contains wallet addresses for each distribution category.

### `.env.local`
Environment configuration:
```env
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
WALLET_PATH=~/.config/solana/id.json
```

---

## Error Handling

All scripts include comprehensive error handling:
- Balance checks before deployment
- Network connectivity validation
- Transaction confirmation
- Detailed error messages
- Deployment rollback on failure

---

## Security Considerations

1. **Private Keys**: Never commit wallet files to git
2. **Mainnet**: Extra confirmation prompts for mainnet
3. **Validation**: All inputs validated before execution
4. **Logging**: Complete audit trail of all operations
5. **Recovery**: Deployment info saved for recovery

---

## Testing

Before mainnet deployment:

1. **Test on Devnet**
   ```bash
   SOLANA_NETWORK=devnet npm run deploy:token
   ```

2. **Verify Explorer**
   Check token on https://explorer.solana.com

3. **Test Distribution**
   Use test wallets for distribution

4. **Test Programs**
   Run full integration tests

---

## Troubleshooting

### "Wallet not found"
Create a wallet: `solana-keygen new`

### "Insufficient balance"
Get devnet SOL: `solana airdrop 2`

### "Transaction failed"
- Check network status
- Verify sufficient balance
- Retry with higher priority fee

### "Program not found"
Deploy programs first: `npm run deploy:programs`

---

## Support

For issues:
- Check [COMPLETE_DEPLOYMENT_GUIDE.md](../COMPLETE_DEPLOYMENT_GUIDE.md)
- Review [TESTING_DEPLOYMENT_GUIDE.md](../TESTING_DEPLOYMENT_GUIDE.md)
- Open GitHub issue

---

## License

Part of the FACTRADE platform. See main repository for license details.
