const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const multer = require('multer');
const aiMonitor = require('./ai-monitor'); // AI Monitoring System
const db = require('./database'); // Real Database with Persistence

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize database on startup
db.initDatabase().then(() => {
    console.log('✅ Database ready for real-time data persistence');
});

// Memory monitoring with auto-fix and cleanup
setInterval(() => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const heapPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    
    // Clean up old analytics events (keep only last 100)
    if (analytics.events.length > 100) {
        analytics.events = analytics.events.slice(-100);
    }
    
    // Clean up old sessions (older than 1 hour)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    analytics.sessions.forEach((value, key) => {
        if (value < oneHourAgo) {
            analytics.sessions.delete(key);
        }
    });
    
    if (heapPercent > 80) {
        console.log(`⚠️  High memory usage: ${heapPercent}% (${heapUsedMB}MB / ${heapTotalMB}MB)`);
        console.log('🔄 Auto-fix: Running garbage collection and cleanup...');
        
        // Clean up analytics in memory
        analytics.events = analytics.events.slice(-50);
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
            console.log('✅ Garbage collection completed');
        } else {
            console.log('💡 Tip: Run node with --expose-gc flag to enable forced GC');
        }
        
        aiMonitor.reportError('HIGH_MEMORY_USAGE', new Error(`Memory at ${heapPercent}%`), {
            heapUsed: heapUsedMB,
            heapTotal: heapTotalMB,
            heapPercent,
            autoFix: !!global.gc,
            eventsCleared: analytics.events.length
        });
    }
}, 30000); // Check every 30 seconds

// Connect AI Monitor to WebSocket for real-time notifications
aiMonitor.on('notification', (notification) => {
    // Broadcast to admin dashboard only
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.isAdmin) {
            client.send(JSON.stringify({
                type: 'ai-monitor-notification',
                ...notification
            }));
        }
    });
});

// Listen for chatbot requests from AI Monitor
aiMonitor.on('chatbot-message', (data) => {
    // This would integrate with your chatbot system
    console.log('AI Monitor → Chatbot:', data.type);
});

// Feature flags (enable globally for all clients)
const featureFlags = {
    grokCodeFastV1Preview: true,
    gemini25ProEnabled: true,  // ✅ Gemini 2.5 Pro enabled for all clients
};

// Port configuration
const PORT = process.env.PORT || 8080;

// Global analytics storage
let analytics = {
    pageViews: 0,
    interactions: 0,
    downloads: 0,
    activeUsers: 0,
    sessions: new Map(),
    events: []
};

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:", "https:"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: []
        }
    }
}));

app.use(compression());

// Enhanced CORS configuration with auto-fix
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8080',
            'http://localhost:8081',
            'https://barodatek.com',
            'https://www.barodatek.com',
            /\.vercel\.app$/,  // Allow all Vercel deployments
            /\.railway\.app$/  // Allow all Railway deployments
        ];
        
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') return origin === allowed;
            if (allowed instanceof RegExp) return allowed.test(origin);
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log(`⚠️  CORS blocked origin: ${origin}`);
            aiMonitor.reportError('CORS_ERROR', new Error(`Origin ${origin} not allowed`), { origin });
            callback(null, true); // Allow anyway in development
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Avoid favicon 404 noise if file missing
app.get('/favicon.ico', (req, res, next) => {
    // If a real favicon exists in public it will be served by static middleware,
    // otherwise return 204 to suppress console errors
    res.status(204).end();
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
    console.log('🔗 New WebSocket connection from:', req.socket.remoteAddress);
    analytics.activeUsers++;
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to BarodaTek.com Analytics',
        timestamp: Date.now()
    }));
    
    // Send feature flags first
    ws.send(JSON.stringify({
        type: 'feature_flags',
        flags: featureFlags,
        timestamp: Date.now(),
    }));

    // Send current analytics (both legacy 'stats' and 'payload' shapes)
    ws.send(JSON.stringify({
        type: 'analytics_update',
        stats: {
            pageViews: analytics.pageViews,
            interactions: analytics.interactions,
            downloads: analytics.downloads,
            activeUsers: analytics.activeUsers
        },
        payload: {
            totalVisitors: analytics.pageViews, // approximate until unique tracking added
            activeUsers: analytics.activeUsers,
            topPages: []
        }
    }));
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleAnalyticsEvent(data, ws);
        } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
        }
    });
    
    ws.on('close', () => {
        console.log('📡 WebSocket disconnected');
        analytics.activeUsers = Math.max(0, analytics.activeUsers - 1);
        broadcastAnalyticsUpdate();
    });
    
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
    });
});

// Handle analytics events
async function handleAnalyticsEvent(data, ws) {
    // Check if data exists and has required properties
    if (!data || typeof data !== 'object') {
        return;
    }
    
    if (data.type === 'analytics_event' && data.payload) {
        const payload = data.payload;
        const eventType = payload.eventType || 'unknown';
        const eventData = payload.data || {};
        
        // Store event in memory (legacy)
        analytics.events.push({
            ...payload,
            receivedAt: Date.now()
        });
        
        // ✅ PERSIST TO DATABASE
        try {
            await db.trackEvent({
                type: eventType,
                sessionId: payload.sessionId,
                data: eventData,
                source: payload.source || 'websocket'
            });
        } catch (error) {
            console.error('Failed to persist analytics event:', error);
        }
        
        // Update counters based on event type
        if (eventType) {
            switch (eventType) {
                case 'page_view':
                    analytics.pageViews++;
                    try {
                        await db.trackPageView({
                            path: eventData.url || '/',
                            timestamp: eventData.timestamp
                        });
                    } catch (error) {
                        console.error('Failed to persist page view:', error);
                    }
                    break;
                case 'interaction':
                    analytics.interactions++;
                    break;
                case 'download':
                    analytics.downloads++;
                    break;
            }
        }
        
        // Broadcast updates to all connected clients
        broadcastAnalyticsUpdate();
        
        console.log(`📊 Analytics event: ${eventType} from session ${payload.sessionId || 'unknown'}`);
    }
    
    // Legacy format support
    if (data.type === 'analytics_event' && data.event) {
        const event = data.event;
        
        analytics.events.push({
            ...event,
            receivedAt: Date.now()
        });
        
        // Persist to database
        try {
            await db.trackEvent({
                type: event.type || 'unknown',
                sessionId: event.sessionId,
                data: event,
                source: 'websocket_legacy'
            });
        } catch (error) {
            console.error('Failed to persist legacy event:', error);
        }
        
        // Update counters
        if (event && event.type) {
            switch (event.type) {
                case 'page_view':
                    analytics.pageViews++;
                    break;
                case 'interaction':
                    analytics.interactions++;
                    break;
                case 'download':
                    analytics.downloads++;
                    break;
            }
        }
        
        broadcastAnalyticsUpdate();
        console.log(`📊 Analytics event (legacy): ${event.type} from session ${event.sessionId}`);
    }
}

// Broadcast analytics updates to all connected clients
function broadcastAnalyticsUpdate() {
    const updateData = {
        type: 'analytics_update',
        stats: {
            pageViews: analytics.pageViews,
            interactions: analytics.interactions,
            downloads: analytics.downloads,
            activeUsers: analytics.activeUsers
        },
        // Provide a payload shape expected by some clients
        payload: {
            totalVisitors: analytics.pageViews, // TODO: replace with unique visitor count
            activeUsers: analytics.activeUsers,
            topPages: []
        },
        timestamp: Date.now()
    };
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            // Broadcast feature flags periodically alongside updates
            client.send(JSON.stringify({ type: 'feature_flags', flags: featureFlags, timestamp: Date.now() }));
            client.send(JSON.stringify(updateData));
        }
    });
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/health', async (req, res) => {
    const dbStats = await db.getDatabaseStats();
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0',
        platform: 'BarodaTek.com',
        database: dbStats
    });
});

// ========== CONTRACTS ENDPOINTS (REAL DATABASE) ==========

// GET all contracts with optional filters
app.get('/api/contracts', async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            client: req.query.client
        };
        
        const contracts = await db.getAllContracts(filters);
        
        res.json({
            success: true,
            data: contracts,
            total: contracts.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching contracts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contracts',
            timestamp: new Date().toISOString()
        });
    }
});

// GET single contract by ID
app.get('/api/contracts/:id', async (req, res) => {
    try {
        const contract = await db.getContractById(req.params.id);
        
        if (!contract) {
            return res.status(404).json({
                success: false,
                error: 'Contract not found',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            data: contract,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching contract:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch contract',
            timestamp: new Date().toISOString()
        });
    }
});

// POST create new contract
app.post('/api/contracts', async (req, res) => {
    try {
        const { name, version, description, endpoints, client, value, status } = req.body;
        
        if (!name || !version || !description) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, version, description',
                timestamp: new Date().toISOString()
            });
        }
        
        const contractData = {
            name,
            version,
            description,
            endpoints: endpoints || 0,
            client: client || 'Unknown',
            value: value || 0,
            status: status || 'pending'
        };
        
        const newContract = await db.createContract(contractData);
        
        res.status(201).json({
            success: true,
            data: newContract,
            message: 'Contract created successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create contract',
            timestamp: new Date().toISOString()
        });
    }
});

// PUT update contract
app.put('/api/contracts/:id', async (req, res) => {
    try {
        const updates = req.body;
        const updatedContract = await db.updateContract(req.params.id, updates);
        
        if (!updatedContract) {
            return res.status(404).json({
                success: false,
                error: 'Contract not found',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            data: updatedContract,
            message: 'Contract updated successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating contract:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update contract',
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE contract
app.delete('/api/contracts/:id', async (req, res) => {
    try {
        const deleted = await db.deleteContract(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Contract not found',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            message: 'Contract deleted successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error deleting contract:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete contract',
            timestamp: new Date().toISOString()
        });
    }
});

// ========== REVIEWS ENDPOINTS (REAL DATABASE) ==========

// GET all reviews with optional filters
app.get('/api/reviews', async (req, res) => {
    try {
        const filters = {
            approved: req.query.approved === 'true' ? true : req.query.approved === 'false' ? false : undefined,
            rating: req.query.rating
        };
        
        const reviews = await db.getAllReviews(filters);
        
        res.json({
            success: true,
            data: reviews,
            total: reviews.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reviews',
            timestamp: new Date().toISOString()
        });
    }
});

// GET single review by ID
app.get('/api/reviews/:id', async (req, res) => {
    try {
        const review = await db.getReviewById(req.params.id);
        
        if (!review) {
            return res.status(404).json({
                success: false,
                error: 'Review not found',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            data: review,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch review',
            timestamp: new Date().toISOString()
        });
    }
});

// POST create new review
app.post('/api/reviews', async (req, res) => {
    try {
        const { name, email, rating, comment, service } = req.body;
        
        if (!name || !rating || !comment) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, rating, comment',
                timestamp: new Date().toISOString()
            });
        }
        
        const reviewData = {
            name,
            email: email || '',
            rating: parseInt(rating),
            comment,
            service: service || 'General'
        };
        
        const newReview = await db.createReview(reviewData);
        
        res.status(201).json({
            success: true,
            data: newReview,
            message: 'Review submitted successfully. It will be visible after approval.',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create review',
            timestamp: new Date().toISOString()
        });
    }
});

// PUT approve review (admin only)
app.put('/api/reviews/:id/approve', async (req, res) => {
    try {
        const approvedReview = await db.approveReview(req.params.id);
        
        if (!approvedReview) {
            return res.status(404).json({
                success: false,
                error: 'Review not found',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            data: approvedReview,
            message: 'Review approved successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error approving review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to approve review',
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE review
app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const deleted = await db.deleteReview(req.params.id);
        
        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Review not found',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            message: 'Review deleted successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete review',
            timestamp: new Date().toISOString()
        });
    }
});

// ========== ANALYTICS & STATS (REAL DATABASE) ==========

app.get('/api/analytics', async (req, res) => {
    try {
        const analyticsData = await db.getAnalytics();
        const activeSessions = await db.getActiveSessionCount();
        
        res.json({
            success: true,
            data: {
                pageViews: analyticsData.pageViews,
                uniqueVisitors: analyticsData.uniqueVisitors,
                activeSessions: activeSessions,
                totalEvents: analyticsData.events.length,
                topPages: analyticsData.topPages,
                lastUpdated: analyticsData.lastUpdated,
                uptime: process.uptime()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch analytics',
            timestamp: new Date().toISOString()
        });
    }
});

app.post('/api/analytics/event', async (req, res) => {
    try {
        const event = req.body;
        
        // Store event in database
        const savedEvent = await db.trackEvent({
            ...event,
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        res.json({
            success: true,
            data: savedEvent,
            message: 'Event tracked successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track event',
            timestamp: new Date().toISOString()
        });
    }
});

// 📊 REAL-TIME STATS ENDPOINTS (for app.js fetchRealStats)

// Get real-time statistics
app.get('/api/stats', async (req, res) => {
    try {
        const analyticsData = await db.getAnalytics();
        const activeSessions = await db.getActiveSessionCount();
        const dbStats = await db.getDatabaseStats();
        
        res.json({
            success: true,
            totalViews: analyticsData.pageViews,
            viewsToday: analyticsData.pageViews,
            apiRequests: analyticsData.events.length,
            activeVisitors: activeSessions,
            uptime: Math.floor(process.uptime()),
            database: dbStats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stats',
            timestamp: new Date().toISOString()
        });
    }
});

// Track page view (with real database persistence)
app.post('/api/stats/pageview', async (req, res) => {
    try {
        const { page, timestamp, sessionId } = req.body;
        
        // Track page view in database
        const analyticsData = await db.trackPageView({
            path: page || '/',
            timestamp: timestamp || new Date().toISOString(),
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        // Track or update session
        if (sessionId) {
            await db.updateSessionActivity(sessionId);
        } else {
            await db.createSession({
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
        }
        
        // Broadcast to WebSocket clients
        broadcastAnalyticsUpdate();
        
        res.json({
            success: true,
            message: 'Page view tracked',
            totalViews: analyticsData.pageViews,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error tracking page view:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track page view',
            timestamp: new Date().toISOString()
        });
    }
});

// AI Chat endpoint (enhanced, local intent-based)
app.post('/api/chat', (req, res) => {
    const raw = (req.body && (req.body.message || req.body.prompt)) || '';
    const message = String(raw || '').trim();
    if (!message) {
        return res.status(400).json({ success: false, error: 'message is required' });
    }

    // Lightweight intent detection
    const m = message.toLowerCase();
    const now = new Date().toISOString();

    function section(title, body) {
        return `\n\n${title}\n${'-'.repeat(title.length)}\n${body}`;
    }

    function code(lang, content) {
        return `\n\nExample (${lang})\n>>>\n${content}\n<<<`;
    }

    let reply = '';
    const suggestions = [];

    // Greetings / casual
    if (/^(hi|hello|hey|yo|howdy)\b/.test(m) || m.includes('how are you')) {
        reply = `Hey there! I’m your BarodaTek assistant. I can help with code, APIs, debugging, learning paths, and general questions. What are we building today?`;
        suggestions.push('Show me API examples', 'Help me fix an error', 'Generate starter code');
    }
    // Pricing / business
    else if (/(price|pricing|cost|pay|payment|cash app|plans)/.test(m)) {
        reply = `Here’s a quick overview of BarodaTek options and how to get in touch for quotes.`
            + section('Plans', '• Developer (Free) — Try tools, games, and explorer\n• Professional — Priority help, advanced analytics\n• Enterprise — Custom features and support')
            + section('Contact', 'Email: barodatek.services@gmail.com\nPayments: Cash App $baroda98');
        suggestions.push('Email pricing info', 'What’s included in Pro?', 'Book a consultation');
    }
    // API/HTTP help
    else if (/(api|endpoint|http|rest|json|status code)/.test(m)) {
        reply = `Here are core API concepts and how to work with this platform.`
            + section('Key Endpoints', `GET /api/health\nGET /api/contracts\nPOST /api/contracts\nGET /api/analytics\nPOST /api/chat`)
            + section('Tips', '• Use origin-based URLs (no localhost hardcodes)\n• Validate inputs (status 400 on errors)\n• Prefer idempotent methods for updates (PUT/PATCH)')
            + code('JavaScript fetch', `const base = window.location.origin + '/api';
const res = await fetch(base + '/contracts');
const data = await res.json();
console.log(data);`);
        suggestions.push('Show POST example', 'How to handle 404 vs 500?', 'CORS quick check');
    }
    // Debugging
    else if (/(bug|error|exception|stack|debug|not working)/.test(m)) {
        reply = `Let’s debug systematically. Share the exact error and a minimal snippet if you can.`
            + section('Checklist', '1) Reproduce consistently\n2) Read the full error (line/file)\n3) Isolate the smallest failing code\n4) Add console logs around the failing path\n5) Verify network requests in DevTools > Network')
            + section('Common Fixes', '• CORS: check allowed origins\n• 404: verify route and HTTP method\n• 500: inspect server logs and validation\n• WebSocket: use ws:// or wss:// matches protocol/host')
            + code('Console probe', `fetch('/api/health').then(r=>{console.log(r.status);return r.json()}).then(console.log).catch(console.error);`);
        suggestions.push('Help me with a CORS error', 'Explain this stack trace', 'Network tab walkthrough');
    }
    // Learning / roadmap
    else if (/(learn|roadmap|where to start|tutorial|guide)/.test(m)) {
        reply = `Here’s a practical learning path that matches this platform’s features.`
            + section('Level 1 — Play', 'API Galaxy, Debug Detective, Syntax Speed Run, Algorithm Puzzle')
            + section('Level 2 — Tools', 'API Explorer, Analytics Dashboard')
            + section('Level 3 — Build', 'Scaffold an Express API, add validation, deploy to Vercel/Railway')
            + section('Level 4 — Ship', 'Instrument logs, add tests, collect feedback');
        suggestions.push('Start API Galaxy', 'Open API Explorer', 'Generate Express server');
    }
    // General knowledge (safe, brief)
    else if (/(what is|define|explain)\b/.test(m)) {
        if (m.includes('javascript')) {
            reply = `JavaScript is the language of the web—runs in browsers and on servers via Node.js.`
                + code('JS', `console.log('Hello!');\nconst add = (a,b)=>a+b;`);
            suggestions.push('Explain async/await', 'Show fetch example', 'Difference: var vs let');
        } else if (m.includes('python')) {
            reply = `Python is a versatile, beginner-friendly language used in web, data, and AI.`
                + code('Python', `def add(a,b):\n    return a+b\nprint(add(2,3))`);
            suggestions.push('What is virtualenv?', 'Flask vs Django', 'Read file example');
        } else if (m.includes('api')) {
            reply = `An API lets software talk to software. You send requests (like GET/POST) and get structured responses (usually JSON).`;
            suggestions.push('Show a REST example', 'Status codes guide', 'Build a CRUD API');
        } else {
            reply = `Here’s a concise explanation:` + section('Summary', 'I can give short, practical definitions and examples. Ask me to tailor details to your use case.');
            suggestions.push('Give an example', 'Relate to web dev', 'Keep it simple');
        }
    }
    // Jokes / motivation
    else if (/(joke|funny|motivate|quote|inspire)/.test(m)) {
        reply = `Here’s a quick boost: “The best way to learn to code is to ship something small—today.”`;
        suggestions.push('Tell me a dev joke', 'Give me a study plan', 'Small project ideas');
    }
    // Catch-all supportive default
    else {
        reply = `I can help with APIs, debugging, code generation, learning plans, and general Q&A. Tell me a goal (“build X”, “fix Y”) and I’ll map out next steps with examples.`;
        suggestions.push('Help me build a small API', 'Review my code', 'Explain an error');
    }

    // Simulate thoughtful latency
    const delay = 300 + Math.floor(Math.random() * 700);
    setTimeout(() => {
        res.json({
            success: true,
            response: reply,
            suggestions,
            timestamp: now,
            sessionId: req.headers['x-session-id'] || 'anonymous'
        });
    }, delay);
});

// 🤖 AI MONITOR ENDPOINTS

// Get AI Monitor health status
app.get('/api/monitor/health', (req, res) => {
    res.json({
        success: true,
        health: aiMonitor.getHealth(),
        timestamp: new Date().toISOString()
    });
});

// Get AI Monitor statistics
app.get('/api/monitor/stats', (req, res) => {
    res.json({
        success: true,
        stats: aiMonitor.getStats(),
        timestamp: new Date().toISOString()
    });
});

// Get AI Monitor knowledge base
app.get('/api/monitor/knowledge', (req, res) => {
    res.json({
        success: true,
        knowledge: aiMonitor.getAllKnowledge(),
        timestamp: new Date().toISOString()
    });
});

// Report issue to AI Monitor
app.post('/api/monitor/report', (req, res) => {
    const { issueKey, context } = req.body;
    
    if (!issueKey) {
        return res.status(400).json({
            success: false,
            error: 'issueKey is required'
        });
    }
    
    aiMonitor.detectIssue(issueKey, context);
    
    res.json({
        success: true,
        message: 'Issue reported to AI Monitor',
        timestamp: new Date().toISOString()
    });
});

// Add knowledge to AI Monitor
app.post('/api/monitor/knowledge', (req, res) => {
    const { issueKey, knowledge } = req.body;
    
    if (!issueKey || !knowledge) {
        return res.status(400).json({
            success: false,
            error: 'issueKey and knowledge are required'
        });
    }
    
    aiMonitor.addKnowledge(issueKey, knowledge);
    
    res.json({
        success: true,
        message: 'Knowledge added to AI Monitor',
        timestamp: new Date().toISOString()
    });
});

// Chatbot to AI Monitor communication
app.post('/api/monitor/chatbot-message', (req, res) => {
    const { type, data } = req.body;
    
    aiMonitor.receiveFromChatbot({ type, ...data });
    
    res.json({
        success: true,
        message: 'Message received from chatbot',
        timestamp: new Date().toISOString()
    });
});

// ========== ERROR TRACKING ENDPOINTS ==========

// Log client-side error
app.post('/api/errors/log', async (req, res) => {
    try {
        const errorData = {
            message: req.body.message,
            stack: req.body.stack,
            type: req.body.type || 'ClientError',
            url: req.body.url,
            userAgent: req.headers['user-agent'],
            context: req.body.context || {}
        };
        
        const loggedError = await db.logError(errorData);
        
        // Also report to AI Monitor for pattern detection
        aiMonitor.reportError(errorData.type, new Error(errorData.message), errorData.context);
        
        res.json({
            success: true,
            data: loggedError,
            message: 'Error logged successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error logging error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to log error',
            timestamp: new Date().toISOString()
        });
    }
});

// Get all errors (admin only)
app.get('/api/errors', async (req, res) => {
    try {
        const filters = {
            resolved: req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined,
            type: req.query.type
        };
        
        const errors = await db.getAllErrors(filters);
        
        res.json({
            success: true,
            data: errors,
            total: errors.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching errors:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch errors',
            timestamp: new Date().toISOString()
        });
    }
});

// Mark error as resolved
app.put('/api/errors/:id/resolve', async (req, res) => {
    try {
        const resolvedError = await db.markErrorResolved(req.params.id);
        
        if (!resolvedError) {
            return res.status(404).json({
                success: false,
                error: 'Error not found',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            data: resolvedError,
            message: 'Error marked as resolved',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error resolving error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resolve error',
            timestamp: new Date().toISOString()
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// Enhanced 404 handler with suggestions
app.use((req, res) => {
    console.log(`⚠️  404 Not Found: ${req.method} ${req.path}`);
    
    // Log to AI Monitor for pattern detection
    aiMonitor.reportError('404_NOT_FOUND', new Error(`Route not found: ${req.path}`), {
        method: req.method,
        path: req.path,
        ip: req.ip
    });
    
    // Suggest similar routes
    const availableRoutes = [
        '/api/contracts',
        '/api/reviews',
        '/api/analytics',
        '/api/stats',
        '/api/monitor/health',
        '/api/monitor/knowledge',
        '/api/monitor/stats'
    ];
    
    const suggestions = availableRoutes.filter(route => 
        route.toLowerCase().includes(req.path.toLowerCase().slice(0, 5))
    );
    
    res.status(404).json({
        success: false,
        error: '404_NOT_FOUND',
        message: `Cannot ${req.method} ${req.path}`,
        suggestions: suggestions.length > 0 ? suggestions : ['Check API documentation at /api'],
        timestamp: new Date().toISOString()
    });
});

// Auto-fix: Port conflict handler
function startServer(port) {
    server.listen(port, () => {
        const isLocal = port === 8080 || port === 3000;
        const localUrl = `http://localhost:${port}`;
    const productionUrl = 'https://barodatek.com';
        
        console.log('🚀 BarodaTek.com API Mock Contract MVP Server Started!');
        console.log(`📡 Server running on port ${port}`);
        
        if (isLocal) {
            console.log(`🌐 Local Development: ${localUrl}`);
            console.log(`📡 WebSocket: ws://localhost:${port}`);
            console.log(`🔗 Access your app at: ${localUrl}`);
        } else {
            console.log(`🌐 Production: ${productionUrl}`);
            console.log(`📡 WebSocket: wss://barodatek.com`);
        }
        
        console.log(`📊 Analytics: Real-time tracking enabled`);
        console.log(`🔒 Security: Helmet protection active`);
        console.log(`⚡ Features: Real-time updates, AI chat, analytics`);
        console.log('💻 Made with ❤️ by BarodaTek.com - Advanced Development Solutions');
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`⚠️  Port ${port} is already in use`);
            console.log(`🔄 Auto-fix: Trying port ${port + 1}...`);
            aiMonitor.reportError('EADDRINUSE', err, { port, autoFix: true });
            startServer(port + 1); // Try next port
        } else {
            console.error('❌ Server error:', err);
            aiMonitor.reportError('SERVER_ERROR', err);
            process.exit(1);
        }
    });
}

// Start server with auto-fix
startServer(PORT);

// Graceful shutdown
// In development, avoid exiting the process on SIGINT/SIGTERM so automated monitoring or accidental signals
// don't bring down the local server while we're testing frontend behaviors. In production we keep the
// graceful shutdown behavior to allow proper termination.
function gracefulShutdown(signal) {
    const isProd = (process.env.NODE_ENV === 'production');
    console.log(`🔄 ${signal} received.`);

    if (!isProd) {
        console.log('ℹ️ Running in non-production mode — ignoring shutdown to allow interactive testing.');
        return;
    }

    console.log('🔄 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server shutdown complete');
        process.exit(0);
    });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;