# BARODATEK ARENA - Status Check Script

Write-Host ""
Write-Host "========================================"  -ForegroundColor Red
Write-Host "  BARODATEK ARENA - Status Check"  -ForegroundColor White
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Check DNS
Write-Host "[1/3] Checking DNS Resolution..." -ForegroundColor Cyan
try {
    $dns = Resolve-DnsName barodatek.com -ErrorAction Stop
    Write-Host "  OK DNS Working: $($dns[0].IPAddress)" -ForegroundColor Green
}
catch {
    Write-Host "  X DNS Failed" -ForegroundColor Red
}

Write-Host ""

# Test Site Access
Write-Host "[2/3] Testing Site Access..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://barodatek.com" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor Yellow
    
    if ($response.Content -match "Authentication Required") {
        Write-Host "  X BLOCKED: Deployment Protection Active" -ForegroundColor Red
        Write-Host ""
        Write-Host "  FIX: Disable deployment protection in Vercel dashboard" -ForegroundColor Yellow
    }
    else {
        Write-Host "  OK Site is publicly accessible!" -ForegroundColor Green
    }
}
catch {
    Write-Host "  X Connection Failed" -ForegroundColor Red
}

Write-Host ""

# Check Arena Files
Write-Host "[3/3] Checking Arena Rebrand Files..." -ForegroundColor Cyan
if (Test-Path "arena_rebrand") {
    Write-Host "  OK Arena directory exists" -ForegroundColor Green
    if (Test-Path "arena_rebrand\index.html") {
        Write-Host "  OK Arena HTML demo ready" -ForegroundColor Green
    }
}
else {
    Write-Host "  X Arena rebrand directory not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  NEXT STEPS" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "1. Fix deployment protection at:" -ForegroundColor Yellow
Write-Host "   https://vercel.com/jynee1baroda-6483s-projects/barodatek-api-platform/settings/deployment-protection" -ForegroundColor White
Write-Host ""
Write-Host "2. Preview Arena theme:" -ForegroundColor Yellow
Write-Host "   cd arena_rebrand" -ForegroundColor White
Write-Host "   npx live-server ." -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
