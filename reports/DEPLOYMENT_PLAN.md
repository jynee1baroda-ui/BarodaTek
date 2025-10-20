# DEPLOYMENT PLAN (for Vercel)

Preconditions:
- Ensure repository main branch is up-to-date and the commit containing the safe patches is on `main`.
- Have Vercel access/use a personal access token if automating.
- Have a maintenance page ready (e.g., `maintenance.html`) or server-side flag that the site can read (recommended).

Steps:
1. Enable maintenance mode
   - Option A: Push a small change that enables `MAINTENANCE` environment variable in production (preferred for programmatic flows).
   - Option B: Update the live site to show `maintenance.html` via Vercel dashboard temporarily.

2. Deploy the patched commit to Vercel
   - Ensure `vercel` CLI logged in or push branch and open PR to main and merge (then Vercel will deploy automatically).

3. Post-deploy checks (run immediately):
   - Visit https://barodatek.com and verify the UI loads.
   - Run automated diagnostics locally (tools/diagnose_interactions_all_games.js) pointed at the live URL (or use Puppeteer script against live site).
   - Confirm no console errors (esp. no CSP inline handler refusal messages) and that Arena Games launch and controls work.
   - Confirm downloads (ZIPs, Postman) still initiate.
   - Verify analytics/WebSocket connect.

4. Disable maintenance mode
   - Roll back `MAINTENANCE` toggle or remove maintenance overlay.

5. Fill `/reports/PATCH_DEPLOYMENT_CONFIRMATION.md` with results and any follow-ups.

Quick rollback:
- If critical issues are found, revert the commit on `main` and re-deploy or use Vercel rollback to previous deployment.

