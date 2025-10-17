# Google Business Review Setup Guide

## 🎯 Quick Setup

### Step 1: Get Your Google Business Review URL

1. Go to your Google Business Profile: https://business.google.com/
2. Find your business listing
3. Look for the "Get more reviews" option
4. Copy your review URL (it should look like one of these):
   - `https://g.page/r/YOUR_PLACE_ID/review`
   - `https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`

### Step 2: Update the Server Configuration

Open `server.js` and find this line (around line 2935):

```javascript
const googleReviewUrl = 'https://g.page/r/YOUR_GOOGLE_PLACE_ID/review';
```

Replace `YOUR_GOOGLE_PLACE_ID` with your actual Google Place ID.

### Step 3: Test the Integration

1. Visit your website
2. Click "Write a Review"
3. Fill out the review form
4. Submit the review
5. You should be prompted to also review on Google
6. Click "OK" and you'll be taken to your Google Business review page

## 📧 Email Notifications

Currently, all subscriptions and reviews are logged to the console. You'll see:

### Newsletter Subscriptions:
```
📧 NEW NEWSLETTER SUBSCRIPTION: { email, name, subscribedAt, source }
📧 EMAIL NOTIFICATION TO barodatek.services@gmail.com
```

### Reviews:
```
⭐ NEW REVIEW RECEIVED: { name, rating, comment, ... }
📧 EMAIL NOTIFICATION TO barodatek.services@gmail.com
```

## 🚀 Enable Actual Email Sending (Optional)

To receive actual emails, you'll need to integrate a mail service. Here are options:

### Option 1: Nodemailer with Gmail (Recommended)

1. Install nodemailer:
```bash
npm install nodemailer
```

2. Add to server.js:
```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'barodatek.services@gmail.com',
        pass: 'YOUR_APP_PASSWORD' // Use Gmail App Password, not regular password
    }
});

// Then in your endpoints, replace console.log with:
await transporter.sendMail({
    from: 'barodatek.services@gmail.com',
    to: 'barodatek.services@gmail.com',
    subject: notificationSubject,
    text: notificationBody
});
```

### Option 2: SendGrid (Free tier available)

1. Sign up at https://sendgrid.com/
2. Install: `npm install @sendgrid/mail`
3. Use SendGrid API to send emails

### Option 3: AWS SES (Amazon Simple Email Service)

1. Set up AWS SES
2. Install AWS SDK
3. Send emails through AWS

## 📊 View Subscriptions and Reviews

### In Server Logs:
All submissions are logged to the console when the server is running.

### In Database:
Reviews are stored in your database and can be retrieved via:
```
GET /api/reviews
```

### Build an Admin Panel:
Create a simple admin page at `/admin.html` to:
- View all newsletter subscriptions
- Approve/reject reviews
- Export subscriber list

## 🔍 Find Your Google Place ID

If you don't have your Google Place ID:

1. Go to https://developers.google.com/maps/documentation/places/web-service/place-id
2. Use the Place ID Finder tool
3. Search for your business
4. Copy your Place ID

Alternatively:
1. Search your business on Google Maps
2. Look at the URL, it contains your Place ID
3. URL format: `https://www.google.com/maps/place/.../@lat,lng,zoom/data=!4m5!3m4!1s0x...PLACE_ID`

## 📝 Next Steps

1. ✅ Update Google Business URL in server.js
2. ✅ Test review submission flow
3. ✅ (Optional) Set up email sending with Nodemailer
4. ✅ Check server logs for new subscriptions and reviews
5. ✅ Build admin panel to manage subscriptions

## 💡 Tips

- Always test locally first before deploying
- Keep your app passwords secure (use environment variables)
- Set up email notifications gradually
- Monitor your server logs regularly

## 🆘 Need Help?

Contact: barodatek.services@gmail.com
