# API Mock Contract MVP - Start Script
# This script starts the development server

Write-Host "🚀 Starting API Mock Contract MVP..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "❌ Dependencies not found! Please run setup.ps1 first" -ForegroundColor Red
    Write-Host "Run: .\setup.ps1" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "`n📋 Starting development server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "API Explorer: http://localhost:3000/api-explorer.html" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev