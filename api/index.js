// Vercel Serverless API Entry Point for Champions Arena
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Security & parsing middleware
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory analytics and error tracking state (persists per serverless container)
const analyticsState = global.analyticsState || (global.analyticsState = {
    totalViews: 0,
    viewsToday: 0,
    apiRequests: 0,
    activeVisitors: new Set(),
    lastReset: new Date().toISOString(),
});

const errorLog = global.errorLog || (global.errorLog = []);

const resetDailyCountersIfNeeded = () => {
    const now = new Date();
    const lastReset = new Date(analyticsState.lastReset);
    if (lastReset.toDateString() !== now.toDateString()) {
        analyticsState.viewsToday = 0;
        analyticsState.activeVisitors.clear();
        analyticsState.lastReset = now.toISOString();
    }
};

// Health check endpoint - optimized for serverless
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        success: true,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        version: '2.0.0',
        platform: 'Champions Arena - BarodaTek.com',
        service: 'Champions Arena AI Assistant',
        serverless: true
    });
});

// Mock Contracts endpoint for dev tools
app.get('/api/contracts', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Contracts API - Demo Mode',
        data: [
            {
                id: 'contract_001',
                title: 'Website Development Contract',
                client: 'BarodaTek',
                provider: 'Dev Team Alpha',
                amount: 5000,
                status: 'active',
                createdDate: '2025-10-01',
                expiryDate: '2025-12-31'
            },
            {
                id: 'contract_002',
                title: 'API Integration Project',
                client: 'Champions Arena',
                provider: 'API Solutions Inc',
                amount: 3500,
                status: 'pending',
                createdDate: '2025-10-10',
                expiryDate: '2025-11-30'
            }
        ],
        count: 2,
        serverless: true
    });
});

// Mock contract creation
app.post('/api/contracts', (req, res) => {
    const contract = req.body;
    res.status(201).json({
        success: true,
        message: 'Contract created successfully (Demo Mode)',
        data: {
            id: 'contract_' + Date.now(),
            ...contract,
            createdDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        },
        serverless: true
    });
});

// Mock analytics endpoint
app.get('/api/analytics', (req, res) => {
    res.status(200).json({
        success: true,
        data: {
            responseTime: Math.floor(Math.random() * 150) + 50,
            requestsPerMinute: Math.floor(Math.random() * 10) + 1,
            successRate: 99.0 + (Math.random() * 0.9),
            activeConnections: Math.floor(Math.random() * 20) + 5,
            uptime: '99.9%',
            totalRequests: Math.floor(Math.random() * 10000) + 50000
        },
        serverless: true
    });
});

// Lightweight real stats endpoint used by the dashboard
app.get('/api/stats', (req, res) => {
    resetDailyCountersIfNeeded();
    analyticsState.apiRequests += 1;

    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    if (sessionId) {
        analyticsState.activeVisitors.add(sessionId);
    }

    res.status(200).json({
        success: true,
        totalViews: analyticsState.totalViews,
        viewsToday: analyticsState.viewsToday,
        apiRequests: analyticsState.apiRequests,
        activeVisitors: Math.max(analyticsState.activeVisitors.size || 0, 1),
        lastUpdated: new Date().toISOString(),
        serverless: true
    });
});

// Monitoring status endpoint
app.get('/api/monitoring/status', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'operational',
        timestamp: new Date().toISOString(),
        metrics: {
            uptime: '99.9%',
            responseTime: Math.floor(Math.random() * 100) + 20,
            errorRate: (Math.random() * 0.5).toFixed(2) + '%',
            activeRequests: Math.floor(Math.random() * 50)
        },
        serverless: true
    });
});

// Record a page view
app.get('/api/stats/pageview', (req, res) => {
    resetDailyCountersIfNeeded();

    const sessionId = req.headers['x-session-id'] || req.query.sessionId;
    if (sessionId) {
        analyticsState.activeVisitors.add(sessionId);
    }

    res.status(200).json({
        success: true,
        totals: {
            totalViews: analyticsState.totalViews,
            viewsToday: analyticsState.viewsToday,
            activeVisitors: analyticsState.activeVisitors.size || 0
        },
        lastUpdated: new Date().toISOString(),
        serverless: true
    });
});

app.post('/api/stats/pageview', (req, res) => {
    resetDailyCountersIfNeeded();
    analyticsState.totalViews += 1;
    analyticsState.viewsToday += 1;

    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || req.ip;
    if (sessionId) {
        analyticsState.activeVisitors.add(sessionId);
    }

    res.status(201).json({
        success: true,
        message: 'Page view recorded',
        totals: {
            totalViews: analyticsState.totalViews,
            viewsToday: analyticsState.viewsToday,
            activeVisitors: analyticsState.activeVisitors.size
        },
        serverless: true
    });
});

// Client error logging endpoint
app.post('/api/errors/log', (req, res) => {
    const errorId = 'err_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const payload = {
        id: errorId,
        message: req.body?.message || 'Unknown error',
        type: req.body?.type || 'ClientError',
        stack: req.body?.stack || null,
        url: req.body?.url || null,
        context: req.body?.context || {},
        userAgent: req.body?.userAgent || req.headers['user-agent'],
        receivedAt: new Date().toISOString()
    };

    errorLog.unshift(payload);

    // Keep only recent 100 entries to avoid unbounded growth
    if (errorLog.length > 100) {
        errorLog.length = 100;
    }

    res.status(201).json({
        success: true,
        message: 'Error logged',
        id: errorId,
        serverless: true
    });
});

// AI Chat endpoint with basic intent handling
app.post('/api/chat', (req, res) => {
    const message = (req.body?.message || req.body?.prompt || '').trim();
    
    if (!message) {
        return res.status(400).json({
            success: false,
            error: 'Message is required'
        });
    }

    const m = message.toLowerCase();
    let reply = '';
    const suggestions = [];

    // Basic intent detection
    if (/^(hi|hello|hey|yo|howdy)\b/.test(m) || m.includes('how are you')) {
        reply = `Hey there! I'm your BarodaTek Champions Arena assistant. I can help with code, APIs, debugging, and learning. What can I help you build today?`;
        suggestions.push('Show me API examples', 'Help me debug', 'Generate starter code');
    } else if (/(price|pricing|cost|pay|payment)/.test(m)) {
        reply = `Here's info about BarodaTek services:\n\n• Developer (Free) — Try tools and games\n• Professional — Priority support\n• Enterprise — Custom features\n\nContact: barodatek.services@gmail.com\nPayments: Cash App $baroda98`;
        suggestions.push('Email pricing info', 'What\'s in Pro?');
    } else if (/(api|endpoint|http|rest)/.test(m)) {
        reply = `Available API endpoints:\n\nGET /api/health - Health check\nGET /api/contracts - List contracts\nPOST /api/contracts - Create contract\nGET /api/analytics - Analytics data\nPOST /api/chat - AI chat\nPOST /api/generate - Code generation\nGET /api/games/questions - Game questions`;
        suggestions.push('Show POST example', 'How to handle errors?');
    } else if (/(bug|error|debug|not working)/.test(m)) {
        reply = `Let's debug! Check:\n\n1. Console for errors\n2. Network tab for failed requests\n3. Response status codes\n4. CORS issues\n5. Request payload format\n\nShare the error message for specific help.`;
        suggestions.push('CORS help', 'Explain this error');
    } else {
        reply = `I can help with: code generation, debugging, API usage, learning paths, and general questions. Try asking something specific!`;
        suggestions.push('Generate a function', 'Explain REST APIs', 'Help me debug');
    }

    res.status(200).json({
        success: true,
        message: reply,
        suggestions,
        timestamp: new Date().toISOString(),
        serverless: true
    });
});

// Code generation endpoint
app.post('/api/generate', (req, res) => {
    const prompt = (req.body?.prompt || req.body?.message || '').trim();
    
    if (!prompt) {
        return res.status(400).json({
            success: false,
            error: 'Prompt is required'
        });
    }

    // Basic code template generation
    const p = prompt.toLowerCase();
    let code = '';
    let language = 'javascript';
    let explanation = '';

    if (/(express|server|api)/.test(p)) {
        language = 'javascript';
        code = `const express = require('express');
const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;
        explanation = 'Basic Express.js API server with health check endpoint';
    } else if (/(react|component)/.test(p)) {
        language = 'javascript';
        code = `import React, { useState } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default MyComponent;`;
        explanation = 'Basic React component with state management';
    } else if (/(function|utility)/.test(p)) {
        language = 'javascript';
        code = `function processData(input) {
  if (!input) {
    throw new Error('Input is required');
  }
  
  // Your logic here
  const result = input.toString().toUpperCase();
  
  return result;
}

// Usage
try {
  const output = processData('hello');
  console.log(output); // HELLO
} catch (error) {
  console.error(error.message);
}`;
        explanation = 'Utility function template with error handling';
    } else {
        code = `// Generated code for: ${prompt}

function solution() {
  // TODO: Implement your logic here
  console.log('Implement me!');
}

solution();`;
        explanation = 'Basic code template - customize for your needs';
    }

    res.status(200).json({
        success: true,
        code,
        language,
        explanation,
        prompt,
        timestamp: new Date().toISOString(),
        serverless: true
    });
});

// Game questions endpoint
app.get('/api/games/questions', (req, res) => {
    const gameType = req.query.type || 'general';
    
    const questions = {
        'api-galaxy': [
            {
                id: 1,
                question: 'What HTTP status code indicates a successful GET request?',
                options: ['200', '201', '204', '400'],
                correctAnswer: 0,
                hint: 'Think of the most common success code',
                explanation: '200 OK is the standard response for successful HTTP requests'
            },
            {
                id: 2,
                question: 'What does REST stand for?',
                options: ['Random Endpoint Service Tool', 'Representational State Transfer', 'Remote Execution State Transfer', 'Resource Endpoint Standard Transfer'],
                correctAnswer: 1,
                hint: 'It\'s about representing state',
                explanation: 'REST = Representational State Transfer, an architectural style for APIs'
            },
            {
                id: 3,
                question: 'Which HTTP method is idempotent?',
                options: ['POST', 'PUT', 'PATCH', 'All of the above'],
                correctAnswer: 1,
                hint: 'Which method gives the same result no matter how many times you call it?',
                explanation: 'PUT is idempotent - multiple identical requests have the same effect as a single request'
            }
        ],
        'debug-detective': [
            {
                id: 1,
                question: 'What causes "Cannot read property of undefined"?',
                options: ['Syntax error', 'Trying to access a property on undefined/null', 'Network error', 'CORS issue'],
                correctAnswer: 1,
                hint: 'Check if the object exists before accessing properties',
                explanation: 'This error occurs when you try to access a property on an undefined or null value'
            },
            {
                id: 2,
                question: 'How do you debug CORS errors?',
                options: ['Disable CORS', 'Check Access-Control-Allow-Origin header', 'Use POST instead of GET', 'Clear cache'],
                correctAnswer: 1,
                hint: 'Server must explicitly allow your origin',
                explanation: 'CORS errors are fixed by ensuring the server sends proper Access-Control-Allow-Origin headers'
            }
        ],
        'syntax-speedrun': [
            {
                id: 1,
                question: 'Fix the syntax: const x = [1, 2, 3; console.log(x);',
                options: ['Change ; to ]', 'Remove const', 'Add return', 'Change [ to ('],
                correctAnswer: 0,
                hint: 'Arrays need closing brackets',
                explanation: 'Missing closing bracket ] for array literal'
            }
        ],
        'algorithm-puzzle': [
            {
                id: 1,
                question: 'What is the time complexity of binary search?',
                options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
                correctAnswer: 1,
                hint: 'It divides the search space in half each time',
                explanation: 'Binary search has O(log n) time complexity because it halves the search space with each comparison'
            }
        ]
    };

    const selectedQuestions = questions[gameType] || questions['api-galaxy'];

    res.status(200).json({
        success: true,
        gameType,
        questions: selectedQuestions,
        count: selectedQuestions.length,
        serverless: true
    });
});

// Live demo endpoint
app.post('/api/demo', (req, res) => {
    const { code, language } = req.body;

    if (!code) {
        return res.status(400).json({
            success: false,
            error: 'Code is required'
        });
    }

    // For security, we can't execute arbitrary code in serverless
    // Return a mock execution result
    res.status(200).json({
        success: true,
        message: 'Demo execution completed',
        output: '// Code execution simulation\n// In production, this would run in a sandboxed environment\n\nConsole output:\n> Code executed successfully\n> No errors detected',
        executionTime: Math.floor(Math.random() * 100) + 20 + 'ms',
        language: language || 'javascript',
        warning: 'This is a simulated execution. Real code execution requires a sandboxed environment.',
        serverless: true
    });
});

// API Explorer test endpoint
app.post('/api/explorer/test', (req, res) => {
    const { method, endpoint, body, headers } = req.body;

    if (!method || !endpoint) {
        return res.status(400).json({
            success: false,
            error: 'Method and endpoint are required'
        });
    }

    // Simulate API testing
    res.status(200).json({
        success: true,
        message: 'Test executed successfully',
        request: {
            method,
            endpoint,
            body,
            headers
        },
        response: {
            status: 200,
            data: { message: 'Mock response from tested endpoint' },
            responseTime: Math.floor(Math.random() * 150) + 30 + 'ms'
        },
        serverless: true
    });
});

// Handle all other API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        endpoint: req.path,
        method: req.method,
        availableEndpoints: [
            'GET /api/health',
            'GET /api/contracts',
            'POST /api/contracts',
            'GET /api/analytics',
            'GET /api/stats',
            'GET /api/stats/pageview',
            'GET /api/monitoring/status',
            'POST /api/chat',
            'POST /api/generate',
            'GET /api/games/questions',
            'POST /api/demo',
            'POST /api/stats/pageview',
            'POST /api/errors/log',
            'POST /api/explorer/test'
        ]
    });
});

// Export for Vercel serverless
module.exports = app;
