# FACTRADE - Solana DeFi Platform for Passive Income

A complete decentralized finance (DeFi) platform built on Solana blockchain, enabling users to earn passive income through staking, dynamic APY rewards, and participate in governance.

## Overview

FACTRADE is a Next.js application integrated with Solana blockchain, featuring:
- **SPL Token** implementation with exact tokenomics
- **Staking System** with multiple lock periods and reward multipliers
- **Dynamic APY Rewards** that adjust based on Total Value Locked (TVL)
- **Auto-Compounding** for maximized returns
- **Token-Based Governance** for community-driven decisions
- **Multi-Wallet Support** (Phantom, Solflare, Torus)
- Modern, responsive UI with dark mode

## Core Features

### 🔒 Staking

Lock your FACT tokens to earn passive income:

| Lock Period | APR | Reward Multiplier | Unbonding Period |
|-------------|-----|-------------------|------------------|
| 7 Days      | 5%  | 1x                | 7 days           |
| 14 Days     | 10% | 1.5x              | 14 days          |
| 30 Days     | 20% | 2x                | 30 days          |

**Features:**
- Flexible lock periods to match your investment strategy
- Higher rewards for longer commitments
- Unbonding period protection for protocol stability
- Emergency withdrawal option during pause

### 💰 Rewards

Earn and manage your staking rewards:

**Dynamic APY System:**
- Base APY: 12% (guaranteed minimum)
- Current APY: 15.5% (adjusts with TVL)
- Max APY: 25% (at low TVL)

**Reward Options:**
- **Claim**: Withdraw rewards directly to your wallet
- **Auto-Compound**: Reinvest rewards to maximize returns through compound interest

**How Dynamic APY Works:**
- Lower TVL → Higher APY (attracts more stakers)
- Higher TVL → Lower APY (ensures sustainability)
- Automatic adjustment based on market conditions

### 🗳️ Governance

Shape the future of FACTRADE:

**Proposal Types:**
- Parameter Changes (adjust staking rewards, fees)
- Treasury Spending (allocate funds for development)
- Protocol Upgrades (implement new features)
- General Proposals (community initiatives)

**Voting Power:**
- 1 FACT token = 1 vote
- Minimum 100,000 FACT to create proposals
- 10% quorum required for proposal to pass
- 7-day voting period

**Current Active Proposals:**
- Increase 30-day staking rewards
- Marketing budget allocation

## Token Details

### FACTRADE Token (FACT)
- **Total Supply:** 1,000,000,000 FACT
- **Decimals:** 9
- **Network:** Solana (Devnet for development)

### Token Distribution

| Allocation | Percentage | Amount | Description |
|------------|-----------|--------|-------------|
| Public Sale | 40% | 400,000,000 FACT | Tokens available for public sale |
| Team | 20% | 200,000,000 FACT | Team allocation with 24-month vesting and 6-month cliff |
| Liquidity | 15% | 150,000,000 FACT | Liquidity provision for DEX |
| Ecosystem | 15% | 150,000,000 FACT | Ecosystem development and partnerships |
| Reserve | 10% | 100,000,000 FACT | Reserve fund for future development |

### Token Features
- **Mintable:** No (Fixed supply)
- **Burnable:** Yes
- **Pausable:** No
- **Transfer Fee:** 0%

## Getting Started

### Prerequisites
- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, or Torus)
- Some SOL for transaction fees (on devnet for testing)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Project Structure

```
FACTRADE-solana/
├── app/
│   ├── components/
│   │   ├── SolanaProvider.tsx        # Wallet adapter provider
│   │   ├── WalletConnectButton.tsx   # Wallet connection UI
│   │   ├── TokenInfo.tsx             # Token information display
│   │   ├── StakingInterface.tsx      # Staking UI & logic
│   │   ├── RewardsInterface.tsx      # Rewards claiming & compounding
│   │   └── GovernanceInterface.tsx   # Proposal voting UI
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── solana-programs/                   # Solana on-chain programs
│   ├── staking/
│   │   ├── src/lib.rs                # Staking program logic
│   │   └── Cargo.toml
│   ├── rewards/
│   │   ├── src/lib.rs                # Rewards program logic
│   │   └── Cargo.toml
│   ├── governance/
│   │   ├── src/lib.rs                # Governance program logic
│   │   └── Cargo.toml
│   ├── Anchor.toml                   # Anchor configuration
│   └── Cargo.toml
├── programs/
│   └── factrade-token/
│       ├── tokenomics.json           # Token configuration
│       └── token-config.ts           # Token creation utilities
├── package.json
├── DEPLOYMENT.md                      # Deployment guide
└── README.md
```

## Technologies Used

- **Next.js 16** - React framework for the frontend
- **Solana Web3.js** - Solana blockchain interaction
- **Anchor Framework** - Solana smart contract development
- **Solana Wallet Adapter** - Multi-wallet support
- **SPL Token** - Solana token standard
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern styling
- **Rust** - Solana program language

## Solana Programs

The platform consists of three on-chain programs:

### 1. Staking Program (`solana-programs/staking`)
Handles token locking and stake management:
- Initialize staking pools with configurable parameters
- Stake tokens with chosen lock period
- Initiate and complete unstaking with unbonding period
- Emergency withdrawal functionality
- Real-time tracking of staked amounts

### 2. Rewards Program (`solana-programs/rewards`)
Manages reward distribution and compounding:
- Dynamic APY calculation based on TVL
- Claim rewards to wallet
- Auto-compound for maximized returns
- Performance tracking and analytics
- Emergency pause capability

### 3. Governance Program (`solana-programs/governance`)
Enables decentralized decision-making:
- Create proposals (parameter, treasury, upgrade, general)
- Cast votes weighted by token holdings
- Finalize proposals after voting period
- Execute passed proposals
- Quorum and voting period enforcement

## Features

### 1. **Token Management**
   - View complete tokenomics breakdown
   - Track token distribution across allocations
   - Monitor wallet balance in real-time
   - See token features and specifications

### 2. **Staking for Passive Income**
   - Lock tokens for 7, 14, or 30 days
   - Earn up to 20% APR on 30-day stakes
   - Flexible staking with multiple pools
   - Unbonding period protection
   - Track active stakes and positions

### 3. **Rewards System**
   - Dynamic APY (12-25%) based on TVL
   - Claim rewards directly to wallet
   - Auto-compound for maximum returns
   - Real-time rewards tracking
   - Historical rewards view

### 4. **Governance Participation**
   - Vote on protocol proposals
   - Create proposals (requires 100K FACT)
   - Track voting progress and results
   - Multiple proposal types
   - 10% quorum requirement

### 5. **Wallet Integration**
   - Connect with multiple Solana wallets
   - Auto-connect on return visits
   - Real-time balance updates
   - Secure transaction signing

### 6. **User Experience**
   - Responsive design for all devices
   - Dark mode support
   - Intuitive tabbed navigation
   - Real-time data updates
   - Modern gradient designs

## Token Configuration

The token configuration is defined in `/programs/factrade-token/tokenomics.json` and includes:
- Token metadata (name, symbol, decimals)
- Total supply
- Distribution percentages and amounts
- Token features (mintable, burnable, etc.)

## Development

### Lint Code
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

## Deployment

### Frontend Deployment

This application can be deployed on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- Any Node.js hosting platform

### Blockchain Deployment

Complete deployment scripts and guides are provided for deploying to Solana blockchain.

#### Quick Start

```bash
# Automated deployment (devnet)
./scripts/deploy-all.sh devnet

# Or step-by-step:
npm run deploy:token          # Deploy FACT token
npm run deploy:programs       # Deploy Solana programs
npm run init:programs         # Initialize programs
npm run distribute:tokens     # Distribute tokens
```

#### Documentation

- 📖 **[Complete Deployment Guide](COMPLETE_DEPLOYMENT_GUIDE.md)** - Comprehensive step-by-step instructions
- ✅ **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Quick reference checklist
- 🛠️ **[Scripts README](scripts/README.md)** - Deployment scripts documentation

#### Deployment Scripts

Located in `scripts/`:
- `deploy-token.ts` - Deploy FACT SPL token
- `distribute-tokens.ts` - Distribute tokens according to tokenomics
- `initialize-programs.ts` - Initialize Solana programs
- `deploy-all.sh` - Master deployment script

#### Requirements

- Solana CLI v1.18+
- Anchor CLI v0.29.0
- Node.js 18+
- Wallet with sufficient SOL (2+ for devnet, 5+ for mainnet)

For detailed instructions, see [COMPLETE_DEPLOYMENT_GUIDE.md](COMPLETE_DEPLOYMENT_GUIDE.md).

## Security Considerations

- Private keys are never exposed to the frontend
- Wallet connections are handled through official adapters
- Token minting is controlled by mint authority
- All transactions require user approval through wallet

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style
- All tests pass
- Documentation is updated

## License

This project is part of the FACTRADE ecosystem.

## Support

For issues and questions:
- GitHub Issues: [Report an issue](https://github.com/saanjaypatil78/FACTRADE-solana/issues)
- Documentation: Check this README

## Roadmap

### Completed ✅
- [x] Basic token implementation with exact tokenomics
- [x] Wallet integration (Phantom, Solflare, Torus)
- [x] Token information display
- [x] Staking program with multiple lock periods
- [x] Dynamic APY rewards system
- [x] Auto-compounding functionality
- [x] Governance with proposal voting
- [x] Responsive UI with dark mode
- [x] Complete deployment scripts and automation
- [x] Comprehensive deployment documentation

### In Progress 🚧
- [ ] Deploy Solana programs to devnet/mainnet
- [ ] Integrate frontend with on-chain programs
- [ ] Add transaction history tracking
- [ ] Implement real-time APY calculations

### Planned 📋
- [ ] Token swap functionality (DEX integration)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Liquidity pool management
- [ ] NFT staking support
- [ ] Multi-chain bridge

## How to Earn Passive Income

### Option 1: Simple Staking (Recommended for Beginners)
1. Connect your wallet
2. Navigate to the "Stake" tab
3. Choose a lock period (7, 14, or 30 days)
4. Enter amount and click "Stake"
5. Receive rewards based on your lock period

**Example:** Stake 10,000 FACT for 30 days at 20% APR = ~164 FACT earned

### Option 2: Compound Staking (Maximum Returns)
1. Stake your tokens as above
2. Navigate to the "Rewards" tab
3. Click "Compound Now" regularly
4. Your rewards are automatically restaked
5. Benefit from compound interest growth

**Example:** 10,000 FACT compounded monthly at 20% APR = ~2,194 FACT after 1 year (vs 2,000 without compounding)

### Option 3: Active Governance (Additional Benefits)
1. Participate in governance votes
2. Create proposals for protocol improvements
3. Earn reputation and community trust
4. Potential future airdrops for active participants

---

Built with ❤️ on Solana
