#!/bin/bash

# FACTRADE Master Deployment Script
# 
# This script automates the entire deployment process for FACTRADE platform
# 
# Usage:
#   ./scripts/deploy-all.sh [devnet|mainnet-beta]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to devnet
NETWORK=${1:-devnet}

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     FACTRADE Complete Deployment Script                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Validate network
if [[ "$NETWORK" != "devnet" && "$NETWORK" != "mainnet-beta" ]]; then
    echo -e "${RED}❌ Error: Invalid network '$NETWORK'${NC}"
    echo -e "Usage: ./scripts/deploy-all.sh [devnet|mainnet-beta]"
    exit 1
fi

echo -e "${YELLOW}📋 Target Network: $NETWORK${NC}"
echo ""

# Warning for mainnet
if [[ "$NETWORK" == "mainnet-beta" ]]; then
    echo -e "${RED}⚠️  WARNING: You are about to deploy to MAINNET!${NC}"
    echo -e "${RED}   This will use real SOL and is irreversible.${NC}"
    echo ""
    read -p "Type 'DEPLOY TO MAINNET' to continue: " confirmation
    if [[ "$confirmation" != "DEPLOY TO MAINNET" ]]; then
        echo -e "${YELLOW}Deployment cancelled.${NC}"
        exit 0
    fi
    echo ""
fi

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

command -v solana >/dev/null 2>&1 || {
    echo -e "${RED}❌ Solana CLI not found. Install it first:${NC}"
    echo "   sh -c \"\$(curl -sSfL https://release.solana.com/stable/install)\""
    exit 1
}

command -v anchor >/dev/null 2>&1 || {
    echo -e "${RED}❌ Anchor CLI not found. Install it first:${NC}"
    echo "   cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked"
    exit 1
}

command -v node >/dev/null 2>&1 || {
    echo -e "${RED}❌ Node.js not found. Install it first.${NC}"
    exit 1
}

echo -e "${GREEN}   ✓ All required tools installed${NC}"
echo ""

# Configure Solana CLI
echo -e "${BLUE}⚙️  Configuring Solana CLI...${NC}"
if [[ "$NETWORK" == "mainnet-beta" ]]; then
    solana config set --url https://api.mainnet-beta.solana.com
else
    solana config set --url https://api.devnet.solana.com
fi
echo -e "${GREEN}   ✓ Network configured${NC}"
echo ""

# Check balance
echo -e "${BLUE}💰 Checking wallet balance...${NC}"
BALANCE=$(solana balance | awk '{print $1}')
echo -e "   Balance: $BALANCE SOL"

REQUIRED_BALANCE="2.0"
if [[ "$NETWORK" == "mainnet-beta" ]]; then
    REQUIRED_BALANCE="5.0"
fi

if (( $(awk "BEGIN {print ($BALANCE < $REQUIRED_BALANCE)}") )); then
    echo -e "${RED}❌ Insufficient balance. Need at least $REQUIRED_BALANCE SOL${NC}"
    if [[ "$NETWORK" == "devnet" ]]; then
        echo -e "${YELLOW}   Run: solana airdrop 2${NC}"
    fi
    exit 1
fi
echo -e "${GREEN}   ✓ Sufficient balance${NC}"
echo ""

# Install npm dependencies
echo -e "${BLUE}📦 Installing npm dependencies...${NC}"
npm install --silent
echo -e "${GREEN}   ✓ Dependencies installed${NC}"
echo ""

# Step 1: Deploy Token
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 1: Deploying FACT Token${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""

export SOLANA_NETWORK=$NETWORK
npx ts-node scripts/deploy-token.ts

# Read mint address from latest deployment
DEPLOYMENT_FILE="deployments/token-${NETWORK}-latest.json"
if [[ ! -f "$DEPLOYMENT_FILE" ]]; then
    echo -e "${RED}❌ Deployment file not found: $DEPLOYMENT_FILE${NC}"
    exit 1
fi

TOKEN_MINT=$(grep -o '"mintAddress": "[^"]*"' "$DEPLOYMENT_FILE" | cut -d'"' -f4)
echo ""
echo -e "${GREEN}✅ Token deployed: $TOKEN_MINT${NC}"
echo ""

# Step 2: Build Programs
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 2: Building Solana Programs${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""

cd solana-programs
anchor build
echo -e "${GREEN}✅ Programs built successfully${NC}"
echo ""

# Step 3: Deploy Programs
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 3: Deploying Solana Programs${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""

if [[ "$NETWORK" == "mainnet-beta" ]]; then
    anchor deploy --provider.cluster mainnet-beta
else
    anchor deploy --provider.cluster devnet
fi

echo -e "${GREEN}✅ Programs deployed successfully${NC}"
cd ..
echo ""

# Step 4: Initialize Programs
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 4: Initializing Programs${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠️  Note: Program initialization requires manual steps${NC}"
echo -e "   Generate template with:"
echo -e "   ${GREEN}npx ts-node scripts/initialize-programs.ts $TOKEN_MINT${NC}"
echo ""
echo -e "   Then initialize using Anchor tests:"
echo -e "   ${GREEN}cd solana-programs && anchor test --skip-build --skip-deploy${NC}"
echo ""

npx ts-node scripts/initialize-programs.ts $TOKEN_MINT
echo ""

# Step 5: Token Distribution Setup
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 5: Token Distribution Setup${NC}"
echo -e "${BLUE}═════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}⚠️  Configure distribution wallets before distribution${NC}"
echo ""
echo -e "1. Edit ${GREEN}distribution-wallets.json${NC} with actual wallet addresses"
echo -e "2. Verify all addresses are correct"
echo -e "3. Run distribution:"
echo -e "   ${GREEN}npx ts-node scripts/distribute-tokens.ts $TOKEN_MINT${NC}"
echo ""

# Generate distribution template
if [[ ! -f "distribution-wallets.json" ]]; then
    npx ts-node scripts/distribute-tokens.ts $TOKEN_MINT 2>/dev/null || true
    echo -e "${GREEN}✅ Distribution template created${NC}"
fi
echo ""

# Final Summary
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              🎉 Deployment Complete! 🎉                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "   Network:          ${GREEN}$NETWORK${NC}"
echo -e "   Token Mint:       ${GREEN}$TOKEN_MINT${NC}"
echo -e "   Explorer:         ${GREEN}https://explorer.solana.com/address/$TOKEN_MINT?cluster=$NETWORK${NC}"
echo -e "   Deployment Info:  ${GREEN}$DEPLOYMENT_FILE${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "   1. Initialize programs using Anchor tests"
echo -e "   2. Configure ${GREEN}distribution-wallets.json${NC}"
echo -e "   3. Distribute tokens"
echo -e "   4. Update ${GREEN}.env.local${NC} with:"
echo -e "      ${YELLOW}NEXT_PUBLIC_TOKEN_MINT_ADDRESS=$TOKEN_MINT${NC}"
echo -e "   5. Test frontend: ${GREEN}npm run dev${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "   - Complete Guide: ${GREEN}COMPLETE_DEPLOYMENT_GUIDE.md${NC}"
echo -e "   - Checklist:      ${GREEN}DEPLOYMENT_CHECKLIST.md${NC}"
echo -e "   - Scripts:        ${GREEN}scripts/README.md${NC}"
echo ""
echo -e "${GREEN}✨ Happy deploying! ✨${NC}"
echo ""
