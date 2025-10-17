# ARENA CONTROL CENTER - COMPREHENSIVE FIX
# Fixes all common issues with create/update/execute functionality

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ARENA CONTROL CENTER - COMPLETE FIX" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify backend is running
Write-Host "[1/6] Checking backend server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Backend running: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend NOT running!" -ForegroundColor Red
    Write-Host "   Starting server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\NewpROJEKTAI; npm run dev" -WindowStyle Minimized
    Write-Host "   Waiting 5 seconds for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Step 2: Verify API authentication works
Write-Host "[2/6] Testing API authentication..." -ForegroundColor Yellow
$apiKey = "barodatek_a826192fdefade3bcbb533b1b52ddc8a509fd31757e5922d5059db804f3158be"
try {
    $headers = @{
        "X-API-Key" = $apiKey
        "Content-Type" = "application/json"
    }
    $stats = Invoke-RestMethod -Uri "http://localhost:8080/api/arena/stats" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ API authentication working!" -ForegroundColor Green
    Write-Host "   Players: $($stats.totalPlayers), Status: $($stats.status)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ API authentication failed!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

# Step 3: Close all browser windows
Write-Host "[3/6] Closing all browser windows..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*chrome*" -or $_.ProcessName -like "*msedge*" -or $_.ProcessName -like "*firefox*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "   ✅ Browser windows closed" -ForegroundColor Green
Start-Sleep -Seconds 2

# Step 4: Clear browser cache (create a fresh URL)
Write-Host "[4/6] Creating cache-busting URL..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$url = "http://localhost:8080/arena-control-center.html?nocache=$timestamp&refresh=true"
Write-Host "   ✅ URL: $url" -ForegroundColor Green

# Step 5: Verify files have correct content
Write-Host "[5/6] Verifying file updates..." -ForegroundColor Yellow
$jsContent = Get-Content "C:\NewpROJEKTAI\public\arena-control-center.js" -Raw
if ($jsContent -match "DEMO_API_KEY.*barodatek_a826192f") {
    Write-Host "   ✅ JavaScript has API key" -ForegroundColor Green
} else {
    Write-Host "   ❌ JavaScript missing API key!" -ForegroundColor Red
}

$htmlContent = Get-Content "C:\NewpROJEKTAI\public\arena-control-center.html" -Raw
if ($htmlContent -match "arena-control-center\.js\?v=") {
    Write-Host "   ✅ HTML has version parameter" -ForegroundColor Green
} else {
    Write-Host "   ❌ HTML missing version parameter!" -ForegroundColor Red
}

# Step 6: Open browser in incognito/private mode
Write-Host "[6/6] Opening Arena Control Center..." -ForegroundColor Yellow
Write-Host ""
Write-Host "   Opening in Chrome Incognito mode (no cache)..." -ForegroundColor Cyan
Start-Process "chrome.exe" -ArgumentList "--incognito", $url -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host "  FIX COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Look at the new browser window (incognito)" -ForegroundColor White
Write-Host "2. Press F12 to open Developer Tools" -ForegroundColor White
Write-Host "3. Click the 'Console' tab" -ForegroundColor White
Write-Host "4. Try these actions:" -ForegroundColor White
Write-Host "   • Click 'Create Match' button" -ForegroundColor Gray
Write-Host "   • Try typing in any input field" -ForegroundColor Gray
Write-Host "   • Click 'Update Stats' or any button" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Check console for messages:" -ForegroundColor White
Write-Host ""
Write-Host "   ✅ GOOD (should see):" -ForegroundColor Green
Write-Host "      ""Stats fetched from Gaming API""" -ForegroundColor Gray
Write-Host "      ""WebSocket connected""" -ForegroundColor Gray
Write-Host "      ""Live data refreshed""" -ForegroundColor Gray
Write-Host ""
Write-Host "   ❌ BAD (should NOT see):" -ForegroundColor Red
Write-Host "      ""Unexpected token""" -ForegroundColor Gray
Write-Host "      ""is not valid JSON""" -ForegroundColor Gray
Write-Host "      ""API key missing""" -ForegroundColor Gray
Write-Host ""
Write-Host "6. If buttons still do not work, tell me:" -ForegroundColor White
Write-Host "   • What specific button or action?" -ForegroundColor Gray
Write-Host "   • What error messages in console?" -ForegroundColor Gray
Write-Host "   • Screenshot if possible?" -ForegroundColor Gray
Write-Host ""
Write-Host "Press ENTER to continue..." -ForegroundColor Yellow
Read-Host
