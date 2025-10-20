const puppeteer = require('puppeteer');
(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    console.log('typeof page:', typeof page);
    console.log('page instanceof Object?', page instanceof Object);
    console.log('page.$x type:', typeof page.$x);
    const proto = Object.getPrototypeOf(page);
    console.log('Prototype own property names:', Object.getOwnPropertyNames(proto));
    console.log('Prototype descriptors for $x:', Object.getOwnPropertyDescriptor(proto, '$x'));
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Puppeteer check failed:', err);
    process.exit(2);
  }
})();