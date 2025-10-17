# 🚀 BarodaTek.com - One-Click Deployment Script
# Deploys your site to Vercel and links to BarodaTek.com domain

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║        🚀 BarodaTek.com Deployment Script 🚀          ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "║     Deploying your site to production with            ║" -ForegroundColor Cyan
Write-Host "║     custom domain: BarodaTek.com                      ║" -ForegroundColor Cyan
Write-Host "║                                                        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Vercel CLI is installed
Write-Host "📋 Step 1: Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found!" -ForegroundColor Red
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        Write-Host "💡 Please install manually: npm install -g vercel" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Vercel CLI installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI found!" -ForegroundColor Green
}

Write-Host ""

# Step 2: Check if logged in to Vercel
Write-Host "📋 Step 2: Checking Vercel authentication..." -ForegroundColor Yellow
$vercelWhoami = vercel whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel" -ForegroundColor Red
    Write-Host "🔐 Please login to Vercel..." -ForegroundColor Yellow
    vercel login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Vercel login failed" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Authenticated with Vercel!" -ForegroundColor Green
Write-Host ""

# Step 3: Install dependencies
Write-Host "📋 Step 3: Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Step 4: Run tests (if available)
Write-Host "📋 Step 4: Running pre-deployment checks..." -ForegroundColor Yellow

# Check if critical files exist
$criticalFiles = @(
    "server.js",
    "package.json",
    "vercel.json",
    "public\index.html",
    "public\app.js"
)

$allFilesExist = $true
foreach ($file in $criticalFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file MISSING!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "❌ Critical files missing! Cannot deploy." -ForegroundColor Red
    exit 1
}

Write-Host "✅ All critical files present!" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy to Vercel
Write-Host "📋 Step 5: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "🚀 This will deploy to production with domain: BarodaTek.com" -ForegroundColor Cyan
Write-Host ""

# Deploy with production flag
vercel --prod --yes

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "💡 Check the error messages above for details" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""

# Step 6: Instructions for domain setup
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "║              🎉 DEPLOYMENT COMPLETE! 🎉               ║" -ForegroundColor Green
Write-Host "║                                                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 NEXT STEPS to link BarodaTek.com domain:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Go to Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "    https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "2️⃣  Click on your project (barodatek-api-mock-contract-mvp)" -ForegroundColor Yellow
Write-Host ""
Write-Host "3️⃣  Go to: Settings → Domains" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  Click 'Add Domain' and enter:" -ForegroundColor Yellow
Write-Host "    • barodatek.com" -ForegroundColor White
Write-Host "    • www.barodatek.com" -ForegroundColor White
Write-Host ""
Write-Host "5️⃣  Configure DNS (Choose ONE method):" -ForegroundColor Yellow
Write-Host ""
Write-Host "    METHOD A - Vercel Nameservers (Easiest):" -ForegroundColor Cyan
Write-Host "    • Copy nameservers from Vercel:" -ForegroundColor White
Write-Host "      ns1.vercel-dns.com" -ForegroundColor Gray
Write-Host "      ns2.vercel-dns.com" -ForegroundColor Gray
Write-Host "      ns3.vercel-dns.com" -ForegroundColor Gray
Write-Host "    • Update at your domain registrar" -ForegroundColor White
Write-Host ""
Write-Host "    METHOD B - DNS Records (If keeping current NS):" -ForegroundColor Cyan
Write-Host "    • Add A Record:" -ForegroundColor White
Write-Host "      Name: @ (root)" -ForegroundColor Gray
Write-Host "      Value: 76.76.21.21" -ForegroundColor Gray
Write-Host "    • Add CNAME Record:" -ForegroundColor White
Write-Host "      Name: www" -ForegroundColor Gray
Write-Host "      Value: cname.vercel-dns.com" -ForegroundColor Gray
Write-Host ""
Write-Host "6️⃣  Wait 10-30 minutes for DNS propagation" -ForegroundColor Yellow
Write-Host ""
Write-Host "7️⃣  SSL certificate will auto-activate!" -ForegroundColor Yellow
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                                                        ║" -ForegroundColor Magenta
Write-Host "║     Your site will be live at:                        ║" -ForegroundColor Magenta
Write-Host "║                                                        ║" -ForegroundColor Magenta
Write-Host "║     🌐 https://BarodaTek.com                          ║" -ForegroundColor Magenta
Write-Host "║     🌐 https://www.BarodaTek.com                      ║" -ForegroundColor Magenta
Write-Host "║                                                        ║" -ForegroundColor Magenta
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

Write-Host "📖 For detailed instructions, see:" -ForegroundColor Cyan
Write-Host "   DOMAIN-SETUP-GUIDE.md" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Congratulations! Your deployment is complete!" -ForegroundColor Green
Write-Host "💡 Once DNS propagates, BarodaTek.com will be LIVE!" -ForegroundColor Green
Write-Host ""

# Open Vercel dashboard
Write-Host "🌐 Opening Vercel Dashboard..." -ForegroundColor Yellow
Start-Process "https://vercel.com/dashboard"

Write-Host ""
Write-Host "✨ Created by JBaroda - From listener to deployer! 🚀" -ForegroundColor Cyan
Write-Host ""
