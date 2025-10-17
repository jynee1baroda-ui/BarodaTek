# BARODATEK - Remove Hosts File Redirect
# This script removes the localhost mapping that blocks access to your live site
# Must run as Administrator!

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  FIX HOSTS FILE - Remove Localhost Mapping" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit
}

$hostsPath = "C:\Windows\System32\drivers\etc\hosts"

# Backup current hosts file
$backupPath = "$hostsPath.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $hostsPath $backupPath
Write-Host "Backup created: $backupPath" -ForegroundColor Green
Write-Host ""

# Show current barodatek entries
Write-Host "Current barodatek.com entries in hosts file:" -ForegroundColor Cyan
$currentHosts = Get-Content $hostsPath
$barodatekLines = $currentHosts | Select-String "barodatek"
if ($barodatekLines) {
    $barodatekLines | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
}
else {
    Write-Host "  (none found)" -ForegroundColor Gray
}
Write-Host ""

# Remove barodatek entries
Write-Host "Removing barodatek.com redirects..." -ForegroundColor Cyan
$newHosts = $currentHosts | Where-Object { $_ -notmatch "barodatek.com" }
$newHosts | Set-Content $hostsPath -Force

Write-Host "OK Hosts file updated!" -ForegroundColor Green
Write-Host ""

# Flush DNS cache
Write-Host "Flushing DNS cache..." -ForegroundColor Cyan
ipconfig /flushdns | Out-Null
Write-Host "OK DNS cache flushed!" -ForegroundColor Green
Write-Host ""

# Verify DNS resolution
Write-Host "Testing DNS resolution..." -ForegroundColor Cyan
try {
    $dns = Resolve-DnsName barodatek.com -ErrorAction Stop
    $ip = $dns[0].IPAddress
    Write-Host "OK barodatek.com resolves to: $ip" -ForegroundColor Green
    
    if ($ip -eq "127.0.0.1") {
        Write-Host "WARNING: Still resolving to localhost! Try closing and reopening your browser." -ForegroundColor Yellow
    }
    elseif ($ip -match "^216\.198\.79\." -or $ip -match "^64\.29\.17\.") {
        Write-Host "PERFECT: Resolving to Vercel servers!" -ForegroundColor Green
    }
}
catch {
    Write-Host "Could not verify DNS" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Close ALL browser windows" -ForegroundColor White
Write-Host "2. Open a NEW incognito/private window" -ForegroundColor White
Write-Host "3. Visit: https://barodatek.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your site should now load from Vercel!" -ForegroundColor Green
Write-Host ""
