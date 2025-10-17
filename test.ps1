# API Mock Contract MVP - Test Script
# This script runs tests and validates the API

Write-Host "🧪 API Mock Contract MVP - Test Suite" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check if server is running
Write-Host "`n📋 Testing API endpoints..." -ForegroundColor Yellow

try {
    # Test health endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET
    if ($response.success) {
        Write-Host "✅ Health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Health check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Cannot connect to API - is the server running?" -ForegroundColor Red
    Write-Host "Start the server with: .\start.ps1" -ForegroundColor Yellow
    pause
    exit 1
}

try {
    # Test contracts endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/contracts" -Method GET
    if ($response.success) {
        Write-Host "✅ Contracts endpoint working - Found $($response.count) contracts" -ForegroundColor Green
    } else {
        Write-Host "❌ Contracts endpoint failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Contracts endpoint test failed" -ForegroundColor Red
}

try {
    # Test stats endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/stats" -Method GET
    if ($response.success) {
        Write-Host "✅ Statistics endpoint working" -ForegroundColor Green
        Write-Host "   Total Contracts: $($response.data.totalContracts)" -ForegroundColor White
        Write-Host "   Active Contracts: $($response.data.activeContracts)" -ForegroundColor White
        Write-Host "   Total Value: `$$($response.data.totalValue)" -ForegroundColor White
    } else {
        Write-Host "❌ Statistics endpoint failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Statistics endpoint test failed" -ForegroundColor Red
}

Write-Host "`n🎉 API testing completed!" -ForegroundColor Green
Write-Host "`n🌐 Web interface: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔗 API documentation: http://localhost:8080/#api" -ForegroundColor Cyan

# Optional: Run matchmaking tests via orchestrator
Write-Host "`nWould you like to run the matchmaking test workflow now? (y/n)" -ForegroundColor Yellow
$key = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
if ($key.Character -eq 'y' -or $key.Character -eq 'Y') {
    Write-Host "`nStarting matchmaking test workflow..." -ForegroundColor Cyan
    try {
        & powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'run-matchmaking-tests.ps1')
    } catch {
        Write-Host "Matchmaking workflow failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

pause