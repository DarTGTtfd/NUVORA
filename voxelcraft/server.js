const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const SEED = 1337;
const SAVE = path.join(__dirname, 'world.json');
const CSAVE = path.join(__dirname, 'chests.json');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.get('/api/info', (_, res) => res.json({ seed: SEED, players: players.size }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let edits = {};
try { edits = JSON.parse(fs.readFileSync(SAVE, 'utf8')); } catch {}
let dirty = false;
let chests = {}, cdirty = false;
try { chests = JSON.parse(fs.readFileSync(CSAVE, 'utf8')); } catch {}
setInterval(() => {
  if (dirty) { fs.writeFile(SAVE, JSON.stringify(edits), () => {}); dirty = false; }
  if (cdirty) { fs.writeFile(CSAVE, JSON.stringify(chests), () => {}); cdirty = false; }
}, 5000);
const isCh = b => b === 17 || (b >= 70 && b <= 72);
const cleanSlots = s => Array.isArray(s) && s.length === 27 && s.every(v => v === null || (v && Number.isInteger(v.id) && v.id > 0 && v.id < 100 && Number.isInteger(v.n) && v.n > 0 && v.n <= 64 && (v.d === undefined || Number.isInteger(v.d))))
  ? s.map(v => v && (v.d === undefined ? { id: v.id, n: v.n } : { id: v.id, n: v.n, d: v.d })) : null;

const players = new Map();
let nextId = 1;
const send = (ws, m) => ws.readyState === 1 && ws.send(JSON.stringify(m));
const broadcast = (m, except) => wss.clients.forEach(c => c !== except && send(c, m));

wss.on('connection', ws => {
  const id = nextId++;
  const p = { id, name: 'Player' + id, x: 0, y: 80, z: 0, ry: 0 };
  players.set(id, p);
  send(ws, { t: 'init', id, seed: SEED, edits, chests, players: [...players.values()].filter(q => q.id !== id) });
  broadcast({ t: 'join', p }, ws);

  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.t === 'move') {
      for (const k of ['x', 'y', 'z', 'ry']) if (Number.isFinite(m[k])) p[k] = m[k];
      broadcast({ t: 'move', id, x: p.x, y: p.y, z: p.z, ry: p.ry }, ws);
    } else if (m.t === 'block') {
      const { x, y, z, b } = m;
      if (![x, y, z, b].every(Number.isInteger) || y < 1 || y > 63 || b < 0 || (b > 17 && !isCh(b))) return;
      const key = `${x},${y},${z}`; edits[key] = b; dirty = true;
      if (!isCh(b) && chests[key]) { delete chests[key]; cdirty = true; }
      broadcast({ t: 'block', x, y, z, b }, ws);
    } else if (m.t === 'chest') {
      const { x, y, z } = m, key = `${x},${y},${z}`, s = cleanSlots(m.s);
      if (![x, y, z].every(Number.isInteger) || !isCh(edits[key]) || !s) return;
      if (s.every(v => v === null)) delete chests[key]; else chests[key] = s;
      cdirty = true; broadcast({ t: 'chest', x, y, z, s: chests[key] || null }, ws);
    } else if (m.t === 'chat' && typeof m.text === 'string') {
      broadcast({ t: 'chat', name: p.name, text: m.text.slice(0, 120) });
    }
  });
  ws.on('close', () => { players.delete(id); broadcast({ t: 'leave', id }); });
});

server.listen(PORT, "0.0.0.0", () => console.log(`VoxelCraft running at http://localhost:${PORT}`));