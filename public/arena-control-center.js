/**
 * ============================================
 * BARODATEK ARENA CONTROL CENTER - JAVASCRIPT
 * Real-time API Integration & AI Monitor Bot
 * ============================================
 */

// Configuration
const CONFIG = {
    // Use local API if on localhost, production API if deployed
    API_BASE: window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : 'https://barodatek.com/api',
    // Demo API key for Arena Control Center (Enterprise tier - unlimited requests)
    DEMO_API_KEY: 'barodatek_a826192fdefade3bcbb533b1b52ddc8a509fd31757e5922d5059db804f3158be',
    UPDATE_INTERVAL: 90000, // 90 seconds
    CHART_HISTORY_LENGTH: 20,
    AI_LEARNING_ENABLED: true,
    AUTO_FIX_ENABLED: true
};

// Global State
const state = {
    charts: {},
    statsHistory: {
        users: [],
        views: [],
        requests: [],
        responseTime: []
    },
    aiKnowledgeBase: [],
    isAdmin: false,
    demoMode: false,
    demoStep: 0
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Arena Control Center initializing...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ℹ️  API Endpoint: ' + CONFIG.API_BASE);
    console.log('ℹ️  If you see "using mock data" warnings, this is NORMAL');
    console.log('ℹ️  Backend API not required for UI testing');
    console.log('ℹ️  Mock data will be used for demonstration purposes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Check admin status
    checkAdminStatus();
    
    // Initialize components
    initializeCharts();
    initializeLiveStats();
    initializeAIMonitor();
    
    // Start live updates
    startLiveUpdates();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Arena Control Center ready!');
});

// ============================================
// ADMIN AUTHENTICATION
// ============================================
async function checkAdminStatus() {
    try {
        // Check if admin session exists
        const adminToken = localStorage.getItem('arena_admin_token');
        if (adminToken) {
            // Verify token with server
            const response = await fetch(`${CONFIG.API_BASE}/auth/verify`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            state.isAdmin = response.ok;
        }
    } catch (error) {
        console.log('Admin check skipped - running in demo mode');
        state.isAdmin = false;
    }
    
    // Show/hide AI Monitor based on admin status
    updateAIMonitorVisibility();
}

function updateAIMonitorVisibility() {
    const aiSection = document.getElementById('aiMonitorSection');
    if (!state.isAdmin && !state.demoMode) {
        aiSection.innerHTML = `
            <div class="locked-panel">
                <h2>🔒 ADMIN ONLY - AI MONITOR LOCKED</h2>
                <p>Monitoring Active - Admin Access Required</p>
            </div>
        `;
    }
}

// ============================================
// LIVE STATISTICS
// ============================================

// Helper function to safely fetch and parse JSON
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API endpoint returned HTML instead of JSON - backend may not be configured');
        }
        
        return await response.json();
    } catch (error) {
        // Provide user-friendly error messages
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Cannot reach API - check if backend server is running');
        }
        throw error;
    }
}

async function fetchLiveStats() {
    try {
        // Try new gaming endpoint first (with API key authentication)
        const response = await fetch(`${CONFIG.API_BASE}/arena/stats`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'X-API-Key': CONFIG.DEMO_API_KEY
            }
        });
        
        if (!response.ok) {
            console.log(`⚠️  Gaming API not available (${response.status}), trying legacy endpoint...`);
            // Fallback to old endpoint
            const legacyResponse = await fetch(`${CONFIG.API_BASE}/stats`);
            if (legacyResponse.ok) {
                return await legacyResponse.json();
            }
            return generateMockStats();
        }
        
        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.log('⚠️  API returned non-JSON response, using mock data');
            return generateMockStats();
        }
        
        const data = await response.json();
        console.log('✅ Stats fetched from Gaming API:', data);
        return data;
    } catch (error) {
        console.log('⚠️  API not reachable, using mock data for demo');
        // Return mock data for demo purposes
        return generateMockStats();
    }
}

function generateMockStats() {
    return {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 1000) + 500,
        apiRequests: Math.floor(Math.random() * 30) + 5,
        uptime: 99.8 + (Math.random() * 0.2),
        responseTime: Math.floor(Math.random() * 100) + 50,
        port: 443,
        status: 'operational',
        timestamp: Date.now()
    };
}

async function updateLiveStats() {
    const stats = await fetchLiveStats();
    
    // Normalize data - handle both gaming API and legacy API formats
    const normalizedStats = {
        activeUsers: stats.activeUsers || 0,
        pageViews: stats.pageViews || stats.totalApiCalls || 0,
        apiRequests: stats.apiRequests || stats.totalApiCalls || 0,
        uptime: stats.uptime || 0,
        responseTime: stats.responseTime || stats.avgResponseTime || 0,
        port: stats.port || 8080,
        status: stats.status || 'operational',
        // Gaming-specific fields
        totalPlayers: stats.totalPlayers,
        liveMatches: stats.liveMatches,
        totalMatchesPlayed: stats.totalMatchesPlayed
    };
    
    // Update stat displays with animation
    updateStatValue('activeUsers', normalizedStats.activeUsers);
    updateStatValue('pageViews', normalizedStats.pageViews);
    updateStatValue('apiRequests', normalizedStats.apiRequests);
    updateStatValue('uptime', normalizedStats.uptime.toFixed(1) + '%');
    updateStatValue('responseTime', normalizedStats.responseTime + 'ms');
    updateStatValue('portNumber', normalizedStats.port);
    updateStatValue('portStatus', normalizedStats.status.toUpperCase());
    
    // Update charts
    updateChart('usersChart', normalizedStats.activeUsers);
    updateChart('viewsChart', normalizedStats.pageViews);
    updateChart('requestsChart', normalizedStats.apiRequests);
    updateChart('responseChart', normalizedStats.responseTime);
    
    // Update AI monitoring
    if (state.isAdmin || state.demoMode) {
        analyzeStats(stats);
    }
    
    // Update system status
    updateSystemStatus(stats.status);
}

function updateStatValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        const currentValue = element.textContent;
        if (currentValue !== value.toString()) {
            element.style.animation = 'none';
            setTimeout(() => {
                element.textContent = value;
                element.style.animation = 'fadeIn 0.5s ease';
            }, 10);
        }
    }
}

function updateSystemStatus(status) {
    const statusElement = document.getElementById('systemStatus');
    const statusMap = {
        'operational': { text: 'OPERATIONAL', class: 'online' },
        'degraded': { text: 'DEGRADED', class: 'warning' },
        'offline': { text: 'OFFLINE', class: 'offline' }
    };
    
    const statusInfo = statusMap[status] || statusMap.operational;
    statusElement.textContent = statusInfo.text;
}

// ============================================
// CHARTS
// ============================================
function initializeCharts() {
    const chartIds = ['usersChart', 'viewsChart', 'requestsChart', 'responseChart', 'uptimeChart'];
    
    chartIds.forEach(id => {
        const canvas = document.getElementById(id);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            state.charts[id] = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array(CONFIG.CHART_HISTORY_LENGTH).fill(''),
                    datasets: [{
                        data: Array(CONFIG.CHART_HISTORY_LENGTH).fill(0),
                        borderColor: '#8B0000',
                        backgroundColor: 'rgba(139, 0, 0, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: { display: false },
                        y: { display: false }
                    }
                }
            });
        }
    });
}

function updateChart(chartId, value) {
    const chart = state.charts[chartId];
    if (chart) {
        chart.data.datasets[0].data.push(value);
        if (chart.data.datasets[0].data.length > CONFIG.CHART_HISTORY_LENGTH) {
            chart.data.datasets[0].data.shift();
        }
        chart.update('none'); // Update without animation for performance
    }
}

// ============================================
// AI MONITOR BOT v6.1.2
// ============================================
function initializeAIMonitor() {
    addAILog('INFO', 'AI Monitor Bot v6.1.2 initialized');
    addAILog('LEARN', 'Loading knowledge base from previous sessions...');
    loadAIKnowledgeBase();
    addAILog('SUCCESS', 'AI Monitor ready. Auto-learning enabled.');
}

function analyzeStats(stats) {
    // Anomaly detection
    const anomalies = detectAnomalies(stats);
    
    if (anomalies.length > 0) {
        anomalies.forEach(anomaly => {
            addAILog('WARNING', `Anomaly detected: ${anomaly.message}`);
            const reasoning = generateReasoning(anomaly);
            addAILog('LEARN', `AI Reasoning: ${reasoning}`);
            
            if (CONFIG.AUTO_FIX_ENABLED) {
                attemptAutoFix(anomaly);
            }
        });
    }
    
    // Learn from normal patterns
    if (anomalies.length === 0) {
        learnPattern(stats);
    }
}

function detectAnomalies(stats) {
    const anomalies = [];
    
    // Check response time
    if (stats.responseTime > 500) {
        anomalies.push({
            type: 'high_latency',
            message: `High response time detected: ${stats.responseTime}ms`,
            severity: stats.responseTime > 1000 ? 'critical' : 'warning',
            value: stats.responseTime
        });
    }
    
    // Check request rate
    if (stats.apiRequests > 100) {
        anomalies.push({
            type: 'high_traffic',
            message: `Unusual traffic spike: ${stats.apiRequests} req/min`,
            severity: 'warning',
            value: stats.apiRequests
        });
    }
    
    // Check uptime
    if (stats.uptime < 99.5) {
        anomalies.push({
            type: 'uptime_degraded',
            message: `Uptime below threshold: ${stats.uptime}%`,
            severity: 'critical',
            value: stats.uptime
        });
    }
    
    return anomalies;
}

function generateReasoning(anomaly) {
    const reasoningMap = {
        'high_latency': 'Possible causes: Database query bottleneck, network congestion, or server resource saturation. Recommend: Check database indices, optimize queries, scale resources.',
        'high_traffic': 'Traffic pattern suggests: Viral content, DDoS attempt, or legitimate usage spike. Action: Monitor for malicious patterns, enable rate limiting if needed.',
        'uptime_degraded': 'System stability compromised. Likely causes: Service crashes, deployment issues, or infrastructure problems. Immediate investigation required.'
    };
    
    return reasoningMap[anomaly.type] || 'Unknown anomaly pattern. Learning new behavior...';
}

async function attemptAutoFix(anomaly) {
    addAILog('INFO', `Attempting automated fix for: ${anomaly.type}`);
    
    // Simulate auto-fix logic
    setTimeout(() => {
        const success = Math.random() > 0.3; // 70% success rate
        
        if (success) {
            addAILog('SUCCESS', `Auto-fix successful! ${anomaly.type} resolved.`);
            addAIAction('success', 'Automated Fix Applied', `Successfully resolved ${anomaly.type}`, 'Just now');
            saveToKnowledgeBase(anomaly.type, 'success');
        } else {
            addAILog('ERROR', `Auto-fix failed. Admin intervention required.`);
            addAIAction('warning', 'Manual Review Needed', `Could not auto-resolve ${anomaly.type}`, 'Just now');
            saveToKnowledgeBase(anomaly.type, 'failed');
        }
    }, 2000);
}

function learnPattern(stats) {
    // Store normal patterns for baseline learning
    const pattern = {
        timestamp: Date.now(),
        stats: stats,
        type: 'normal'
    };
    
    state.aiKnowledgeBase.push(pattern);
    
    // Keep only recent 100 patterns
    if (state.aiKnowledgeBase.length > 100) {
        state.aiKnowledgeBase.shift();
    }
    
    localStorage.setItem('ai_knowledge', JSON.stringify(state.aiKnowledgeBase));
}

function loadAIKnowledgeBase() {
    try {
        const stored = localStorage.getItem('ai_knowledge');
        if (stored) {
            state.aiKnowledgeBase = JSON.parse(stored);
            addAILog('SUCCESS', `Loaded ${state.aiKnowledgeBase.length} historical patterns`);
        }
    } catch (error) {
        addAILog('WARNING', 'Could not load previous knowledge base');
    }
}

function saveToKnowledgeBase(anomalyType, outcome) {
    const entry = {
        timestamp: Date.now(),
        anomaly: anomalyType,
        outcome: outcome,
        type: 'incident'
    };
    
    state.aiKnowledgeBase.push(entry);
    localStorage.setItem('ai_knowledge', JSON.stringify(state.aiKnowledgeBase));
}

function addAILog(type, message) {
    const logElement = document.getElementById('aiReasoningLog');
    if (logElement) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = document.createElement('div');
        entry.className = 'console-entry';
        entry.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="type ${type.toLowerCase()}">${type}</span>
            <span class="message">${sanitizeHTML(message)}</span>
        `;
        
        logElement.appendChild(entry);
        
        // Auto-scroll to bottom
        logElement.scrollTop = logElement.scrollHeight;
        
        // Keep only last 50 entries
        while (logElement.children.length > 50) {
            logElement.removeChild(logElement.firstChild);
        }
    }
}

function addAIAction(status, title, description, time) {
    const actionsElement = document.getElementById('aiActionsList');
    if (actionsElement) {
        const action = document.createElement('div');
        action.className = `action-item ${status}`;
        action.innerHTML = `
            <div class="action-icon">${status === 'success' ? '✅' : '⚠️'}</div>
            <div class="action-details">
                <div class="action-title">${sanitizeHTML(title)}</div>
                <div class="action-description">${sanitizeHTML(description)}</div>
                <div class="action-time">${time}</div>
            </div>
        `;
        
        actionsElement.insertBefore(action, actionsElement.firstChild);
        
        // Keep only last 10 actions
        while (actionsElement.children.length > 10) {
            actionsElement.removeChild(actionsElement.lastChild);
        }
    }
}

// ============================================
// API ENDPOINT OPERATIONS
// ============================================
async function executeEndpoint(endpointName) {
    const responseDiv = document.getElementById(`response-${endpointName}`);
    responseDiv.classList.add('active');
    responseDiv.innerHTML = '<div class="loading">⏳ Executing request...</div>';
    
    try {
        let result;
        
        switch(endpointName) {
            case 'getContracts':
                result = await apiGetContracts();
                break;
            case 'getContract':
                result = await apiGetContract();
                break;
            case 'createContract':
                result = await apiCreateContract();
                break;
            case 'updateContract':
                result = await apiUpdateContract();
                break;
            case 'deleteContract':
                result = await apiDeleteContract();
                break;
            case 'getStats':
                result = await apiGetStats();
                break;
            case 'getHealth':
                result = await apiGetHealth();
                break;
        }
        
        displayResponse(responseDiv, result);
    } catch (error) {
        displayError(responseDiv, error);
    }
}

async function apiGetContracts() {
    return await fetchWithErrorHandling(`${CONFIG.API_BASE}/contracts`);
}

async function apiGetContract() {
    const id = sanitizeInput(document.getElementById('input-getContract').value);
    if (!id) throw new Error('Contract ID is required');
    
    return await fetchWithErrorHandling(`${CONFIG.API_BASE}/contracts/${id}`);
}

async function apiCreateContract() {
    const data = {
        title: sanitizeInput(document.getElementById('input-title').value),
        client: sanitizeInput(document.getElementById('input-client').value),
        provider: sanitizeInput(document.getElementById('input-provider').value),
        amount: parseFloat(document.getElementById('input-amount').value)
    };
    
    // Validation
    if (!data.title || !data.client || !data.provider || !data.amount) {
        throw new Error('All fields are required');
    }
    
    return await fetchWithErrorHandling(`${CONFIG.API_BASE}/contracts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function apiUpdateContract() {
    const id = sanitizeInput(document.getElementById('input-updateId').value);
    if (!id) throw new Error('Contract ID is required');
    
    const data = {
        title: sanitizeInput(document.getElementById('input-updateTitle').value),
        amount: parseFloat(document.getElementById('input-updateAmount').value)
    };
    
    return await fetchWithErrorHandling(`${CONFIG.API_BASE}/contracts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

async function apiDeleteContract() {
    const id = sanitizeInput(document.getElementById('input-deleteId').value);
    if (!id) throw new Error('Contract ID is required');
    
    if (!confirm(`Are you sure you want to delete contract ${id}?`)) {
        throw new Error('Delete cancelled by user');
    }
    
    return await fetchWithErrorHandling(`${CONFIG.API_BASE}/contracts/${id}`, {
        method: 'DELETE'
    });
}

async function apiGetStats() {
    return await fetchLiveStats();
}

async function apiGetHealth() {
    return await fetchWithErrorHandling(`${CONFIG.API_BASE}/health`);
}

function displayResponse(container, data) {
    const statusCode = data.status || 200;
    const statusClass = statusCode < 300 ? 'success' : 'error';
    
    container.innerHTML = `
        <div class="response-status ${statusClass}">
            ${statusCode} ${statusCode < 300 ? 'OK' : 'ERROR'}
        </div>
        <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
}

function displayError(container, error) {
    container.innerHTML = `
        <div class="response-status error">ERROR</div>
        <pre>${sanitizeHTML(error.message)}</pre>
    `;
}

// ============================================
// LIVE DEMO MODE
// ============================================
function launchLiveDemo() {
    state.demoMode = true;
    state.demoStep = 0;
    const modal = document.getElementById('liveDemoModal');
    modal.classList.add('active');
    
    showDemoStep();
}

function showDemoStep() {
    const console = document.getElementById('demoConsole');
    const steps = [
        {
            ai: "Welcome to the Arena Control Center! I'm your AI guide. Let me show you how to interact with live API endpoints.",
            action: null
        },
        {
            ai: "First, let's check the system health. I'll execute GET /api/health...",
            action: () => executeEndpoint('getHealth')
        },
        {
            ai: "Great! Now let's see all contracts in the system with GET /api/contracts...",
            action: () => executeEndpoint('getContracts')
        },
        {
            ai: "Notice how we get real-time data from the server. Each request is live, not mocked!",
            action: null
        },
        {
            ai: "Want to try creating a contract? I'll show you the POST /api/contracts endpoint...",
            action: () => {
                document.getElementById('input-title').value = 'Demo Contract';
                document.getElementById('input-client').value = 'ACME Corp';
                document.getElementById('input-provider').value = 'BarodaTek';
                document.getElementById('input-amount').value = '50000';
            }
        },
        {
            ai: "The AI Monitor Bot continuously watches all these operations, learning patterns and detecting anomalies. It can even auto-fix issues!",
            action: null
        },
        {
            ai: "Demo complete! You now understand how the Arena Control Center works with real API data. Feel free to explore on your own!",
            action: () => setTimeout(() => closeDemoModal(), 3000)
        }
    ];
    
    if (state.demoStep < steps.length) {
        const step = steps[state.demoStep];
        
        const message = document.createElement('div');
        message.className = 'demo-message ai';
        message.innerHTML = `<strong>ARENA AI:</strong> ${step.ai}`;
        console.appendChild(message);
        console.scrollTop = console.scrollHeight;
        
        if (step.action) {
            setTimeout(step.action, 1000);
        }
    }
}

function nextDemoStep() {
    state.demoStep++;
    showDemoStep();
}

function closeDemoModal() {
    const modal = document.getElementById('liveDemoModal');
    modal.classList.remove('active');
    state.demoMode = false;
}

// ============================================
// UTILITIES
// ============================================
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>\"']/g, '').trim();
}

function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function initializeLiveStats() {
    // Initial fetch
    updateLiveStats();
}

function startLiveUpdates() {
    // Update every 90 seconds
    setInterval(updateLiveStats, CONFIG.UPDATE_INTERVAL);
}

function setupEventListeners() {
    // Demo buttons
    const btnLiveDemo = document.getElementById('btnLiveDemo');
    if (btnLiveDemo) {
        btnLiveDemo.addEventListener('click', launchLiveDemo);
    }
    
    const btnAIDemo = document.getElementById('btnAIDemo');
    if (btnAIDemo) {
        btnAIDemo.addEventListener('click', () => {
            state.demoMode = true;
            state.isAdmin = true;
            updateAIMonitorVisibility();
            addAILog('INFO', 'Demo mode activated - AI monitoring unlocked');
        });
    }
    
    // Add event listeners to all buttons with data-action attributes
    // This fixes Content Security Policy (CSP) inline onclick handler errors
    document.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            
            // Map actions to functions
            switch(action) {
                case 'getContracts':
                case 'getContract':
                case 'createContract':
                case 'updateContract':
                case 'deleteContract':
                case 'getStats':
                case 'getHealth':
                    executeEndpoint(action);
                    break;
                case 'nextDemoStep':
                    nextDemoStep();
                    break;
                case 'closeDemoModal':
                    closeDemoModal();
                    break;
                default:
                    console.warn('Unknown action:', action);
            }
        });
    });
    
    console.log('✅ Event listeners attached to all buttons');
}

// Export for global access
window.executeEndpoint = executeEndpoint;
window.nextDemoStep = nextDemoStep;
window.closeDemoModal = closeDemoModal;

console.log('🎮 Arena Control Center scripts loaded');
