# 📧 Monthly Newsletter Guide for BarodaTek

## Quick Start - How to Send Monthly Newsletters

### Option 1: View Subscribers & Template (Easiest)

1. **View All Subscribers:**
   ```
   GET http://localhost:3000/api/newsletter/subscribers
   ```
   Or visit: https://barodatek.com/api/newsletter/subscribers

2. **Export Subscribers as CSV:**
   ```
   GET http://localhost:3000/api/newsletter/export-csv
   ```
   This downloads a CSV file with all subscriber emails

3. **Get Newsletter Template:**
   ```
   GET http://localhost:3000/api/newsletter/template
   ```
   This generates the monthly newsletter HTML

### Option 2: Manual Monthly Process

#### Every Month (Around the 1st):

1. **Get Subscriber List:**
   - Visit: https://barodatek.com/api/newsletter/export-csv
   - Download the CSV file

2. **Get Newsletter Template:**
   - Visit: https://barodatek.com/api/newsletter/template
   - Copy the HTML content

3. **Customize the Newsletter:**
   - Open `newsletter-manager.js`
   - Update these sections:
     * "What's New This Month" - Add your new features
     * "Developer Tips" - Add a coding tip
     * "Services Highlight" - Update any service info

4. **Send via Email Service:**

#### Using Gmail (Manual):
1. Open Gmail
2. Compose new email
3. Paste the newsletter HTML
4. BCC all subscribers from your CSV
5. Subject: "🚀 BarodaTek Monthly Update - [Month] [Year]"
6. Send!

#### Using Mailchimp (Recommended for scale):
1. Sign up at https://mailchimp.com (free up to 500 subscribers)
2. Import your CSV subscriber list
3. Create a new campaign
4. Paste your newsletter HTML
5. Schedule monthly sends
6. Track open rates and clicks!

#### Using SendGrid (Developer-friendly):
1. Sign up at https://sendgrid.com
2. Get API key
3. Use the SendGrid API to send bulk emails
4. Track analytics

### Option 3: Automated Monthly Newsletters (Advanced)

Install nodemailer and set up automation:

```bash
npm install nodemailer node-cron
```

Create `send-newsletter.js`:

```javascript
const NewsletterManager = require('./newsletter-manager');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const manager = new NewsletterManager();

// Create email transporter
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'barodatek.services@gmail.com',
        pass: 'YOUR_APP_PASSWORD' // Use Gmail App Password
    }
});

// Function to send monthly newsletter
async function sendMonthlyNewsletter() {
    const subscribers = manager.getSubscribers();
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    
    const template = manager.generateNewsletterTemplate(
        months[now.getMonth()], 
        now.getFullYear()
    );

    console.log(`📧 Sending newsletter to ${subscribers.length} subscribers...`);

    for (const subscriber of subscribers) {
        if (subscriber.status === 'active') {
            try {
                await transporter.sendMail({
                    from: 'barodatek.services@gmail.com',
                    to: subscriber.email,
                    subject: template.subject,
                    html: template.htmlBody,
                    text: template.textBody
                });
                console.log(`✅ Sent to ${subscriber.email}`);
            } catch (error) {
                console.error(`❌ Failed to send to ${subscriber.email}:`, error);
            }
        }
    }

    console.log('📧 Monthly newsletter sent to all subscribers!');
}

// Schedule to run on the 1st of every month at 9 AM
cron.schedule('0 9 1 * *', () => {
    console.log('🗓️ Running monthly newsletter job...');
    sendMonthlyNewsletter();
});

console.log('✅ Newsletter scheduler started. Will send on 1st of each month at 9 AM');

// Run immediately for testing
// sendMonthlyNewsletter();
```

Run the scheduler:
```bash
node send-newsletter.js
```

## 📊 Viewing Subscriber Stats

Access these URLs:

- **All Subscribers:** `GET /api/newsletter/subscribers`
- **Export CSV:** `GET /api/newsletter/export-csv`
- **Newsletter Template:** `GET /api/newsletter/template`
- **Subscriber Stats:** Included in the subscribers response

## 📝 Newsletter Content Guidelines

### What to Include Each Month:

1. **Greeting** - Warm welcome message
2. **What's New** - New features, updates, bug fixes
3. **Developer Tip** - One actionable coding tip
4. **Service Highlight** - Remind them of your services
5. **Resources** - Links to docs, tutorials, community
6. **Call to Action** - Encourage them to try something
7. **Contact Info** - Make it easy to reach you

### Best Practices:

✅ **DO:**
- Send on the same day each month (consistency)
- Keep it under 500 words
- Use clear headings and bullet points
- Include at least one actionable tip
- Test on mobile before sending
- Include unsubscribe link
- Track open rates

❌ **DON'T:**
- Send more than once per month
- Use all caps or excessive emojis
- Spam promotional content
- Forget to proofread
- Send without testing

## 🎯 Monthly Checklist

- [ ] Week before: Draft newsletter content
- [ ] 3 days before: Finalize and test HTML
- [ ] 1 day before: Review subscriber list
- [ ] Send day: Send newsletter (1st of month)
- [ ] After sending: Check analytics
- [ ] Update template for next month

## 🔍 Track Your Success

Metrics to watch:
- **Open Rate** - How many people opened
- **Click Rate** - How many clicked links
- **Unsubscribe Rate** - Keep under 2%
- **New Subscribers** - Growth each month

## 🆘 Troubleshooting

**Problem:** Can't see subscribers
- **Solution:** Check `data/newsletter-subscribers.json` file

**Problem:** Email not sending
- **Solution:** Verify Gmail App Password is correct

**Problem:** Emails going to spam
- **Solution:** 
  - Use proper email authentication (SPF, DKIM)
  - Don't use spam trigger words
  - Keep email list clean
  - Use reputable email service

## 📧 Quick Commands

```bash
# View current subscribers
curl http://localhost:3000/api/newsletter/subscribers

# Export to CSV
curl http://localhost:3000/api/newsletter/export-csv > subscribers.csv

# Get current month template
curl http://localhost:3000/api/newsletter/template | jq .

# Run newsletter manager directly
node newsletter-manager.js
```

## 🚀 Ready to Send?

1. Visit: https://barodatek.com/api/newsletter/subscribers
2. Count your subscribers
3. Visit: https://barodatek.com/api/newsletter/template
4. Copy the HTML
5. Choose your sending method (Gmail, Mailchimp, SendGrid)
6. Customize the content
7. Send!

## 💡 Pro Tips

1. **Start Simple** - Use Gmail for first few months
2. **Grow Gradually** - Switch to Mailchimp when you hit 100+ subscribers
3. **Personalize** - Use subscriber names in greeting
4. **Mobile First** - Most people read on phones
5. **Consistent Schedule** - Same day every month builds trust
6. **Track Everything** - Use analytics to improve

---

Need help? Email: barodatek.services@gmail.com
