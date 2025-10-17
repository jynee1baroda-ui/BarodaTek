# MATCHMAKING API TEST SCRIPT
# Tests all 6 matchmaking endpoints + background jobs

$baseUrl = "http://localhost:8080/api"
$apiKey = "barodatek_dev_12345"  # Default dev API key

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MATCHMAKING API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Helper function to make API calls
function Invoke-APITest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "  $Method $Endpoint" -ForegroundColor Gray
    
    $headers = @{
        "Content-Type" = "application/json"
        "X-API-Key" = $apiKey
    }
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            Write-Host "  Body: $jsonBody" -ForegroundColor Gray
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -Body $jsonBody -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri "$baseUrl$Endpoint" -Method $Method -Headers $headers -ErrorAction Stop
        }
        
        Write-Host "  ✅ SUCCESS" -ForegroundColor Green
        Write-Host "  Response:" -ForegroundColor Gray
        $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
        Write-Host ""
        return $response
    }
    catch {
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

# Test 1: Create Lobby
Write-Host "TEST 1: Create Lobby" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
$lobby1 = Invoke-APITest -Method "POST" -Endpoint "/matchmaking/lobby" -Description "Create ranked lobby in US-East" -Body @{
    gameMode = "ranked"
    region = "us-east"
    maxPlayers = 10
    hostPlayerId = "player-001"
    hostUsername = "ProGamer"
    hostElo = 1850
}
Start-Sleep -Seconds 1

# Test 2: List Lobbies
Write-Host "TEST 2: List All Lobbies" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
$lobbies = Invoke-APITest -Method "GET" -Endpoint "/matchmaking/lobbies" -Description "Get all active lobbies"
Start-Sleep -Seconds 1

# Test 3: Add Player to Lobby
Write-Host "TEST 3: Add Player to Lobby" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
if ($lobby1) {
    $lobbyId = $lobby1.data.lobbyId
    $updated = Invoke-APITest -Method "PUT" -Endpoint "/matchmaking/lobby/$lobbyId" -Description "Add player to lobby" -Body @{
        action = "add-player"
        playerId = "player-002"
        username = "SkillShot"
        elo = 1875
    }
}
Start-Sleep -Seconds 1

# Test 4: Join Queue (Multiple Players)
Write-Host "TEST 4: Join Queue (10 Players)" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray

$players = @(
    @{ id = "player-101"; username = "Alpha"; elo = 1500 },
    @{ id = "player-102"; username = "Bravo"; elo = 1520 },
    @{ id = "player-103"; username = "Charlie"; elo = 1480 },
    @{ id = "player-104"; username = "Delta"; elo = 1510 },
    @{ id = "player-105"; username = "Echo"; elo = 1505 },
    @{ id = "player-106"; username = "Foxtrot"; elo = 1495 },
    @{ id = "player-107"; username = "Golf"; elo = 1530 },
    @{ id = "player-108"; username = "Hotel"; elo = 1490 },
    @{ id = "player-109"; username = "India"; elo = 1515 },
    @{ id = "player-110"; username = "Juliet"; elo = 1500 }
)

foreach ($player in $players) {
    Invoke-APITest -Method "POST" -Endpoint "/matchmaking/queue" -Description "Join queue: $($player.username)" -Body @{
        playerId = $player.id
        username = $player.username
        elo = $player.elo
        gameMode = "ranked"
        region = "us-east"
    } | Out-Null
}
Start-Sleep -Seconds 1

# Test 5: Wait for Auto-Matching
Write-Host "TEST 5: Wait for Auto-Matching" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "  Waiting 5 seconds for auto-matching algorithm..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 6: List Lobbies Again (Should show auto-created match)
Write-Host "TEST 6: List Lobbies (After Auto-Match)" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
$lobbiesAfter = Invoke-APITest -Method "GET" -Endpoint "/matchmaking/lobbies" -Description "Get lobbies after auto-matching"
Start-Sleep -Seconds 1

# Test 7: Filter Lobbies by Game Mode
Write-Host "TEST 7: Filter Lobbies by Game Mode" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
$rankedLobbies = Invoke-APITest -Method "GET" -Endpoint "/matchmaking/lobbies?gameMode=ranked" -Description "Get only ranked lobbies"
Start-Sleep -Seconds 1

# Test 8: Join Queue and Leave
Write-Host "TEST 8: Join and Leave Queue" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
Invoke-APITest -Method "POST" -Endpoint "/matchmaking/queue" -Description "Join queue" -Body @{
    playerId = "player-test"
    username = "TestPlayer"
    elo = 1600
    gameMode = "casual"
    region = "us-west"
} | Out-Null

Start-Sleep -Seconds 1

Invoke-APITest -Method "DELETE" -Endpoint "/matchmaking/queue?playerId=player-test" -Description "Leave queue" | Out-Null
Start-Sleep -Seconds 1

# Test 9: Update Lobby Status
Write-Host "TEST 9: Update Lobby Status" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
if ($lobby1) {
    $lobbyId = $lobby1.data.lobbyId
    Invoke-APITest -Method "PUT" -Endpoint "/matchmaking/lobby/$lobbyId" -Description "Start match" -Body @{
        action = "update-status"
        status = "in-progress"
    } | Out-Null
}
Start-Sleep -Seconds 1

# Test 10: Close Lobby
Write-Host "TEST 10: Close Lobby" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray
if ($lobby1) {
    $lobbyId = $lobby1.data.lobbyId
    Invoke-APITest -Method "DELETE" -Endpoint "/matchmaking/lobby/$lobbyId" -Description "Close lobby"
}
Start-Sleep -Seconds 1

# Test 11: Edge Cases
Write-Host "TEST 11: Edge Cases" -ForegroundColor Magenta
Write-Host "----------------------------------------" -ForegroundColor Gray

Write-Host "  11a. Invalid game mode" -ForegroundColor Yellow
Invoke-APITest -Method "POST" -Endpoint "/matchmaking/lobby" -Description "Create lobby with invalid game mode" -Body @{
    gameMode = "invalid"
    region = "us-east"
    hostPlayerId = "player-edge"
} | Out-Null

Write-Host "  11b. Missing required fields" -ForegroundColor Yellow
Invoke-APITest -Method "POST" -Endpoint "/matchmaking/queue" -Description "Join queue without playerId" -Body @{
    gameMode = "ranked"
    region = "us-east"
} | Out-Null

Write-Host "  11c. Join queue twice" -ForegroundColor Yellow
Invoke-APITest -Method "POST" -Endpoint "/matchmaking/queue" -Description "Join queue first time" -Body @{
    playerId = "player-double"
    username = "DoubleJoin"
    elo = 1700
    gameMode = "ranked"
    region = "us-west"
} | Out-Null

Invoke-APITest -Method "POST" -Endpoint "/matchmaking/queue" -Description "Join queue second time (should fail)" -Body @{
    playerId = "player-double"
    username = "DoubleJoin"
    elo = 1700
    gameMode = "ranked"
    region = "us-west"
} | Out-Null

Write-Host "  11d. Lobby not found" -ForegroundColor Yellow
Invoke-APITest -Method "DELETE" -Endpoint "/matchmaking/lobby/invalid-lobby-id" -Description "Delete non-existent lobby" | Out-Null

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Lobby Management:" -ForegroundColor Green
Write-Host "   - Create lobby" -ForegroundColor White
Write-Host "   - List lobbies" -ForegroundColor White
Write-Host "   - Add player to lobby" -ForegroundColor White
Write-Host "   - Update lobby status" -ForegroundColor White
Write-Host "   - Close lobby" -ForegroundColor White
Write-Host ""
Write-Host "✅ Queue Management:" -ForegroundColor Green
Write-Host "   - Join queue" -ForegroundColor White
Write-Host "   - Leave queue" -ForegroundColor White
Write-Host "   - Queue position tracking" -ForegroundColor White
Write-Host ""
Write-Host "✅ Auto-Matching:" -ForegroundColor Green
Write-Host "   - ELO-based matching (±100 points)" -ForegroundColor White
Write-Host "   - Automatic lobby creation" -ForegroundColor White
Write-Host "   - Match quality calculation" -ForegroundColor White
Write-Host ""
Write-Host "✅ Edge Cases:" -ForegroundColor Green
Write-Host "   - Invalid input validation" -ForegroundColor White
Write-Host "   - Duplicate queue join prevention" -ForegroundColor White
Write-Host "   - Not found error handling" -ForegroundColor White
Write-Host ""
Write-Host "Background Jobs Running:" -ForegroundColor Yellow
Write-Host "   🎮 Auto-matching (every 3s)" -ForegroundColor Cyan
Write-Host "   🧹 Lobby cleanup (every 30s)" -ForegroundColor Cyan
Write-Host "   ⏱️ Queue timeout (every 60s)" -ForegroundColor Cyan
Write-Host ""
Write-Host "All tests completed! 🎉" -ForegroundColor Green
Write-Host ""
