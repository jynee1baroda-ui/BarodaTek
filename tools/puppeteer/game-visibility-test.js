const puppeteer = require('puppeteer');

async function run() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:9000';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  console.log('Visiting', baseUrl);
  await page.goto(baseUrl, { waitUntil: 'networkidle2' });

  // Helper to click a button by data-action and optional arg
  async function clickGame(action, arg) {
    const selector = `[data-action="${action}"]${arg ? `[data-arg="${arg}"]` : ''}`;
    const el = await page.$(selector);
    if (!el) {
      console.warn(`Selector not found: ${selector}`);
      return { found: false };
    }
    await el.click();
    // wait briefly for UI changes
    await page.waitForTimeout(800);
    return { found: true };
  }

  // list of games to test: [label, data-arg]
  const games = [
    ['API Galaxy', 'api-quiz'],
    ['Debug Detective', 'debug-detective'],
    ['Syntax Speed', 'syntax-speed'],
    ['Algorithm Puzzle', 'algorithm-puzzle']
  ];

  const results = [];

  for (const [label, arg] of games) {
    console.log('\n--- Testing', label, '---');
    // Try both startGameSafe and startGame buttons if present
    let clicked = false;
    const safeSel = `[data-action="startGameSafe"][data-arg="${arg}"]`;
    const normalSel = `[data-action="startGame"][data-arg="${arg}"]`;

    if (await page.$(safeSel)) {
      await page.click(safeSel);
      clicked = true;
    } else if (await page.$(normalSel)) {
      await page.click(normalSel);
      clicked = true;
    } else {
      // fallback: try any button or link that contains the label
      const btn = await page.$x(`//button[contains(., "${label}")]`);
      if (btn && btn.length) {
        await btn[0].click();
        clicked = true;
      }
    }

    if (!clicked) {
      console.warn('Could not find launcher for', label);
      results.push({ label, found: false, apiGalaxyVisible: null });
      continue;
    }

    // Wait for animations / modal open
    await page.waitForTimeout(1000);

    // Evaluate whether #api-galaxy exists and is visible
    const apiGalaxyVisible = await page.evaluate(() => {
      const el = document.getElementById('api-galaxy') || document.querySelector('[data-game="api-galaxy"]');
      if (!el) return false;
      const style = window.getComputedStyle(el);
      const visible = style && style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      return visible;
    });

    console.log('api-galaxy visible after launching', label, ':', apiGalaxyVisible);
    results.push({ label, found: true, apiGalaxyVisible });

    // Attempt to close active games (try clicking home / close button)
    // If a close button exists, click it; else reload to reset UI
    const closeBtn = await page.$('[data-action="reloadPage"], #api-quiz-home-btn, .btn-close, [data-bs-dismiss="modal"]');
    if (closeBtn) {
      try { await closeBtn.click(); } catch (e) {}
      await page.waitForTimeout(600);
    } else {
      await page.reload({ waitUntil: 'networkidle2' });
      await page.waitForTimeout(600);
    }
  }

  await browser.close();

  // Summarize
  console.log('\nTest summary:');
  results.forEach(r => {
    console.log(`- ${r.label}: launcherFound=${r.found}, api-galaxy-visible=${r.apiGalaxyVisible}`);
  });

  // Exit with code 0 if none of the non-galaxy games leave api-galaxy visible
  const fail = results.some(r => r.found && r.label !== 'API Galaxy' && r.apiGalaxyVisible === true);
  if (fail) {
    console.error('\nOne or more games left api-galaxy visible.');
    process.exit(2);
  }
  console.log('\nAll checks passed.');
  process.exit(0);
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(3);
});
