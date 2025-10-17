# RUN MATCHMAKING TEST WORKFLOW (Windows PowerShell 5.1 compatible)
# Ensures Node server is running, waits for /api/health, then runs quick test.

param(
    [string]$HealthUrl = "http://localhost:8080/api/health",
    [string]$BaseUrl   = "http://localhost:8080/api",
    [string]$ApiKey    = $env:BARODATEK_API_KEY,
    [string]$ServerScript = "server.js",
    [int]$MaxWaitSeconds = 30,
    [switch]$StopServerWhenDone
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-Timestamp { (Get-Date).ToString('yyyy-MM-dd HH:mm:ss.fff') }
function Log([string]$msg, [ConsoleColor]$color = [ConsoleColor]::Gray) {
    $ts = Get-Timestamp
    $realColor = if ($Host.UI.RawUI.ForegroundColor) { $Host.UI.RawUI.ForegroundColor } else { [ConsoleColor]::Gray }
    try { $Host.UI.RawUI.ForegroundColor = $color } catch {}
    Write-Host "$ts  $msg"
    try { $Host.UI.RawUI.ForegroundColor = $realColor } catch {}
}

function Test-HttpOk([string]$url, [int]$timeoutSec = 3) {
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec $timeoutSec -ErrorAction Stop
        return ($resp.StatusCode -eq 200)
    } catch { return $false }
}

function Get-RepoRoot {
    # Use this script's directory as repo root
    if ($PSScriptRoot) { return $PSScriptRoot }
    return (Split-Path -Parent $MyInvocation.MyCommand.Path)
}

function Ensure-NodePresent {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw "Node.js is not installed or 'node' is not in PATH. Please install Node.js and try again."
    }
}

function Get-PortInUse([int]$port) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        return $conn -ne $null
    } catch {
        # Fallback for older systems: use netstat
        $out = netstat -ano | Select-String ":$port\s+.*LISTENING\s+\d+$" -SimpleMatch
        return $out -ne $null
    }
}

function Start-ServerIfNeeded([string]$repoRoot, [ref]$procRef) {
    if (Test-HttpOk -url $HealthUrl) {
        Log "Server already healthy at $HealthUrl" 'Green'
        $procRef.Value = $null
        return
    }

    # Check if port is occupied
    $port = [int]([uri]$HealthUrl).Port
    $inUse = Get-PortInUse -port $port
    if ($inUse) {
        Log "Port $port is in use but health check failed. Another process may be using it." 'Yellow'
        Log "If this is the correct server, it may still be starting; continuing to wait..." 'Yellow'
    } else {
        Log "Starting Node server..." 'Cyan'
        $logPath = Join-Path $repoRoot 'server.log'
        try { Remove-Item $logPath -Force -ErrorAction SilentlyContinue } catch {}
        $startInfo = New-Object System.Diagnostics.ProcessStartInfo
        $startInfo.FileName = 'node'
        $startInfo.Arguments = $ServerScript
        $startInfo.WorkingDirectory = $repoRoot
        $startInfo.RedirectStandardOutput = $true
        $startInfo.RedirectStandardError = $true
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true

    $p = New-Object System.Diagnostics.Process
    $p.StartInfo = $startInfo
    [void]$p.Start()
    # Asynchronously append logs (register handlers before begin)
    $p.add_OutputDataReceived({ param($s,$e) if ($e.Data) { Add-Content -Path $logPath -Value $e.Data } })
    $p.add_ErrorDataReceived({ param($s,$e) if ($e.Data) { Add-Content -Path $logPath -Value $e.Data } })
    $p.BeginOutputReadLine()
    $p.BeginErrorReadLine()

        $procRef.Value = $p
        Log "Node started (PID=$($p.Id)). Logging to server.log" 'Green'
    }
}

function Wait-For-Health([int]$maxWaitSec) {
    $deadline = (Get-Date).AddSeconds($maxWaitSec)
    $attempt = 0
    do {
        $attempt++
        if (Test-HttpOk -url $HealthUrl -timeoutSec 3) {
            Log "Health OK after attempt #$attempt" 'Green'
            return $true
        }
        Start-Sleep -Seconds 1
    } while ((Get-Date) -lt $deadline)
    return $false
}

function Tail-Log([string]$path, [int]$lines = 80) {
    if (Test-Path $path) {
        Log ("Last {0} lines of {1}:" -f $lines, $path) 'Yellow'
        Get-Content -Path $path -Tail $lines | ForEach-Object { Write-Host $_ }
    } else {
        Log "No log file found at $path" 'Yellow'
    }
}

function Ensure-ApiKey([string]$baseUrl, [ref]$apiKeyRef) {
    # If provided and not placeholder, keep it
    if ($apiKeyRef.Value -and $apiKeyRef.Value -ne 'barodatek_dev_12345') { return }
    try {
        $email = ('dev+{0}@barodatek.local' -f ([guid]::NewGuid().ToString('N').Substring(0,8)))
        $payload = @{ email = $email; password = 'devpass123'; name = 'Dev Test'; tier = 'free' } | ConvertTo-Json
        $headers = @{ 'Content-Type' = 'application/json' }
        Log ("Registering temp dev account: {0}" -f $email) 'Cyan'
        $resp = Invoke-RestMethod -Uri ($baseUrl + '/auth/register') -Method POST -Headers $headers -Body $payload -ErrorAction Stop
        if ($resp -and $resp.success -and $resp.data -and $resp.data.apiKey) {
            $apiKeyRef.Value = $resp.data.apiKey
            Log "Acquired API key via registration" 'Green'
            return
        }
        Log "Registration did not return an apiKey; using placeholder may fail" 'Yellow'
    } catch {
        Log ("Register failed: {0}" -f $_.Exception.Message) 'Yellow'
    }
}

# Main
$repo = Get-RepoRoot
Log "Repo: $repo" 'Gray'
Log "Health URL: $HealthUrl" 'Gray'
Log "Max wait: $MaxWaitSeconds seconds" 'Gray'

try { Ensure-NodePresent } catch { Log $_.Exception.Message 'Red'; exit 1 }

$serverProc = $null
Start-ServerIfNeeded -repoRoot $repo -procRef ([ref]$serverProc)

Log "Waiting for server health..." 'Cyan'
$ok = Wait-For-Health -maxWaitSec $MaxWaitSeconds
if (-not $ok) {
    Log "Server did not become healthy within $MaxWaitSeconds seconds" 'Red'
    Tail-Log -path (Join-Path $repo 'server.log') -lines 120
    if ($serverProc) { Log "Stopping server we started (PID=$($serverProc.Id))" 'Yellow'; try { $serverProc.Kill() } catch {} }
    exit 2
}

# Small stabilization delay to avoid race after first 200 OK
Start-Sleep -Milliseconds 800

Log "Running quick matchmaking test..." 'Cyan'
$quickTest = Join-Path $repo 'quick-test-matchmaking.ps1'
if (-not (Test-Path $quickTest)) {
    Log "quick-test-matchmaking.ps1 not found at $quickTest" 'Red'
    exit 3
}

# Prefer env var API key; if blank or placeholder, attempt registration
if ([string]::IsNullOrWhiteSpace($ApiKey)) { $ApiKey = 'barodatek_dev_12345' }
Ensure-ApiKey -baseUrl $BaseUrl -apiKeyRef ([ref]$ApiKey)

# Run test with explicit params
$psArgs = @()
$psArgs += "-ExecutionPolicy"; $psArgs += "Bypass"
$psArgs += "-File"; $psArgs += $quickTest
$psArgs += "-BaseUrl"; $psArgs += $BaseUrl
$psArgs += "-ApiKey"; $psArgs += $ApiKey

Log "Invoking: powershell $($psArgs -join ' ')" 'Gray'

$testExit = 0
try {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = 'powershell'
    $psi.Arguments = ($psArgs -join ' ')
    $psi.WorkingDirectory = $repo
    $psi.UseShellExecute = $false
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $proc = [System.Diagnostics.Process]::Start($psi)
    $stdout = $proc.StandardOutput.ReadToEnd()
    $stderr = $proc.StandardError.ReadToEnd()
    $proc.WaitForExit()
    $testExit = $proc.ExitCode
    Write-Host $stdout
    if (-not [string]::IsNullOrWhiteSpace($stderr)) {
        Log $stderr 'Yellow'
    }
} catch {
    Log "Error running quick test: $($_.Exception.Message)" 'Red'
    $testExit = 4
}

if ($testExit -ne 0) {
    Log "Quick test exited with code $testExit" 'Red'
} else {
    Log "Quick test completed (exit 0)" 'Green'
}

if ($StopServerWhenDone -and $serverProc) {
    Log "Stopping server we started (PID=$($serverProc.Id))" 'Yellow'
    try { $serverProc.Kill() } catch {}
}

exit $testExit
