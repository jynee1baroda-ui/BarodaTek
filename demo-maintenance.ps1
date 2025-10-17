# BARODATEK ARENA - MAINTENANCE MODE DEMO
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  MAINTENANCE MODE DEMO" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Backing up site..." -ForegroundColor Yellow
Copy-Item "index.html" "index.html.backup" -Force -ErrorAction SilentlyContinue
Write-Host "  Done" -ForegroundColor Green

Write-Host "[2/4] Activating maintenance..." -ForegroundColor Yellow
Copy-Item "maintenance.html" "index.html" -Force
@{enabled=$true; timestamp=(Get-Date).ToString("yyyy-MM-dd HH:mm:ss"); demo=$true} | ConvertTo-Json | Out-File "maintenance.flag" -Encoding UTF8
Write-Host "  Done" -ForegroundColor Green

Write-Host "[3/4] Starting server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Minimized
Start-Sleep -Seconds 3
Write-Host "  Done" -ForegroundColor Green

Write-Host "[4/4] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:8080"
Write-Host "  Done" -ForegroundColor Green

Write-Host ""
Write-Host "MAINTENANCE MODE ACTIVE!" -ForegroundColor Green
Write-Host "Press ENTER to restore normal site..." -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "Restoring..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Copy-Item "index.html.backup" "index.html" -Force -ErrorAction SilentlyContinue
Remove-Item "index.html.backup", "maintenance.flag" -Force -ErrorAction SilentlyContinue
Write-Host "Done! Site restored." -ForegroundColor Green
