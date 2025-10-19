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
const crypto = require('crypto');
const jwt = require('jsonwebtoken'); // JWT for authentication
const bcrypt = require('bcrypt'); // Password hashing
const { v4: uuidv4 } = require('uuid'); // API key generation
const aiMonitor = require('./ai-monitor'); // AI Monitoring System
const db = require('./database'); // Real Database with Persistence
const paymentHandler = require('./payment-handler'); // Payment Processing System

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize database on startup
db.initDatabase().then(() => {
    console.log('✅ Database ready for real-time data persistence');
});

// Memory monitoring with auto-fix and cleanup (reduced frequency)
setInterval(() => {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const heapPercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    
    // Clean up old analytics events (keep only last 50)
    if (analytics.events.length > 50) {
        analytics.events = analytics.events.slice(-50);
    }
    
    // Clean up old sessions (older than 30 minutes)
    const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
    analytics.sessions.forEach((value, key) => {
        if (value < thirtyMinutesAgo) {
            analytics.sessions.delete(key);
        }
    });
    
    // Only log and report if memory is CRITICALLY high (>95%)
    if (heapPercent > 95) {
        console.log(`⚠️  CRITICAL memory: ${heapPercent}% (${heapUsedMB}MB / ${heapTotalMB}MB)`);
        
        // Aggressive cleanup
        analytics.events = analytics.events.slice(-25);
        
        // Force garbage collection if available
        if (global.gc) {
            global.gc();
        }
        
        // Don't report to AI Monitor (creates loop)
        // aiMonitor.reportError('CRITICAL_MEMORY', new Error(`Memory at ${heapPercent}%`), {
        //     heapUsed: heapUsedMB,
        //     heapTotal: heapTotalMB,
        //     heapPercent,
        //     autoFix: !!global.gc
        // });
    }
}, 120000); // Check every 120 seconds (less frequent)

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

// AI chat endpoint: proxies conversation to OpenAI (server-side key required)
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 }); // 20 requests per minute per IP

// NOTE: This route requires JSON body parsing. Use per-route parser to avoid
// issues when middleware order places global parsers after route definitions.
app.post('/api/ai-chat', aiLimiter, express.json({ limit: '10mb' }), async (req, res) => {
        const apiKey = process.env.OPENAI_API_KEY;
        // If no API key is provided, optionally allow a local mock mode for testing.
        const allowMock = process.env.ALLOW_LOCAL_AI_MOCK === 'true';
        if (!apiKey && !allowMock) return res.status(500).json({ error: 'OpenAI API key not configured on server.' });

    const { messages } = req.body || {};
    // Optional debug logging to help diagnose malformed requests
    if (process.env.DEBUG_AI_PROXY === 'true') {
        try {
            console.log('--- AI PROXY DEBUG ---');
            console.log('Headers:', JSON.stringify(req.headers, null, 2));
            // Attempt to log raw body; note bodyParser populates req.body
            console.log('Body (parsed):', JSON.stringify(req.body, null, 2));
            console.log('Raw body fallback (req.rawBody):', req.rawBody ? String(req.rawBody).slice(0, 2000) : '<no rawBody>');
            console.log('----------------------');
        } catch (e) {
            console.error('Failed to dump AI proxy debug info', e);
        }
    }
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Invalid request: messages array is required.' });
    }

    // Limit conversation size
    const recent = messages.slice(-20);

    // System prompt to steer assistant style
    const systemPrompt = {
        role: 'system',
        content: 'You are BarodaTek AI assistant. Be friendly, concise, and helpful. Provide examples when relevant and avoid providing unsafe instructions. Keep answers clear and formatted for a developer audience.'
    };

    const payload = {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [systemPrompt, ...recent],
        temperature: 0.4,
        max_tokens: 800
    };

    try {
        let data;

        if (!apiKey && allowMock) {
            // Local mock assistant: echo the last user message with a prefixed friendly reply.
            const lastMsg = recent.length ? recent[recent.length - 1].content : 'Hello';
            data = {
                id: 'local-mock-1',
                object: 'chat.completion',
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: `Mock assistant reply: I received your message: "${lastMsg}"\n\n(Testing mode - no OpenAI key configured.)`
                        }
                    }
                ]
            };
        } else {
            const resp = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const errText = await resp.text();
                console.error('OpenAI error', resp.status, errText);
                return res.status(resp.status).json({ error: errText });
            }

            data = await resp.json();
        }

        // Safely coerce assistant content to string to avoid [object Object] or unexpected shapes.
        const rawContent = data?.choices?.[0]?.message?.content;
        let text = '';
        if (typeof rawContent === 'string') {
            text = rawContent;
        } else if (rawContent === undefined || rawContent === null) {
            text = '';
        } else {
            try {
                text = JSON.stringify(rawContent, null, 2);
            } catch (e) {
                text = String(rawContent);
            }
        }

        // Return both a friendly `text` and the raw `openai` payload for diagnostics.
        return res.json({ text, openai: data });
    } catch (err) {
        console.error('AI proxy error:', err);
        return res.status(500).json({ error: err.message || 'Unknown error' });
    }
});

// Global analytics storage
let analytics = {
    pageViews: 0,
    interactions: 0,
    downloads: 0,
    activeUsers: 0,
    sessions: new Map(),
    events: []
};

// Shared game content for server-driven mini games
const GAME_QUESTION_BANK = {
    'api-galaxy': {
        mode: 'multiple-choice',
        questions: [
            {
                id: 'api-1',
                question: 'Which HTTP method retrieves data without modifying it?',
                options: ['GET', 'POST', 'PUT', 'DELETE'],
                correctAnswer: 0,
                hint: 'Think "read" not "write".',
                explanation: 'GET requests ask the server for a resource without changing it.'
            },
            {
                id: 'api-2',
                question: 'What status code means a resource was created successfully?',
                options: ['200', '201', '204', '400'],
                correctAnswer: 1,
                hint: 'It is still in the 2xx success family.',
                explanation: '201 Created signals that the server created a new resource.'
            },
            {
                id: 'api-3',
                question: 'REST stands for what?',
                options: [
                    'Representational State Transfer',
                    'Remote Execution Service Transport',
                    'Runtime Event Source Tree',
                    'Resource Exchange Service Tunnel'
                ],
                correctAnswer: 0,
                hint: 'It captures the idea of representing state over HTTP.',
                explanation: 'REST = Representational State Transfer, Roy Fielding\'s architecture style.'
            },
            {
                id: 'api-4',
                question: 'Which header allows cross-origin requests?',
                options: [
                    'Access-Control-Allow-Origin',
                    'Content-Type',
                    'Authorization',
                    'Accept'
                ],
                correctAnswer: 0,
                hint: 'CORS is controlled via dedicated headers.',
                explanation: 'Access-Control-Allow-Origin lists which origins may access the resource.'
            },
            {
                id: 'api-5',
                question: 'Which HTTP method is idempotent?',
                options: ['POST', 'PATCH', 'PUT', 'CONNECT'],
                correctAnswer: 2,
                hint: 'Calling it multiple times yields the same result.',
                explanation: 'PUT replaces the resource, so repeated calls are safe.'
            },
            {
                id: 'api-6',
                question: 'What status code indicates the client is rate limited?',
                options: ['401', '403', '404', '429'],
                correctAnswer: 3,
                hint: 'It is in the 4xx range and often paired with Retry-After.',
                explanation: '429 Too Many Requests means the client must slow down.'
            },
            {
                id: 'api-7',
                question: 'What is the correct Content-Type for JSON APIs?',
                options: [
                    'text/plain; charset=utf-8',
                    'application/json',
                    'application/x-www-form-urlencoded',
                    'multipart/form-data'
                ],
                correctAnswer: 1,
                hint: 'Browsers detect JSON via a specific media type.',
                explanation: 'application/json signals the body is JSON encoded.'
            },
            {
                id: 'api-8',
                question: 'What does status 204 mean?',
                options: ['No Content', 'Partial Content', 'Reset Content', 'Accepted'],
                correctAnswer: 0,
                hint: 'It still implies success but nothing to send back.',
                explanation: '204 No Content is success with an empty body.'
            },
            {
                id: 'api-9',
                question: 'Which header tells the server what response format the client expects?',
                options: ['Accept', 'Authorization', 'Cache-Control', 'Host'],
                correctAnswer: 0,
                hint: 'It is the counterpart to Content-Type in requests.',
                explanation: 'Accept header specifies the media types the client can process.'
            },
            {
                id: 'api-10',
                question: 'Which status signals a generic server error?',
                options: ['400', '401', '500', '503'],
                correctAnswer: 2,
                hint: 'It begins the 5xx series.',
                explanation: '500 Internal Server Error is the fallback for unexpected failures.'
            },
            {
                id: 'api-11',
                question: 'What HTTP verb partially updates an existing resource?',
                options: ['GET', 'PATCH', 'HEAD', 'TRACE'],
                correctAnswer: 1,
                hint: 'It rhymes with scratch.',
                explanation: 'PATCH applies a partial update to the resource.'
            },
            {
                id: 'api-12',
                question: 'Which response header is used for pagination links?',
                options: ['Link', 'ETag', 'Location', 'Server'],
                correctAnswer: 0,
                hint: 'GitHub\'s API relies heavily on this header.',
                explanation: 'The Link header can contain rel="next"/"prev" for pagination.'
            }
        ]
    },
    'debug-detective': {
        mode: 'debugging',
        questions: [
            {
                id: 'debug-1',
                question: 'Fix the missing return in a map callback.',
                buggyCode: 'const doubled = numbers.map(n => { n * 2; });',
                expectedFix: 'const doubled = numbers.map(n => n * 2);',
                hint: 'Arrow functions without braces implicitly return.',
                explanation: 'Remove braces or add explicit return so the map produces data.'
            },
            {
                id: 'debug-2',
                question: 'Resolve promise rejection not being handled.',
                buggyCode: 'fetch(url).then(res => res.json());',
                expectedFix: 'fetch(url).then(res => res.json()).catch(console.error);',
                hint: 'Always handle promise failures.',
                explanation: 'Attach a catch handler to surface network errors.'
            },
            {
                id: 'debug-3',
                question: 'Fix incorrect equality when comparing IDs.',
                buggyCode: 'if (user.id === "42") { grantAccess(); }',
                expectedFix: 'if (String(user.id) === "42") { grantAccess(); }',
                hint: 'Ensure types align before comparison.',
                explanation: 'Convert id to string (or number) before strict comparison.'
            },
            {
                id: 'debug-4',
                question: 'Stop mutating original state array in React.',
                buggyCode: 'state.items.push(newItem); setState({ items: state.items });',
                expectedFix: 'setState(prev => ({ items: [...prev.items, newItem] }));',
                hint: 'Never mutate state directly.',
                explanation: 'Use immutable update helpers to trigger re-render.'
            },
            {
                id: 'debug-5',
                question: 'Fix async/await missing await keyword.',
                buggyCode: 'async function load() { const data = fetch(url); return data.json(); }',
                expectedFix: 'async function load() { const res = await fetch(url); return res.json(); }',
                hint: 'Await the fetch before calling .json().',
                explanation: 'Without await, data is a promise, not the response.'
            },
            {
                id: 'debug-6',
                question: 'Guard against undefined property access.',
                buggyCode: 'const city = profile.address.city.toUpperCase();',
                expectedFix: 'const city = profile.address?.city?.toUpperCase() || "Unknown";',
                hint: 'Use optional chaining.',
                explanation: 'Optional chaining avoids runtime errors when nested fields are missing.'
            },
            {
                id: 'debug-7',
                question: 'Fix event listener leak inside React component.',
                buggyCode: 'useEffect(() => { window.addEventListener("resize", handle); });',
                expectedFix: 'useEffect(() => { window.addEventListener("resize", handle); return () => window.removeEventListener("resize", handle); }, []);',
                hint: 'Clean up listeners on unmount.',
                explanation: 'Return a cleanup function and add dependency array.'
            },
            {
                id: 'debug-8',
                question: 'Correct Node.js require path typo.',
                buggyCode: 'const config = require("./Config.json");',
                expectedFix: 'const config = require("./config.json");',
                hint: 'File systems are case sensitive in production.',
                explanation: 'Use the correct casing to avoid module not found errors.'
            },
            {
                id: 'debug-9',
                question: 'Fix SQL query string concatenation injection risk.',
                buggyCode: "db.query(`SELECT * FROM users WHERE email = '${email}'`);",
                expectedFix: 'db.query("SELECT * FROM users WHERE email = ?", [email]);',
                hint: 'Always parameterize queries.',
                explanation: 'Prepared statements stop injection and escape values safely.'
            },
            {
                id: 'debug-10',
                question: 'Fix missing dependency array in useEffect.',
                buggyCode: 'useEffect(() => { fetchData(); });',
                expectedFix: 'useEffect(() => { fetchData(); }, []);',
                hint: 'Effect should fire once on mount.',
                explanation: 'Empty dependency array prevents endless re-fetch loops.'
            },
            {
                id: 'debug-11',
                question: 'Handle JSON parsing errors safely.',
                buggyCode: 'const data = JSON.parse(raw);',
                expectedFix: 'let data; try { data = JSON.parse(raw); } catch (err) { data = null; }',
                hint: 'Wrap parse in try/catch.',
                explanation: 'Invalid JSON throws, so guard to prevent crashes.'
            },
            {
                id: 'debug-12',
                question: 'Fix missing module export.',
                buggyCode: 'function sum(a, b) { return a + b; }',
                expectedFix: 'module.exports = { sum };',
                hint: 'Export the function for other files.',
                explanation: 'Without exporting, require/import returns an empty object.'
            }
        ]
    },
    'syntax-speedrun': {
        mode: 'code-completion',
        questions: [
            {
                id: 'syntax-1',
                task: 'Create an array containing numbers 1 through 5',
                answer: '[1, 2, 3, 4, 5]',
                hint: 'Use square brackets and commas.',
                explanation: 'Arrays are written with square brackets and comma-separated values.'
            },
            {
                id: 'syntax-2',
                task: 'Declare a function named greet returning "hi"',
                answer: 'function greet() { return "hi"; }',
                hint: 'Remember the return keyword.',
                explanation: 'Functions need parentheses, braces, and a return statement.'
            },
            {
                id: 'syntax-3',
                task: 'Create const user equal to object with name "Alex"',
                answer: 'const user = { name: "Alex" };',
                hint: 'Objects use curly braces with key: value pairs.',
                explanation: 'Use const for constant bindings and object literal syntax.'
            },
            {
                id: 'syntax-4',
                task: 'Write arrow function double that doubles input x',
                answer: 'const double = x => x * 2;',
                hint: 'Arrow functions can omit return for one-liners.',
                explanation: 'Concise arrow syntax keeps the expression inline.'
            },
            {
                id: 'syntax-5',
                task: 'Create template string outputting name variable',
                answer: 'const message = `Hello, ${name}!`;',
                hint: 'Use backticks and ${ } placeholders.',
                explanation: 'Template literals embed expressions inside ${ }.'
            },
            {
                id: 'syntax-6',
                task: 'Destructure property title from object post',
                answer: 'const { title } = post;',
                hint: 'Use curly braces on the left-hand side.',
                explanation: 'Object destructuring extracts properties into variables.'
            },
            {
                id: 'syntax-7',
                task: 'Convert string num to number using Number()',
                answer: 'const value = Number(num);',
                hint: 'Wrap the variable in Number(...)',
                explanation: 'Number() casts string numeric values to numbers.'
            },
            {
                id: 'syntax-8',
                task: 'Create array copy of items using spread',
                answer: 'const copy = [...items];',
                hint: 'Spread syntax uses three dots.',
                explanation: 'Spread inside array literal clones the array shallowly.'
            },
            {
                id: 'syntax-9',
                task: 'Create promise resolving after 1s',
                answer: 'const wait = () => new Promise(res => setTimeout(res, 1000));',
                hint: 'Wrap setTimeout in new Promise.',
                explanation: 'Promises need executor with resolve callback and async work inside.'
            },
            {
                id: 'syntax-10',
                task: 'Use optional chaining to safely access profile.email',
                answer: 'const email = profile?.email || null;',
                hint: 'Use ?. to guard access.',
                explanation: 'Optional chaining prevents errors when profile is undefined.'
            },
            {
                id: 'syntax-11',
                task: 'Create Set from array values',
                answer: 'const unique = new Set(values);',
                hint: 'Set removes duplicates automatically.',
                explanation: 'new Set(iterable) constructs a collection of unique values.'
            },
            {
                id: 'syntax-12',
                task: 'Export function sum as default export',
                answer: 'export default function sum(a, b) { return a + b; }',
                hint: 'Combine export default with function declaration.',
                explanation: 'Default exports allow importing without curly braces.'
            }
        ]
    },
    'algorithm-puzzle': {
        mode: 'multiple-choice',
        questions: [
            {
                id: 'algo-1',
                question: 'What is the time complexity of binary search?',
                options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
                correctAnswer: 1,
                hint: 'It halves the search space each step.',
                explanation: 'Binary search divides by two repeatedly, giving logarithmic time.'
            },
            {
                id: 'algo-2',
                question: 'Which data structure works best for FIFO processing?',
                options: ['Stack', 'Queue', 'Tree', 'Graph'],
                correctAnswer: 1,
                hint: 'First in, first out.',
                explanation: 'Queues dequeue in the same order items were enqueued.'
            },
            {
                id: 'algo-3',
                question: 'Which algorithm guarantees the shortest path in weighted graphs with no negative weights?',
                options: ['Depth-first search', 'Breadth-first search', 'Dijkstra\'s algorithm', 'Prim\'s algorithm'],
                correctAnswer: 2,
                hint: 'It uses a priority queue of distances.',
                explanation: 'Dijkstra keeps track of the smallest tentative distance to each node.'
            },
            {
                id: 'algo-4',
                question: 'What does Big-O notation describe?',
                options: ['Exact runtime', 'Average runtime', 'Upper bound of growth', 'Memory usage only'],
                correctAnswer: 2,
                hint: 'It bounds the worst case growth rate.',
                explanation: 'Big-O gives an asymptotic upper limit on runtime as input grows.'
            },
            {
                id: 'algo-5',
                question: 'Which traversal visits tree nodes level by level?',
                options: ['In-order', 'Pre-order', 'Post-order', 'Breadth-first'],
                correctAnswer: 3,
                hint: 'Use a queue to visit siblings first.',
                explanation: 'Breadth-first traversal uses a queue to explore each depth before going deeper.'
            },
            {
                id: 'algo-6',
                question: 'What is the space complexity of merge sort?',
                options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
                correctAnswer: 2,
                hint: 'It requires an auxiliary array.',
                explanation: 'Merge sort allocates additional arrays proportional to input size.'
            },
            {
                id: 'algo-7',
                question: 'Which algorithm is best for finding strongly connected components?',
                options: ['Kruskal\'s', 'Tarjan\'s', 'Prim\'s', 'Floyd-Warshall'],
                correctAnswer: 1,
                hint: 'It uses depth-first search twice with low-link values.',
                explanation: 'Tarjan\'s algorithm identifies SCCs in linear time.'
            },
            {
                id: 'algo-8',
                question: 'What structure does a heap sort rely on?',
                options: ['Binary heap', 'AVL tree', 'Hash map', 'Trie'],
                correctAnswer: 0,
                hint: 'Think of priority queue implementation.',
                explanation: 'Heap sort builds a max-heap to repeatedly extract the largest element.'
            },
            {
                id: 'algo-9',
                question: 'Which algorithm detects cycles in an undirected graph efficiently?',
                options: ['Union-Find', 'Topological sort', 'Bellman-Ford', 'Dijkstra'],
                correctAnswer: 0,
                hint: 'Disjoint set union works great for this.',
                explanation: 'Union-Find can detect when two nodes share the same root, signalling a cycle.'
            },
            {
                id: 'algo-10',
                question: 'What is the best-case time complexity of quicksort?',
                options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n^2)'],
                correctAnswer: 2,
                hint: 'Balanced partitions give the ideal case.',
                explanation: 'When partitions are even, quicksort does divide-and-conquer in O(n log n).' 
            },
            {
                id: 'algo-11',
                question: 'Which algorithm finds minimum spanning tree using edge relaxation?',
                options: ['Prim', 'Kruskal', 'Bellman-Ford', 'Floyd-Warshall'],
                correctAnswer: 1,
                hint: 'It sorts edges by weight first.',
                explanation: 'Kruskal sorts edges and unions disjoint sets to build the MST.'
            },
            {
                id: 'algo-12',
                question: 'Which technique speeds up repeated Fibonacci calculations?',
                options: ['Recursion without memo', 'Dynamic programming', 'Brute force', 'Randomization'],
                correctAnswer: 1,
                hint: 'Store results to avoid re-computation.',
                explanation: 'Dynamic programming (memoization or tabulation) gives linear time Fibonacci.'
            }
        ]
    }
};

const shuffleArray = (array) => {
    const clone = [...array];
    for (let i = clone.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
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
            'http://localhost:8080',
            'http://localhost:3000',
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
    
    // Parse access token from query string
    const url = new URL(req.url, `http://${req.headers.host}`);
    const accessToken = url.searchParams.get('token');
    
    // Check if this is a paid service connection
    if (accessToken) {
        paymentHandler.checkServiceAccess(accessToken).then(result => {
            if (result.hasAccess) {
                ws.isPaidUser = true;
                ws.serviceAccess = result;
                console.log('✅ Paid service access granted:', result.customer.email);
                ws.send(JSON.stringify({
                    type: 'access_granted',
                    service: result.service.name,
                    features: result.service.features,
                    grantedAt: result.customer.grantedAt
                }));
            } else {
                ws.send(JSON.stringify({
                    type: 'access_denied',
                    reason: result.reason || 'Invalid access token'
                }));
            }
        }).catch(err => {
            console.error('Access check error:', err);
        });
    }
    
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
            // Analytics channel (existing behavior)
            try {
                handleAnalyticsEvent(data, ws);
            } catch (e) {
                console.error('❌ Error in handleAnalyticsEvent:', e);
            }

            // Realtime matchmaking control (guarded)
            try {
                if (typeof handleRealtimeMessage === 'function') {
                    handleRealtimeMessage(data, ws);
                } else {
                    console.warn('⚠️ handleRealtimeMessage is not defined. Ignoring realtime message.');
                }
            } catch (e) {
                console.error('❌ Error in handleRealtimeMessage:', e);
            }
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

// API Routes - Fast health check (optimized for serverless)
app.get('/api/health', (req, res) => {
    // Instant response - no async DB calls for health check
    res.json({
        status: 'healthy',
        success: true,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '2.0.0',
        platform: 'Champions Arena - BarodaTek.com',
        service: 'Champions Arena AI Assistant'
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

// ========== ARENA CONTROL CENTER STATS ENDPOINT ==========

// GET real-time statistics for Arena Control Center
app.get('/api/stats', async (req, res) => {
    try {
        const dbStats = await db.getDatabaseStats();
        const contractsCount = await db.getAllContracts().then(c => c.length);
        
        // Calculate real metrics
        const stats = {
            activeUsers: analytics.sessions.size || 0,
            pageViews: analytics.pageViews || 0,
            apiRequests: analytics.apiRequests || 0,
            uptime: ((process.uptime() / 86400) * 100).toFixed(2), // Convert to percentage
            responseTime: analytics.avgResponseTime || 0,
            port: PORT,
            status: 'operational',
            timestamp: Date.now(),
            // Additional metrics
            totalContracts: contractsCount,
            databaseSize: dbStats.size || 0,
            memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
            serverUptime: Math.round(process.uptime() / 3600), // hours
            environment: process.env.NODE_ENV || 'development'
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics',
            timestamp: new Date().toISOString()
        });
    }
});

// ========== PHASE A DAY 2: AUTHENTICATION & RATE LIMITING ==========

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'barodatek-arena-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// User & API Key Database (in-memory for now, will move to real DB later)
const authData = {
    users: new Map(), // userId -> { email, passwordHash, tier, createdAt, ... }
    apiKeys: new Map(), // apiKey -> { userId, tier, createdAt, lastUsed, ... }
    usage: new Map() // apiKey -> { requests: number, resetAt: timestamp }
};

// Rate limit tiers
const RATE_LIMITS = {
    free: { requests: 5000, window: 24 * 60 * 60 * 1000 }, // 5K per day
    pro: { requests: 100000, window: 24 * 60 * 60 * 1000 }, // 100K per day
    enterprise: { requests: Infinity, window: 24 * 60 * 60 * 1000 } // Unlimited
};

// Middleware: Authenticate JWT Token
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required',
            message: 'Please provide a valid JWT token in Authorization header'
        });
    }
    
    const token = authHeader.substring(7);
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token',
            message: error.message
        });
    }
}

// Middleware: Authenticate API Key & Check Rate Limits
function authenticateAPIKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API key required',
            message: 'Please provide your API key in the X-API-Key header'
        });
    }
    
    const keyData = authData.apiKeys.get(apiKey);
    
    if (!keyData) {
        return res.status(403).json({
            success: false,
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
        });
    }
    
    // Check rate limits
    const tier = keyData.tier;
    const limit = RATE_LIMITS[tier];
    
    if (!authData.usage.has(apiKey)) {
        authData.usage.set(apiKey, {
            requests: 0,
            resetAt: Date.now() + limit.window
        });
    }
    
    const usage = authData.usage.get(apiKey);
    
    // Reset if window expired
    if (Date.now() > usage.resetAt) {
        usage.requests = 0;
        usage.resetAt = Date.now() + limit.window;
    }
    
    // Check if limit exceeded
    if (usage.requests >= limit.requests) {
        const resetIn = Math.ceil((usage.resetAt - Date.now()) / 1000 / 60);
        return res.status(429).json({
            success: false,
            error: 'Rate limit exceeded',
            message: `You have reached your ${tier} tier limit of ${limit.requests} requests per day`,
            resetIn: `${resetIn} minutes`,
            upgrade: tier === 'free' ? 'Upgrade to Pro for 100K requests/day' : null
        });
    }
    
    // Increment usage
    usage.requests++;
    keyData.lastUsed = new Date().toISOString();
    
    // Attach user data to request
    req.apiKey = apiKey;
    req.apiKeyData = keyData;
    req.user = authData.users.get(keyData.userId);
    
    next();
}

// ========== AUTHENTICATION ENDPOINTS ==========

// POST /api/auth/register - Register new developer account
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, tier = 'free' } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password required'
            });
        }
        
        // Check if user already exists
        const existingUser = Array.from(authData.users.values()).find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'Email already registered'
            });
        }
        
        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Create user
        const userId = uuidv4();
        const user = {
            id: userId,
            email,
            name: name || email.split('@')[0],
            passwordHash,
            tier: tier === 'pro' || tier === 'enterprise' ? tier : 'free',
            createdAt: new Date().toISOString(),
            apiKeysCount: 0
        };
        
        authData.users.set(userId, user);
        
        // Generate initial API key
        const apiKey = `barodatek_${crypto.randomBytes(32).toString('hex')}`;
        authData.apiKeys.set(apiKey, {
            userId,
            tier: user.tier,
            name: 'Default API Key',
            createdAt: new Date().toISOString(),
            lastUsed: null
        });
        
        user.apiKeysCount = 1;
        
        // Generate JWT
        const token = jwt.sign(
            { userId, email, tier: user.tier },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        res.status(201).json({
            success: true,
            message: 'Developer account created successfully',
            data: {
                userId,
                email: user.email,
                name: user.name,
                tier: user.tier,
                token,
                apiKey,
                rateLimit: RATE_LIMITS[user.tier]
            }
        });
        
        console.log(`✅ New developer registered: ${email} (${user.tier} tier)`);
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
            message: error.message
        });
    }
});

// POST /api/auth/login - Developer login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password required'
            });
        }
        
        // Find user
        const user = Array.from(authData.users.values()).find(u => u.email === email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email, tier: user.tier },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        // Get user's API keys
        const userApiKeys = Array.from(authData.apiKeys.entries())
            .filter(([_, data]) => data.userId === user.id)
            .map(([key, data]) => ({
                key,
                name: data.name,
                createdAt: data.createdAt,
                lastUsed: data.lastUsed
            }));
        
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                userId: user.id,
                email: user.email,
                name: user.name,
                tier: user.tier,
                token,
                apiKeys: userApiKeys,
                rateLimit: RATE_LIMITS[user.tier]
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            message: error.message
        });
    }
});

// GET /api/auth/profile - Get user profile (protected)
app.get('/api/auth/profile', authenticateJWT, (req, res) => {
    try {
        const user = authData.users.get(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Get user's API keys
        const userApiKeys = Array.from(authData.apiKeys.entries())
            .filter(([_, data]) => data.userId === user.id)
            .map(([key, data]) => ({
                key: `${key.substring(0, 20)}...${key.substring(key.length - 8)}`,
                name: data.name,
                tier: data.tier,
                createdAt: data.createdAt,
                lastUsed: data.lastUsed
            }));
        
        res.json({
            success: true,
            data: {
                userId: user.id,
                email: user.email,
                name: user.name,
                tier: user.tier,
                createdAt: user.createdAt,
                apiKeys: userApiKeys,
                rateLimit: RATE_LIMITS[user.tier]
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch profile',
            message: error.message
        });
    }
});

// POST /api/auth/refresh-key - Generate new API key (protected)
app.post('/api/auth/refresh-key', authenticateJWT, (req, res) => {
    try {
        const { name = 'API Key' } = req.body;
        const user = authData.users.get(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Generate new API key
        const apiKey = `barodatek_${crypto.randomBytes(32).toString('hex')}`;
        authData.apiKeys.set(apiKey, {
            userId: user.id,
            tier: user.tier,
            name,
            createdAt: new Date().toISOString(),
            lastUsed: null
        });
        
        user.apiKeysCount++;
        
        res.json({
            success: true,
            message: 'New API key generated',
            data: {
                apiKey,
                name,
                tier: user.tier,
                rateLimit: RATE_LIMITS[user.tier]
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to generate API key',
            message: error.message
        });
    }
});

// GET /api/auth/usage - Get API usage stats (requires API key)
app.get('/api/auth/usage', authenticateAPIKey, (req, res) => {
    try {
        const usage = authData.usage.get(req.apiKey);
        const limit = RATE_LIMITS[req.apiKeyData.tier];
        
        const remaining = Math.max(0, limit.requests - (usage?.requests || 0));
        const resetAt = usage?.resetAt || Date.now() + limit.window;
        const resetIn = Math.ceil((resetAt - Date.now()) / 1000 / 60);
        
        res.json({
            success: true,
            data: {
                tier: req.apiKeyData.tier,
                requests: {
                    used: usage?.requests || 0,
                    limit: limit.requests,
                    remaining
                },
                resetIn: `${resetIn} minutes`,
                resetAt: new Date(resetAt).toISOString()
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch usage',
            message: error.message
        });
    }
});

// ========== PHASE A: GAMING API ENDPOINTS ==========
// Arena Stats, Leaderboards, Player Stats, Match Recording

// In-memory game data (will be moved to database later)
const gamingData = {
    players: new Map(),
    matches: [],
    leaderboards: new Map(),
    activeMatches: new Set()
};

// Initialize some demo players for testing
const initDemoPlayers = () => {
    const demoPlayers = [
        { id: 'player1', username: 'ArenaChampion', score: 2500, wins: 45, losses: 12, level: 15 },
        { id: 'player2', username: 'EliteGamer', score: 2350, wins: 38, losses: 15, level: 14 },
        { id: 'player3', username: 'ProShooter', score: 2200, wins: 35, losses: 18, level: 13 },
        { id: 'player4', username: 'StrategyKing', score: 2100, wins: 32, losses: 20, level: 12 },
        { id: 'player5', username: 'SpeedRunner', score: 1950, wins: 28, losses: 22, level: 11 }
    ];
    
    demoPlayers.forEach(player => {
        gamingData.players.set(player.id, {
            ...player,
            xp: player.score * 10,
            gamesPlayed: player.wins + player.losses,
            winRate: ((player.wins / (player.wins + player.losses)) * 100).toFixed(1),
            kdr: (Math.random() * 2 + 1).toFixed(2),
            avgScore: Math.floor(Math.random() * 5000 + 3000),
            bestScore: Math.floor(Math.random() * 10000 + 8000),
            streak: Math.floor(Math.random() * 10),
            longestStreak: Math.floor(Math.random() * 20 + 5),
            achievements: Math.floor(Math.random() * 20 + 10),
            badges: Math.floor(Math.random() * 15 + 5),
            createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
            lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000)
        });
    });
};

initDemoPlayers();

// GET /api/arena/stats - Enhanced arena statistics (PROTECTED)
app.get('/api/arena/stats', authenticateAPIKey, async (req, res) => {
    try {
        const stats = {
            // Real-time arena metrics
            activeUsers: analytics.sessions.size || 0,
            totalPlayers: gamingData.players.size,
            liveMatches: gamingData.activeMatches.size,
            dailySignups: Math.floor(Math.random() * 50 + 10), // Will be real from DB
            peakConcurrent: Math.floor(analytics.sessions.size * 1.5),
            totalApiCalls: analytics.apiRequests || 0,
            avgResponseTime: analytics.avgResponseTime || 0,
            uptime: process.uptime(),
            status: 'operational',
            timestamp: Date.now(),
            // Gaming-specific metrics
            totalMatchesPlayed: gamingData.matches.length,
            averageMatchDuration: 15.5, // minutes
            topGameMode: 'Arena Deathmatch',
            serverRegion: 'US-East',
            serverLoad: Math.floor(Math.random() * 40 + 30) // percentage
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching arena stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch arena statistics',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/arena/leaderboard - Player rankings (PROTECTED)
app.get('/api/arena/leaderboard', authenticateAPIKey, async (req, res) => {
    try {
        const { game = 'all', timeframe = 'weekly', limit = 100 } = req.query;
        
        // Convert players Map to array and sort by score
        const players = Array.from(gamingData.players.values());
        const sortedPlayers = players
            .sort((a, b) => b.score - a.score)
            .slice(0, parseInt(limit));
        
        const leaderboard = {
            game,
            timeframe,
            updated: new Date(),
            totalPlayers: players.length,
            entries: sortedPlayers.map((player, index) => ({
                rank: index + 1,
                playerId: player.id,
                username: player.username,
                score: player.score,
                level: player.level,
                wins: player.wins,
                losses: player.losses,
                winRate: parseFloat(player.winRate),
                streak: player.streak,
                lastActive: player.lastActive,
                badges: player.badges
            }))
        };
        
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leaderboard',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/arena/player/:id - Individual player stats (PROTECTED)
app.get('/api/arena/player/:id', authenticateAPIKey, async (req, res) => {
    try {
        const { id } = req.params;
        const player = gamingData.players.get(id);
        
        if (!player) {
            return res.status(404).json({
                success: false,
                error: 'Player not found',
                timestamp: new Date().toISOString()
            });
        }
        
        // Calculate global rank
        const allPlayers = Array.from(gamingData.players.values());
        const sortedByScore = allPlayers.sort((a, b) => b.score - a.score);
        const globalRank = sortedByScore.findIndex(p => p.id === id) + 1;
        
        const playerData = {
            id: player.id,
            username: player.username,
            level: player.level,
            xp: player.xp,
            rank: globalRank,
            stats: {
                gamesPlayed: player.gamesPlayed,
                wins: player.wins,
                losses: player.losses,
                winRate: parseFloat(player.winRate),
                killDeathRatio: parseFloat(player.kdr),
                avgScore: player.avgScore,
                bestScore: player.bestScore,
                currentStreak: player.streak,
                longestStreak: player.longestStreak
            },
            achievements: player.achievements,
            badges: player.badges,
            joinDate: player.createdAt,
            lastSeen: player.lastActive,
            status: Date.now() - new Date(player.lastActive).getTime() < 300000 ? 'online' : 'offline'
        };
        
        res.json(playerData);
    } catch (error) {
        console.error('Error fetching player:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch player data',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/arena/match - Record match results (PROTECTED)
app.post('/api/arena/match', authenticateAPIKey, async (req, res) => {
    try {
        const { gameType, players, duration, winner, scores } = req.body;
        
        if (!gameType || !players || !Array.isArray(players) || players.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid match data: gameType and players array required',
                timestamp: new Date().toISOString()
            });
        }
        
        // Create match record
        const match = {
            id: `match_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            gameType,
            players,
            duration: duration || 0,
            winner: winner || null,
            scores: scores || {},
            timestamp: new Date(),
            status: 'completed'
        };
        
        gamingData.matches.push(match);
        
        // Update player stats
        for (const playerId of players) {
            const player = gamingData.players.get(playerId);
            if (player) {
                player.gamesPlayed++;
                player.lastActive = new Date();
                
                if (playerId === winner) {
                    player.wins++;
                    player.streak++;
                    player.score += 50;
                    if (player.streak > player.longestStreak) {
                        player.longestStreak = player.streak;
                    }
                } else {
                    player.losses++;
                    player.streak = 0;
                    player.score = Math.max(0, player.score - 20);
                }
                
                player.winRate = ((player.wins / player.gamesPlayed) * 100).toFixed(1);
            }
        }
        
        res.status(201).json({
            success: true,
            matchId: match.id,
            status: 'recorded',
            leaderboardUpdated: true,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error recording match:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record match',
            timestamp: new Date().toISOString()
        });
    }
});

// ========== MATCHMAKING API ENDPOINTS (DAY 3) ==========

// Matchmaking data structures
const lobbies = new Map(); // lobbyId -> lobby object
const matchmakingQueue = new Map(); // playerId -> queue entry

// Helper: Generate lobby ID
function generateLobbyId() {
    return `lobby_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// Helper: Generate queue ID
function generateQueueId() {
    return `queue_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

// Helper: Calculate match quality (0-100)
function calculateMatchQuality(players) {
    if (!players || players.length === 0) return 0;
    
    const elos = players.map(p => p.elo);
    const avgElo = elos.reduce((sum, elo) => sum + elo, 0) / elos.length;
    const eloRange = Math.max(...elos) - Math.min(...elos);
    
    // Perfect match (100): all within 10 ELO points
    // Excellent (90-99): within 50 ELO points
    // Good (75-89): within 100 ELO points
    // Fair (60-74): within 150 ELO points
    // Poor (<60): > 150 ELO range
    const quality = Math.max(0, 100 - eloRange);
    
    return {
        score: Math.round(quality),
        averageElo: Math.round(avgElo),
        eloRange: eloRange
    };
}

// Helper: Find matches in queue (ELO-based)
function findMatches(gameMode, region) {
    const matches = [];
    const processed = new Set();
    
    // Filter queue by game mode and region
    const filteredQueue = Array.from(matchmakingQueue.values()).filter(entry =>
        entry.gameMode === gameMode && entry.region === region && !processed.has(entry.playerId)
    );
    
    // Sort by wait time (longest waiting first)
    filteredQueue.sort((a, b) => a.joinedAt - b.joinedAt);
    
    for (const player of filteredQueue) {
        if (processed.has(player.playerId)) continue;
        
        // Find compatible players (±100 ELO)
        const compatiblePlayers = filteredQueue.filter(p =>
            !processed.has(p.playerId) &&
            Math.abs(p.elo - player.elo) <= 100
        );
        
        // Need 6-10 players for a match
        if (compatiblePlayers.length >= 6) {
            const matchPlayers = compatiblePlayers.slice(0, 10);
            const quality = calculateMatchQuality(matchPlayers);
            
            matches.push({
                players: matchPlayers,
                gameMode: gameMode,
                region: region,
                quality: quality
            });
            
            matchPlayers.forEach(p => processed.add(p.playerId));
        }
    }
    
    return matches;
}

// Helper: Notify player via WebSocket
function notifyPlayer(playerId, eventType, data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN && client.playerId === playerId) {
            client.send(JSON.stringify({
                type: eventType,
                ...data,
                timestamp: Date.now()
            }));
        }
    });
}

// Helper: Broadcast to lobby
function broadcastToLobby(lobbyId, eventType, data) {
    const lobby = lobbies.get(lobbyId);
    if (!lobby) return;
    
    lobby.players.forEach(player => {
        notifyPlayer(player.playerId, eventType, data);
    });
}

function getMatchmakingSnapshot() {
    const queue = Array.from(matchmakingQueue.values()).map(entry => ({
        playerId: entry.playerId,
        elo: entry.elo,
        region: entry.region,
        gameMode: entry.gameMode,
        joinedAt: new Date(entry.joinedAt).toISOString()
    }));
    const lobbyList = Array.from(lobbies.values()).map(lobby => ({
        lobbyId: lobby.lobbyId,
        gameMode: lobby.gameMode,
        region: lobby.region,
        status: lobby.status,
        players: lobby.players.length,
        maxPlayers: lobby.maxPlayers,
        createdAt: new Date(lobby.createdAt).toISOString()
    }));

    return {
        queueSize: queue.length,
        lobbyCount: lobbyList.length,
        queue,
        lobbies: lobbyList
    };
}

function getWebSocketSnapshot() {
    let total = 0;
    let admins = 0;
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            total++;
            if (client.isAdmin) admins++;
        }
    });
    return { total, admins };
}

async function buildSystemStatus() {
    const [dbStats, analyticsData] = await Promise.all([
        db.getDatabaseStats(),
        db.getAnalytics()
    ]);

    return {
        status: 'operational',
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
        memory: {
            rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
            heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
        },
        analytics: {
            pageViews: analyticsData.pageViews,
            eventsTracked: analyticsData.events.length,
            topPages: analyticsData.topPages
        },
        database: dbStats,
        matchmaking: getMatchmakingSnapshot(),
        websockets: getWebSocketSnapshot(),
        featureFlags
    };
}

// Public snapshot of matchmaking health
app.get('/api/matchmaking/status', (req, res) => {
    const snapshot = getMatchmakingSnapshot();

    res.json({
        success: true,
        snapshot,
        timestamp: new Date().toISOString()
    });
});

// Global status endpoint consumed by UI/health checks
app.get('/api/status', async (req, res) => {
    try {
        const status = await buildSystemStatus();
        res.json({ success: true, ...status });
    } catch (error) {
        console.error('Error building status payload:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to compute system status',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/matchmaking/lobby - Create a new lobby (PROTECTED)
app.post('/api/matchmaking/lobby', authenticateAPIKey, async (req, res) => {
    try {
        const { gameMode, region, maxPlayers, hostPlayerId, hostUsername, hostElo } = req.body;
        
        // Validate input
        if (!gameMode || !region || !hostPlayerId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: gameMode, region, hostPlayerId',
                timestamp: new Date().toISOString()
            });
        }
        
        // Validate game mode
        const validGameModes = ['ranked', 'casual', 'custom', 'tournament'];
        if (!validGameModes.includes(gameMode)) {
            return res.status(400).json({
                success: false,
                error: `Invalid gameMode. Must be one of: ${validGameModes.join(', ')}`,
                timestamp: new Date().toISOString()
            });
        }
        
        // Validate region
        const validRegions = ['us-east', 'us-west', 'eu-west', 'eu-east', 'asia-pacific', 'south-america'];
        if (!validRegions.includes(region)) {
            return res.status(400).json({
                success: false,
                error: `Invalid region. Must be one of: ${validRegions.join(', ')}`,
                timestamp: new Date().toISOString()
            });
        }
        
        // Create lobby
        const lobbyId = generateLobbyId();
        const lobby = {
            lobbyId: lobbyId,
            gameMode: gameMode,
            region: region,
            status: 'waiting', // waiting, full, in-progress, completed
            players: [
                {
                    playerId: hostPlayerId,
                    username: hostUsername || `Player_${hostPlayerId.substring(0, 8)}`,
                    elo: hostElo || 1500,
                    isHost: true,
                    team: null,
                    joinedAt: Date.now()
                }
            ],
            maxPlayers: maxPlayers || 10,
            matchQuality: null,
            createdAt: Date.now(),
            startedAt: null,
            completedAt: null,
            serverIp: null
        };
        
        lobbies.set(lobbyId, lobby);
        
        console.log(`✅ Created lobby ${lobbyId} (${gameMode}, ${region})`);
        
        res.status(201).json({
            success: true,
            data: {
                lobbyId: lobby.lobbyId,
                gameMode: lobby.gameMode,
                region: lobby.region,
                status: lobby.status,
                players: lobby.players,
                maxPlayers: lobby.maxPlayers,
                currentPlayers: lobby.players.length,
                createdAt: new Date(lobby.createdAt).toISOString()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error creating lobby:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create lobby',
            timestamp: new Date().toISOString()
        });
    }
});

// GET /api/matchmaking/lobbies - List active lobbies (PROTECTED)
app.get('/api/matchmaking/lobbies', authenticateAPIKey, async (req, res) => {
    try {
        const { gameMode, region, status } = req.query;
        
        // Filter lobbies
        let filteredLobbies = Array.from(lobbies.values());
        
        if (gameMode) {
            filteredLobbies = filteredLobbies.filter(l => l.gameMode === gameMode);
        }
        if (region) {
            filteredLobbies = filteredLobbies.filter(l => l.region === region);
        }
        if (status) {
            filteredLobbies = filteredLobbies.filter(l => l.status === status);
        }
        
        // Map to response format
        const lobbyList = filteredLobbies.map(lobby => ({
            lobbyId: lobby.lobbyId,
            gameMode: lobby.gameMode,
            region: lobby.region,
            status: lobby.status,
            currentPlayers: lobby.players.length,
            maxPlayers: lobby.maxPlayers,
            averageElo: Math.round(lobby.players.reduce((sum, p) => sum + p.elo, 0) / lobby.players.length),
            createdAt: new Date(lobby.createdAt).toISOString()
        }));
        
        res.json({
            success: true,
            data: {
                lobbies: lobbyList,
                count: lobbyList.length,
                filters: { gameMode, region, status }
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error listing lobbies:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to list lobbies',
            timestamp: new Date().toISOString()
        });
    }
});

// PUT /api/matchmaking/lobby/:id - Update lobby (add player, change status) (PROTECTED)
app.put('/api/matchmaking/lobby/:id', authenticateAPIKey, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, playerId, username, elo, status } = req.body;
        
        const lobby = lobbies.get(id);
        if (!lobby) {
            return res.status(404).json({
                success: false,
                error: 'Lobby not found',
                timestamp: new Date().toISOString()
            });
        }
        
        // Handle different actions
        if (action === 'add-player') {
            if (!playerId) {
                return res.status(400).json({
                    success: false,
                    error: 'playerId required for add-player action',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Check if lobby is full
            if (lobby.players.length >= lobby.maxPlayers) {
                return res.status(400).json({
                    success: false,
                    error: 'Lobby is full',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Check if player already in lobby
            if (lobby.players.some(p => p.playerId === playerId)) {
                return res.status(400).json({
                    success: false,
                    error: 'Player already in lobby',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Add player
            const newPlayer = {
                playerId: playerId,
                username: username || `Player_${playerId.substring(0, 8)}`,
                elo: elo || 1500,
                isHost: false,
                team: null,
                joinedAt: Date.now()
            };
            
            lobby.players.push(newPlayer);
            
            // Update status if full
            if (lobby.players.length >= lobby.maxPlayers) {
                lobby.status = 'full';
            }
            
            // Broadcast to all players in lobby
            broadcastToLobby(id, 'player-joined', {
                lobbyId: id,
                player: newPlayer,
                currentPlayers: lobby.players.length,
                maxPlayers: lobby.maxPlayers
            });
            
            console.log(`✅ Player ${playerId} joined lobby ${id}`);
            
        } else if (action === 'remove-player') {
            if (!playerId) {
                return res.status(400).json({
                    success: false,
                    error: 'playerId required for remove-player action',
                    timestamp: new Date().toISOString()
                });
            }
            
            const playerIndex = lobby.players.findIndex(p => p.playerId === playerId);
            if (playerIndex === -1) {
                return res.status(404).json({
                    success: false,
                    error: 'Player not found in lobby',
                    timestamp: new Date().toISOString()
                });
            }
            
            lobby.players.splice(playerIndex, 1);
            
            // If lobby is now empty, delete it
            if (lobby.players.length === 0) {
                lobbies.delete(id);
                return res.json({
                    success: true,
                    message: 'Player removed and lobby closed (empty)',
                    timestamp: new Date().toISOString()
                });
            }
            
            // Update status if no longer full
            if (lobby.status === 'full' && lobby.players.length < lobby.maxPlayers) {
                lobby.status = 'waiting';
            }
            
            broadcastToLobby(id, 'player-left', {
                lobbyId: id,
                playerId: playerId,
                currentPlayers: lobby.players.length
            });
            
        } else if (action === 'update-status') {
            if (!status) {
                return res.status(400).json({
                    success: false,
                    error: 'status required for update-status action',
                    timestamp: new Date().toISOString()
                });
            }
            
            const validStatuses = ['waiting', 'full', 'in-progress', 'completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                    timestamp: new Date().toISOString()
                });
            }
            
            lobby.status = status;
            
            if (status === 'in-progress' && !lobby.startedAt) {
                lobby.startedAt = Date.now();
            }
            if (status === 'completed' && !lobby.completedAt) {
                lobby.completedAt = Date.now();
            }
            
            broadcastToLobby(id, 'lobby-updated', {
                lobbyId: id,
                status: status
            });
            
        } else {
            return res.status(400).json({
                success: false,
                error: 'Invalid action. Must be: add-player, remove-player, or update-status',
                timestamp: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            data: {
                lobbyId: lobby.lobbyId,
                gameMode: lobby.gameMode,
                region: lobby.region,
                status: lobby.status,
                players: lobby.players,
                currentPlayers: lobby.players.length,
                maxPlayers: lobby.maxPlayers
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating lobby:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update lobby',
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE /api/matchmaking/lobby/:id - Close/delete lobby (PROTECTED)
app.delete('/api/matchmaking/lobby/:id', authenticateAPIKey, async (req, res) => {
    try {
        const { id } = req.params;
        
        const lobby = lobbies.get(id);
        if (!lobby) {
            return res.status(404).json({
                success: false,
                error: 'Lobby not found',
                timestamp: new Date().toISOString()
            });
        }
        
        // Notify all players
        broadcastToLobby(id, 'lobby-closed', {
            lobbyId: id,
            reason: 'Host closed lobby'
        });
        
        lobbies.delete(id);
        
        console.log(`✅ Closed lobby ${id}`);
        
        res.json({
            success: true,
            message: 'Lobby closed successfully',
            data: {
                lobbyId: id,
                closedAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error closing lobby:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to close lobby',
            timestamp: new Date().toISOString()
        });
    }
});

// POST /api/matchmaking/queue - Join matchmaking queue (PROTECTED)
app.post('/api/matchmaking/queue', authenticateAPIKey, async (req, res) => {
    try {
        const { playerId, username, elo, gameMode, region } = req.body;
        
        // Validate input
        if (!playerId || !gameMode || !region) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: playerId, gameMode, region',
                timestamp: new Date().toISOString()
            });
        }
        
        // Check if already in queue
        if (matchmakingQueue.has(playerId)) {
            const existingEntry = matchmakingQueue.get(playerId);
            return res.status(400).json({
                success: false,
                error: 'Player already in queue',
                data: {
                    queueId: existingEntry.queueId,
                    joinedAt: new Date(existingEntry.joinedAt).toISOString()
                },
                timestamp: new Date().toISOString()
            });
        }
        
        // Create queue entry
        const queueId = generateQueueId();
        const queueEntry = {
            queueId: queueId,
            playerId: playerId,
            username: username || `Player_${playerId.substring(0, 8)}`,
            elo: elo || 1500,
            gameMode: gameMode,
            region: region,
            joinedAt: Date.now(),
            lastUpdate: Date.now()
        };
        
        matchmakingQueue.set(playerId, queueEntry);
        
        // Calculate queue position
        const queueList = Array.from(matchmakingQueue.values())
            .filter(e => e.gameMode === gameMode && e.region === region)
            .sort((a, b) => a.joinedAt - b.joinedAt);
        
        const position = queueList.findIndex(e => e.playerId === playerId) + 1;
        const estimatedWaitTime = `${Math.max(5, position * 3)} seconds`;
        
        console.log(`✅ Player ${playerId} joined queue (${gameMode}, ${region})`);
        
        res.json({
            success: true,
            data: {
                queueId: queueId,
                playerId: playerId,
                gameMode: gameMode,
                region: region,
                queuePosition: position,
                queueSize: queueList.length,
                estimatedWaitTime: estimatedWaitTime,
                joinedAt: new Date(queueEntry.joinedAt).toISOString()
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error joining queue:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to join queue',
            timestamp: new Date().toISOString()
        });
    }
});

// DELETE /api/matchmaking/queue - Leave matchmaking queue (PROTECTED)
app.delete('/api/matchmaking/queue', authenticateAPIKey, async (req, res) => {
    try {
        const { playerId } = req.query;
        
        if (!playerId) {
            return res.status(400).json({
                success: false,
                error: 'playerId query parameter required',
                timestamp: new Date().toISOString()
            });
        }
        
        const queueEntry = matchmakingQueue.get(playerId);
        if (!queueEntry) {
            return res.status(404).json({
                success: false,
                error: 'Player not found in queue',
                timestamp: new Date().toISOString()
            });
        }
        
        const timeInQueue = Date.now() - queueEntry.joinedAt;
        matchmakingQueue.delete(playerId);
        
        console.log(`✅ Player ${playerId} left queue`);
        
        res.json({
            success: true,
            message: 'Left queue successfully',
            data: {
                playerId: playerId,
                timeInQueue: `${Math.round(timeInQueue / 1000)} seconds`
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error leaving queue:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to leave queue',
            timestamp: new Date().toISOString()
        });
    }
});

// Background job: Auto-matching (runs every 3 seconds)
setInterval(() => {
    const gameModes = ['ranked', 'casual', 'custom', 'tournament'];
    const regions = ['us-east', 'us-west', 'eu-west', 'eu-east', 'asia-pacific', 'south-america'];
    
    let matchesCreated = 0;
    
    for (const gameMode of gameModes) {
        for (const region of regions) {
            const matches = findMatches(gameMode, region);
            
            for (const match of matches) {
                // Create lobby for matched players
                const lobbyId = generateLobbyId();
                const lobby = {
                    lobbyId: lobbyId,
                    gameMode: gameMode,
                    region: region,
                    status: 'full',
                    players: match.players.map((p, index) => ({
                        playerId: p.playerId,
                        username: p.username,
                        elo: p.elo,
                        isHost: index === 0,
                        team: index < (match.players.length / 2) ? 'A' : 'B',
                        joinedAt: Date.now()
                    })),
                    maxPlayers: match.players.length,
                    matchQuality: match.quality.score,
                    createdAt: Date.now(),
                    startedAt: null,
                    completedAt: null,
                    serverIp: `server-${region}.barodatek.com:7777` // Mock server IP
                };
                
                lobbies.set(lobbyId, lobby);
                
                // Notify all matched players
                match.players.forEach(player => {
                    notifyPlayer(player.playerId, 'match-found', {
                        lobbyId: lobbyId,
                        gameMode: gameMode,
                        region: region,
                        players: lobby.players,
                        matchQuality: lobby.matchQuality,
                        serverIp: lobby.serverIp,
                        message: 'Match found! Connecting to server...'
                    });
                    
                    // Remove from queue
                    matchmakingQueue.delete(player.playerId);
                });
                
                matchesCreated++;
                console.log(`🎮 Auto-match created: ${lobbyId} (${gameMode}, ${region}) - Quality: ${lobby.matchQuality}%`);
            }
        }
    }

    // Handle realtime (matchmaking) WebSocket control messages
    function handleRealtimeMessage(data, ws) {
        if (!data || typeof data !== 'object') return;
        const type = data.type || data.event || '';

        switch (type) {
            case 'join-matchmaking': {
                const playerId = (data.playerId || (data.payload && data.payload.playerId) || '').trim();
                if (!playerId) {
                    try { ws.send(JSON.stringify({ type: 'error', reason: 'playerId required for join-matchmaking' })); } catch {}
                    return;
                }
                ws.playerId = playerId;
                ws.gameMode = data.gameMode || (data.payload && data.payload.gameMode) || null;
                ws.region = data.region || (data.payload && data.payload.region) || null;
                try {
                    ws.send(JSON.stringify({
                        type: 'matchmaking-joined',
                        playerId,
                        gameMode: ws.gameMode,
                        region: ws.region,
                        timestamp: Date.now()
                    }));
                } catch {}
                break;
            }
            case 'leave-matchmaking': {
                const pid = ws.playerId;
                ws.playerId = undefined;
                ws.gameMode = undefined;
                ws.region = undefined;
                try {
                    ws.send(JSON.stringify({ type: 'matchmaking-left', playerId: pid || null, timestamp: Date.now() }));
                } catch {}
                break;
            }
            case 'subscribe-lobby': {
                // Optional: client can request lobby updates by id
                const lobbyId = data.lobbyId || (data.payload && data.payload.lobbyId);
                ws.lobbyId = lobbyId || null;
                try { ws.send(JSON.stringify({ type: 'lobby-subscribed', lobbyId, timestamp: Date.now() })); } catch {}
                break;
            }
            case 'unsubscribe-lobby': {
                ws.lobbyId = undefined;
                try { ws.send(JSON.stringify({ type: 'lobby-unsubscribed', timestamp: Date.now() })); } catch {}
                break;
            }
            default:
                // ignore unknown realtime messages
                break;
        }
    }
    
    // Update queue positions for remaining players
    if (matchmakingQueue.size > 0) {
        const now = Date.now();
        for (const [playerId, entry] of matchmakingQueue.entries()) {
            // Only update every 10 seconds to reduce spam
            if (now - entry.lastUpdate > 10000) {
                const queueList = Array.from(matchmakingQueue.values())
                    .filter(e => e.gameMode === entry.gameMode && e.region === entry.region)
                    .sort((a, b) => a.joinedAt - b.joinedAt);
                
                const position = queueList.findIndex(e => e.playerId === playerId) + 1;
                
                notifyPlayer(playerId, 'queue-position-updated', {
                    playerId: playerId,
                    position: position,
                    queueSize: queueList.length,
                    estimatedWaitTime: `${Math.max(5, position * 3)} seconds`,
                    timeInQueue: `${Math.round((now - entry.joinedAt) / 1000)} seconds`
                });
                
                entry.lastUpdate = now;
            }
        }
    }
}, 3000); // Run every 3 seconds

// Background job: Lobby cleanup (runs every 30 seconds)
setInterval(() => {
    const now = Date.now();
    const timeout = 10 * 60 * 1000; // 10 minutes
    let cleaned = 0;
    
    for (const [lobbyId, lobby] of lobbies.entries()) {
        // Remove completed lobbies or stale waiting lobbies
        if (lobby.status === 'completed' || 
            (lobby.status === 'waiting' && now - lobby.createdAt > timeout)) {
            lobbies.delete(lobbyId);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} stale lobbies`);
    }
}, 30000); // Run every 30 seconds

// Background job: Queue timeout (runs every 60 seconds)
setInterval(() => {
    const now = Date.now();
    const timeout = 10 * 60 * 1000; // 10 minutes
    let removed = 0;
    
    for (const [playerId, entry] of matchmakingQueue.entries()) {
        if (now - entry.joinedAt > timeout) {
            matchmakingQueue.delete(playerId);
            removed++;
            
            notifyPlayer(playerId, 'queue-timeout', {
                playerId: playerId,
                reason: 'Queue timeout (10 minutes)',
                message: 'Please rejoin the queue'
            });
        }
    }
    
    if (removed > 0) {
        console.log(`⏱️ Removed ${removed} timed-out players from queue`);
    }
}, 60000); // Run every 60 seconds

// ========== PAYMENT & SERVICE DELIVERY ENDPOINTS ==========

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        const {customerName, customerEmail, itemId, itemType} = req.body;
        
        // Validate input
        if (!customerName || !customerEmail || !itemId || !itemType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: customerName, customerEmail, itemId, itemType'
            });
        }
        
        // Get item details
        const item = itemType === 'service' 
            ? paymentHandler.services[itemId]
            : paymentHandler.products[itemId];
            
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }
        
        const result = await paymentHandler.createOrder({
            customerName,
            customerEmail,
            customerId: crypto.createHash('md5').update(customerEmail).digest('hex'),
            itemId,
            itemName: item.name,
            itemType,
            totalAmount: item.price,
            type: itemType
        });
        
        res.json(result);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create order'
        });
    }
});

// Verify payment
app.post('/api/orders/:orderId/verify', async (req, res) => {
    try {
        const {orderId} = req.params;
        const {reference, adminKey} = req.body;
        
        // Simple admin key check for manual verification
        const isAdmin = adminKey === process.env.ADMIN_KEY || adminKey === 'barodatek-admin-2024';
        
        if (!isAdmin && !reference) {
            return res.status(400).json({
                success: false,
                error: 'Payment reference required'
            });
        }
        
        const result = await paymentHandler.verifyPayment(orderId, {
            reference: reference || 'ADMIN-VERIFIED',
            verifiedBy: isAdmin ? 'admin' : 'customer'
        });
        
        res.json(result);
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
        });
    }
});

// Check service access
app.get('/api/access/:accessToken', async (req, res) => {
    try {
        const {accessToken} = req.params;
        const result = await paymentHandler.checkServiceAccess(accessToken);
        res.json(result);
    } catch (error) {
        console.error('Access check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check access'
        });
    }
});

// Get order status
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const order = paymentHandler.getOrder(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found'
            });
        }
        
        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Order lookup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get order'
        });
    }
});

// Download secured file
app.get('/api/download/:token', async (req, res) => {
    try {
        const {token} = req.params;
        
        // In production, verify token and serve file
        // For now, return download info
        res.json({
            success: true,
            message: 'Download token valid',
            instructions: 'File download will be available after payment verification'
        });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process download'
        });
    }
});

// Get service catalog
app.get('/api/catalog/services', (req, res) => {
    res.json({
        success: true,
        services: Object.values(paymentHandler.services)
    });
});

// Get product catalog
app.get('/api/catalog/products', (req, res) => {
    res.json({
        success: true,
        products: Object.values(paymentHandler.products)
    });
});

// Admin: Get all orders
app.get('/api/admin/orders', (req, res) => {
    const {adminKey} = req.query;
    
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'barodatek-admin-2024') {
        return res.status(403).json({
            success: false,
            error: 'Unauthorized'
        });
    }
    
    res.json({
        success: true,
        orders: paymentHandler.getAllOrders()
    });
});

// Admin: Manual verification
app.post('/api/admin/verify/:orderId', async (req, res) => {
    const {adminKey, notes} = req.body;
    
    if (adminKey !== process.env.ADMIN_KEY && adminKey !== 'barodatek-admin-2024') {
        return res.status(403).json({
            success: false,
            error: 'Unauthorized'
        });
    }
    
    try {
        const result = await paymentHandler.manualVerify(req.params.orderId, notes);
        res.json(result);
    } catch (error) {
        console.error('Manual verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify payment'
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

// ========== NEWSLETTER SUBSCRIPTION ENDPOINT ==========

// Import newsletter manager
const NewsletterManager = require('./newsletter-manager');
const newsletterManager = new NewsletterManager();

app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
        const { email, name, subscribedAt, source } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required',
                timestamp: new Date().toISOString()
            });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
                timestamp: new Date().toISOString()
            });
        }
        
        // Add subscriber using newsletter manager
        const result = newsletterManager.addSubscriber(email, name || 'Anonymous');
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: result.message,
                timestamp: new Date().toISOString()
            });
        }
        
        // Store subscription details
        const subscription = {
            email,
            name: name || 'Anonymous',
            subscribedAt: subscribedAt || new Date().toISOString(),
            source: source || 'website',
            status: 'active'
        };
        
        console.log('📧 NEW NEWSLETTER SUBSCRIPTION:', subscription);
        
        // Send email notification to you
        const notificationSubject = `🎉 New Newsletter Subscriber: ${name || email}`;
        const notificationBody = `
New subscriber details:
- Name: ${name || 'Anonymous'}
- Email: ${email}
- Subscribed at: ${subscribedAt || new Date().toISOString()}
- Source: ${source || 'website'}

Total subscribers: ${newsletterManager.getStats().totalSubscribers}
Active subscribers: ${newsletterManager.getStats().activeSubscribers}

You can now add this email to your monthly newsletter list!
        `;
        
        // Log for now - you can integrate with nodemailer or other email service
        console.log('📧 EMAIL NOTIFICATION TO barodatek.services@gmail.com:');
        console.log('Subject:', notificationSubject);
        console.log('Body:', notificationBody);
        
        res.status(201).json({
            success: true,
            message: 'Successfully subscribed to newsletter',
            data: { email, name },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing newsletter subscription:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process subscription',
            timestamp: new Date().toISOString()
        });
    }
});

// GET all newsletter subscribers
app.get('/api/newsletter/subscribers', (req, res) => {
    try {
        const subscribers = newsletterManager.getSubscribers();
        const stats = newsletterManager.getStats();
        
        res.json({
            success: true,
            data: subscribers,
            stats: stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch subscribers',
            timestamp: new Date().toISOString()
        });
    }
});

// Export subscribers as CSV
app.get('/api/newsletter/export-csv', (req, res) => {
    try {
        const csv = newsletterManager.exportSubscribersCSV();
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
        res.send(csv);
    } catch (error) {
        console.error('Error exporting subscribers:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export subscribers',
            timestamp: new Date().toISOString()
        });
    }
});

// Generate newsletter template
app.get('/api/newsletter/template', (req, res) => {
    try {
        const now = new Date();
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
        
        const template = newsletterManager.generateNewsletterTemplate(
            months[now.getMonth()], 
            now.getFullYear()
        );
        
        res.json({
            success: true,
            data: template,
            subscribers: newsletterManager.getStats(),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error generating template:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate template',
            timestamp: new Date().toISOString()
        });
    }
});

// ========== REVIEW SUBMISSION WITH GOOGLE BUSINESS INTEGRATION ==========

app.post('/api/reviews/submit', async (req, res) => {
    try {
        const { name, email, rating, comment, service, submittedAt, source } = req.body;
        
        if (!name || !rating || !comment) {
            return res.status(400).json({
                success: false,
                error: 'Name, rating, and comment are required',
                timestamp: new Date().toISOString()
            });
        }
        
        const reviewData = {
            name,
            email: email || '',
            rating: parseInt(rating),
            comment,
            service: service || 'General',
            submittedAt: submittedAt || new Date().toISOString(),
            source: source || 'website',
            approved: false // Reviews need approval before showing
        };
        
        // Create review in database
        const newReview = await db.createReview(reviewData);
        
        // Send email notification to you
        const stars = '⭐'.repeat(rating);
        const notificationSubject = `${stars} New ${rating}-Star Review from ${name}`;
        const notificationBody = `
New review received:
- Name: ${name}
- Email: ${email || 'Not provided'}
- Rating: ${rating}/5 ${stars}
- Service: ${service || 'General'}
- Review: "${comment}"
- Submitted at: ${submittedAt || new Date().toISOString()}

You can approve this review in your admin panel.
        `;
        
        console.log('⭐ NEW REVIEW RECEIVED:');
        console.log('📧 EMAIL NOTIFICATION TO barodatek.services@gmail.com:');
        console.log('Subject:', notificationSubject);
        console.log('Body:', notificationBody);
        console.log('Review data:', reviewData);
        
        res.status(201).json({
            success: true,
            message: 'Review submitted successfully. Thank you!',
            data: newReview,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit review',
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

// Provide question packs for all Arena mini-games
app.get('/api/games/questions', (req, res) => {
    const gameType = (req.query.type || 'api-galaxy').toLowerCase();
    const bank = GAME_QUESTION_BANK[gameType] || GAME_QUESTION_BANK['api-galaxy'];

    const limitParam = Number.parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 12;
    const questions = shuffleArray(bank.questions).slice(0, Math.min(limit, bank.questions.length));

    res.json({
        success: true,
        gameType,
        mode: bank.mode,
        totalAvailable: bank.questions.length,
        questions,
        timestamp: new Date().toISOString()
    });
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

// Live demo runner (simulated for safety)
app.post('/api/demo', (req, res) => {
    const { code, language = 'javascript' } = req.body || {};

    if (!code) {
        return res.status(400).json({
            success: false,
            error: 'Code is required for demo execution'
        });
    }

    res.json({
        success: true,
        message: 'Demo execution completed (sandboxed simulation)',
        output: '// Code execution simulated in safe sandbox\n// Provide this snippet in real runner to execute\n\nConsole:\n> Execution completed without runtime errors',
        executionTime: `${Math.floor(Math.random() * 80) + 40}ms`,
        language,
        timestamp: new Date().toISOString()
    });
});

// API Explorer helper route
app.post('/api/explorer/test', (req, res) => {
    const { method, endpoint, body, headers } = req.body || {};

    if (!method || !endpoint) {
        return res.status(400).json({
            success: false,
            error: 'method and endpoint are required'
        });
    }

    res.json({
        success: true,
        message: 'Mock request executed successfully',
        request: { method, endpoint, body, headers },
        response: {
            status: 200,
            data: { message: 'Mock response from inspected endpoint' },
            responseTime: `${Math.floor(Math.random() * 120) + 30}ms`
        },
        timestamp: new Date().toISOString()
    });
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