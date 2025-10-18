// Scheduled job to send BarodaTek monthly newsletter
require('dotenv').config();
const { sendMonthlyNewsletter } = require('./newsletter');

// Example: Add site updates here
const siteUpdatesHtml = `
  <h2>Site Updates</h2>
  <ul>
    <li>New API features released</li>
    <li>Mini-game improvements</li>
    <li>Security enhancements</li>
    <li>Latest blog posts and tutorials</li>
  </ul>
`;

(async () => {
  try {
    await sendMonthlyNewsletter(siteUpdatesHtml);
    console.log('Monthly newsletter sent to all subscribers.');
  } catch (err) {
    console.error('Error sending newsletter:', err);
  }
})();
