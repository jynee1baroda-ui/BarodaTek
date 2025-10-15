# BARODATEK System Verification Script
# Checks all critical features and reports status

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " BARODATEK SYSTEM VERIFICATION" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0
$passed = 0

# 1. CHECK PORT AVAILABILITY
Write-Host "1. Checking Port 8080 Availability..." -ForegroundColor Yellow
$portCheck = netstat -ano | Select-String ":8080"
if ($portCheck) {
    Write-Host "   [FAIL] Port 8080 is in use!" -ForegroundColor Red
    $errors++
} else {
    Write-Host "   [PASS] Port 8080 is available" -ForegroundColor Green
    $passed++
}

# 2. CHECK NODE PROCESSES
Write-Host ""
Write-Host "2. Checking for Running Node Processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   [WARN] $($nodeProcesses.Count) Node.js process(es) running" -ForegroundColor Yellow
    $warnings++
} else {
    Write-Host "   [PASS] No Node.js processes running" -ForegroundColor Green
    $passed++
}

# 3. CHECK GIT STATUS
Write-Host ""
Write-Host "3. Checking Git Repository Status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>&1
    if ($gitStatus) {
        Write-Host "   [WARN] Uncommitted changes detected" -ForegroundColor Yellow
        $warnings++
    } else {
        Write-Host "   [PASS] Repository is clean" -ForegroundColor Green
        $passed++
    }
    
    $branch = git branch --show-current
    Write-Host "   Branch: $branch" -ForegroundColor Cyan
    
    $lastCommit = git log -1 --oneline
    Write-Host "   Last commit: $lastCommit" -ForegroundColor Cyan
} catch {
    Write-Host "   [FAIL] Git check failed: $($_.Exception.Message)" -ForegroundColor Red
    $errors++
}

# 4. CHECK CRITICAL FILES
Write-Host ""
Write-Host "4. Checking Critical Files..." -ForegroundColor Yellow
$criticalFiles = @(
    "server.js",
    "package.json",
    "public\index.html",
    "public\tutorial-manager.js",
    "public\dom-utils.js",
    "public\config.js"
)

foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "   [PASS] $file" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   [FAIL] $file NOT FOUND!" -ForegroundColor Red
        $errors++
    }
}

# 5. CHECK DEPENDENCIES
Write-Host ""
Write-Host "5. Checking Node Dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   [PASS] node_modules folder exists" -ForegroundColor Green
    $passed++
    
    $criticalPackages = @("express", "cors", "helmet", "socket.io")
    foreach ($pkg in $criticalPackages) {
        if (Test-Path "node_modules\$pkg") {
            Write-Host "   [PASS] $pkg" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "   [FAIL] $pkg MISSING!" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "   [FAIL] node_modules NOT FOUND! Run 'npm install'" -ForegroundColor Red
    $errors++
}

# 6. CHECK PRODUCTION DEPLOYMENT
Write-Host ""
Write-Host "6. Checking Production Deployment..." -ForegroundColor Yellow
try {
    $prodUrl = "https://barodatek-api-platform.vercel.app"
    $response = Invoke-WebRequest -Uri $prodUrl -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   [PASS] Production URL accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    $passed++
} catch {
    Write-Host "   [FAIL] Production URL not accessible" -ForegroundColor Red
    $errors++
}

# 7. CHECK TUTORIAL MANAGER
Write-Host ""
Write-Host "7. Checking Tutorial Manager..." -ForegroundColor Yellow
if (Test-Path "public\tutorial-manager.js") {
    $content = Get-Content "public\tutorial-manager.js" -Raw
    
    if ($content -match "class TutorialManager") {
        Write-Host "   [PASS] TutorialManager class" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   [FAIL] TutorialManager class NOT FOUND!" -ForegroundColor Red
        $errors++
    }
    
    if ($content -match "localStorage") {
        Write-Host "   [PASS] localStorage usage" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   [FAIL] localStorage NOT FOUND!" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "   [FAIL] tutorial-manager.js NOT FOUND!" -ForegroundColor Red
    $errors++
}

# 8. CHECK LEARN SECTION
Write-Host ""
Write-Host "8. Checking Learn Section..." -ForegroundColor Yellow
if (Test-Path "public\index.html") {
    $content = Get-Content "public\index.html" -Raw
    
    if ($content -match 'id="learn"') {
        Write-Host "   [PASS] Learn section" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   [WARN] Learn section NOT FOUND" -ForegroundColor Yellow
        $warnings++
    }
    
    if ($content -match "tutorial-manager") {
        Write-Host "   [PASS] Tutorial Manager integrated" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "   [WARN] Tutorial Manager NOT integrated" -ForegroundColor Yellow
        $warnings++
    }
} else {
    Write-Host "   [FAIL] index.html NOT FOUND!" -ForegroundColor Red
    $errors++
}

# SUMMARY
Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "[PASS] Passed:   $passed" -ForegroundColor Green
Write-Host "[WARN] Warnings: $warnings" -ForegroundColor Yellow
Write-Host "[FAIL] Errors:   $errors" -ForegroundColor Red
Write-Host ""

# OVERALL STATUS
if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "System is ready for production use." -ForegroundColor Green
} elseif ($errors -eq 0) {
    Write-Host "SYSTEM OPERATIONAL (with minor warnings)" -ForegroundColor Yellow -BackgroundColor Black
    Write-Host "Review warnings above for optimization." -ForegroundColor Yellow
} else {
    Write-Host "SYSTEM ISSUES DETECTED" -ForegroundColor Red -BackgroundColor Black
    Write-Host "Please address the errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " RECOMMENDED NEXT STEPS" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
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
