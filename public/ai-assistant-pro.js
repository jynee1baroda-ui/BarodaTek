/**
 * 🤖 BarodaTek AI Assistant Pro
 * Advanced AI with code generation, debugging, conversation memory
 * Author: BarodaTek Services
 * Version: 2.0.0
 */

class AIAssistantPro {
    constructor() {
        this.conversationHistory = [];
        this.maxHistory = 50; // Increased from 20
        this.context = {
            currentFile: null,
            currentLanguage: null,
            recentCode: [],
            userPreferences: {}
        };
        this.accessToken = null;
        this.purchasedServices = [];
        
        // Load conversation history
        this.loadHistory();
        
        // Initialize knowledge base
        this.knowledgeBase = this.initializeKnowledgeBase();
        
        // Check user access
        this.checkUserAccess();
    }

    /**
     * Initialize comprehensive knowledge base
     */
    initializeKnowledgeBase() {
        return {
            languages: {
                javascript: {
                    frameworks: ['Express', 'React', 'Vue', 'Node.js', 'Next.js'],
                    commonPatterns: ['async/await', 'promises', 'callbacks', 'classes', 'modules'],
                    debugging: ['console.log', 'debugger', 'try-catch', 'error handling']
                },
                python: {
                    frameworks: ['Flask', 'Django', 'FastAPI', 'pandas', 'numpy'],
                    commonPatterns: ['decorators', 'comprehensions', 'generators', 'context managers'],
                    debugging: ['print', 'pdb', 'logging', 'try-except']
                },
                typescript: {
                    frameworks: ['Angular', 'NestJS', 'TypeORM'],
                    commonPatterns: ['interfaces', 'types', 'generics', 'decorators'],
                    debugging: ['type checking', 'strict mode', 'error types']
                },
                go: {
                    frameworks: ['Gin', 'Echo', 'Fiber'],
                    commonPatterns: ['goroutines', 'channels', 'interfaces', 'error handling'],
                    debugging: ['fmt.Println', 'log', 'defer', 'panic/recover']
                }
            },
            apiConcepts: {
                rest: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'status codes', 'headers'],
                graphql: ['queries', 'mutations', 'subscriptions', 'resolvers', 'schema'],
                authentication: ['JWT', 'OAuth', 'API keys', 'sessions', 'cookies'],
                security: ['CORS', 'rate limiting', 'input validation', 'sanitization']
            },
            commonBugs: [
                { pattern: /=([^=])/, fix: '===', desc: 'Use === for comparison, not =' },
                { pattern: /let\s+(\w+)\s*=\s*"[^"]*'/, fix: 'matching quotes', desc: 'Quote mismatch' },
                { pattern: /arr\[arr\.length\]/, fix: 'arr[arr.length - 1]', desc: 'Array index off by one' },
                { pattern: /\bif\s*\([^)]*=[^=]/, fix: 'use ===', desc: 'Assignment in if condition' },
                { pattern: /JSON\.parse\([^)]+\)(?!\s*catch)/, fix: 'try-catch', desc: 'Unhandled JSON.parse' }
            ],
            codeTemplates: {
                apiServer: {
                    express: (endpoint, method) => `const express = require('express');
const app = express();
app.use(express.json());

app.${method.toLowerCase()}('${endpoint}', async (req, res) => {
    try {
        const data = ${method === 'GET' ? 'await fetchData()' : 'req.body'};
        res.status(${method === 'POST' ? '201' : '200'}).json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.listen(8080, () => console.log('Server running on port 8080'));`,
                    flask: (endpoint, method) => `from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('${endpoint}', methods=['${method}'])
def handle_request():
    try:
        ${method === 'GET' ? 'data = fetch_data()' : 'data = request.get_json()'}
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=8080, debug=True)`
                },
                apiClient: {
                    fetch: (url, method, hasBody) => `async function ${method.toLowerCase()}Data(${hasBody ? 'data' : ''}) {
    try {
        const response = await fetch('${url}', {
            method: '${method}',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            }${hasBody ? ',\n            body: JSON.stringify(data)' : ''}
        });
        
        if (!response.ok) {
            throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}`,
                    axios: (url, method, hasBody) => `async function ${method.toLowerCase()}Data(${hasBody ? 'data' : ''}) {
    try {
        const response = await axios({
            method: '${method.toLowerCase()}',
            url: '${url}',
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }${hasBody ? ',\n            data: data' : ''}
        });
        
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Server Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Network Error:', error.message);
        }
        throw error;
    }
}`,
                    python: (url, method, hasBody) => `import requests

def ${method.lower()}_data(${hasBody ? 'data=None' : ''}):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {get_token()}'
    }
    
    try:
        response = requests.${method.lower()}(
            '${url}'${hasBody ? ',\n            json=data' : ''},
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'API Error: {e}')
        raise`
                },
                database: {
                    mongoose: (model) => `const mongoose = require('mongoose');

const ${model}Schema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

${model}Schema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('${model}', ${model}Schema);`,
                    prisma: (model) => `model ${model} {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}`,
                    sqlalchemy: (model) => `from sqlalchemy import Column, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class ${model}(Base):
    __tablename__ = '${model.toLowerCase()}s'
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)`
                }
            }
        };
    }

    /**
     * Check user access for premium features
     */
    async checkUserAccess() {
        const urlParams = new URLSearchParams(window.location.search);
        this.accessToken = urlParams.get('token') || localStorage.getItem('access_token');
        
        if (this.accessToken) {
            try {
                const response = await fetch(`/api/access/${this.accessToken}`);
                if (response.ok) {
                    const data = await response.json();
                    this.purchasedServices = data.services || [];
                    localStorage.setItem('access_token', this.accessToken);
                }
            } catch (error) {
                console.error('Failed to verify access:', error);
            }
        }
    }

    /**
     * Check if user has access to premium feature
     */
    hasPremiumAccess(feature) {
        return this.purchasedServices.some(service => 
            service.includes(feature) || service.includes('Pro Support')
        );
    }

    /**
     * Load conversation history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('ai_conversation_history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load conversation history:', error);
        }
    }

    /**
     * Save conversation history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('ai_conversation_history', 
                JSON.stringify(this.conversationHistory.slice(-this.maxHistory)));
        } catch (error) {
            console.error('Failed to save conversation history:', error);
        }
    }

    /**
     * Process user message with advanced understanding
     */
    async processMessage(message) {
        // Add to history
        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Analyze intent with context
        const intent = this.analyzeIntent(message);
        
        // Extract entities
        const entities = this.extractEntities(message);
        
        // Update context
        this.updateContext(message, entities);
        
        // Generate response based on intent and context
        const response = await this.generateAdvancedResponse(message, intent, entities);
        
        // Add response to history
        this.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date().toISOString()
        });
        
        // Save history
        this.saveHistory();
        
        return response;
    }

    /**
     * Analyze user intent with advanced pattern matching
     */
    analyzeIntent(message) {
        const msg = message.toLowerCase();
        
        // Premium feature requests
        if (msg.includes('my purchases') || msg.includes('my services')) {
            return 'show_purchases';
        }
        
        if (msg.includes('demo') && (msg.includes('api template') || msg.includes('toolkit'))) {
            return 'show_demo';
        }
        
        // Code generation
        if (msg.match(/(generate|create|build|make|write).*(code|function|class|api|server)/)) {
            return 'generate_code';
        }
        
        // Debugging
        if (msg.match(/(debug|fix|error|bug|wrong|doesn't work)/)) {
            return 'debug_code';
        }
        
        // Explanation
        if (msg.match(/(explain|what is|how does|tell me about)/)) {
            return 'explain_concept';
        }
        
        // Conversion
        if (msg.match(/convert.*(to|into|from)/)) {
            return 'convert_code';
        }
        
        // Optimization
        if (msg.match(/(optimize|improve|better|performance)/)) {
            return 'optimize_code';
        }
        
        // Refactoring
        if (msg.match(/(refactor|clean|restructure)/)) {
            return 'refactor_code';
        }
        
        // Testing
        if (msg.match(/(test|unit test|testing)/)) {
            return 'generate_tests';
        }
        
        // Documentation
        if (msg.match(/(document|comment|docs)/)) {
            return 'generate_docs';
        }
        
        // Game help
        if (msg.match(/(game|play|quiz|challenge)/)) {
            return 'game_help';
        }
        
        return 'general_help';
    }

    /**
     * Extract entities from message
     */
    extractEntities(message) {
        const entities = {
            language: null,
            framework: null,
            httpMethod: null,
            endpoint: null,
            database: null,
            codeBlock: null
        };
        
        // Extract programming language
        const langPatterns = {
            javascript: /\b(javascript|js|node|express|react|vue)\b/i,
            python: /\b(python|py|flask|django|fastapi)\b/i,
            typescript: /\b(typescript|ts|angular)\b/i,
            go: /\b(go|golang|gin)\b/i,
            java: /\b(java|spring|hibernate)\b/i,
            csharp: /\b(c#|csharp|\.net|asp\.net)\b/i
        };
        
        for (const [lang, pattern] of Object.entries(langPatterns)) {
            if (pattern.test(message)) {
                entities.language = lang;
                break;
            }
        }
        
        // Extract HTTP method
        const methodPattern = /\b(GET|POST|PUT|DELETE|PATCH)\b/i;
        const methodMatch = message.match(methodPattern);
        if (methodMatch) {
            entities.httpMethod = methodMatch[1].toUpperCase();
        }
        
        // Extract endpoint
        const endpointPattern = /['"]?(\/[\w\-/:]*)['"]?/;
        const endpointMatch = message.match(endpointPattern);
        if (endpointMatch) {
            entities.endpoint = endpointMatch[1];
        }
        
        // Extract code block
        const codeBlockPattern = /```[\s\S]*?```|`[^`]+`/;
        const codeMatch = message.match(codeBlockPattern);
        if (codeMatch) {
            entities.codeBlock = codeMatch[0].replace(/```\w*\n?|\n?```|`/g, '');
        }
        
        return entities;
    }

    /**
     * Update conversation context
     */
    updateContext(message, entities) {
        if (entities.language) {
            this.context.currentLanguage = entities.language;
        }
        
        if (entities.codeBlock) {
            this.context.recentCode.push({
                code: entities.codeBlock,
                timestamp: Date.now()
            });
            
            // Keep only last 5 code snippets
            if (this.context.recentCode.length > 5) {
                this.context.recentCode.shift();
            }
        }
    }

    /**
     * Generate advanced response with context awareness
     */
    async generateAdvancedResponse(message, intent, entities) {
        switch (intent) {
            case 'show_purchases':
                return this.showPurchasedServices();
            
            case 'show_demo':
                return this.showProductDemo(message);
            
            case 'generate_code':
                return this.generateCode(message, entities);
            
            case 'debug_code':
                return this.debugCode(message, entities);
            
            case 'explain_concept':
                return this.explainConcept(message, entities);
            
            case 'convert_code':
                return this.convertCode(message, entities);
            
            case 'optimize_code':
                return this.optimizeCode(message, entities);
            
            case 'refactor_code':
                return this.refactorCode(message, entities);
            
            case 'generate_tests':
                return this.generateTests(message, entities);
            
            case 'generate_docs':
                return this.generateDocumentation(message, entities);
            
            case 'game_help':
                return this.provideGameHelp(message);
            
            default:
                return this.provideGeneralHelp(message);
        }
    }

    /**
     * Show purchased services
     */
    showPurchasedServices() {
        if (this.purchasedServices.length === 0) {
            return `💼 **Your Services**\n\nYou haven't purchased any services yet.\n\n**Available Services:**\n• Pro Support ($99/month) - Priority AI assistance\n• API Integration ($499) - Custom API setup\n• Custom Solution ($1,999) - Full development service\n\n**Available Products:**\n• API Templates ($49) - Ready-to-use templates\n• Postman Collection ($29) - Complete API collection\n• Dev Toolkit ($99) - Development utilities\n\n[Purchase Services](/purchase.html)`;
        }
        
        return `💼 **Your Purchased Services**\n\n${this.purchasedServices.map(s => `✅ ${s}`).join('\n')}\n\n**Available Commands:**\n• "demo API templates" - See your templates\n• "demo toolkit" - Explore toolkit features\n• "generate advanced code" - Pro code generation\n• "debug my code" - Advanced debugging\n\nType any command to get started! 🚀`;
    }

    /**
     * Show product demo
     */
    showProductDemo(message) {
        if (!this.hasPremiumAccess('API Templates') && !this.hasPremiumAccess('Dev Toolkit')) {
            return `🔒 **Premium Feature**\n\nProduct demos are available for purchased products.\n\n[Purchase Products](/purchase.html) to unlock:\n• Interactive demos\n• Code templates\n• Development tools\n• Priority support`;
        }
        
        if (message.includes('api template')) {
            return `📦 **API Templates Demo**\n\n**Available Templates:**\n\n1️⃣ **REST API Template**\n\`\`\`javascript\n${this.knowledgeBase.codeTemplates.apiServer.express('/api/users', 'GET')}\n\`\`\`\n\n2️⃣ **Authentication Template**\n3️⃣ **Database Models**\n4️⃣ **Error Handling**\n\n**Generate Custom Code:**\nJust ask! For example:\n• "generate POST endpoint for products"\n• "create user authentication"\n• "build database model for orders"\n\nWhat would you like to build? 🚀`;
        }
        
        if (message.includes('toolkit')) {
            return `🛠️ **Dev Toolkit Demo**\n\n**Available Tools:**\n\n1️⃣ **Code Generator** - Generate any code structure\n2️⃣ **API Client Builder** - Build HTTP clients\n3️⃣ **Database Schema Designer** - Create models\n4️⃣ **Test Generator** - Auto-generate tests\n5️⃣ **Documentation Builder** - Auto docs\n\n**Try It:**\n• "generate API client for https://api.example.com"\n• "create database model for Product"\n• "generate tests for my function"\n\nWhat tool do you want to use? 🚀`;
        }
        
        return this.showPurchasedServices();
    }

    /**
     * Generate code based on request
     */
    generateCode(message, entities) {
        const msg = message.toLowerCase();
        
        // Default language
        let lang = entities.language || this.context.currentLanguage || 'javascript';
        
        // API Server
        if (msg.includes('server') || msg.includes('api')) {
            const method = entities.httpMethod || 'GET';
            const endpoint = entities.endpoint || '/api/data';
            
            if (lang === 'python') {
                return `🐍 **Python Flask API Server**\n\n\`\`\`python\n${this.knowledgeBase.codeTemplates.apiServer.flask(endpoint, method)}\n\`\`\`\n\n**To use:**\n1. pip install flask\n2. Save as app.py\n3. python app.py\n4. Visit http://localhost:8080${endpoint}\n\n**Customize:** Change endpoint, add database, add auth\nNeed modifications? Just ask! 🚀`;
            }
            
            return `🔧 **Express API Server**\n\n\`\`\`javascript\n${this.knowledgeBase.codeTemplates.apiServer.express(endpoint, method)}\n\`\`\`\n\n**To use:**\n1. npm install express\n2. Save as server.js\n3. node server.js\n4. Visit http://localhost:8080${endpoint}\n\n**Features:**\n✅ Error handling\n✅ JSON parsing\n✅ Async/await\n✅ Status codes\n\nNeed to add authentication, database, or other features? Just ask! 🚀`;
        }
        
        // API Client
        if (msg.includes('client') || msg.includes('request') || msg.includes('fetch')) {
            const method = entities.httpMethod || 'GET';
            const url = entities.endpoint || 'https://api.example.com/data';
            const hasBody = method !== 'GET';
            
            if (lang === 'python') {
                return `🐍 **Python API Client**\n\n\`\`\`python\n${this.knowledgeBase.codeTemplates.apiClient.python(url, method, hasBody)}\n\`\`\`\n\n**Usage:**\n\`\`\`python\n${hasBody ? "result = post_data({'name': 'BarodaTek'})" : "result = get_data()"}\nprint(result)\n\`\`\`\n\n**Features:**\n✅ Error handling\n✅ Status checking\n✅ Headers included\n✅ Bearer token support\n\nNeed different auth or headers? Tell me! 🚀`;
            }
            
            return `🔧 **JavaScript API Client**\n\n\`\`\`javascript\n${this.knowledgeBase.codeTemplates.apiClient.fetch(url, method, hasBody)}\n\`\`\`\n\n**Usage:**\n\`\`\`javascript\n${hasBody ? "const result = await postData({ name: 'BarodaTek' });" : "const result = await getData();"}\nconsole.log(result);\n\`\`\`\n\n**Features:**\n✅ Async/await\n✅ Error handling\n✅ Bearer token\n✅ Status checking\n\nWant Axios version or different auth? Just ask! 🚀`;
        }
        
        // Database Model
        if (msg.includes('model') || msg.includes('schema') || msg.includes('database')) {
            const modelName = message.match(/model\s+(?:for\s+)?(\w+)/i)?.[1] || 'User';
            
            if (lang === 'python') {
                return `🐍 **SQLAlchemy Model**\n\n\`\`\`python\n${this.knowledgeBase.codeTemplates.database.sqlalchemy(modelName)}\n\`\`\`\n\n**Usage:**\n\`\`\`python\nfrom sqlalchemy import create_engine\nengine = create_engine('sqlite:///database.db')\nBase.metadata.create_all(engine)\n\`\`\`\n\n**Add More Fields:**\nJust tell me what fields you need! 🚀`;
            }
            
            return `🔧 **Mongoose Model**\n\n\`\`\`javascript\n${this.knowledgeBase.codeTemplates.database.mongoose(modelName)}\n\`\`\`\n\n**Usage:**\n\`\`\`javascript\nconst user = new User({ name: 'BarodaTek', email: 'contact@example.com' });\nawait user.save();\n\`\`\`\n\n**Add More Fields:**\nTell me what you need - validations, relationships, methods! 🚀`;
        }
        
        // Generic code generation
        return `💻 **Custom Code Generator**\n\nI can generate:\n\n**Backend:**\n• REST APIs (Express, Flask, FastAPI)\n• GraphQL servers\n• WebSocket servers\n• Database models\n• Authentication systems\n\n**Frontend:**\n• React components\n• API clients\n• Forms with validation\n• State management\n\n**Utilities:**\n• Data validation\n• Error handling\n• File operations\n• Testing code\n\n**Be specific!** For example:\n• "generate POST endpoint for user registration in Express"\n• "create React form with email validation"\n• "build Python function to validate passwords"\n\nWhat do you want to build? 🚀`;
    }

    /**
     * Debug code
     */
    debugCode(message, entities) {
        if (!entities.codeBlock && this.context.recentCode.length === 0) {
            return `🐛 **Code Debugger**\n\n**How to use:**\n1. Paste your code in backticks:\n   \`\`\`javascript\n   your code here\n   \`\`\`\n\n2. Tell me what's wrong or what error you're getting\n\n3. I'll analyze and provide fixes!\n\n**I can debug:**\n✅ Syntax errors\n✅ Logic errors\n✅ Runtime errors\n✅ Performance issues\n✅ Best practice violations\n\nPaste your code and I'll help! 🔧`;
        }
        
        const code = entities.codeBlock || this.context.recentCode[this.context.recentCode.length - 1].code;
        const issues = this.analyzeCode(code);
        
        if (issues.length === 0) {
            return `✅ **Code Analysis Complete**\n\nNo obvious issues found! Your code looks good.\n\n**Suggestions:**\n• Add error handling for production\n• Consider edge cases\n• Add input validation\n• Write tests\n\nWant me to optimize or add features? Just ask! 🚀`;
        }
        
        let response = `🐛 **Debugging Analysis**\n\n**Found ${issues.length} issue(s):**\n\n`;
        
        issues.forEach((issue, i) => {
            response += `${i + 1}. **${issue.type}**\n`;
            response += `   Problem: ${issue.description}\n`;
            response += `   Fix: ${issue.fix}\n\n`;
        });
        
        response += `**Fixed Code:**\n\`\`\`${entities.language || 'javascript'}\n${this.fixCode(code, issues)}\n\`\`\`\n\n`;
        response += `Need more help? Ask me to explain any fix! 🚀`;
        
        return response;
    }

    /**
     * Analyze code for issues
     */
    analyzeCode(code) {
        const issues = [];
        
        // Check common bugs
        for (const bug of this.knowledgeBase.commonBugs) {
            if (bug.pattern.test(code)) {
                issues.push({
                    type: 'Syntax/Logic Error',
                    description: bug.desc,
                    fix: bug.fix,
                    pattern: bug.pattern
                });
            }
        }
        
        // Check for missing error handling
        if ((code.includes('JSON.parse') || code.includes('fetch')) && !code.includes('try') && !code.includes('catch')) {
            issues.push({
                type: 'Missing Error Handling',
                description: 'No try-catch block for operations that can fail',
                fix: 'Wrap in try-catch block'
            });
        }
        
        // Check for console.log in production
        if (code.match(/console\.(log|error|warn)/g) && code.includes('production')) {
            issues.push({
                type: 'Debug Code',
                description: 'Console statements in production code',
                fix: 'Use proper logging library or remove'
            });
        }
        
        return issues;
    }

    /**
     * Fix code based on issues
     */
    fixCode(code, issues) {
        let fixed = code;
        
        for (const issue of issues) {
            if (issue.pattern) {
                if (issue.fix === '===') {
                    fixed = fixed.replace(issue.pattern, '===$1');
                }
            }
        }
        
        // Add try-catch if missing
        if (issues.some(i => i.type === 'Missing Error Handling')) {
            if (!fixed.includes('try')) {
                fixed = `try {\n${fixed.split('\n').map(line => '    ' + line).join('\n')}\n} catch (error) {\n    console.error('Error:', error);\n    throw error;\n}`;
            }
        }
        
        return fixed;
    }

    /**
     * Explain programming concept
     */
    explainConcept(message, entities) {
        const msg = message.toLowerCase();

        // If user asked in the form "explain X" try to extract the concept and answer directly
        // Capture until punctuation or end of string to allow more flexible concepts
        const explainMatch = message.match(/(?:explain|what is|how does|tell me about)\s+(.+?)(?:\?|\.|$)/i);
        if (explainMatch && explainMatch[1]) {
            let concept = explainMatch[1].toLowerCase().trim();
            // normalize common slash usage (e.g., async/await) and punctuation
            let conceptNorm = concept.replace(/[\/]/g, ' ').replace(/[.,!?]$/g, '').trim();

            // Map several common synonyms to targeted explanations
            if (conceptNorm.includes('async') || conceptNorm.includes('await') || conceptNorm.includes('async await')) {
                return `📚 **Async/Await Explained**\n\n**What it does:**\nMakes asynchronous code look synchronous!\n\n**Before (Callbacks):**\n\n\`\`\`javascript\nfetchData(function(result) {\n    processData(result, function(processed) {\n        saveData(processed, function(saved) {\n            // Callback hell!\n        });\n    });\n});\n\`\`\`\n\n**After (Async/Await):**\n\n\`\`\`javascript\nasync function handleData() {\n    const result = await fetchData();\n    const processed = await processData(result);\n    const saved = await saveData(processed);\n    return saved;\n}\n\`\`\`\n\n**Rules:**\n1. Mark function as \`async\`\n2. Use \`await\` before promises\n3. Always add try-catch for errors\n\n**Error Handling:**\n\`\`\`javascript\ntry {\n    const data = await fetchData();\n} catch (error) {\n    console.error('Failed:', error);\n}\n\`\`\`\n\nNeed examples? Just ask! 🚀`;
            }
            if (conceptNorm.includes('rest') || conceptNorm.includes('api')) {
                return `📚 **REST API Explained**\n\n**REST** = Representational State Transfer\n\n**Key Concepts:**\n\n1️⃣ **Resources** - Everything is a resource (users, posts, etc.)\n   URL: /api/users/123\n\n2️⃣ **HTTP Methods:**\n   • GET - Retrieve data\n   • POST - Create new resource\n   • PUT - Update entire resource\n   • PATCH - Update part of resource\n   • DELETE - Remove resource\n\n3️⃣ **Status Codes:**\n   • 200 OK - Success\n   • 201 Created - New resource created\n   • 400 Bad Request - Invalid input\n   • 404 Not Found - Resource doesn't exist\n   • 500 Server Error - Something went wrong\n\n4️⃣ **Stateless** - Each request is independent\n\n**Example:**\n\`\`\`javascript\nGET /api/users/123\nResponse: { id: 123, name: "BarodaTek" }\n\`\`\`\n\nWant to build a REST API? Just ask! 🚀`;
            }
            if (conceptNorm.includes('jwt') || conceptNorm.includes('token') || conceptNorm.includes('authentication')) {
                return `📚 **JWT Authentication Explained**\n\n**JWT** = JSON Web Token\n\n**How it works:**\n\n1️⃣ **User logs in**\n   → Server verifies credentials\n   → Server creates JWT token\n   → Returns token to client\n\n2️⃣ **Client stores token**\n   → Usually in localStorage or cookie\n\n3️⃣ **Client makes requests**\n   → Sends token in Authorization header:\n   \`Authorization: Bearer <token>\`\n\n4️⃣ **Server verifies token**\n   → Checks signature\n   → Extracts user info\n   → Processes request\n\n**JWT Structure:**\n\`\`\`\nheader.payload.signature\n\`\`\`\n\n**Example:**\n\`\`\`javascript\nconst jwt = require('jsonwebtoken');\n\n// Create token\nconst token = jwt.sign(\n    { userId: 123, email: 'user@example.com' },\n    'secret_key',\n    { expiresIn: '24h' }\n);\n\n// Verify token\ntry {\n    const decoded = jwt.verify(token, 'secret_key');\n    console.log(decoded.userId); // 123\n} catch (error) {\n    console.error('Invalid token');\n}\n\`\`\`\n\nWant to implement JWT auth? Ask me! 🚀`;
            }
            if (conceptNorm.includes('graphql')) {
                return `📚 **GraphQL Explained**\n\n**What it is:**\nGraphQL is a query language for APIs and a runtime for executing those queries.\n\n**Key Concepts:**\n• Schema - Defines types and queries\n• Queries - Fetch data\n• Mutations - Modify data\n• Resolvers - Functions that return data for fields\n\n**Example Query:**\n\`\`\`graphql\nquery {\n  user(id: "123") {\n    id\n    name\n    posts {\n      id\n      title\n    }\n  }\n}\n\`\`\`\n\nWant an example resolver or schema? Ask! 🚀`;
            }
            if (conceptNorm.includes('websocket') || conceptNorm.includes('web sockets') || conceptNorm.includes('ws')) {
                return `📡 **WebSockets Explained**\n\nWebSockets provide full-duplex communication channels over a single TCP connection.\n\n**Use cases:** Real-time chat, live updates, streaming.\n\n**Basic server (Node + ws):**\n\`\`\`javascript\nconst WebSocket = require('ws');\nconst wss = new WebSocket.Server({ port: 8080 });\n\nwss.on('connection', function connection(ws) {\n  ws.on('message', function incoming(message) {\n    console.log('received: %s', message);\n  });\n  ws.send('something');\n});\n\`\`\`\n\nWant help building a WebSocket server? Ask! 🚀`;
            }
            if (conceptNorm.includes('promise') || conceptNorm.includes('promises')) {
                return `📚 **JavaScript Promises Explained**\n\n**What they are:**\nPromises represent eventual completion (or failure) of an async operation.\n\n**States:**\n• pending\n• fulfilled\n• rejected\n\n**Example:**\n\`\`\`javascript\nconst p = new Promise((resolve, reject) => {\n  setTimeout(() => resolve('done'), 1000);\n});\n\np.then(value => console.log(value)).catch(err => console.error(err));\n\`\`\`\n\nUse async/await to simplify promise handling. Need examples? Ask! 🚀`;
            }
            if (conceptNorm.includes('closure') || conceptNorm.includes('closures')) {
                return `📚 **JavaScript Closures Explained**\n\nA closure is a function that retains access to its lexical scope even when executed outside that scope.\n\n**Example:**\n\`\`\`javascript\nfunction makeCounter() {\n  let count = 0;\n  return function() {\n    count += 1;\n    return count;\n  };\n}\n\nconst counter = makeCounter();\nconsole.log(counter()); // 1\nconsole.log(counter()); // 2\n\`\`\`\n\nClosures are useful for data privacy and factory functions. Ask for more patterns! 🚀`;
            }
            // If the concept matched none of the quick mappings, fall through to regular checks below
        }

        // API concepts
        if (msg.includes('rest') || msg.includes('api')) {
            return `📚 **REST API Explained**\n\n**REST** = Representational State Transfer\n\n**Key Concepts:**\n\n1️⃣ **Resources** - Everything is a resource (users, posts, etc.)\n   URL: /api/users/123\n\n2️⃣ **HTTP Methods:**\n   • GET - Retrieve data\n   • POST - Create new resource\n   • PUT - Update entire resource\n   • PATCH - Update part of resource\n   • DELETE - Remove resource\n\n3️⃣ **Status Codes:**\n   • 200 OK - Success\n   • 201 Created - New resource created\n   • 400 Bad Request - Invalid input\n   • 404 Not Found - Resource doesn't exist\n   • 500 Server Error - Something went wrong\n\n4️⃣ **Stateless** - Each request is independent\n\n**Example:**\n\`\`\`javascript\nGET /api/users/123\nResponse: { id: 123, name: "BarodaTek" }\n\`\`\`\n\nWant to build a REST API? Just ask! 🚀`;
        }
        
        // Async/Await
        if (msg.includes('async') || msg.includes('await')) {
            return `📚 **Async/Await Explained**\n\n**What it does:**\nMakes asynchronous code look synchronous!\n\n**Before (Callbacks):**\n\`\`\`javascript\nfetchData(function(result) {\n    processData(result, function(processed) {\n        saveData(processed, function(saved) {\n            // Callback hell!\n        });\n    });\n});\n\`\`\`\n\n**After (Async/Await):**\n\`\`\`javascript\nasync function handleData() {\n    const result = await fetchData();\n    const processed = await processData(result);\n    const saved = await saveData(processed);\n    return saved;\n}\n\`\`\`\n\n**Rules:**\n1. Mark function as \`async\`\n2. Use \`await\` before promises\n3. Always add try-catch for errors\n\n**Error Handling:**\n\`\`\`javascript\ntry {\n    const data = await fetchData();\n} catch (error) {\n    console.error('Failed:', error);\n}\n\`\`\`\n\nNeed examples? Just ask! 🚀`;
        }
        
        // JWT
        if (msg.includes('jwt') || msg.includes('token')) {
            return `📚 **JWT Authentication Explained**\n\n**JWT** = JSON Web Token\n\n**How it works:**\n\n1️⃣ **User logs in**\n   → Server verifies credentials\n   → Server creates JWT token\n   → Returns token to client\n\n2️⃣ **Client stores token**\n   → Usually in localStorage or cookie\n\n3️⃣ **Client makes requests**\n   → Sends token in Authorization header:\n   \`Authorization: Bearer <token>\`\n\n4️⃣ **Server verifies token**\n   → Checks signature\n   → Extracts user info\n   → Processes request\n\n**JWT Structure:**\n\`\`\`\nheader.payload.signature\n\`\`\`\n\n**Example:**\n\`\`\`javascript\nconst jwt = require('jsonwebtoken');\n\n// Create token\nconst token = jwt.sign(\n    { userId: 123, email: 'user@example.com' },\n    'secret_key',\n    { expiresIn: '24h' }\n);\n\n// Verify token\ntry {\n    const decoded = jwt.verify(token, 'secret_key');\n    console.log(decoded.userId); // 123\n} catch (error) {\n    console.error('Invalid token');\n}\n\`\`\`\n\nWant to implement JWT auth? Ask me! 🚀`;
        }
        
        return `📚 **Learning Hub**\n\nI can explain:\n\n**API Concepts:**\n• REST APIs\n• GraphQL\n• WebSockets\n• Authentication (JWT, OAuth)\n• Rate limiting\n\n**JavaScript:**\n• Async/await\n• Promises\n• Closures\n• Prototypes\n• Event loop\n\n**Databases:**\n• SQL vs NoSQL\n• Indexes\n• Transactions\n• Relations\n\n**Web Development:**\n• CORS\n• Sessions vs Tokens\n• HTTP vs HTTPS\n• Caching\n\n**Ask me:** "explain [concept]"\nExample: "explain async/await" 🚀`;
    }

    /**
     * Convert code between languages
     */
    convertCode(message, entities) {
        return `🔄 **Code Converter**\n\nI can convert code between:\n• JavaScript ↔ Python\n• JavaScript ↔ TypeScript\n• Python ↔ Go\n• SQL ↔ NoSQL queries\n\n**How to use:**\n1. Paste your code:\n   \`\`\`javascript\n   function add(a, b) { return a + b; }\n   \`\`\`\n\n2. Tell me what to convert to:\n   "convert this to Python"\n\n**I'll convert:**\n✅ Syntax\n✅ Data structures\n✅ Common patterns\n✅ Best practices\n\nPaste your code and tell me the target language! 🚀`;
    }

    /**
     * Optimize code
     */
    optimizeCode(message, entities) {
        if (!entities.codeBlock) {
            return `⚡ **Code Optimizer**\n\nI can optimize for:\n• **Performance** - Faster execution\n• **Memory** - Less RAM usage\n• **Readability** - Cleaner code\n• **Best Practices** - Industry standards\n\n**Paste your code** and I'll:\n1. Identify bottlenecks\n2. Suggest improvements\n3. Provide optimized version\n4. Explain the changes\n\nReady? Paste your code! 🚀`;
        }
        
        return `⚡ **Optimization Analysis**\n\n**Your code can be improved!**\n\n**Suggestions:**\n1. Use const/let instead of var\n2. Cache repeated calculations\n3. Use async/await for better flow\n4. Add error boundaries\n5. Implement proper error handling\n\n**Optimized Version:**\n\`\`\`javascript\n// Optimized code will appear here\n\`\`\`\n\nWant specific optimizations? Tell me:\n• "optimize for speed"\n• "optimize for readability"\n• "optimize for memory" 🚀`;
    }

    /**
     * Refactor code
     */
    refactorCode(message, entities) {
        return `🔧 **Code Refactoring**\n\nI can refactor your code to:\n\n1️⃣ **Clean Architecture**\n   • Separate concerns\n   • Single responsibility\n   • DRY principle\n\n2️⃣ **Modern Patterns**\n   • Async/await\n   • Destructuring\n   • Arrow functions\n   • Template literals\n\n3️⃣ **Better Structure**\n   • Modular design\n   • Clear naming\n   • Proper comments\n\n**Paste your code** and I'll:\n✅ Identify code smells\n✅ Suggest patterns\n✅ Provide refactored version\n✅ Explain improvements\n\nReady to improve your code? 🚀`;
    }

    /**
     * Generate tests
     */
    generateTests(message, entities) {
        return `🧪 **Test Generator**\n\nI can generate tests for:\n\n**Unit Tests:**\n• Jest (JavaScript)\n• Pytest (Python)\n• Go test (Go)\n\n**Integration Tests:**\n• API endpoint testing\n• Database operations\n• External services\n\n**Example:**\nFor this function:\n\`\`\`javascript\nfunction add(a, b) {\n    return a + b;\n}\n\`\`\`\n\nI'll generate:\n\`\`\`javascript\ndescribe('add', () => {\n    test('adds two numbers', () => {\n        expect(add(2, 3)).toBe(5);\n    });\n    \n    test('handles negatives', () => {\n        expect(add(-1, 1)).toBe(0);\n    });\n    \n    test('handles decimals', () => {\n        expect(add(1.5, 2.5)).toBe(4);\n    });\n});\n\`\`\`\n\n**Paste your code** and I'll generate comprehensive tests! 🚀`;
    }

    /**
     * Generate documentation
     */
    generateDocumentation(message, entities) {
        return `📝 **Documentation Generator**\n\nI can generate:\n\n**Code Documentation:**\n• JSDoc comments\n• Python docstrings\n• README files\n• API documentation\n\n**Example:**\nFor this function:\n\`\`\`javascript\nfunction fetchUser(id) {\n    return fetch(\`/api/users/\${id}\`).then(r => r.json());\n}\n\`\`\`\n\nI'll generate:\n\`\`\`javascript\n/**\n * Fetches a user by ID from the API\n * @param {number} id - The user ID to fetch\n * @returns {Promise<Object>} User object with id, name, email\n * @throws {Error} If user not found or network error\n * @example\n * const user = await fetchUser(123);\n * console.log(user.name);\n */\nfunction fetchUser(id) {\n    return fetch(\`/api/users/\${id}\`).then(r => r.json());\n}\n\`\`\`\n\n**Paste your code** for instant documentation! 🚀`;
    }

    /**
     * Provide game help
     */
    provideGameHelp(message) {
        return `🎮 **BarodaTek Games**\n\n**Available Games:**\n\n1️⃣ **API Galaxy Quiz**\n   • Learn REST API concepts\n   • 8 challenging questions\n   • Track your high score\n   • Multiple difficulty levels\n\n2️⃣ **Debug Detective**\n   • Find and fix bugs\n   • Real-world scenarios\n   • Improve debugging skills\n   • Earn achievements\n\n3️⃣ **Syntax Speed Run**\n   • Race against time\n   • Test your syntax knowledge\n   • Beat your best time\n   • Compete on leaderboard\n\n4️⃣ **Algorithm Puzzle**\n   • Solve logic challenges\n   • Master algorithms\n   • Progressive difficulty\n   • Unlock achievements\n\n**Features:**\n✅ Persistent high scores\n✅ Achievement system\n✅ Leaderboards\n✅ Multiple difficulty levels\n✅ Progress tracking\n\nReady to play? Click any game to start! 🚀`;
    }

    /**
     * Provide general help
     */
    provideGeneralHelp(message) {
        return `👋 **BarodaTek AI Assistant Pro**\n\nI'm here to help you with:\n\n**Code Generation:**\n• "generate REST API in Express"\n• "create React component"\n• "build Python Flask server"\n\n**Debugging:**\n• "debug my code" (paste code)\n• "fix this error"\n• "why doesn't this work"\n\n**Learning:**\n• "explain REST APIs"\n• "what is async/await"\n• "how does JWT work"\n\n**Optimization:**\n• "optimize this code"\n• "improve performance"\n• "refactor this function"\n\n**Testing:**\n• "generate tests for my function"\n• "create unit tests"\n\n**Documentation:**\n• "document this code"\n• "generate JSDoc comments"\n\n**Games & Learning:**\n• Play interactive coding games\n• Track your progress\n• Earn achievements\n\n**Premium Features** (for purchased users):\n• Advanced code generation\n• Custom templates\n• Priority support\n• Product demos\n\nWhat would you like to do? 🚀`;
    }

    /**
     * Clear conversation history
     */
    clearHistory() {
        this.conversationHistory = [];
        this.saveHistory();
    }

    /**
     * Get conversation history
     */
    getHistory() {
        return this.conversationHistory;
    }

    /**
     * Export conversation
     */
    exportConversation() {
        return JSON.stringify(this.conversationHistory, null, 2);
    }
}

// Initialize global AI assistant
window.aiAssistant = new AIAssistantPro();

console.log('🤖 BarodaTek AI Assistant Pro loaded successfully!');
console.log('Try: "generate REST API" or "explain async/await"');
