# FACTRADE Deployment Checklist

Quick reference guide for deploying FACTRADE to Solana.

## 📋 Pre-Deployment

- [ ] Node.js 18+ installed
- [ ] Solana CLI installed (`solana --version`)
- [ ] Anchor CLI installed (`anchor --version`)
- [ ] Project dependencies installed (`npm install`)
- [ ] Wallet created and configured
- [ ] Sufficient SOL balance (2+ SOL devnet, 5+ SOL mainnet)
- [ ] Network configured (`solana config get`)

---

## 🪙 Token Deployment

### Devnet

```bash
# Configure network
solana config set --url https://api.devnet.solana.com
solana airdrop 2

# Deploy token
SOLANA_NETWORK=devnet npm run deploy:token

# Save mint address from output
export TOKEN_MINT=<YOUR_TOKEN_MINT_ADDRESS>
```

- [ ] Token deployed successfully
- [ ] Mint address saved
- [ ] Verified on Explorer: https://explorer.solana.com/address/$TOKEN_MINT?cluster=devnet
- [ ] `.env.local` updated with `NEXT_PUBLIC_TOKEN_MINT_ADDRESS`

### Mainnet (when ready)

```bash
# ⚠️ WARNING: This uses real SOL! Test on devnet first!
solana config set --url https://api.mainnet-beta.solana.com

# Deploy token
SOLANA_NETWORK=mainnet-beta npm run deploy:token
```

- [ ] Devnet testing complete
- [ ] Security audit completed
- [ ] Wallet backed up securely
- [ ] Token deployed to mainnet
- [ ] Verified on Explorer

---

## 📦 Program Deployment

### Build Programs

```bash
cd solana-programs
anchor build
```

- [ ] All programs compiled successfully
- [ ] No build errors or warnings

### Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

- [ ] Staking program deployed
- [ ] Rewards program deployed
- [ ] Governance program deployed
- [ ] Program IDs saved in `Anchor.toml`
- [ ] `.env.local` updated with program IDs

### Deploy to Mainnet (when ready)

```bash
# ⚠️ WARNING: This uses real SOL!
anchor deploy --provider.cluster mainnet-beta
```

- [ ] Programs deployed to mainnet
- [ ] Program IDs verified

---

## 🔧 Program Initialization

### Initialize All Programs

```bash
cd solana-programs
anchor test --skip-build --skip-deploy
```

**OR manually initialize:**

```bash
# Generate initialization template
npx ts-node scripts/initialize-programs.ts $TOKEN_MINT

# Follow instructions for manual initialization
```

- [ ] Staking pool initialized
- [ ] Rewards pool initialized
- [ ] Governance initialized
- [ ] All parameters correct

**Verify Parameters:**

Staking:
- [ ] 7-day lock: 604,800 seconds, 1x multiplier
- [ ] 14-day lock: 1,209,600 seconds, 1.5x multiplier
- [ ] 30-day lock: 2,592,000 seconds, 2x multiplier
- [ ] Min stake: 1 FACT

Rewards:
- [ ] Base APY: 12%
- [ ] APY range: 12-25%
- [ ] Compound frequency: Daily

Governance:
- [ ] Voting period: 7 days
- [ ] Min voting power: 100,000 FACT
- [ ] Quorum: 10%

---

## 💰 Token Distribution

### Configure Distribution Wallets

```bash
# First run creates template
npx ts-node scripts/distribute-tokens.ts $TOKEN_MINT
```

- [ ] `distribution-wallets.json` created
- [ ] All wallet addresses configured
- [ ] Addresses verified (double-check!)

### Execute Distribution

```bash
npx ts-node scripts/distribute-tokens.ts $TOKEN_MINT
```

- [ ] Public Sale: 400M FACT distributed
- [ ] Team: 200M FACT distributed (with vesting)
- [ ] Liquidity: 150M FACT distributed
- [ ] Ecosystem: 150M FACT distributed
- [ ] Reserve: 100M FACT distributed
- [ ] Total: 1B FACT distributed
- [ ] All transactions confirmed on Explorer

---

## 🌐 Frontend Configuration

### Update Environment Variables

Edit `.env.local`:

```bash
# Network
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Token
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=<YOUR_TOKEN_MINT>

# Programs
NEXT_PUBLIC_STAKING_PROGRAM_ID=<STAKING_PROGRAM_ID>
NEXT_PUBLIC_REWARDS_PROGRAM_ID=<REWARDS_PROGRAM_ID>
NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID=<GOVERNANCE_PROGRAM_ID>

# Optional
NEXT_PUBLIC_SYNC_INTERVAL=1000
NEXT_PUBLIC_WS_ENDPOINT=wss://api.devnet.solana.com
```

- [ ] All addresses configured
- [ ] Network URLs correct
- [ ] No placeholder values

### Test Frontend

```bash
npm run dev
```

Visit http://localhost:3000

- [ ] App loads successfully
- [ ] Wallet connects
- [ ] Token balance displays
- [ ] Staking interface works
- [ ] Rewards interface works
- [ ] Governance interface works
- [ ] No console errors

---

## ✅ Verification

### Token Verification

```bash
# Check token supply
spl-token supply $TOKEN_MINT

# Check token accounts
spl-token accounts $TOKEN_MINT
```

- [ ] Total supply: 1,000,000,000 FACT
- [ ] All distribution accounts exist
- [ ] Balances match tokenomics

### Program Verification

```bash
# Check programs are deployed
solana program show $STAKING_PROGRAM_ID
solana program show $REWARDS_PROGRAM_ID
solana program show $GOVERNANCE_PROGRAM_ID
```

- [ ] All programs deployed
- [ ] Programs initialized
- [ ] Upgrade authority configured

### Explorer Verification

Check on Solana Explorer:
- [ ] Token mint exists and is correct
- [ ] All transactions successful
- [ ] Token accounts created
- [ ] Programs deployed

---

## 📝 Documentation

- [ ] Deployment info saved in `deployments/`
- [ ] All addresses documented
- [ ] Team notified
- [ ] README updated (if needed)
- [ ] Release notes created

---

## 🔒 Security

- [ ] Private keys backed up securely
- [ ] Wallet files not committed to git
- [ ] `.env.local` not committed
- [ ] Distribution wallets verified
- [ ] Mint authority secured
- [ ] Program upgrade authority configured
- [ ] Emergency contacts established

---

## 🚀 Post-Deployment

### Immediate Tasks

- [ ] Announce deployment
- [ ] Share contract addresses
- [ ] Update documentation
- [ ] Monitor transactions

### Within 24 Hours

- [ ] Set up monitoring/alerts
- [ ] Create liquidity pools
- [ ] Enable trading
- [ ] Community announcement

### Within 1 Week

- [ ] Submit to token registry
- [ ] Apply for listings (CoinGecko, etc.)
- [ ] Marketing campaign
- [ ] User onboarding

---

## 📞 Emergency Contacts

**If something goes wrong:**

1. Check transaction status on Explorer
2. Review deployment logs in `deployments/`
3. Consult [COMPLETE_DEPLOYMENT_GUIDE.md](COMPLETE_DEPLOYMENT_GUIDE.md)
4. Check [Troubleshooting section](COMPLETE_DEPLOYMENT_GUIDE.md#troubleshooting)
5. Open GitHub issue if needed

---

## 📊 Success Metrics

After deployment, track:

- [ ] Total Value Locked (TVL)
- [ ] Active stakers
- [ ] Transaction volume
- [ ] Governance participation
- [ ] Token holder count
- [ ] Platform uptime

---

## ✨ Congratulations!

If all items are checked, your FACTRADE deployment is complete! 🎉

**Next steps:**
1. Monitor the platform
2. Engage with community
3. Continue development
4. Regular security audits

---

**Deployment Date:** _______________  
**Network:** [ ] Devnet [ ] Mainnet  
**Deployed By:** _______________  
**Token Mint:** _______________  
**Version:** 1.0.0
