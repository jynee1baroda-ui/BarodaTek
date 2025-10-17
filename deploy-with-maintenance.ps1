# 🚀 BarodaTek Arena - Full Deployment with Maintenance Mode
# Complete deployment workflow: Enable maintenance → Deploy updates → Disable maintenance

param(
    [switch]$SkipMaintenance = $false,
    [switch]$AutoConfirm = $false
)

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎮 BARODATEK ARENA - FULL DEPLOYMENT WORKFLOW" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Show deployment plan
Write-Host "📋 Deployment Plan:" -ForegroundColor Cyan
if (-not $SkipMaintenance) {
    Write-Host "   1. Enable maintenance mode (users see 'updating' screen)" -ForegroundColor Gray
    Write-Host "   2. Deploy maintenance page to production" -ForegroundColor Gray
    Write-Host "   3. Deploy updated site to production" -ForegroundColor Gray
    Write-Host "   4. Disable maintenance mode (restore normal site)" -ForegroundColor Gray
    Write-Host "   5. Deploy restored site to production" -ForegroundColor Gray
} else {
    Write-Host "   1. Deploy directly to production (no maintenance mode)" -ForegroundColor Gray
}
Write-Host ""

if (-not $AutoConfirm) {
    $proceed = Read-Host "Continue with deployment? (Y/N)"
    if ($proceed -ne 'Y' -and $proceed -ne 'y') {
        Write-Host ""
        Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
}

# ==========================================
# PHASE 1: Enable Maintenance Mode
# ==========================================
if (-not $SkipMaintenance) {
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  PHASE 1: ENABLE MAINTENANCE MODE" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host ""

    # Check if already in maintenance mode
    if (Test-Path "index.html.backup") {
        Write-Host "⚠️  WARNING: Maintenance mode already active!" -ForegroundColor Yellow
        Write-Host "   Skipping maintenance activation..." -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "🔧 Activating maintenance mode..." -ForegroundColor Cyan

        # Backup index.html
        try {
            Copy-Item "index.html" "index.html.backup" -Force
            Write-Host "   ✅ Backed up index.html" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to backup: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }

        # Replace with maintenance page
        try {
            Copy-Item "maintenance.html" "index.html" -Force
            Write-Host "   ✅ Activated maintenance page" -ForegroundColor Green
        } catch {
            Write-Host "   ❌ Failed to activate maintenance: $($_.Exception.Message)" -ForegroundColor Red
            Copy-Item "index.html.backup" "index.html" -Force
            Remove-Item "index.html.backup" -Force
            exit 1
        }

        Write-Host ""
        Write-Host "✅ Maintenance mode activated locally" -ForegroundColor Green
        Write-Host ""

        # Deploy maintenance page
        Write-Host "🚀 Deploying maintenance page to production..." -ForegroundColor Cyan
        Write-Host ""
        
        node scripts/prepare-deploy.js
        vercel --prod --yes

        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Maintenance page deployed to https://barodatek.com" -ForegroundColor Green
            Write-Host "   Users now see: 'System Update in Progress'" -ForegroundColor Gray
            Write-Host ""
            Write-Host "⏰ Waiting 10 seconds for CDN to update..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        } else {
            Write-Host ""
            Write-Host "❌ Failed to deploy maintenance page!" -ForegroundColor Red
            Write-Host "   Restoring local files..." -ForegroundColor Yellow
            Copy-Item "index.html.backup" "index.html" -Force
            Remove-Item "index.html.backup" -Force
            exit 1
        }
    }
}

# ==========================================
# PHASE 2: Deploy Main Updates
# ==========================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: RESTORE AND DEPLOY MAIN SITE" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

# Restore original index.html if we enabled maintenance
if (-not $SkipMaintenance -and (Test-Path "index.html.backup")) {
    Write-Host "🔄 Restoring original site..." -ForegroundColor Cyan
    
    try {
        Copy-Item "index.html.backup" "index.html" -Force
        Remove-Item "index.html.backup" -Force
        Write-Host "   ✅ Original site restored" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Failed to restore: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Create backup before deployment
Write-Host "📦 Creating backup..." -ForegroundColor Yellow
$backupName = "barodatek_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$backupPath = "..\$backupName"

$excludeDirs = @('node_modules', '.git', '.vercel', 'arena_rebrand')
robocopy . $backupPath /E /XD $excludeDirs /XF *.log /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

if ($LASTEXITCODE -lt 8) {
    Write-Host "✅ Backup: $backupPath" -ForegroundColor Green
}
Write-Host ""

# Run deployment preparation
Write-Host "🔧 Preparing deployment..." -ForegroundColor Yellow
node scripts/prepare-deploy.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment preparation failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verify critical files
Write-Host "🔍 Verifying files..." -ForegroundColor Yellow
$criticalFiles = @('index.html', 'barodatek-logo.png', 'profile.jpg', 'vercel.json', 'version.json')
$allFilesOk = $true

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        $size = [math]::Round((Get-Item $file).Length / 1KB, 1)
        Write-Host "  ✅ $file ($size KB)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file - MISSING!" -ForegroundColor Red
        $allFilesOk = $false
    }
}

if (-not $allFilesOk) {
    Write-Host ""
    Write-Host "❌ Deployment aborted - missing files!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Deploy main site
Write-Host "🚀 Deploying main site to production..." -ForegroundColor Cyan
Write-Host ""

vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✅ DEPLOYMENT COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your site is live at: https://barodatek.com" -ForegroundColor White
    Write-Host ""
    if (-not $SkipMaintenance) {
        Write-Host "✅ Maintenance mode was handled automatically:" -ForegroundColor Green
        Write-Host "   • Maintenance page deployed first" -ForegroundColor Gray
        Write-Host "   • Main site deployed second" -ForegroundColor Gray
        Write-Host "   • Users saw minimal downtime" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "⏰ CDN cache may take 30-60 seconds to update" -ForegroundColor Gray
    Write-Host "   Press Ctrl+Shift+R to hard refresh your browser" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
