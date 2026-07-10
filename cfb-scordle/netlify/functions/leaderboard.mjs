import { getStore } from "@netlify/blobs";

const STORE = "scordle-leaderboard-v2"; // bumped namespace -> starts clean, no seeded/fake rows
const MAX = 5000, MAX_PLAYERS = 3000;
const WIN_MAX_OFF = 0; // exact score only counts as a success

const ymd = (d) => d.toISOString().slice(0, 10);

export default async (req) => {
  const store = getStore(STORE);

  if (req.method === "GET") {
    let entries = await store.get("entries", { type: "json" });
    if (!Array.isArray(entries)) entries = [];               // no seed data
    let playersObj = await store.get("players", { type: "json" });
    if (!playersObj || typeof playersObj !== "object") playersObj = {};
    const players = Object.values(playersObj)
      .map(p => ({
        name: p.name, team: p.team, streak: p.streak || 0, best: p.best || 0,
        avg: (p.streak > 0 && p.turnsSum) ? +(p.turnsSum / p.streak).toFixed(2) : 0,
      }))
      .sort((a, b) => b.streak - a.streak || a.avg - b.avg || b.best - a.best)
      .slice(0, 500);
    return Response.json({ entries, players });
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
    const entry = {
      name: String(body.name ?? "Player").slice(0, 14) || "Player",
      team: String(body.team ?? "").slice(0, 40),
      diff: Math.max(0, Math.min(200, parseInt(body.diff, 10) || 0)),
      turns: Math.max(1, Math.min(10, parseInt(body.turns, 10) || 5)),
      ts: ymd(new Date()),
    };
    if (!entry.team) return new Response("missing team", { status: 400 });

    // per-play entries (power Today + By fanbase)
    let entries = await store.get("entries", { type: "json" });
    if (!Array.isArray(entries)) entries = [];
    entries.push(entry);
    if (entries.length > MAX) entries = entries.slice(-MAX);
    await store.setJSON("entries", entries);

    // streak per anonymous browser id — exact score AND same team on consecutive days
    let streak = 0, best = 0, avg = 0;
    const uid = String(body.uid ?? "").slice(0, 40);
    if (uid) {
      let players = await store.get("players", { type: "json" });
      if (!players || typeof players !== "object") players = {};
      const today = ymd(new Date());
      const yest = ymd(new Date(Date.now() - 86400000));
      const p = players[uid] || { streak: 0, best: 0, last: null, team: null, turnsSum: 0 };
      const prevTeam = p.team;
      if (p.last !== today) {
        const win = entry.diff <= WIN_MAX_OFF;         // exact score
        const sameTeam = prevTeam === entry.team;      // must stick with the same team
        if (win) {
          if (p.last === yest && sameTeam) { p.streak = (p.streak || 0) + 1; p.turnsSum = (p.turnsSum || 0) + entry.turns; }
          else { p.streak = 1; p.turnsSum = entry.turns; }   // first day, a gap, or a team switch -> fresh
        } else { p.streak = 0; p.turnsSum = 0; }
        p.best = Math.max(p.best || 0, p.streak);
        p.last = today;
      }
      p.name = entry.name; p.team = entry.team;
      players[uid] = p;
      streak = p.streak; best = p.best;
      avg = (p.streak > 0 && p.turnsSum) ? +(p.turnsSum / p.streak).toFixed(2) : 0;

      const keys = Object.keys(players);
      if (keys.length > MAX_PLAYERS) {
        const trimmed = {};
        keys.map(k => [k, players[k]]).sort((a, b) => (b[1].best || 0) - (a[1].best || 0)).slice(0, MAX_PLAYERS).forEach(([k, v]) => trimmed[k] = v);
        players = trimmed;
      }
      await store.setJSON("players", players);
    }

    return Response.json({ ok: true, streak, best, avg });
  }

  return new Response("method not allowed", { status: 405 });
};

export const config = { path: "/.netlify/functions/leaderboard" };
