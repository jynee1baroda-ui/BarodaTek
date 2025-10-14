/**
 * Client-Side Configuration
 * Auto-detects environment and provides appropriate URLs
 */

export const CONFIG = {
    /**
     * Get the base API URL based on current environment
     * @returns {string} API base URL
     */
    get API_URL() {
        // Vercel production
        if (window.location.hostname.includes('vercel.app') || 
            window.location.hostname.includes('barodatek')) {
            return `${window.location.origin}/api`;
        }
        
        // Local development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1') {
            return 'http://localhost:8080/api';
        }
        
        // Fallback to same origin
        return `${window.location.origin}/api`;
    },
    
    /**
     * Get WebSocket URL based on current environment
     * @returns {string} WebSocket URL
     */
    get WS_URL() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        // Local development
        if (window.location.hostname === 'localhost') {
            return 'ws://localhost:8080';
        }
        
        return `${protocol}//${host}`;
    },
    
    /**
     * Check if running in production
     * @returns {boolean}
     */
    get IS_PRODUCTION() {
        return window.location.hostname.includes('vercel.app') || 
               window.location.hostname.includes('barodatek') ||
               window.location.protocol === 'https:';
    },
    
    /**
     * Check if running locally
     * @returns {boolean}
     */
    get IS_LOCAL() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    },
    
    /**
     * Get current environment name
     * @returns {string} 'production' | 'development'
     */
    get ENVIRONMENT() {
        return this.IS_PRODUCTION ? 'production' : 'development';
    },
    
    /**
     * Contact information
     */
    CONTACT: {
        email: 'barodatek.services@gmail.com',
        cashapp: '$baroda98',
        github: 'https://github.com/barodatek'
    },
    
    /**
     * Feature flags
     */
    FEATURES: {
        analytics: true,
        aiMonitor: true,
        realtime: true,
        debugMode: !this.IS_PRODUCTION
    }
};

// Make config immutable
Object.freeze(CONFIG);
Object.freeze(CONFIG.CONTACT);
Object.freeze(CONFIG.FEATURES);

// Log environment on load (dev only)
if (CONFIG.FEATURES.debugMode) {
    console.log('🔧 BarodaTek Config:', {
        environment: CONFIG.ENVIRONMENT,
        apiUrl: CONFIG.API_URL,
        wsUrl: CONFIG.WS_URL,
        features: CONFIG.FEATURES
    });
}
