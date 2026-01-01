# Auto-Deploy FACTRADE DApp to Vercel Free Domain

Quick guide to automatically deploy your FACTRADE Solana DApp to a free Vercel domain (e.g., `factrade-solana.vercel.app`).

---

## 🚀 One-Command Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate via:
- Email
- GitHub
- GitLab
- Bitbucket

### Step 3: Deploy with Auto-Deploy

```bash
# Navigate to your project
cd /path/to/FACTRADE-solana

# Deploy to production
vercel --prod
```

**That's it!** Vercel will:
- ✅ Automatically build your Next.js app
- ✅ Deploy to a free domain: `your-project-name.vercel.app`
- ✅ Provision SSL certificate (HTTPS enabled)
- ✅ Configure global CDN
- ✅ Set up auto-deploy from Git

---

## 📋 What You'll Get

After running `vercel --prod`, you'll receive:

```
🔍 Inspect: https://vercel.com/your-username/factrade-solana/xyz123
✅ Production: https://factrade-solana.vercel.app [ready] [1s]
```

Your DApp is now live at: **https://factrade-solana.vercel.app**

---

## 🔄 Setup Auto-Deploy from GitHub

### Step 1: Connect GitHub Repository

```bash
# In your project directory
vercel

# Answer the prompts:
# ❯ Link to existing project? No
# ❯ Project name? factrade-solana
# ❯ Which directory? ./
# ❯ Override settings? No
```

### Step 2: Link to GitHub

1. Go to https://vercel.com/dashboard
2. Click on your project (`factrade-solana`)
3. Go to **Settings** → **Git**
4. Click **Connect Git Repository**
5. Select **GitHub** and authorize
6. Choose repository: `saanjaypatil78/FACTRADE-solana`
7. Select branch: `main` or `copilot/create-solana-app`

### Step 3: Configure Auto-Deploy

In Vercel Dashboard → Settings → Git:

```
✅ Production Branch: main
✅ Deploy Previews: Enabled
✅ Automatic Deployments: Enabled
```

**Now every push to your branch automatically deploys!**

---

## 🎯 Using GitHub Actions (Alternative)

Create `.github/workflows/vercel-deploy.yml`:

```yaml
name: Vercel Production Deployment

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
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**Add GitHub Secrets:**

1. Go to GitHub repo → Settings → Secrets → Actions
2. Add secrets:
   - `VERCEL_TOKEN`: Get from https://vercel.com/account/tokens
   - `VERCEL_ORG_ID`: From `.vercel/project.json`
   - `VERCEL_PROJECT_ID`: From `.vercel/project.json`

---

## ⚙️ Environment Variables

### Set via CLI:

```bash
# Add environment variables for production
vercel env add NEXT_PUBLIC_SOLANA_NETWORK production
# Enter: devnet

vercel env add NEXT_PUBLIC_SOLANA_RPC_URL production
# Enter: https://api.devnet.solana.com

vercel env add NEXT_PUBLIC_WS_ENDPOINT production
# Enter: wss://api.devnet.solana.com

vercel env add NEXT_PUBLIC_SYNC_INTERVAL production
# Enter: 1000

vercel env add NEXT_PUBLIC_ENABLE_AUTO_SYNC production
# Enter: true
```

### Set via Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` | Production |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | `https://api.devnet.solana.com` | Production |
| `NEXT_PUBLIC_WS_ENDPOINT` | `wss://api.devnet.solana.com` | Production |
| `NEXT_PUBLIC_SYNC_INTERVAL` | `1000` | Production |
| `NEXT_PUBLIC_ENABLE_AUTO_SYNC` | `true` | Production |

5. Click **Save**
6. Redeploy: `vercel --prod`

---

## 🌐 Your Free Vercel Domain

Vercel automatically provides:

```
https://factrade-solana.vercel.app
```

**Free includes:**
- ✅ Unlimited bandwidth
- ✅ Automatic SSL/HTTPS
- ✅ Global CDN (300+ edge locations)
- ✅ Automatic scaling
- ✅ Zero-downtime deployments
- ✅ DDoS protection
- ✅ Built-in analytics

---

## 📊 Monitor Deployments

### View Deployment Status:

```bash
# List all deployments
vercel ls

# View logs
vercel logs

# Check specific deployment
vercel inspect <deployment-url>
```

### Via Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. View:
   - **Deployments**: All deployment history
   - **Analytics**: Traffic, performance metrics
   - **Logs**: Runtime logs
   - **Insights**: Web Vitals, performance scores

---

## 🔗 Share Your Free Domain

Your DApp is live at:

```
https://factrade-solana.vercel.app
```

Share this link with:
- Users
- Investors
- Community members
- For testing

**To customize the domain name:**
```bash
# Remove current project
vercel remove factrade-solana

# Redeploy with custom name
vercel --name my-custom-name
```

Result: `https://my-custom-name.vercel.app`

---

## 🔄 Update Your Deployment

### Method 1: Git Push (Auto-Deploy)

```bash
git add .
git commit -m "Update DApp"
git push origin main
```

Vercel automatically detects the push and deploys!

### Method 2: Manual Deploy

```bash
vercel --prod
```

### Method 3: Rollback

```bash
# View deployment history
vercel ls

# Rollback to previous deployment
vercel rollback
```

---

## 🎨 Preview Deployments

Every pull request gets a unique preview URL:

```bash
# Deploy preview
vercel

# Result: https://factrade-solana-git-feature-username.vercel.app
```

**Benefits:**
- Test changes before merging
- Share preview with team
- Automatic preview for each PR

---

## 📱 Test Your Deployed DApp

### 1. Open Your Free Domain

```bash
# Open in browser
open https://factrade-solana.vercel.app
```

### 2. Verify Features

- [ ] Page loads successfully
- [ ] Wallet connection button appears
- [ ] Connect wallet (Phantom/Solflare)
- [ ] Check all tabs (Overview, Stake, Rewards, Governance)
- [ ] Verify real-time sync indicator
- [ ] Test mobile responsiveness
- [ ] Check dark mode toggle
- [ ] Verify no console errors

### 3. Performance Check

```bash
# Run Lighthouse
npm install -g lighthouse
lighthouse https://factrade-solana.vercel.app --view
```

Target scores:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90

---

## 🚨 Troubleshooting

### Build Failures

**Check build locally first:**
```bash
npm run build
```

**View Vercel logs:**
```bash
vercel logs
```

**Common fixes:**
- Ensure all dependencies are in `package.json`
- Check `next.config.ts` is valid
- Verify environment variables are set
- Check Node version compatibility

### Domain Not Loading

**Check deployment status:**
```bash
vercel ls
```

**Verify DNS:**
```bash
dig factrade-solana.vercel.app
```

### SSL Certificate Issues

- Wait 1-2 minutes for SSL provisioning
- Check status in Vercel dashboard
- SSL is automatic for `.vercel.app` domains

---

## 💰 Free Tier Limits

Vercel Hobby (Free) Plan:

| Feature | Limit |
|---------|-------|
| Bandwidth | Unlimited |
| Deployments | 100/day |
| Build time | 6 hours/month |
| Team members | 1 |
| Domains | Unlimited |
| SSL | Automatic |
| Edge Functions | 100k invocations/day |

**Perfect for:**
- Personal projects
- MVPs
- Testing
- Small applications
- Community demos

**Upgrade to Pro ($20/month) for:**
- Team collaboration
- Advanced analytics
- Priority support
- Higher build limits
- Password protection
- More Edge Functions

---

## 🎯 Complete Workflow

### Initial Setup (One-time):

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Connect GitHub
# Go to vercel.com → Settings → Git → Connect Repository
```

### Daily Development:

```bash
# 1. Make changes
git add .
git commit -m "New feature"

# 2. Push to GitHub
git push origin main

# 3. Auto-deploys to production! ✨
```

**That's it!** Your changes are live at `https://factrade-solana.vercel.app`

---

## 📋 Quick Command Reference

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# View deployments
vercel ls

# View logs
vercel logs

# Check environment variables
vercel env ls

# Add environment variable
vercel env add KEY_NAME

# Remove project
vercel remove project-name

# Rollback deployment
vercel rollback

# Login/logout
vercel login
vercel logout
```

---

## 🔗 Useful Links

- **Your Dashboard**: https://vercel.com/dashboard
- **Deployment Status**: https://vercel.com/your-username/factrade-solana
- **Analytics**: https://vercel.com/your-username/factrade-solana/analytics
- **Vercel Docs**: https://vercel.com/docs
- **Next.js on Vercel**: https://vercel.com/docs/frameworks/nextjs

---

## 🎉 Success!

Your FACTRADE Solana DApp is now:

✅ **Deployed**: https://factrade-solana.vercel.app
✅ **Auto-updating**: Every Git push deploys automatically
✅ **Secure**: HTTPS enabled with free SSL
✅ **Fast**: Global CDN with edge caching
✅ **Scalable**: Automatic scaling to handle traffic
✅ **Free**: $0 cost on Vercel Hobby plan

**Share your DApp and start earning passive income with FACT tokens! 🚀**

---

## 💡 Pro Tips

1. **Custom Domain Later**: You can add a custom domain anytime from dashboard
2. **Preview Branches**: Each branch gets its own preview URL
3. **Environment Variables**: Set different values for preview/production
4. **Analytics**: Enable Vercel Analytics for free in dashboard
5. **Performance**: Vercel automatically optimizes images and assets
6. **Zero Config**: No configuration needed, works out of the box
7. **Instant Rollback**: Revert to any previous deployment in 1 click
8. **Real-time Logs**: Monitor your app in real-time from dashboard

---

**Questions?** Check https://vercel.com/docs or the troubleshooting section above.

**Ready to upgrade?** Add a custom domain: See `CUSTOM_DOMAIN_HOSTING.md`
