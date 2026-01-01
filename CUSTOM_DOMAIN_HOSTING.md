# Custom Domain Hosting Guide for FACTRADE DApp

Complete guide to host your FACTRADE Solana DApp on a custom domain (e.g., factrade.com, app.factrade.io)

---

## Overview

This guide covers hosting your DApp on:
1. **Vercel** (Recommended - Easy & Fast)
2. **Netlify** (Alternative)
3. **AWS/DigitalOcean** (Self-hosted)
4. **IPFS** (Decentralized hosting)

---

## Option 1: Vercel (Recommended) ⭐

Vercel offers the easiest deployment with automatic CI/CD, SSL, and global CDN.

### Step 1: Prepare Your Project

```bash
# Ensure your project builds successfully
cd /path/to/FACTRADE-solana
npm run build

# Verify build output
ls -la .next/
```

### Step 2: Install Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 3: Deploy to Vercel

```bash
# Initial deployment
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? factrade-solana
# - Directory? ./
# - Override settings? No

# For production deployment
vercel --prod
```

### Step 4: Add Custom Domain

**Option A: Using Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project (factrade-solana)
3. Click "Settings" → "Domains"
4. Click "Add Domain"
5. Enter your custom domain (e.g., `app.factrade.com`)
6. Click "Add"

**Option B: Using CLI**

```bash
# Add custom domain
vercel domains add app.factrade.com

# List all domains
vercel domains ls
```

### Step 5: Configure DNS

You need to configure your domain's DNS settings. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

**For Root Domain (factrade.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

**For Subdomain (app.factrade.com):**
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
TTL: Auto
```

**Example DNS Configuration:**

| Type  | Name | Value                  | TTL  |
|-------|------|------------------------|------|
| A     | @    | 76.76.21.21           | Auto |
| CNAME | app  | cname.vercel-dns.com  | Auto |
| CNAME | www  | cname.vercel-dns.com  | Auto |

### Step 6: Verify SSL Certificate

Vercel automatically provisions SSL certificates. Check status:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Wait for SSL status to show "Active" (usually 1-5 minutes)
3. Visit https://app.factrade.com to verify

### Step 7: Configure Environment Variables

Add production environment variables:

**Via Dashboard:**
1. Go to Settings → Environment Variables
2. Add each variable:
   - `NEXT_PUBLIC_SOLANA_NETWORK` = `mainnet-beta`
   - `NEXT_PUBLIC_SOLANA_RPC_URL` = `https://api.mainnet-beta.solana.com`
   - `NEXT_PUBLIC_WS_ENDPOINT` = `wss://api.mainnet-beta.solana.com`
   - `NEXT_PUBLIC_STAKING_PROGRAM_ID` = `<your_program_id>`
   - `NEXT_PUBLIC_REWARDS_PROGRAM_ID` = `<your_program_id>`
   - `NEXT_PUBLIC_GOVERNANCE_PROGRAM_ID` = `<your_program_id>`
   - `NEXT_PUBLIC_TOKEN_MINT_ADDRESS` = `<your_token_address>`
   - `NEXT_PUBLIC_SYNC_INTERVAL` = `1000`
   - `NEXT_PUBLIC_ENABLE_AUTO_SYNC` = `true`

3. Redeploy: `vercel --prod`

**Via CLI:**
```bash
vercel env add NEXT_PUBLIC_SOLANA_NETWORK production
# Enter: mainnet-beta

vercel env add NEXT_PUBLIC_SOLANA_RPC_URL production
# Enter: https://api.mainnet-beta.solana.com

# Repeat for all variables, then redeploy
vercel --prod
```

### Step 8: Set Up Continuous Deployment

**Automatic Deployment from GitHub:**

1. Go to Vercel Dashboard → Your Project → Settings → Git
2. Connect your GitHub repository
3. Configure:
   - Production Branch: `main` or `master`
   - Auto-deploy on push: ✅ Enabled
4. Every push to main branch will auto-deploy

**vercel.json Configuration:**

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "env": {
    "NEXT_PUBLIC_SOLANA_NETWORK": "mainnet-beta"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/home",
      "destination": "/",
      "permanent": true
    }
  ]
}
```

---

## Option 2: Netlify

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
netlify login
```

### Step 2: Deploy to Netlify

```bash
# Build your project
npm run build

# Deploy
netlify deploy --prod

# Or link to Git
netlify init
```

### Step 3: Add Custom Domain

```bash
# Add domain
netlify domains:add app.factrade.com

# Netlify will provide DNS instructions
```

**DNS Configuration for Netlify:**
```
Type: CNAME
Name: app
Value: <your-site-name>.netlify.app
TTL: Auto
```

### Step 4: Configure netlify.toml

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_SOLANA_NETWORK = "mainnet-beta"
  NEXT_PUBLIC_SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

---

## Option 3: AWS (Self-Hosted)

### Architecture

```
Route 53 (DNS) → CloudFront (CDN) → S3 (Static Files)
                       ↓
                  Lambda@Edge (SSR)
```

### Step 1: Build Static Export

```bash
# Update next.config.ts for static export
npm run build
```

### Step 2: Create S3 Bucket

```bash
aws s3 mb s3://app.factrade.com --region us-east-1

# Enable static website hosting
aws s3 website s3://app.factrade.com \
  --index-document index.html \
  --error-document 404.html

# Upload build files
aws s3 sync .next s3://app.factrade.com --delete
```

### Step 3: Configure CloudFront

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name app.factrade.com.s3.amazonaws.com \
  --default-root-object index.html

# Note the CloudFront domain (e.g., d111111abcdef8.cloudfront.net)
```

### Step 4: Request SSL Certificate

```bash
# Request certificate in ACM
aws acm request-certificate \
  --domain-name app.factrade.com \
  --validation-method DNS \
  --region us-east-1

# Validate via DNS records
```

### Step 5: Configure Route 53

```bash
# Create hosted zone
aws route53 create-hosted-zone --name factrade.com

# Create A record pointing to CloudFront
# Use AWS Console or CLI to add alias record
```

---

## Option 4: IPFS (Decentralized)

### Step 1: Build Static Site

```bash
npm run build
npm run export  # If you have export script
```

### Step 2: Upload to IPFS

```bash
# Install IPFS CLI
brew install ipfs  # macOS
# or download from https://ipfs.io

# Initialize IPFS
ipfs init

# Add your build to IPFS
ipfs add -r .next/

# Note the CID (Content Identifier)
# Example: QmXxx...xxx
```

### Step 3: Pin to Pinata or Fleek

**Using Pinata:**
```bash
# Upload via Pinata web interface
# https://pinata.cloud

# Or use Pinata API
curl -X POST "https://api.pinata.cloud/pinning/pinFileToIPFS" \
  -H "Authorization: Bearer YOUR_JWT" \
  -F file=@.next
```

**Using Fleek:**
1. Go to https://fleek.co
2. Connect GitHub repository
3. Configure build settings
4. Deploy to IPFS automatically

### Step 4: Configure ENS Domain (Optional)

```javascript
// Set IPFS content hash for your ENS domain
const contentHash = 'ipfs://QmXxx...xxx';
// Use ENS manager to set content hash
```

---

## DNS Provider Specific Instructions

### GoDaddy

1. Log in to GoDaddy
2. Go to My Products → DNS
3. Add records:
   ```
   Type: CNAME
   Name: app
   Value: cname.vercel-dns.com
   TTL: 600 seconds
   ```

### Cloudflare

1. Log in to Cloudflare
2. Select your domain
3. Go to DNS → Add Record
4. Add CNAME record:
   ```
   Type: CNAME
   Name: app
   Target: cname.vercel-dns.com
   Proxy status: Proxied (orange cloud)
   ```

### Namecheap

1. Log in to Namecheap
2. Domain List → Manage → Advanced DNS
3. Add New Record:
   ```
   Type: CNAME Record
   Host: app
   Value: cname.vercel-dns.com
   TTL: Automatic
   ```

---

## Verification Checklist

After DNS configuration, verify your deployment:

### 1. DNS Propagation

```bash
# Check DNS records
dig app.factrade.com

# Check globally
https://dnschecker.org/#CNAME/app.factrade.com
```

### 2. SSL Certificate

```bash
# Verify SSL
curl -I https://app.factrade.com

# Check certificate details
openssl s_client -connect app.factrade.com:443 -servername app.factrade.com
```

### 3. Application Tests

- [ ] Navigate to https://app.factrade.com
- [ ] Verify wallet connection works
- [ ] Check all tabs (Overview, Stake, Rewards, Governance)
- [ ] Test transaction functionality
- [ ] Verify real-time sync indicator
- [ ] Check mobile responsiveness
- [ ] Test dark mode
- [ ] Verify console has no errors

### 4. Performance Tests

```bash
# Test page speed
https://pagespeed.web.dev/analysis?url=https://app.factrade.com

# Check Lighthouse score
npm install -g lighthouse
lighthouse https://app.factrade.com --view
```

---

## Subdomain Strategy

Consider using subdomains for different purposes:

| Subdomain | Purpose | Example |
|-----------|---------|---------|
| app.factrade.com | Main DApp | Production app |
| staging.factrade.com | Staging environment | Testing |
| docs.factrade.com | Documentation | Guides & API docs |
| api.factrade.com | Backend API | If you add backend |
| testnet.factrade.com | Testnet version | Devnet testing |

---

## Environment-Specific Deployments

### Production (mainnet-beta)
```
Domain: app.factrade.com
Network: mainnet-beta
RPC: https://api.mainnet-beta.solana.com
```

### Staging (devnet)
```
Domain: staging.factrade.com
Network: devnet
RPC: https://api.devnet.solana.com
```

### Development (local)
```
Domain: localhost:3000
Network: localhost
RPC: http://localhost:8899
```

---

## CI/CD Pipeline

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SOLANA_NETWORK: mainnet-beta
          NEXT_PUBLIC_SOLANA_RPC_URL: ${{ secrets.RPC_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Monitoring & Analytics

### 1. Add Google Analytics

```typescript
// app/layout.tsx
import Script from 'next/script';

export default function Layout() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
        `}
      </Script>
      {/* Your app */}
    </>
  );
}
```

### 2. Add Vercel Analytics

```bash
npm install @vercel/analytics
```

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function Layout() {
  return (
    <>
      {/* Your app */}
      <Analytics />
    </>
  );
}
```

### 3. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
});
```

---

## Security Best Practices

### 1. Environment Variables

Never commit sensitive data. Use Vercel's environment variables feature.

### 2. CSP Headers

Add to `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.devnet.solana.com https://api.mainnet-beta.solana.com wss://api.devnet.solana.com wss://api.mainnet-beta.solana.com;"
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Troubleshooting

### DNS Not Propagating
```bash
# Clear local DNS cache
sudo dscacheutil -flushcache  # macOS
ipconfig /flushdns  # Windows

# Wait 24-48 hours for full global propagation
```

### SSL Certificate Issues
- Ensure DNS is correctly configured before requesting SSL
- Wait 5-10 minutes for automatic SSL provisioning
- Check Vercel dashboard for SSL status

### Build Failures
```bash
# Check build locally first
npm run build

# Check Vercel logs
vercel logs

# Check environment variables are set correctly
```

### 404 Errors
- Ensure routing is configured in `vercel.json`
- Check Next.js rewrites in `next.config.ts`

---

## Cost Estimation

### Vercel (Recommended)
- **Hobby Plan**: Free (includes SSL, CDN, unlimited bandwidth)
- **Pro Plan**: $20/month (team features, advanced analytics)
- **Custom domain**: Free

### Netlify
- **Starter**: Free (100GB bandwidth)
- **Pro**: $19/month (unlimited)

### AWS
- **S3**: ~$0.023 per GB
- **CloudFront**: ~$0.085 per GB transfer
- **Route 53**: $0.50 per hosted zone/month
- **Total**: ~$10-50/month depending on traffic

### Domain Registration
- **GoDaddy/Namecheap**: ~$12/year for .com
- **Cloudflare**: ~$8.57/year for .com

---

## Quick Reference Commands

```bash
# Deploy to Vercel
vercel --prod

# Add custom domain
vercel domains add app.factrade.com

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove domain
vercel domains rm app.factrade.com

# Rollback deployment
vercel rollback

# Check DNS
dig app.factrade.com
nslookup app.factrade.com

# Test SSL
curl -I https://app.factrade.com
```

---

## Final Checklist

Before going live:

- [ ] Build passes locally (`npm run build`)
- [ ] All environment variables configured
- [ ] DNS records configured correctly
- [ ] SSL certificate active
- [ ] Custom domain accessible
- [ ] Wallet connection works on production
- [ ] All features tested (staking, rewards, governance)
- [ ] Real-time sync working
- [ ] Mobile responsive
- [ ] Performance optimized (Lighthouse score > 90)
- [ ] Analytics configured
- [ ] Error tracking configured
- [ ] Security headers in place
- [ ] Backups configured
- [ ] Monitoring alerts set up

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Solana Docs**: https://docs.solana.com
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

---

**Your FACTRADE DApp is now ready to launch on your custom domain! 🚀**

For questions or issues, refer to the troubleshooting section or contact your hosting provider's support.
