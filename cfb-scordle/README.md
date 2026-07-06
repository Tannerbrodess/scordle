# CFB Scordle

A daily college-football score-guessing game. Pick a team, see the opponent's
score, and guess what your team scored in 5 tries with higher/lower feedback.
Real historical scores (2000–2025) for 247 FBS/D-I teams are embedded in
`index.html`. A shared leaderboard runs on a Netlify Function + Netlify Blobs.

## Files
- `index.html` — the whole game, with the game data baked in.
- `netlify/functions/leaderboard.mjs` — GET returns all scores, POST adds one.
- `package.json` — declares the `@netlify/blobs` dependency.
- `netlify.toml` — publish dir (`.`) + functions dir.

## Deploy (leaderboard needs a build step, so use Git or the CLI)

Drag-and-drop won't install the function's dependency, so pick one of these.

### Option A — Connect a Git repo (recommended)
1. Put this folder in a GitHub repo and push it.
2. In Netlify: **Add new site → Import an existing project → GitHub**, pick the repo.
3. Leave build command blank; publish directory `.`. Deploy.
   Netlify runs `npm install` and bundles the function automatically.
4. Every push auto-deploys. Blobs storage is enabled automatically — no keys.

### Option B — Netlify CLI
```bash
npm install
npm i -g netlify-cli
netlify deploy --prod
```

## After it's live
1. Rename the site subdomain in **Site settings** (e.g. `cfb-scordle`).
2. In `index.html`, set `SHARE_URL` (near the top of the <script>) to your real
   URL so shared results link back to the game. Re-deploy.

## Test locally with the backend
```bash
npm install
npm i -g netlify-cli
netlify dev
```
`netlify dev` serves the site AND the function so the leaderboard works locally.
(Opening `index.html` directly as a file leaves the leaderboard empty — the
function only exists under Netlify.)

## Notes
- The "one game a day" lock is per-browser (localStorage). It's the standard
  approach for daily games; truly airtight per-person limits would need accounts.
- The daily game is picked by date, so every visitor gets the same game each day.
- To refresh/expand the data later, regenerate the embedded object from your CSV
  and re-inject it in place of the `const DATA = {...}` line.
