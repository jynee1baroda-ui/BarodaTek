# Robust Server Startup Script for BarodaTek API
# Handles port conflicts, process checks, and graceful restarts

param(
    [int]$Port = 8080,
    [switch]$Force,
    [switch]$Watch,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Test-Port {
    param([int]$Port)
    $connections = netstat -ano | Select-String ":$Port"
    return $connections.Count -gt 0
}

function Stop-ServerProcess {
    $processes = Get-Process node -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Log "Stopping existing Node.js processes..." "Yellow"
        $processes | ForEach-Object {
            Write-Log "  Stopping PID $($_.Id)..." "Yellow"
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
}

function Start-Server {
    param([bool]$Watch)
    
    Write-Log "Starting BarodaTek API Server on port $Port..." "Cyan"
    
    if ($Watch) {
        Write-Log "Watch mode: Use 'npm run dev' for auto-reload" "Green"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev" -WindowStyle Normal
    } else {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; node server.js" -WindowStyle Minimized
    }
    
    Start-Sleep -Seconds 3
}

function Test-ServerHealth {
    param([int]$MaxAttempts = 10)
    
    Write-Log "Checking server health..." "Cyan"
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$Port/api/health" -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Log "✅ Server is healthy! (attempt $i/$MaxAttempts)" "Green"
                return $true
            }
        } catch {
            if ($Verbose) {
                Write-Log "Health check attempt $i/$MaxAttempts failed: $($_.Exception.Message)" "DarkGray"
            }
        }
        Start-Sleep -Seconds 1
    }
    
    Write-Log "❌ Server health check failed after $MaxAttempts attempts" "Red"
    return $false
}

# Main execution
Write-Log "=====================================" "Cyan"
Write-Log "  BarodaTek API Server Manager" "Cyan"
Write-Log "=====================================" "Cyan"
Write-Log ""

# Check if port is in use
if (Test-Port -Port $Port) {
    if ($Force) {
        Write-Log "Port $Port is in use. Force flag set - stopping processes..." "Yellow"
        Stop-ServerProcess
    } else {
        Write-Log "❌ Port $Port is already in use!" "Red"
        Write-Log "Options:" "Yellow"
        Write-Log "  1. Use -Force to stop existing server" "White"
        Write-Log "  2. Use -Port to specify different port" "White"
        Write-Log "  3. Manually stop: Stop-Process -Name node -Force" "White"
        exit 1
    }
}

# Check if Node.js is running
$existingProcess = Get-Process node -ErrorAction SilentlyContinue
if ($existingProcess) {
    if ($Force) {
        Stop-ServerProcess
    } else {
        Write-Log "⚠️  Node.js process already running (PID: $($existingProcess.Id))" "Yellow"
        Write-Log "Use -Force to restart" "Yellow"
        exit 1
    }
}

# Start the server
Start-Server -Watch $Watch

# Verify server is healthy
if (Test-ServerHealth) {
    Write-Log ""
    Write-Log "=====================================" "Green"
    Write-Log "  ✅ Server Started Successfully!" "Green"
    Write-Log "=====================================" "Green"
    Write-Log ""
    Write-Log "Access Points:" "Cyan"
    Write-Log "  🏠 Main Site:      http://localhost:$Port" "White"
    Write-Log "  🎮 Matchmaking:    http://localhost:$Port/matchmaking.html" "White"
    Write-Log "  📊 API Explorer:   http://localhost:$Port/api-explorer.html" "White"
    Write-Log "  🔧 Arena Control:  http://localhost:$Port/arena-control.html" "White"
    Write-Log "  💬 AI Monitor:     http://localhost:$Port/ai-monitor.html" "White"
    Write-Log "  📡 Health:         http://localhost:$Port/api/health" "White"
    Write-Log ""
    Write-Log "WebSocket:" "Cyan"
    Write-Log "  ws://localhost:$Port" "White"
    Write-Log ""
    Write-Log "Management:" "Cyan"
    Write-Log "  Stop server:       Stop-Process -Name node -Force" "White"
    Write-Log "  View processes:    Get-Process node" "White"
    Write-Log ""
} else {
    Write-Log ""
    Write-Log "❌ Server failed to start properly" "Red"
    Write-Log "Check logs and try again" "Yellow"
    exit 1
}
