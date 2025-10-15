// 🔍 CLIENT-SIDE ERROR TRACKING SYSTEM
// Automatically logs all errors to the server for monitoring

class ErrorTracker {
    constructor() {
        this.apiUrl = window.location.origin + '/api/errors/log';
        this.errorQueue = [];
        this.isProcessing = false;
        
        this.init();
    }
    
    init() {
        // Catch global JavaScript errors
        window.addEventListener('error', (event) => {
            this.logError({
                message: event.message,
                stack: event.error?.stack || null,
                type: 'JavaScriptError',
                url: event.filename,
                line: event.lineno,
                column: event.colno,
                context: {
                    page: window.location.href,
                    userAgent: navigator.userAgent
                }
            });
        });
        
        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                message: event.reason?.message || String(event.reason),
                stack: event.reason?.stack || null,
                type: 'UnhandledPromiseRejection',
                url: window.location.href,
                context: {
                    page: window.location.href,
                    userAgent: navigator.userAgent,
                    promise: event.promise
                }
            });
        });
        
        // Catch console.error calls
        const originalError = console.error;
        console.error = (...args) => {
            this.logError({
                message: args.map(a => String(a)).join(' '),
                type: 'ConsoleError',
                url: window.location.href,
                context: {
                    page: window.location.href,
                    arguments: args
                }
            });
            originalError.apply(console, args);
        };
        
        // Monitor network errors
        this.monitorNetworkErrors();
        
        console.log('✅ Error Tracker initialized - All errors will be logged to server');
    }
    
    monitorNetworkErrors() {
        // Monitor fetch errors
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args);
                
                // Log failed responses
                if (!response.ok) {
                    this.logError({
                        message: `HTTP ${response.status}: ${response.statusText}`,
                        type: 'NetworkError',
                        url: args[0],
                        context: {
                            status: response.status,
                            statusText: response.statusText,
                            page: window.location.href
                        }
                    });
                }
                
                return response;
            } catch (error) {
                this.logError({
                    message: error.message,
                    stack: error.stack,
                    type: 'FetchError',
                    url: args[0],
                    context: {
                        page: window.location.href
                    }
                });
                throw error;
            }
        };
    }
    
    async logError(errorData) {
        // Add to queue
        this.errorQueue.push({
            ...errorData,
            timestamp: new Date().toISOString(),
            page: window.location.href,
            userAgent: navigator.userAgent
        });
        
        // Process queue
        if (!this.isProcessing) {
            this.processQueue();
        }
    }
    
    async processQueue() {
        if (this.errorQueue.length === 0) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        const error = this.errorQueue.shift();
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(error)
            });
            
            if (response.ok) {
                console.log('📝 Error logged to server:', error.type);
            }
        } catch (err) {
            console.warn('Failed to log error to server:', err.message);
            // Store in localStorage as fallback
            try {
                const storedErrors = JSON.parse(localStorage.getItem('error_log') || '[]');
                storedErrors.push(error);
                // Keep only last 50 errors
                if (storedErrors.length > 50) {
                    storedErrors.shift();
                }
                localStorage.setItem('error_log', JSON.stringify(storedErrors));
            } catch (storageError) {
                console.warn('Failed to store error locally:', storageError.message);
            }
        }
        
        // Process next error
        setTimeout(() => this.processQueue(), 100);
    }
    
    // Manual error logging method
    manual(message, type = 'ManualError', context = {}) {
        this.logError({
            message,
            type,
            url: window.location.href,
            context
        });
    }
    
    // Get stored errors (for debugging)
    getStoredErrors() {
        try {
            return JSON.parse(localStorage.getItem('error_log') || '[]');
        } catch (error) {
            return [];
        }
    }
    
    // Clear stored errors
    clearStoredErrors() {
        try {
            localStorage.removeItem('error_log');
            console.log('✅ Stored errors cleared');
        } catch (error) {
            console.warn('Failed to clear stored errors:', error.message);
        }
    }
}

// Initialize global error tracker
window.errorTracker = new ErrorTracker();

// Expose manual logging function
window.logError = (message, type, context) => {
    window.errorTracker.manual(message, type, context);
};

console.log('🔍 Global Error Tracking Active - window.errorTracker and window.logError() available');
