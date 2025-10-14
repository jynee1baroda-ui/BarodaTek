# 🌐 BarodaTek.com Domain Setup on Vercel

## Complete Guide to Deploying with Custom Domain

### Step 1: Prepare Your Project

1. **Ensure vercel.json is configured:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "server.js"
       }
     ]
   }
   ```

2. **Update package.json scripts:**
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```powershell
   vercel login
   ```

3. **Deploy your project:**
   ```powershell
   cd C:\NewpROJEKTAI
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? **Y**
   - Which scope? **Your account**
   - Link to existing project? **N**
   - Project name? **barodatek-api-hub**
   - Directory? **./
   **

5. **Deploy to production:**
   ```powershell
   vercel --prod
   ```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure:
   - **Framework Preset**: Other
   - **Build Command**: (leave empty or `npm install`)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install`
5. Click "Deploy"

### Step 3: Add Custom Domain (BarodaTek.com)

#### A. In Vercel Dashboard

1. Go to your project dashboard
2. Click "Settings" tab
3. Click "Domains" in sidebar
4. Click "Add" button
5. Enter: **barodatek.com**
6. Click "Add"

#### B. Configure DNS Records

Vercel will show you the DNS records needed. You need to add these to your domain registrar:

**Option 1: Using Vercel Nameservers (Easiest)**

At your domain registrar (e.g., GoDaddy, Namecheap, Google Domains):

1. Find DNS settings
2. Change nameservers to:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```

**Option 2: Using A Records**

Add these DNS records at your registrar:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

**Option 3: Using CNAME (if supported)**

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | cname.vercel-dns.com |
| CNAME | www | cname.vercel-dns.com |

### Step 4: Verify Domain

1. After adding DNS records, wait 24-48 hours for propagation (usually faster)
2. Check status in Vercel dashboard
3. When verified, you'll see ✅ next to your domain

### Step 5: Configure www Redirect

1. In Vercel dashboard → Domains
2. Add **www.barodatek.com**
3. Choose "Redirect to barodatek.com"
4. Save

### Step 6: Enable HTTPS (Automatic)

Vercel automatically provisions SSL certificates. Once domain is verified:
- HTTPS will be enabled within minutes
- Force HTTPS redirect is enabled by default

### Step 7: Test Your Deployment

```powershell
# Test main domain
curl https://barodatek.com

# Test www redirect
curl https://www.barodatek.com

# Test API endpoint
curl https://barodatek.com/api/health
```

## Environment Variables (If Needed)

In Vercel Dashboard → Settings → Environment Variables:

```
NODE_ENV=production
PORT=8080  (Vercel ignores this, uses their port)
API_URL=https://barodatek.com
```

## Troubleshooting

### Domain Not Verifying

1. **Check DNS propagation:**
   ```powershell
   nslookup barodatek.com
   ```

2. **Use DNS checker:**
   - Visit: https://dnschecker.org
   - Enter: barodatek.com
   - Check global propagation

3. **Clear DNS cache:**
   ```powershell
   ipconfig /flushdns
   ```

### 404 Errors

1. Check vercel.json routes configuration
2. Ensure server.js handles all routes
3. Check Vercel build logs for errors

### API Not Working

1. Verify WebSocket support (may need alternative for Vercel)
2. Check server.js for Vercel-specific code:
   ```javascript
   const PORT = process.env.PORT || 8080;
   ```

3. For WebSockets on Vercel, consider:
   - Vercel Edge Functions
   - External WebSocket service (Pusher, Ably)
   - Socket.io with fallback

## Post-Deployment Checklist

- [ ] Domain resolves to Vercel
- [ ] HTTPS is enabled (green lock)
- [ ] www redirect works
- [ ] All pages load correctly
- [ ] API endpoints respond
- [ ] Real-time stats display
- [ ] Forms submit successfully
- [ ] Downloads work
- [ ] Analytics tracking works

## Update Deployment

```powershell
# Make changes to code
git add .
git commit -m "Update"
git push

# If using CLI
vercel --prod
```

## Domain Registrar-Specific Guides

### GoDaddy
1. Go to DNS Management
2. Find "Nameservers" section
3. Click "Change"
4. Select "Custom"
5. Enter Vercel nameservers

### Namecheap
1. Domain List → Manage
2. Advanced DNS tab
3. Add new records or change nameservers

### Google Domains
1. My domains
2. DNS on left sidebar
3. Name servers or Custom records

### Cloudflare
1. Add site to Cloudflare
2. Update nameservers at registrar
3. Add DNS records in Cloudflare
4. Set SSL to "Full"

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Custom Domains**: https://vercel.com/docs/concepts/projects/custom-domains
- **DNS Config**: https://vercel.com/docs/concepts/projects/domains/add-a-domain

---

**Created by**: JBaroda  
**Project**: BarodaTek API Hub  
**Domain**: BarodaTek.com  
**Deployment**: Vercel Edge Network  
**Status**: Ready to Deploy 🚀
