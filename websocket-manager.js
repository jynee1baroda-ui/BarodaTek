// WebSocket Auto-Reconnection Manager
// Implements exponential backoff for robust reconnection

class WebSocketManager {
    constructor(url, options = {}) {
        this.url = url;
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
        this.reconnectDelay = options.reconnectDelay || 1000; // Start at 1 second
        this.maxReconnectDelay = options.maxReconnectDelay || 30000; // Max 30 seconds
        this.reconnectTimer = null;
        this.isIntentionallyClosed = false;
        this.onMessageCallbacks = [];
        this.onOpenCallbacks = [];
        this.onCloseCallbacks = [];
        this.onErrorCallbacks = [];
        
        this.connect();
    }
    
    connect() {
        if (this.isIntentionallyClosed) return;
        
        try {
            console.log(`🔌 Connecting to WebSocket: ${this.url}`);
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = (event) => {
                console.log('✅ WebSocket connected');
                this.reconnectAttempts = 0;
                this.reconnectDelay = 1000; // Reset delay
                this.onOpenCallbacks.forEach(cb => cb(event));
            };
            
            this.ws.onmessage = (event) => {
                this.onMessageCallbacks.forEach(cb => cb(event));
            };
            
            this.ws.onclose = (event) => {
                console.log(`⚠️  WebSocket disconnected (Code: ${event.code})`);
                this.onCloseCallbacks.forEach(cb => cb(event));
                
                if (!this.isIntentionallyClosed) {
                    this.scheduleReconnect();
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.onErrorCallbacks.forEach(cb => cb(error));
            };
            
        } catch (error) {
            console.error('❌ WebSocket connection failed:', error);
            this.scheduleReconnect();
        }
    }
    
    scheduleReconnect() {
        if (this.isIntentionallyClosed) return;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached. Giving up.');
            return;
        }
        
        // Exponential backoff with jitter
        const jitter = Math.random() * 1000;
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts) + jitter,
            this.maxReconnectDelay
        );
        
        this.reconnectAttempts++;
        console.log(`🔄 Reconnecting in ${Math.round(delay/1000)}s (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
        
        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, delay);
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
            return true;
        } else {
            console.warn('⚠️  WebSocket not connected. Message not sent.');
            return false;
        }
    }
    
    close() {
        this.isIntentionallyClosed = true;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
        }
        if (this.ws) {
            this.ws.close();
        }
        console.log('🔌 WebSocket closed intentionally');
    }
    
    onMessage(callback) {
        this.onMessageCallbacks.push(callback);
    }
    
    onOpen(callback) {
        this.onOpenCallbacks.push(callback);
    }
    
    onClose(callback) {
        this.onCloseCallbacks.push(callback);
    }
    
    onError(callback) {
        this.onErrorCallbacks.push(callback);
    }
    
    getState() {
        if (!this.ws) return 'DISCONNECTED';
        
        const states = {
            [WebSocket.CONNECTING]: 'CONNECTING',
            [WebSocket.OPEN]: 'OPEN',
            [WebSocket.CLOSING]: 'CLOSING',
            [WebSocket.CLOSED]: 'CLOSED'
        };
        
        return states[this.ws.readyState] || 'UNKNOWN';
    }
}

// Usage Example:
// const wsManager = new WebSocketManager('ws://localhost:8080');
// wsManager.onMessage((event) => {
//     console.log('Received:', event.data);
// });
// wsManager.send({ type: 'ping' });

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketManager;
}
