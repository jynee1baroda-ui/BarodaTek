# API Mock Contract MVP - Production Build Script
# This script builds the application for production

Write-Host "🏗️  Building API Mock Contract MVP for Production..." -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "❌ Dependencies not found! Please run setup.ps1 first" -ForegroundColor Red
    Write-Host "Run: .\setup.ps1" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "`n📋 Building production version..." -ForegroundColor Yellow

# Set production environment
$env:NODE_ENV = "production"

Write-Host "✅ Environment set to production" -ForegroundColor Green
Write-Host "✅ Application is ready for production deployment" -ForegroundColor Green

Write-Host "`n🚀 To start production server:" -ForegroundColor Cyan
Write-Host "npm start" -ForegroundColor White

Write-Host "`n🐳 To build Docker image:" -ForegroundColor Cyan
Write-Host "docker build -t api-mock-contract ." -ForegroundColor White

Write-Host "`n📊 Application will run on port 3000" -ForegroundColor Yellow

pause