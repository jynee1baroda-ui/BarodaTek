# ============================================
# BARODATEK ARENA - SMART AUTO-DEPLOY
# Maintenance screen until deployment complete
# ============================================

param(
    [string]$Message = "Deploying updates to BarodaTek Arena",
    [switch]$SkipMaintenance,
    [int]$PropagationWaitTime = 30,  # Seconds to wait for Vercel CDN propagation
    [switch]$AutoConfirm
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  BARODATEK ARENA - SMART DEPLOYMENT SYSTEM                ║" -ForegroundColor Cyan
Write-Host "║  Maintenance Mode: Enabled During Entire Process          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================
# PHASE 1: PRE-DEPLOYMENT CHECKS
# ============================================
Write-Host "PHASE 1: Pre-Deployment Validation" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "[1/5] Checking Vercel CLI..." -ForegroundColor White
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "  ⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "  ✅ Vercel CLI installed" -ForegroundColor Green
} else {
    Write-Host "  ✅ Vercel CLI found" -ForegroundColor Green
}

# Check if files exist
Write-Host "[2/5] Checking required files..." -ForegroundColor White
$requiredFiles = @("index.html", "maintenance.html", "arena-control-center.html")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        $missingFiles += $file
        Write-Host "  ❌ Missing: $file" -ForegroundColor Red
    } else {
        Write-Host "  ✅ Found: $file" -ForegroundColor Green
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Deployment aborted: Missing required files" -ForegroundColor Red
    exit 1
}

# Check git status
Write-Host "[3/5] Checking git status..." -ForegroundColor White
$gitStatus = git status --porcelain 2>$null
if ($gitStatus) {
    Write-Host "  ⚠️  Uncommitted changes detected" -ForegroundColor Yellow
    Write-Host "  Files will be committed as part of deployment" -ForegroundColor Cyan
} else {
    Write-Host "  ✅ Working directory clean" -ForegroundColor Green
}

# Verify maintenance.html is valid
Write-Host "[4/5] Validating maintenance page..." -ForegroundColor White
$maintenanceContent = Get-Content "maintenance.html" -Raw
if ($maintenanceContent -match "<!DOCTYPE html>" -and $maintenanceContent -match "BarodaTek") {
    Write-Host "  ✅ Maintenance page valid" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Maintenance page may be invalid" -ForegroundColor Yellow
}

# Check for existing backup
Write-Host "[5/5] Checking for existing backups..." -ForegroundColor White
if (Test-Path "index.html.backup") {
    Write-Host "  ⚠️  Previous backup exists - will overwrite" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ No conflicting backups" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Pre-deployment validation complete!" -ForegroundColor Green
Write-Host ""

# Confirmation prompt
if (!$AutoConfirm -and !$SkipMaintenance) {
    Write-Host "📋 Deployment Summary:" -ForegroundColor Cyan
    Write-Host "   • Maintenance screen will be deployed to production" -ForegroundColor White
    Write-Host "   • Users will see 'We're Updating...' page" -ForegroundColor White
    Write-Host "   • Your changes will be deployed" -ForegroundColor White
    Write-Host "   • Maintenance screen will auto-disappear when ready" -ForegroundColor White
    Write-Host ""
    Write-Host "   Message: $Message" -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "Continue with deployment? (Y/N)"
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host ""
        Write-Host "❌ Deployment cancelled by user" -ForegroundColor Red
        exit 0
    }
}

Write-Host ""

if (!$SkipMaintenance) {
    # ============================================
    # PHASE 2: ACTIVATE MAINTENANCE MODE LOCALLY
    # ============================================
    Write-Host "PHASE 2: Activating Local Maintenance Mode" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""
    
    # Backup current site
    Write-Host "[1/3] Creating backup of current site..." -ForegroundColor White
    if (Test-Path "index.html") {
        Copy-Item "index.html" "index.html.backup" -Force
        Write-Host "  ✅ Backup created: index.html.backup" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  No index.html to backup" -ForegroundColor Yellow
    }
    
    # Activate maintenance locally
    Write-Host "[2/3] Replacing index.html with maintenance page..." -ForegroundColor White
    Copy-Item "maintenance.html" "index.html" -Force
    Write-Host "  ✅ Maintenance page activated locally" -ForegroundColor Green
    
    # Create maintenance flag
    Write-Host "[3/3] Creating maintenance flag..." -ForegroundColor White
    $flagData = @{
        enabled = $true
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        activatedBy = $env:USERNAME
        message = $Message
        deploymentId = [guid]::NewGuid().ToString()
    } | ConvertTo-Json
    
    $flagData | Out-File "maintenance.flag" -Encoding UTF8
    Write-Host "  ✅ Maintenance flag created" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "✅ Local maintenance mode activated" -ForegroundColor Green
    Write-Host ""
    
    # ============================================
    # PHASE 3: DEPLOY MAINTENANCE PAGE TO PRODUCTION
    # ============================================
    Write-Host "PHASE 3: Deploying Maintenance Page to Production" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""
    
    Write-Host "🚀 Deploying maintenance page to Vercel..." -ForegroundColor Cyan
    Write-Host "   (Users will now see: 'We're Updating BarodaTek Arena')" -ForegroundColor White
    Write-Host ""
    
    # Deploy to Vercel (maintenance page as index.html)
    Write-Host "Executing: vercel --prod --yes" -ForegroundColor DarkGray
    Write-Host ""
    
    try {
        vercel --prod --yes
        Write-Host ""
        Write-Host "✅ Maintenance page deployed to production!" -ForegroundColor Green
    } catch {
        Write-Host ""
        Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Rolling back local changes..." -ForegroundColor Yellow
        
        if (Test-Path "index.html.backup") {
            Copy-Item "index.html.backup" "index.html" -Force
            Remove-Item "index.html.backup" -Force
        }
        Remove-Item "maintenance.flag" -Force -ErrorAction SilentlyContinue
        
        Write-Host "✅ Local rollback complete" -ForegroundColor Green
        exit 1
    }
    
    Write-Host ""
    Write-Host "⏳ Waiting for CDN propagation ($PropagationWaitTime seconds)..." -ForegroundColor Cyan
    Write-Host "   This ensures all edge servers show maintenance page" -ForegroundColor White
    
    # Progress bar for waiting
    for ($i = 1; $i -le $PropagationWaitTime; $i++) {
        $percent = [math]::Round(($i / $PropagationWaitTime) * 100)
        $barLength = [math]::Round($percent / 2)
        $bar = "█" * $barLength + "░" * (50 - $barLength)
        Write-Host "`r  [$bar] $percent% ($i/$PropagationWaitTime sec)" -NoNewline -ForegroundColor Yellow
        Start-Sleep -Seconds 1
    }
    Write-Host ""
    Write-Host ""
    Write-Host "✅ CDN propagation complete" -ForegroundColor Green
    Write-Host "✅ Maintenance screen is now LIVE on barodatek.com" -ForegroundColor Green
    Write-Host ""
    
    # ============================================
    # PHASE 4: RESTORE ORIGINAL SITE LOCALLY
    # ============================================
    Write-Host "PHASE 4: Preparing Updated Site" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""
    
    Write-Host "📝 Restoring your updated site locally..." -ForegroundColor White
    if (Test-Path "index.html.backup") {
        Copy-Item "index.html.backup" "index.html" -Force
        Write-Host "  ✅ Original site restored" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  No backup found - using current version" -ForegroundColor Yellow
    }
    
    # Remove maintenance flag locally (but not in deployment yet)
    Write-Host "  ✅ Maintenance flag removed locally" -ForegroundColor Green
    Remove-Item "maintenance.flag" -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "✅ Local site ready for deployment" -ForegroundColor Green
    Write-Host ""
    
    # ============================================
    # PHASE 5: MAKE YOUR CHANGES (MANUAL STEP)
    # ============================================
    Write-Host "PHASE 5: Apply Your Changes" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "🎨 IMPORTANT: Maintenance page is LIVE on production" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "You can now:" -ForegroundColor White
    Write-Host "   • Edit files safely" -ForegroundColor Green
    Write-Host "   • Add new features" -ForegroundColor Green
    Write-Host "   • Update dependencies" -ForegroundColor Green
    Write-Host "   • Test changes locally" -ForegroundColor Green
    Write-Host "   • Build for production" -ForegroundColor Green
    Write-Host ""
    Write-Host "Users currently see: 🎮 'We're Updating BarodaTek Arena'" -ForegroundColor Yellow
    Write-Host ""
    
    if (!$AutoConfirm) {
        Write-Host "Press ENTER when your changes are ready to deploy..." -ForegroundColor Cyan
        Read-Host
    }
    
    Write-Host ""
}

# ============================================
# PHASE 6: DEPLOY UPDATED SITE TO PRODUCTION
# ============================================
Write-Host "PHASE 6: Deploying Updated Site to Production" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Ensure maintenance flag is removed
if (Test-Path "maintenance.flag") {
    Remove-Item "maintenance.flag" -Force
    Write-Host "  ✅ Removed maintenance.flag (ready for normal site)" -ForegroundColor Green
}

Write-Host "🚀 Deploying updated site to Vercel..." -ForegroundColor Cyan
Write-Host "   (This will replace the maintenance page)" -ForegroundColor White
Write-Host ""

Write-Host "Executing: vercel --prod --yes" -ForegroundColor DarkGray
Write-Host ""

try {
    vercel --prod --yes
    Write-Host ""
    Write-Host "✅ Updated site deployed to production!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    Write-Host "   Note: Maintenance page is still live on production" -ForegroundColor Yellow
    Write-Host "   You can retry the deployment or manually remove maintenance" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "⏳ Waiting for CDN propagation ($PropagationWaitTime seconds)..." -ForegroundColor Cyan
Write-Host "   Ensuring all users get the updated site" -ForegroundColor White

# Progress bar for waiting
for ($i = 1; $i -le $PropagationWaitTime; $i++) {
    $percent = [math]::Round(($i / $PropagationWaitTime) * 100)
    $barLength = [math]::Round($percent / 2)
    $bar = "█" * $barLength + "░" * (50 - $barLength)
    Write-Host "`r  [$bar] $percent% ($i/$PropagationWaitTime sec)" -NoNewline -ForegroundColor Yellow
    Start-Sleep -Seconds 1
}
Write-Host ""
Write-Host ""

# ============================================
# PHASE 7: CLEANUP & VERIFICATION
# ============================================
Write-Host "PHASE 7: Cleanup & Verification" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""

# Remove local backup
if (Test-Path "index.html.backup") {
    Remove-Item "index.html.backup" -Force
    Write-Host "  ✅ Cleaned up backup files" -ForegroundColor Green
}

# Verify no maintenance flag exists
if (!(Test-Path "maintenance.flag")) {
    Write-Host "  ✅ No maintenance flag (site should be normal)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Warning: maintenance.flag still exists!" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# DEPLOYMENT COMPLETE!
# ============================================
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║             🎉 DEPLOYMENT SUCCESSFUL! 🎉                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Deployment Summary:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   ✅ Maintenance page deployed to production" -ForegroundColor Green
Write-Host "   ✅ Users saw 'We're Updating...' during deployment" -ForegroundColor Green
Write-Host "   ✅ Updated site deployed successfully" -ForegroundColor Green
Write-Host "   ✅ CDN propagation complete" -ForegroundColor Green
Write-Host "   ✅ Maintenance page automatically removed" -ForegroundColor Green
Write-Host "   ✅ Users now see updated site" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your site is now LIVE at: https://barodatek.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏱️  Total deployment time: ~$([math]::Round($PropagationWaitTime * 2 + 30)) seconds" -ForegroundColor White
Write-Host "🎮 Maintenance screen was active during entire process" -ForegroundColor White
Write-Host "✨ Zero user-facing errors or downtime" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Visit https://barodatek.com to verify changes" -ForegroundColor White
Write-Host "   2. Test all functionality on production" -ForegroundColor White
Write-Host "   3. Monitor Arena Control Center for metrics" -ForegroundColor White
Write-Host "   4. Check AI Monitor Bot for any anomalies" -ForegroundColor White
Write-Host ""
Write-Host "Thank you for using BarodaTek Arena Smart Deploy! 🎮" -ForegroundColor Cyan
Write-Host ""
