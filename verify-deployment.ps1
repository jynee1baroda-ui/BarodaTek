# 🎯 FINAL VERIFICATION SCRIPT
# Quick check before deployment

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🦙 BarodaTek.com - Final Deployment Verification" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$allChecks = @()

# Check 1: Required Files
Write-Host "📁 Checking Required Files..." -ForegroundColor Yellow
$requiredFiles = @(
    "server.js",
    "payment-handler.js",
    "package.json",
    "public\purchase.html",
    "public\admin.html",
    "public\pricing.html",
    "public\index.html"
)

$filesOk = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MISSING: $file" -ForegroundColor Red
        $filesOk = $false
    }
}

if ($filesOk) {
    Write-Host "✅ All required files present" -ForegroundColor Green
    $allChecks += "Files: PASS"
} else {
    Write-Host "❌ Missing files detected!" -ForegroundColor Red
    $allChecks += "Files: FAIL"
}

Write-Host ""

# Check 2: Dependencies
Write-Host "📦 Checking Dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$requiredDeps = @("express", "nodemailer", "ws", "cors", "helmet")

$depsOk = $true
foreach ($dep in $requiredDeps) {
    if ($packageJson.dependencies.$dep) {
        Write-Host "   ✅ $dep installed" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MISSING: $dep" -ForegroundColor Red
        $depsOk = $false
    }
}

if ($depsOk) {
    Write-Host "✅ All dependencies present" -ForegroundColor Green
    $allChecks += "Dependencies: PASS"
} else {
    Write-Host "❌ Missing dependencies! Run: npm install" -ForegroundColor Red
    $allChecks += "Dependencies: FAIL"
}

Write-Host ""

# Check 3: Contact Information
Write-Host "📧 Verifying Contact Information..." -ForegroundColor Yellow
$businessEmail = "barodatek.services@gmail.com"
$cashAppTag = "`$baroda98"

# Check server.js
$serverContent = Get-Content "payment-handler.js" -Raw
if ($serverContent -match $businessEmail) {
    Write-Host "   ✅ Business email in payment-handler.js" -ForegroundColor Green
} else {
    Write-Host "   ❌ Business email NOT in payment-handler.js" -ForegroundColor Red
}

if ($serverContent -match "\`$baroda98") {
    Write-Host "   ✅ Cash App ($cashAppTag) in payment-handler.js" -ForegroundColor Green
} else {
    Write-Host "   ❌ Cash App ($cashAppTag) NOT in payment-handler.js" -ForegroundColor Red
}

# Check purchase.html
$purchaseContent = Get-Content "public\purchase.html" -Raw
if ($purchaseContent -match $businessEmail -and $purchaseContent -match "\`$baroda98") {
    Write-Host "   ✅ Contact info ($businessEmail, $cashAppTag) in purchase.html" -ForegroundColor Green
    $allChecks += "Contact Info: PASS"
} else {
    Write-Host "   ❌ Contact info MISSING in purchase.html" -ForegroundColor Red
    $allChecks += "Contact Info: FAIL"
}

Write-Host ""

# Check 4: API Endpoints
Write-Host "🔌 Verifying API Endpoints..." -ForegroundColor Yellow
$serverJs = Get-Content "server.js" -Raw

$endpoints = @(
    "/api/orders",
    "/api/orders/:orderId/verify",
    "/api/access/:accessToken",
    "/api/catalog/services",
    "/api/catalog/products",
    "/api/admin/orders"
)

$endpointsOk = $true
foreach ($endpoint in $endpoints) {
    $pattern = $endpoint -replace ":", ""
    if ($serverJs -match [regex]::Escape($pattern)) {
        Write-Host "   ✅ $endpoint" -ForegroundColor Green
    } else {
        Write-Host "   ❌ MISSING: $endpoint" -ForegroundColor Red
        $endpointsOk = $false
    }
}

if ($endpointsOk) {
    Write-Host "✅ All API endpoints configured" -ForegroundColor Green
    $allChecks += "API Endpoints: PASS"
} else {
    Write-Host "❌ Missing API endpoints!" -ForegroundColor Red
    $allChecks += "API Endpoints: FAIL"
}

Write-Host ""

# Check 5: Environment Variables
Write-Host "🔐 Checking Environment Configuration..." -ForegroundColor Yellow
$envVarsNeeded = @{
    "EMAIL_PASSWORD" = "Gmail App Password (required for email)"
    "BUSINESS_EMAIL" = "Business email defaults to barodatek.services@gmail.com"
    "ADMIN_KEY" = "Admin password defaults to barodatek-admin-2024"
}

$envWarnings = @()
foreach ($var in $envVarsNeeded.Keys) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        Write-Host "   ✅ $var is set" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $var not set - $($envVarsNeeded[$var])" -ForegroundColor Yellow
        $envWarnings += $var
    }
}

if ($envWarnings.Count -eq 0) {
    Write-Host "✅ All environment variables configured" -ForegroundColor Green
    $allChecks += "Environment: PASS"
} else {
    Write-Host "⚠️  $($envWarnings.Count) environment variables not set (see DEPLOYMENT-COMPLETE-GUIDE.md)" -ForegroundColor Yellow
    $allChecks += "Environment: WARNING"
}

Write-Host ""

# Check 6: Port Availability
Write-Host "🌐 Checking Port Availability..." -ForegroundColor Yellow
$port = 8080
$portInUse = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "   ⚠️  Port $port is already in use (server might be running)" -ForegroundColor Yellow
    $allChecks += "Port: IN_USE"
} else {
    Write-Host "   ✅ Port $port is available" -ForegroundColor Green
    $allChecks += "Port: AVAILABLE"
}

Write-Host ""

# Check 7: Git Status
Write-Host "📝 Checking Git Status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>&1
    if ($gitStatus) {
        $changes = ($gitStatus | Measure-Object).Count
        Write-Host "   ⚠️  $changes uncommitted changes" -ForegroundColor Yellow
        $allChecks += "Git: UNCOMMITTED"
    } else {
        Write-Host "   ✅ No uncommitted changes" -ForegroundColor Green
        $allChecks += "Git: CLEAN"
    }
} catch {
    Write-Host "   ℹ️  Not a git repository or git not installed" -ForegroundColor Cyan
    $allChecks += "Git: N/A"
}

Write-Host ""

# Final Summary
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   📊 VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

foreach ($check in $allChecks) {
    if ($check -like "*PASS*") {
        Write-Host "✅ $check" -ForegroundColor Green
    } elseif ($check -like "*FAIL*") {
        Write-Host "❌ $check" -ForegroundColor Red
    } elseif ($check -like "*WARNING*" -or $check -like "*UNCOMMITTED*" -or $check -like "*IN_USE*") {
        Write-Host "⚠️  $check" -ForegroundColor Yellow
    } else {
        Write-Host "ℹ️  $check" -ForegroundColor Cyan
    }
}

Write-Host ""

$failCount = ($allChecks | Where-Object { $_ -like "*FAIL*" }).Count
$warnCount = ($allChecks | Where-Object { $_ -like "*WARNING*" -or $_ -like "*UNCOMMITTED*" }).Count

if ($failCount -eq 0 -and $warnCount -eq 0) {
    Write-Host "🎉 PERFECT! All checks passed. Ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Set EMAIL_PASSWORD: `$env:EMAIL_PASSWORD='your_gmail_app_password'" -ForegroundColor White
    Write-Host "2. Test locally: npm start" -ForegroundColor White
    Write-Host "3. Run tests: .\test-payment-system.ps1" -ForegroundColor White
    Write-Host "4. Deploy: vercel --prod" -ForegroundColor White
} elseif ($failCount -eq 0) {
    Write-Host "⚠️  System is functional but has warnings. Review above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can proceed with deployment, but:" -ForegroundColor Cyan
    Write-Host "- Email notifications require EMAIL_PASSWORD variable" -ForegroundColor Yellow
    Write-Host "- Consider committing changes to git" -ForegroundColor Yellow
} else {
    Write-Host "❌ CRITICAL ISSUES DETECTED! Fix before deployment!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Fix the failed checks above before proceeding." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "   • DEPLOYMENT-COMPLETE-GUIDE.md - Full deployment guide" -ForegroundColor White
Write-Host "   • test-payment-system.ps1 - Run comprehensive tests" -ForegroundColor White
Write-Host "   • Purchase page: /purchase.html" -ForegroundColor White
Write-Host "   • Admin dashboard: /admin.html" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
