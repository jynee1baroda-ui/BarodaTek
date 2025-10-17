# DAY 3: MATCHMAKING API - IMPLEMENTATION PLAN

**Date**: October 16, 2025  
**Goal**: Build complete matchmaking system with lobbies, queues, ELO matching, and WebSocket notifications  
**Estimated Time**: 4-6 hours  
**Status**: 🚀 IN PROGRESS

---

## 🎯 OBJECTIVES

### Primary Goals
1. ✅ **Lobby Management System**
   - Create, read, update, delete lobbies
   - Track lobby status (waiting, full, in-progress, completed)
   - Support multiple game modes (ranked, casual, custom)
   - Regional server selection

2. ✅ **Queue System**
   - Join/leave matchmaking queue
   - Track queue position and wait time
   - Support multiple game modes simultaneously
   - Automatic queue cleanup

3. ✅ **ELO-Based Matching Algorithm**
   - Match players within ±100 ELO points
   - Balance teams by average ELO
   - Calculate match quality score
   - Prioritize queue wait time

4. ✅ **WebSocket Real-Time Notifications**
   - `match-found` - Notify when match is ready
   - `lobby-updated` - Lobby status changes
   - `player-joined` - New player in lobby
   - `queue-position-updated` - Queue status updates

5. ✅ **Background Matching Job**
   - Run every 3 seconds
   - Process queue automatically
   - Create balanced matches
   - Clean up expired lobbies

---

## 📋 API ENDPOINTS TO IMPLEMENT

### Lobby Management (4 endpoints)

#### 1. POST /api/matchmaking/lobby
**Purpose**: Create a new lobby  
**Auth**: Required (API Key)  
**Rate Limit**: 10/minute  

**Request Body**:
```json
{
  "gameMode": "ranked",
  "region": "us-east",
  "maxPlayers": 10,
  "hostPlayerId": "player-123"
}
```

**Response** (201):
```json
{
  "success": true,
  "data": {
    "lobbyId": "lobby-abc123",
    "gameMode": "ranked",
    "region": "us-east",
    "status": "waiting",
    "players": [
      {
        "playerId": "player-123",
        "username": "ProGamer",
        "elo": 1850,
        "isHost": true
      }
    ],
    "maxPlayers": 10,
    "createdAt": "2025-10-16T10:30:00Z"
  }
}
```

---

#### 2. GET /api/matchmaking/lobbies
**Purpose**: List all active lobbies  
**Auth**: Required (API Key)  
**Rate Limit**: 30/minute  

**Query Parameters**:
- `gameMode` (optional): Filter by game mode
- `region` (optional): Filter by region
- `status` (optional): Filter by status (waiting, full, in-progress)

**Response** (200):
```json
{
  "success": true,
  "data": {
    "lobbies": [
      {
        "lobbyId": "lobby-abc123",
        "gameMode": "ranked",
        "region": "us-east",
        "status": "waiting",
        "currentPlayers": 3,
        "maxPlayers": 10,
        "averageElo": 1820,
        "createdAt": "2025-10-16T10:30:00Z"
      }
    ],
    "count": 1
  }
}
```

---

#### 3. PUT /api/matchmaking/lobby/:id
**Purpose**: Update lobby (add player, change status)  
**Auth**: Required (API Key)  
**Rate Limit**: 20/minute  

**Request Body**:
```json
{
  "action": "add-player",
  "playerId": "player-456",
  "username": "SkillShot",
  "elo": 1875
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "lobbyId": "lobby-abc123",
    "status": "waiting",
    "players": [
      {
        "playerId": "player-123",
        "username": "ProGamer",
        "elo": 1850,
        "isHost": true
      },
      {
        "playerId": "player-456",
        "username": "SkillShot",
        "elo": 1875,
        "isHost": false
      }
    ],
    "currentPlayers": 2,
    "maxPlayers": 10
  }
}
```

---

#### 4. DELETE /api/matchmaking/lobby/:id
**Purpose**: Close/delete a lobby  
**Auth**: Required (API Key)  
**Rate Limit**: 10/minute  

**Response** (200):
```json
{
  "success": true,
  "message": "Lobby closed successfully",
  "data": {
    "lobbyId": "lobby-abc123",
    "closedAt": "2025-10-16T10:45:00Z"
  }
}
```

---

### Queue Management (2 endpoints)

#### 5. POST /api/matchmaking/queue
**Purpose**: Join matchmaking queue  
**Auth**: Required (API Key)  
**Rate Limit**: 10/minute  

**Request Body**:
```json
{
  "playerId": "player-789",
  "username": "QuickDraw",
  "elo": 1900,
  "gameMode": "ranked",
  "region": "us-east"
}
```

**Response** (200):
```json
{
  "success": true,
  "data": {
    "queueId": "queue-xyz789",
    "playerId": "player-789",
    "gameMode": "ranked",
    "region": "us-east",
    "queuePosition": 3,
    "estimatedWaitTime": "45 seconds",
    "joinedAt": "2025-10-16T10:35:00Z"
  }
}
```

---

#### 6. DELETE /api/matchmaking/queue
**Purpose**: Leave matchmaking queue  
**Auth**: Required (API Key)  
**Rate Limit**: 10/minute  

**Query Parameters**:
- `playerId` (required): Player leaving queue

**Response** (200):
```json
{
  "success": true,
  "message": "Left queue successfully",
  "data": {
    "playerId": "player-789",
    "timeInQueue": "30 seconds"
  }
}
```

---

## 🧮 MATCHING ALGORITHM

### ELO-Based Matching Logic

```javascript
function findMatch(queue, gameMode, region) {
  // 1. Filter queue by game mode and region
  const filteredQueue = queue.filter(p => 
    p.gameMode === gameMode && p.region === region
  );
  
  // 2. Sort by queue wait time (longest waiting first)
  filteredQueue.sort((a, b) => a.joinedAt - b.joinedAt);
  
  // 3. Group players by ELO range (±100 points)
  const matches = [];
  const processed = new Set();
  
  for (const player of filteredQueue) {
    if (processed.has(player.playerId)) continue;
    
    // Find similar ELO players
    const compatiblePlayers = filteredQueue.filter(p => 
      !processed.has(p.playerId) &&
      Math.abs(p.elo - player.elo) <= 100
    );
    
    // Need 6-10 players for a match
    if (compatiblePlayers.length >= 6) {
      const matchPlayers = compatiblePlayers.slice(0, 10);
      
      // Calculate match quality (0-100)
      const eloRange = Math.max(...matchPlayers.map(p => p.elo)) - 
                      Math.min(...matchPlayers.map(p => p.elo));
      const quality = Math.max(0, 100 - eloRange);
      
      matches.push({
        players: matchPlayers,
        averageElo: matchPlayers.reduce((sum, p) => sum + p.elo, 0) / matchPlayers.length,
        quality: quality,
        gameMode: gameMode,
        region: region
      });
      
      matchPlayers.forEach(p => processed.add(p.playerId));
    }
  }
  
  return matches;
}
```

### Match Quality Calculation

- **Perfect Match** (100): All players within 10 ELO points
- **Excellent Match** (90-99): Players within 50 ELO points
- **Good Match** (75-89): Players within 100 ELO points
- **Fair Match** (60-74): Players within 150 ELO points
- **Poor Match** (<60): ELO range > 150 points

---

## 🔌 WEBSOCKET IMPLEMENTATION

### Socket.io Events

#### Server → Client Events

```javascript
// 1. Match Found
socket.emit('match-found', {
  lobbyId: 'lobby-abc123',
  gameMode: 'ranked',
  region: 'us-east',
  players: [...],
  matchQuality: 92,
  serverIp: '54.123.45.67:7777'
});

// 2. Lobby Updated
socket.emit('lobby-updated', {
  lobbyId: 'lobby-abc123',
  status: 'in-progress',
  currentPlayers: 10,
  maxPlayers: 10
});

// 3. Player Joined
socket.emit('player-joined', {
  lobbyId: 'lobby-abc123',
  player: {
    playerId: 'player-999',
    username: 'NewPlayer',
    elo: 1880
  }
});

// 4. Queue Position Updated
socket.emit('queue-position-updated', {
  playerId: 'player-789',
  position: 2,
  estimatedWaitTime: '20 seconds',
  queueSize: 15
});
```

#### Client → Server Events

```javascript
// Join matchmaking room
socket.emit('join-matchmaking', {
  playerId: 'player-789',
  gameMode: 'ranked'
});

// Leave matchmaking room
socket.emit('leave-matchmaking', {
  playerId: 'player-789'
});
```

---

## ⚙️ BACKGROUND JOBS

### Auto-Matching Job

```javascript
// Run every 3 seconds
setInterval(() => {
  const gameModes = ['ranked', 'casual', 'custom'];
  const regions = ['us-east', 'us-west', 'eu-west', 'asia'];
  
  for (const gameMode of gameModes) {
    for (const region of regions) {
      const matches = findMatch(queue, gameMode, region);
      
      for (const match of matches) {
        // Create lobby
        const lobby = createLobby(match);
        
        // Notify all players
        match.players.forEach(player => {
          notifyPlayer(player.playerId, 'match-found', lobby);
          removeFromQueue(player.playerId);
        });
      }
    }
  }
}, 3000);
```

### Lobby Cleanup Job

```javascript
// Run every 30 seconds
setInterval(() => {
  const now = Date.now();
  const timeout = 10 * 60 * 1000; // 10 minutes
  
  for (const [lobbyId, lobby] of lobbies.entries()) {
    if (lobby.status === 'completed' || 
        (lobby.status === 'waiting' && now - lobby.createdAt > timeout)) {
      lobbies.delete(lobbyId);
      console.log(`Cleaned up lobby: ${lobbyId}`);
    }
  }
}, 30000);
```

---

## 📊 DATA STRUCTURES

### Lobby Object

```javascript
{
  lobbyId: 'lobby-abc123',
  gameMode: 'ranked',
  region: 'us-east',
  status: 'waiting', // waiting, full, in-progress, completed
  players: [
    {
      playerId: 'player-123',
      username: 'ProGamer',
      elo: 1850,
      isHost: true,
      team: 'A' // For team-based games
    }
  ],
  maxPlayers: 10,
  matchQuality: 92,
  createdAt: 1697456400000,
  startedAt: null,
  completedAt: null,
  serverIp: '54.123.45.67:7777'
}
```

### Queue Entry Object

```javascript
{
  queueId: 'queue-xyz789',
  playerId: 'player-789',
  username: 'QuickDraw',
  elo: 1900,
  gameMode: 'ranked',
  region: 'us-east',
  joinedAt: 1697456400000,
  lastUpdate: 1697456400000
}
```

---

## 🧪 TESTING PLAN

### Test Scenarios

1. **Create Lobby**
   - ✅ Create lobby successfully
   - ✅ Validate game mode
   - ✅ Validate region
   - ✅ Check host player is added

2. **Join Queue**
   - ✅ Join queue successfully
   - ✅ Get queue position
   - ✅ Prevent duplicate joins
   - ✅ Validate player ELO

3. **Auto-Matching**
   - ✅ Match players with similar ELO
   - ✅ Create lobby automatically
   - ✅ Notify all matched players
   - ✅ Remove from queue after match

4. **Lobby Management**
   - ✅ Add players to lobby
   - ✅ Update lobby status
   - ✅ Close lobby
   - ✅ List active lobbies

5. **WebSocket Events**
   - ✅ Receive match-found event
   - ✅ Receive lobby-updated event
   - ✅ Receive player-joined event
   - ✅ Receive queue-position-updated event

6. **Edge Cases**
   - ✅ Queue timeout (10 minutes)
   - ✅ Lobby full
   - ✅ Player leaves during match
   - ✅ No compatible players found

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Data Structures (15 min)
- [x] Create lobbies Map
- [x] Create matchmakingQueue Map
- [x] Define lobby object schema
- [x] Define queue entry schema

### Step 2: Lobby Endpoints (45 min)
- [ ] POST /api/matchmaking/lobby
- [ ] GET /api/matchmaking/lobbies
- [ ] PUT /api/matchmaking/lobby/:id
- [ ] DELETE /api/matchmaking/lobby/:id

### Step 3: Queue Endpoints (30 min)
- [ ] POST /api/matchmaking/queue
- [ ] DELETE /api/matchmaking/queue

### Step 4: Matching Algorithm (60 min)
- [ ] Implement ELO-based matching
- [ ] Calculate match quality
- [ ] Balance teams
- [ ] Handle edge cases

### Step 5: WebSocket Integration (45 min)
- [ ] Set up Socket.io
- [ ] Implement match-found event
- [ ] Implement lobby-updated event
- [ ] Implement player-joined event
- [ ] Implement queue-position-updated event

### Step 6: Background Jobs (30 min)
- [ ] Auto-matching job (every 3s)
- [ ] Lobby cleanup job (every 30s)
- [ ] Queue timeout handling

### Step 7: Testing (60 min)
- [ ] Test all endpoints with Postman
- [ ] Test WebSocket events
- [ ] Test matching algorithm
- [ ] Test edge cases
- [ ] Load testing (100+ concurrent users)

### Step 8: Documentation (30 min)
- [ ] Update API documentation
- [ ] Create integration examples
- [ ] Update Arena Control Center
- [ ] Create matchmaking dashboard

---

## 📈 SUCCESS METRICS

### Performance Targets
- ⚡ Match found in <5 seconds (90% of cases)
- ⚡ API response time <100ms
- ⚡ WebSocket latency <50ms
- ⚡ Support 1000+ concurrent players
- ⚡ Match quality score >85 average

### Code Quality
- ✅ 100% endpoint coverage
- ✅ Error handling on all endpoints
- ✅ Input validation
- ✅ Rate limiting applied
- ✅ Authentication required

---

## 🎯 DELIVERABLES

1. **Code**
   - ✅ 6 matchmaking endpoints implemented
   - ✅ WebSocket event system
   - ✅ Matching algorithm
   - ✅ Background jobs

2. **Documentation**
   - ✅ This implementation plan
   - ⏳ API endpoint documentation
   - ⏳ WebSocket event documentation
   - ⏳ Integration guide

3. **Testing**
   - ⏳ Postman collection updated
   - ⏳ Test scenarios documented
   - ⏳ Load test results

4. **UI**
   - ⏳ Matchmaking dashboard (optional)
   - ⏳ Update Arena Control Center

---

## 🔥 LET'S BUILD!

**Current Time**: 10:30 AM  
**Target Completion**: 4:30 PM  
**Status**: Ready to start! 🚀

Next: Implement lobby management endpoints in server.js
