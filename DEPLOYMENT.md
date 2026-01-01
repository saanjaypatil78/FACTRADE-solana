# FACTRADE Token Deployment Guide

This guide explains how to deploy the FACTRADE token on Solana.

## Prerequisites

1. **Solana CLI** installed
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
   ```

2. **Node.js environment** with dependencies installed
   ```bash
   npm install
   ```

3. **Solana wallet** with sufficient SOL for deployment fees
   - Devnet: ~5 SOL (get from faucet)
   - Mainnet: ~5 SOL

## Deployment Steps

### 1. Configure Solana CLI

Set the cluster (devnet for testing, mainnet-beta for production):

```bash
# For testing on devnet
solana config set --url https://api.devnet.solana.com

# For production on mainnet
solana config set --url https://api.mainnet-beta.solana.com
```

### 2. Create/Configure Wallet

```bash
# Create a new keypair (if needed)
solana-keygen new --outfile ~/my-solana-wallet.json

# Set the keypair as default
solana config set --keypair ~/my-solana-wallet.json

# Check your address
solana address

# Check your balance
solana balance
```

### 3. Get Test SOL (Devnet Only)

```bash
solana airdrop 2
```

### 4. Token Creation Script

Create a deployment script `scripts/deploy-token.ts`:

```typescript
import { Connection, Keypair, clusterApiUrl } from '@solana/web3.js';
import { createFactradeToken, mintTokensToDistribution, getTokenDistribution } from '../programs/factrade-token/token-config';
import fs from 'fs';

async function main() {
  // Load wallet
  const walletPath = process.env.WALLET_PATH || `${process.env.HOME}/.config/solana/id.json`;
  const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(secretKey));

  // Connect to cluster
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const connection = new Connection(
    network === 'mainnet' 
      ? 'https://api.mainnet-beta.solana.com'
      : 'https://api.devnet.solana.com',
    'confirmed'
  );

  console.log('Deployer address:', payer.publicKey.toString());
  console.log('Network:', network);

  // Create token mint
  console.log('\nCreating FACTRADE token mint...');
  const mintAddress = await createFactradeToken(
    connection,
    payer,
    payer.publicKey, // mint authority
    null // no freeze authority (token cannot be frozen)
  );

  console.log('✅ Token mint created!');
  console.log('Mint address:', mintAddress.toString());

  // Get distribution
  const distribution = getTokenDistribution();
  console.log('\nToken Distribution:');
  console.log('- Public Sale:', distribution.publicSale);
  console.log('- Team:', distribution.team);
  console.log('- Liquidity:', distribution.liquidity);
  console.log('- Ecosystem:', distribution.ecosystem);
  console.log('- Reserve:', distribution.reserve);

  // Save deployment info
  const deploymentInfo = {
    network,
    mintAddress: mintAddress.toString(),
    deployedAt: new Date().toISOString(),
    deployedBy: payer.publicKey.toString(),
    distribution,
  };

  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n✅ Deployment info saved to deployment-info.json');
}

main().catch(console.error);
```

### 5. Run Deployment

```bash
# For devnet
SOLANA_NETWORK=devnet npx ts-node scripts/deploy-token.ts

# For mainnet (BE CAREFUL!)
SOLANA_NETWORK=mainnet npx ts-node scripts/deploy-token.ts
```

### 6. Verify Deployment

```bash
# Check token info
spl-token display <MINT_ADDRESS>

# Check supply
spl-token supply <MINT_ADDRESS>
```

## Token Distribution

After deployment, distribute tokens according to tokenomics:

1. **Public Sale (40%)**: Transfer to sale contract
2. **Team (20%)**: Transfer to team vesting contract
3. **Liquidity (15%)**: Provide to DEX pools
4. **Ecosystem (15%)**: Transfer to ecosystem fund
5. **Reserve (10%)**: Keep in treasury wallet

## Security Checklist

- [ ] Verify tokenomics in `tokenomics.json`
- [ ] Test deployment on devnet first
- [ ] Confirm mint address before mainnet deployment
- [ ] Securely store private keys
- [ ] Consider using a multisig for mint authority
- [ ] Revoke mint authority after initial distribution (if desired)
- [ ] Document all wallet addresses and transactions

## Post-Deployment

1. **Update Frontend**
   - Add mint address to configuration
   - Update network settings

2. **Register Token**
   - Submit to Solana token list
   - Add to CoinGecko/CoinMarketCap

3. **Create Liquidity Pools**
   - Raydium, Orca, or other DEXs
   - Provide initial liquidity

4. **Marketing**
   - Announce launch
   - Share tokenomics
   - Community engagement

## Troubleshooting

### Insufficient Balance
```bash
solana balance
solana airdrop 2  # devnet only
```

### Transaction Failed
- Check network status
- Increase transaction fee
- Wait and retry

### Token Not Showing
- Verify mint address
- Check network selection
- Refresh wallet

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [SPL Token Documentation](https://spl.solana.com/token)
- [Solana Explorer](https://explorer.solana.com/)
- [Solscan](https://solscan.io/)

## Support

For deployment issues:
- Check GitHub Issues
- Review Solana Discord
- Consult Solana Stack Exchange
