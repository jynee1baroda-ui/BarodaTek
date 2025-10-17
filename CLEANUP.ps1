# 🧹 BarodaTek.com - System Cleanup Script
# Cleans up processes, terminals, and optimizes for deployment

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║        🧹 BarodaTek.com Cleanup Script 🧹            ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║     Cleaning up processes and optimizing system       ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all Node.js processes
Write-Host "📋 Step 1: Stopping all Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    $count = ($nodeProcesses | Measure-Object).Count
    Write-Host "   Found $count Node.js process(es)" -ForegroundColor Gray
    
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
    
    Write-Host "✅ Stopped all Node.js processes" -ForegroundColor Green
} else {
    Write-Host "✅ No Node.js processes running" -ForegroundColor Green
}

Write-Host ""

# Step 2: Clean up log files
Write-Host "📋 Step 2: Cleaning up old log files..." -ForegroundColor Yellow

$logDir = Join-Path $PSScriptRoot "logs"
if (Test-Path $logDir) {
    $aiMonitorLogs = Join-Path $logDir "ai-monitor"
    
    if (Test-Path $aiMonitorLogs) {
        # Keep only today's log, delete old ones
        $today = Get-Date -Format "yyyy-MM-dd"
        $todayLog = Join-Path $aiMonitorLogs "$today.log"
        
        Get-ChildItem $aiMonitorLogs -Filter "*.log" | Where-Object {
            $_.FullName -ne $todayLog
        } | ForEach-Object {
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
            Write-Host "   Deleted: $($_.Name)" -ForegroundColor Gray
        }
    }
    
    Write-Host "✅ Cleaned up old log files" -ForegroundColor Green
} else {
    Write-Host "✅ No log directory found" -ForegroundColor Green
}

Write-Host ""

# Step 3: Clear node_modules cache (optional)
Write-Host "📋 Step 3: Would you like to clear node_modules? (y/N)" -ForegroundColor Yellow
$clearModules = Read-Host "   Enter choice"

if ($clearModules -eq 'y' -or $clearModules -eq 'Y') {
    Write-Host "   Removing node_modules..." -ForegroundColor Gray
    
    $nodeModules = Join-Path $PSScriptRoot "node_modules"
    if (Test-Path $nodeModules) {
        Remove-Item $nodeModules -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Removed node_modules (run npm install to reinstall)" -ForegroundColor Green
    } else {
        Write-Host "✅ No node_modules directory found" -ForegroundColor Green
    }
} else {
    Write-Host "⏭️  Skipped node_modules cleanup" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Clear npm cache
Write-Host "📋 Step 4: Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "✅ NPM cache cleared" -ForegroundColor Green

Write-Host ""

# Step 5: Check port usage
Write-Host "📋 Step 5: Checking port 8080..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":8080"

if ($portCheck) {
    Write-Host "⚠️  Port 8080 is in use:" -ForegroundColor Yellow
    $portCheck | ForEach-Object {
        Write-Host "   $_" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "   Kill process using port 8080? (y/N)" -ForegroundColor Yellow
    $killPort = Read-Host "   Enter choice"
    
    if ($killPort -eq 'y' -or $killPort -eq 'Y') {
        # Extract PID and kill
        $processId = ($portCheck[0] -split '\s+')[-1]
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Process killed" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Port 8080 is available" -ForegroundColor Green
}

Write-Host ""

# Step 6: Memory optimization
Write-Host "📋 Step 6: Memory optimization..." -ForegroundColor Yellow
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
Write-Host "✅ Garbage collection completed" -ForegroundColor Green

Write-Host ""

# Summary
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║              🎉 CLEANUP COMPLETE! 🎉                  ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "✨ Your system is now optimized!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run .\DEPLOY-NOW.ps1 to deploy to Vercel" -ForegroundColor White
Write-Host "   2. Or run npm start to test locally" -ForegroundColor White
Write-Host ""

Write-Host "System Status:" -ForegroundColor Yellow
Write-Host "   - Node processes: Stopped" -ForegroundColor White
Write-Host "   - Old logs: Cleaned" -ForegroundColor White
Write-Host "   - Memory: Optimized" -ForegroundColor White
Write-Host "   - Ready for: Deployment or testing" -ForegroundColor White
Write-Host ""

Write-Host "Created by JBaroda - Keeping things clean!" -ForegroundColor Cyan
Write-Host ""
