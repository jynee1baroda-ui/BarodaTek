# 🎮 Matchmaking System Guide - BarodaTek API

## 🚀 Quick Start

### Start the Server (Robust Method)
```powershell
# Recommended: Use the robust startup script
.\start-server.ps1

# Or with force restart
.\start-server.ps1 -Force

# Development mode with auto-reload
.\start-server.ps1 -Watch
```

### Access Matchmaking UI
Open your browser to: **http://localhost:8080/matchmaking.html**

---

## ✨ Key Improvements Made

### 1. Robust Server Startup (`start-server.ps1`)
**Features:**
- ✅ Automatic port conflict detection
- ✅ Process management (stop/start/restart)
- ✅ Health check validation
- ✅ Clear status messages
- ✅ Multiple startup options

**Usage Examples:**
```powershell
# Basic start
.\start-server.ps1

# Force restart existing server
.\start-server.ps1 -Force

# Use different port
.\start-server.ps1 -Port 3000

# Development with auto-reload
.\start-server.ps1 -Watch

# Verbose logging for debugging
.\start-server.ps1 -Verbose
```

### 2. Enhanced Matchmaking UI
**Improvements:**
- ✅ Auto-reconnecting WebSocket (exponential backoff)
- ✅ Color-coded status indicators (✅❌⚠️)
- ✅ Detailed event logging with timestamps
- ✅ Better error handling and validation
- ✅ Real-time match notifications
- ✅ Automatic health checks on load

**Status Indicators:**
- 🟢 **Success** - Green checkmark (✅)
- 🔴 **Error** - Red X (❌)
- 🟡 **Warning** - Yellow warning (⚠️)
- 🔵 **Info** - Blue info (ℹ️)

---

## 📋 Complete Feature List

### Server Features
✅ **Matchmaking API**
- Create/list/update/delete lobbies
- Join/leave matchmaking queue
- ELO-based matching (±100 points)
- Automatic match creation (3s interval)
- Queue timeout handling (60s)
- Lobby cleanup (30s interval)

✅ **WebSocket Real-Time**
- `match-found` - When a match is ready
- `lobby-updated` - Lobby state changes
- `player-joined` / `player-left` - Player events
- `queue-position-updated` - Queue status
- Auto-reconnection with backoff

✅ **Authentication**
- API key validation
- Rate limiting per tier
- Secure headers (Helmet)

### UI Features
✅ **Matchmaking Dashboard**
- Live WebSocket connection status
- Health check monitoring
- Queue management buttons
- Real-time event log
- Player configuration (ID, ELO, mode, region)
- Visual feedback for all operations

---

## 🎯 Testing Guide

### 1. Single Player Test
```powershell
# Start server
.\start-server.ps1

# Open browser to:
http://localhost:8080/matchmaking.html

# Steps in UI:
1. Wait for "WebSocket connected" (auto-connects)
2. Enter Player ID: "player1"
3. Set ELO: 1500
4. Click "Join Queue"
5. Watch logs for queue confirmation
```

### 2. Multi-Player Match Test
```powershell
# Open 6-10 browser tabs/windows
# In each tab:
1. Enter unique Player ID: player1, player2, player3...
2. Set similar ELO (1450-1550)
3. Select same Game Mode and Region
4. Click "Join Queue"

# Within 3 seconds, auto-matching will:
- Create a lobby
- Send "match-found" to all players
- Display lobby ID in logs
```

### 3. API Testing (PowerShell)
```powershell
# Run automated test
.\quick-test-matchmaking.ps1

# With custom API key
.\quick-test-matchmaking.ps1 -ApiKey "your_key_here"

# With custom base URL
.\quick-test-matchmaking.ps1 -BaseUrl "http://localhost:3000"
```

### 4. Postman Collection
```powershell
# Import: postman-collection.json
# Collection includes:
- All 6 matchmaking endpoints
- Pre-configured variables
- Example requests with documentation
```

---

## 🔧 Server Management

### Check Server Status
```powershell
# Is server running?
Get-Process node -ErrorAction SilentlyContinue

# Is port listening?
netstat -ano | Select-String ":8080"

# Test health endpoint
Invoke-WebRequest http://localhost:8080/api/health
```

### Stop Server
```powershell
# Stop all Node processes
Stop-Process -Name node -Force

# Or use process ID
Stop-Process -Id <PID> -Force
```

### Restart Server
```powershell
# Quick restart
.\start-server.ps1 -Force
```

---

## 📊 Matchmaking Algorithm

### How It Works
1. **Queue Entry**
   - Player joins with: ID, username, ELO, game mode, region
   - Timestamp recorded for timeout tracking

2. **Auto-Matching (Every 3s)**
   - Groups players by game mode and region
   - Finds players within ±100 ELO range
   - Creates lobbies with 6-10 players
   - Calculates match quality: `100 - (maxElo - minElo)`

3. **Match Creation**
   - Generates unique lobby ID
   - Removes players from queue
   - Sends `match-found` WebSocket event to all players
   - Lobby enters "active" state

4. **Cleanup**
   - Lobbies in "completed" state removed after 30s
   - Queue entries older than 60s timeout with notification

---

## 🐛 Troubleshooting

### WebSocket Won't Connect
```powershell
# 1. Verify server is running
Get-Process node

# 2. Check health endpoint
Invoke-WebRequest http://localhost:8080/api/health

# 3. Check firewall (allow port 8080)
New-NetFirewallRule -DisplayName "BarodaTek API" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow

# 4. Try manual reconnect in UI
```

### "Port Already in Use"
```powershell
# Option 1: Force restart
.\start-server.ps1 -Force

# Option 2: Use different port
.\start-server.ps1 -Port 3000

# Option 3: Kill processes manually
Stop-Process -Name node -Force
.\start-server.ps1
```

### API Returns 403 Forbidden
```powershell
# Issue: Invalid or missing API key
# Solution: Get a valid key

# Option 1: Use default dev key
X-API-Key: barodatek_dev_12345

# Option 2: Register new key at
http://localhost:8080/api-explorer.html
```

### No Match Found
```
# Common causes:
1. Not enough players (need 6-10)
2. ELO range too different (must be ±100)
3. Different game modes or regions
4. Auto-matching disabled (check console)

# Solution: Ensure 6+ players with:
- Similar ELO (e.g., all 1450-1550)
- Same game mode (e.g., "ranked")
- Same region (e.g., "us-east")
```

---

## 📈 Performance Optimization

### Current Configuration
- **Auto-match interval**: 3 seconds
- **Lobby cleanup**: 30 seconds
- **Queue timeout**: 60 seconds
- **ELO tolerance**: ±100 points
- **Lobby size**: 6-10 players

### Tuning Tips
```javascript
// In server.js, adjust these values:

// Faster matching (more frequent checks)
setInterval(autoMatchPlayers, 1000); // 1s instead of 3s

// Wider ELO range (easier to find matches)
if (Math.abs(entry.elo - otherEntry.elo) <= 200) // 200 instead of 100

// Smaller lobbies (faster fills)
if (bucket.length >= 4) { // 4 instead of 6
```

---

## 🌐 All Endpoints

| Page | URL |
|------|-----|
| 🏠 Main | http://localhost:8080 |
| 🎮 Matchmaking | http://localhost:8080/matchmaking.html |
| 📊 API Explorer | http://localhost:8080/api-explorer.html |
| 🔧 Arena Control | http://localhost:8080/arena-control.html |
| 💬 AI Monitor | http://localhost:8080/ai-monitor.html |
| 📡 Health | http://localhost:8080/api/health |

### API Endpoints
```
POST   /api/matchmaking/lobby          - Create lobby
GET    /api/matchmaking/lobbies        - List lobbies
PUT    /api/matchmaking/lobby/:id      - Update lobby
DELETE /api/matchmaking/lobby/:id      - Delete lobby
POST   /api/matchmaking/queue          - Join queue
DELETE /api/matchmaking/queue          - Leave queue
```

---

## 📞 Support

**BarodaTek.com - Advanced Development Solutions**
- 📧 Email: barodatek.services@gmail.com
- 💰 Cash App: $baroda98
- 📚 Docs: See `DEPLOYMENT-GUIDE.md` and `DAY-3-MATCHMAKING-PLAN.md`

---

**🎉 Enjoy your robust matchmaking system!**
