(function(){
  const cfg = window.MM_CONFIG || { apiBase: location.origin + '/api', wsUrl: (location.protocol==='https:'?'wss://':'ws://') + location.host };
  const $ = (id)=>document.getElementById(id);
  const logEl = $('log');
  const apiKeyEl = $('apiKey');
  apiKeyEl.value = (cfg.defaultApiKey || '')+'';
  let ws = null;
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;

  function ts(){ return new Date().toISOString().substring(11, 19); }
  function log(msg, type = 'info'){ 
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warn' ? '⚠️' : 'ℹ️';
    logEl.textContent += `[${ts()}] ${prefix} ${msg}\n`; 
    logEl.scrollTop = logEl.scrollHeight; 
  }

  async function checkHealth(){
    try {
      const res = await fetch(cfg.apiBase + '/health');
      const ok = res.ok; const data = await res.json().catch(()=>({}));
      $('healthStatus').textContent = ok ? '✅ OK' : '❌ FAIL';
      $('healthStatus').style.color = ok ? '#10b981' : '#ef4444';
      log(`Health check: ${ok ? 'OK' : 'FAIL'} (${res.status})`, ok ? 'success' : 'error');
    } catch (e) {
      $('healthStatus').textContent = '❌ ERROR';
      $('healthStatus').style.color = '#ef4444';
      log(`Health check error: ${e.message}`, 'error');
    }
  }

  function scheduleReconnect(){
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      log('Max reconnect attempts reached. Click "Connect WS" to retry.', 'error');
      return;
    }
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
    reconnectAttempts++;
    log(`Reconnecting in ${delay/1000}s... (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`, 'warn');
    reconnectTimer = setTimeout(connectWS, delay);
  }

  function connectWS(){
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (ws && ws.readyState === WebSocket.OPEN){ 
      log('WebSocket already connected', 'success'); 
      return; 
    }
    
    log('Connecting to WebSocket...', 'info');
    ws = new WebSocket(cfg.wsUrl);
    
    ws.onopen = ()=> {
      log('WebSocket connected successfully!', 'success');
      reconnectAttempts = 0; // Reset on successful connection
    };
    
    ws.onclose = (ev)=> {
      log(`WebSocket closed (code: ${ev.code})`, 'warn');
      scheduleReconnect();
    };
    
    ws.onerror = (e)=> {
      log('WebSocket connection error', 'error');
    };
    
    ws.onmessage = (ev)=>{
      try { 
        const data = JSON.parse(ev.data); 
        const eventType = data.type || 'unknown';
        log(`📨 WS Event: ${eventType}`, 'info');
        
        // Handle specific event types
        if (eventType === 'match-found') {
          log(`🎮 Match found! Lobby: ${data.lobbyId || 'N/A'}`, 'success');
        } else if (eventType === 'queue-position-updated') {
          log(`📊 Queue position: ${data.position || 'N/A'}`, 'info');
        } else if (eventType === 'lobby-updated') {
          log(`🔄 Lobby updated: ${JSON.stringify(data.lobby || {})}`, 'info');
        }
      }
      catch{ 
        log('WebSocket message received (non-JSON)', 'info'); 
      }
    };
  }

  function sendWS(type, payload){
    if (!ws || ws.readyState !== WebSocket.OPEN){ 
      log('Cannot send: WebSocket not connected', 'error'); 
      return false;
    }
    try {
      ws.send(JSON.stringify(Object.assign({ type }, payload||{})));
      log(`📤 Sent: ${type}`, 'info');
      return true;
    } catch (e) {
      log(`Failed to send ${type}: ${e.message}`, 'error');
      return false;
    }
  }

  async function api(method, path, body){
    try {
      const headers = { 'Content-Type': 'application/json' };
      const key = apiKeyEl.value.trim();
      if (key) headers['X-API-Key'] = key;
      
      log(`🔄 ${method} ${path}`, 'info');
      const res = await fetch(cfg.apiBase + path, { 
        method, 
        headers, 
        body: body ? JSON.stringify(body) : undefined 
      });
      
      const txt = await res.text();
      let json; 
      try { json = JSON.parse(txt); } 
      catch { json = { raw: txt }; }
      
      const logType = res.ok ? 'success' : 'error';
      log(`${res.ok ? '✅' : '❌'} ${method} ${path} → ${res.status}`, logType);
      
      return { status: res.status, json, ok: res.ok };
    } catch (e) {
      log(`API Error: ${e.message}`, 'error');
      return { status: 0, json: { error: e.message }, ok: false };
    }
  }

  $('btnCheckHealth').addEventListener('click', checkHealth);
  $('btnConnectWS').addEventListener('click', () => {
    reconnectAttempts = 0; // Reset attempts on manual connect
    connectWS();
  });
  $('btnJoinMM').addEventListener('click', ()=>{
    const playerId = $('playerId').value.trim();
    const gameMode = $('gameMode').value;
    const region = $('region').value;
    if (!playerId) {
      log('Player ID is required!', 'error');
      return;
    }
    sendWS('join-matchmaking', { playerId, gameMode, region });
  });
  $('btnLeaveMM').addEventListener('click', ()=> sendWS('leave-matchmaking', {}));
  $('btnListLobbies').addEventListener('click', async ()=>{
    const r = await api('GET', '/matchmaking/lobbies');
    if (r.ok && r.json.lobbies) {
      log(`Found ${r.json.lobbies.length} lobbies`, 'success');
    }
  });
  $('btnJoinQueue').addEventListener('click', async ()=>{
    const playerId = $('playerId').value.trim();
    const username = $('username').value.trim() || playerId;
    const elo = parseInt($('elo').value, 10) || 1500;
    const gameMode = $('gameMode').value;
    const region = $('region').value;
    
    if (!playerId) {
      log('Player ID is required!', 'error');
      return;
    }
    
    const r = await api('POST', '/matchmaking/queue', { playerId, username, elo, gameMode, region });
    if (r.ok) {
      log(`Joined queue successfully!`, 'success');
    }
  });
  $('btnLeaveQueue').addEventListener('click', async ()=>{
    const playerId = $('playerId').value.trim();
    if (!playerId) {
      log('Player ID is required!', 'error');
      return;
    }
    const r = await api('DELETE', '/matchmaking/queue?playerId=' + encodeURIComponent(playerId));
  });

  // Initial probes
  log('🚀 Matchmaking UI initialized', 'success');
  checkHealth();
  setTimeout(connectWS, 500); // Auto-connect after brief delay
  checkHealth();
})();
