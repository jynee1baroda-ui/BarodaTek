const puppeteer = require('puppeteer');

(async () => {
  const url = process.env.TEST_URL || 'http://localhost:9000';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

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

  // Ensure game buttons are present
  const buttons = await page.$$('[data-action="startGame"], [data-action="startGameSafe"]');
  if (!buttons || buttons.length === 0) {
    console.error('No game buttons found on page.');
    await browser.close();
    process.exit(2);
  }

  // Collect unique game types
  const gameTypes = new Map();
  for (const b of buttons) {
    const arg = await (await b.getProperty('dataset')).jsonValue().then(ds => ds.arg).catch(() => null);
    const dataArg = await page.evaluate(el => el.getAttribute('data-arg'), b);
    const type = dataArg || arg || await page.evaluate(el => el.getAttribute('data-action'), b);
    if (type) gameTypes.set(type, b);
  }

  console.log('Found game types:', Array.from(gameTypes.keys()).join(', '));

  const results = [];

  // For each game type, click its button and check api-galaxy visibility
  for (const [type] of gameTypes) {
    console.log('\n--- Testing game:', type, '---');
    // click the button (find it again to avoid stale element handles)
    const btn = await page.$(`[data-arg="${type}"]`) || await page.$(`[data-action="startGame"][data-arg="${type}"]`) || await page.$(`[data-action="startGameSafe"][data-arg="${type}"]`);
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
    await page.waitForTimeout(1000);

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

    // Attempt to close any remaining modal/backdrop so tests can continue
    await page.evaluate(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop, .game-overlay');
      backdrops.forEach(b => b.remove());
      const modal = document.getElementById('gameModal');
      if (modal) modal.remove();
    });

    await page.waitForTimeout(300);
  }

  console.log('\nTest results:');
  results.forEach(r => {
    console.log(`${r.type}: ${r.passed ? 'PASS' : 'FAIL'} (before:${r.beforeVisible} after:${r.afterVisible})`);
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
