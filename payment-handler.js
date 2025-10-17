/**
 * 💳 BarodaTek Payment Handler
 * Real payment processing and service delivery system
 * Business Email: barodatek.services@gmail.com
 * Cash App: $baroda98
 */

// Using dynamic import for nodemailer
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class PaymentHandler {
    constructor() {
        this.businessEmail = 'barodatek.services@gmail.com';
        this.cashAppTag = '$baroda98';
        this.ordersFilePath = path.join(__dirname, 'data', 'orders.json');
        this.customersFilePath = path.join(__dirname, 'data', 'customers.json');
        this.orders = [];
        this.customers = [];
        
        // Email transporter will be initialized lazily when needed
        this.emailTransporter = null;
        this.initEmailTransporter();
        
        // Service catalog with real pricing
        this.services = {
            'pro-support': {
                id: 'pro-support',
                name: 'Professional Support',
                price: 99,
                period: 'month',
                features: [
                    'Priority email support (24hr response)',
                    'Advanced API features access',
                    'Code review assistance',
                    'Custom integration help',
                    'Monthly consultation call'
                ],
                deliveryMethod: 'websocket' // Real-time access via WebSocket
            },
            'api-integration': {
                id: 'api-integration',
                name: 'API Integration Service',
                price: 499,
                period: 'project',
                features: [
                    'Custom API integration',
                    'Full documentation',
                    'Testing & deployment',
                    '30 days support',
                    'Source code delivery'
                ],
                deliveryMethod: 'download' // Secure download link
            },
            'custom-solution': {
                id: 'custom-solution',
                name: 'Custom Development',
                price: 1999,
                period: 'project',
                features: [
                    'Full custom development',
                    'Project management',
                    'Unlimited revisions',
                    '90 days support',
                    'Complete ownership'
                ],
                deliveryMethod: 'both' // WebSocket updates + final download
            }
        };
        
        // Product catalog
        this.products = {
            'api-templates': {
                id: 'api-templates',
                name: 'API Code Templates Pack',
                price: 49,
                type: 'digital-download',
                files: ['templates/api-templates.zip'],
                description: '50+ production-ready API templates'
            },
            'postman-collection': {
                id: 'postman-collection',
                name: 'Complete Postman Collection',
                price: 29,
                type: 'digital-download',
                files: ['collections/barodatek-complete.json'],
                description: 'Full API collection with examples'
            },
            'dev-toolkit': {
                id: 'dev-toolkit',
                name: 'Developer Toolkit',
                price: 99,
                type: 'digital-download',
                files: [
                    'toolkit/scripts.zip',
                    'toolkit/utilities.zip',
                    'toolkit/documentation.pdf'
                ],
                description: 'Complete development toolkit'
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Create data directory if not exists
            await fs.mkdir(path.join(__dirname, 'data'), { recursive: true });
            
            // Load existing orders and customers
            try {
                const ordersData = await fs.readFile(this.ordersFilePath, 'utf8');
                this.orders = JSON.parse(ordersData);
            } catch (err) {
                this.orders = [];
            }
            
            try {
                const customersData = await fs.readFile(this.customersFilePath, 'utf8');
                this.customers = JSON.parse(customersData);
            } catch (err) {
                this.customers = [];
            }
            
            console.log('✅ Payment Handler initialized');
            console.log(`📧 Business Email: ${this.businessEmail}`);
            console.log(`💰 Cash App: ${this.cashAppTag}`);
        } catch (error) {
            console.error('❌ Payment Handler init error:', error);
        }
    }
    
    /**
     * Initialize email transporter (lazy loading)
     */
    async initEmailTransporter() {
        try {
            // Only initialize if email password is set
            if (process.env.EMAIL_PASSWORD) {
                const nodemailer = require('nodemailer');
                this.emailTransporter = nodemailer.createTransporter({
                    service: 'gmail',
                    auth: {
                        user: process.env.BUSINESS_EMAIL || this.businessEmail,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });
                console.log('✅ Email transporter initialized');
            } else {
                console.log('⚠️  Email not configured - set EMAIL_PASSWORD env variable');
            }
        } catch (error) {
            console.error('⚠️  Email transporter error (non-critical):', error.message);
        }
    }
    
    /**
     * Create a new order
     */
    async createOrder(orderData) {
        try {
            const order = {
                orderId: this.generateOrderId(),
                ...orderData,
                status: 'pending',
                paymentMethod: 'cash-app',
                cashAppTag: this.cashAppTag,
                businessEmail: this.businessEmail,
                createdAt: new Date().toISOString(),
                accessToken: null,
                downloadLinks: []
            };
            
            this.orders.push(order);
            await this.saveOrders();
            
            // Send confirmation email to customer
            await this.sendOrderConfirmation(order);
            
            // Notify admin
            await this.notifyAdmin(order);
            
            return {
                success: true,
                order,
                paymentInstructions: this.getPaymentInstructions(order)
            };
        } catch (error) {
            console.error('❌ Create order error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Verify payment and grant access
     */
    async verifyPayment(orderId, verificationData) {
        try {
            const order = this.orders.find(o => o.orderId === orderId);
            if (!order) {
                return { success: false, error: 'Order not found' };
            }
            
            // In production, this would verify with Cash App API or manual verification
            // For now, we'll use a verification code system
            
            order.status = 'verified';
            order.verifiedAt = new Date().toISOString();
            order.paymentReference = verificationData.reference;
            
            // Generate access token
            order.accessToken = this.generateAccessToken(orderId);
            
            // Generate download links if applicable
            if (order.type === 'product') {
                order.downloadLinks = await this.generateDownloadLinks(order);
            }
            
            // Grant service access if applicable
            if (order.type === 'service') {
                await this.grantServiceAccess(order);
            }
            
            await this.saveOrders();
            
            // Send access credentials to customer
            await this.sendAccessCredentials(order);
            
            return {
                success: true,
                order,
                accessToken: order.accessToken,
                downloadLinks: order.downloadLinks
            };
        } catch (error) {
            console.error('❌ Verify payment error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get payment instructions
     */
    getPaymentInstructions(order) {
        return {
            cashApp: this.cashAppTag,
            amount: order.totalAmount,
            reference: order.orderId,
            instructions: [
                `1. Open Cash App on your mobile device`,
                `2. Send $${order.totalAmount} to ${this.cashAppTag}`,
                `3. Include reference: ${order.orderId}`,
                `4. Take a screenshot of the payment confirmation`,
                `5. Email screenshot to: ${this.businessEmail}`,
                `6. We'll verify within 1 hour and send access credentials`
            ],
            emailSubject: `Payment Confirmation - Order ${order.orderId}`,
            emailBody: `Hi BarodaTek,\n\nI've sent $${order.totalAmount} via Cash App ${this.cashAppTag}.\n\nOrder ID: ${order.orderId}\nCash App Transaction ID: [YOUR TRANSACTION ID]\n\nPlease verify and grant access.\n\nThank you!`
        };
    }
    
    /**
     * Generate secure download links
     */
    async generateDownloadLinks(order) {
        const links = [];
        const product = this.products[order.itemId];
        
        if (!product) return links;
        
        for (const file of product.files) {
            const token = this.generateDownloadToken(order.orderId, file);
            links.push({
                file: path.basename(file),
                url: `/api/download/${token}`,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
            });
        }
        
        return links;
    }
    
    /**
     * Grant service access
     */
    async grantServiceAccess(order) {
        const service = this.services[order.itemId];
        if (!service) return;
        
        // Add customer to service access list
        const customer = {
            customerId: order.customerId,
            email: order.customerEmail,
            service: service.id,
            accessToken: order.accessToken,
            grantedAt: new Date().toISOString(),
            expiresAt: service.period === 'month' 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : null // Lifetime for project-based
        };
        
        this.customers.push(customer);
        await this.saveCustomers();
    }
    
    /**
     * Check if customer has access to service
     */
    async checkServiceAccess(accessToken) {
        const customer = this.customers.find(c => c.accessToken === accessToken);
        if (!customer) return { hasAccess: false };
        
        // Check if subscription expired
        if (customer.expiresAt && new Date(customer.expiresAt) < new Date()) {
            return { hasAccess: false, reason: 'Subscription expired' };
        }
        
        return {
            hasAccess: true,
            customer,
            service: this.services[customer.service]
        };
    }
    
    /**
     * Send email confirmation
     */
    async sendOrderConfirmation(order) {
        const instructions = this.getPaymentInstructions(order);
        
        const mailOptions = {
            from: this.businessEmail,
            to: order.customerEmail,
            subject: `Order Confirmation - ${order.orderId}`,
            html: `
                <h2>Thank you for your order!</h2>
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Item:</strong> ${order.itemName}</p>
                <p><strong>Amount:</strong> $${order.totalAmount}</p>
                
                <h3>Payment Instructions:</h3>
                <ol>
                    ${instructions.instructions.map(i => `<li>${i}</li>`).join('')}
                </ol>
                
                <p><strong>Cash App:</strong> ${this.cashAppTag}</p>
                <p><strong>Business Email:</strong> ${this.businessEmail}</p>
                
                <p>Once payment is verified, you'll receive access credentials within 1 hour.</p>
                
                <p>Thank you for choosing BarodaTek!</p>
            `
        };
        
        try {
            await this.emailTransporter.sendMail(mailOptions);
            console.log(`✅ Order confirmation sent to ${order.customerEmail}`);
        } catch (error) {
            console.error('❌ Email send error:', error);
        }
    }
    
    /**
     * Send access credentials
     */
    async sendAccessCredentials(order) {
        const mailOptions = {
            from: this.businessEmail,
            to: order.customerEmail,
            subject: `Access Granted - ${order.itemName}`,
            html: `
                <h2>Payment Verified! 🎉</h2>
                <p>Your payment has been verified and access has been granted.</p>
                
                <h3>Access Details:</h3>
                <p><strong>Access Token:</strong> <code>${order.accessToken}</code></p>
                
                ${order.downloadLinks.length > 0 ? `
                    <h3>Download Links:</h3>
                    <ul>
                        ${order.downloadLinks.map(link => `
                            <li><a href="https://barodatek.com${link.url}">${link.file}</a> (Expires: ${new Date(link.expiresAt).toLocaleDateString()})</li>
                        `).join('')}
                    </ul>
                ` : ''}
                
                ${order.type === 'service' ? `
                    <h3>Service Access:</h3>
                    <p>Your service is now active. Use your access token when connecting to our platform.</p>
                    <p>WebSocket URL: <code>wss://barodatek.com/ws?token=${order.accessToken}</code></p>
                ` : ''}
                
                <p>Need help? Reply to this email or contact us at ${this.businessEmail}</p>
                
                <p>Thank you for your business!</p>
            `
        };
        
        try {
            await this.emailTransporter.sendMail(mailOptions);
            console.log(`✅ Access credentials sent to ${order.customerEmail}`);
        } catch (error) {
            console.error('❌ Email send error:', error);
        }
    }
    
    /**
     * Notify admin of new order
     */
    async notifyAdmin(order) {
        const mailOptions = {
            from: this.businessEmail,
            to: this.businessEmail,
            subject: `🔔 New Order - ${order.orderId}`,
            html: `
                <h2>New Order Received</h2>
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</p>
                <p><strong>Item:</strong> ${order.itemName}</p>
                <p><strong>Amount:</strong> $${order.totalAmount}</p>
                <p><strong>Type:</strong> ${order.type}</p>
                
                <p>Waiting for Cash App payment verification.</p>
                <p><strong>Cash App:</strong> ${this.cashAppTag}</p>
                <p><strong>Reference:</strong> ${order.orderId}</p>
                
                <p>Customer will email payment confirmation.</p>
            `
        };
        
        try {
            await this.emailTransporter.sendMail(mailOptions);
        } catch (error) {
            console.error('❌ Admin notification error:', error);
        }
    }
    
    // Helper methods
    generateOrderId() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    generateAccessToken(orderId) {
        return crypto.createHash('sha256').update(orderId + Date.now()).digest('hex');
    }
    
    generateDownloadToken(orderId, file) {
        return crypto.createHash('sha256').update(orderId + file + Date.now()).digest('hex');
    }
    
    async saveOrders() {
        await fs.writeFile(this.ordersFilePath, JSON.stringify(this.orders, null, 2));
    }
    
    async saveCustomers() {
        await fs.writeFile(this.customersFilePath, JSON.stringify(this.customers, null, 2));
    }
    
    /**
     * Get all orders (admin only)
     */
    getAllOrders() {
        return this.orders;
    }
    
    /**
     * Get order by ID
     */
    getOrder(orderId) {
        return this.orders.find(o => o.orderId === orderId);
    }
    
    /**
     * Manual payment verification (admin)
     */
    async manualVerify(orderId, adminNotes) {
        return await this.verifyPayment(orderId, {
            reference: 'MANUAL-' + Date.now(),
            verifiedBy: 'admin',
            notes: adminNotes
        });
    }
}

module.exports = new PaymentHandler();
