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
      await new Promise(r => setTimeout(r, 400));
    }
  }
  return false;
}

(async () => {
  const url = process.env.TEST_URL || 'http://localhost:9000';

  console.log('Waiting for server to be ready at', url);
  const ready = await waitForUrl(url);
  if (!ready) {
    console.error('Server did not become ready in time:', url);
    process.exit(2);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  // Block analytics, fonts and large assets to speed up tests
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    const blocked = ['analytics', 'google-analytics', 'gtag', 'fonts.googleapis', '.woff', '.woff2', '.png', '.jpg', '.gif', 'doubleclick.net', 'hotjar'];
    if (blocked.some(b => url.includes(b))) return req.abort();
    req.continue();
  });

  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Helper: is element visible
  async function isVisible(selector) {
    const el = await page.$(selector);
    if (!el) return false;
    return await page.evaluate((e) => {
      if (!e) return false;
      const style = window.getComputedStyle(e);
      return style && style.display !== 'none' && style.visibility !== 'hidden' && e.offsetParent !== null;
    }, el);
  }

  // Collect game types robustly inside the page to avoid stale ElementHandles
  const pageGameList = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('[data-action="startGame"], [data-action="startGameSafe"]'))
      .map(el => ({ arg: el.getAttribute('data-arg'), action: el.getAttribute('data-action') }));
  });

  if (!pageGameList || pageGameList.length === 0) {
    console.error('No game buttons found on page.');
    await browser.close();
    process.exit(2);
  }

  const gameTypes = Array.from(new Set(pageGameList.map(g => g.arg || g.action).filter(Boolean)));
  console.log('Found game types:', gameTypes.join(', '));

  const results = [];

  // For each game type, click its button and check api-galaxy visibility
  for (const type of gameTypes) {
    console.log('\n--- Testing game:', type, '---');
  try {
      // click the button (find it each time to avoid stale element handles)
      const selectorCandidates = [
        `[data-action="startGame"][data-arg="${type}"]`,
        `[data-action="startGameSafe"][data-arg="${type}"]`,
        `[data-arg="${type}"]`
      ];
      let btn = null;
      for (const s of selectorCandidates) {
        btn = await page.$(s);
        if (btn) break;
      }
      if (!btn) {
        console.warn('Button for', type, 'not found at click time; skipping');
        results.push({ type, status: 'skipped', reason: 'not-found' });
        continue;
      }

      // Before click: check if api-galaxy visible
      const beforeVisible = await isVisible('#api-galaxy') || await isVisible('[data-game="api-galaxy"]');
      console.log('api-galaxy visible before click?', beforeVisible);

      await btn.evaluate(b => { b.scrollIntoView({behavior: 'auto', block: 'center'}); });
      await btn.click();

  // Wait a bit for UI to settle and modals to show/hide
  await new Promise(r => setTimeout(r, 1000));

    // Try to close any modal that might block subsequent clicks
    try {
      const closeBtn = await page.$('.modal .btn-close, .modal button[data-bs-dismiss], .modal button.btn-close');
      if (closeBtn) await closeBtn.click();
    } catch (e) {}

      // After click: check api-galaxy visibility
      const afterVisible = await isVisible('#api-galaxy') || await isVisible('[data-game="api-galaxy"]');
      console.log('api-galaxy visible after click?', afterVisible);

    // If clicked game is 'api-quiz' or 'api-galaxy' we expect api-galaxy to be visible; otherwise we expect it to be hidden
    const isGalaxy = ['api-quiz', 'api-galaxy', 'API Galaxy'].includes(type);
    const passed = isGalaxy ? afterVisible : !afterVisible;

      results.push({ type, passed, beforeVisible, afterVisible });

    } catch (err) {
      console.warn('Error testing', type, '-', String(err).slice(0,200));
      results.push({ type, status: 'error', error: String(err) });
      // attempt to continue to next game
    }

    // Attempt to close any remaining modal/backdrop so tests can continue
    await page.evaluate(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop, .game-overlay');
      backdrops.forEach(b => b.remove());
      const modal = document.getElementById('gameModal');
      if (modal) modal.remove();
    });

  await new Promise(r => setTimeout(r, 300));
  }

  console.log('\nTest results:');
  results.forEach(r => {
    if (r.status === 'skipped') console.log(`${r.type}: SKIPPED (${r.reason})`);
    else if (r.status === 'error') console.log(`${r.type}: ERROR (${r.error})`);
    else console.log(`${r.type}: ${r.passed ? 'PASS' : 'FAIL'} (before:${r.beforeVisible} after:${r.afterVisible})`);
  });

  const failed = results.filter(r => !r.passed && r.status !== 'skipped');
  await browser.close();
  if (failed.length > 0) {
    console.error('\nOne or more checks failed.');
    process.exit(3);
  }

  console.log('\nAll checks passed.');
  process.exit(0);
})();
