// Newsletter Management System for BarodaTek
// This file helps you manage and send monthly newsletters to subscribers

const fs = require('fs');
const path = require('path');

/**
 * Newsletter Template Generator
 * Creates monthly newsletter content
 */
class NewsletterManager {
    constructor() {
        this.subscribersFile = path.join(__dirname, 'data', 'newsletter-subscribers.json');
        this.historyFile = path.join(__dirname, 'data', 'newsletter-history.json');
    }

    /**
     * Get all active subscribers
     */
    getSubscribers() {
        try {
            if (fs.existsSync(this.subscribersFile)) {
                const data = fs.readFileSync(this.subscribersFile, 'utf8');
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            console.error('Error reading subscribers:', error);
            return [];
        }
    }

    /**
     * Add new subscriber
     */
    addSubscriber(email, name = '') {
        const subscribers = this.getSubscribers();
        
        // Check if already subscribed
        if (subscribers.find(s => s.email === email)) {
            return { success: false, message: 'Email already subscribed' };
        }

        subscribers.push({
            email,
            name,
            subscribedAt: new Date().toISOString(),
            status: 'active'
        });

        this.saveSubscribers(subscribers);
        return { success: true, message: 'Successfully subscribed' };
    }

    /**
     * Save subscribers to file
     */
    saveSubscribers(subscribers) {
        try {
            const dir = path.dirname(this.subscribersFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(this.subscribersFile, JSON.stringify(subscribers, null, 2));
        } catch (error) {
            console.error('Error saving subscribers:', error);
        }
    }

    /**
     * Generate Monthly Newsletter Template
     */
    generateNewsletterTemplate(month, year) {
        const template = {
            subject: `🚀 BarodaTek Monthly Update - ${month} ${year}`,
            
            // HTML Email Body
            htmlBody: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BarodaTek Newsletter - ${month} ${year}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #ffffff;">
    <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(180deg, #0a0a0a 0%, #141414 100%);">
        
        <!-- Header -->
        <div style="background: rgba(255, 26, 64, 0.1); padding: 40px 20px; text-align: center; border-bottom: 2px solid rgba(255, 26, 64, 0.3);">
            <h1 style="color: #ff1a40; margin: 0; font-size: 28px;">🎯 BarodaTek</h1>
            <p style="color: #a0a0a8; margin: 10px 0 0 0; font-size: 14px;">${month} ${year} Newsletter</p>
        </div>

        <!-- Welcome Message -->
        <div style="padding: 40px 20px;">
            <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 20px;">
                👋 Hello Developer!
            </h2>
            <p style="color: #d0d0d8; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Welcome to this month's BarodaTek update! We've been busy building amazing tools and resources for developers like you.
            </p>
        </div>

        <!-- What's New Section -->
        <div style="padding: 20px; background: rgba(255, 26, 64, 0.05); margin: 20px; border-radius: 8px; border: 1px solid rgba(255, 26, 64, 0.2);">
            <h3 style="color: #ff1a40; font-size: 20px; margin-top: 0;">
                🚀 What's New This Month
            </h3>
            <ul style="color: #d0d0d8; line-height: 1.8;">
                <li><strong>New Feature:</strong> [Add your new feature here]</li>
                <li><strong>Updated:</strong> [Add your updates here]</li>
                <li><strong>Coming Soon:</strong> [Add upcoming features]</li>
            </ul>
        </div>

        <!-- API Tips Section -->
        <div style="padding: 20px; margin: 20px;">
            <h3 style="color: #ffffff; font-size: 20px; margin-top: 0;">
                💡 Developer Tips
            </h3>
            <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px; border-left: 4px solid #ff1a40;">
                <p style="color: #d0d0d8; margin: 0; line-height: 1.6;">
                    <strong>Tip of the Month:</strong> [Add your developer tip here]
                </p>
            </div>
        </div>

        <!-- Services Highlight -->
        <div style="padding: 20px; margin: 20px; background: linear-gradient(135deg, rgba(255, 26, 64, 0.1) 0%, rgba(255, 26, 64, 0.05) 100%); border-radius: 8px;">
            <h3 style="color: #ffffff; font-size: 20px; margin-top: 0;">
                🛠️ Our Services
            </h3>
            <p style="color: #d0d0d8; line-height: 1.6; margin-bottom: 15px;">
                Need help with your project? We offer:
            </p>
            <ul style="color: #d0d0d8; line-height: 1.8;">
                <li>🔧 Custom API Development</li>
                <li>🌐 Full-Stack Web Development</li>
                <li>📱 Mobile App Development</li>
                <li>☁️ Cloud Integration & Deployment</li>
                <li>📊 Technical Consulting</li>
            </ul>
            <a href="https://barodatek.com" style="display: inline-block; background: #ff1a40; color: #ffffff; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin-top: 10px; font-weight: bold;">
                Learn More
            </a>
        </div>

        <!-- Resources Section -->
        <div style="padding: 20px; margin: 20px;">
            <h3 style="color: #ffffff; font-size: 20px; margin-top: 0;">
                📚 Helpful Resources
            </h3>
            <div style="color: #d0d0d8; line-height: 1.8;">
                <p>📖 <a href="https://barodatek.com/docs" style="color: #ff1a40; text-decoration: none;">API Documentation</a></p>
                <p>🎮 <a href="https://barodatek.com" style="color: #ff1a40; text-decoration: none;">Interactive Tutorials</a></p>
                <p>💬 <a href="https://barodatek.com" style="color: #ff1a40; text-decoration: none;">Developer Community</a></p>
            </div>
        </div>

        <!-- Call to Action -->
        <div style="padding: 30px 20px; text-align: center; background: rgba(255, 26, 64, 0.1); margin: 20px; border-radius: 8px;">
            <h3 style="color: #ffffff; margin-top: 0;">Ready to Build Something Amazing?</h3>
            <p style="color: #d0d0d8; margin-bottom: 20px;">Start your free trial today!</p>
            <a href="https://barodatek.com" style="display: inline-block; background: #ff1a40; color: #ffffff; padding: 15px 40px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Get Started Free
            </a>
        </div>

        <!-- Footer -->
        <div style="padding: 30px 20px; text-align: center; border-top: 1px solid rgba(255, 26, 64, 0.2);">
            <p style="color: #a0a0a8; font-size: 14px; margin-bottom: 10px;">
                Thank you for being part of the BarodaTek community! 🙌
            </p>
            <p style="color: #a0a0a8; font-size: 12px; margin-bottom: 5px;">
                Questions? Reply to this email or contact us at:
            </p>
            <p style="color: #ff1a40; font-size: 14px; margin-bottom: 20px;">
                <a href="mailto:barodatek.services@gmail.com" style="color: #ff1a40; text-decoration: none;">
                    barodatek.services@gmail.com
                </a>
            </p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255, 26, 64, 0.1);">
                <p style="color: #707070; font-size: 11px; margin: 5px 0;">
                    You're receiving this because you subscribed to BarodaTek updates
                </p>
                <p style="color: #707070; font-size: 11px; margin: 5px 0;">
                    <a href="https://barodatek.com/unsubscribe" style="color: #707070; text-decoration: underline;">
                        Unsubscribe
                    </a> | 
                    <a href="https://barodatek.com" style="color: #707070; text-decoration: underline;">
                        Update Preferences
                    </a>
                </p>
                <p style="color: #707070; font-size: 11px; margin-top: 15px;">
                    © ${year} BarodaTek. All rights reserved.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
            `,

            // Plain Text Version (for email clients that don't support HTML)
            textBody: `
BarodaTek Monthly Update - ${month} ${year}

Hello Developer!

Welcome to this month's BarodaTek update! We've been busy building amazing tools and resources for developers like you.

🚀 WHAT'S NEW THIS MONTH
- New Feature: [Add your new feature here]
- Updated: [Add your updates here]
- Coming Soon: [Add upcoming features]

💡 DEVELOPER TIPS
Tip of the Month: [Add your developer tip here]

🛠️ OUR SERVICES
Need help with your project? We offer:
• Custom API Development
• Full-Stack Web Development
• Mobile App Development
• Cloud Integration & Deployment
• Technical Consulting

📚 HELPFUL RESOURCES
• API Documentation: https://barodatek.com/docs
• Interactive Tutorials: https://barodatek.com
• Developer Community: https://barodatek.com

---

Thank you for being part of the BarodaTek community! 🙌

Questions? Contact us at: barodatek.services@gmail.com

© ${year} BarodaTek. All rights reserved.
You can unsubscribe at: https://barodatek.com/unsubscribe
            `
        };

        return template;
    }

    /**
     * Get newsletter stats
     */
    getStats() {
        const subscribers = this.getSubscribers();
        return {
            totalSubscribers: subscribers.length,
            activeSubscribers: subscribers.filter(s => s.status === 'active').length,
            thisMonth: subscribers.filter(s => {
                const subDate = new Date(s.subscribedAt);
                const now = new Date();
                return subDate.getMonth() === now.getMonth() && 
                       subDate.getFullYear() === now.getFullYear();
            }).length
        };
    }

    /**
     * Export subscribers as CSV
     */
    exportSubscribersCSV() {
        const subscribers = this.getSubscribers();
        let csv = 'Email,Name,Subscribed At,Status\n';
        
        subscribers.forEach(sub => {
            csv += `${sub.email},"${sub.name}",${sub.subscribedAt},${sub.status}\n`;
        });

        return csv;
    }
}

// Export for use in server
module.exports = NewsletterManager;

// Example usage:
if (require.main === module) {
    const manager = new NewsletterManager();
    
    // Generate template for current month
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    const template = manager.generateNewsletterTemplate(months[now.getMonth()], now.getFullYear());
    
    console.log('📧 Newsletter Template Generated!');
    console.log('Subject:', template.subject);
    console.log('\nTo send this newsletter, integrate with an email service like:');
    console.log('- Nodemailer (Gmail)');
    console.log('- SendGrid');
    console.log('- AWS SES');
    console.log('- Mailchimp');
    
    // Show stats
    const stats = manager.getStats();
    console.log('\n📊 Subscriber Stats:');
    console.log(`Total Subscribers: ${stats.totalSubscribers}`);
    console.log(`Active Subscribers: ${stats.activeSubscribers}`);
    console.log(`New This Month: ${stats.thisMonth}`);
}
