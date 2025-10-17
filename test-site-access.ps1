# BARODATEK - Quick Status Check After Hosts Fix

Write-Host ""
Write-Host "Testing barodatek.com access..." -ForegroundColor Cyan
Write-Host ""

# Check DNS
Write-Host "[1/3] DNS Resolution:" -ForegroundColor Yellow
$dns = Resolve-DnsName barodatek.com -ErrorAction SilentlyContinue
if ($dns) {
    $ip = $dns[0].IPAddress
    Write-Host "  Resolves to: $ip" -ForegroundColor White
    
    if ($ip -eq "127.0.0.1") {
        Write-Host "  X Still pointing to localhost!" -ForegroundColor Red
        Write-Host "  Action: Run fix-hosts-admin.ps1 as Administrator" -ForegroundColor Yellow
    }
    else {
        Write-Host "  OK Pointing to Vercel servers!" -ForegroundColor Green
    }
}

Write-Host ""

# Test HTTPS connection
Write-Host "[2/3] HTTPS Connection:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://barodatek.com" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  OK Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "  OK Content Length: $($response.Content.Length) bytes" -ForegroundColor Green
}
catch {
    Write-Host "  X Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test Vercel deployment URL
Write-Host "[3/3] Vercel Deployment:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://barodatek-api-platform-mzhgy7st8-jynee1baroda-6483s-projects.vercel.app" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "  OK Vercel deployment working!" -ForegroundColor Green
}
catch {
    Write-Host "  X Vercel deployment failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""
