# 🚀 BarodaTek Arena - Deployment Workflow Guide

## 📋 Quick Reference

### Development (localhost:8080)
```powershell
npm run dev
# OR
.\dev-server.ps1
```
Open: http://localhost:8080

### Production Deployment
```powershell
.\deploy-production.ps1
# OR
npm run deploy
```
Live: https://barodatek.com

---

## 🛠️ Development Workflow

### 1️⃣ Start Local Development Server

**Option A - NPM Script:**
```powershell
cd C:\NewpROJEKTAI
npm run dev
```

**Option B - PowerShell Script:**
```powershell
.\dev-server.ps1
```

**What happens:**
- Starts HTTP server on port 8080
- Automatically opens http://localhost:8080 in browser
- Disables caching (`-c-1`) for instant updates
- Enables CORS for API testing

**Commands during development:**
- `Ctrl+C` - Stop server
- `Ctrl+Shift+R` - Hard refresh browser
- `F12` - Open DevTools

---

### 2️⃣ Make Changes to Your Site

**Files you can edit:**
- `index.html` - Main site content
- `styles/` - Custom CSS
- `scripts/` - JavaScript files
- `assets/` - Images, fonts, etc.

**Files you should NOT edit:**
- `arena_rebrand/` - Old React version (ignored)
- `node_modules/` - Dependencies
- `.vercel/` - Deployment cache

**Live reload:**
- Changes to HTML/CSS/JS are instant
- Just refresh browser (F5 or Ctrl+R)
- No build process needed

---

### 3️⃣ Test Before Deployment

**Checklist:**
- [ ] All pages load correctly
- [ ] Logo displays in navbar
- [ ] Profile photo shows in About section
- [ ] All links work (no 404s)
- [ ] Games/tools are functional
- [ ] No console errors (F12 → Console tab)
- [ ] Responsive design works (resize browser)
- [ ] Forms submit correctly

**Test on localhost:8080 BEFORE deploying!**

---

## 🚀 Production Deployment

### 4️⃣ Deploy to Live Site

**Recommended Method - PowerShell Script:**
```powershell
.\deploy-production.ps1
```

**What the script does:**
1. ✅ Creates timestamped backup
2. ✅ Generates `version.json` with deployment info
3. ✅ Validates all critical files exist
4. ✅ Creates deployment manifest
5. ✅ Asks for confirmation
6. ✅ Deploys to Vercel production

**Manual Method:**
```powershell
# 1. Prepare deployment
node scripts/prepare-deploy.js

# 2. Verify files
Get-ChildItem index.html, barodatek-logo.png, profile.jpg, vercel.json

# 3. Deploy
vercel --prod --yes
```

---

### 5️⃣ Verify Deployment

**Check deployment succeeded:**
1. Look for: `✅ Production: https://barodatek-api-platform-xxxxx.vercel.app`
2. Wait 30-60 seconds for CDN propagation
3. Visit: https://barodatek.com
4. Hard refresh: `Ctrl+Shift+R`

**Verification checklist:**
- [ ] Site loads (no black screen)
- [ ] Logo shows in navbar
- [ ] Profile photo displays
- [ ] All sections scroll correctly
- [ ] Games/tools work
- [ ] No console errors

**If domain shows old content:**
- Wait 2-5 minutes for cache to clear
- Hard refresh browser (`Ctrl+Shift+R`)
- Try incognito mode
- Clear browser cache completely

---

## 📂 File Structure

```
C:\NewpROJEKTAI\
├── index.html                      # Main site (3,375 lines)
├── barodatek-logo.png              # Navbar logo (88.8KB)
├── profile.jpg                     # Creator photo (166KB)
├── vercel.json                     # Deployment config
├── package.json                    # NPM scripts
│
├── scripts/
│   └── prepare-deploy.js           # Pre-deployment checks
│
├── dev-server.ps1                  # Start localhost:8080
├── deploy-production.ps1           # Full deployment workflow
│
├── version.json                    # Auto-generated on build
├── deployment-manifest.json        # Auto-generated on build
│
├── tools/                          # Utility pages
│   ├── api-explorer.html
│   ├── mini-game.html
│   └── chatbot.html
│
├── node_modules/                   # Dependencies (excluded from deploy)
├── .vercel/                        # Vercel cache (excluded)
├── arena_rebrand/                  # Old React version (IGNORE)
└── public_backup_*/                # Backups (excluded)
```

---

## ⚙️ NPM Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start localhost:8080 dev server |
| `npm run dev:backend` | Start Node.js backend (if needed) |
| `npm run build` | Prepare deployment files |
| `npm run deploy` | Build + deploy to production |
| `npm test` | Run tests (currently none) |
| `npm start` | Start backend server |

---

## 🔧 Deployment Configuration

### vercel.json
```json
{
  "buildCommand": "echo 'Static site'",
  "outputDirectory": ".",
  "cleanUrls": true,
  "trailingSlash": false
}
```

**What it does:**
- Serves files from root directory (`.`)
- Enables clean URLs (no `.html` extension)
- No trailing slashes on URLs
- No build command (static HTML)

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'http-server'"

**Fix:**
```powershell
npm install -g http-server
# OR
npx http-server . -p 8080
```

### Issue: Port 8080 already in use

**Fix:**
```powershell
# Find and kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# OR use different port
npx http-server . -p 8081
```

### Issue: Deployment fails - "Missing files"

**Fix:**
```powershell
# Check critical files exist
Test-Path index.html
Test-Path barodatek-logo.png
Test-Path profile.jpg
Test-Path vercel.json

# If missing, restore from backup
Copy-Item ..\barodatek_backup_*\index.html .
```

### Issue: Live site shows old content

**Fix:**
1. Wait 5 minutes for CDN cache to clear
2. Hard refresh: `Ctrl+Shift+R`
3. Check deployment URL directly:
   ```
   https://barodatek-api-platform-xxxxx.vercel.app
   ```
4. Force redeploy:
   ```powershell
   vercel --prod --yes --force
   ```

### Issue: Black screen on deployment

**Cause:** React/Tailwind arena_rebrand was deployed  
**Fix:**
```powershell
# Restore original HTML version
Copy-Item public_backup_20251015_210511\* . -Recurse -Force
vercel --prod --yes
```

---

## 📊 Deployment Logs

### version.json (Auto-generated)
```json
{
  "version": "20251016",
  "timestamp": "2025-10-16T12:34:56.789Z",
  "deployedAt": "Wednesday, October 16, 2025 at 5:34:56 AM PDT",
  "site": "BarodaTek Arena",
  "status": "live"
}
```

### deployment-manifest.json (Auto-generated)
```json
{
  "deploymentId": "deploy-20251016",
  "timestamp": "2025-10-16T12:34:56.789Z",
  "files": [
    { "name": "index.html", "size": 123456, "modified": "..." },
    { "name": "barodatek-logo.png", "size": 90921, "modified": "..." }
  ],
  "notes": "BarodaTek Arena - Bootstrap Edition",
  "tech": ["HTML", "Bootstrap 5", "Vanilla JavaScript", "Plain CSS"]
}
```

---

## 🎯 Best Practices

### ✅ DO:
- Test on localhost:8080 before deploying
- Create backups before major changes
- Use `deploy-production.ps1` for deployments
- Verify deployment on direct Vercel URL first
- Wait for CDN cache to clear (30-60 sec)

### ❌ DON'T:
- Edit files in `arena_rebrand/` folder
- Deploy without testing locally first
- Skip backups before major changes
- Panic if cache takes time to clear
- Delete version.json or deployment-manifest.json

---

## 🆘 Emergency Recovery

### Restore from backup:
```powershell
# List available backups
Get-ChildItem ..\barodatek_backup_* | Sort-Object LastWriteTime -Descending

# Restore latest backup
$latest = Get-ChildItem ..\barodatek_backup_* | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Copy-Item $latest\* . -Recurse -Force

# Redeploy
vercel --prod --yes
```

### Rollback to previous deployment:
```powershell
# List deployments
vercel ls --prod

# Rollback to specific deployment
vercel rollback <deployment-url>
```

---

## 📞 Support

**Issues?** Check:
1. This guide
2. `BOOTSTRAP-ARENA-COMPLETE.md`
3. Vercel deployment logs
4. Browser console (F12)

**Contact:**
- Email: jynee1.baroda@gmail.com
- GitHub: github.com/jbaroda

---

## 🎉 Summary

**Development:**
```powershell
npm run dev          # Start localhost:8080
# Make changes
# Test in browser
```

**Deployment:**
```powershell
.\deploy-production.ps1    # Deploy to barodatek.com
# Wait 60 seconds
# Verify on live site
```

**That's it!** No build process, no complex tools - just HTML, Bootstrap, and simple deployment! 🚀
