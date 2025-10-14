# 🚀 BarodaTek.com - Quick Deployment Script
# Run this to deploy your site to Vercel with BarodaTek.com domain

Write-Host "🚀 BarodaTek.com Deployment Script" -ForegroundColor Cyan
Write-Host "===================================`n" -ForegroundColor Cyan

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI installed successfully!`n" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Vercel CLI. Please run: npm install -g vercel" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Vercel CLI found!`n" -ForegroundColor Green
}

# Check if logged in
Write-Host "Checking Vercel authentication..." -ForegroundColor Yellow
vercel whoami 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Vercel" -ForegroundColor Red
    Write-Host "Please run: vercel login`n" -ForegroundColor Yellow
    
    $login = Read-Host "Do you want to login now? (Y/N)"
    if ($login -eq "Y" -or $login -eq "y") {
        vercel login
    } else {
        Write-Host "❌ Deployment cancelled. Please login first." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Authenticated with Vercel!`n" -ForegroundColor Green

# Show deployment options
Write-Host "🎯 Deployment Options:" -ForegroundColor Cyan
Write-Host "1. Preview Deployment (test before going live)" -ForegroundColor White
Write-Host "2. Production Deployment (deploy to BarodaTek.com)" -ForegroundColor White
Write-Host "3. View Current Deployments" -ForegroundColor White
Write-Host "4. Setup Custom Domain" -ForegroundColor White
Write-Host "5. Exit`n" -ForegroundColor White

$choice = Read-Host "Select option (1-5)"

switch ($choice) {
    "1" {
        Write-Host "`n🧪 Starting Preview Deployment..." -ForegroundColor Yellow
        vercel
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Preview deployment successful!" -ForegroundColor Green
            Write-Host "🌐 Your preview site is ready. Check the URL above." -ForegroundColor Cyan
        } else {
            Write-Host "`n❌ Preview deployment failed!" -ForegroundColor Red
        }
    }
    
    "2" {
        Write-Host "`n🚀 Starting Production Deployment to BarodaTek.com..." -ForegroundColor Yellow
        Write-Host "⚠️  This will deploy to production! Continue? (Y/N)" -ForegroundColor Red
        
        $confirm = Read-Host
        if ($confirm -eq "Y" -or $confirm -eq "y") {
            vercel --prod
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n✅ Production deployment successful!" -ForegroundColor Green
                Write-Host "🌐 Your site is live at: https://barodatek.com" -ForegroundColor Cyan
                Write-Host "`n🔐 Admin Access (ONLY YOU can see this):" -ForegroundColor Magenta
                Write-Host "   Method 1: Press Ctrl + Shift + B + T + K" -ForegroundColor White
                Write-Host "   Method 2: Click footer 5 times quickly" -ForegroundColor White
                Write-Host "   Method 3: Console → barodatekAdmin('barodatek-admin-2025')" -ForegroundColor White
                Write-Host "`n💚 Payment: Cash App $baroda98" -ForegroundColor Green
            } else {
                Write-Host "`n❌ Production deployment failed!" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Deployment cancelled." -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host "`n📋 Current Deployments:" -ForegroundColor Yellow
        vercel ls
    }
    
    "4" {
        Write-Host "`n🌐 Custom Domain Setup" -ForegroundColor Cyan
        Write-Host "Current configuration in vercel.json:" -ForegroundColor White
        Write-Host "  - barodatek.com" -ForegroundColor Green
        Write-Host "  - www.barodatek.com`n" -ForegroundColor Green
        
        Write-Host "To add the domain, you need to:" -ForegroundColor Yellow
        Write-Host "1. Own the domain BarodaTek.com" -ForegroundColor White
        Write-Host "2. Add DNS records in your domain registrar:" -ForegroundColor White
        Write-Host "   Type: A, Name: @, Value: 76.76.21.21" -ForegroundColor Cyan
        Write-Host "   Type: CNAME, Name: www, Value: cname.vercel-dns.com`n" -ForegroundColor Cyan
        
        Write-Host "Do you want to add the domain now? (Y/N)" -ForegroundColor Yellow
        $addDomain = Read-Host
        
        if ($addDomain -eq "Y" -or $addDomain -eq "y") {
            vercel domains add barodatek.com
            vercel domains add www.barodatek.com
        }
    }
    
    "5" {
        Write-Host "`n👋 Goodbye!" -ForegroundColor Cyan
        exit 0
    }
    
    default {
        Write-Host "`n❌ Invalid option!" -ForegroundColor Red
    }
}

Write-Host "`n📚 For detailed instructions, see: VERCEL-DEPLOYMENT-GUIDE.md" -ForegroundColor Cyan
Write-Host "🆘 Need help? Check Vercel dashboard: https://vercel.com/dashboard`n" -ForegroundColor Yellow

# Wait for user
Read-Host "Press Enter to exit"
