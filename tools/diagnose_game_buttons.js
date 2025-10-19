const puppeteer = require('puppeteer');
const http = require('http');

async function waitForUrl(url, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((res, rej) => {
        const req = http.request(url, { method: 'HEAD', timeout: 2000 }, (r) => { res(); });
        req.on('error', () => rej());
        req.on('timeout', () => { req.destroy(); rej(); });
        req.end();
      });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, 300));
    }
  }
  return false;
}

(async () => {
  const url = process.env.TEST_URL || 'http://localhost:9000';
  console.log('Waiting for server at', url);
  if (!await waitForUrl(url)) {
    console.error('Server not ready');
    process.exit(2);
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const logs = [];
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', err => {
    logs.push({ type: 'pageerror', text: String(err) });
  });

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Start API quiz via any available launcher
  const sel = '[data-action="startGameSafe"][data-arg="api-quiz"], [data-action="startGame"][data-arg="api-quiz"], [data-arg="api-quiz"]';
  const btn = await page.$(sel);
  if (!btn) {
    console.error('Could not find API quiz launcher');
    console.log('Console logs:', logs);
    await browser.close();
    process.exit(2);
  }
  await btn.click();
  await new Promise(r => setTimeout(r, 800));

  // Inspect buttons
  const info = await page.evaluate(() => {
    function infoFor(idOrSel) {
      const el = document.querySelector(idOrSel);
      if (!el) return { found: false };
      const style = window.getComputedStyle(el);
      return {
        found: true,
        outerHTML: el.outerHTML.slice(0, 500),
        disabled: el.disabled === true,
        display: style.display,
        visibility: style.visibility,
        onclickType: typeof el.onclick
      };
    }
    return {
      hint: infoFor('#api-quiz-hint-btn'),
      reveal: infoFor('#api-quiz-reveal-btn'),
      skip: infoFor('#api-quiz-skip-btn'),
      refresh: infoFor('#api-quiz-refresh-btn'),
      home: infoFor('#api-quiz-home-btn'),
      questionContainer: infoFor('#question-container')
    };
  });

  console.log('Button inspection result:\n', JSON.stringify(info, null, 2));
  console.log('Collected console logs:');
  logs.forEach(l => console.log(l.type, l.text));

  await browser.close();
  process.exit(0);
})();
