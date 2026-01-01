# FACTRADE DApp - Testing & Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup

Before testing, ensure you have:

```bash
# Install required tools
npm install
solana --version  # Solana CLI v1.18+
anchor --version  # Anchor v0.29+
```

### 2. Network Configuration

Create `.env.local` file:

```env
# Network Configuration (devnet for testing, mainnet-beta for production)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Program IDs (Update after deployment)
NEXT_PUBLIC_STAKING_PROGRAM_ID=
NEXT_PUBLIC_REWARDS_PROGRAM_ID=
NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID=
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=

# Auto-sync interval (milliseconds)
NEXT_PUBLIC_SYNC_INTERVAL=1000

# WebSocket Configuration
NEXT_PUBLIC_WS_ENDPOINT=wss://api.devnet.solana.com
```

---

## Phase 1: Local Development Testing

### Step 1: Start Local Solana Validator

```bash
# Terminal 1: Start local validator
solana-test-validator --reset

# Terminal 2: Check validator status
solana cluster-version
solana balance
```

### Step 2: Deploy Solana Programs (Local)

```bash
cd solana-programs

# Build all programs
anchor build

# Deploy to local validator
anchor deploy

# Note the program IDs and update .env.local
```

### Step 3: Initialize Token & Programs

```bash
# Create FACT token
spl-token create-token --decimals 9

# Create token account
spl-token create-account <TOKEN_MINT_ADDRESS>

# Mint initial supply (1 billion tokens)
spl-token mint <TOKEN_MINT_ADDRESS> 1000000000

# Initialize staking program
anchor run initialize-staking

# Initialize rewards program
anchor run initialize-rewards

# Initialize governance program
anchor run initialize-governance
```

### Step 4: Start Frontend Development Server

```bash
# Terminal 3: Start Next.js
npm run dev

# Visit http://localhost:3000
```

---

## Phase 2: Functional Testing

### Test 1: Wallet Connection ✅

**Steps:**
1. Open http://localhost:3000
2. Click "Connect Wallet"
3. Select Phantom/Solflare/Torus
4. Approve connection

**Expected Results:**
- Wallet button shows truncated address
- Balance displays correctly
- Auto-sync updates every second

**Verification:**
```bash
# Check console logs
# Should see: "Wallet connected: <address>"
# Should see: "Balance synced: <amount> SOL"
```

### Test 2: Token Balance Sync ✅

**Steps:**
1. Connect wallet
2. Navigate to Overview tab
3. Observe balance updates

**Expected Results:**
- Token balance shows in real-time
- SOL balance updates automatically
- No manual refresh needed

**Verification:**
- Change balance in another wallet
- Observe automatic update within 1 second

### Test 3: Staking Flow ✅

**Steps:**
1. Navigate to "Stake" tab
2. Select lock period (7/14/30 days)
3. Enter amount (e.g., 1000 FACT)
4. Click "Stake"
5. Approve transaction in wallet

**Expected Results:**
- Transaction confirmation appears
- Staked amount updates immediately
- TVL increases
- Position appears in "Your Active Stakes"

**Verification:**
```bash
# Check on-chain data
solana account <STAKE_ACCOUNT_ADDRESS> --output json
```

### Test 4: Rewards Claiming ✅

**Steps:**
1. Wait for rewards to accrue (or fast-forward time in local validator)
2. Navigate to "Rewards" tab
3. Click "Claim Rewards"
4. Approve transaction

**Expected Results:**
- Pending rewards transfer to wallet
- Balance increases
- Rewards history updates

**Verification:**
```bash
# Check token balance
spl-token balance <TOKEN_MINT_ADDRESS>
```

### Test 5: Auto-Compound ✅

**Steps:**
1. Navigate to "Rewards" tab
2. Click "Compound Now"
3. Approve transaction

**Expected Results:**
- Rewards added to staked amount
- New staked amount shown
- APY applies to larger principal

### Test 6: Governance Voting ✅

**Steps:**
1. Navigate to "Governance" tab
2. View active proposals
3. Click "Vote Yes" or "Vote No"
4. Approve transaction

**Expected Results:**
- Vote recorded on-chain
- Vote count updates
- Progress bar reflects new votes

### Test 7: Create Proposal ✅

**Steps:**
1. Navigate to "Governance" tab
2. Click "Create Proposal"
3. Fill in title, description, type
4. Click "Submit Proposal"
5. Approve transaction

**Expected Results:**
- Proposal appears in list
- Status shows "Active"
- Voting period countdown begins

---

## Phase 3: Real-Time Sync Testing

### Test 8: Multi-Tab Sync

**Steps:**
1. Open app in two browser tabs
2. Perform action in Tab 1 (e.g., stake tokens)
3. Observe Tab 2

**Expected Results:**
- Tab 2 updates automatically within 1 second
- No manual refresh needed
- Data consistency across tabs

### Test 9: WebSocket Connection

**Steps:**
1. Open browser DevTools → Network → WS
2. Connect wallet
3. Observe WebSocket messages

**Expected Results:**
- WebSocket connection established
- Account updates received in real-time
- Reconnection on disconnect

### Test 10: Transaction Confirmation

**Steps:**
1. Initiate any transaction
2. Observe transaction status

**Expected Results:**
- "Processing..." status appears
- "Confirmed" status after finalization
- UI updates automatically

**Verification:**
```bash
# Check transaction status
solana confirm <TRANSACTION_SIGNATURE>
```

---

## Phase 4: Performance Testing

### Test 11: Load Testing

**Tool:** Artillery or k6

```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 http://localhost:3000
```

**Expected Results:**
- 99% requests complete under 2 seconds
- No memory leaks
- Consistent performance

### Test 12: Network Latency

**Steps:**
1. Throttle network in DevTools (Fast 3G)
2. Perform staking transaction
3. Measure time to confirmation

**Expected Results:**
- Transaction completes within 10 seconds
- Loading states appear correctly
- Error handling for timeouts

---

## Phase 5: Security Testing

### Test 13: Wallet Security

**Steps:**
1. Attempt to connect malicious wallet
2. Try to execute unauthorized transaction

**Expected Results:**
- Wallet adapter validates connection
- Unsigned transactions rejected
- No private key exposure

### Test 14: Program Authority

**Steps:**
1. Attempt to call admin functions from non-admin wallet
2. Try to modify program state without authority

**Expected Results:**
- Transaction rejected with "Unauthorized" error
- Program state unchanged
- Security logs generated

### Test 15: Input Validation

**Steps:**
1. Enter negative stake amount
2. Enter amount exceeding balance
3. Enter special characters in forms

**Expected Results:**
- Client-side validation prevents submission
- Error messages displayed
- No transaction sent to blockchain

---

## Phase 6: Devnet Deployment

### Step 1: Configure Devnet

```bash
# Set Solana config to devnet
solana config set --url https://api.devnet.solana.com

# Airdrop SOL for deployment
solana airdrop 2

# Check balance
solana balance
```

### Step 2: Deploy Programs to Devnet

```bash
cd solana-programs

# Build for devnet
anchor build

# Deploy
anchor deploy --provider.cluster devnet

# Save program IDs
echo "STAKING_PROGRAM_ID: $(solana address -k target/deploy/staking-keypair.json)"
echo "REWARDS_PROGRAM_ID: $(solana address -k target/deploy/rewards-keypair.json)"
echo "GOVERNANCE_PROGRAM_ID: $(solana address -k target/deploy/governance-keypair.json)"
```

### Step 3: Initialize Programs on Devnet

```bash
# Initialize each program with proper parameters
anchor run initialize-all --provider.cluster devnet
```

### Step 4: Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard
```

### Step 5: Devnet Testing

**Test all flows again on devnet:**
- Use real wallets (Phantom, Solflare)
- Test with multiple users
- Verify transactions on Solana Explorer: https://explorer.solana.com/?cluster=devnet

---

## Phase 7: Mainnet Preparation

### Security Audit Checklist

- [ ] Smart contract audit completed (Certik, Halborn, or similar)
- [ ] Frontend security review
- [ ] Penetration testing completed
- [ ] Bug bounty program launched
- [ ] Multi-sig setup for admin functions
- [ ] Emergency pause mechanism tested
- [ ] Upgrade authority configured

### Economic Model Verification

- [ ] Tokenomics calculations verified
- [ ] APY ranges tested under various TVL scenarios
- [ ] Reward pool sufficiently funded
- [ ] Distribution schedules validated
- [ ] Vesting contracts tested

### Legal & Compliance

- [ ] Legal review completed
- [ ] Terms of service published
- [ ] Privacy policy published
- [ ] KYC/AML requirements addressed (if applicable)
- [ ] Regulatory compliance verified

---

## Phase 8: Mainnet Deployment

### Step 1: Prepare Mainnet Environment

```bash
# Set Solana config to mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Ensure sufficient SOL for deployment (~5-10 SOL)
solana balance
```

### Step 2: Deploy Programs to Mainnet

```bash
cd solana-programs

# Final build
anchor build --verifiable

# Deploy to mainnet
anchor deploy --provider.cluster mainnet-beta

# SAVE PROGRAM IDs - THESE ARE PERMANENT!
```

### Step 3: Initialize Mainnet Programs

```bash
# Create FACT token on mainnet
spl-token create-token --decimals 9

# Mint total supply
spl-token mint <TOKEN_MINT> 1000000000

# Initialize all programs with mainnet parameters
anchor run initialize-all --provider.cluster mainnet-beta
```

### Step 4: Configure Frontend for Mainnet

Update `.env.production`:

```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_WS_ENDPOINT=wss://api.mainnet-beta.solana.com

# Add actual program IDs
NEXT_PUBLIC_STAKING_PROGRAM_ID=<ACTUAL_ID>
NEXT_PUBLIC_REWARDS_PROGRAM_ID=<ACTUAL_ID>
NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID=<ACTUAL_ID>
NEXT_PUBLIC_TOKEN_MINT_ADDRESS=<ACTUAL_ID>
```

### Step 5: Deploy Production Frontend

```bash
# Build production
npm run build

# Deploy to Vercel/Netlify/Custom server
vercel --prod
```

### Step 6: Final Verification

**Mainnet Smoke Tests:**

1. **Connect Wallet** ✅
   - Test with minimal SOL
   - Verify network connection

2. **View Token Info** ✅
   - Confirm tokenomics display correctly
   - Verify total supply matches

3. **Small Test Stake** ✅
   - Stake small amount (e.g., 10 FACT)
   - Confirm transaction
   - Verify stake appears correctly

4. **Monitor Rewards** ✅
   - Wait for first reward accrual
   - Verify APY calculations

5. **Test Governance** ✅
   - View proposals
   - Cast test vote

---

## Monitoring & Maintenance

### Real-Time Monitoring Setup

**1. Set up Grafana Dashboard:**

Metrics to monitor:
- Transaction success rate
- Average confirmation time
- Active wallet connections
- TVL (Total Value Locked)
- Daily active users
- Error rates

**2. Set up Alerts:**

```yaml
alerts:
  - name: High error rate
    condition: error_rate > 5%
    action: notify_team
  
  - name: Low TVL
    condition: tvl < 100M
    action: log_warning
  
  - name: Transaction failures
    condition: failed_tx > 10
    action: investigate
```

**3. Log Aggregation:**

Use DataDog, LogRocket, or Sentry for:
- Frontend errors
- Transaction failures
- User behavior analytics

### Maintenance Checklist

**Daily:**
- [ ] Check transaction success rates
- [ ] Monitor TVL and active users
- [ ] Review error logs
- [ ] Verify auto-sync functionality

**Weekly:**
- [ ] Review security logs
- [ ] Check reward pool balances
- [ ] Verify APY calculations
- [ ] Update documentation

**Monthly:**
- [ ] Security audit review
- [ ] Performance optimization
- [ ] User feedback analysis
- [ ] Feature roadmap update

---

## Troubleshooting Guide

### Issue: Auto-sync not working

**Solution:**
```typescript
// Check WebSocket connection
console.log('WebSocket state:', connection.rpcEndpoint);

// Verify interval is set
console.log('Sync interval:', process.env.NEXT_PUBLIC_SYNC_INTERVAL);

// Check for errors
connection.onAccountChange() // Add error handler
```

### Issue: Transactions failing

**Solution:**
```bash
# Check RPC node status
curl https://api.mainnet-beta.solana.com -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'

# Increase compute units
const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
  units: 400000,
});
```

### Issue: Slow performance

**Solution:**
- Use committed RPC endpoint
- Implement request batching
- Add caching layer (Redis)
- Use CDN for static assets

---

## Success Metrics

**Launch Targets:**

- [ ] 1,000+ connected wallets in first week
- [ ] 100M+ FACT tokens staked
- [ ] < 0.1% transaction failure rate
- [ ] < 2s average page load time
- [ ] 99.9% uptime
- [ ] 100+ active governance participants

---

## Support & Resources

**Documentation:**
- Solana Docs: https://docs.solana.com
- Anchor Docs: https://www.anchor-lang.com
- SPL Token: https://spl.solana.com/token

**Community:**
- Discord: [Your Discord]
- Telegram: [Your Telegram]
- Twitter: [Your Twitter]

**Emergency Contacts:**
- Security: security@factrade.com
- Support: support@factrade.com
- Technical: tech@factrade.com

---

## Conclusion

Follow this guide step-by-step to ensure a smooth deployment. Test thoroughly on devnet before mainnet launch. Monitor continuously and respond to issues quickly.

**Remember:** Blockchain deployments are permanent. Triple-check everything before mainnet deployment!

Good luck with your launch! 🚀
