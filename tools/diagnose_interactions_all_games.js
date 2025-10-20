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

function textOf(el) {
  return el ? (el.textContent || '').trim() : null;
}

(async () => {
  const url = process.env.TEST_URL || 'http://localhost:9000';
  console.log('Waiting for server at', url);
  if (!await waitForUrl(url)) {
    console.error('Server not ready');
    process.exit(2);
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  const logs = [];
  page.on('console', msg => { try { logs.push({ type: msg.type(), text: msg.text() }); } catch(e) { logs.push({ type: 'console', text: String(msg) }); } });
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: String(err) }));

  await page.goto(url, { waitUntil: 'networkidle2' });

  const games = [
    { key: 'api-quiz', selector: '[data-action="startGameSafe"][data-arg="api-quiz"], [data-action="startGame"][data-arg="api-quiz"]', type: 'quiz' },
    { key: 'debug-detective', selector: '[data-action="startGame"][data-arg="debug-detective"], [data-arg="debug-detective"]', type: 'debug' },
    { key: 'syntax-speed', selector: '[data-action="startGame"][data-arg="syntax-speed"], [data-arg="syntax-speed"]', type: 'syntax' },
    { key: 'algorithm-puzzle', selector: '[data-action="startGame"][data-arg="algorithm-puzzle"], [data-arg="algorithm-puzzle"]', type: 'puzzle' }
  ];

  const results = [];

  for (const g of games) {
    console.log('\n--- Testing', g.key, '---');
    const btn = await page.$(g.selector);
    if (!btn) {
      console.log('Launcher not found for', g.key);
      results.push({ game: g.key, launched: false, reason: 'launcher-not-found' });
      continue;
    }
    await page.evaluate(el => el.click(), btn);
    await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

    // capture baseline
    const baseline = await page.evaluate(() => {
      const qt = document.getElementById('question-text');
      const bug = document.getElementById('bugResult');
      const syntax = document.getElementById('syntaxResult');
      const puzzle = document.getElementById('puzzleResult');
      const modal = document.getElementById('gameModal');
      return {
        questionText: qt ? qt.textContent.trim() : null,
        bugResultHTML: bug ? bug.innerHTML.slice(0,200) : null,
        syntaxResultHTML: syntax ? syntax.innerHTML.slice(0,200) : null,
        puzzleResultHTML: puzzle ? puzzle.innerHTML.slice(0,200) : null,
        modalExists: !!modal
      };
    });

    const interactions = [];

    // helper to click first button matching supplied selector/text within modal or document
    async function clickButtonByText(text, withinSelector = null) {
      const found = await page.evaluateHandle((txt, within) => {
        const root = within ? document.querySelector(within) : document;
        if (!root) return null;
        const btns = Array.from(root.querySelectorAll('button'));
        const el = btns.find(b => (b.textContent || '').toLowerCase().includes(txt.toLowerCase()));
        if (el) { el.click(); return true; }
        return false;
      }, text, withinSelector);
      const val = await found.jsonValue().catch(()=>null);
      return !!val;
    }

    if (g.type === 'quiz') {
      // Try hint, reveal, skip, pick an answer
      const beforeQ = baseline.questionText;
      const didHint = await clickButtonByText('hint', '#gameModal') || await clickButtonByText('hint');
      await page.evaluate(() => new Promise(r => setTimeout(r, 900)));
      const afterHint = await page.evaluate(() => (document.getElementById('question-text') || {}).textContent || null);

      const didReveal = await clickButtonByText('reveal', '#gameModal') || await clickButtonByText('reveal');
      await page.evaluate(() => new Promise(r => setTimeout(r, 900)));
      const afterReveal = await page.evaluate(() => (document.getElementById('question-text') || {}).textContent || null);

      const didSkip = await clickButtonByText('skip', '#gameModal') || await clickButtonByText('skip');
      await page.evaluate(() => new Promise(r => setTimeout(r, 900)));
      const afterSkip = await page.evaluate(() => (document.getElementById('question-text') || {}).textContent || null);

      // try clicking first answer button
      const clickedAnswer = await page.evaluate(() => {
        const btn = document.querySelector('#answers-container button[data-answer-index]');
        if (!btn) return false;
        btn.click();
        return true;
      });
      await page.evaluate(() => new Promise(r => setTimeout(r, 1200)));
      const afterAnswer = await page.evaluate(() => (document.getElementById('question-text') || {}).textContent || null);

      interactions.push({ action: 'hint', did: didHint, before: beforeQ, after: afterHint });
      interactions.push({ action: 'reveal', did: didReveal, after: afterReveal });
      interactions.push({ action: 'skip', did: didSkip, after: afterSkip });
      interactions.push({ action: 'answer', did: clickedAnswer, after: afterAnswer });

      results.push({ game: g.key, launched: true, baseline, interactions });
    } else if (g.type === 'debug') {
      // For Debug Detective: try hint, reveal, submit an answer text
      const didHint = await clickButtonByText('hint', '#gameModal') || await clickButtonByText('hint');
      await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
      const didReveal = await clickButtonByText('reveal', '#gameModal') || await clickButtonByText('reveal');
      await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

      // Type something into textarea (#bugAnswer) and submit
      const didType = await page.evaluate(() => {
        const ta = document.getElementById('bugAnswer');
        if (!ta) return false;
        ta.value = 'Missing semicolon';
        const btn = Array.from(document.querySelectorAll('#gameModal button')).find(b => (b.textContent||'').toLowerCase().includes('submit'));
        if (btn) { btn.click(); return true; }
        return false;
      });
      await page.evaluate(() => new Promise(r => setTimeout(r, 900)));
      const bugResultHTML = await page.evaluate(() => (document.getElementById('bugResult') || {}).innerHTML || null);

      results.push({ game: g.key, launched: true, baseline, interactions: [{ action: 'hint', did: !!didHint }, { action: 'reveal', did: !!didReveal }, { action: 'submit', did: !!didType, bugResultHTML }] });
    } else if (g.type === 'syntax') {
      // For Syntax Speed: try hint, reveal, submit input
      const didHint = await clickButtonByText('hint', '#gameModal') || await clickButtonByText('hint');
      await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
      const didReveal = await clickButtonByText('reveal', '#gameModal') || await clickButtonByText('reveal');
      await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

      const didType = await page.evaluate(() => {
        const input = document.getElementById('syntaxInput');
        if (!input) return false;
        input.value = 'function hello(){return"world"}';
        const submit = Array.from(document.querySelectorAll('#gameModal button')).find(b => (b.textContent||'').toLowerCase().includes('submit'));
        if (submit) { submit.click(); return true; }
        return false;
      });
      await page.evaluate(() => new Promise(r => setTimeout(r, 900)));
      const syntaxResultHTML = await page.evaluate(() => (document.getElementById('syntaxResult') || {}).innerHTML || null);

      results.push({ game: g.key, launched: true, baseline, interactions: [{ action: 'hint', did: !!didHint }, { action: 'reveal', did: !!didReveal }, { action: 'submit', did: !!didType, syntaxResultHTML }] });
    } else if (g.type === 'puzzle') {
      // Algorithm puzzle: try hint, reveal, pick an option
      const didHint = await clickButtonByText('hint', '#gameModal') || await clickButtonByText('hint');
      await page.evaluate(() => new Promise(r => setTimeout(r, 600)));
      const didReveal = await clickButtonByText('reveal', '#gameModal') || await clickButtonByText('reveal');
      await page.evaluate(() => new Promise(r => setTimeout(r, 600)));

      const clickedOption = await page.evaluate(() => {
        const btn = document.querySelector('#gameModal button.btn-outline-primary');
        if (!btn) return false;
        btn.click();
        return true;
      });
      await page.evaluate(() => new Promise(r => setTimeout(r, 900)));
      const puzzleResultHTML = await page.evaluate(() => (document.getElementById('puzzleResult') || {}).innerHTML || null);

      results.push({ game: g.key, launched: true, baseline, interactions: [{ action: 'hint', did: !!didHint }, { action: 'reveal', did: !!didReveal }, { action: 'choose', did: !!clickedOption, puzzleResultHTML }] });
    }

    // Close any open modal/game UI to reset state
    await page.evaluate(() => {
      if (window.tutorialManager && typeof window.tutorialManager.closeModal === 'function') window.tutorialManager.closeModal();
      const gm = document.getElementById('gameModal'); if (gm) gm.remove();
      const visibleGameBoards = document.querySelectorAll('.game-board, .mini-game, #question-container, #game-start');
      visibleGameBoards.forEach(el => { try { el.style.display = 'none'; } catch(e) {} });
    });
    await page.evaluate(() => new Promise(r => setTimeout(r, 300)));
  }

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(l => console.log(l.type, l.text));

  await browser.close();
  process.exit(0);
})();
