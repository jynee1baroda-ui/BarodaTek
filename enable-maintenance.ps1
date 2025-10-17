# 🎮 BarodaTek Arena - Maintenance Mode Toggle
# Enables maintenance mode by creating a flag file that triggers redirect

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    🎮 BARODATEK ARENA - MAINTENANCE MODE ACTIVATOR" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if maintenance.html exists
if (-not (Test-Path "maintenance.html")) {
    Write-Host "❌ ERROR: maintenance.html not found!" -ForegroundColor Red
    Write-Host "   Please ensure maintenance.html is in the project root." -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Activating maintenance mode..." -ForegroundColor Cyan
Write-Host ""

# Create maintenance flag JSON
$maintenanceFlag = @{
    enabled = $true
    message = "System upgrade in progress. We are adding new API endpoints and improving dev tools!"
    estimatedEnd = (Get-Date).AddHours(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    reason = "API endpoint updates and developer tools improvements"
} | ConvertTo-Json -Depth 10

$flagPath = "maintenance-flag.json"

try {
    $maintenanceFlag | Out-File -FilePath $flagPath -Encoding UTF8 -Force
    Write-Host "   ✅ Maintenance flag created: $flagPath" -ForegroundColor Green
    
    # Also copy to public folder for backwards compatibility
    Copy-Item -Path $flagPath -Destination "public\maintenance-flag.json" -Force -ErrorAction SilentlyContinue
} catch {
    Write-Host "   ❌ Failed to create flag: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "    ✅ MAINTENANCE MODE ACTIVATED SUCCESSFULLY" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📋 What will happen:" -ForegroundColor Cyan
Write-Host "   • Users visiting the site will see maintenance page" -ForegroundColor Gray
Write-Host "   • Maintenance check runs before page loads" -ForegroundColor Gray
Write-Host "   • Flag file: $flagPath" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Deploy to production: vercel --prod --yes" -ForegroundColor Yellow
Write-Host "   2. Make your changes and test them" -ForegroundColor Yellow
Write-Host "   3. After deployment completes, run: .\disable-maintenance.ps1" -ForegroundColor Yellow
Write-Host "   4. Deploy again to take site live" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Red
Write-Host "   Remember to disable maintenance mode when done!" -ForegroundColor Red
Write-Host "   Run: .\disable-maintenance.ps1" -ForegroundColor Red
Write-Host ""
