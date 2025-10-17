# 🚀 BarodaTek Arena - Production Deployment Script
# Prepares and deploys to https://barodatek.com

Write-Host ""
Write-Host "🚀 BARODATEK ARENA - Production Deployment" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Backup current version
Write-Host "📦 Creating backup..." -ForegroundColor Yellow
$backupName = "barodatek_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$backupPath = "..\$backupName"

if (Test-Path $backupPath) {
    Remove-Item $backupPath -Recurse -Force
}

# Copy only essential files (exclude node_modules, etc.)
$excludeDirs = @('node_modules', '.git', '.vercel', 'arena_rebrand', 'public_OLD')
robocopy . $backupPath /E /XD $excludeDirs /XF *.log /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null

if ($LASTEXITCODE -lt 8) {
    Write-Host "✅ Backup created at: $backupPath" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backup may be incomplete" -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Run build preparation
Write-Host "🔧 Preparing deployment files..." -ForegroundColor Yellow
node scripts/prepare-deploy.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Deployment preparation failed!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Verify critical files
Write-Host "🔍 Final verification..." -ForegroundColor Yellow
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

# Step 4: Confirm deployment
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to deploy to: https://barodatek.com" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Deploy to production? (Y/N)"

if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host ""
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Step 5: Deploy
vercel --prod --yes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Your site is live at: https://barodatek.com" -ForegroundColor White
    Write-Host ""
    Write-Host "⏰ Note: CDN cache may take 30-60 seconds to update" -ForegroundColor Gray
    Write-Host "   Use Ctrl+Shift+R to hard refresh your browser" -ForegroundColor Gray
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Check the error messages above for details" -ForegroundColor Yellow
}

Write-Host ""
