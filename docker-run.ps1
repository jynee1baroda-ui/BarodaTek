# API Mock Contract MVP - Docker Run Script
# This script builds and runs the application using Docker

Write-Host "🐳 API Mock Contract MVP - Docker Deployment" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Check if Docker is available
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is available: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if Dockerfile exists
if (-not (Test-Path "Dockerfile")) {
    Write-Host "❌ Dockerfile not found!" -ForegroundColor Red
    Write-Host "Please ensure Dockerfile exists in the project root" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "`n🏗️  Building Docker image..." -ForegroundColor Yellow
docker build -t api-mock-contract .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to build Docker image!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "`n🚀 Starting Docker container..." -ForegroundColor Yellow
Write-Host "Application will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the container" -ForegroundColor Yellow
Write-Host ""

# Run the container
docker run -p 3000:3000 --name api-mock-contract-instance api-mock-contract