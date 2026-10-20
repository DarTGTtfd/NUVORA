'use strict';
const CS = 16, CH = 64, SEA = 20, RD = 5;
const AIR = 0, GRASS = 1, DIRT = 2, STONE = 3, SAND = 4, WOOD = 5, LEAVES = 6, WATER = 7, COAL_ORE = 11;
const COL = {
  1: [[.33,.6,.2],[.45,.34,.2],[.4,.29,.17]], 2: [[.45,.33,.2],[.45,.33,.2],[.4,.29,.17]],
  3: [[.52,.52,.54],[.5,.5,.52],[.45,.45,.47]], 4: [[.88,.82,.56],[.85,.78,.52],[.8,.74,.5]],
  5: [[.6,.45,.25],[.42,.29,.15],[.6,.45,.25]], 6: [[.2,.52,.16],[.18,.46,.14],[.16,.4,.12]],
  7: [[.2,.42,.88],[.2,.42,.88],[.2,.42,.88]]
};
const HOTBAR = [GRASS, DIRT, STONE, SAND, WOOD, LEAVES];
const FACES = [
  { n: [1,0,0],  v: [[1,0,1],[1,0,0],[1,1,0],[1,1,1]], s: .8,  c: 1 },
  { n: [-1,0,0], v: [[0,0,0],[0,0,1],[0,1,1],[0,1,0]], s: .8,  c: 1 },
  { n: [0,1,0],  v: [[0,1,1],[1,1,1],[1,1,0],[0,1,0]], s: 1,   c: 0 },
  { n: [0,-1,0], v: [[0,0,0],[1,0,0],[1,0,1],[0,0,1]], s: .5,  c: 2 },
  { n: [0,0,1],  v: [[0,0,1],[1,0,1],[1,1,1],[0,1,1]], s: .65, c: 1 },
  { n: [0,0,-1], v: [[1,0,0],[0,0,0],[0,1,0],[1,1,0]], s: .65, c: 1 },
];

let SEED = 1337;
const hash = (x, y, z = 0) => {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 2147483647) ^ Math.imul(SEED, 1442695041);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
const smooth = t => t * t * (3 - 2 * t);
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), u = smooth(x - xi), v = smooth(z - zi);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, z) {
  let s = 0, a = .5, f = 1;
  for (let i = 0; i < 4; i++) { s += a * vnoise(x * f, z * f); a *= .5; f *= 2; }
  return s;
}

const chunks = new Map();
const editsByChunk = new Map();
const ck = (cx, cz) => cx + ',' + cz;
const idx = (x, y, z) => x + CS * (z + CS * y);
const mod = (n, m) => ((n % m) + m) % m;

function noteEdit(x, y, z, b) {
  const k = ck(Math.floor(x / CS), Math.floor(z / CS));
  if (!editsByChunk.has(k)) editsByChunk.set(k, new Map());
  editsByChunk.get(k).set(idx(mod(x, CS), y, mod(z, CS)), b);
}
function getBlock(x, y, z) {
  if (y < 0) return STONE;
  if (y >= CH) return AIR;
  const c = chunks.get(ck(Math.floor(x / CS), Math.floor(z / CS)));
  return c ? c.data[idx(mod(x, CS), y, mod(z, CS))] : -1;
}

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const SKY = 0x7fb8ea; let skyHex = SKY;
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, RD * CS * .55, RD * CS * .95);
const camera = new THREE.PerspectiveCamera(72, 1, .05, 400);
camera.rotation.order = 'YXZ';
const solidMat = new THREE.MeshBasicMaterial({ vertexColors: true });
const waterMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .62, depthWrite: false });
function resize() { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
addEventListener('resize', resize); resize();

function buildMesh(cx, cz) {
  const c = chunks.get(ck(cx, cz)); if (!c) return;
  const S = { p: [], c: [], i: [] }, W = { p: [], c: [], i: [] };
  const ox = cx * CS, oz = cz * CS, d = c.data;
  for (let y = 0; y < CH; y++) for (let z = 0; z < CS; z++) for (let x = 0; x < CS; x++) {
    const b = d[idx(x, y, z)]; if (!b) continue;
    const wx = ox + x, wz = oz + z, col = COL[b];
    for (let f = 0; f < 6; f++) {
      const F = FACES[f], nb = getBlock(wx + F.n[0], y + F.n[1], wz + F.n[2]);
      if (nb === -1) continue;
      if (b === WATER ? !(f === 2 && nb === AIR) : !(nb === AIR || nb === WATER)) continue;
      const T = b === WATER ? W : S, base = T.p.length / 3;
      const j = 1 + (hash(wx, y, wz + f * 31) - .5) * .12, k = F.s * j, cc = col[F.c];
      for (const v of F.v) {
        T.p.push(wx + v[0], y + (b === WATER && v[1] ? .88 : v[1]), wz + v[2]);
        T.c.push(cc[0] * k, cc[1] * k, cc[2] * k);
      }
      T.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  const mk = (T, mat) => {
    if (!T.i.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(T.p, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(T.c, 3));
    g.setIndex(T.i);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat); scene.add(m); return m;
  };
  for (const m of [c.mesh, c.water]) if (m) { scene.remove(m); m.geometry.dispose(); }
  c.mesh = mk(S, solidMat); c.water = mk(W, waterMat); c.dirty = false;
}
const markDirty = (cx, cz) => { const c = chunks.get(ck(cx, cz)); if (c) c.dirty = true; };
function removeChunk(k) {
  const c = chunks.get(k);
  for (const m of [c.mesh, c.water]) if (m) { scene.remove(m); m.geometry.dispose(); }
  chunks.delete(k);
}
function updateChunks(px, pz, budget) {
  const pcx = Math.floor(px / CS), pcz = Math.floor(pz / CS), want = [];
  for (let dz = -RD; dz <= RD; dz++) for (let dx = -RD; dx <= RD; dx++)
    if (dx * dx + dz * dz <= RD * RD) want.push([pcx + dx, pcz + dz, dx * dx + dz * dz]);
  want.sort((a, b) => a[2] - b[2]);
  for (const [cx, cz] of want) {
    if (budget <= 0) break;
    if (chunks.has(ck(cx, cz))) continue;
    chunks.set(ck(cx, cz), { data: genChunk(cx, cz), mesh: null, water: null, dirty: true });
    for (const [a, b] of [[1,0],[-1,0],[0,1],[0,-1]]) markDirty(cx + a, cz + b);
    budget--;
  }
  for (const [k, c] of chunks) {
    const [cx, cz] = k.split(',').map(Number);
    if (Math.hypot(cx - pcx, cz - pcz) > RD + 2) removeChunk(k);
  }
  let m = 3;
  for (const [k, c] of chunks) if (c.dirty && m-- > 0) { const [cx, cz] = k.split(',').map(Number); buildMesh(cx, cz); }
}
function setBlock(x, y, z, b, send) {
  if (y < 1 || y >= CH) return;
  const cx = Math.floor(x / CS), cz = Math.floor(z / CS), c = chunks.get(ck(cx, cz));
  noteEdit(x, y, z, b);
  if (c) {
    c.data[idx(mod(x, CS), y, mod(z, CS))] = b; c.dirty = true;
    const lx = mod(x, CS), lz = mod(z, CS);
    if (lx === 0) markDirty(cx - 1, cz); if (lx === CS - 1) markDirty(cx + 1, cz);
    if (lz === 0) markDirty(cx, cz - 1); if (lz === CS - 1) markDirty(cx, cz + 1);
  }
  if (send && net.ws && net.ws.readyState === 1) net.ws.send(JSON.stringify({ t: 'block', x, y, z, b }));
}

const P = { x: 8, y: 60, z: 8, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: 0, ground: false, inWater: false };
const HW = .3, PH = 1.8, EYE = 1.62;
const solid = b => b === -1 || (b > 0 && b !== WATER && !(b >= 12 && b <= 16));
function collides(px, py, pz) {
  for (let y = Math.floor(py); y <= Math.floor(py + PH - .01); y++)
    for (let z = Math.floor(pz - HW); z <= Math.floor(pz + HW); z++)
      for (let x = Math.floor(px - HW); x <= Math.floor(px + HW); x++)
        if (solid(getBlock(x, y, z))) return true;
  return false;
}
const keys = {}, stick = { x: 0, y: 0 };
let jumpHeld = false;
function physics(dt) {
  const fwd = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) - stick.y;
  const str = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + stick.x;
  const len = Math.hypot(fwd, str) || 1, sp = (P.inWater ? 2.6 : keys.ShiftLeft ? 6.5 : 4.4) * Math.min(1, len);
  const sn = Math.sin(P.yaw), cs = Math.cos(P.yaw);
  P.vx = (-sn * fwd + cs * str) / len * sp;
  P.vz = (-cs * fwd - sn * str) / len * sp;
  P.inWater = getBlock(Math.floor(P.x), Math.floor(P.y + .6), Math.floor(P.z)) === WATER;
  if (P.inWater) { P.vy = Math.max(P.vy - 6 * dt, -3); if (jumpHeld) P.vy = 3.2; }
  else { P.vy = Math.max(P.vy - 28 * dt, -50); if (jumpHeld && P.ground) P.vy = 8.6; }
  let nx = P.x + P.vx * dt; if (!collides(nx, P.y, P.z)) P.x = nx;
  let nz = P.z + P.vz * dt; if (!collides(P.x, P.y, nz)) P.z = nz;
  const ny = P.y + P.vy * dt; P.ground = false;
  if (!collides(P.x, ny, P.z)) P.y = ny;
  else { if (P.vy < 0) { P.ground = true; P.y = Math.floor(P.y + P.vy * dt) + 1 + 1e-4; if (collides(P.x, P.y, P.z)) P.y = ny + 1; } P.vy = 0; }
  if (P.y < -20) { P.y = 70; P.vy = 0; }
}
function groundHeightAt(x, z) { for (let y = CH - 1; y > 0; y--) if (solid(getBlock(x, y, z))) return y + 1; return 40; }

let plantHit = null;
function raycast(max = 6) {
  const o = camera.position, d = new THREE.Vector3(); camera.getWorldDirection(d);
  let x = Math.floor(o.x), y = Math.floor(o.y), z = Math.floor(o.z), px = x, py = y, pz = z;
  const st = (v) => Math.sign(v), dl = v => v ? Math.abs(1 / v) : Infinity;
  const tdx = dl(d.x), tdy = dl(d.y), tdz = dl(d.z);
  let tx = d.x ? (d.x > 0 ? x + 1 - o.x : o.x - x) * tdx : Infinity;
  let ty = d.y ? (d.y > 0 ? y + 1 - o.y : o.y - y) * tdy : Infinity;
  let tz = d.z ? (d.z > 0 ? z + 1 - o.z : o.z - z) * tdz : Infinity, t = 0;
  while (t <= max) {
    const b = getBlock(x, y, z);
    if (b > 0 && b !== WATER) return { x, y, z, px, py, pz };
    if (b === 0 && plantHit) { const bx = plantHit(x, y, z, o, d, max); if (bx) return { x, y: Math.floor(bx[1] + 1e-4), z, px, py, pz, plant: bx }; }
    px = x; py = y; pz = z;
    if (tx < ty && tx < tz) { x += st(d.x); t = tx; tx += tdx; }
    else if (ty < tz) { y += st(d.y); t = ty; ty += tdy; }
    else { z += st(d.z); t = tz; tz += tdz; }
  }
  return null;
}
const hl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)), new THREE.LineBasicMaterial({ color: 0x000000 }));
hl.visible = false; scene.add(hl);
let sel = 0;
function breakBlock() { const r = raycast(); if (r && r.y > 0) setBlock(r.x, r.y, r.z, AIR, true); }
function placeBlock() {
  const r = raycast(); if (!r) return;
  const { px: x, py: y, pz: z } = r;
  const overlap = x + 1 > P.x - HW && x < P.x + HW && y + 1 > P.y && y < P.y + PH && z + 1 > P.z - HW && z < P.z + HW;
  if (!overlap) setBlock(x, y, z, HOTBAR[sel], true);
}

const net = { ws: null, id: 0, others: new Map() };
const hex = c => '#' + [...c].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
function makeAvatar(id) {
  const g = new THREE.Group(), hue = (id * 0.37) % 1, col = new THREE.Color().setHSL(hue, .6, .5);
  const body = new THREE.Mesh(new THREE.BoxGeometry(.5, .9, .3), new THREE.MeshBasicMaterial({ color: col }));
  const head = new THREE.Mesh(new THREE.BoxGeometry(.42, .42, .42), new THREE.MeshBasicMaterial({ color: 0xe8c39a }));
  body.position.y = .75; head.position.y = 1.4; g.add(body, head); scene.add(g); return g;
}
function addPlayer(p) { const g = makeAvatar(p.id); g.position.set(p.x, p.y, p.z); g.rotation.y = p.ry; net.others.set(p.id, g); }
function logChat(name, text) {
  const el = document.getElementById('chatlog'), d = document.createElement('div');
  d.textContent = `${name}: ${text}`; el.appendChild(d); setTimeout(() => d.remove(), 9000);
}
function connect() {
  return new Promise(res => {
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    setTimeout(fin, 1500);
    try {
      const ws = net.ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
      ws.onmessage = e => {
        const m = JSON.parse(e.data);
        if (m.t === 'init') {
          net.id = m.id; SEED = m.seed;
          for (const k in m.edits) { const [x, y, z] = k.split(',').map(Number); noteEdit(x, y, z, m.edits[k]); }
          m.players.forEach(addPlayer); if (m.chests) chestInit(m.chests); fin();
        } else if (m.t === 'join') addPlayer(m.p);
        else if (m.t === 'leave') { const g = net.others.get(m.id); if (g) scene.remove(g); net.others.delete(m.id); }
        else if (m.t === 'move') { const g = net.others.get(m.id); if (g) { g.position.set(m.x, m.y, m.z); g.rotation.y = m.ry; } }
        else if (m.t === 'block') setBlock(m.x, m.y, m.z, m.b, false);
        else if (m.t === 'chat') logChat(m.name, m.text);
        else if (m.t === 'chest') chestNet(m);
      };
      ws.onerror = fin;
    } catch { fin(); }
  });
}

const $ = id => document.getElementById(id);
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
let playing = false;
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') {
    if (e.code === 'Enter') { const t = e.target.value.trim(); if (t && net.ws) net.ws.send(JSON.stringify({ t: 'chat', text: t })); e.target.value = ''; $('chatbox').style.display = 'none'; e.target.blur(); renderer.domElement.requestPointerLock?.(); }
    return;
  }
  keys[e.code] = true;
  if (e.code === 'Space') { jumpHeld = true; e.preventDefault(); }
  if (e.code === 'KeyT' && playing) { document.exitPointerLock?.(); $('chatbox').style.display = 'block'; $('chatbox').firstElementChild.focus(); e.preventDefault(); }
  const n = parseInt(e.key); if (n >= 1 && n <= HOTBAR.length) selectSlot(n - 1);
});
addEventListener('keyup', e => { keys[e.code] = false; if (e.code === 'Space') jumpHeld = false; });
addEventListener('mousemove', e => {
  if (document.pointerLockElement !== renderer.domElement) return;
  P.yaw -= e.movementX * .0022; P.pitch = Math.max(-1.55, Math.min(1.55, P.pitch - e.movementY * .0022));
});
addEventListener('mousedown', e => {
  if (document.pointerLockElement !== renderer.domElement) { if (playing && !isTouch && e.target === renderer.domElement) renderer.domElement.requestPointerLock(); return; }
  if (e.button === 0) breakBlock(); else if (e.button === 2) placeBlock();
});
addEventListener('contextmenu', e => e.preventDefault());
addEventListener('wheel', e => selectSlot(mod(sel + Math.sign(e.deltaY), HOTBAR.length)));

const stickEl = $('stick'), knob = $('knob'); let stickId = null, lookId = null, lx = 0, ly = 0;
function moveStick(t) {
  const r = stickEl.getBoundingClientRect(), dx = t.clientX - (r.left + 60), dy = t.clientY - (r.top + 60), m = Math.min(1, Math.hypot(dx, dy) / 44), a = Math.atan2(dy, dx);
  stick.x = Math.cos(a) * m; stick.y = Math.sin(a) * m;
  knob.style.transform = `translate(${stick.x * 44}px,${stick.y * 44}px)`;
}
stickEl.addEventListener('touchstart', e => { stickId = e.changedTouches[0].identifier; moveStick(e.changedTouches[0]); e.preventDefault(); });
renderer.domElement.addEventListener('touchstart', e => { const t = e.changedTouches[0]; lookId = t.identifier; lx = t.clientX; ly = t.clientY; });
addEventListener('touchmove', e => {
  for (const t of e.changedTouches) {
    if (t.identifier === stickId) moveStick(t);
    else if (t.identifier === lookId) { P.yaw -= (t.clientX - lx) * .005; P.pitch = Math.max(-1.55, Math.min(1.55, P.pitch - (t.clientY - ly) * .005)); lx = t.clientX; ly = t.clientY; }
  }
}, { passive: false });
addEventListener('touchend', e => {
  for (const t of e.changedTouches) {
    if (t.identifier === stickId) { stickId = null; stick.x = stick.y = 0; knob.style.transform = ''; }
    if (t.identifier === lookId) lookId = null;
  }
});
$('bJump').addEventListener('touchstart', e => { jumpHeld = true; e.preventDefault(); });
$('bJump').addEventListener('touchend', () => jumpHeld = false);
$('bBreak').addEventListener('touchstart', e => { breakBlock(); e.preventDefault(); });
$('bPlace').addEventListener('touchstart', e => { placeBlock(); e.preventDefault(); });

const hb = $('hotbar');
HOTBAR.forEach((b, i) => {
  const s = document.createElement('div'); s.className = 'slot';
  s.innerHTML = `<i style="background:${hex(COL[b][b === GRASS ? 0 : 1])}"></i>`;
  s.addEventListener('pointerdown', () => selectSlot(i)); hb.appendChild(s);
});
function selectSlot(i) { sel = i; [...hb.children].forEach((s, j) => s.classList.toggle('on', j === i)); }
selectSlot(0);

let last = performance.now(), sendT = 0, fps = 0, started = false;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - last) / 1000); last = now; fps = fps * .9 + (1 / Math.max(dt, 1e-3)) * .1;
  if (!started) return;
  updateChunks(P.x, P.z, 2);
  physics(dt);
  if (typeof survivalTick === 'function') survivalTick(dt);
  camera.position.set(P.x, P.y + EYE - (P.eyeDrop || 0), P.z); camera.rotation.set(P.pitch, P.yaw, 0);
  const r = raycast(); hl.visible = !!r;
  if (r) { const b = r.plant; if (b) { hl.position.set((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2); hl.scale.set(b[3] - b[0] + .03, b[4] - b[1] + .03, b[5] - b[2] + .03); } else { hl.position.set(r.x + .5, r.y + .5, r.z + .5); hl.scale.set(1, 1, 1); } }
  const under = getBlock(Math.floor(P.x), Math.floor(P.y + EYE), Math.floor(P.z)) === WATER;
  scene.fog.color.setHex(under ? 0x1d3f8a : skyHex); scene.background.setHex(under ? 0x1d3f8a : skyHex); scene.fog.near = under ? 1 : RD * CS * .55; scene.fog.far = under ? 18 : RD * CS * .95;
  sendT += dt;
  if (sendT > .1 && net.ws && net.ws.readyState === 1) { sendT = 0; net.ws.send(JSON.stringify({ t: 'move', x: P.x, y: P.y, z: P.z, ry: P.yaw })); }
  $('info').innerHTML = `XYZ ${P.x.toFixed(1)} ${P.y.toFixed(1)} ${P.z.toFixed(1)} · ${biomeName(P.x, P.z)}<br>FPS ${fps.toFixed(0)} · Players ${net.others.size + 1}${net.ws && net.ws.readyState === 1 ? '' : ' (offline)'}`;
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);

$('play').addEventListener('click', async () => {
  $('play').textContent = 'Loading…'; $('play').disabled = true;
  await connect();
  const sp = typeof savedPos !== 'undefined' && savedPos;
  const sx = sp ? sp.x : 8.5, sz = sp ? sp.z : 8.5;
  for (let i = 0; i < 3; i++) updateChunks(sx, sz, 40);
  P.x = sx; P.z = sz; P.y = sp ? sp.y : groundHeightAt(8, 8) + .1;
  if (sp) { P.yaw = sp.yaw || 0; P.pitch = sp.pitch || 0; if (collides(P.x, P.y, P.z)) P.y = Math.max(P.y, groundHeightAt(Math.floor(P.x), Math.floor(P.z))) + 1; }
  $('start').style.display = 'none'; $('hud').style.display = 'block';
  if (isTouch) $('mobile').style.display = 'block'; else renderer.domElement.requestPointerLock();
  playing = started = true;
});