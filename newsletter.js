
const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const router = express.Router();
const { aggregateNews } = require('./newsAggregator');

const EMAIL_SECRET = process.env.EMAIL_SECRET || 'supersecretkey1234567890123456';
const NEWSLETTER_EMAIL = process.env.NEWSLETTER_EMAIL || 'barodatek.services@gmail.com';
const NEWSLETTER_PASS = process.env.NEWSLETTER_PASS || 'your-app-password';

// In-memory store for demo; replace with DB in production
const subscribers = [];

function encryptEmail(email) {
  const cipher = crypto.createCipheriv('aes-256-cbc', EMAIL_SECRET.slice(0,32), EMAIL_SECRET.slice(0,16));
  let encrypted = cipher.update(email, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

router.post('/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid email required.' });
  }
  // Encrypt and store
  const encryptedEmail = encryptEmail(email);
  subscribers.push({ encryptedEmail, date: new Date().toISOString(), email });

  // Notify admin
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: NEWSLETTER_EMAIL, pass: NEWSLETTER_PASS }
  });
  await transporter.sendMail({
    from: NEWSLETTER_EMAIL,
    to: NEWSLETTER_EMAIL,
    subject: 'New Newsletter Signup',
    text: `New subscriber: ${email}`
  });
  // Send confirmation to user
  await transporter.sendMail({
    from: NEWSLETTER_EMAIL,
    to: email,
    subject: 'Confirm your subscription to BarodaTek',
    text: 'Thank you for subscribing! You will receive our monthly newsletters.'
  });
  res.json({ message: 'Subscription successful. Please check your email to confirm.' });
});

// Monthly newsletter sending (call this from cron or schedule)
async function sendMonthlyNewsletter(siteUpdatesHtml = '') {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: NEWSLETTER_EMAIL, pass: NEWSLETTER_PASS }
  });
  // Fetch tech news summaries
  const news = await aggregateNews();
  let newsHtml = '<h2>Tech News Highlights</h2>';
  for (const item of news) {
    newsHtml += `<div style="margin-bottom:18px;">
      <strong>${item.headline}</strong><br>
      <span>${item.summary}</span><br>
      <small style="color:#888;">${item.source}${item.date ? ', ' + new Date(item.date).toLocaleDateString() : ''}</small>
    </div>`;
  }
  // Compose newsletter HTML
  const html = `
    <div style="font-family:sans-serif;">
      <h1>BarodaTek Monthly Newsletter</h1>
      ${siteUpdatesHtml}
      ${newsHtml}
      <hr>
      <small>You are receiving this email because you subscribed at BarodaTek.com. To unsubscribe, reply to this email.</small>
    </div>
  `;
  // Send to all subscribers
  for (const sub of subscribers) {
    if (!sub.email) continue;
    await transporter.sendMail({
      from: NEWSLETTER_EMAIL,
      to: sub.email,
      subject: 'BarodaTek Monthly Newsletter',
      html
    });
  }
}

module.exports = router;
module.exports.sendMonthlyNewsletter = sendMonthlyNewsletter;
