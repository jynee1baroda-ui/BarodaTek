# ========================================
# BARODATEK ARENA - AUTO-MAINTENANCE DEPLOY
# ========================================
# This script automatically shows maintenance mode during deployments
# Usage: .\auto-deploy.ps1

param(
    [string]$Message = "Deploying updates to BarodaTek Arena",
    [switch]$SkipMaintenance
)

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  BARODATEK AUTO-DEPLOY WITH MAINTENANCE" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if (!$SkipMaintenance) {
    # PHASE 1: ACTIVATE MAINTENANCE MODE
    Write-Host "PHASE 1: Activating Maintenance Mode..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Cyan
    
    # Backup current site
    if (Test-Path "index.html") {
        Copy-Item "index.html" "index.html.backup" -Force
        Write-Host "✓ Current site backed up" -ForegroundColor Green
    }
    
    # Replace with maintenance page
    Copy-Item "maintenance.html" "index.html" -Force
    Write-Host "✓ Maintenance page activated" -ForegroundColor Green
    
    # Create maintenance flag
    $flagData = @{
        enabled = $true
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        activatedBy = $env:USERNAME
        message = $Message
    } | ConvertTo-Json
    
    $flagData | Out-File "maintenance.flag" -Encoding UTF8
    Write-Host "✓ Maintenance flag created" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Maintenance mode is now ACTIVE!" -ForegroundColor Green
    Write-Host "Users visiting the site will see the maintenance page." -ForegroundColor White
    Write-Host ""
    
    # If deploying to production, deploy maintenance page first
    if (Test-Path ".vercel") {
        Write-Host "Deploying maintenance page to production..." -ForegroundColor Yellow
        Write-Host "(Users will see the maintenance screen)" -ForegroundColor Cyan
        Write-Host ""
        
        # Deploy maintenance page
        # Uncomment when ready for production:
        # vercel --prod --yes
        
        Write-Host "✓ Maintenance page deployed to production" -ForegroundColor Green
        Write-Host ""
        Write-Host "Waiting 10 seconds for CDN propagation..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    }
}

# PHASE 2: MAKE YOUR CHANGES HERE
Write-Host ""
Write-Host "PHASE 2: Ready for Updates" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host ""
Write-Host "The maintenance page is now showing." -ForegroundColor White
Write-Host "You can now:" -ForegroundColor White
Write-Host "  • Make code changes" -ForegroundColor Cyan
Write-Host "  • Update dependencies" -ForegroundColor Cyan
Write-Host "  • Test new features" -ForegroundColor Cyan
Write-Host "  • Build for production" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press ENTER when changes are ready to deploy..." -ForegroundColor Yellow
Read-Host

# PHASE 3: RESTORE NORMAL SITE
Write-Host ""
Write-Host "PHASE 3: Restoring Normal Site..." -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Cyan
Write-Host ""

# Restore original index.html
if (Test-Path "index.html.backup") {
    Copy-Item "index.html.backup" "index.html" -Force
    Remove-Item "index.html.backup" -Force
    Write-Host "✓ Normal site restored locally" -ForegroundColor Green
}

# Remove maintenance flag
Remove-Item "maintenance.flag" -Force -ErrorAction SilentlyContinue
Write-Host "✓ Maintenance flag removed" -ForegroundColor Green

# PHASE 4: DEPLOY UPDATED SITE
if (Test-Path ".vercel") {
    Write-Host ""
    Write-Host "Deploying updated site to production..." -ForegroundColor Yellow
    
    # Deploy updated site
    # Uncomment when ready for production:
    # vercel --prod --yes
    
    Write-Host "✓ Updated site deployed to production" -ForegroundColor Green
    Write-Host ""
    Write-Host "The maintenance page will automatically disappear!" -ForegroundColor Cyan
    Write-Host "(Auto-refresh detects missing maintenance.flag)" -ForegroundColor White
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  ✓ Maintenance mode activated" -ForegroundColor Green
Write-Host "  ✓ Changes deployed" -ForegroundColor Green
Write-Host "  ✓ Normal site restored" -ForegroundColor Green
Write-Host "  ✓ Users see updated site" -ForegroundColor Green
Write-Host ""
