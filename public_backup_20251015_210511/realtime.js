// Real-time WebSocket service for contract updates and notifications
class RealtimeService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.eventHandlers = new Map();
        this.init();
    }

    init() {
        this.connect();
        this.setupEventListeners();
    }

    connect() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            this.socket = new WebSocket(wsUrl);
            
            this.socket.onopen = () => {
                console.log('🟢 WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.showConnectionStatus('connected');
                this.emit('connected');
            };

            this.socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            };

            this.socket.onclose = () => {
                console.log('🔴 WebSocket disconnected');
                this.isConnected = false;
                this.showConnectionStatus('disconnected');
                this.emit('disconnected');
                this.attemptReconnect();
            };

            this.socket.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.showConnectionStatus('error');
                this.emit('error', error);
            };

        } catch (error) {
            console.error('❌ Failed to establish WebSocket connection:', error);
            this.attemptReconnect();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Max reconnection attempts reached');
            this.showConnectionStatus('failed');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        
        console.log(`🔄 Attempting to reconnect in ${delay/1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.showConnectionStatus('reconnecting', delay);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    handleMessage(data) {
        console.log('📨 Received:', data);
        
        switch (data.type) {
            case 'contract_created':
                this.handleContractCreated(data.payload);
                break;
            case 'contract_updated':
                this.handleContractUpdated(data.payload);
                break;
            case 'contract_deleted':
                this.handleContractDeleted(data.payload);
                break;
            case 'user_joined':
                this.handleUserJoined(data.payload);
                break;
            case 'user_left':
                this.handleUserLeft(data.payload);
                break;
            case 'notification':
                this.handleNotification(data.payload);
                break;
            case 'system_alert':
                this.handleSystemAlert(data.payload);
                break;
            default:
                this.emit(data.type, data.payload);
        }
    }

    handleContractCreated(contract) {
        this.emit('contract_created', contract);
        this.showNotification('success', `📋 New contract created: ${contract.title}`, {
            action: 'View',
            callback: () => window.location.href = `/contracts/${contract.id}`
        });
        
        // Update UI if contracts list is visible
        if (window.contractManager) {
            window.contractManager.addContract(contract);
        }
        
        // Update statistics
        this.updateStats();
    }

    handleContractUpdated(contract) {
        this.emit('contract_updated', contract);
        this.showNotification('info', `✏️ Contract updated: ${contract.title}`, {
            action: 'View Changes',
            callback: () => this.showContractDiff(contract)
        });
        
        // Update UI if contracts list is visible
        if (window.contractManager) {
            window.contractManager.updateContract(contract);
        }
    }

    handleContractDeleted(contractId) {
        this.emit('contract_deleted', contractId);
        this.showNotification('warning', `🗑️ Contract deleted (ID: ${contractId})`);
        
        // Update UI if contracts list is visible
        if (window.contractManager) {
            window.contractManager.removeContract(contractId);
        }
        
        // Update statistics
        this.updateStats();
    }

    handleUserJoined(user) {
        this.emit('user_joined', user);
        this.showNotification('info', `👋 ${user.name} joined the session`);
        this.updateActiveUsers();
    }

    handleUserLeft(user) {
        this.emit('user_left', user);
        this.showNotification('info', `👋 ${user.name} left the session`);
        this.updateActiveUsers();
    }

    handleNotification(notification) {
        this.emit('notification', notification);
        this.showNotification(notification.type, notification.message, notification.options);
    }

    handleSystemAlert(alert) {
        this.emit('system_alert', alert);
        this.showNotification('warning', `⚠️ System Alert: ${alert.message}`, {
            persistent: true,
            action: 'Details',
            callback: () => this.showAlertDetails(alert)
        });
    }

    send(type, payload) {
        if (!this.isConnected || !this.socket) {
            console.warn('⚠️ Cannot send message: WebSocket not connected');
            return false;
        }

        try {
            const message = JSON.stringify({ type, payload, timestamp: Date.now() });
            this.socket.send(message);
            console.log('📤 Sent:', { type, payload });
            return true;
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            return false;
        }
    }

    // Event system
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    off(event, handler) {
        if (!this.eventHandlers.has(event)) return;
        const handlers = this.eventHandlers.get(event);
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
    }

    emit(event, data) {
        if (!this.eventHandlers.has(event)) return;
        this.eventHandlers.get(event).forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`❌ Error in event handler for ${event}:`, error);
            }
        });
    }

    // UI Helper methods
    showConnectionStatus(status, delay = null) {
        const statusElement = document.getElementById('ws-status');
        if (!statusElement) return;

        let statusText, statusClass, icon;
        
        switch (status) {
            case 'connected':
                statusText = 'Connected';
                statusClass = 'text-success';
                icon = '🟢';
                break;
            case 'disconnected':
                statusText = 'Disconnected';
                statusClass = 'text-warning';
                icon = '🟡';
                break;
            case 'reconnecting':
                statusText = `Reconnecting${delay ? ` in ${Math.ceil(delay/1000)}s` : '...'}`;
                statusClass = 'text-info';
                icon = '🔄';
                break;
            case 'error':
                statusText = 'Connection Error';
                statusClass = 'text-danger';
                icon = '🔴';
                break;
            case 'failed':
                statusText = 'Connection Failed';
                statusClass = 'text-danger';
                icon = '❌';
                break;
            default:
                statusText = 'Unknown';
                statusClass = 'text-muted';
                icon = '❓';
        }

        statusElement.innerHTML = `<span class="${statusClass}">${icon} ${statusText}</span>`;
    }

    showNotification(type, message, options = {}) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${this.getBootstrapAlertType(type)} alert-dismissible fade show notification-item`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            border-radius: 8px;
        `;

        let actionButton = '';
        if (options.action && options.callback) {
            actionButton = `
                <button type="button" class="btn btn-sm btn-outline-primary ms-2" onclick="this.closest('.notification-item').callback()">
                    ${options.action}
                </button>
            `;
        }

        notification.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <div class="fw-bold">${this.getNotificationTitle(type)}</div>
                    <div>${message}</div>
                </div>
                <div class="d-flex align-items-center">
                    ${actionButton}
                    <button type="button" class="btn-close ms-2" data-bs-dismiss="alert"></button>
                </div>
            </div>
        `;

        // Add callback if provided
        if (options.callback) {
            notification.callback = options.callback;
        }

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after delay (unless persistent)
        if (!options.persistent) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, options.duration || 5000);
        }

        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
    }

    getBootstrapAlertType(type) {
        const typeMap = {
            'success': 'success',
            'error': 'danger',
            'warning': 'warning',
            'info': 'info',
            'danger': 'danger'
        };
        return typeMap[type] || 'secondary';
    }

    getNotificationTitle(type) {
        const titleMap = {
            'success': '✅ Success',
            'error': '❌ Error',
            'warning': '⚠️ Warning',
            'info': '💡 Information',
            'danger': '🚨 Alert'
        };
        return titleMap[type] || '📢 Notification';
    }

    updateStats() {
        fetch('/api/stats')
            .then(response => response.json())
            .then(data => {
                if (data.success && window.updateStatsUI) {
                    window.updateStatsUI(data.data);
                }
            })
            .catch(error => console.error('Failed to update stats:', error));
    }

    updateActiveUsers() {
        // Update active users indicator
        const activeUsersElement = document.getElementById('active-users');
        if (activeUsersElement) {
            // This would be populated from server data
            activeUsersElement.innerHTML = '👥 Online users: Loading...';
        }
    }

    showContractDiff(contract) {
        // Show a modal with contract changes
        const modal = new bootstrap.Modal(document.getElementById('contractDiffModal') || this.createDiffModal());
        modal.show();
    }

    createDiffModal() {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'contractDiffModal';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">📋 Contract Changes</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="contract-diff-content">Loading changes...</div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary">View Full Contract</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    showAlertDetails(alert) {
        this.showNotification('info', `Alert Details: ${alert.details || 'No additional details available'}`);
    }

    // Public API methods
    subscribeToContract(contractId) {
        this.send('subscribe_contract', { contractId });
    }

    unsubscribeFromContract(contractId) {
        this.send('unsubscribe_contract', { contractId });
    }

    joinCollaboration(contractId, userId) {
        this.send('join_collaboration', { contractId, userId });
    }

    leaveCollaboration(contractId, userId) {
        this.send('leave_collaboration', { contractId, userId });
    }

    sendChatMessage(message, contractId = null) {
        this.send('chat_message', { message, contractId, timestamp: Date.now() });
    }

    requestSync() {
        this.send('request_sync', {});
    }

    // Utility methods
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            maxReconnectAttempts: this.maxReconnectAttempts
        };
    }

    destroy() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.eventHandlers.clear();
        this.isConnected = false;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the realtime service
    window.realtimeService = new RealtimeService();
    
    // Add connection status indicator to navbar if it exists
    const navbar = document.querySelector('.navbar-nav');
    if (navbar) {
        const statusItem = document.createElement('li');
        statusItem.className = 'nav-item';
        statusItem.innerHTML = `
            <span class="nav-link" id="ws-status">
                <span class="text-muted">🔄 Connecting...</span>
            </span>
        `;
        navbar.appendChild(statusItem);
    }
    
    // Set up global event handlers
    window.realtimeService.on('connected', () => {
        console.log('🎉 Real-time features are now active!');
    });
    
    window.realtimeService.on('disconnected', () => {
        console.log('⚠️ Real-time features temporarily unavailable');
    });
    
    // Add heartbeat to keep connection alive
    setInterval(() => {
        if (window.realtimeService.isConnected) {
            window.realtimeService.send('heartbeat', { timestamp: Date.now() });
        }
    }, 30000);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealtimeService;
}