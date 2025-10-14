// 🤖 AI MONITORING SYSTEM - BarodaTek Platform
// Autonomous monitoring agent that watches site health, performance, and errors
// Communicates with chatbot AI to share knowledge and solutions

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class AIMonitor extends EventEmitter {
    constructor() {
        super();
        this.knowledgeDB = new Map(); // In-memory knowledge database
        this.issuePatterns = new Map(); // Known issue patterns
        this.activeMonitors = new Map(); // Active monitoring tasks
        this.chatbotConnection = null; // Connection to chatbot AI
        this.healthMetrics = {
            lastCheck: null,
            errors: [],
            warnings: [],
            performance: {},
            apiHealth: {},
            activeUsers: 0
        };
        
        this.initializeKnowledgeBase();
        this.startMonitoring();
        
        console.log('🤖 AI Monitor initialized and running...');
    }
    
    // Initialize with known issues and solutions
    initializeKnowledgeBase() {
        // Common Node.js/Express issues
        this.addKnowledge('EADDRINUSE', {
            type: 'error',
            description: 'Port already in use',
            solution: 'Kill process using port or use different port',
            autoFix: true,
            fixCommand: (port) => `netstat -ano | findstr :${port}`,
            prevention: 'Use PORT environment variable with fallback'
        });
        
        this.addKnowledge('CORS_ERROR', {
            type: 'error',
            description: 'Cross-Origin Resource Sharing blocked',
            solution: 'Add CORS middleware with proper origin configuration',
            autoFix: true,
            fixCode: `
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));`
        });
        
        this.addKnowledge('404_NOT_FOUND', {
            type: 'warning',
            description: 'Route not found',
            solution: 'Check route definition and URL spelling',
            autoFix: false,
            suggestion: 'Add catch-all 404 handler middleware'
        });
        
        this.addKnowledge('WEBSOCKET_DISCONNECT', {
            type: 'warning',
            description: 'WebSocket connection lost',
            solution: 'Implement reconnection logic with exponential backoff',
            autoFix: true,
            fixCode: `
function reconnectWebSocket(retries = 0) {
    const maxRetries = 5;
    const backoff = Math.min(1000 * Math.pow(2, retries), 30000);
    
    setTimeout(() => {
        ws = new WebSocket(WS_URL);
        ws.onclose = () => {
            if (retries < maxRetries) reconnectWebSocket(retries + 1);
        };
    }, backoff);
}`
        });
        
        this.addKnowledge('HIGH_MEMORY_USAGE', {
            type: 'warning',
            description: 'Memory usage exceeds 80%',
            solution: 'Check for memory leaks, optimize data structures',
            autoFix: true,
            fixAction: () => {
                if (global.gc) {
                    global.gc();
                    return 'Forced garbage collection';
                }
                return 'Enable --expose-gc flag to allow manual GC';
            }
        });
        
        this.addKnowledge('SLOW_API_RESPONSE', {
            type: 'performance',
            description: 'API response time > 2 seconds',
            solution: 'Add caching, optimize database queries, use indexes',
            autoFix: false,
            suggestion: 'Implement Redis caching for frequently accessed data'
        });
        
        console.log(`✅ Knowledge base initialized with ${this.knowledgeDB.size} known issues`);
    }
    
    // Add knowledge to database
    addKnowledge(issueKey, data) {
        this.knowledgeDB.set(issueKey, {
            ...data,
            addedAt: new Date(),
            timesEncountered: 0,
            lastSeen: null
        });
    }
    
    // Get knowledge from database
    getKnowledge(issueKey) {
        return this.knowledgeDB.get(issueKey);
    }
    
    // Start all monitoring tasks
    startMonitoring() {
        // Monitor every 10 seconds
        this.activeMonitors.set('health', setInterval(() => {
            this.checkSystemHealth();
        }, 10000));
        
        // Performance monitoring every 30 seconds
        this.activeMonitors.set('performance', setInterval(() => {
            this.checkPerformance();
        }, 30000));
        
        // Log analysis every 60 seconds
        this.activeMonitors.set('logs', setInterval(() => {
            this.analyzeLogs();
        }, 60000));
        
        console.log('🔍 Started 3 monitoring tasks');
    }
    
    // Check system health
    checkSystemHealth() {
        const memoryUsage = process.memoryUsage();
        const memPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
        
        this.healthMetrics.lastCheck = new Date();
        this.healthMetrics.performance.memory = {
            used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            percent: Math.round(memPercent)
        };
        
        // Check for high memory usage
        if (memPercent > 80) {
            this.detectIssue('HIGH_MEMORY_USAGE', {
                current: memPercent,
                threshold: 80
            });
        }
        
        // Check uptime
        this.healthMetrics.performance.uptime = process.uptime();
        
        // Emit health update
        this.emit('health-update', this.healthMetrics);
    }
    
    // Check performance metrics
    checkPerformance() {
        const cpuUsage = process.cpuUsage();
        
        this.healthMetrics.performance.cpu = {
            user: Math.round(cpuUsage.user / 1000),
            system: Math.round(cpuUsage.system / 1000)
        };
        
        // Check for performance issues
        if (cpuUsage.user > 500000) {
            this.detectIssue('HIGH_CPU_USAGE', {
                current: cpuUsage.user,
                threshold: 500000
            });
        }
    }
    
    // Analyze error logs
    analyzeLogs() {
        // This would integrate with your logging system
        // For now, we'll check if error log file exists
        const errorLogPath = path.join(__dirname, 'logs', 'error.log');
        
        if (fs.existsSync(errorLogPath)) {
            fs.readFile(errorLogPath, 'utf8', (err, data) => {
                if (err) return;
                
                const lines = data.split('\n').filter(l => l.trim());
                const recentErrors = lines.slice(-10);
                
                recentErrors.forEach(errorLine => {
                    this.analyzeError(errorLine);
                });
            });
        }
    }
    
    // Analyze individual error
    analyzeError(errorMessage) {
        // Check against known patterns
        for (const [key, knowledge] of this.knowledgeDB.entries()) {
            if (errorMessage.includes(key)) {
                this.detectIssue(key, { errorMessage });
                break;
            }
        }
    }
    
    // Detect and handle issue
    detectIssue(issueKey, context = {}) {
        const knowledge = this.getKnowledge(issueKey);
        
        if (!knowledge) {
            // Unknown issue - learn about it
            this.learnNewIssue(issueKey, context);
            return;
        }
        
        // Update stats
        knowledge.timesEncountered++;
        knowledge.lastSeen = new Date();
        
        console.log(`⚠️  Detected: ${issueKey} - ${knowledge.description}`);
        console.log(`💡 Solution: ${knowledge.solution}`);
        
        // Try auto-fix if enabled
        if (knowledge.autoFix) {
            this.attemptAutoFix(issueKey, knowledge, context);
        }
        
        // Send notification
        this.sendNotification({
            type: knowledge.type,
            issue: issueKey,
            description: knowledge.description,
            solution: knowledge.solution,
            autoFixed: knowledge.autoFix,
            context
        });
        
        // Share with chatbot
        this.shareToChatbot({
            type: 'issue-detected',
            issue: issueKey,
            knowledge
        });
    }
    
    // Learn about new issue
    learnNewIssue(issueKey, context) {
        console.log(`🧠 Learning new issue: ${issueKey}`);
        
        // Add to knowledge base for future reference
        this.addKnowledge(issueKey, {
            type: 'unknown',
            description: `New issue detected: ${issueKey}`,
            solution: 'Investigating...',
            autoFix: false,
            context: JSON.stringify(context),
            needsResearch: true
        });
        
        // Request help from chatbot AI
        this.shareToChatbot({
            type: 'unknown-issue',
            issue: issueKey,
            context,
            needsHelp: true
        });
    }
    
    // Attempt to auto-fix issue
    attemptAutoFix(issueKey, knowledge, context) {
        console.log(`🔧 Attempting auto-fix for: ${issueKey}`);
        
        try {
            if (knowledge.fixAction && typeof knowledge.fixAction === 'function') {
                const result = knowledge.fixAction(context);
                console.log(`✅ Auto-fix applied: ${result}`);
                
                this.sendNotification({
                    type: 'success',
                    message: `Auto-fixed: ${issueKey}`,
                    details: result
                });
            } else if (knowledge.fixCommand) {
                console.log(`📋 Run this command: ${knowledge.fixCommand}`);
            } else if (knowledge.fixCode) {
                console.log(`📋 Apply this code:\n${knowledge.fixCode}`);
            }
        } catch (error) {
            console.error(`❌ Auto-fix failed for ${issueKey}:`, error.message);
        }
    }
    
    // Send notification to separate dashboard
    sendNotification(notification) {
        notification.timestamp = new Date();
        
        // Add to health metrics
        if (notification.type === 'error') {
            this.healthMetrics.errors.push(notification);
        } else if (notification.type === 'warning') {
            this.healthMetrics.warnings.push(notification);
        }
        
        // Keep only last 50 entries
        this.healthMetrics.errors = this.healthMetrics.errors.slice(-50);
        this.healthMetrics.warnings = this.healthMetrics.warnings.slice(-50);
        
        // Emit event for dashboard
        this.emit('notification', notification);
        
        // Log to file
        this.logNotification(notification);
    }
    
    // Log notification to file
    logNotification(notification) {
        const logDir = path.join(__dirname, 'logs', 'ai-monitor');
        const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
        
        // Create directory if doesn't exist
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        const logEntry = `[${notification.timestamp.toISOString()}] ${notification.type.toUpperCase()}: ${JSON.stringify(notification)}\n`;
        
        fs.appendFile(logFile, logEntry, (err) => {
            if (err) console.error('Failed to write log:', err);
        });
    }
    
    // Share knowledge with chatbot AI
    shareToChatbot(data) {
        // This would integrate with your chatbot system
        // For now, we'll emit an event that can be listened to
        this.emit('chatbot-message', data);
        
        console.log(`💬 Shared with chatbot:`, data.type);
    }
    
    // Receive knowledge from chatbot
    receiveFromChatbot(data) {
        console.log(`📥 Received from chatbot:`, data.type);
        
        if (data.type === 'solution' && data.issue) {
            // Update knowledge base with chatbot's solution
            const existing = this.getKnowledge(data.issue);
            if (existing) {
                existing.solution = data.solution;
                existing.chatbotContribution = true;
                console.log(`✅ Updated ${data.issue} with chatbot solution`);
            }
        } else if (data.type === 'new-knowledge') {
            // Add new knowledge from chatbot
            this.addKnowledge(data.issue, data.knowledge);
            console.log(`✅ Added new knowledge: ${data.issue}`);
        }
    }
    
    // Get current health metrics
    getHealth() {
        return this.healthMetrics;
    }
    
    // Get all knowledge
    getAllKnowledge() {
        return Array.from(this.knowledgeDB.entries()).map(([key, value]) => ({
            issue: key,
            ...value
        }));
    }
    
    // Get statistics
    getStats() {
        return {
            knowledgeBaseSize: this.knowledgeDB.size,
            activeMonitors: this.activeMonitors.size,
            totalErrors: this.healthMetrics.errors.length,
            totalWarnings: this.healthMetrics.warnings.length,
            uptime: process.uptime(),
            memory: this.healthMetrics.performance.memory
        };
    }
    
    // Stop monitoring
    stop() {
        for (const [name, interval] of this.activeMonitors.entries()) {
            clearInterval(interval);
            console.log(`🛑 Stopped ${name} monitor`);
        }
        this.activeMonitors.clear();
        console.log('🤖 AI Monitor stopped');
    }
}

// Export singleton instance
module.exports = new AIMonitor();
