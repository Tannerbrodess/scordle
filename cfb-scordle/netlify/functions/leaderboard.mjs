import { getStore } from "@netlify/blobs";

const KEY = "entries";
const MAX = 5000;
const today = () => new Date().toISOString().slice(0, 10);

// A few starter rows so the board isn't empty on launch day.
function seed() {
  const t = today();
  const s = [
    ["BoomerB", "Oklahoma", 0, 2], ["RollTideRon", "Alabama", 2, 4],
    ["DawgPound", "Georgia", 0, 3], ["BuckeyeBri", "Ohio State", 3, 5],
    ["GeauxGreg", "LSU", 1, 3], ["HookEmH", "Texas", 5, 5],
    ["FightOnF", "USC", 2, 4], ["GoBlueGus", "Michigan", 4, 5],
  ];
  return s.map(x => ({ name: x[0], team: x[1], diff: x[2], turns: x[3], ts: t }));
}

export default async (req) => {
  const store = getStore("scordle-leaderboard");

  if (req.method === "GET") {
    let data = await store.get(KEY, { type: "json" });
    if (!Array.isArray(data)) { data = seed(); await store.setJSON(KEY, data); }
    return Response.json(data);
  }

  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
    const entry = {
      name: String(body.name ?? "Player").slice(0, 14) || "Player",
      team: String(body.team ?? "").slice(0, 40),
      diff: Math.max(0, Math.min(200, parseInt(body.diff, 10) || 0)),
      turns: Math.max(1, Math.min(10, parseInt(body.turns, 10) || 5)),
      ts: today(),
    };
    if (!entry.team) return new Response("missing team", { status: 400 });
    let data = await store.get(KEY, { type: "json" });
    if (!Array.isArray(data)) data = [];
    data.push(entry);
    if (data.length > MAX) data = data.slice(-MAX);
    await store.setJSON(KEY, data);
    return Response.json({ ok: true });
  }

  return new Response("method not allowed", { status: 405 });
};

export const config = { path: "/.netlify/functions/leaderboard" };
