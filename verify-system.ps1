# 🔍 Automated System Verification Script
# Checks all critical features and reports status

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🔍 BARODATEK SYSTEM VERIFICATION" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "================================================`n" -ForegroundColor Cyan

$errors = 0
$warnings = 0
$passed = 0

# 1️⃣ CHECK PORT AVAILABILITY
Write-Host "1️⃣ Checking Port 8080 Availability..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":8080"
if ($portCheck) {
    Write-Host "   ❌ Port 8080 is in use!" -ForegroundColor Red
    $errors++
    
    # Show what's using it
    $portCheck | ForEach-Object {
        $line = $_.Line
        if ($line -match "\s+(\d+)$") {
            $processId = $matches[1]
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "   Process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "   ✅ Port 8080 is available" -ForegroundColor Green
    $passed++
}

# 2️⃣ CHECK NODE PROCESSES
Write-Host "`n2️⃣ Checking for Running Node Processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ⚠️  $($nodeProcesses.Count) Node.js process(es) running" -ForegroundColor Yellow
    $warnings++
    $nodeProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.Id) | Memory: $([math]::Round($_.WorkingSet64/1MB, 2)) MB" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✅ No Node.js processes running" -ForegroundColor Green
    $passed++
}

# 3️⃣ CHECK GIT STATUS
Write-Host "`n3️⃣ Checking Git Repository Status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>&1
    if ($gitStatus) {
        Write-Host "   ⚠️  Uncommitted changes detected" -ForegroundColor Yellow
        $warnings++
        Write-Host "   Modified files:" -ForegroundColor Gray
        $gitStatus | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
    } else {
        Write-Host "   ✅ Repository is clean" -ForegroundColor Green
        $passed++
    }
    
    # Check current branch
    $branch = git branch --show-current
    Write-Host "   Current branch: $branch" -ForegroundColor Cyan
    
    # Check last commit
    $lastCommit = git log -1 --oneline
    Write-Host "   Last commit: $lastCommit" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Git repository check failed: $($_.Exception.Message)" -ForegroundColor Red
    $errors++
}

# 4️⃣ CHECK CRITICAL FILES
Write-Host "`n4️⃣ Checking Critical Files Exist..." -ForegroundColor Yellow
$criticalFiles = @(
    "server.js",
    "package.json",
    "public\index.html",
    "public\tutorial-manager.js",
    "public\dom-utils.js",
    "public\config.js",
    "public\enhanced-games.js",
    "public\enhanced-chatbot.js"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ $file NOT FOUND!" -ForegroundColor Red
        $errors++
    }
}

# 5️⃣ CHECK DEPENDENCIES
Write-Host "`n5️⃣ Checking Node Dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules folder exists" -ForegroundColor Green
    $passed++
    
    Write-Host "   Verifying critical packages:" -ForegroundColor Gray
    $criticalPackages = @("express", "cors", "helmet", "socket.io")
    foreach ($pkg in $criticalPackages) {
        if (Test-Path "node_modules\$pkg") {
            Write-Host "   ✅ $pkg" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $pkg MISSING!" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "   ❌ node_modules folder NOT FOUND! Run 'npm install'" -ForegroundColor Red
    $errors++
}

# 6️⃣ CHECK PRODUCTION DEPLOYMENT
Write-Host "`n6️⃣ Checking Production Deployment..." -ForegroundColor Yellow
try {
    $prodUrl = "https://barodatek-api-platform.vercel.app"
    $response = Invoke-WebRequest -Uri $prodUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Production URL accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   ❌ Production URL not accessible: $($_.Exception.Message)" -ForegroundColor Red
    $errors++
}

# 7️⃣ CHECK TUTORIAL MANAGER MODULE
Write-Host "`n7️⃣ Checking Tutorial Manager Implementation..." -ForegroundColor Yellow
if (Test-Path "public\tutorial-manager.js") {
    $content = Get-Content "public\tutorial-manager.js" -Raw
    
    # Check for key classes and methods
    if ($content -match "class TutorialManager") {
        Write-Host "   ✅ TutorialManager class" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ TutorialManager class NOT FOUND!" -ForegroundColor Red
        $errors++
    }
    
    if ($content -match "initializeTutorials") {
        Write-Host "   ✅ initializeTutorials method" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ initializeTutorials method NOT FOUND!" -ForegroundColor Red
        $errors++
    }
    
    if ($content -match "openPath") {
        Write-Host "   ✅ openPath method" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ openPath method NOT FOUND!" -ForegroundColor Red
        $errors++
    }
    
    if ($content -match "markComplete") {
        Write-Host "   ✅ markComplete method" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ markComplete method NOT FOUND!" -ForegroundColor Red
        $errors++
    }
    
    if ($content -match "localStorage") {
        Write-Host "   ✅ localStorage usage" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ❌ localStorage usage NOT FOUND!" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   ❌ tutorial-manager.js NOT FOUND!" -ForegroundColor Red
    $errors++
}

# 8️⃣ CHECK INDEX.HTML LEARN SECTION
Write-Host "`n8️⃣ Checking Learn Section in index.html..." -ForegroundColor Yellow
if (Test-Path "public\index.html") {
    $content = Get-Content "public\index.html" -Raw
    
    if ($content -match 'id="learn"') {
        Write-Host "   ✅ Learn section" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ⚠️  Learn section NOT FOUND" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($content -match "tutorial-manager\.js") {
        Write-Host "   ✅ Tutorial Manager script" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ⚠️  Tutorial Manager script NOT FOUND" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($content -match 'id="global-progress"') {
        Write-Host "   ✅ Global progress tracker" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ⚠️  Global progress tracker NOT FOUND" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($content -match "tutorialManager\.openPath") {
        Write-Host "   ✅ Path buttons implemented" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   ⚠️  Path buttons NOT FOUND" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   ❌ index.html NOT FOUND!" -ForegroundColor Red
    $errors++
}

# 9️⃣ CHECK MEMORY USAGE
Write-Host "`n9️⃣ Checking System Memory..." -ForegroundColor Yellow
$memory = Get-CimInstance Win32_OperatingSystem
$totalMem = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
$freeMem = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
$usedMem = $totalMem - $freeMem
$usedPercent = [math]::Round(($usedMem / $totalMem) * 100, 2)

Write-Host "   Total: $totalMem GB | Used: $usedMem GB ($usedPercent%25)" -ForegroundColor Cyan
if ($usedPercent -gt 90) {
    Write-Host "   ⚠️  Memory usage is HIGH!" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "   ✅ Memory usage is normal" -ForegroundColor Green
    $passed++
}

# 🔟 CHECK DISK SPACE
Write-Host "`n🔟 Checking Disk Space..." -ForegroundColor Yellow
$drive = Get-PSDrive C
$totalSpace = [math]::Round($drive.Used / 1GB + $drive.Free / 1GB, 2)
$usedSpace = [math]::Round($drive.Used / 1GB, 2)
$usedPercent = [math]::Round(($usedSpace / $totalSpace) * 100, 2)

Write-Host "   Total: $totalSpace GB | Used: $usedSpace GB ($usedPercent%25)" -ForegroundColor Cyan
if ($usedPercent -gt 90) {
    Write-Host "   ⚠️  Disk space is running low!" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "   ✅ Disk space is sufficient" -ForegroundColor Green
    $passed++
}

# SUMMARY
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "📊 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Passed:   $passed" -ForegroundColor Green
Write-Host "⚠️  Warnings: $warnings" -ForegroundColor Yellow
Write-Host "❌ Errors:   $errors" -ForegroundColor Red
Write-Host ""

# OVERALL STATUS
if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "🎉 ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host "System is ready for production use." -ForegroundColor Green
} elseif ($errors -eq 0) {
    Write-Host "✅ SYSTEM OPERATIONAL (with minor warnings)" -ForegroundColor Yellow
    Write-Host "Review warnings above for optimization opportunities." -ForegroundColor Yellow
} else {
    Write-Host "❌ SYSTEM ISSUES DETECTED" -ForegroundColor Red
    Write-Host "Please address the errors above before proceeding." -ForegroundColor Red
}

Write-Host ""

# QUICK FIX SUGGESTIONS
if ($errors -gt 0 -or $warnings -gt 0) {
    Write-Host "🔧 QUICK FIX SUGGESTIONS:" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
    
    if ($portCheck) {
        Write-Host "• Port 8080 in use: Run this to free it:" -ForegroundColor Yellow
        Write-Host "  Stop-Process -Name node -Force" -ForegroundColor Gray
    }
    
    if ($nodeProcesses) {
        Write-Host "• Node processes running: Kill them with:" -ForegroundColor Yellow
        Write-Host "  Stop-Process -Name node -Force" -ForegroundColor Gray
    }
    
    if ($gitStatus) {
        Write-Host "• Uncommitted changes: Commit them with:" -ForegroundColor Yellow
        Write-Host "  git add ." -ForegroundColor Gray
        Write-Host "  git commit -m 'Your commit message'" -ForegroundColor Gray
    }
    
    if (!(Test-Path "node_modules")) {
        Write-Host "• Missing dependencies: Install them with:" -ForegroundColor Yellow
        Write-Host "  npm install" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# NEXT STEPS
Write-Host "🚀 RECOMMENDED NEXT STEPS:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "1. Test Learn section: npm start" -ForegroundColor Gray
Write-Host "2. Open browser: http://localhost:8080/#learn" -ForegroundColor Gray
Write-Host "3. Test all 3 learning paths" -ForegroundColor Gray
Write-Host "4. Verify progress tracking works" -ForegroundColor Gray
Write-Host "5. Check external links open correctly" -ForegroundColor Gray
Write-Host "6. Begin Phase 2 Security Hardening" -ForegroundColor Gray
Write-Host ""

# EXIT CODE
if ($errors -gt 0) {
    exit 1
} else {
    exit 0
}
