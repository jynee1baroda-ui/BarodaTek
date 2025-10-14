# API Mock Contract MVP - Setup Script
# This script helps you set up the development environment

Write-Host "🚀 API Mock Contract MVP - Setup Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Recommended: Download the LTS version" -ForegroundColor Yellow
    pause
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✅ npm is available: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not available!" -ForegroundColor Red
    Write-Host "npm should come with Node.js installation" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if Docker is available (optional)
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is available: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Docker is not available (optional for local development)" -ForegroundColor Yellow
    Write-Host "Install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
}

Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "`n🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Run: .\start.ps1 - to start the development server" -ForegroundColor White
Write-Host "2. Run: .\build.ps1 - to build for production" -ForegroundColor White
Write-Host "3. Run: .\docker-run.ps1 - to run with Docker" -ForegroundColor White

pause