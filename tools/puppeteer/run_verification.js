const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const url = process.env.TEST_URL || process.env.BASE_URL || 'http://localhost:9000';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);

  const logs = [];
  page.on('console', msg => { try { logs.push({ type: msg.type(), text: msg.text() }); } catch(e) { logs.push({ type: 'console', text: String(msg) }); } });
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: String(err) }));

  console.log('Visiting', url);
  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
  } catch (e) {
    console.error('Failed to load URL:', e.message);
    await browser.close();
    process.exit(2);
  }

  // Utility to click by data-action and optional arg via evaluate
  // Utility to click by data-action and optional arg via evaluate.
  // Tries multiple candidate action names (e.g. hintDebug, hintSyntax) and modal-scoped fallbacks.
  async function clickByAction(action, arg) {
    const candidates = [action, `${action}Debug`, `${action}Syntax`, `${action}Algo`, `${action}Puzzle`, `${action}Game`];
    return await page.evaluate(async (cands, ar) => {
      const primary = (cands && cands[0]) ? String(cands[0]).toLowerCase() : '';
      function tryClick(selector) {
        const el = document.querySelector(selector);
        if (!el) return false;
        try { el.click(); return true; } catch (e) { try { el.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; } catch (ee) { return false; } }
      }

      for (const a of cands) {
        const selector = `[data-action="${a}"]${ar ? `[data-arg="${ar}"]` : ''}`;
        if (tryClick(selector)) return true;
      }

      // Try modal-scoped selectors (often buttons inside #gameModal)
      const modalButtons = Array.from(document.querySelectorAll('#gameModal button, #gameModal [data-action], .modal button'));
      for (const btn of modalButtons) {
        const txt = (btn.textContent || '').toLowerCase();
        if (txt.includes(primary) || (btn.getAttribute && btn.getAttribute('data-action') && btn.getAttribute('data-action').toLowerCase().includes(primary))) {
          try { btn.click(); return true; } catch (e) { try { btn.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; } catch(_) {} }
        }
      }

      // Last-resort: try any button or link whose text matches the action word
  const fallback = Array.from(document.querySelectorAll('button, a')).find(el => (el.textContent||'').toLowerCase().includes(primary));
      if (fallback) {
        try { fallback.click(); return true; } catch (e) { try { fallback.dispatchEvent(new MouseEvent('click', { bubbles: true })); return true; } catch(_) {} }
      }

      return false;
    }, candidates, arg);
  }

  // Wait for selector to have non-empty textContent (polling). Returns text or null on timeout.
  async function waitForSelectorText(selector, timeoutMs = 2000, pollInterval = 150) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const txt = await page.evaluate(sel => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const t = (el.innerText || el.textContent || '').trim();
        return t || null;
      }, selector);
      if (txt) return txt;
      await new Promise(r => setTimeout(r, pollInterval));
    }
    return null;
  }

  const results = [];

  const games = [
    { label: 'API Galaxy', arg: 'api-quiz', type: 'quiz' },
    { label: 'Debug Detective', arg: 'debug-detective', type: 'debug' },
    { label: 'Syntax Speed', arg: 'syntax-speed', type: 'syntax' },
    { label: 'Algorithm Puzzle', arg: 'algorithm-puzzle', type: 'puzzle' }
  ];

  for (const g of games) {
    console.log('\n--- Testing', g.label, '---');
    const launcherFound = await page.evaluate((a) => {
      const safe = document.querySelector(`[data-action="startGameSafe"][data-arg="${a}"]`);
      const normal = document.querySelector(`[data-action="startGame"][data-arg="${a}"]`);
      if (safe) { safe.click(); return 'startGameSafe'; }
      if (normal) { normal.click(); return 'startGame'; }
      const btn = Array.from(document.querySelectorAll('button, a')).find(el => (el.textContent||'').toLowerCase().includes(a.split('-')[0]));
      if (btn) { btn.click(); return 'fallback-text'; }
      return null;
    }, g.arg);

    if (!launcherFound) {
      console.warn('Launcher not found for', g.label);
      results.push({ game: g.label, launched: false });
      continue;
    }

  // small wait (use environment-safe sleep instead of page.waitForTimeout)
  await new Promise(r => setTimeout(r, 900));

    // check api-galaxy visibility
    const apiGalaxyVisible = await page.evaluate(() => {
      const el = document.getElementById('api-galaxy') || document.querySelector('[data-game="api-galaxy"]');
      if (!el) return false;
      const style = window.getComputedStyle(el);
      const visible = style && style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
      return visible;
    });

    const interactions = [];

    if (g.type === 'quiz') {
  const didHint = await clickByAction('hint');
  await new Promise(r => setTimeout(r, 800));
      const afterHint = await page.evaluate(() => (document.getElementById('question-text') || {}).textContent || null);

  const didReveal = await clickByAction('reveal');
  await new Promise(r => setTimeout(r, 800));
      const afterReveal = await page.evaluate(() => (document.getElementById('question-text') || {}).textContent || null);

  const didSkip = await clickByAction('skip');
  await new Promise(r => setTimeout(r, 800));
      const afterSkip = await page.evaluate(() => (document.getElementById('question-text') || {}).textContent || null);

      const clickedAnswer = await page.evaluate(() => {
        const btn = document.querySelector('#answers-container button[data-answer-index], #answers-container button');
        if (!btn) return false;
        btn.click();
        return true;
      });
  await new Promise(r => setTimeout(r, 1000));
      const afterAnswer = await page.evaluate(() => (document.getElementById('question-text') || {}).textContent || null);

      interactions.push({ action: 'hint', did: didHint, after: afterHint });
      interactions.push({ action: 'reveal', did: didReveal, after: afterReveal });
      interactions.push({ action: 'skip', did: didSkip, after: afterSkip });
      interactions.push({ action: 'answer', did: clickedAnswer, after: afterAnswer });

      results.push({ game: g.label, launched: true, apiGalaxyVisible, interactions });
    } else if (g.type === 'debug') {
  const didHint = await clickByAction('hint');
  await new Promise(r => setTimeout(r, 700));
  const didReveal = await clickByAction('reveal');
  await new Promise(r => setTimeout(r, 700));

      const didType = await page.evaluate(() => {
        const ta = document.getElementById('bugAnswer');
        if (!ta) return false;
        ta.value = 'Missing semicolon';
        const submit = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').toLowerCase().includes('submit'));
        if (!submit) return false;
        submit.click();
        return true;
      });
  await new Promise(r => setTimeout(r, 900));
  // Wait briefly for result text to appear in the UI
  const bugResult = await waitForSelectorText('#bugResult', 2000) || await page.evaluate(() => (document.getElementById('bugResult') || {}).innerText || null);
      results.push({ game: g.label, launched: true, apiGalaxyVisible, interactions: [{ action: 'hint', did: !!didHint }, { action: 'reveal', did: !!didReveal }, { action: 'submit', did: !!didType, bugResult }] });
    } else if (g.type === 'syntax') {
  const didHint = await clickByAction('hint');
  await new Promise(r => setTimeout(r, 700));
  const didReveal = await clickByAction('reveal');
  await new Promise(r => setTimeout(r, 700));

      const didType = await page.evaluate(() => {
        const input = document.getElementById('syntaxInput');
        if (!input) return false;
        input.value = 'function hello(){return"world"}';
        const submit = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').toLowerCase().includes('submit'));
        if (!submit) return false;
        submit.click();
        return true;
      });
  await new Promise(r => setTimeout(r, 900));
  const syntaxResult = await waitForSelectorText('#syntaxResult', 2000) || await page.evaluate(() => (document.getElementById('syntaxResult') || {}).innerText || null);
      results.push({ game: g.label, launched: true, apiGalaxyVisible, interactions: [{ action: 'hint', did: !!didHint }, { action: 'reveal', did: !!didReveal }, { action: 'submit', did: !!didType, syntaxResult }] });
    } else if (g.type === 'puzzle') {
  const didHint = await clickByAction('hint');
  await new Promise(r => setTimeout(r, 700));
  const didReveal = await clickByAction('reveal');
  await new Promise(r => setTimeout(r, 700));

      const clickedOption = await page.evaluate(() => {
        const btn = document.querySelector('#gameModal button.btn-outline-primary, #gameModal button');
        if (!btn) return false;
        btn.click();
        return true;
      });
  await new Promise(r => setTimeout(r, 900));
  const puzzleResult = await waitForSelectorText('#puzzleResult', 2000) || await page.evaluate(() => (document.getElementById('puzzleResult') || {}).innerText || null);
      results.push({ game: g.label, launched: true, apiGalaxyVisible, interactions: [{ action: 'hint', did: !!didHint }, { action: 'reveal', did: !!didReveal }, { action: 'choose', did: !!clickedOption, puzzleResult }] });
    }

    // Close modal / reset
    await page.evaluate(() => {
      const close = document.querySelector('#api-quiz-home-btn, .btn-close, [data-action="reloadPage"]');
      if (close) try { close.click(); } catch(e) {}
      const modal = document.getElementById('gameModal'); if (modal) modal.remove();
      const boards = document.querySelectorAll('.game-board, .mini-game, #question-container, #game-start'); boards.forEach(b => { try { b.style.display='none'; } catch(e) {} });
    });
  await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(l => console.log(l.type, l.text));

  // write report file
  const report = fs.readFileSync('reports/PUPPETEER_VERIFICATION_TEMPLATE.md', 'utf8')
    .replace('{{URL}}', url)
    .replace('{{DATE}}', new Date().toISOString())
    .replace('{{RAW_RESULTS}}', JSON.stringify(results, null, 2))
    .replace('{{CONSOLE_LOGS}}', logs.map(l => `${l.type}: ${l.text}`).join('\n'));
  fs.writeFileSync('reports/PUPPETEER_VERIFICATION_RESULT.md', report);

  await browser.close();
  const failed = results.some(r => r.launched === true && r.apiGalaxyVisible === true && r.label !== 'API Galaxy');
  if (failed) process.exit(2);
  process.exit(0);
}

run().catch(err => { console.error('Run failed:', err); process.exit(3); });
