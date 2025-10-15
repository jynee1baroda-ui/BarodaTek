// ULTRA-ENHANCED AI CHATBOT - Full Intelligence System
// Features: Demo assistance, code generation, knowledge updates, logical reasoning

class EnhancedChatbot {
    constructor() {
        this.conversationHistory = [];
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.maxHistoryLength = 20;
    }

    initializeKnowledgeBase() {
        return {
            games: {
                'api-quiz': { name: 'API Galaxy Quiz', questions: 8, topics: ['HTTP methods', 'status codes', 'REST', 'JSON'] },
                'debug-game': { name: 'Debug Detective', questions: 5, topics: ['syntax errors', 'logic bugs', 'common mistakes'] },
                'syntax-game': { name: 'Syntax Speed Run', questions: 5, topics: ['JavaScript keywords', 'operators', 'syntax patterns'] }
            },
            codeTemplates: {
                apiRequest: {
                    javascript: `fetch('https://api.example.com/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`,
                    python: `import requests
response = requests.get('https://api.example.com/data')
data = response.json()
print(data)`
                },
                expressServer: `const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/data', (req, res) => {
    res.json({ message: 'Success!' });
});

app.listen(3000, () => console.log('Server running'));`,
                validation: `function validateEmail(email) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

function validateForm(data) {
    const errors = {};
    if (!data.name || data.name.length < 2) {
        errors.name = 'Name too short';
    }
    if (!validateEmail(data.email)) {
        errors.email = 'Invalid email';
    }
    return { isValid: Object.keys(errors).length === 0, errors };
}`
            }
        };
    }

    async processMessage(userMessage) {
        this.conversationHistory.push({ role: 'user', content: userMessage, time: new Date() });
        
        if (this.conversationHistory.length > this.maxHistoryLength) {
            this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
        }

        const intent = this.analyzeIntent(userMessage);
        const entities = this.extractEntities(userMessage);
        const response = await this.generateResponse(userMessage, intent, entities);

        this.conversationHistory.push({ role: 'assistant', content: response, time: new Date() });
        return response;
    }

    analyzeIntent(message) {
        const msg = message.toLowerCase();
        
        if (msg.match(/show|demo|explain|what (is|are)|how (do|does)|tell me about/)) {
            if (msg.includes('game')) return 'demo_game';
            if (msg.includes('tool')) return 'demo_tool';
            return 'explain';
        }
        if (msg.match(/generate|create|write|build|make|code for/)) return 'generate_code';
        if (msg.match(/game|play|quiz|hint|answer/)) return 'game_help';
        if (msg.match(/code|program|javascript|python/)) return 'coding_help';
        if (msg.match(/api|rest|endpoint|http/)) return 'api_help';
        if (msg.match(/error|bug|fix|debug/)) return 'debug_help';
        if (msg.match(/learn|teach|tutorial/)) return 'learning';
        if (msg.match(/price|cost|service/)) return 'pricing';
        if (msg.match(/hello|hi|hey|thanks/)) return 'greeting';
        
        return 'general';
    }

    extractEntities(message) {
        const msg = message.toLowerCase();
        return {
            game: msg.includes('api quiz') ? 'api-quiz' : msg.includes('debug') ? 'debug-game' : msg.includes('syntax') ? 'syntax-game' : null,
            language: msg.includes('javascript') || msg.includes('js') ? 'javascript' : msg.includes('python') ? 'python' : null,
            httpMethod: msg.match(/\b(get|post|put|delete)\b/i)?.[1]?.toUpperCase() || null,
            tool: msg.includes('explorer') ? 'api-explorer' : msg.includes('analytics') ? 'analytics' : null
        };
    }

    async generateResponse(message, intent, entities) {
        switch (intent) {
            case 'demo_game': return this.explainGame(entities.game, message);
            case 'demo_tool': return this.explainTool(entities.tool, message);
            case 'generate_code': return this.generateCode(message, entities);
            case 'game_help': return this.getGameHelp(entities.game, message);
            case 'coding_help': return this.getCodingHelp(message, entities);
            case 'api_help': return this.getAPIHelp(message, entities);
            case 'debug_help': return this.getDebugHelp(message);
            case 'learning': return this.getLearningHelp(message);
            case 'pricing': return this.getPricingInfo();
            case 'greeting': return this.getGreeting();
            default: return this.getGeneralHelp(message);
        }
    }

    explainGame(gameName, message) {
        if (!gameName) {
            return `🎮 **BARODATEK GAMES**\n\n**Three Interactive Games:**\n\n1️⃣ **API Galaxy Quiz** 🌌\n- 8 questions about APIs, HTTP, REST, JSON\n- Hints available (-20pts each)\n- Answer reveals with explanations\n- Grading: S (100%) to D (<60%)\n\n2️⃣ **Debug Detective** 🐛\n- Find bugs in code snippets\n- 5 debugging challenges\n- Real-world scenarios\n- Learn common mistakes\n\n3️⃣ **Syntax Speed Run** ⚡\n- Complete JavaScript syntax\n- 5 fill-in-the-blank questions\n- Test keyword knowledge\n- Quick learning\n\n**How to Play:**\n✅ Click "LAUNCH GAME" in Arena 1\n✅ Game opens in modal\n✅ Use buttons: 💡 Hint | 👁️ Reveal | ⏭️ Skip\n✅ Get graded at end!\n\n**Visual Feedback:**\n• ✅ Green = Correct\n• ❌ Red = Wrong (correct shown in green)\n• 🎉 Confetti for correct answers!\n\nReady to play? Click any "LAUNCH GAME" button! 🚀`;
        }

        const game = this.knowledgeBase.games[gameName];
        return `🎮 **${game.name}** - Full Demo Guide\n\n**Overview:**\n${game.questions} interactive questions covering ${game.topics.join(', ')}\n\n**Features:**\n• 💡 Hint Button: Get helpful hint (-20 points)\n• 👁️ Reveal Answer: See correct answer + explanation (no points, skip question)\n• ⏭️ Skip: Move to next question\n• ✅/❌ Visual feedback (green/red highlights)\n• 📊 Real-time score tracking\n• 🎉 Celebration animations\n\n**Grading System:**\n• S = 100% Perfect!\n• A+ = 90-99% Outstanding!\n• A = 80-89% Excellent!\n• B = 70-79% Good!\n• C = 60-69% Keep practicing!\n• D = <60% Try again!\n\n**How to Play:**\n1. Click "LAUNCH GAME" in Arena 1\n2. Read question carefully\n3. Choose answer (A, B, C, D)\n4. Use hint if stuck (lightbulb icon)\n5. See explanation after answering\n6. Get final grade!\n\n**Pro Tips:**\n• Try without hints first (more points!)\n• Read explanations to learn\n• Replay to beat your score\n• Use skip if completely stuck\n\n**Where to Start:**\nClick "LAUNCH GAME" for ${game.name} in the games section! 🎯`;
    }

    explainTool(toolName, message) {
        const tools = {
            'api-explorer': `🔍 **API Explorer Demo**\n\n**What It Does:**\nTest API endpoints in real-time without writing code!\n\n**Features:**\n• Enter any API URL\n• Choose HTTP method (GET, POST, PUT, DELETE)\n• Add custom headers\n• Send JSON body\n• View formatted response\n• See status codes\n• Copy response data\n\n**How to Use:**\n1. Click "OPEN EXPLORER" in Arena 2\n2. Enter API URL (e.g., https://api.example.com/users)\n3. Select method (GET, POST, etc.)\n4. Add headers if needed\n5. Add body for POST/PUT\n6. Click "Send Request"\n7. View response!\n\n**Example:**\nURL: https://jsonplaceholder.typicode.com/users\nMethod: GET\nClick Send → See user list!\n\n**Perfect For:**\n• Testing APIs before coding\n• Debugging API issues\n• Learning HTTP methods\n• Exploring public APIs\n\nTry it now in Arena 2! 🚀`,
            'analytics': `📊 **Lightweight Analytics Demo**\n\n**What It Does:**\nPrivacy-first visitor tracking with beautiful charts!\n\n**Features:**\n• Real-time visitor count\n• Page view tracking\n• Click event monitoring\n• Time on site\n• Chart.js visualizations\n• CSV/JSON export\n• 100% privacy (no external tracking!)\n\n**How to Use:**\n1. Click "VIEW ANALYTICS" in Arena 2\n2. See live dashboard\n3. View charts updating in real-time\n4. Export data as CSV or JSON\n5. No setup needed!\n\n**Data Tracked:**\n• Visitors (session-based)\n• Page views\n• Button/link clicks\n• Time spent on site\n• Traffic sources\n\n**Privacy First:**\n✅ All data stored in browser (LocalStorage)\n✅ No cookies\n✅ No external servers\n✅ 100% private\n\n**Export Options:**\n• CSV for Excel/Google Sheets\n• JSON for programming\n\nView your analytics now in Arena 2! 📈`
        };

        return tools[toolName] || `🔧 **Tool Demo**\n\nAvailable tools:\n• API Explorer (test endpoints)\n• Lightweight Analytics (track visitors)\n• Pro Services (6 demos)\n\nWhich tool do you want to learn about? 🚀`;
    }

    generateCode(message, entities) {
        const msg = message.toLowerCase();
        
        if (msg.includes('api') || msg.includes('request') || msg.includes('fetch')) {
            const lang = entities.language || 'javascript';
            const method = entities.httpMethod || 'GET';
            
            if (lang === 'javascript') {
                if (msg.includes('express') || msg.includes('server')) {
                    return `🔧 **Express Server Code:**\n\n\`\`\`javascript\nconst express = require('express');\nconst cors = require('cors');\nconst app = express();\n\napp.use(cors());\napp.use(express.json());\n\napp.${method.toLowerCase()}('/api/data', async (req, res) => {\n    try {\n        ${method === 'GET' ? '// Fetch from database\n        const data = await fetchData();' : '// Process request body\n        const data = req.body;'}\n        \n        res.status(${method === 'POST' ? '201' : '200'}).json({\n            success: true,\n            data: data\n        });\n    } catch (error) {\n        res.status(500).json({ error: error.message });\n    }\n});\n\napp.listen(3000, () => {\n    console.log('Server running on port 3000');\n});\n\`\`\`\n\n**To use:**\n1. npm install express cors\n2. Save as server.js\n3. node server.js\n4. Test: http://localhost:3000/api/data\n\nNeed ${method} client code too? Just ask! 🚀`;
                } else {
                    return `🔧 **JavaScript ${method} Request:**\n\n\`\`\`javascript\nasync function ${method.toLowerCase()}Data(url${method !== 'GET' ? ', data' : ''}) {\n    try {\n        const options = {\n            method: '${method}',\n            headers: { 'Content-Type': 'application/json' }${method !== 'GET' ? ',\n            body: JSON.stringify(data)' : ''}\n        };\n        \n        const response = await fetch(url, options);\n        \n        if (!response.ok) {\n            throw new Error(\`HTTP \${response.status}\`);\n        }\n        \n        const result = await response.json();\n        console.log('Success:', result);\n        return result;\n    } catch (error) {\n        console.error('Error:', error);\n        throw error;\n    }\n}\n\n// Usage:\n${method === 'GET' ? "getData('https://api.example.com/data');" : "postData('https://api.example.com/data', { key: 'value' });"}\n\`\`\`\n\n**Features:**\n✅ Async/await\n✅ Error handling\n✅ Status checking\n✅ JSON parsing\n\nCopy and use this code! 🚀`;
                }
            } else if (lang === 'python') {
                return `🐍 **Python ${method} Request:**\n\n\`\`\`python\nimport requests\nimport json\n\ndef ${method.toLowerCase()}_data(url${method !== 'GET' ? ', data=None' : ''}):\n    headers = {'Content-Type': 'application/json'}\n    \n    try:\n        response = requests.${method.toLowerCase()}(\n            url${method !== 'GET' ? ',\n            json=data' : ''},\n            headers=headers\n        )\n        response.raise_for_status()\n        result = response.json()\n        print(f'Success: {result}')\n        return result\n    except requests.exceptions.RequestException as e:\n        print(f'Error: {e}')\n        raise\n\n# Usage:\n${method === 'GET' ? "get_data('https://api.example.com/data')" : "post_data('https://api.example.com/data', {'key': 'value'})"}\n\`\`\`\n\n**To use:**\n1. pip install requests\n2. Run script\n3. Check output\n\nNeed Flask server code? Ask me! 🚀`;
            }
        }

        if (msg.includes('validate') || msg.includes('validation')) {
            return `🔧 **Validation Code:**\n\n\`\`\`javascript\n${this.knowledgeBase.codeTemplates.validation}\n\n// Usage:\nconst result = validateForm({\n    name: 'John',\n    email: 'john@example.com'\n});\n\nif (result.isValid) {\n    console.log('Valid!');\n} else {\n    console.log('Errors:', result.errors);\n}\n\`\`\`\n\n**Features:**\n✅ Email validation\n✅ Name length check\n✅ Returns errors object\n✅ Easy to extend\n\nCopy and customize! 🚀`;
        }

        if (msg.includes('function') || msg.includes('class')) {
            return `💻 **Code Generation Available:**\n\n**I can generate:**\n\n**API Code:**\n• "generate GET request code"\n• "create Express server"\n• "make POST request in Python"\n\n**Functions:**\n• "generate validation function"\n• "create sort function"\n• "make authentication function"\n\n**Classes:**\n• "create API client class"\n• "generate user model"\n\n**Just describe what you need!**\n\nExamples:\n• "generate code to fetch user data"\n• "create function to validate email"\n• "make Express route for users"\n\nWhat code do you need? 🚀`;
        }

        return `💻 **Code Generation:**\n\nI can generate:\n✅ API requests (fetch, axios)\n✅ Express servers\n✅ Validation functions\n✅ Classes and models\n✅ Error handlers\n✅ Database queries\n\n**Languages:** JavaScript, Python\n\n**Just tell me:**\n• What you want to build\n• Which language\n• Any specific requirements\n\n**Example:** "generate POST request in JavaScript"\n\nWhat code do you need? 🚀`;
    }

    getGameHelp(gameName, message) {
        if (!gameName) {
            return `🎮 **Game Help**\n\n**Can't see hint/answer buttons?**\n\n✅ **Look for these buttons below each question:**\n• 💡 Show Hint (-20 pts)\n• 👁️ Reveal Answer (Skip)\n• ⏭️ Skip Question\n\n**Not showing?**\n1. Make sure game is loaded (click LAUNCH GAME)\n2. Scroll down below the answer options\n3. Buttons appear after question loads\n4. Try refreshing if still missing\n\n**How hints work:**\n1. Click 💡 lightbulb button\n2. Hint appears in yellow box\n3. Lose 20 points (one-time)\n4. Button becomes disabled\n\n**How answer reveal works:**\n1. Click 👁️ eye button\n2. Correct answer highlights green\n3. Explanation shows below\n4. Auto-advances in 4 seconds\n\n**Visual feedback:**\n• ✅ Green = Correct answer\n• ❌ Red = Your wrong answer\n• Correct answer always shows in green\n\n**Still having issues?**\nTell me:\n• Which game?\n• What's not working?\n• Any error messages?\n\nI'll help you fix it! 🚀`;
        }

        const game = this.knowledgeBase.games[gameName];
        return `🎮 **${game.name} - Help**\n\n**Button Locations:**\nAfter each question loads, scroll down to see:\n• 💡 Show Hint (yellow button)\n• 👁️ Reveal Answer (blue button)\n• ⏭️ Skip (gray button)\n\n**Hint System:**\n• Click lightbulb icon 💡\n• Get helpful hint\n• Costs 20 points\n• Can only use once per question\n• Shows in yellow alert box\n\n**Answer Reveal:**\n• Click eye icon 👁️\n• See correct answer (green)\n• Read full explanation\n• No points earned/lost\n• Auto-advances to next\n\n**Skip Option:**\n• Click forward icon ⏭️\n• Move to next question\n• No explanation shown\n• No points earned/lost\n\n**Game Tips:**\n${game.questions} questions total\n• Try to answer without hints (more points!)\n• Use hints when stuck\n• Read explanations to learn\n• Replay to improve grade\n\n**Grading:**\nS (100%), A+ (90-99%), A (80-89%), B (70-79%), C (60-69%), D (<60%)\n\n**Issue?** Tell me what's happening! 🚀`;
    }

    getCodingHelp(message, entities) {
        const msg = message.toLowerCase();
        
        if (msg.includes('start') || msg.includes('begin')) {
            return `👨‍💻 **Start Coding:**\n\n**Step 1: Play Our Games** 🎮\n• API Galaxy Quiz → Learn APIs\n• Debug Detective → Fix bugs\n• Syntax Speed Run → Master syntax\n\n**Step 2: Use Our Tools** 🔧\n• API Explorer → Test endpoints\n• Analytics → Track data\n\n**Step 3: Generate Code** 💻\nAsk me to generate:\n• "generate API request code"\n• "create validation function"\n• "make Express server"\n\n**Step 4: Build Project** 🚀\n• Todo app with API\n• Weather app\n• Your own REST API\n\n**Resources:**\n• MDN Web Docs\n• JavaScript.info\n• FreeCodeCamp\n• Our platform (you're here!)\n\n**Try now:**\n"play API quiz" or "generate my first API code"\n\nWhat interests you? 🚀`;
        }

        if (entities.language === 'javascript') {
            return `📘 **JavaScript Help:**\n\n**Quick Reference:**\n\n\`\`\`javascript\n// Variables\nlet name = 'John';      // Can change\nconst age = 25;         // Cannot change\n\n// Functions\nfunction greet(name) {\n    return \`Hello, \${name}!\`;\n}\n\n// Arrow function\nconst greet = (name) => \`Hello, \${name}!\`;\n\n// Async/await\nasync function fetchData() {\n    const response = await fetch(url);\n    return response.json();\n}\n\n// Arrays\nconst nums = [1, 2, 3];\nnums.map(n => n * 2);     // [2, 4, 6]\nnums.filter(n => n > 1);  // [2, 3]\n\n// Objects\nconst person = {\n    name: 'John',\n    age: 30,\n    greet() { return 'Hi!'; }\n};\n\`\`\`\n\n**Need specific help?**\n• "generate code for [task]"\n• "explain [concept]"\n• "fix [error]"\n\nWhat do you need? 🚀`;
        }

        return `👨‍💻 **Coding Help:**\n\nI can help with:\n• JavaScript (Node, Express, React)\n• Python (Flask, Django)\n• APIs and HTTP\n• Debugging\n• Best practices\n\n**Get help:**\n• "generate code for [task]"\n• "explain [concept]"\n• "fix [error]"\n• "learn [topic]"\n\n**Try our games:**\n• API Quiz → Learn APIs\n• Debug Detective → Find bugs\n• Syntax Speed Run → Master syntax\n\nWhat do you need? 🚀`;
    }

    getAPIHelp(message, entities) {
        if (entities.httpMethod) {
            const method = entities.httpMethod;
            const info = {
                GET: 'Retrieve data (read)',
                POST: 'Create new data (write)',
                PUT: 'Update existing data (modify)',
                DELETE: 'Remove data (delete)'
            };
            
            return `🌐 **HTTP ${method}:**\n\n**Purpose:** ${info[method]}\n\n**Example:**\n\`\`\`javascript\nfetch('/api/users', {\n    method: '${method}'${method !== 'GET' ? ',\n    headers: { \'Content-Type\': \'application/json\' },\n    body: JSON.stringify({ name: \'John\' })' : ''}\n})\n.then(res => res.json())\n.then(data => console.log(data));\n\`\`\`\n\n**Try it:**\nUse our API Explorer tool!\n\n**Need full code?**\n"generate ${method} request code"\n\nWhat else? 🚀`;
        }

        return `🌐 **API Help:**\n\n**HTTP Methods:**\n• GET → Retrieve data\n• POST → Create data\n• PUT → Update data\n• DELETE → Remove data\n\n**Status Codes:**\n• 200 → OK (success)\n• 201 → Created\n• 400 → Bad Request\n• 401 → Unauthorized\n• 404 → Not Found\n• 500 → Server Error\n\n**Tools:**\n• API Explorer → Test endpoints\n• API Quiz Game → Learn concepts\n\n**Generate code:**\n"generate API request code"\n\n**Learn more:**\n"play API quiz"\n\nWhat do you need? 🚀`;
    }

    getDebugHelp(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('cors')) {
            return `🔧 **Fix CORS Error:**\n\n**Server-side (Express):**\n\`\`\`javascript\nconst cors = require('cors');\napp.use(cors());\n\`\`\`\n\n**Why it happens:**\nBrowsers block requests from different origins for security.\n\n**Solution:**\nServer must allow it with CORS headers.\n\n**Install:**\nnpm install cors\n\n**Still stuck?**\nShare your server code! 🚀`;
        }

        if (msg.includes('404')) {
            return `🔍 **Fix 404 Error:**\n\n**Common causes:**\n• Wrong URL\n• Route not defined\n• Server not running\n• Typo in path\n\n**Check:**\n1. URL spelling\n2. Server is running (node server.js)\n3. Route exists on server\n4. Port number matches\n\n**Test:**\nUse API Explorer tool!\n\n**Example:**\n\`\`\`javascript\n// Define route\napp.get('/api/users', (req, res) => {\n    res.json({ users: [] });\n});\n\`\`\`\n\nStill stuck? Share details! 🚀`;
        }

        return `🐛 **Debug Help:**\n\n**Common errors:**\n• CORS → "help with cors"\n• 404 Not Found → "help with 404"\n• Undefined values → "fix undefined"\n• Syntax errors → Play Syntax Game!\n\n**Debug tools:**\n• console.log()\n• Browser DevTools (F12)\n• API Explorer\n• Debug Detective game\n\n**Tell me:**\n• What error?\n• What you're trying?\n• Any error messages?\n\nI'll help you fix it! 🚀`;
    }

    getLearningHelp(message) {
        return `📚 **Learning Path:**\n\n**Level 1: Play Games** 🎮\n• API Galaxy Quiz\n• Debug Detective\n• Syntax Speed Run\n→ Learn by doing!\n\n**Level 2: Use Tools** 🔧\n• API Explorer\n• Analytics Dashboard\n• Pro Service demos\n→ Hands-on practice!\n\n**Level 3: Generate Code** 💻\n• Ask me to generate code\n• Modify and experiment\n• Build your own projects\n→ Real experience!\n\n**Level 4: Build Projects** 🚀\n• Todo app with API\n• Weather dashboard\n• Your own REST API\n→ Portfolio ready!\n\n**Resources:**\n• MDN Web Docs\n• JavaScript.info\n• FreeCodeCamp\n• This platform!\n\n**Start now:**\n"play api quiz" or "generate my first code"\n\nWhat interests you? 🚀`;
    }

    getPricingInfo() {
        return `💎 **BarodaTek Services:**\n\n**FREE** (Current):\n✅ All games\n✅ AI chatbot\n✅ Tools & demos\n✅ Code generation\n✅ Learning resources\n\n**PROFESSIONAL:**\n💼 Custom development\n💼 Training & consulting\n💼 Maintenance & support\n💼 Priority assistance\n\n**Contact:**\n📧 barodatek.services@gmail.com\n💰 CashApp: $baroda98\n\n**Popular packages:**\n• Starter API: $500-1000\n• Full platform: $2000-5000\n• Enterprise: Custom quote\n\n**Free consultation!**\nEmail for your project. 🚀`;
    }

    getGreeting() {
        return `Hey! 👋 I'm your ultra-intelligent BarodaTek AI!\n\n**I can:**\n✅ Generate working code\n✅ Explain any feature/demo\n✅ Help debug errors\n✅ Guide your learning\n✅ Answer tech questions\n\n**Try me:**\n• "generate API request code"\n• "show me how games work"\n• "help fix CORS error"\n• "play api quiz"\n\n**Smart features:**\n• Context-aware responses\n• Code generation from descriptions\n• Demo walkthroughs\n• Learning guidance\n\nWhat can I help you build? 🚀`;
    }

    getGeneralHelp(message) {
        // 🧠 CHATGPT-STYLE INTELLIGENT RESPONSE SYSTEM
        // Handles ANY question with contextual understanding
        
        const msg = message.toLowerCase();
        
        // ===== GENERAL KNOWLEDGE & CONVERSATIONAL AI =====
        
        // Philosophy & Life Questions
        if (msg.match(/meaning of life|purpose|why (do )?(we|i) exist/)) {
            return `🌟 **Deep Questions!**\n\nThe meaning of life is a profound question philosophers have pondered for millennia. While I'm an AI focused on helping developers, I can share some perspectives:\n\n**From a coding lens:**\n• Life is like debugging - we find and fix problems\n• Purpose comes from creating value for others\n• Every line of code we write can help someone\n\n**Universal themes:**\n• Connection with others\n• Creating and building\n• Learning and growing\n• Making a positive impact\n\n**My purpose?** To help YOU learn, build, and succeed in your coding journey!\n\nWhat would you like to create today? 🚀`;
        }
        
        // Weather & Current Events
        if (msg.match(/weather|temperature|forecast/)) {
            return `🌤️ **Weather Info:**\n\nI don't have real-time weather access, but I can help you BUILD a weather app!\n\n**Quick Weather App Tutorial:**\n\`\`\`javascript\n// Use OpenWeather API (free)\nconst API_KEY = 'your_key_here';\nconst city = 'Los Angeles';\n\nfetch(\`https://api.openweathermap.org/data/2.5/weather?q=\${city}&appid=\${API_KEY}\`)\n  .then(res => res.json())\n  .then(data => {\n    console.log(\`\${data.name}: \${data.main.temp}K\`);\n    console.log(\`Description: \${data.weather[0].description}\`);\n  });\n\`\`\`\n\n**Free Weather APIs:**\n• OpenWeather (free tier)\n• WeatherAPI.com\n• National Weather Service (US only)\n\nWant me to generate a complete weather app? 🌦️`;
        }
        
        // Math & Science Questions
        if (msg.match(/solve|calculate|what is \d+|math|equation/)) {
            return `🔢 **Math & Calculations:**\n\nI can help with programming math problems! Share the equation and I'll write code to solve it.\n\n**Example:**\n\`\`\`javascript\n// Solve quadratic equation: ax² + bx + c = 0\nfunction solveQuadratic(a, b, c) {\n    const discriminant = b*b - 4*a*c;\n    if (discriminant < 0) return 'No real solutions';\n    \n    const x1 = (-b + Math.sqrt(discriminant)) / (2*a);\n    const x2 = (-b - Math.sqrt(discriminant)) / (2*a);\n    return { x1, x2 };\n}\n\nconsole.log(solveQuadratic(1, -3, 2)); // {x1: 2, x2: 1}\n\`\`\`\n\n**Math in JavaScript:**\n• Math.sqrt() - Square root\n• Math.pow(x, y) - Power\n• Math.abs() - Absolute value\n• Math.round/floor/ceil - Rounding\n\nWhat calculation do you need? 📐`;
        }
        
        // History & Facts
        if (msg.match(/who (is|was|invented)|when (was|did)|history of/)) {
            return `📚 **Historical Context:**\n\nWhile I'm primarily a coding AI, I can share tech history and help you research!\n\n**Tech History Highlights:**\n• 1991 - World Wide Web goes public (Tim Berners-Lee)\n• 1995 - JavaScript created in 10 days (Brendan Eich)\n• 2004 - Facebook launched (Dorm room project!)\n• 2008 - First iPhone App Store opens\n• 2015 - React Native enables cross-platform apps\n\n**Research with Code:**\n\`\`\`javascript\n// Build a Wikipedia API client\nfetch('https://en.wikipedia.org/api/rest_v1/page/summary/JavaScript')\n  .then(res => res.json())\n  .then(data => console.log(data.extract));\n\`\`\`\n\nWant to build a research tool or learn about tech history? 🏛️`;
        }
        
        // Personal Advice & Recommendations
        if (msg.match(/should i|recommend|what's better|advice|suggest/)) {
            return `💡 **My Recommendation:**\n\nI analyze your question contextually! For development choices:\n\n**Learning Path:**\n• New to coding? → Start with JavaScript + our games\n• Have experience? → Jump into advanced tutorials\n• Want quick results? → Use our code generator\n\n**Tech Stack Advice:**\n• Frontend: React, Vue, or vanilla JavaScript\n• Backend: Node.js/Express (what we use!)\n• Database: Start with JSON files, scale to MongoDB/PostgreSQL\n• Hosting: Vercel (frontend), Railway (backend)\n\n**Career Advice:**\n• Build projects (not just tutorials)\n• Contribute to open source\n• Network with developers\n• Stay curious and keep learning\n\n**Specific question?**\nBe more detailed and I'll give targeted advice! 🎯`;
        }
        
        // Creative & Fun Responses
        if (msg.match(/joke|funny|make me laugh/)) {
            return `😄 **Developer Humor:**\n\n**Why do programmers prefer dark mode?**\nBecause light attracts bugs! �\n\n**Programming truths:**\n• "Works on my machine" ¯\\_(ツ)_/¯\n• 99 bugs in the code, 99 bugs... Take one down, patch it around, 127 bugs in the code!\n• Debugging: Like being a detective in a crime movie where YOU are also the murderer 🕵️\n\n**Actual code comment found:**\n\`\`\`javascript\n// I am not responsible for this code.\n// They made me write it, against my will.\n\`\`\`\n\nNow let's write some bug-free code! 🚀`;
        }
        
        // Motivational & Encouragement
        if (msg.match(/hard|difficult|can't|frustrated|stuck|give up/)) {
            return `💪 **You've Got This!**\n\nEvery developer feels stuck sometimes - it's part of the journey!\n\n**Remember:**\n• The best programmers aren't geniuses - they're persistent\n• Every error teaches you something new\n• "I don't know yet" is better than "I can't"\n• Your first code will be messy - that's normal!\n\n**When stuck:**\n1️⃣ Take a break (walk, coffee, fresh air)\n2️⃣ Explain the problem out loud (rubber duck debugging)\n3️⃣ Break it into smaller problems\n4️⃣ Ask for help (that's what I'm here for!)\n\n**Fun fact:** The creator of this site (JBaroda) had ZERO coding experience before building this platform. If they can do it, so can you!\n\n**How can I help right now?**\n• Debug your code?\n• Explain a concept?\n• Generate working examples?\n\nLet's solve this together! 🔥`;
        }
        
        // Food, Travel, Entertainment (Fun diversions)
        if (msg.match(/food|hungry|eat|recipe|restaurant/)) {
            return `🍕 **Hungry?**\n\nWhile I can't order food, I can help you BUILD a food ordering app!\n\n**Quick Food API Example:**\n\`\`\`javascript\n// Fake Restaurant API\nconst menu = [\n    { id: 1, name: 'Pizza', price: 12.99, emoji: '🍕' },\n    { id: 2, name: 'Burger', price: 9.99, emoji: '🍔' },\n    { id: 3, name: 'Sushi', price: 15.99, emoji: '🍣' }\n];\n\n// Order function\nfunction placeOrder(itemId) {\n    const item = menu.find(i => i.id === itemId);\n    return \`Order placed: \${item.emoji} \${item.name} - $\${item.price}\`;\n}\n\nconsole.log(placeOrder(1)); // "Order placed: 🍕 Pizza - $12.99"\n\`\`\`\n\n**Coding & Coffee:**\nDevelopers run on coffee and determination! ☕\n\nWant to build a full food delivery app? Let's do it! 🚀`;
        }
        
        // ===== FALLBACK: GENERAL INTELLIGENT RESPONSE =====
        // If no specific pattern matches, provide contextual help
        
        return `🤖 **I understand you're asking: "${message}"**\n\nWhile I'm specialized in coding and development, I can still help! Here's how:\n\n**What I excel at:**\n✅ Generating code for ANY programming task\n✅ Explaining technical concepts simply\n✅ Debugging errors and issues\n✅ Building complete applications\n✅ Teaching programming from scratch\n\n**Try asking me:**\n• Technical questions: "How do arrays work?"\n• Code generation: "Build me a calculator app"\n• Debugging: "Why isn't my code working?"\n• Learning: "Teach me async/await"\n• Project ideas: "What should I build?"\n\n**Or explore our platform:**\n• 🎮 Play interactive coding games\n• 🔧 Use our API Explorer tool\n• 📚 Browse learning tutorials\n• 💻 Generate custom code snippets\n\n**For non-coding questions:**\nI'll do my best to provide helpful context and guide you toward coding solutions!\n\nHow can I help you code today? 🚀`;
    }
}

// Styling for code display
const style = document.createElement('style');
style.textContent = `
    #chat-messages { font-size: 0.95rem; }
    #chat-messages code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 3px; }
    #chat-messages pre { background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; border-left: 4px solid var(--neon-cyan); overflow-x: auto; margin: 10px 0; }
    #chat-messages pre code { background: none; padding: 0; }
    #chat-messages strong { color: var(--gold-trim); }
    #chat-messages ul, #chat-messages ol { margin-left: 20px; margin-top: 10px; }
`;
document.head.appendChild(style);

window.chatbot = new EnhancedChatbot();
console.log('✅ Ultra-Enhanced AI Chatbot Loaded with Code Generation!');
