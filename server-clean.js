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

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Port configuration
const PORT = process.env.PORT || 3000;

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
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:", "https:"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
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
app.use(cors());
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
    
    // Send current analytics
    ws.send(JSON.stringify({
        type: 'analytics_update',
        stats: {
            pageViews: analytics.pageViews,
            interactions: analytics.interactions,
            downloads: analytics.downloads,
            activeUsers: analytics.activeUsers
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
function handleAnalyticsEvent(data, ws) {
    if (data.type === 'analytics_event') {
        const event = data.event;
        
        // Store event
        analytics.events.push({
            ...event,
            receivedAt: Date.now()
        });
        
        // Update counters based on event type
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
        
        // Broadcast updates to all connected clients
        broadcastAnalyticsUpdate();
        
        console.log(`📊 Analytics event: ${event.type} from session ${event.sessionId}`);
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
        timestamp: Date.now()
    };
    
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(updateData));
        }
    });
}

// Mock contract data
const mockContracts = [
    {
        id: 1,
        name: "BarodaTek User Service Contract",
        version: "2.0.0",
        description: "Advanced user management and authentication service",
        endpoints: 8,
        status: "active",
        created: "2024-01-15T10:30:00Z",
        updated: "2024-10-14T06:00:00Z"
    },
    {
        id: 2,
        name: "Payment Gateway Contract",
        version: "1.5.3",
        description: "Secure payment processing and transaction management",
        endpoints: 12,
        status: "active",
        created: "2024-02-20T14:15:00Z",
        updated: "2024-09-30T16:45:00Z"
    },
    {
        id: 3,
        name: "Analytics Service Contract",
        version: "3.1.0",
        description: "Real-time analytics and reporting service",
        endpoints: 15,
        status: "active",
        created: "2024-03-10T09:20:00Z",
        updated: "2024-10-14T05:30:00Z"
    }
];

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0',
        platform: 'BarodaTek.com'
    });
});

app.get('/api/contracts', (req, res) => {
    res.json({
        success: true,
        data: mockContracts,
        total: mockContracts.length,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/contracts/:id', (req, res) => {
    const contract = mockContracts.find(c => c.id === parseInt(req.params.id));
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
});

app.post('/api/contracts', (req, res) => {
    const { name, version, description, endpoints } = req.body;
    
    if (!name || !version || !description) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: name, version, description',
            timestamp: new Date().toISOString()
        });
    }
    
    const newContract = {
        id: mockContracts.length + 1,
        name,
        version,
        description,
        endpoints: endpoints || 0,
        status: 'active',
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };
    
    mockContracts.push(newContract);
    
    res.status(201).json({
        success: true,
        data: newContract,
        message: 'Contract created successfully',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/analytics', (req, res) => {
    res.json({
        success: true,
        data: {
            pageViews: analytics.pageViews,
            interactions: analytics.interactions,
            downloads: analytics.downloads,
            activeUsers: analytics.activeUsers,
            totalEvents: analytics.events.length,
            uptime: process.uptime()
        },
        timestamp: new Date().toISOString()
    });
});

app.post('/api/analytics/event', (req, res) => {
    const event = req.body;
    
    // Store event
    analytics.events.push({
        ...event,
        receivedAt: Date.now(),
        ip: req.ip
    });
    
    // Update counters
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
    
    res.json({
        success: true,
        message: 'Event tracked successfully',
        timestamp: new Date().toISOString()
    });
});

// AI Chat endpoint (mock)
app.post('/api/chat', (req, res) => {
    const { message, context } = req.body;
    
    // Mock AI responses
    const responses = [
        "Welcome to BarodaTek.com! I'm here to help you with API development and contract management.",
        "That's a great question! Let me help you understand our API mock contract system.",
        "I can assist you with real-time features, WebSocket implementation, and best practices.",
        "For detailed documentation, check out our comprehensive API explorer and developer tools.",
        "BarodaTek.com offers cutting-edge solutions for modern web development challenges."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
        res.json({
            success: true,
            response: randomResponse,
            context: 'api_help',
            timestamp: new Date().toISOString(),
            sessionId: req.headers['x-session-id'] || 'anonymous'
        });
    }, 1000 + Math.random() * 2000); // Simulate thinking time
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

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Cannot ${req.method} ${req.path}`,
        timestamp: new Date().toISOString()
    });
});

// Start server
server.listen(PORT, () => {
    console.log('🚀 BarodaTek.com API Mock Contract MVP Server Started!');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌐 HTTP: http://localhost:${PORT}`);
    console.log(`📡 WebSocket: ws://localhost:${PORT}`);
    console.log(`📊 Analytics: Real-time tracking enabled`);
    console.log(`🔒 Security: Helmet protection active`);
    console.log(`⚡ Features: Real-time updates, AI chat, analytics`);
    console.log('💻 Made with ❤️ by BarodaTek.com - Advanced Development Solutions');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server shutdown complete');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server shutdown complete');
        process.exit(0);
    });
});

module.exports = app;