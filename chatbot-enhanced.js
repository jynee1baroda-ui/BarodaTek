/**
 * 🤖 BarodaTek Enhanced Chatbot
 * Secure chatbot with AI Assistant Pro integration and web search
 * Version: 2.0.0
 */

class BarodaTekChatbot {
    constructor() {
        this.chatHistory = [];
        this.isTyping = false;
        this.aiAssistant = window.aiAssistant || null;
        this.webSearchEnabled = true;
        
        // Security: Sanitize inputs
        this.sanitizer = this.createSanitizer();
        
        // Initialize
        this.init();
    }

    /**
     * Initialize chatbot
     */
    init() {
        console.log('🤖 BarodaTek Chatbot initializing...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * Setup chatbot after DOM ready
     */
    setup() {
        // Get elements
        this.elements = {
            chatBody: document.getElementById('chatBody'),
            messageInput: document.getElementById('messageInput'),
            typingIndicator: document.getElementById('typingIndicator'),
            sendButton: document.querySelector('[data-action="sendMessage"]')
        };

        // Verify elements exist
        if (!this.elements.chatBody || !this.elements.messageInput) {
            console.error('❌ Chatbot elements not found. Retrying in 500ms...');
            setTimeout(() => this.setup(), 500);
            return;
        }

        console.log('✅ Chatbot elements found');

        // Setup event listeners
        this.setupEventListeners();

        // Load chat history from localStorage
        this.loadChatHistory();

        // Show welcome message
        this.showWelcomeMessage();

        console.log('✅ BarodaTek Chatbot ready!');
    }

    /**
     * Create HTML sanitizer
     */
    createSanitizer() {
        return {
            sanitize: (html) => {
                // Remove script tags and event handlers
                const temp = document.createElement('div');
                temp.textContent = html; // This escapes HTML
                return temp.innerHTML;
            },
            sanitizeUrl: (url) => {
                // Only allow https URLs
                try {
                    const urlObj = new URL(url);
                    if (urlObj.protocol === 'https:' || urlObj.protocol === 'http:') {
                        return url;
                    }
                } catch (e) {
                    return '#';
                }
                return '#';
            }
        };
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Send button click
        if (this.elements.sendButton) {
            this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        }

        // Enter key press
        if (this.elements.messageInput) {
            this.elements.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Quick action buttons
        document.querySelectorAll('[data-action="askQuestion"]').forEach(button => {
            button.addEventListener('click', (e) => {
                const question = button.getAttribute('data-arg');
                this.askQuestion(question);
            });
        });

        // Feature cards
        document.querySelectorAll('[data-action="exploreFeature"]').forEach(card => {
            card.addEventListener('click', (e) => {
                const feature = card.getAttribute('data-arg');
                this.exploreFeature(feature);
            });
        });

        console.log('✅ Event listeners setup');
    }

    /**
     * Send message
     */
    async sendMessage() {
        if (!this.elements.messageInput) return;

        const message = this.elements.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Sanitize input
        const sanitizedMessage = this.sanitizer.sanitize(message);

        // Add user message
        this.addMessage(sanitizedMessage, 'user');

        // Clear input
        this.elements.messageInput.value = '';

        // Show typing indicator
        this.showTyping();

        try {
            // Get AI response
            const response = await this.getAIResponse(sanitizedMessage);

            // Hide typing
            this.hideTyping();

            // Add bot response
            this.addMessage(response, 'bot');

            // Save to history
            this.saveChatHistory();

        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTyping();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }

    /**
     * Get AI response (with AI Assistant Pro or fallback)
     */
    async getAIResponse(message) {
        const msg = message.toLowerCase();
        
        // Check for web search FIRST (before AI Assistant Pro)
        if (msg.includes('search web') || msg.includes('look up') || msg.includes('find information about')) {
            return await this.searchWeb(message);
        }
        
        // Try AI Assistant Pro for code generation, debugging, etc.
        if (this.aiAssistant) {
            try {
                const response = await this.aiAssistant.processMessage(message);
                return this.formatMarkdown(response);
            } catch (error) {
                console.error('AI Assistant error:', error);
            }
        }

        // Fallback: Use enhanced local responses
        return await this.getEnhancedResponse(message);
    }

    /**
     * Get enhanced response with web search capability
     */
    async getEnhancedResponse(message) {
        const msg = message.toLowerCase();

        // Note: Web search is handled in getAIResponse() now (checked before AI Assistant Pro)

        // Use pattern matching for common queries
        const patterns = {
            greeting: /^(hi|hello|hey|greetings|good morning|good afternoon)/i,
            help: /(help|support|assist|guide|how to)/i,
            api: /(api|endpoint|rest|request|response)/i,
            code: /(code|function|class|generate|create)/i,
            price: /(price|cost|pricing|how much|payment)/i,
            contact: /(contact|email|reach|talk to)/i,
            services: /(service|product|offer|package)/i,
            games: /(game|play|quiz|challenge)/i
        };

        // Greeting
        if (patterns.greeting.test(msg)) {
            return `👋 **Hello!** I'm BarodaTek's AI Assistant.\n\n**I can help you with:**\n\n🔧 **Code Generation** - "generate REST API"\n🐛 **Debugging** - "debug my code"\n📚 **Learning** - "explain async/await"\n🎮 **Games** - "show me games"\n💼 **Services** - "what services do you offer"\n🔍 **Web Search** - "search web for [topic]"\n\nWhat would you like to do?`;
        }

        // Help
        if (patterns.help.test(msg)) {
            return `🆘 **How Can I Help?**\n\n**My Capabilities:**\n\n1️⃣ **Code Generation**\n   • "generate POST endpoint in Express"\n   • "create React component"\n   • "build Python Flask API"\n\n2️⃣ **Debugging**\n   • "debug this code: [paste code]"\n   • "why doesn't my code work?"\n   • "fix this error"\n\n3️⃣ **Learning**\n   • "explain REST APIs"\n   • "what is async/await?"\n   • "teach me about databases"\n\n4️⃣ **Web Search** (Factual answers only)\n   • "search web for current JavaScript trends"\n   • "look up Python best practices 2025"\n\n5️⃣ **Games & Learning**\n   • "show me games"\n   • "start API quiz"\n\n6️⃣ **Business Info**\n   • "what services do you offer?"\n   • "how much does this cost?"\n\nJust ask! 🚀`;
        }

        // API related
        if (patterns.api.test(msg)) {
            return `🔌 **API Development Help**\n\n**Quick Start:**\n\n**1. REST API Basics**\n• GET - Retrieve data\n• POST - Create resource\n• PUT - Update entire resource\n• PATCH - Partial update\n• DELETE - Remove resource\n\n**2. Status Codes**\n• 200 OK - Success\n• 201 Created - Resource created\n• 400 Bad Request - Invalid input\n• 404 Not Found - Resource missing\n• 500 Server Error - Something broke\n\n**3. Generate Code**\nTry:\n• "generate GET endpoint"\n• "create Express server"\n• "build API client"\n\n**4. Learn More**\n• "explain REST APIs"\n• "what is CORS?"\n• "how does authentication work?"\n\nWhat would you like to build? 🚀`;
        }

        // Code generation
        if (patterns.code.test(msg)) {
            return `💻 **Code Generation**\n\n**I can generate:**\n\n**Backend:**\n• Express servers\n• Flask APIs\n• Database models\n• Authentication\n\n**Frontend:**\n• React components\n• API clients\n• Forms with validation\n\n**Example Commands:**\n• "generate POST endpoint for users"\n• "create React form component"\n• "build database model for Product"\n• "make authentication middleware"\n\n**Just describe what you need!**\n\nFor example:\n"Generate an Express server with POST endpoint for creating users"\n\nTry it now! 🚀`;
        }

        // Pricing
        if (patterns.price.test(msg)) {
            return `💰 **BarodaTek Services & Pricing**\n\n**Services:**\n• **Pro Support** - $99/month\n  Priority AI assistance, advanced features\n\n• **API Integration** - $499/project\n  Custom API setup and integration\n\n• **Custom Solution** - $1,999/project\n  Full development service\n\n**Products:**\n• **API Templates** - $49\n  Ready-to-use API templates\n\n• **Postman Collection** - $29\n  Complete API collection\n\n• **Dev Toolkit** - $99\n  Development utilities\n\n**Payment:** Cash App $baroda98\n**Contact:** barodatek.services@gmail.com\n\n[View All Services](/purchase.html) 🛒`;
        }

        // Contact
        if (patterns.contact.test(msg)) {
            return `📧 **Contact BarodaTek**\n\n**Email:** barodatek.services@gmail.com\n**Payment:** Cash App $baroda98\n**Website:** http://localhost:8080\n\n**Support Hours:**\nMonday - Friday: 9 AM - 6 PM EST\nWeekend: Limited availability\n\n**Quick Links:**\n• [Purchase Services](/purchase.html)\n• [Admin Dashboard](/admin.html)\n• [Documentation](/)\n\nWe respond within 24 hours! 📬`;
        }

        // Services
        if (patterns.services.test(msg)) {
            return `💼 **BarodaTek Services**\n\n**Professional Services:**\n\n1️⃣ **Pro Support** ($99/month)\n   • Priority AI assistance\n   • Advanced code generation\n   • Exclusive templates\n   • Direct support line\n\n2️⃣ **API Integration** ($499)\n   • Custom API setup\n   • Integration consulting\n   • Testing & deployment\n   • Documentation\n\n3️⃣ **Custom Solution** ($1,999)\n   • Full development service\n   • Custom features\n   • Deployment & hosting\n   • 3 months support\n\n**Digital Products:**\n\n📦 **API Templates** ($49)\n📮 **Postman Collection** ($29)\n🛠️ **Dev Toolkit** ($99)\n\n[Purchase Now](/purchase.html) 🚀`;
        }

        // Games
        if (patterns.games.test(msg)) {
            return `🎮 **BarodaTek Games**\n\n**Available Games:**\n\n1️⃣ **API Galaxy Quiz**\n   • Learn REST API concepts\n   • 4 difficulty levels\n   • Track high scores\n\n2️⃣ **Debug Detective**\n   • Find and fix bugs\n   • Real code challenges\n   • Earn achievements\n\n3️⃣ **Syntax Speed Run**\n   • Race against time\n   • Test your syntax skills\n   • Compete on leaderboard\n\n4️⃣ **Algorithm Puzzle**\n   • Solve logic problems\n   • Master algorithms\n   • Progressive difficulty\n\n**Features:**\n✅ Persistent high scores\n✅ 15+ achievements\n✅ Leaderboards\n✅ Sound effects\n✅ Level progression\n\n[Play Now](/) 🎯`;
        }

        // Default: Suggest web search
        return `🤔 I'm not sure about that specific query.\n\n**Options:**\n\n1️⃣ **Rephrase your question**\n   Try being more specific about what you need.\n\n2️⃣ **Search the web**\n   Type: "search web for [your topic]"\n   I'll find factual information for you.\n\n3️⃣ **Ask about:**\n   • Code generation\n   • API development\n   • Our services\n   • Games & learning\n\n**Example:**\n"search web for JavaScript async await tutorial"\n\nHow can I help? 🚀`;
    }

    /**
     * Search web for factual information
     */
    async searchWeb(query) {
        // Extract search term
        const searchTerm = query
            .replace(/search (web|online|internet) (for|about)?/gi, '')
            .replace(/look up|find information about/gi, '')
            .trim();

        if (!searchTerm) {
            return `🔍 **Web Search**\n\nPlease specify what you want to search for.\n\n**Example:**\n"search web for React hooks tutorial"\n"look up Python best practices"`;
        }

        // Create clickable resource cards
        const encodedTerm = encodeURIComponent(searchTerm);
        
        const resources = [
            {
                icon: '📚',
                name: 'MDN Web Docs',
                url: `https://developer.mozilla.org/en-US/search?q=${encodedTerm}`,
                desc: 'Official Mozilla docs - Always accurate & up-to-date'
            },
            {
                icon: '🎓',
                name: 'W3Schools',
                url: `https://www.w3schools.com/search/search_asp.asp?q=${encodedTerm}`,
                desc: 'Beginner-friendly tutorials with live examples'
            },
            {
                icon: '💬',
                name: 'Stack Overflow',
                url: `https://stackoverflow.com/search?q=${encodedTerm}`,
                desc: 'Real solutions from developers worldwide'
            },
            {
                icon: '💻',
                name: 'GitHub',
                url: `https://github.com/search?q=${encodedTerm}&type=repositories`,
                desc: 'Real-world code examples and projects'
            },
            {
                icon: '🚀',
                name: 'freeCodeCamp',
                url: `https://www.freecodecamp.org/news/search/?query=${encodedTerm}`,
                desc: 'In-depth tutorials and project guides'
            },
            {
                icon: '📖',
                name: 'Dev.to',
                url: `https://dev.to/search?q=${encodedTerm}`,
                desc: 'Community articles and discussions'
            }
        ];

        let response = `🔍 **Web Search Results: "${searchTerm}"**\n\n`;
        response += `**🌟 Curated Resources (Click to open):**\n\n`;
        
        resources.forEach((resource, index) => {
            response += `**${resource.icon} ${index + 1}. [${resource.name}](${resource.url})**\n`;
            response += `   ${resource.desc}\n\n`;
        });

        response += `\n**💡 Or I Can Help Directly:**\n\n`;
        response += `• "explain ${searchTerm}"\n`;
        response += `• "generate ${searchTerm} code"\n`;
        response += `• "create ${searchTerm} example"\n`;
        response += `• "teach me about ${searchTerm}"\n\n`;
        response += `**What would you prefer?** 🚀`;

        return response;
    }

    /**
     * Ask predefined question
     */
    askQuestion(question) {
        if (!this.elements.messageInput) return;
        
        const sanitizedQuestion = this.sanitizer.sanitize(question);
        this.elements.messageInput.value = sanitizedQuestion;
        this.sendMessage();
    }

    /**
     * Explore feature
     */
    exploreFeature(feature) {
        const featureMessages = {
            'api-testing': 'Tell me about the API Testing Suite and how to use it',
            'code-generator': 'How do I use the Code Generator to create contracts and APIs?',
            'real-time': 'Explain the Real-Time Updates feature',
            'analytics': 'Show me the Analytics Dashboard capabilities'
        };

        const message = featureMessages[feature] || `Tell me about ${feature}`;
        this.askQuestion(message);
    }

    /**
     * Add message to chat
     */
    addMessage(text, sender) {
        if (!this.elements.chatBody) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = sender === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';

        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Sanitize and render markdown-style text
        content.innerHTML = this.formatMarkdown(text);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);

        this.elements.chatBody.appendChild(messageDiv);
        this.scrollToBottom();

        // Add to history
        this.chatHistory.push({ text, sender, timestamp: new Date().toISOString() });
    }

    /**
     * Format markdown-style text (secure)
     */
    formatMarkdown(text) {
        // Sanitize first
        let html = this.sanitizer.sanitize(text);

        // Convert markdown-style formatting
        html = html
            // Bold
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            // Italic
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            // Code inline
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            // Headers
            .replace(/^### (.+)$/gm, '<h5>$1</h5>')
            .replace(/^## (.+)$/gm, '<h4>$1</h4>')
            .replace(/^# (.+)$/gm, '<h3>$1</h3>')
            // Line breaks
            .replace(/\n/g, '<br>');

        // Convert links (sanitized)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
            const safeUrl = this.sanitizer.sanitizeUrl(url);
            return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        });

        return html;
    }

    /**
     * Show typing indicator
     */
    showTyping() {
        if (!this.elements.typingIndicator) {
            console.warn('Typing indicator element not found');
            return;
        }

        this.isTyping = true;
        this.elements.typingIndicator.style.display = 'block';
        this.scrollToBottom();
    }

    /**
     * Hide typing indicator
     */
    hideTyping() {
        if (!this.elements.typingIndicator) return;

        this.isTyping = false;
        this.elements.typingIndicator.style.display = 'none';
    }

    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        if (!this.elements.chatBody) return;

        setTimeout(() => {
            this.elements.chatBody.scrollTop = this.elements.chatBody.scrollHeight;
        }, 100);
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const welcomeMessage = `👋 **Welcome to BarodaTek AI Assistant!**\n\nI'm here to help you with:\n\n🔧 **Code Generation** - Create APIs, functions, components\n🐛 **Debugging** - Fix errors and optimize code\n📚 **Learning** - Understand concepts and best practices\n🎮 **Games** - Play interactive coding challenges\n💼 **Services** - Learn about our offerings\n🔍 **Web Search** - Find factual information\n\n**Try asking:**\n• "generate REST API in Express"\n• "explain async/await"\n• "what services do you offer?"\n• "search web for React hooks"\n\nHow can I help you today? 🚀`;

        this.addMessage(welcomeMessage, 'bot');
    }

    /**
     * Load chat history from localStorage
     */
    loadChatHistory() {
        try {
            const saved = localStorage.getItem('barodatek_chat_history');
            if (saved) {
                this.chatHistory = JSON.parse(saved);
                
                // Restore last 5 messages
                const recent = this.chatHistory.slice(-5);
                recent.forEach(msg => {
                    this.addMessage(msg.text, msg.sender);
                });
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }

    /**
     * Save chat history to localStorage
     */
    saveChatHistory() {
        try {
            // Keep only last 50 messages
            const toSave = this.chatHistory.slice(-50);
            localStorage.setItem('barodatek_chat_history', JSON.stringify(toSave));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }

    /**
     * Clear chat
     */
    clearChat() {
        this.chatHistory = [];
        if (this.elements.chatBody) {
            this.elements.chatBody.innerHTML = '';
        }
        localStorage.removeItem('barodatek_chat_history');
        this.showWelcomeMessage();
    }
}

// Initialize chatbot when script loads
const barodaTekChatbot = new BarodaTekChatbot();

// Make globally accessible
window.barodaTekChatbot = barodaTekChatbot;

// Legacy function compatibility
window.sendMessage = () => barodaTekChatbot.sendMessage();
window.askQuestion = (q) => barodaTekChatbot.askQuestion(q);
window.clearChat = () => barodaTekChatbot.clearChat();

console.log('✅ BarodaTek Enhanced Chatbot loaded!');
