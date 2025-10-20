const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    console.log('Has page.$x:', typeof page.$x === 'function');
    console.log('Page methods snapshot:', Object.keys(Object.getPrototypeOf(page)).slice(0,40));
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Puppeteer check failed:', err);
    process.exit(2);
  }
})();