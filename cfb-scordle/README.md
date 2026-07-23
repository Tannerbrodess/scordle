# CFB Scordle (unlimited streak edition)

Guess your team's score in a random game (5 tries, higher/lower). Nail the exact
score and your streak grows; a miss resets it. Unlimited plays. Streaks earn
College-Football-Playoff trophies at 1 / 3 / 5 / 7 / 10, with 10+ being a
National Championship. One shared leaderboard ranks the longest streaks.

## Files
- index.html — the whole game, data (2000–2025, 247 teams) embedded.
- netlify/functions/leaderboard.mjs — GET returns the streak board, POST records a personal best (Netlify Blobs).
- package.json, netlify.toml.

## Deploy (Git or CLI — the function needs a build step)
Push this folder to a repo, then in Netlify: Add new site -> Import an existing
project -> pick it -> blank build command, publish dir `.`. Or `npm install`
then `npm i -g netlify-cli` then `netlify deploy --prod`.

After live: set SHARE_URL in index.html to your URL and redeploy. Test the
backend locally with `netlify dev`.

## Notes
- Streaks are tracked in the browser and posted as a personal best; there are no
  accounts, so a determined user could inflate a streak. Fine for a casual game.
- To make wins easier/harder, the game requires an exact score; loosening that
  would live in endGame() (treat "within N" as a success).
