# 🌐 BarodaTek.com Domain Setup Guide

## Complete Guide to Link Your Website to BarodaTek.com

---

## ✅ Current Status

Your project is **already configured** for BarodaTek.com:
- ✅ Homepage set to `https://barodatek.com` in package.json
- ✅ CORS configured for barodatek.com and www.barodatek.com
- ✅ Vercel deployment configuration ready
- ✅ All files ready for production deployment

---

## 🚀 Step-by-Step Deployment to BarodaTek.com

### Step 1: Deploy to Vercel (5 minutes)

```powershell
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

**What happens:**
- Vercel will build and deploy your project
- You'll get a temporary URL like: `https://your-project.vercel.app`
- This verifies everything works before adding the custom domain

---

### Step 2: Add Custom Domain in Vercel Dashboard (2 minutes)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your deployed project

2. **Navigate to Settings:**
   - Click "Settings" tab
   - Select "Domains" from the left menu

3. **Add Your Domain:**
   - Click "Add Domain"
   - Enter: `barodatek.com`
   - Click "Add"
   - Also add: `www.barodatek.com`

---

### Step 3: Configure DNS (Choose ONE Method)

#### **METHOD A: Vercel Nameservers (Recommended - Easiest)**

**Best for:** Complete Vercel management, fastest setup

1. **Get Vercel Nameservers:**
   - In Vercel domain settings, you'll see:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ns3.vercel-dns.com
     ```

2. **Update at Your Domain Registrar:**
   - Log into where you bought BarodaTek.com
   - Find "DNS Settings" or "Nameservers"
   - Change to "Custom Nameservers"
   - Enter the 3 Vercel nameservers above
   - Save changes

3. **Wait for Propagation:**
   - Usually takes 15-30 minutes
   - Can take up to 48 hours in rare cases

---

#### **METHOD B: DNS Records (If You Want to Keep Current Nameservers)**

**Best for:** Using existing email hosting or other services

1. **Add These DNS Records at Your Registrar:**

   ```
   Type: A Record
   Name: @ (or leave blank for root domain)
   Value: 76.76.21.21
   TTL: 3600
   
   Type: CNAME Record
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

2. **Save and Wait:**
   - Changes typically take 10-15 minutes
   - Can take up to 24 hours

---

### Step 4: Enable SSL (Automatic)

Vercel automatically provisions SSL certificates:
- ✅ Free SSL from Let's Encrypt
- ✅ Auto-renewal every 90 days
- ✅ HTTPS enforced automatically
- ✅ HTTP → HTTPS redirect enabled

**No action needed!** SSL will be active within 5-10 minutes after DNS propagation.

---

## 🧪 Verify Your Domain Setup

### Test 1: Check DNS Propagation
```powershell
# Check if DNS is resolving
nslookup barodatek.com

# Should show Vercel's IP: 76.76.21.21
```

### Test 2: Visit Your Site
```
https://barodatek.com
https://www.barodatek.com
```

### Test 3: Test API Endpoints
```powershell
# Health check
curl https://barodatek.com/api/health

# Get contracts
curl https://barodatek.com/api/contracts
```

---

## 🎯 Quick Deploy Commands

### One-Click Deployment Script
```powershell
# Run the automated deployment script
.\DEPLOY-NOW.ps1
```

This script will:
- ✅ Check Vercel CLI installation
- ✅ Verify authentication
- ✅ Install dependencies
- ✅ Run pre-deployment checks
- ✅ Deploy to production
- ✅ Provide domain setup instructions

### Manual Deployment
```powershell
vercel --prod
```

---

## 🌟 Your Live URLs

After deployment and DNS setup, your site will be at:

- **Main Site:** https://barodatek.com
- **WWW Alias:** https://www.barodatek.com
- **API Base:** https://barodatek.com/api
- **Health Check:** https://barodatek.com/api/health
- **Chatbot:** https://barodatek.com/chatbot.html
- **Admin:** https://barodatek.com/admin

---

## 🔧 Troubleshooting

### Issue: "Domain not found"
**Solution:** DNS hasn't propagated yet. Wait 10-30 minutes and try again.

### Issue: "SSL Certificate Error"
**Solution:** SSL provisioning in progress. Wait 5-10 minutes after DNS propagation.

### Issue: "CORS Error"
**Solution:** Your domain is already configured in server.js. Redeploy if needed.

---

## 📱 After Deployment Checklist

- [ ] Site loads at https://barodatek.com
- [ ] Site loads at https://www.barodatek.com
- [ ] SSL certificate is valid (green padlock)
- [ ] API endpoints respond correctly
- [ ] Games work properly
- [ ] AI Chatbot responds
- [ ] No console errors

---

## 🎉 Success!

Once DNS propagates and SSL activates, your site will be live at:

**🌐 https://BarodaTek.com**

---

**Created by JBaroda** - From dev meetings to production! 🚀