# FACTRADE - Solana Token Platform

A decentralized trading platform built on Solana blockchain with transparent tokenomics and community-driven governance.

## Overview

FACTRADE is a Next.js application integrated with Solana blockchain, featuring:
- SPL Token implementation with exact tokenomics
- Wallet integration (Phantom, Solflare, Torus)
- Token distribution tracking
- Modern, responsive UI

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
│   │   ├── SolanaProvider.tsx    # Wallet adapter provider
│   │   ├── WalletConnectButton.tsx # Wallet connection UI
│   │   └── TokenInfo.tsx          # Token information display
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── programs/
│   └── factrade-token/
│       ├── tokenomics.json        # Token configuration
│       └── token-config.ts        # Token creation utilities
├── package.json
└── README.md
```

## Technologies Used

- **Next.js 16** - React framework
- **Solana Web3.js** - Solana blockchain interaction
- **Solana Wallet Adapter** - Multi-wallet support
- **SPL Token** - Solana token standard
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling

## Features

1. **Wallet Integration**
   - Connect with multiple Solana wallets
   - View wallet balance
   - Auto-connect on return visits

2. **Token Information**
   - Display complete tokenomics
   - Show token distribution breakdown
   - Display token features

3. **Responsive Design**
   - Mobile-friendly interface
   - Dark mode support
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

This application can be deployed on:
- Vercel (recommended for Next.js)
- Netlify
- Any Node.js hosting platform

For Solana program deployment, refer to [Solana Program Deployment Guide](https://docs.solana.com/cli/deploy-a-program).

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

- [x] Basic token implementation
- [x] Wallet integration
- [x] Token information display
- [ ] Token swap functionality
- [ ] Staking mechanism
- [ ] Governance features
- [ ] Mobile app

---

Built with ❤️ on Solana
