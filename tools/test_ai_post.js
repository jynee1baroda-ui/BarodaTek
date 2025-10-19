// Retry-capable test POST with AbortController timeout to avoid undici headers timeout
(async () => {
  const payload = { messages: [{ role: 'user', content: 'Hello, who are you?' }] };
  const maxAttempts = 4;
  const timeoutMs = 20000; // 20s headers/body timeout

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);

      const resp = await fetch('http://localhost:9000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(id);

      const text = await resp.text();
      console.log('HTTP_STATUS=', resp.status);
      console.log('RESPONSE_BODY=');
      console.log(text);
      process.exit(0);
    } catch (e) {
      console.error(`Attempt ${attempt} failed:`, e && e.message ? e.message : e);
      if (attempt < maxAttempts) {
        console.log('Retrying in 2s...');
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      console.error('All attempts failed.');
      process.exit(1);
    }
  }
})();
