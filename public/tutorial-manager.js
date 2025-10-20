/**
 * Tutorial Manager - Learning Path System
 * Manages tutorials, progress tracking, and resource linking
 */

import { createElement, setHTML, clearElement } from './dom-utils.js';
import { CONFIG } from './config.js';

class TutorialManager {
    constructor() {
        this.tutorials = this.initializeTutorials();
        this.progress = this.loadProgress();
        this.init();
    }
    
    init() {
        // Update progress UI on load
        this.updateProgressUI();
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
    
    initializeTutorials() {
        return {
            beginner: [
                {
                    id: 'js-basics',
                    title: 'JavaScript Basics',
                    duration: '30 min',
                    level: 'Beginner',
                    description: 'Learn the fundamentals of JavaScript programming including variables, functions, conditionals, and loops.',
                    topics: [
                        'Variables and Data Types',
                        'Functions and Scope',
                        'Conditionals (if/else)',
                        'Loops (for/while)',
                        'Arrays and Objects',
                        'ES6+ Features'
                    ],
                    prerequisites: [],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'MDN JavaScript Guide', 
                            link: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps',
                            icon: 'book'
                        },
                        { 
                            type: 'external', 
                            name: 'JavaScript.info Tutorial', 
                            link: 'https://javascript.info/first-steps',
                            icon: 'graduation-cap'
                        },
                        { 
                            type: 'internal', 
                            name: 'Practice with API Quiz', 
                            link: '#games',
                            icon: 'gamepad'
                        },
                        { 
                            type: 'internal', 
                            name: 'Ask AI Chatbot', 
                            link: '#chatbot',
                            icon: 'robot',
                            prompt: 'Teach me JavaScript basics step by step'
                        }
                    ],
                    nextSteps: ['http-methods', 'json-fundamentals']
                },
                {
                    id: 'http-methods',
                    title: 'Understanding HTTP Methods',
                    duration: '20 min',
                    level: 'Beginner',
                    description: 'Master HTTP methods (GET, POST, PUT, DELETE) and understand how web requests work.',
                    topics: [
                        'HTTP Request/Response Cycle',
                        'GET - Retrieve Data',
                        'POST - Create Data',
                        'PUT - Update Data',
                        'DELETE - Remove Data',
                        'HTTP Headers',
                        'Status Codes'
                    ],
                    prerequisites: ['js-basics'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'HTTP Protocol Tutorial', 
                            link: 'https://www.tutorialspoint.com/http/index.htm',
                            icon: 'book'
                        },
                        { 
                            type: 'external', 
                            name: 'REST API Basics', 
                            link: 'https://restfulapi.net/http-methods/',
                            icon: 'cloud'
                        },
                        { 
                            type: 'internal', 
                            name: 'Try API Explorer', 
                            link: '/api-explorer.html',
                            icon: 'flask'
                        },
                        { 
                            type: 'internal', 
                            name: 'Practice API Calls', 
                            link: '#tools',
                            icon: 'code'
                        }
                    ],
                    nextSteps: ['json-fundamentals', 'rest-principles']
                },
                {
                    id: 'json-fundamentals',
                    title: 'JSON Fundamentals',
                    duration: '15 min',
                    level: 'Beginner',
                    description: 'Learn JSON syntax, parsing, and how to work with JSON data in JavaScript.',
                    topics: [
                        'JSON Syntax Rules',
                        'Data Types in JSON',
                        'JSON.parse() Method',
                        'JSON.stringify() Method',
                        'Working with Nested Objects',
                        'Common JSON Errors'
                    ],
                    prerequisites: ['js-basics'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'JSON.org Official Docs', 
                            link: 'https://www.json.org/json-en.html',
                            icon: 'file-code'
                        },
                        { 
                            type: 'external', 
                            name: 'W3Schools JSON Tutorial', 
                            link: 'https://www.w3schools.com/js/js_json_intro.asp',
                            icon: 'graduation-cap'
                        },
                        { 
                            type: 'internal', 
                            name: 'Debug JSON with AI', 
                            link: '#chatbot',
                            icon: 'robot',
                            prompt: 'Help me debug this JSON data'
                        },
                        { 
                            type: 'internal', 
                            name: 'Play Debug Detective', 
                            link: '#games',
                            icon: 'bug'
                        }
                    ],
                    nextSteps: ['rest-principles', 'api-testing']
                }
            ],
            
            apiMastery: [
                {
                    id: 'rest-principles',
                    title: 'RESTful API Design',
                    duration: '45 min',
                    level: 'Intermediate',
                    description: 'Master REST principles and learn how to design clean, scalable APIs.',
                    topics: [
                        'REST Architecture',
                        'Resource Naming',
                        'CRUD Operations',
                        'URI Design',
                        'Stateless Communication',
                        'HATEOAS Principle'
                    ],
                    prerequisites: ['http-methods', 'json-fundamentals'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'RESTful API Tutorial', 
                            link: 'https://restfulapi.net/',
                            icon: 'book'
                        },
                        { 
                            type: 'external', 
                            name: 'API Design Guide', 
                            link: 'https://apiguide.readthedocs.io/',
                            icon: 'file-alt'
                        },
                        { 
                            type: 'internal', 
                            name: 'Build Mock API', 
                            link: '#tools',
                            icon: 'tools'
                        },
                        { 
                            type: 'internal', 
                            name: 'Generate API Code', 
                            link: '#chatbot',
                            icon: 'code',
                            prompt: 'Generate a RESTful API server'
                        }
                    ],
                    nextSteps: ['authentication', 'error-handling']
                },
                {
                    id: 'authentication',
                    title: 'API Authentication & Security',
                    duration: '40 min',
                    level: 'Intermediate',
                    description: 'Implement secure authentication using API keys, OAuth, and JWT.',
                    topics: [
                        'Authentication vs Authorization',
                        'API Keys',
                        'OAuth 2.0 Flow',
                        'JWT Tokens',
                        'Session Management',
                        'Security Best Practices'
                    ],
                    prerequisites: ['rest-principles'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'Auth0 Documentation', 
                            link: 'https://auth0.com/docs',
                            icon: 'shield-alt'
                        },
                        { 
                            type: 'external', 
                            name: 'JWT.io', 
                            link: 'https://jwt.io/introduction',
                            icon: 'key'
                        },
                        { 
                            type: 'internal', 
                            name: 'Security Guardian Demo', 
                            link: '/security-guardian.html',
                            icon: 'user-shield'
                        },
                        { 
                            type: 'internal', 
                            name: 'Pro Services', 
                            link: '/pro-services.html',
                            icon: 'star'
                        }
                    ],
                    nextSteps: ['error-handling', 'api-testing']
                },
                {
                    id: 'error-handling',
                    title: 'Error Handling & Status Codes',
                    duration: '30 min',
                    level: 'Intermediate',
                    description: 'Handle errors gracefully and use proper HTTP status codes.',
                    topics: [
                        'HTTP Status Code Categories',
                        '2xx Success Codes',
                        '4xx Client Errors',
                        '5xx Server Errors',
                        'Error Response Format',
                        'Try/Catch Best Practices'
                    ],
                    prerequisites: ['rest-principles'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'HTTP Status Codes', 
                            link: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status',
                            icon: 'list'
                        },
                        { 
                            type: 'internal', 
                            name: 'Error Codes Reference', 
                            link: '/error-codes.html',
                            icon: 'exclamation-triangle'
                        },
                        { 
                            type: 'internal', 
                            name: 'Debug with AI', 
                            link: '#chatbot',
                            icon: 'robot',
                            prompt: 'Help me fix this API error'
                        }
                    ],
                    nextSteps: ['api-testing', 'microservices']
                },
                {
                    id: 'api-testing',
                    title: 'API Testing Strategies',
                    duration: '35 min',
                    level: 'Intermediate',
                    description: 'Learn to test APIs effectively using various tools and techniques.',
                    topics: [
                        'Unit Testing APIs',
                        'Integration Testing',
                        'Postman Collections',
                        'Automated Testing',
                        'Performance Testing',
                        'Load Testing'
                    ],
                    prerequisites: ['rest-principles'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'Postman Learning', 
                            link: 'https://learning.postman.com/',
                            icon: 'vial'
                        },
                        { 
                            type: 'internal', 
                            name: 'API Explorer', 
                            link: '/api-explorer.html',
                            icon: 'flask'
                        },
                        { 
                            type: 'internal', 
                            name: 'Health Monitor Demo', 
                            link: '/api-health-monitor.html',
                            icon: 'heartbeat'
                        }
                    ],
                    nextSteps: ['microservices', 'graphql']
                }
            ],
            
            advanced: [
                {
                    id: 'microservices',
                    title: 'Microservices Architecture',
                    duration: '60 min',
                    level: 'Advanced',
                    description: 'Design and build scalable microservices architectures.',
                    topics: [
                        'Microservices Principles',
                        'Service Communication',
                        'API Gateway Pattern',
                        'Service Discovery',
                        'Circuit Breakers',
                        'Event-Driven Architecture'
                    ],
                    prerequisites: ['rest-principles', 'authentication'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'Microservices.io', 
                            link: 'https://microservices.io/',
                            icon: 'network-wired'
                        },
                        { 
                            type: 'external', 
                            name: 'Martin Fowler\'s Guide', 
                            link: 'https://martinfowler.com/articles/microservices.html',
                            icon: 'book-open'
                        },
                        { 
                            type: 'internal', 
                            name: 'Auto Deploy Demo', 
                            link: '/auto-deploy-pro.html',
                            icon: 'rocket'
                        },
                        { 
                            type: 'internal', 
                            name: 'Pro Services', 
                            link: '/pro-services.html',
                            icon: 'star'
                        }
                    ],
                    nextSteps: ['graphql', 'websockets']
                },
                {
                    id: 'graphql',
                    title: 'GraphQL Fundamentals',
                    duration: '50 min',
                    level: 'Advanced',
                    description: 'Learn GraphQL query language and build flexible APIs.',
                    topics: [
                        'GraphQL vs REST',
                        'Queries and Mutations',
                        'Subscriptions',
                        'Schema Design',
                        'Resolvers',
                        'Apollo Server'
                    ],
                    prerequisites: ['rest-principles'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'GraphQL.org', 
                            link: 'https://graphql.org/learn/',
                            icon: 'layer-group'
                        },
                        { 
                            type: 'external', 
                            name: 'Apollo Docs', 
                            link: 'https://www.apollographql.com/docs/',
                            icon: 'rocket'
                        },
                        { 
                            type: 'internal', 
                            name: 'Generate GraphQL Code', 
                            link: '#chatbot',
                            icon: 'code',
                            prompt: 'Generate a GraphQL server'
                        }
                    ],
                    nextSteps: ['websockets', 'performance']
                },
                {
                    id: 'websockets',
                    title: 'WebSockets & Real-time APIs',
                    duration: '45 min',
                    level: 'Advanced',
                    description: 'Build real-time applications with WebSockets and Server-Sent Events.',
                    topics: [
                        'WebSocket Protocol',
                        'Socket.io',
                        'Real-time Events',
                        'Pub/Sub Pattern',
                        'Server-Sent Events',
                        'Scaling WebSockets'
                    ],
                    prerequisites: ['rest-principles'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'WebSocket Guide', 
                            link: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API',
                            icon: 'wifi'
                        },
                        { 
                            type: 'external', 
                            name: 'Socket.io Docs', 
                            link: 'https://socket.io/docs/',
                            icon: 'plug'
                        },
                        { 
                            type: 'internal', 
                            name: 'Team Collaboration Demo', 
                            link: '/team-collaboration.html',
                            icon: 'users'
                        }
                    ],
                    nextSteps: ['performance', 'monitoring']
                },
                {
                    id: 'performance',
                    title: 'API Performance Optimization',
                    duration: '55 min',
                    level: 'Advanced',
                    description: 'Optimize API performance with caching, compression, and CDNs.',
                    topics: [
                        'Response Caching',
                        'Rate Limiting',
                        'Compression (gzip)',
                        'CDN Integration',
                        'Database Optimization',
                        'Load Balancing'
                    ],
                    prerequisites: ['rest-principles'],
                    resources: [
                        { 
                            type: 'external', 
                            name: 'Web.dev Performance', 
                            link: 'https://web.dev/fast/',
                            icon: 'tachometer-alt'
                        },
                        { 
                            type: 'internal', 
                            name: 'Analytics Pro Demo', 
                            link: '/analytics-pro.html',
                            icon: 'chart-line'
                        },
                        { 
                            type: 'internal', 
                            name: 'Database Manager', 
                            link: '/database-manager.html',
                            icon: 'database'
                        }
                    ],
                    nextSteps: ['monitoring']
                }
            ]
        };
    }
    
    openPath(pathName) {
        const tutorials = this.tutorials[pathName];
        if (!tutorials) return;
        
        this.showPathModal(pathName, tutorials);
    }
    
    showPathModal(pathName, tutorials) {
        const pathTitles = {
            beginner: '🎓 Beginner Path',
            apiMastery: '🚀 API Mastery',
            advanced: '⚡ Advanced Techniques'
        };
        
        const modal = createElement('div', {
            className: 'tutorial-path-modal',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.95)',
                zIndex: '10001',
                overflowY: 'auto',
                padding: '20px'
            }
        });
        
        const content = createElement('div', {
            className: 'tutorial-path-content',
            style: {
                maxWidth: '900px',
                margin: '0 auto',
                background: 'var(--steel-gray)',
                borderRadius: '10px',
                padding: '30px',
                position: 'relative'
            }
        });
        
        // Close button
        const closeBtn = createElement('button', {
            className: 'btn-tech',
            onclick: () => this.closeModal(),
            style: {
                position: 'absolute',
                top: '20px',
                right: '20px'
            }
        }, [createElement('i', { className: 'fas fa-times' })]);
        
        // Title
        const title = createElement('h2', {
            style: { color: 'var(--neon-cyan)', marginBottom: '20px' }
        }, pathTitles[pathName]);
        
        // Tutorial cards
        const tutorialGrid = createElement('div', {
            style: {
                display: 'grid',
                gap: '20px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }
        });
        
        tutorials.forEach(tutorial => {
            const card = this.createTutorialCard(tutorial);
            tutorialGrid.appendChild(card);
        });
        
        content.appendChild(closeBtn);
        content.appendChild(title);
        content.appendChild(tutorialGrid);
        modal.appendChild(content);
        document.body.appendChild(modal);
    }
    
    createTutorialCard(tutorial) {
        const isCompleted = this.progress[tutorial.id]?.completed;
        
        const card = createElement('div', {
            className: 'tutorial-card',
            style: {
                background: 'var(--electric-black)',
                border: `2px solid ${isCompleted ? 'var(--code-green)' : 'var(--border-dark)'}`,
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            },
            onclick: () => this.openTutorial(tutorial)
        });
        
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <h4 style="color: var(--neon-cyan); margin: 0; font-size: 1.1rem;">
                    ${tutorial.title}
                </h4>
                ${isCompleted ? '<span style="color: var(--code-green); font-size: 1.5rem;">✓</span>' : ''}
            </div>
            <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 10px;">
                <i class="fas fa-clock"></i> ${tutorial.duration} 
                <span style="margin-left: 15px;"><i class="fas fa-signal"></i> ${tutorial.level}</span>
            </p>
            <p style="color: var(--text-white); margin-bottom: 15px; line-height: 1.5;">
                ${tutorial.description}
            </p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${tutorial.topics.slice(0, 3).map(topic => 
                    `<span style="background: var(--border-dark); padding: 4px 10px; border-radius: 4px; font-size: 0.85rem;">
                        ${topic}
                    </span>`
                ).join('')}
                ${tutorial.topics.length > 3 ? `<span style="color: var(--text-gray); font-size: 0.85rem;">+${tutorial.topics.length - 3} more</span>` : ''}
            </div>
        `;
        
        return card;
    }
    
    openTutorial(tutorial) {
        this.showTutorialModal(tutorial);
    }
    
    showTutorialModal(tutorial) {
        const isCompleted = this.progress[tutorial.id]?.completed;
        
        const modal = createElement('div', {
            className: 'tutorial-modal',
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.98)',
                zIndex: '10002',
                overflowY: 'auto',
                padding: '20px'
            }
        });
        
        modal.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto; background: var(--steel-gray); border-radius: 10px; padding: 40px; position: relative;">
                <button class="btn-tech" data-action="tutorial-close" style="position: absolute; top: 20px; right: 20px;">
                    <i class="fas fa-times"></i>
                </button>
                
                <h2 style="color: var(--neon-cyan); margin-bottom: 10px;">${tutorial.title}</h2>
                <p style="color: var(--text-gray); margin-bottom: 20px;">
                    <i class="fas fa-clock"></i> ${tutorial.duration} 
                    <span style="margin: 0 15px;">|</span>
                    <i class="fas fa-signal"></i> ${tutorial.level}
                    ${isCompleted ? '<span style="margin-left: 15px; color: var(--code-green);"><i class="fas fa-check-circle"></i> Completed</span>' : ''}
                </p>
                
                <p style="color: var(--text-white); font-size: 1.1rem; line-height: 1.6; margin-bottom: 30px;">
                    ${tutorial.description}
                </p>
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: var(--gold-trim); margin-bottom: 15px;">📋 Topics Covered:</h3>
                    <ul style="color: var(--text-white); line-height: 2;">
                        ${tutorial.topics.map(topic => `<li>${topic}</li>`).join('')}
                    </ul>
                </div>
                
                ${tutorial.prerequisites.length > 0 ? `
                    <div style="margin-bottom: 30px; padding: 15px; background: var(--electric-black); border-left: 4px solid var(--champion-red); border-radius: 4px;">
                        <h4 style="color: var(--champion-red); margin-bottom: 10px;">
                            <i class="fas fa-exclamation-triangle"></i> Prerequisites:
                        </h4>
                        <p style="color: var(--text-gray);">
                            Complete these tutorials first: ${tutorial.prerequisites.join(', ')}
                        </p>
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 30px;">
                    <h3 style="color: var(--gold-trim); margin-bottom: 15px;">📚 Learning Resources:</h3>
                    <div style="display: grid; gap: 10px;">
                        ${tutorial.resources.map(resource => `
                            <a class="tutorial-resource" href="${resource.link}" 
                               target="${resource.type === 'external' ? '_blank' : '_self'}"
                               data-prompt="${resource.prompt ? resource.prompt.replace(/"/g, '&quot;') : ''}"
                               data-type="${resource.type}"
                               style="display: flex; align-items: center; padding: 15px; background: var(--electric-black); border: 1px solid var(--border-dark); border-radius: 8px; text-decoration: none; color: var(--neon-cyan); transition: all 0.3s ease;">
                                <i class="fas fa-${resource.icon}" style="font-size: 1.5rem; margin-right: 15px; color: ${resource.type === 'external' ? 'var(--tech-blue)' : 'var(--code-green)'};"></i>
                                <div style="flex: 1;">
                                    <div style="font-weight: bold; margin-bottom: 3px;">${resource.name}</div>
                                    <div style="font-size: 0.85rem; color: var(--text-gray);">
                                        ${resource.type === 'external' ? 'External Resource' : 'Platform Tool'}
                                    </div>
                                </div>
                                <i class="fas fa-${resource.type === 'external' ? 'external-link-alt' : 'arrow-right'}" style="color: var(--text-gray);"></i>
                            </a>
                        `).join('')}
                    </div>
                </div>
                
                ${tutorial.nextSteps && tutorial.nextSteps.length > 0 ? `
                    <div style="margin-bottom: 30px; padding: 15px; background: rgba(0, 240, 255, 0.05); border: 1px solid var(--neon-cyan); border-radius: 8px;">
                        <h4 style="color: var(--neon-cyan); margin-bottom: 10px;">
                            <i class="fas fa-arrow-right"></i> Next Steps:
                        </h4>
                        <p style="color: var(--text-gray);">
                            After completing this, try: ${tutorial.nextSteps.join(', ')}
                        </p>
                    </div>
                ` : ''}
                
                <div style="text-align: center;">
                    <button class="btn-champion" data-action="tutorial-complete" data-tutorial-id="${tutorial.id}" ${isCompleted ? 'disabled' : ''}>
                        <i class="fas fa-${isCompleted ? 'check-circle' : 'check'}"></i> 
                        ${isCompleted ? 'Completed' : 'Mark as Complete'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Attach CSP-safe event listeners for modal controls and resources
        try {
            const closeBtn = modal.querySelector('[data-action="tutorial-close"]');
            if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());

            const completeBtn = modal.querySelector('[data-action="tutorial-complete"]');
            if (completeBtn) completeBtn.addEventListener('click', (e) => {
                const id = completeBtn.getAttribute('data-tutorial-id');
                if (id) this.markComplete(id);
            });

            modal.querySelectorAll('.tutorial-resource').forEach(el => {
                // hover effects
                el.addEventListener('mouseover', () => { el.style.borderColor = 'var(--neon-cyan)'; el.style.transform = 'translateX(5px)'; });
                el.addEventListener('mouseout', () => { el.style.borderColor = 'var(--border-dark)'; el.style.transform = 'translateX(0)'; });

                // click handling for resources with data-prompt
                el.addEventListener('click', (ev) => {
                    const prompt = el.getAttribute('data-prompt');
                    const target = el.getAttribute('target');
                    if (target === '_self' && prompt) {
                        setTimeout(() => {
                            const chatInput = document.querySelector('#chat-input');
                            if (chatInput) chatInput.value = prompt;
                        }, 500);
                    }
                });
            });
        } catch (e) {
            console.debug('tutorial-manager: failed attaching modal listeners', e);
        }
    }
    
    closeModal() {
        const modals = document.querySelectorAll('.tutorial-modal, .tutorial-path-modal');
        modals.forEach(modal => modal.remove());
    }
    
    markComplete(tutorialId) {
        if (this.progress[tutorialId]?.completed) {
            return;
        }
        
        // Save progress
        this.progress[tutorialId] = { 
            completed: true, 
            date: new Date().toISOString() 
        };
        localStorage.setItem('barodatek_tutorial_progress', JSON.stringify(this.progress));
        
        // Show success notification
        this.showNotification('✅ Tutorial Completed!', 'Keep learning and level up your skills!', 'success');
        
        // Update UI
        this.updateProgressUI();
        
        // Close modal
        this.closeModal();
    }
    
    showNotification(title, message, type = 'info') {
        const notification = createElement('div', {
            style: {
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: type === 'success' ? 'var(--code-green)' : 'var(--neon-cyan)',
                color: 'var(--electric-black)',
                padding: '20px 30px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                zIndex: '10003',
                minWidth: '300px',
                animation: 'slideInRight 0.3s ease'
            }
        });
        
        notification.innerHTML = `
            <h4 style="margin: 0 0 8px 0; font-weight: bold;">${title}</h4>
            <p style="margin: 0; opacity: 0.9;">${message}</p>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    loadProgress() {
        const saved = localStorage.getItem('barodatek_tutorial_progress');
        return saved ? JSON.parse(saved) : {};
    }
    
    updateProgressUI() {
        const allTutorials = [
            ...this.tutorials.beginner,
            ...this.tutorials.apiMastery,
            ...this.tutorials.advanced
        ];
        
        const total = allTutorials.length;
        const completed = Object.keys(this.progress).filter(id => this.progress[id].completed).length;
        const percentage = Math.round((completed / total) * 100);
        
        // Update progress indicators
        document.querySelectorAll('.progress-indicator').forEach((el, index) => {
            const pathNames = ['beginner', 'apiMastery', 'advanced'];
            const pathTutorials = this.tutorials[pathNames[index]];
            const pathCompleted = pathTutorials.filter(t => this.progress[t.id]?.completed).length;
            
            el.textContent = `${pathCompleted}/${pathTutorials.length} tutorials completed`;
            
            if (pathCompleted === pathTutorials.length) {
                el.innerHTML += ' <span style="color: var(--code-green);">✓ Path Complete!</span>';
            }
        });
        
        // Update global progress if element exists
        const globalProgress = document.getElementById('global-progress');
        if (globalProgress) {
            globalProgress.textContent = `${completed}/${total} tutorials completed (${percentage}%)`;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.tutorialManager = new TutorialManager();
    });
} else {
    window.tutorialManager = new TutorialManager();
}

export default TutorialManager;
