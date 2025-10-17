// 🔐 HIDDEN ADMIN ACCESS - Only visible to BarodaTek owner
// This script adds a hidden admin icon that appears only after secret activation

(function() {
    'use strict';
    
    // Secret configuration
    const SECRET_CONFIG = {
        // Secret key combination: Press Ctrl+Shift+B+T+K
        keySequence: ['Control', 'Shift', 'b', 't', 'k'],
        // Alternative: Click footer 5 times in specific pattern
        clickPattern: 5,
        // Or type secret phrase in console
        consolePhrase: 'barodatek-admin-2025',
        // Admin session duration (24 hours)
        sessionDuration: 24 * 60 * 60 * 1000
    };
    
    let keyPressSequence = [];
    let footerClickCount = 0;
    let adminActive = false;
    let adminIcon = null;
    
    // Check if admin session is active
    function checkAdminSession() {
        const session = localStorage.getItem('barodatek_admin_session');
        if (session) {
            const sessionData = JSON.parse(session);
            const now = Date.now();
            
            if (now < sessionData.expires) {
                activateAdminMode();
                return true;
            } else {
                localStorage.removeItem('barodatek_admin_session');
            }
        }
        return false;
    }
    
    // Activate admin mode
    function activateAdminMode() {
        if (adminActive) return;
        
        adminActive = true;
        console.log('%c🔓 ADMIN MODE ACTIVATED', 'color: #10b981; font-size: 16px; font-weight: bold;');
        
        // Create admin session
        localStorage.setItem('barodatek_admin_session', JSON.stringify({
            activated: Date.now(),
            expires: Date.now() + SECRET_CONFIG.sessionDuration
        }));
        
        createAdminIcon();
        showAdminNotification();
    }
    
    // Create floating admin icon
    function createAdminIcon() {
        if (adminIcon) return;
        
        adminIcon = document.createElement('div');
        adminIcon.id = 'barodatek-admin-icon';
        adminIcon.innerHTML = `
            <div class="admin-icon-container">
                <div class="admin-icon-button" title="AI Monitor Dashboard (Admin Only)">
                    <i class="fas fa-robot"></i>
                    <span class="admin-badge">ADMIN</span>
                </div>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .admin-icon-container {
                position: fixed;
                bottom: 80px;
                right: 20px;
                z-index: 9999;
                animation: slideInRight 0.5s ease-out;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            .admin-icon-button {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6);
                transition: all 0.3s ease;
                position: relative;
                border: 3px solid rgba(255, 255, 255, 0.3);
            }
            
            .admin-icon-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 30px rgba(102, 126, 234, 0.8);
            }
            
            .admin-icon-button:active {
                transform: scale(0.95);
            }
            
            .admin-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ef4444;
                color: white;
                font-size: 8px;
                font-weight: bold;
                padding: 2px 5px;
                border-radius: 10px;
                letter-spacing: 0.5px;
            }
            
            .admin-icon-button::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                opacity: 0.5;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% {
                    transform: scale(1);
                    opacity: 0.5;
                }
                50% {
                    transform: scale(1.2);
                    opacity: 0;
                }
            }
            
            .admin-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
                z-index: 10000;
                animation: slideInDown 0.5s ease-out;
                font-weight: 600;
            }
            
            @keyframes slideInDown {
                from {
                    transform: translateY(-100px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            .admin-notification i {
                margin-right: 10px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(adminIcon);
        
        // Click handler
        adminIcon.querySelector('.admin-icon-button').addEventListener('click', () => {
            window.open('/ai-monitor-dashboard.html', '_blank');
        });
    }
    
    // Show activation notification
    function showAdminNotification() {
        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        notification.innerHTML = `
            <i class="fas fa-shield-alt"></i>
            Admin Mode Activated
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInDown 0.5s ease-out reverse';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    // Listen for secret key combination
    document.addEventListener('keydown', (e) => {
        if (adminActive) return;
        
        keyPressSequence.push(e.key);
        
        // Keep only last 5 keys
        if (keyPressSequence.length > SECRET_CONFIG.keySequence.length) {
            keyPressSequence.shift();
        }
        
        // Check if sequence matches
        const sequenceMatch = SECRET_CONFIG.keySequence.every((key, index) => {
            return keyPressSequence[index]?.toLowerCase() === key.toLowerCase();
        });
        
        if (sequenceMatch) {
            activateAdminMode();
            keyPressSequence = [];
        }
    });
    
    // Listen for footer clicks (alternative activation method)
    document.addEventListener('DOMContentLoaded', () => {
        const footer = document.querySelector('footer');
        if (footer) {
            let lastClickTime = 0;
            
            footer.addEventListener('click', (e) => {
                if (adminActive) return;
                
                const now = Date.now();
                
                // Reset if more than 2 seconds between clicks
                if (now - lastClickTime > 2000) {
                    footerClickCount = 0;
                }
                
                footerClickCount++;
                lastClickTime = now;
                
                // Check if pattern is complete
                if (footerClickCount >= SECRET_CONFIG.clickPattern) {
                    activateAdminMode();
                    footerClickCount = 0;
                }
                
                // Visual feedback
                if (footerClickCount > 0 && footerClickCount < SECRET_CONFIG.clickPattern) {
                    footer.style.opacity = '0.7';
                    setTimeout(() => {
                        footer.style.opacity = '1';
                    }, 100);
                }
            });
        }
    });
    
    // Console activation method
    window.barodatekAdmin = function(phrase) {
        if (phrase === SECRET_CONFIG.consolePhrase) {
            activateAdminMode();
            return '✅ Admin access granted!';
        }
        return '❌ Invalid phrase';
    };
    
    // Deactivate admin mode
    window.deactivateAdmin = function() {
        if (!adminActive) return '❌ Admin mode not active';
        
        adminActive = false;
        localStorage.removeItem('barodatek_admin_session');
        
        if (adminIcon) {
            adminIcon.remove();
            adminIcon = null;
        }
        
        console.log('%c🔒 ADMIN MODE DEACTIVATED', 'color: #ef4444; font-size: 16px; font-weight: bold;');
        return '✅ Admin mode deactivated';
    };
    
    // Check for existing session on load
    checkAdminSession();
    
    // Hidden console message for developer
    console.log('%cBarodaTek Admin Access', 'color: #667eea; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);');
    console.log('%cActivation Methods:', 'color: #10b981; font-size: 14px; font-weight: bold;');
    console.log('1. Press: Ctrl + Shift + B + T + K');
    console.log('2. Click footer 5 times quickly');
    console.log('3. Type: barodatekAdmin("barodatek-admin-2025")');
    console.log('%cTo deactivate: deactivateAdmin()', 'color: #ef4444; font-size: 12px;');
})();
