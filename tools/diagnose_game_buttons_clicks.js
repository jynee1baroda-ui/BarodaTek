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
  await page.evaluate(() => new Promise(r => setTimeout(r, 800)));

  const qSel = '#question-text';
  const getQ = async () => {
    const el = await page.$(qSel);
    if (!el) return null;
    return (await page.evaluate(e => e.textContent, el)).trim();
  };

  const before = await getQ();
  console.log('Question before:', before);

  async function clickAndReport(selector, name, waitMs = 1800) {
    const el = await page.$(selector);
    if (!el) {
      console.log(`${name} missing`);
      return { name, found: false };
    }
  await el.click();
  await page.evaluate(ms => new Promise(r => setTimeout(r, ms)), waitMs);
      // Try to capture internal diagnostic state exposed on window
      let state = null;
      try {
        // Prefer diagnostic API if available
        state = await page.evaluate(() => {
          try {
            if (window.__barodatek_quiz && typeof window.__barodatek_quiz.getState === 'function') {
              return { from: 'api', data: window.__barodatek_quiz.getState() };
            }
          } catch (e) {}
          return {
            from: 'dom',
            currentQuestionIndex: typeof currentQuestionIndex !== 'undefined' ? currentQuestionIndex : null,
            answered: typeof answered !== 'undefined' ? answered : null,
            usedHint: typeof usedHint !== 'undefined' ? usedHint : null,
            questionText: (document.getElementById('question-text') || {}).textContent || null
          };
        });
      } catch (e) {
        // Likely navigation; record it and continue
        state = { navigation: true, error: String(e) };
      }
      console.log(`${name} clicked -> state:`, state);
      return { name, found: true, before, state };
  }

  const results = [];
  results.push(await clickAndReport('#api-quiz-hint-btn', 'hint'));
  results.push(await clickAndReport('#api-quiz-reveal-btn', 'reveal'));
  results.push(await clickAndReport('#api-quiz-skip-btn', 'skip'));
  // Refresh triggers a navigation; click it but don't attempt to read DOM after navigation
  const refreshEl = await page.$('#api-quiz-refresh-btn');
  if (refreshEl) {
    await refreshEl.click();
    // give a moment for navigation to start
    await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
    results.push({ name: 'refresh', found: true, note: 'navigation triggered' });
  } else {
    results.push({ name: 'refresh', found: false });
  }
  // Home triggers navigation away as well; handle similarly
  const homeEl = await page.$('#api-quiz-home-btn');
  if (homeEl) {
    await homeEl.click();
    await page.evaluate(() => new Promise(r => setTimeout(r, 400)));
    results.push({ name: 'home', found: true, note: 'navigation triggered' });
  } else {
    results.push({ name: 'home', found: false });
  }

  console.log('\n--- Interaction results ---');
  console.log(JSON.stringify(results, null, 2));

  console.log('\n--- Console logs captured ---');
  logs.forEach(l => console.log(l.type, l.text));

  await browser.close();
  process.exit(0);
})();
