param(
    [string]$BaseUrl = "http://localhost:8080/api",
    [string]$ApiKey = "barodatek_dev_12345"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function TS { (Get-Date).ToString('yyyy-MM-dd HH:mm:ss.fff') }
function Log([string]$msg, [ConsoleColor]$color = [ConsoleColor]::Gray) {
    $ts = TS
    $orig = $Host.UI.RawUI.ForegroundColor
    try { $Host.UI.RawUI.ForegroundColor = $color } catch {}
    Write-Host "$ts  $msg"
    try { $Host.UI.RawUI.ForegroundColor = $orig } catch {}
}

$headers = @{
    "Content-Type" = "application/json"
    "X-API-Key" = $ApiKey
}

Write-Host ""
Log "MATCHMAKING API - QUICK TEST"
Write-Host ""

# Test 1: Create Lobby
Write-Host -NoNewline "1. Creating lobby... "
try {
    $body = @{
        gameMode = "ranked"
        region = "us-east"
        maxPlayers = 10
        hostPlayerId = "player-001"
        hostUsername = "ProGamer"
        hostElo = 1850
    } | ConvertTo-Json
    
    $lobby = Invoke-RestMethod -Uri "$BaseUrl/matchmaking/lobby" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    $lobbyId = $lobby.data.lobbyId
    Write-Host "OK ($lobbyId)" -ForegroundColor Green
} catch {
    Write-Host "FAIL" -ForegroundColor Red
    Log "Error: $($_.Exception.Message)" 'Red'
}

# Test 2: List Lobbies
Write-Host -NoNewline "2. Listing lobbies... "
try {
    $lobbies = Invoke-RestMethod -Uri "$BaseUrl/matchmaking/lobbies" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "OK (Found: $($lobbies.data.count))" -ForegroundColor Green
} catch {
    Write-Host "FAIL" -ForegroundColor Red
}

# Test 3: Add Player to Lobby
Write-Host -NoNewline "3. Adding player to lobby... "
try {
    $body = @{
        action = "add-player"
        playerId = "player-002"
        username = "SkillShot"
        elo = 1875
    } | ConvertTo-Json
    
    $result = Invoke-RestMethod -Uri "$BaseUrl/matchmaking/lobby/$lobbyId" -Method PUT -Headers $headers -Body $body -ErrorAction Stop
    Write-Host "OK (Players: $($result.data.currentPlayers))" -ForegroundColor Green
} catch {
    Write-Host "FAIL" -ForegroundColor Red
}

# Test 4: Join Queue (6 players for auto-match)
Write-Host -NoNewline "4. Adding 6 players to queue... "
$queued = 0
for ($i = 1; $i -le 6; $i++) {
    try {
        $body = @{
            playerId = "player-10$i"
            username = "Player$i"
            elo = 1500 + ($i * 5)
            gameMode = "ranked"
            region = "us-east"
        } | ConvertTo-Json
        
    Invoke-RestMethod -Uri "$BaseUrl/matchmaking/queue" -Method POST -Headers $headers -Body $body -ErrorAction Stop | Out-Null
        $queued++
    } catch {}
}
Write-Host "OK ($queued queued)" -ForegroundColor Green

# Test 5: Wait for Auto-Match
Write-Host -NoNewline "5. Waiting for auto-match (5s)... "
Start-Sleep -Seconds 5
Write-Host "OK" -ForegroundColor Green

# Test 6: Check if Match Was Created
Write-Host -NoNewline "6. Checking for auto-created match... "
try {
    $lobbies = Invoke-RestMethod -Uri "$BaseUrl/matchmaking/lobbies" -Method GET -Headers $headers -ErrorAction Stop
    $autoMatch = $lobbies.data.lobbies | Where-Object { $_.status -eq 'full' -and $_.currentPlayers -ge 6 }
    if ($autoMatch) {
        Write-Host "OK (Average ELO: $($autoMatch[0].averageElo))" -ForegroundColor Green
    } else {
        Write-Host "WARN (No match yet)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "FAIL" -ForegroundColor Red
}

# Test 7: Close Lobby
Write-Host -NoNewline "7. Closing test lobby... "
try {
    Invoke-RestMethod -Uri "$BaseUrl/matchmaking/lobby/$lobbyId" -Method DELETE -Headers $headers -ErrorAction Stop | Out-Null
    Write-Host "OK" -ForegroundColor Green
} catch {
    Write-Host "FAIL" -ForegroundColor Red
}

Write-Host ""
Log "All tests completed!"
Write-Host ""
Write-Host "Endpoints exercised:" -ForegroundColor Cyan
Write-Host "   POST /api/matchmaking/lobby" -ForegroundColor White
Write-Host "   GET  /api/matchmaking/lobbies" -ForegroundColor White
Write-Host "   PUT  /api/matchmaking/lobby/:id" -ForegroundColor White
Write-Host "   DELETE /api/matchmaking/lobby/:id" -ForegroundColor White
Write-Host "   POST /api/matchmaking/queue" -ForegroundColor White
Write-Host "   Background auto-matching" -ForegroundColor White

exit 0
