const puppeteer = require('puppeteer');
(async ()=>{
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const proto = Object.getPrototypeOf(page);
  console.log('page methods:', Object.getOwnPropertyNames(proto));
  console.log('typeof page.evaluate:', typeof page.evaluate);
  const mf = page.mainFrame();
  console.log('mainFrame present:', !!mf);
  if (mf) console.log('typeof mainFrame.evaluate:', typeof mf.evaluate);
  await browser.close();
})();