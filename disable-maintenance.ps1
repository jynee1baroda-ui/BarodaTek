# 🎮 BarodaTek Arena - Maintenance Mode Toggle
# Disables maintenance mode by removing flag file

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🎮 BARODATEK ARENA - MAINTENANCE MODE DEACTIVATOR" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔄 Deactivating maintenance mode..." -ForegroundColor Cyan
Write-Host ""

# Remove maintenance flag files from both locations
$flagPaths = @("maintenance-flag.json", "public\maintenance-flag.json")
$removed = $false

foreach ($flagPath in $flagPaths) {
    if (Test-Path $flagPath) {
        try {
            Remove-Item -Path $flagPath -Force
            Write-Host "   ✅ Removed: $flagPath" -ForegroundColor Green
            $removed = $true
        } catch {
            Write-Host "   ⚠️  Could not remove: $flagPath" -ForegroundColor Yellow
        }
    }
}

if (-not $removed) {
    Write-Host "   ℹ️  No maintenance flags found (already disabled)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "                 ✅ MAINTENANCE MODE OFF                " -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Deploy: vercel --prod" -ForegroundColor White
Write-Host "   2. Test: barodatek.com" -ForegroundColor White
Write-Host ""
