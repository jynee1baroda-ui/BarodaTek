// Real-time Analytics and Visitor Tracking System for BarodaTek.com
class BarodaTekAnalytics {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.pageViews = 0;
        this.interactions = 0;
        this.downloads = 0;
        this.userAgent = navigator.userAgent;
        this.referrer = document.referrer;
        this.location = window.location.href;
        this.visitorData = {};
        this.events = [];
        this.socket = null;
        
        this.init();
    }
    
    init() {
        this.setupVisitorTracking();
        if (this.shouldUseWebSocket()) {
            this.setupWebSocket();
        } else {
            console.info('ℹ️ BarodaTek Analytics WebSocket disabled for this environment');
        }
        this.trackPageView();
        this.setupEventListeners();
        this.startHeartbeat();
        this.getVisitorLocation();
    }
    
    generateSessionId() {
        return 'barodatek_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    shouldUseWebSocket() {
        if (typeof window === 'undefined' || !('WebSocket' in window)) {
            return false;
        }

        const localHosts = ['localhost', '127.0.0.1', '::1'];
        return localHosts.includes(window.location.hostname);
    }
    
    setupWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('🟢 BarodaTek Analytics WebSocket connected');
                this.sendAnalyticsEvent('websocket_connected', {
                    sessionId: this.sessionId,
                    timestamp: Date.now()
                });
            };
            
            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleAnalyticsMessage(data);
            };
            
            this.socket.onerror = (error) => {
                console.warn('BarodaTek Analytics WebSocket error:', error);
                try {
                    this.socket.close();
                } catch (closeError) {
                    console.debug('WebSocket close error:', closeError);
                }
            };
            
            this.socket.onclose = () => {
                console.log('🔴 BarodaTek Analytics WebSocket disconnected');
                this.socket = null;
                // Retry only in local development to avoid noisy production logs
                if (this.shouldUseWebSocket()) {
                    setTimeout(() => this.setupWebSocket(), 5000);
                }
            };
            
        } catch (error) {
            console.error('WebSocket setup failed:', error);
        }
    }
    
    async getVisitorLocation() {
        try {
            // Use a CORS-friendly alternative or skip if CORS blocks it
            // For development, we'll skip external location tracking to avoid CORS issues
            this.visitorData.location = {
                country: 'Unknown',
                city: 'Unknown',
                region: 'Unknown',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                ip: 'localhost'
            };
            // Optional: Uncomment below if you have a CORS-enabled location service
            /*
            const response = await fetch('https://ipapi.co/json/');
            if (response.ok) {
                const locationData = await response.json();
                this.visitorData.location = {
                    country: locationData.country_name || 'Unknown',
                    city: locationData.city || 'Unknown',
                    region: locationData.region || 'Unknown',
                    timezone: locationData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                    ip: locationData.ip || 'unknown'
                };
            }
            */
            this.sendAnalyticsEvent('visitor_location', this.visitorData.location);
        } catch (error) {
            console.log('Location tracking skipped (CORS or network issue):', error.message);
            // Set default location data
            this.visitorData.location = {
                country: 'Unknown',
                city: 'Unknown',
                region: 'Unknown',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                ip: 'localhost'
            };
        }
    }
    
    setupVisitorTracking() {
        this.visitorData = {
            sessionId: this.sessionId,
            userAgent: this.userAgent,
            referrer: this.referrer,
            language: navigator.language,
            platform: navigator.platform,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            },
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null,
            timestamp: Date.now(),
            url: this.location
        };
    }
    
    trackPageView() {
        this.pageViews++;
        this.sendAnalyticsEvent('page_view', {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer,
            timestamp: Date.now(),
            sessionId: this.sessionId
        });
        
        // Update page view counter in UI
        this.updatePageViewDisplay();
    }
    
    trackInteraction(type, element, details = {}) {
        this.interactions++;
        const interaction = {
            type,
            element: element && element.tagName ? element.tagName.toLowerCase() : 'unknown',
            id: element && element.id ? element.id : '',
            className: element && element.className ? element.className : '',
            text: element && element.textContent ? element.textContent.substring(0, 100) : '',
            details,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href
        };
        
        this.events.push(interaction);
        this.sendAnalyticsEvent('interaction', interaction);
        
        // Update interaction counter in UI
        this.updateInteractionDisplay();
    }
    
    trackDownload(fileName, fileType, fileSize = null) {
        this.downloads++;
        const download = {
            fileName,
            fileType,
            fileSize,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            url: window.location.href,
            userAgent: this.userAgent
        };
        
        this.events.push(download);
        this.sendAnalyticsEvent('download', download);
        
        // Update download counter in UI
        this.updateDownloadDisplay();
        
        // Show download notification
        this.showNotification('success', `📥 Downloaded: ${fileName}`, 3000);
    }
    
    setupEventListeners() {
        // Track clicks
        document.addEventListener('click', (e) => {
            this.trackInteraction('click', e.target, {
                x: e.clientX,
                y: e.clientY,
                button: e.button
            });
        });
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackInteraction('form_submit', e.target, {
                formName: e.target.name || e.target.id,
                action: e.target.action
            });
        });
        
        // Track input focus
        document.addEventListener('focus', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                this.trackInteraction('input_focus', e.target, {
                    inputType: e.target.type,
                    name: e.target.name
                });
            }
        }, true);
        
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                if (maxScroll % 25 === 0) { // Track every 25%
                    this.trackInteraction('scroll', document.body, {
                        scrollPercent: maxScroll
                    });
                }
            }
        });
        
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            this.trackInteraction('visibility_change', document, {
                hidden: document.hidden,
                visibilityState: document.visibilityState
            });
        });
        
        // Track window resize
        window.addEventListener('resize', () => {
            this.trackInteraction('window_resize', window, {
                width: window.innerWidth,
                height: window.innerHeight
            });
        });
        
        // Track downloads
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href) {
                const url = new URL(link.href, window.location.origin);
                const isDownload = link.hasAttribute('download') || 
                                 this.isDownloadableFile(url.pathname);
                
                if (isDownload) {
                    const fileName = link.getAttribute('download') || 
                                   url.pathname.split('/').pop();
                    const fileType = fileName.split('.').pop();
                    this.trackDownload(fileName, fileType);
                }
            }
        });
    }
    
    isDownloadableFile(path) {
        const downloadableExtensions = [
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.zip', '.rar', '.tar', '.gz', '.7z',
            '.jpg', '.jpeg', '.png', '.gif', '.svg',
            '.mp3', '.mp4', '.avi', '.mov', '.wmv',
            '.txt', '.csv', '.json', '.xml'
        ];
        
        return downloadableExtensions.some(ext => path.toLowerCase().endsWith(ext));
    }
    
    sendAnalyticsEvent(eventType, data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'analytics_event',
                payload: {
                    eventType,
                    data,
                    sessionId: this.sessionId,
                    timestamp: Date.now(),
                    source: 'barodatek_analytics'
                }
            }));
        }
        
        // Also store locally for offline capability
        this.storeEventLocally(eventType, data);
    }
    
    storeEventLocally(eventType, data) {
        try {
            const events = JSON.parse(localStorage.getItem('barodatek_analytics') || '[]');
            events.push({
                eventType,
                data,
                timestamp: Date.now(),
                sessionId: this.sessionId
            });
            
            // Keep only last 1000 events
            if (events.length > 1000) {
                events.splice(0, events.length - 1000);
            }
            
            localStorage.setItem('barodatek_analytics', JSON.stringify(events));
        } catch (error) {
            console.error('Failed to store analytics event locally:', error);
        }
    }
    
    handleAnalyticsMessage(data) {
        switch (data.type) {
            case 'feature_flags':
                try {
                    if (data.flags) {
                        // Expose globally if needed
                        window.BARODATEK_FEATURE_FLAGS = data.flags;
                        // Specific requested flag: Enable Grok Code Fast 1 (Preview)
                        window.ENABLE_GROK_CODE_FAST_1 = !!data.flags.grokCodeFastV1Preview;
                        console.log('🧠 Feature flags received:', data.flags);
                    }
                } catch (e) {
                    console.warn('Feature flags handling error:', e);
                }
                break;
            case 'analytics_update':
                // Support both 'payload' and legacy 'stats' shapes
                const payload = data.payload || {};
                const legacy = data.stats || {};
                const unified = {
                    totalVisitors: payload.totalVisitors ?? legacy.pageViews ?? 0,
                    activeUsers: payload.activeUsers ?? legacy.activeUsers ?? 0,
                    topPages: payload.topPages || []
                };
                this.updateDashboard(unified);
                break;
            case 'realtime_stats':
                this.updateRealtimeStats(data.payload);
                break;
        }
    }
    
    startHeartbeat() {
        setInterval(() => {
            this.sendAnalyticsEvent('heartbeat', {
                sessionDuration: Date.now() - this.startTime,
                pageViews: this.pageViews,
                interactions: this.interactions,
                downloads: this.downloads,
                memoryUsage: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null
            });
        }, 30000); // Every 30 seconds
    }
    
    updatePageViewDisplay() {
        const element = document.getElementById('live-page-views');
        if (element) {
            element.textContent = this.pageViews.toLocaleString();
            this.animateCounter(element);
        }
    }
    
    updateInteractionDisplay() {
        const element = document.getElementById('live-interactions');
        if (element) {
            element.textContent = this.interactions.toLocaleString();
            this.animateCounter(element);
        }
    }
    
    updateDownloadDisplay() {
        const element = document.getElementById('live-downloads');
        if (element) {
            element.textContent = this.downloads.toLocaleString();
            this.animateCounter(element);
        }
    }
    
    animateCounter(element) {
        element.style.transform = 'scale(1.2)';
        element.style.color = '#667eea';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 200);
    }
    
    updateDashboard(data) {
        // Update real-time dashboard with server data
        if (data && data.totalVisitors !== undefined) {
            const element = document.getElementById('total-visitors');
            if (element) element.textContent = data.totalVisitors.toLocaleString();
        }
        
        if (data && data.activeUsers !== undefined) {
            const element = document.getElementById('active-users');
            if (element) element.textContent = data.activeUsers.toLocaleString();
        }
        
        if (data && data.topPages) {
            this.updateTopPages(data.topPages);
        }
    }
    
    updateTopPages(topPages) {
        // Update top pages display
        const container = document.getElementById('top-pages-list');
        if (container && topPages && topPages.length > 0) {
            container.innerHTML = topPages.map(page => `
                <div class="page-item">
                    <span class="page-path">${page.path}</span>
                    <span class="page-views">${page.views} views</span>
                </div>
            `).join('');
        }
    }
    
    updateRealtimeStats(stats) {
        // Update real-time statistics display
        const statsContainer = document.getElementById('realtime-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Active Users:</span>
                    <span class="stat-value" id="active-users">${stats.activeUsers || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Page Views Today:</span>
                    <span class="stat-value" id="page-views-today">${stats.pageViewsToday || 0}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Total Downloads:</span>
                    <span class="stat-value" id="total-downloads">${stats.totalDownloads || 0}</span>
                </div>
            `;
        }
    }
    
    showNotification(type, message, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `barodatek-notification notification-${type}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'notification-content';
        
        const messageSpan = document.createElement('span');
        messageSpan.className = 'notification-message';
        messageSpan.textContent = message;
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'notification-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', function() {
            notification.remove();
        });
        
        contentDiv.appendChild(messageSpan);
        contentDiv.appendChild(closeBtn);
        notification.appendChild(contentDiv);
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
    
    exportAnalytics() {
        const data = {
            sessionId: this.sessionId,
            visitorData: this.visitorData,
            events: this.events,
            summary: {
                sessionDuration: Date.now() - this.startTime,
                pageViews: this.pageViews,
                interactions: this.interactions,
                downloads: this.downloads
            },
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `barodatek-analytics-${this.sessionId}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        this.trackDownload(link.download, 'json', blob.size);
    }
    
    // Public API methods
    trackCustomEvent(eventName, data = {}) {
        this.trackInteraction('custom_event', document.body, {
            eventName,
            customData: data
        });
    }
    
    getSessionData() {
        return {
            sessionId: this.sessionId,
            startTime: this.startTime,
            duration: Date.now() - this.startTime,
            pageViews: this.pageViews,
            interactions: this.interactions,
            downloads: this.downloads,
            events: this.events
        };
    }
}

// CSS for notifications
const notificationStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.barodatek-notification {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.notification-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    margin-left: 10px;
    opacity: 0.8;
}

.notification-close:hover {
    opacity: 1;
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.barodaTekAnalytics = new BarodaTekAnalytics();
    
    // Add analytics dashboard to page if container exists
    const dashboardContainer = document.getElementById('analytics-dashboard');
    if (dashboardContainer) {
        // Create header
        const header = document.createElement('div');
        header.className = 'analytics-header';
        
        const title = document.createElement('h3');
        title.textContent = '🚀 BarodaTek.com Real-Time Analytics';
        
        const exportBtn = document.createElement('button');
        exportBtn.className = 'btn btn-sm btn-outline-primary';
        exportBtn.textContent = '📊 Export Data';
        exportBtn.addEventListener('click', () => {
            window.barodaTekAnalytics.exportAnalytics();
        });
        
        header.appendChild(title);
        header.appendChild(exportBtn);
        dashboardContainer.appendChild(header);
        
        // Add rest of dashboard
        const gridDiv = document.createElement('div');
        gridDiv.className = 'analytics-grid';
        gridDiv.innerHTML = `
            <div class="analytics-grid">
                <div class="analytics-card">
                    <div class="analytics-value" id="live-page-views">0</div>
                    <div class="analytics-label">Page Views</div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-value" id="live-interactions">0</div>
                    <div class="analytics-label">Interactions</div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-value" id="live-downloads">0</div>
                    <div class="analytics-label">Downloads</div>
                </div>
                <div class="analytics-card">
                    <div class="analytics-value" id="active-users">1</div>
                    <div class="analytics-label">Active Users</div>
                </div>
            </div>
            <div id="realtime-stats" class="realtime-stats"></div>
        `;
        
        dashboardContainer.appendChild(gridDiv);
    }
    
    console.log('🚀 BarodaTek Analytics initialized for session:', window.barodaTekAnalytics.sessionId);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BarodaTekAnalytics;
}