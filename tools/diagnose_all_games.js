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
    try { logs.push({ type: msg.type(), text: msg.text() }); } catch(e) { logs.push({ type: 'console', text: String(msg) }); }
  });
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: String(err) }));

  await page.goto(url, { waitUntil: 'networkidle2' });

  const games = [
    { key: 'debug-detective', selector: '[data-action="startGame"][data-arg="debug-detective"], [data-arg="debug-detective"]', check: () => ({ id: 'bugResult' }) },
    { key: 'syntax-speed', selector: '[data-action="startGame"][data-arg="syntax-speed"], [data-arg="syntax-speed"]', check: () => ({ id: 'syntaxResult' , input: 'syntaxInput' }) },
    { key: 'algorithm-puzzle', selector: '[data-action="startGame"][data-arg="algorithm-puzzle"], [data-arg="algorithm-puzzle"]', check: () => ({ id: 'puzzleResult' }) }
  ];

  const results = [];
  for (const g of games) {
    console.log('\nTesting', g.key);
    const btn = await page.$(g.selector);
    if (!btn) {
      console.log('Launcher not found for', g.key);
      results.push({ game: g.key, launched: false, reason: 'launcher-not-found' });
      continue;
    }
  // Use in-page click to avoid Puppeteer 'not clickable' errors
  await page.evaluate(el => el.click(), btn);
  // Wait for UI to render
  await page.evaluate(() => new Promise(r => setTimeout(r, 900)));

    let checkObj = g.check();
    let found = {};
    try {
      if (checkObj.id) {
        const el = await page.$('#' + checkObj.id);
        found.id = !!el;
      }
      if (checkObj.input) {
        const el = await page.$('#' + checkObj.input);
        found.input = !!el;
      }
      // Also check modal presence
      const modal = await page.$('#gameModal');
      found.modal = !!modal;
    } catch (e) {
      found.error = String(e);
    }

    results.push({ game: g.key, launched: true, found });

    // Close any modal or game UI so next test runs cleanly
    try {
      await page.evaluate(() => {
        if (window.tutorialManager && typeof window.tutorialManager.closeModal === 'function') {
          window.tutorialManager.closeModal();
        }
        const gm = document.getElementById('gameModal'); if (gm) gm.remove();
        const visibleGameBoards = document.querySelectorAll('.game-board, .mini-game, #question-container, #game-start');
        visibleGameBoards.forEach(el => { try { el.style.display = 'none'; } catch(e) {} });
      });
      await page.evaluate(() => new Promise(r => setTimeout(r, 200)));
    } catch (e) {}
  }

  console.log('\n--- All game test results ---');
  console.log(JSON.stringify(results, null, 2));
  console.log('\n--- Console logs captured ---');
  logs.forEach(l => console.log(l.type, l.text));

  await browser.close();
  process.exit(0);
})();
