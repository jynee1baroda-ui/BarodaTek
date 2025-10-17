# 📋 Deployment Checklist

Use this checklist when deploying to ensure maintenance screen works correctly.

---

## Pre-Deployment Checklist

### ✅ Required Files Exist:
- [ ] `index.html` (your normal site)
- [ ] `maintenance.html` (arcade-themed maintenance page)
- [ ] `arena-control-center.html` (if deploying)
- [ ] `smart-deploy.ps1` (deployment script)
- [ ] `.vercelignore` or `.gitignore` (optional but recommended)

### ✅ Vercel Setup:
- [ ] Vercel CLI installed (`vercel --version` works)
- [ ] Logged into Vercel (`vercel whoami` shows username)
- [ ] Project linked (`vercel link` or deployed before)
- [ ] Production domain configured

### ✅ Local Testing:
- [ ] Changes tested locally (`npm run dev` at localhost:8080)
- [ ] All features work as expected
- [ ] No console errors
- [ ] Responsive design verified (mobile/tablet/desktop)
- [ ] Browser cache cleared for accurate testing

### ✅ Git Status (Optional but Recommended):
- [ ] All changes committed (`git status` clean)
- [ ] Pushed to remote (`git push origin main`)
- [ ] Branch up to date

### ✅ Maintenance Page Check:
- [ ] `maintenance.html` is valid HTML
- [ ] Contains cache-busting meta tags
- [ ] Has auto-detection JavaScript (checks for maintenance.flag)
- [ ] Tested locally with `.\demo-maintenance.ps1`
- [ ] ETA updated (if needed)
- [ ] Features list updated (if needed)

---

## During Deployment Checklist

### Phase 1: Pre-Deployment Checks (Automatic)
- [ ] Script validates Vercel CLI installed
- [ ] Script checks all required files exist
- [ ] Script validates maintenance.html
- [ ] Script checks git status
- [ ] Script prompts for confirmation

### Phase 2: Local Maintenance Activation (Automatic)
- [ ] Script creates `index.html.backup`
- [ ] Script replaces `index.html` with `maintenance.html`
- [ ] Script creates `maintenance.flag`
- [ ] Local site now shows maintenance page

### Phase 3: Deploy Maintenance to Production (Automatic)
- [ ] Script runs `vercel --prod --yes`
- [ ] Deployment succeeds (check output)
- [ ] Script waits 30 seconds for CDN propagation
- [ ] Progress bar shows 100%
- [ ] Message confirms: "Maintenance screen is now LIVE"

**VERIFY:** Visit https://barodatek.com
- [ ] Maintenance page is visible
- [ ] Shows: "We're Updating BarodaTek Arena"
- [ ] Twinkling stars and floating llama visible
- [ ] Progress bar animating
- [ ] No errors in browser console

**VERIFY:** Check flag exists
```powershell
curl -I https://barodatek.com/maintenance.flag
```
- [ ] Returns HTTP 200 (flag exists)

### Phase 4: Local Site Restoration (Automatic)
- [ ] Script restores `index.html` from backup
- [ ] Script removes local `maintenance.flag`
- [ ] Local site is ready for editing

### Phase 5: Make Your Changes (MANUAL)
- [ ] Edit files as needed
- [ ] Test changes locally (`npm run dev`)
- [ ] Verify all features work
- [ ] Build for production (if needed)
- [ ] **IMPORTANT:** Production still shows maintenance
- [ ] Press ENTER when ready to deploy

**VERIFY:** Check maintenance still live
```powershell
curl -I https://barodatek.com/maintenance.flag
```
- [ ] Still returns HTTP 200 (flag still exists)

### Phase 6: Deploy Updated Site (Automatic)
- [ ] Script removes any local `maintenance.flag`
- [ ] Script runs `vercel --prod --yes`
- [ ] Deployment succeeds (check output)
- [ ] Script waits 30 seconds for CDN propagation
- [ ] Progress bar shows 100%
- [ ] Message confirms: "Updated site deployed"

**VERIFY:** Check flag is gone
```powershell
curl -I https://barodatek.com/maintenance.flag
```
- [ ] Returns HTTP 404 (flag deleted)

### Phase 7: Cleanup (Automatic)
- [ ] Script removes `index.html.backup`
- [ ] Script verifies no `maintenance.flag` exists
- [ ] Script shows success message

---

## Post-Deployment Checklist

### ✅ Immediate Verification (0-5 minutes):
- [ ] Visit https://barodatek.com
- [ ] **NO maintenance page** visible
- [ ] Updated site loads correctly
- [ ] All new features present and working
- [ ] No JavaScript errors in console (F12)
- [ ] No 404 errors for resources

### ✅ Maintenance Auto-Disappearance:
- [ ] Maintenance page faded out automatically
- [ ] No manual intervention needed
- [ ] Users were redirected to normal site
- [ ] Smooth transition (no jarring refresh)

### ✅ Functionality Check:
- [ ] Homepage loads completely
- [ ] Navigation works
- [ ] API endpoints functional (if applicable)
- [ ] Forms submit correctly
- [ ] Links work
- [ ] Images load
- [ ] Styles applied correctly

### ✅ Arena Control Center (if applicable):
- [ ] Visit https://barodatek.com/arena-control-center.html
- [ ] Dashboard loads
- [ ] Stats cards populate with data
- [ ] Charts render (5 mini graphs)
- [ ] System Status shows "Operational" (green)
- [ ] API endpoints testable
- [ ] AI Monitor accessible (if admin)
- [ ] Demo mode works

### ✅ Responsive Design:
- [ ] Desktop view (1920x1080)
- [ ] Tablet view (768x1024)
- [ ] Mobile view (375x667)
- [ ] All elements visible
- [ ] No horizontal scrolling
- [ ] Text readable
- [ ] Buttons clickable

### ✅ Performance Check:
- [ ] Page load time < 3 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] No layout shifts (CLS)
- [ ] Images optimized
- [ ] JavaScript loads quickly

### ✅ Browser Compatibility:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

### ✅ SEO & Meta:
- [ ] Title tags present
- [ ] Meta descriptions present
- [ ] Favicon loads
- [ ] Open Graph tags (if needed)
- [ ] Structured data valid (if applicable)

---

## Monitoring Checklist (First Hour)

### ✅ Check Arena Control Center:
- [ ] Open https://barodatek.com/arena-control-center.html
- [ ] Monitor "Active Users" metric
- [ ] Check "API Requests" per minute
- [ ] Verify "Uptime" shows 100%
- [ ] Response time < 200ms
- [ ] Port Status shows "Active"

### ✅ Review AI Monitor Bot:
- [ ] No critical anomalies detected
- [ ] AI Reasoning Log shows normal patterns
- [ ] Recent AI Actions list is empty (no fixes needed)
- [ ] System Status shows "Operational"

### ✅ Check Vercel Dashboard:
- [ ] Visit https://vercel.com/dashboard
- [ ] Latest deployment shows "Ready"
- [ ] No error logs
- [ ] Build time reasonable
- [ ] Deployment preview works

### ✅ Monitor Error Rates:
- [ ] Browser console: No errors
- [ ] Network tab: All resources 200 OK
- [ ] Server logs: No 5xx errors
- [ ] API responses: All successful

---

## Troubleshooting Checklist

### ❌ Issue: Maintenance Won't Disappear

**Checks:**
- [ ] Verify `maintenance.flag` deleted locally:
  ```powershell
  Test-Path "maintenance.flag"  # Should be False
  ```
- [ ] Check flag on production:
  ```powershell
  curl -I https://barodatek.com/maintenance.flag
  # Should return 404
  ```
- [ ] Wait 60 seconds for CDN propagation
- [ ] Clear browser cache (Ctrl+Shift+R)
- [ ] Check Vercel deployment logs for errors

**Fix if needed:**
```powershell
Remove-Item "maintenance.flag" -Force
vercel --prod --yes
```

---

### ❌ Issue: Deployment Failed

**Checks:**
- [ ] Vercel CLI still logged in: `vercel whoami`
- [ ] Internet connection stable
- [ ] Vercel service status: https://www.vercel-status.com
- [ ] Project quota not exceeded
- [ ] Build succeeded (no syntax errors)

**Fix:**
- [ ] Script auto-rolled back local changes
- [ ] Verify normal site still showing
- [ ] Review error message
- [ ] Fix issue and retry deployment

---

### ❌ Issue: Users See Old Site

**Checks:**
- [ ] Wait 30-60 seconds for CDN propagation
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Check Vercel deployment status
- [ ] Verify correct deployment is "Active"
- [ ] Test from different device/network

**Fix:**
- [ ] Wait longer for CDN
- [ ] Redeploy if needed
- [ ] Check cache-control headers

---

### ❌ Issue: JavaScript Errors

**Checks:**
- [ ] Open browser console (F12)
- [ ] Note specific error messages
- [ ] Check file paths (404 errors)
- [ ] Verify CDN URLs (Chart.js, fonts)
- [ ] Test in different browser

**Fix:**
- [ ] Fix errors in code
- [ ] Redeploy: `.\smart-deploy.ps1`

---

### ❌ Issue: API Endpoints Not Working

**Checks:**
- [ ] Backend server running
- [ ] CORS configured correctly
- [ ] API base URL correct in config
- [ ] Authentication tokens valid
- [ ] Network requests in DevTools

**Fix:**
- [ ] Verify backend deployment
- [ ] Check API configuration
- [ ] Test endpoints directly (Postman)

---

## Success Criteria

### ✅ Deployment is successful when:
1. Maintenance page appeared during deployment
2. Maintenance page stayed active while making changes
3. Maintenance page disappeared automatically after deployment
4. Users now see updated site with all new features
5. No errors in browser console
6. Arena Control Center shows all green metrics
7. Response times normal (<200ms)
8. No 404 or 5xx errors
9. All functionality works as expected
10. Users didn't experience any downtime or errors

### ✅ All checks above marked complete: [ ]

---

## Documentation Reference

If you need more details, consult:

- **SMART-DEPLOY-GUIDE.md** - Complete deployment process
- **DEPLOY-QUICK-REF.md** - Quick reference
- **MAINTENANCE-FLOW-VISUAL.md** - Visual flow diagrams
- **MAINTENANCE-GUARANTEE.md** - How maintenance system works
- **ARENA-SYSTEM-OVERVIEW.md** - Complete system overview

---

## Deployment Log Template

Use this template to document your deployment:

```
# Deployment Log - [Date] [Time]

## Pre-Deployment:
- Changes: [Brief description]
- Files modified: [List files]
- Local testing: [✅ Passed / ❌ Issues]

## Deployment:
- Started: [Time]
- Maintenance deployed: [Time]
- Changes finalized: [Time]
- Updated site deployed: [Time]
- Completed: [Time]
- Total duration: [X minutes]

## Verification:
- Maintenance appeared: [✅ Yes / ❌ No]
- Maintenance disappeared: [✅ Yes / ❌ No]
- Site functional: [✅ Yes / ❌ No]
- No errors: [✅ Yes / ❌ No]

## Issues:
[List any issues encountered and how they were resolved]

## Notes:
[Any additional observations or notes]

## Status: [✅ SUCCESS / ⚠️ PARTIAL / ❌ FAILED]
```

---

## Quick Commands Reference

```powershell
# Deploy with maintenance
.\smart-deploy.ps1

# Deploy with custom message
.\smart-deploy.ps1 -Message "Adding Arena Control Center v2.0"

# Deploy without prompts
.\smart-deploy.ps1 -AutoConfirm

# Deploy without maintenance (direct)
.\smart-deploy.ps1 -SkipMaintenance

# Test maintenance locally
.\demo-maintenance.ps1

# Check Vercel status
vercel --version
vercel whoami
vercel ls

# Check maintenance flag
curl -I https://barodatek.com/maintenance.flag

# Manual deploy (if needed)
vercel --prod --yes

# Clear local maintenance flag
Remove-Item "maintenance.flag" -Force
```

---

## Emergency Rollback

If you need to rollback to previous deployment:

```powershell
# In Vercel Dashboard:
# 1. Go to your project
# 2. Find previous successful deployment
# 3. Click "..." menu → "Promote to Production"

# Or via CLI:
# 1. List recent deployments
vercel ls

# 2. Promote specific deployment (copy URL from list)
vercel promote <deployment-url>
```

---

## Final Sign-Off

After completing all checks:

```
Deployment Date: _______________
Deployed By: _______________
Version/Tag: _______________

All checklists complete: [ ]
No critical issues: [ ]
Monitoring active: [ ]
Team notified: [ ]

Deployment Status: ✅ SUCCESS

Signed: _______________
```

---

**Keep this checklist handy for every deployment!** 📋✅
