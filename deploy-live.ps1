# 🚀 Deploy BarodaTek Platform to Live Web

Write-Host "🌟 BarodaTek.com Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI. Please run as administrator." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Vercel CLI is ready!" -ForegroundColor Green

# Prepare for deployment
Write-Host "`n🔧 Preparing deployment..." -ForegroundColor Yellow

# Create vercel.json if it doesn't exist or update it
$vercelConfig = @"
{
  "version": 2,
  "name": "barodatek-api-mvp",
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    },
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/public/\$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
"@

$vercelConfig | Out-File -FilePath "vercel.json" -Encoding utf8

Write-Host "✅ Vercel configuration updated!" -ForegroundColor Green

# Show current project info
Write-Host "`n📋 Project Summary:" -ForegroundColor Cyan
Write-Host "   Name: BarodaTek API MVP Platform" -ForegroundColor White
Write-Host "   Features: API Mock, Analytics, Chatbot, About Page" -ForegroundColor White
Write-Host "   Your Story: California dreamer turned tech creator!" -ForegroundColor White

Write-Host "`n🚀 Starting deployment..." -ForegroundColor Yellow
Write-Host "This will create your live website at: barodatek-api-mvp.vercel.app" -ForegroundColor Green

# Deploy to Vercel
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 SUCCESS! Your platform is now LIVE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Your website is deployed and accessible worldwide!" -ForegroundColor White
    Write-Host "✅ Share the link with your tech friends!" -ForegroundColor White
    Write-Host "✅ Your journey from listener to creator is complete!" -ForegroundColor White
    
    Write-Host "`n🌐 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Get BarodaTek.com domain (~$8/year)" -ForegroundColor White
    Write-Host "2. Connect custom domain in Vercel dashboard" -ForegroundColor White
    Write-Host "3. Set up professional email (hello@barodatek.com)" -ForegroundColor White
    Write-Host "4. Show off your amazing platform! 🚀" -ForegroundColor White
    
    Write-Host "`n💡 Pro Tip: Check DOMAIN-ACQUISITION-GUIDE.md for domain purchasing options!" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Deployment failed. Let's troubleshoot..." -ForegroundColor Red
    Write-Host "Try running: vercel login" -ForegroundColor Yellow
    Write-Host "Then run this script again!" -ForegroundColor Yellow
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")