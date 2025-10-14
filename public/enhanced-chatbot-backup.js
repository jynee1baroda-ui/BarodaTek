// Enhanced AI Chatbot with Expanded Knowledge & Context
// BarodaTek Platform - Smart AI Assistant

class EnhancedChatbot {
    constructor() {
        this.conversationHistory = [];
        this.context = {};
        this.userPreferences = {};
        this.maxHistoryLength = 10;
    }

    // Process user message with context awareness
    async processMessage(userMessage) {
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        // Trim history if too long
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }

        // Analyze message intent
        const intent = this.analyzeIntent(userMessage);
        
        // Generate context-aware response
        const response = await this.generateResponse(userMessage, intent);

        // Add to conversation history
        this.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });

        return response;
    }

    // Analyze user intent
    analyzeIntent(message) {
        const msg = message.toLowerCase();

        // Game-related queries
        if (msg.includes('game') || msg.includes('play') || msg.includes('quiz') || msg.includes('challenge')) {
            return 'game';
        }

        // Coding help
        if (msg.includes('code') || msg.includes('programming') || msg.includes('develop') || msg.includes('javascript') || msg.includes('python')) {
            return 'coding';
        }

        // Learning requests
        if (msg.includes('learn') || msg.includes('teach') || msg.includes('explain') || msg.includes('how to') || msg.includes('what is')) {
            return 'learning';
        }

        // API-specific
        if (msg.includes('api') || msg.includes('rest') || msg.includes('endpoint') || msg.includes('http')) {
            return 'api';
        }

        // Technical help
        if (msg.includes('error') || msg.includes('bug') || msg.includes('problem') || msg.includes('debug') || msg.includes('fix')) {
            return 'debug';
        }

        // Pricing/business
        if (msg.includes('price') || msg.includes('cost') || msg.includes('pay') || msg.includes('buy') || msg.includes('subscription')) {
            return 'pricing';
        }

        // General conversation
        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('thank')) {
            return 'greeting';
        }

        // AI/ML topics
        if (msg.includes('ai') || msg.includes('machine learning') || msg.includes('artificial intelligence') || msg.includes('ml')) {
            return 'ai';
        }

        return 'general';
    }

    // Generate intelligent response
    async generateResponse(message, intent) {
        const responses = {
            game: this.getGameResponse(message),
            coding: this.getCodingResponse(message),
            learning: this.getLearningResponse(message),
            api: this.getAPIResponse(message),
            debug: this.getDebugResponse(message),
            pricing: this.getPricingResponse(message),
            greeting: this.getGreetingResponse(message),
            ai: this.getAIResponse(message),
            general: this.getGeneralResponse(message)
        };

        return responses[intent] || responses.general;
    }

    // Game-related responses
    getGameResponse(message) {
        const msg = message.toLowerCase();

        if (msg.includes('hint') || msg.includes('help with game') || msg.includes('stuck')) {
            return `
                <strong>🎮 Game Help & Hints</strong><br><br>
                
                <strong>How to Play:</strong><br>
                • Read each question carefully<br>
                • Click an answer button to submit<br>
                • Use the 💡 Hint button if you're stuck (-20 points)<br>
                • Click 👁️ Reveal Answer to see the correct answer<br>
                • ⏭️ Skip to move to the next question<br><br>
                
                <strong>🎯 Tips for High Scores:</strong><br>
                • Try answering without hints first<br>
                • Read explanations after each question<br>
                • Practice makes perfect!<br>
                • Review incorrect answers<br><br>
                
                <strong>📊 Scoring System:</strong><br>
                • Correct answer: +100 points<br>
                • Using hint: -20 points<br>
                • Wrong answer: 0 points<br><br>
                
                <strong>🏆 Grade Scale:</strong><br>
                • 100%: S Rank - Perfect!<br>
                • 90-99%: A+ - Outstanding<br>
                • 80-89%: A - Excellent<br>
                • 70-79%: B - Good Job<br>
                • 60-69%: C - Not Bad<br>
                • Below 60%: Keep Practicing!<br><br>
                
                Want to start a game now? Type "start api quiz" or "start debug game"! 🚀
            `;
        }

        if (msg.includes('answer') && (msg.includes('why') || msg.includes('explain'))) {
            return `
                <strong>📚 Understanding Game Answers</strong><br><br>
                
                Each question includes:<br>
                • <strong>Hint:</strong> Helps you think about the answer without giving it away<br>
                • <strong>Explanation:</strong> Teaches you why the answer is correct<br><br>
                
                After answering:<br>
                ✅ Correct answers turn <span style="color: #28a745;">green</span><br>
                ❌ Wrong answers turn <span style="color: #dc3545;">red</span> (correct one shown in green)<br><br>
                
                <strong>Why explanations matter:</strong><br>
                Learning WHY an answer is correct is more valuable than just getting points!
                Read each explanation to truly understand the concepts.<br><br>
                
                The goal isn't just to win - it's to learn and grow as a developer! 💪
            `;
        }

        return `
            <strong>🎮 Interactive Games Available</strong><br><br>
            
            We have 3 awesome games to test your skills:<br><br>
            
            <strong>1. 🌌 API Galaxy Quiz</strong><br>
            Test your API knowledge with questions about HTTP methods, status codes, REST, and more!<br>
            • 8 questions<br>
            • Hints available<br>
            • Detailed explanations<br><br>
            
            <strong>2. 🔍 Debug Detective</strong><br>
            Find and fix bugs in code snippets!<br>
            • Spot syntax errors<br>
            • Logical bugs<br>
            • Common mistakes<br><br>
            
            <strong>3. ⚡ Syntax Speed Run</strong><br>
            Complete code snippets quickly and correctly!<br>
            • Fast-paced<br>
            • Real coding scenarios<br>
            • Instant feedback<br><br>
            
            <strong>New Features:</strong><br>
            • 💡 Hint system for each question<br>
            • 👁️ Reveal answer option<br>
            • ⏭️ Skip questions<br>
            • 📖 Detailed explanations after each answer<br>
            • 🏆 Grade-based scoring (S, A+, A, B, C, D)<br><br>
            
            Ready to play? Scroll to the game section and click "Play Now"! 🚀
        `;
    }

    // Coding help responses
    getCodingResponse(message) {
        const msg = message.toLowerCase();

        if (msg.includes('javascript') || msg.includes('js')) {
            return `
                <strong>💻 JavaScript Help</strong><br><br>
                
                <strong>JavaScript Basics:</strong><br>
                JavaScript is a versatile programming language that runs in browsers and on servers (Node.js).<br><br>
                
                <div class="code-block">
                // Variables
                let name = "BarodaTek";
                const age = 25;
                var oldStyle = "avoid this";
                
                // Functions
                function greet(person) {
                    return \`Hello, \${person}!\`;
                }
                
                // Arrow functions
                const add = (a, b) => a + b;
                
                // Objects
                const user = {
                    name: "JBaroda",
                    email: "barodatek.services@gmail.com",
                    skills: ["JavaScript", "APIs", "Node.js"]
                };
                
                // Arrays
                const numbers = [1, 2, 3, 4, 5];
                numbers.map(n => n * 2); // [2, 4, 6, 8, 10]
                
                // Promises (async)
                async function fetchData() {
                    const response = await fetch('/api/data');
                    const data = await response.json();
                    return data;
                }
                </div>
                
                <strong>Common JavaScript Patterns:</strong><br>
                • Event listeners<br>
                • DOM manipulation<br>
                • Fetch API for HTTP requests<br>
                • Async/await for asynchronous code<br>
                • Array methods (map, filter, reduce)<br><br>
                
                <strong>Resources:</strong><br>
                • MDN Web Docs (mozilla.org)<br>
                • JavaScript.info<br>
                • FreeCodeCamp<br>
                • Our platform's interactive games!<br><br>
                
                What specific JavaScript topic would you like to explore? 🤔
            `;
        }

        if (msg.includes('python')) {
            return `
                <strong>🐍 Python Programming</strong><br><br>
                
                <strong>Why Python?</strong><br>
                Python is beginner-friendly, powerful, and used everywhere - web development, AI/ML, data science, automation!<br><br>
                
                <div class="code-block">
                # Variables
                name = "BarodaTek"
                age = 25
                
                # Functions
                def greet(person):
                    return f"Hello, {person}!"
                
                # Lists (like JS arrays)
                numbers = [1, 2, 3, 4, 5]
                doubled = [n * 2 for n in numbers]
                
                # Dictionaries (like JS objects)
                user = {
                    "name": "JBaroda",
                    "email": "barodatek.services@gmail.com",
                    "skills": ["Python", "APIs", "Flask"]
                }
                
                # Classes
                class Developer:
                    def __init__(self, name):
                        self.name = name
                    
                    def code(self):
                        return f"{self.name} is coding!"
                
                # APIs with Flask
                from flask import Flask, jsonify
                app = Flask(__name__)
                
                @app.route('/api/hello')
                def hello():
                    return jsonify({"message": "Hello World!"})
                </div>
                
                <strong>Python for APIs:</strong><br>
                • Flask - Lightweight web framework<br>
                • FastAPI - Modern, fast (high-performance)<br>
                • Django - Full-featured framework<br>
                • Requests - HTTP library for calling APIs<br><br>
                
                <strong>Learning Path:</strong><br>
                1. Basic syntax & data types<br>
                2. Functions & modules<br>
                3. Object-oriented programming<br>
                4. File handling & APIs<br>
                5. Web frameworks<br><br>
                
                Would you like code examples for a specific Python topic? 🎯
            `;
        }

        if (msg.includes('api')) {
            return this.getAPIResponse(message);
        }

        return `
            <strong>👨‍💻 Programming Help</strong><br><br>
            
            I can help you with many programming languages and concepts!<br><br>
            
            <strong>Popular Topics:</strong><br>
            • <strong>JavaScript</strong> - Web development, Node.js, React<br>
            • <strong>Python</strong> - Web apps, APIs, AI/ML, automation<br>
            • <strong>APIs</strong> - REST, HTTP methods, authentication<br>
            • <strong>Web Development</strong> - HTML, CSS, Frontend/Backend<br>
            • <strong>Databases</strong> - SQL, NoSQL, MongoDB, PostgreSQL<br>
            • <strong>Git & GitHub</strong> - Version control, collaboration<br>
            • <strong>Deployment</strong> - Vercel, Railway, Heroku, Docker<br><br>
            
            <strong>Code Examples Available For:</strong><br>
            • Building REST APIs<br>
            • Fetching data from APIs<br>
            • Database queries<br>
            • Authentication & security<br>
            • Real-time features (WebSocket)<br>
            • Error handling & debugging<br><br>
            
            What would you like to learn or build? Just ask! 🚀<br><br>
            
            Examples:<br>
            • "How do I create a REST API?"<br>
            • "Teach me Python basics"<br>
            • "Explain async/await in JavaScript"<br>
            • "How to connect to a database?"
        `;
    }

    // Learning-focused responses
    getLearningResponse(message) {
        const msg = message.toLowerCase();

        if (msg.includes('beginner') || msg.includes('start') || msg.includes('new to coding')) {
            return `
                <strong>🌱 Welcome to Coding!</strong><br><br>
                
                Starting your coding journey? You're in the right place!<br><br>
                
                <strong>📚 Recommended Learning Path:</strong><br><br>
                
                <strong>Step 1: Fundamentals (Weeks 1-2)</strong><br>
                • Variables & data types<br>
                • Functions & loops<br>
                • Conditionals (if/else)<br>
                • Arrays & objects<br>
                <small class="text-muted">Try our games to practice these!</small><br><br>
                
                <strong>Step 2: Web Basics (Weeks 3-4)</strong><br>
                • HTML structure<br>
                • CSS styling<br>
                • JavaScript interactivity<br>
                • DOM manipulation<br><br>
                
                <strong>Step 3: APIs & Backend (Weeks 5-8)</strong><br>
                • How APIs work<br>
                • HTTP methods (GET, POST, etc.)<br>
                • Building simple APIs<br>
                • Database basics<br><br>
                
                <strong>Step 4: Projects! (Ongoing)</strong><br>
                • Todo list app<br>
                • Weather app with API<br>
                • Simple blog<br>
                • Your own ideas!<br><br>
                
                <strong>💡 JBaroda's Advice:</strong><br>
                "I was completely new to coding too! The key is to build things, break things, and learn from errors.
                Don't worry about perfection - focus on progress. Every expert was once a beginner!" 💪<br><br>
                
                <strong>🎮 Practice on Our Platform:</strong><br>
                • Play the API Quiz to learn concepts<br>
                • Try the Debug Detective game<br>
                • Use the API Explorer to test real endpoints<br>
                • Ask me questions anytime!<br><br>
                
                What would you like to learn first? 🚀
            `;
        }

        return `
            <strong>📖 Learning Resources</strong><br><br>
            
            <strong>Interactive Learning on BarodaTek:</strong><br>
            • 🎮 <strong>Games:</strong> API Quiz, Debug Detective, Syntax Speed<br>
            • 🔧 <strong>Tools:</strong> API Explorer, Code Generator<br>
            • 💬 <strong>AI Assistant:</strong> Ask me anything! (that's me!)<br>
            • 📊 <strong>Real-time Practice:</strong> Test actual API calls<br><br>
            
            <strong>External Resources:</strong><br>
            • <strong>FreeCodeCamp:</strong> Free coding bootcamp<br>
            • <strong>MDN Web Docs:</strong> Comprehensive web dev docs<br>
            • <strong>JavaScript.info:</strong> Modern JavaScript tutorial<br>
            • <strong>Python.org:</strong> Official Python docs<br>
            • <strong>W3Schools:</strong> Quick reference & tutorials<br><br>
            
            <strong>Practice Projects:</strong><br>
            1. Build a personal portfolio website<br>
            2. Create a todo list app<br>
            3. Make a weather app (use APIs!)<br>
            4. Build a simple blog<br>
            5. Create a calculator<br><br>
            
            <strong>💡 Learning Tips:</strong><br>
            • Code every day (even 30 minutes helps!)<br>
            • Build projects, not just tutorials<br>
            • Don't be afraid to Google errors<br>
            • Join coding communities<br>
            • Teach others what you learn<br><br>
            
            What topic would you like to dive into? 🎯
        `;
    }

    // API-specific responses
    getAPIResponse(message) {
        const msg = message.toLowerCase();

        if (msg.includes('what is') || msg.includes('explain api')) {
            return `
                <strong>🔌 What is an API?</strong><br><br>
                
                <strong>Simple Explanation:</strong><br>
                An API (Application Programming Interface) is like a waiter in a restaurant:
                • You (client) tell the waiter what you want<br>
                • Waiter takes your order to the kitchen (server)<br>
                • Kitchen prepares your food (processes data)<br>
                • Waiter brings your food back (returns response)<br><br>
                
                <strong>🌐 Real-World Example:</strong><br>
                When you use a weather app:<br>
                1. App sends API request: "What's the weather in New York?"<br>
                2. Weather service (API) processes the request<br>
                3. API returns weather data<br>
                4. App displays it beautifully to you!<br><br>
                
                <div class="code-block">
                // Example API call
                fetch('https://api.weather.com/v1/current?city=NewYork')
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.temperature); // 72°F
                        console.log(data.condition); // Sunny
                    });
                </div>
                
                <strong>🛠️ Common API Types:</strong><br>
                • <strong>REST APIs:</strong> Most popular, uses HTTP methods<br>
                • <strong>GraphQL:</strong> Query exactly what you need<br>
                • <strong>WebSocket:</strong> Real-time, bidirectional<br>
                • <strong>SOAP:</strong> Older, XML-based (less common)<br><br>
                
                <strong>📚 HTTP Methods (REST):</strong><br>
                • <strong>GET:</strong> Retrieve data<br>
                • <strong>POST:</strong> Create new data<br>
                • <strong>PUT:</strong> Update existing data<br>
                • <strong>DELETE:</strong> Remove data<br>
                • <strong>PATCH:</strong> Partial update<br><br>
                
                Want to test a real API? Use our API Explorer! 🚀
            `;
        }

        if (msg.includes('create') || msg.includes('build') || msg.includes('make')) {
            return `
                <strong>🏗️ Building Your First API</strong><br><br>
                
                <strong>Step-by-Step Guide:</strong><br><br>
                
                <strong>1. Choose Your Stack:</strong><br>
                • Node.js + Express (JavaScript)<br>
                • Python + Flask/FastAPI<br>
                • Ruby + Rails<br>
                • PHP + Laravel<br><br>
                
                <strong>2. Example with Node.js:</strong><br>
                <div class="code-block">
                // Install: npm install express
                const express = require('express');
                const app = express();
                
                // Middleware
                app.use(express.json());
                
                // GET endpoint - Retrieve data
                app.get('/api/users', (req, res) => {
                    const users = [
                        { id: 1, name: 'JBaroda' },
                        { id: 2, name: 'BarodaTek' }
                    ];
                    res.json(users);
                });
                
                // POST endpoint - Create data
                app.post('/api/users', (req, res) => {
                    const newUser = req.body;
                    // Save to database...
                    res.status(201).json({
                        message: 'User created!',
                        user: newUser
                    });
                });
                
                // Start server
                app.listen(3000, () => {
                    console.log('API running on port 3000!');
                });
                </div>
                
                <strong>3. Test Your API:</strong><br>
                • Use Postman or Insomnia<br>
                • Or try our API Explorer!<br>
                • Browser for GET requests<br>
                • curl command line tool<br><br>
                
                <strong>4. Add Database:</strong><br>
                <div class="code-block">
                // With MongoDB
                const mongoose = require('mongoose');
                mongoose.connect('mongodb://localhost/myapp');
                
                const User = mongoose.model('User', {
                    name: String,
                    email: String
                });
                
                app.get('/api/users', async (req, res) => {
                    const users = await User.find();
                    res.json(users);
                });
                </div>
                
                <strong>5. Deploy:</strong><br>
                • Vercel (frontend + serverless)<br>
                • Railway (full stack)<br>
                • Heroku (traditional hosting)<br>
                • DigitalOcean (VPS)<br><br>
                
                <strong>🔒 Don't Forget:</strong><br>
                • Add authentication (JWT tokens)<br>
                • Rate limiting<br>
                • CORS headers<br>
                • Error handling<br>
                • Input validation<br><br>
                
                Need help with a specific part? Just ask! 💪
            `;
        }

        return `
            <strong>🔌 API Development Guide</strong><br><br>
            
            APIs power the modern web! Here's everything you need to know:<br><br>
            
            <strong>📚 Core Concepts:</strong><br>
            • <strong>Endpoints:</strong> URLs where requests are sent<br>
            • <strong>Methods:</strong> GET, POST, PUT, DELETE<br>
            • <strong>Headers:</strong> Metadata about the request<br>
            • <strong>Body:</strong> Data sent with POST/PUT<br>
            • <strong>Status Codes:</strong> 200 OK, 404 Not Found, etc.<br>
            • <strong>Authentication:</strong> Securing your API<br><br>
            
            <strong>🎯 Best Practices:</strong><br>
            • Use meaningful endpoint names (/users, not /u)<br>
            • Return proper status codes<br>
            • Version your API (/api/v1/users)<br>
            • Document everything<br>
            • Handle errors gracefully<br>
            • Add rate limiting<br><br>
            
            <strong>🔧 Our API Tools:</strong><br>
            • <strong>API Explorer:</strong> Test endpoints live<br>
            • <strong>Code Generator:</strong> Generate client code<br>
            • <strong>Mock Contracts:</strong> Prototype APIs<br>
            • <strong>Documentation:</strong> Auto-generated docs<br><br>
            
            <strong>📖 Quick Examples:</strong><br>
            Type any of these to learn more:<br>
            • "How to create an API"<br>
            • "What is REST"<br>
            • "Explain HTTP methods"<br>
            • "API authentication"<br>
            • "API testing"<br><br>
            
            What API topic interests you? 🚀
        `;
    }

    // Debug help responses
    getDebugResponse(message) {
        return `
            <strong>🐛 Debugging Assistant</strong><br><br>
            
            Stuck on an error? Let's fix it together!<br><br>
            
            <strong>🔍 Common Issues & Solutions:</strong><br><br>
            
            <strong>1. "Cannot read property of undefined"</strong><br>
            • Check if object exists before accessing properties<br>
            • Use optional chaining: <code>user?.name</code><br>
            • Add null checks: <code>if (user) { ... }</code><br><br>
            
            <strong>2. "Unexpected token"</strong><br>
            • Missing closing brackets/parentheses<br>
            • Extra or missing comma<br>
            • Quote mismatch (' vs ")<br><br>
            
            <strong>3. "CORS Error"</strong><br>
            • Server needs CORS headers enabled<br>
            • Use a CORS proxy in development<br>
            • Check API documentation<br><br>
            
            <strong>4. "404 Not Found"</strong><br>
            • Check endpoint URL spelling<br>
            • Verify server is running<br>
            • Check HTTP method (GET vs POST)<br><br>
            
            <strong>5. "500 Internal Server Error"</strong><br>
            • Server-side error<br>
            • Check server logs<br>
            • Verify request data format<br><br>
            
            <strong>🛠️ Debugging Tools:</strong><br>
            • <strong>Browser Console:</strong> F12 → Console tab<br>
            • <strong>Network Tab:</strong> See all API calls<br>
            • <strong>Console.log():</strong> Your best friend!<br>
            • <strong>Debugger:</strong> Set breakpoints<br>
            • <strong>VS Code:</strong> Built-in debugger<br><br>
            
            <div class="code-block">
            // Debugging example
            function fetchData() {
                console.log('Starting fetch...');
                
                fetch('/api/data')
                    .then(res => {
                        console.log('Response status:', res.status);
                        return res.json();
                    })
                    .then(data => {
                        console.log('Data received:', data);
                    })
                    .catch(error => {
                        console.error('Error occurred:', error);
                    });
            }
            </div>
            
            <strong>💡 JBaroda's Debug Tips:</strong><br>
            "When I first started, every error felt scary. Now I know:
            errors are your teachers! They tell you exactly what's wrong.
            Read them carefully, Google them, and you'll learn fast!" 🚀<br><br>
            
            <strong>🆘 Still Stuck?</strong><br>
            Share your error message and I'll help you solve it!
            Or email: <a href="mailto:barodatek.services@gmail.com">barodatek.services@gmail.com</a>
        `;
    }

    // Pricing responses
    getPricingResponse(message) {
        return `
            <strong>💰 Pricing & Payment</strong><br><br>
            
            <strong>📧 Get Custom Pricing:</strong><br>
            Email us at: <a href="mailto:barodatek.services@gmail.com?subject=Pricing%20Inquiry&body=Hi%20BarodaTek%2C%0A%0AI'm%20interested%20in%20pricing%20for%3A%0A%0AMy%20needs%3A%0A-%0A%0APlease%20send%20payment%20details." style="color: #667eea; font-weight: bold;">barodatek.services@gmail.com</a><br><br>
            
            <strong>💳 Payment Method:</strong><br>
            We accept <strong>Cash App: $baroda98</strong> 💚<br>
            (Primary and fastest payment option)<br><br>
            
            <strong>📦 What We Offer:</strong><br>
            • Custom API development<br>
            • Platform subscriptions<br>
            • Pro service tools<br>
            • Enterprise solutions<br>
            • Training & consulting<br><br>
            
            <strong>✅ We'll Send You:</strong><br>
            • Detailed pricing breakdown<br>
            • Cash App payment instructions<br>
            • Setup timeline<br>
            • What's included<br>
            • Direct contact info<br><br>
            
            <strong>⚡ Response Time:</strong> Within 24 hours!<br><br>
            
            <strong>🎁 Free Features:</strong><br>
            Try these for free right now:<br>
            • Interactive games<br>
            • API Explorer<br>
            • Code Generator<br>
            • This AI chatbot!<br>
            • Basic testing tools<br><br>
            
            Would you like me to open your email client? 📧
        `;
    }

    // Greeting responses
    getGreetingResponse(message) {
        const msg = message.toLowerCase();
        const hour = new Date().getHours();
        let timeGreeting = 'Hello';
        
        if (hour < 12) timeGreeting = 'Good morning';
        else if (hour < 18) timeGreeting = 'Good afternoon';
        else timeGreeting = 'Good evening';

        if (msg.includes('thank')) {
            return `
                <strong>🙏 You're Very Welcome!</strong><br><br>
                
                I'm happy I could help! That's what I'm here for. 😊<br><br>
                
                <strong>Need anything else?</strong><br>
                • Continue learning<br>
                • Try our games<br>
                • Ask more questions<br>
                • Explore the platform<br><br>
                
                Remember: Every expert was once a beginner. Keep coding, keep learning! 💪<br><br>
                
                - Your BarodaTek AI Assistant 🤖
            `;
        }

        return `
            <strong>${timeGreeting}! 👋</strong><br><br>
            
            I'm the BarodaTek AI Assistant, here to help you learn, build, and grow!<br><br>
            
            <strong>What I Can Help With:</strong><br>
            • 🎮 Play interactive coding games<br>
            • 💻 Learn programming (JavaScript, Python, APIs)<br>
            • 🔧 Debug code and fix errors<br>
            • 📚 Explain concepts simply<br>
            • 🚀 Build your first API<br>
            • 💡 Answer any tech questions<br>
            • 💬 Just chat about coding!<br><br>
            
            <strong>Quick Start Ideas:</strong><br>
            • "Start a game"<br>
            • "Teach me JavaScript"<br>
            • "How do APIs work?"<br>
            • "Help me debug an error"<br>
            • "I'm a complete beginner"<br><br>
            
            What would you like to explore today? 🚀
        `;
    }

    // AI/ML responses
    getAIResponse(message) {
        return `
            <strong>🤖 AI & Machine Learning</strong><br><br>
            
            <strong>What is AI?</strong><br>
            Artificial Intelligence is teaching computers to think and learn like humans!<br><br>
            
            <strong>🧠 Types of AI:</strong><br>
            • <strong>Machine Learning:</strong> Computers learn from data<br>
            • <strong>Deep Learning:</strong> Neural networks (like brain)<br>
            • <strong>Natural Language Processing:</strong> Understanding text (like me!)<br>
            • <strong>Computer Vision:</strong> Analyzing images<br>
            • <strong>Generative AI:</strong> Creating content (ChatGPT, etc.)<br><br>
            
            <strong>🛠️ AI in Development:</strong><br>
            • <strong>GitHub Copilot:</strong> AI code completion<br>
            • <strong>ChatGPT:</strong> Code explanations & debugging<br>
            • <strong>Tabnine:</strong> Smart autocomplete<br>
            • <strong>Cursor:</strong> AI-powered IDE<br><br>
            
            <div class="code-block">
            // Simple AI chatbot example
            async function aiChat(message) {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message })
                });
                const data = await response.json();
                return data.reply;
            }
            
            // Using OpenAI API
            const openai = require('openai');
            const client = new openai({ apiKey: process.env.OPENAI_API_KEY });
            
            const completion = await client.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: "Explain APIs" }]
            });
            </div>
            
            <strong>🎯 Learning AI:</strong><br>
            1. <strong>Learn Python:</strong> Most AI work uses Python<br>
            2. <strong>Math Basics:</strong> Statistics, linear algebra<br>
            3. <strong>Libraries:</strong> TensorFlow, PyTorch, scikit-learn<br>
            4. <strong>Projects:</strong> Start with simple predictions<br><br>
            
            <strong>💡 JBaroda's AI Journey:</strong><br>
            "AI seemed magical at first! But it's just math and data. Start by integrating
            existing AI APIs (like OpenAI) into your apps. Then dive deeper if you're curious!" 🚀<br><br>
            
            <strong>🔮 AI Trends in 2025:</strong><br>
            • Open-source SaaS with AI features<br>
            • Low-code/no-code AI tools<br>
            • Local AI models (Ollama, LLama)<br>
            • AI agents that can use tools<br>
            • AI-powered development tools<br><br>
            
            Want to build something with AI? I can guide you! 💪
        `;
    }

    // General responses
    getGeneralResponse(message) {
        return `
            <strong>💬 Let's Chat!</strong><br><br>
            
            I'm here to help with anything related to coding, APIs, or learning to program!<br><br>
            
            <strong>Popular Questions:</strong><br>
            • "How do I start learning to code?"<br>
            • "What is an API?"<br>
            • "Help me debug this error"<br>
            • "Teach me JavaScript"<br>
            • "How do I build a website?"<br>
            • "What are the best resources?"<br><br>
            
            <strong>Platform Features:</strong><br>
            • 🎮 Interactive games<br>
            • 🔧 API testing tools<br>
            • 💻 Code generator<br>
            • 📊 Real-time analytics<br>
            • 🤖 AI assistant (me!)<br><br>
            
            <strong>About BarodaTek:</strong><br>
            This platform was built by JBaroda, who started as a complete beginner!
            It's designed to make learning coding fun, practical, and accessible for everyone. 💙<br><br>
            
            What would you like to know or try? Just ask! 🚀
        `;
    }

    // Get conversation context
    getContext() {
        return this.conversationHistory;
    }

    // Clear history
    clearHistory() {
        this.conversationHistory = [];
        this.context = {};
    }
}

// Global instance
window.enhancedChatbot = new EnhancedChatbot();

// Integration function for existing chatbot.html
async function processEnhancedMessage(message) {
    return await window.enhancedChatbot.processMessage(message);
}

window.processEnhancedMessage = processEnhancedMessage;

console.log('✅ Enhanced Chatbot Engine Loaded!');
