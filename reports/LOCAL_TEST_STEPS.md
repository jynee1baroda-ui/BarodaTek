# Local Test Steps (use a free port)

1. Install deps:

```powershell
npm install
```

2. Start server on a free port (example: 9100):

```powershell
$env:PORT=9100; npm run dev
```

3. Open tests or run diagnostics against http://localhost:9100

```powershell
node tools/diagnose_interactions_all_games.js --url=http://localhost:9100
```

4. Manual checks:
- Launch the site and verify Arena Games open and buttons (hint/reveal/skip/home/refresh) work.
- Open Dev Tools page and check generate/download buttons.
- Open API Playground and try Send Request / copy code.
- Monitor browser console for errors.

5. Rollback if errors found: revert commit and push, or use Vercel dashboard to rollback.

