# 🎮 BarodaTek Arena - Local Development Server
# Starts HTTP server on http://localhost:8080

Write-Host ""
Write-Host "🎮 BARODATEK ARENA - Local Development" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if http-server is installed globally
$httpServerInstalled = $null -ne (Get-Command http-server -ErrorAction SilentlyContinue)

if (-not $httpServerInstalled) {
    Write-Host "📦 Installing http-server..." -ForegroundColor Yellow
    npm install -g http-server
    Write-Host ""
}

Write-Host "🚀 Starting local server at http://localhost:8080" -ForegroundColor Green
Write-Host ""
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Start the server
npx http-server . -p 8080 -c-1 --cors -o

# Alternative if npx fails:
# http-server . -p 8080 -c-1 --cors -o
