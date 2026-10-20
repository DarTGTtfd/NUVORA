const TS = 16, ACOLS = 8, AROWS = 8;
const atlasCanvas = document.createElement('canvas'); atlasCanvas.width = TS * ACOLS; atlasCanvas.height = TS * AROWS;
const actx = atlasCanvas.getContext('2d', { willReadFrequently: true }); actx.imageSmoothingEnabled = false;
const TILE = {}; let tileN = 0;
const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const vary = (c, r, a = 16) => { const d = (r() - .5) * a * 2; return [c[0] + d, c[1] + d, c[2] + d]; };
function paint(name, seed, fn) {
  const i = TILE[name] = tileN++, r = rng(seed), img = actx.createImageData(TS, TS);
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) { const c = fn(x, y, r), o = (y * TS + x) * 4; img.data.set([c[0], c[1], c[2], c[3] ?? 255], o); }
  actx.putImageData(img, (i % ACOLS) * TS, Math.floor(i / ACOLS) * TS);
}
const GREEN = [92, 156, 50], DIRTC = [134, 96, 67];
const cl = (x, y, s) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
const jit = (c, r, a = 3) => { const d = (r() - .5) * a * 2; return [c[0] + d, c[1] + d, c[2] + d]; };
const pickP = (P, t, r, a) => jit(P[Math.min(P.length - 1, Math.max(0, Math.floor(t * P.length)))], r, a);
const GRASSP = [[56, 116, 30], [68, 132, 36], [82, 148, 44], [96, 163, 53]], DIRTP = [[98, 70, 46], [112, 80, 53], [126, 91, 61], [140, 103, 70]];
const STONEP = [[108, 108, 112], [120, 120, 124], [131, 131, 135], [142, 142, 146]], SANDP = [[204, 191, 130], [214, 202, 142], [224, 212, 154]];
const LEAFP = [[30, 82, 22], [42, 100, 28], [56, 120, 34], [74, 142, 44]];
const grassPx = (x, y, r) => { const c = pickP(GRASSP, r() * .5 + cl(x >> 1, y >> 1, 3) * .5, r, 3), q = r(); return q < .05 ? jit([124, 184, 72], r, 4) : q > .95 ? jit([44, 96, 26], r, 3) : c; };
const dirtPx = (x, y, r) => { const q = r(); return q < .035 ? jit([150, 136, 116], r, 6) : q > .975 ? jit([78, 54, 36], r, 4) : pickP(DIRTP, r() * .5 + cl(x >> 1, y >> 1, 5) * .5, r, 3); };
const stonePx = (x, y, r) => { const q = r(); return q < .03 ? jit([92, 92, 96], r, 4) : pickP(STONEP, r() * .5 + cl(x >> 1, y >> 1, 7) * .5, r, 3); };

paint('dirt', 1, dirtPx);
paint('grass_top', 2, grassPx);
paint('grass_side', 3, (x, y, r) => {
  const d = 2 + Math.floor(cl(x, 0, 11) * 3) + (cl(x, 1, 12) < .3 ? 1 : 0);
  if (y >= d) return dirtPx(x, y, r);
  const c = grassPx(x, y, r); return y === d - 1 ? [c[0] * .8, c[1] * .8, c[2] * .8] : c;
});
paint('stone', 4, stonePx);
paint('cobble', 5, (x, y, r) => (y % 4 === 0 || (x + (y >> 2 & 1) * 4) % 8 === 0) ? vary([76, 76, 76], r, 8) : vary([134, 134, 134], r, 16));
paint('sand', 6, (x, y, r) => { const q = r(); return q < .04 ? jit([176, 160, 104], r, 4) : pickP(SANDP, r() * .5 + cl(x >> 1, y >> 1, 9) * .5, r, 2); });
paint('log_side', 7, (x, y, r) => { const k = (x % 5 === 0 ? .7 : 1) * (.9 + cl(x, 0, 13) * .22), q = r(); return jit([112 * k, 86 * k, 54 * k], r, q < .06 ? 11 : 4); });
paint('log_top', 8, (x, y, r) => { const d = Math.hypot(x - 7.5, y - 7.5); return d > 7 ? vary([104, 82, 50], r, 6) : Math.floor(d) % 2 ? vary([158, 126, 76], r, 6) : vary([120, 92, 52], r, 6); });
paint('planks', 9, (x, y, r) => (y % 4 === 3 || x === ((y >> 2 & 1) ? 3 : 11)) ? vary([110, 86, 50], r, 6) : vary([160, 130, 80], r, 10));
paint('leaves', 10, (x, y, r) => { const q = r(); return q < .07 ? jit([100, 168, 60], r, 4) : q > .93 ? jit([22, 64, 18], r, 3) : pickP(LEAFP, r() * .55 + cl(x >> 1, y >> 1, 17) * .45, r, 3); });
paint('water', 11, (x, y, r) => { const c = vary([44, 92, 206], r, 10); c[3] = 210; return c; });
paint('table_top', 12, (x, y, r) => (x % 8 === 0 || y % 8 === 0) ? [90, 60, 30] : vary([170, 130, 75], r, 8));
paint('table_side', 13, (x, y, r) => y < 4 ? vary([175, 135, 80], r, 8) : (x > 3 && x < 12 && y > 5 && y < 11) ? vary([90, 60, 35], r, 6) : vary([135, 105, 62], r, 10));
function item(name, fn) {
  const i = TILE[name] = tileN++, ox = (i % ACOLS) * TS, oy = Math.floor(i / ACOLS) * TS;
  fn((x, y, c) => { actx.fillStyle = c; actx.fillRect(ox + x, oy + y, 1, 1); });
}
const line = (px, x0, y0, x1, y1, c) => { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) px(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), c); };
const HANDLE_P = [[78, 52, 26], [116, 82, 42], [152, 112, 62]];
const HEAD_P = { w: [[120, 88, 48], [162, 124, 70], [200, 164, 104]], s: [[88, 88, 94], [138, 138, 144], [186, 186, 194]] };
function tool(name, mat, draw) {
  const g = new Uint8Array(256), set = (x, y, r) => { if (x >= 0 && y >= 0 && x < 16 && y < 16) g[y * 16 + x] = r; };
  draw(set);
  const at = (x, y) => (x < 0 || y < 0 || x > 15 || y > 15) ? 0 : g[y * 16 + x], r = rng(11);
  item(name, px => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const v = at(x, y);
      if (v) {
        const P = v === 1 ? HANDLE_P : HEAD_P[mat], lt = !at(x - 1, y) + !at(x, y - 1), dk = !at(x + 1, y) + !at(x, y + 1);
        const c = P[lt > dk ? 2 : dk > lt ? 0 : 1], n = (r() - .5) * 10;
        px(x, y, `rgb(${c.map(q => Math.max(0, Math.min(255, q + n)) | 0)})`);
      } else if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) px(x, y, mat === 's' ? '#34343c' : '#382616');
    }
  });
}
const band = (s, xmax) => { for (let y = 0; y < 16; y++) for (let x = 2; x <= xmax; x++) if (x + y === 15 || x + y === 16) s(x, y, 1); s(2, 14, 1); };
const inPoly = (px, py, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if ((P[i][1] > py) !== (P[j][1] > py) && px < (P[j][0] - P[i][0]) * (py - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0]) c = !c; return c; };
tool('stick', 'w', s => { for (let y = 0; y < 16; y++) for (let x = 2; x < 15; x++) if (x + y === 16) s(x, y, 1); });
item('apple', px => { for (let y = 3; y < 14; y++) for (let x = 2; x < 14; x++) if (Math.hypot(x - 8, y - 9) < 4.8) px(x, y, y < 8 && x > 9 ? '#d83a2a' : '#c0281c'); line(px, 8, 3, 9, 5, '#5a3a1a'); px(10, 4, '#3f9a2a'); px(11, 3, '#3f9a2a'); px(6, 7, '#f08070'); });
for (const t of ['w', 's']) {
  tool('pick_' + t, t, s => {
    band(s, 11);
    for (const off of [0, 1.1]) for (let k = -55; k <= 55; k++) {
      const q = k / 10, bow = q * q * .085, x = 11.5 + q * .707 - bow * .707 + off * .707, y = 4.5 + q * .707 + bow * .707 - off * .707;
      s(Math.round(x), Math.round(y), 2);
    }
  });
  tool('axe_' + t, t, s => {
    band(s, 10); const P = [[10, 3.5], [11.5, .5], [15, 1.5], [15.5, 5.5], [15, 9.5], [11.5, 10.5], [10, 6.5]];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) if (inPoly(x + .5, y + .5, P)) s(x, y, 2);
  });
  tool('shovel_' + t, t, s => {
    band(s, 10);
    for (let y = 0; y <= 8; y++) for (let x = 9; x <= 15; x++) if (((x - 12) / 2.6) ** 2 + ((y - 4) / 4) ** 2 <= 1) s(x, y, 2);
  });
  tool('sword_' + t, t, s => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if ((x + y === 15 || x + y === 16) && x - y >= -3 && x <= 14 && y >= 1) s(x, y, 2);
      if ((x - y === -5 || x - y === -4) && x + y >= 11 && x + y <= 21) s(x, y, 1);
      if (x + y === 16 && x - y < -5) s(x, y, 1);
    }
    s(3, 14, 1); s(2, 15, 1);
  });
}
paint('coal_ore', 14, (x, y, r) => { for (const [qx, qy, qr] of [[4, 4, 2.2], [11, 5, 1.9], [6, 11, 2.3], [12, 12, 1.7], [2, 13, 1.2], [14, 8, 1.1]]) if (Math.hypot(x - qx, y - qy) < qr + (r() - .5) * .9) return vary([36, 36, 40], r, 8); return stonePx(x, y, r); });
item('coal', px => { const r = rng(21); for (let y = 1; y < 15; y++) for (let x = 1; x < 15; x++) { const d = Math.hypot(x - 7.5, y - 8.5) + (r() - .5) * 1.8; if (d < 5.1) { const lt = (x - 7.5) + (y - 8.5) < -3 ? 1 : 0, v = 36 + (r() - .5) * 14 + lt * 36; px(x, y, `rgb(${v | 0},${v | 0},${(v + 6) | 0})`); } else if (d < 6) px(x, y, '#121216'); } px(5, 5, '#8c8c98'); px(6, 4, '#6e6e7a'); px(5, 6, '#55555f'); });
item('torch', px => {
  for (let y = 7; y < 16; y++) { px(7, y, y < 8 ? '#2b1d12' : '#a47a42'); px(8, y, y < 8 ? '#1c130b' : '#7a5530'); }
  [[6, 6, '#e8581a'], [7, 6, '#ff9a24'], [8, 6, '#ff9a24'], [9, 6, '#e8581a'], [6, 5, '#ff8a1c'], [7, 5, '#ffc83a'], [8, 5, '#ffc83a'], [9, 5, '#ff8a1c'],
   [7, 4, '#ffe27a'], [8, 4, '#ffd24a'], [7, 3, '#ffd24a'], [8, 3, '#ff9a24'], [7, 2, '#ff8a1c'], [8, 1, '#e8581a']].forEach(([x, y, c]) => px(x, y, c));
});
COL[11] = [[.3, .3, .32], [.33, .33, .35], [.3, .3, .32]];
const CHD = [62, 38, 16];
paint('chest_top', 31, (x, y, r) => (x === 0 || x === 15 || y === 0 || y === 15) ? vary(CHD, r, 6) : y % 4 === 3 ? vary([118, 80, 34], r, 6) : vary([156, 110, 50], r, 9));
const chestBody = (x, y, r) => (x === 0 || x === 15 || y === 0 || y === 15 || y === 6) ? vary(CHD, r, 6) : y < 6 ? vary([166, 118, 54], r, 9) : vary([144, 100, 44], r, 9);
paint('chest_side', 32, chestBody);
paint('chest_front', 33, (x, y, r) => {
  if (x >= 7 && x <= 8 && y >= 5 && y <= 9) return vary([214, 214, 222], r, 8);
  if (x >= 6 && x <= 9 && y >= 4 && y <= 10) return [58, 58, 66];
  return chestBody(x, y, r);
});
for (const id of [17, 70, 71, 72]) COL[id] = [[.6, .42, .2], [.55, .38, .18], [.5, .35, .16]];
const ITEMTILE = { 20: 'apple', 21: 'pick_w', 22: 'axe_w', 23: 'shovel_w', 24: 'sword_w', 25: 'stick', 26: 'pick_s', 27: 'axe_s', 28: 'shovel_s', 29: 'sword_s', 40: 'coal', 41: 'torch' };
const BTEXN = { 1: ['grass_top','grass_side','dirt'], 2: ['dirt','dirt','dirt'], 3: ['stone','stone','stone'], 4: ['sand','sand','sand'], 5: ['log_top','log_side','log_top'],
  6: ['leaves','leaves','leaves'], 7: ['water','water','water'], 8: ['planks','planks','planks'], 9: ['cobble','cobble','cobble'], 10: ['table_top','table_side','planks'], 11: ['coal_ore','coal_ore','coal_ore'] };
const grassT = (x, z) => tf(x / 70, z / 70, 4801, 2);
const G_DRY = [1.16, 1.0, .62], G_LUSH = [.86, 1.05, .88];
function gmul(t) { const u = Math.max(-1, Math.min(1, (t - .5) * 4.5)), P = u > 0 ? G_DRY : G_LUSH, a = Math.abs(u); return [1 + (P[0] - 1) * a, 1 + (P[1] - 1) * a, 1 + (P[2] - 1) * a]; }
const ROTB = { 1: 1, 2: 1, 3: 1, 4: 1 };
const FRONTF = { 17: 0, 70: 1, 71: 4, 72: 5 };
for (const id of [17, 70, 71, 72]) BTEXN[id] = ['chest_top', 'chest_side', 'chest_top', 'chest_front'];
const BT = id => BTEXN[id].map(n => TILE[n]);

const atlasTex = new THREE.CanvasTexture(atlasCanvas);
atlasTex.magFilter = atlasTex.minFilter = THREE.NearestFilter; atlasTex.generateMipmaps = false;
solidMat.map = atlasTex; solidMat.needsUpdate = true;
waterMat.map = atlasTex; waterMat.opacity = .9; waterMat.needsUpdate = true;
const tileUV = i => { const e = .04 / (TS * ACOLS), u0 = (i % ACOLS) / ACOLS + e, v1 = 1 - Math.floor(i / ACOLS) / AROWS - e; return [u0, v1 - 1 / AROWS + 2 * e, u0 + 1 / ACOLS - 2 * e, v1]; };
const UVC = [[0, 0], [1, 0], [1, 1], [0, 1]];

buildMesh = function (cx, cz) {
  const c = chunks.get(ck(cx, cz)); if (!c) return;
  const S = { p: [], c: [], u: [], i: [] }, W = { p: [], c: [], u: [], i: [] };
  const ox = cx * CS, oz = cz * CS, d = c.data, N2 = CS + 2;
  if (!c.hc) { c.hc = new Int16Array(N2 * N2); c.fw = new Float32Array(N2 * N2);
    for (let z = -1; z <= CS; z++) for (let x = -1; x <= CS; x++) { const i = (z + 1) * N2 + x + 1; c.hc[i] = heightAt(ox + x, oz + z); c.fw[i] = forestAt(ox + x, oz + z); } }
  if (!c.gt) { c.gt = new Float32Array(N2 * N2); for (let z = -1; z <= CS; z++) for (let x = -1; x <= CS; x++) c.gt[(z + 1) * N2 + x + 1] = grassT(ox + x, oz + z); }
  const hc = c.hc, fwc = c.fw, gtc = c.gt;
  for (let y = 0; y < CH; y++) for (let z = 0; z < CS; z++) for (let x = 0; x < CS; x++) {
    const b = d[idx(x, y, z)]; if (!b || (b >= 12 && b <= 16)) continue;
    const wx = ox + x, wz = oz + z, bt = BT(b), fw = fwc[(z + 1) * N2 + x + 1];
    for (let f = 0; f < 6; f++) {
      const F = FACES[f], nb = getBlock(wx + F.n[0], y + F.n[1], wz + F.n[2]);
      if (nb === -1) continue;
      if (b === WATER ? !(f === 2 && nb === AIR) : !(nb === AIR || nb === WATER || (nb >= 12 && nb <= 16))) continue;
      const T = b === WATER ? W : S, base = T.p.length / 3, uv = tileUV(f === 2 ? bt[0] : f === 3 ? bt[2] : FRONTF[b] === f ? bt[3] : bt[1]);
      let k = F.s * (1 + (hash(wx, y, wz + f * 31) - .5) * .06), kr = k, kg = k, kb = k;
      if (b !== WATER) {
        const dep = hc[(z + F.n[2] + 1) * N2 + x + F.n[0] + 1] - (y + F.n[1]);
        if (dep > 3) k *= 1 - .55 * tstep(3, 14, dep), kr = kg = kb = k;
        if ((b === GRASS && f !== 3) || b === LEAVES) {
          const w = b === LEAVES ? .7 : f === 2 ? 1 : .45, m = gmul(gtc[(z + 1) * N2 + x + 1]);
          kr *= 1 + (m[0] - 1) * w; kg *= 1 + (m[1] - 1) * w; kb *= 1 + (m[2] - 1) * w;
        }
        if (fw > 0) {
          if (b === GRASS && f === 2) { kr *= 1 - .22 * fw; kg *= 1 - .03 * fw; kb *= 1 - .28 * fw; }
          else if (b === LEAVES) { const v = .9 + .2 * tn(wx / 5, wz / 5, 4701); kr *= (1 - .14 * fw) * v; kg *= (1 + .04 * fw) * v; kb *= (1 - .18 * fw) * v; }
        }
      }
      const rot = f === 2 && ROTB[b] ? (hash(wx, y, wz + 977) * 4) | 0 : 0;
      F.v.forEach((v, n) => {
        T.p.push(wx + v[0], y + (b === WATER && v[1] ? .88 : v[1]), wz + v[2]); T.c.push(kr, kg, kb);
        const q = UVC[(n + rot) & 3]; T.u.push(q[0] ? uv[2] : uv[0], q[1] ? uv[3] : uv[1]);
      });
      T.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    }
  }
  const mk = (T, mat) => {
    if (!T.i.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(T.p, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(T.c, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(T.u, 2));
    g.setIndex(T.i); g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat); scene.add(m); return m;
  };
  for (const m of [c.mesh, c.water]) if (m) { scene.remove(m); m.geometry.dispose(); }
  c.mesh = mk(S, solidMat); c.water = mk(W, waterMat); c.dirty = false;
};

const _ic = {};
function iconURL(id) {
  if (_ic[id]) return _ic[id];
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const src = i => [(i % ACOLS) * TS, Math.floor(i / ACOLS) * TS];
  if (id >= 20) { const [sx, sy] = src(TILE[ITEMTILE[id]]); x.drawImage(atlasCanvas, sx, sy, TS, TS, 0, 0, 32, 32); }
  else {
    const t = BT(id);
    for (const [ti, m, dark] of [[t[0], [1, .5, -1, .5, 16, 0], 0], [t[3] ?? t[1], [1, .5, 0, 1, 0, 8], .28], [t[1], [1, -.5, 0, 1, 16, 16], .45]]) {
      const [sx, sy] = src(ti); x.setTransform(...m); x.drawImage(atlasCanvas, sx, sy, TS, TS, 0, 0, TS, TS);
      if (dark) { x.fillStyle = `rgba(0,0,0,${dark})`; x.fillRect(0, 0, TS, TS); }
    }
  }
  return _ic[id] = c.toDataURL();
}

const blockMat = new THREE.MeshBasicMaterial({ map: atlasTex, vertexColors: true });
blockMat.userData.min = .8; const litMats = [blockMat];
const _bg = {}, _it = {}, planeGeo = new THREE.PlaneGeometry(1, 1);
function blockGeo(id) {
  if (_bg[id]) return _bg[id];
  const p = [], col = [], u = [], ind = [], bt = BT(id);
  FACES.forEach((F, f) => {
    const base = p.length / 3, uv = tileUV(f === 2 ? bt[0] : f === 3 ? bt[2] : f === 4 && bt[3] !== undefined ? bt[3] : bt[1]);
    F.v.forEach((v, n) => { p.push(v[0] - .5, v[1] - .5, v[2] - .5); col.push(F.s, F.s, F.s); u.push(UVC[n][0] ? uv[2] : uv[0], UVC[n][1] ? uv[3] : uv[1]); });
    ind.push(base, base + 1, base + 2, base, base + 2, base + 3);
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(u, 2)); g.setIndex(ind);
  return _bg[id] = g;
}
function itemMat(id) {
  if (_it[id]) return _it[id];
  const c = document.createElement('canvas'); c.width = c.height = TS; const i = TILE[ITEMTILE[id]];
  c.getContext('2d').drawImage(atlasCanvas, (i % ACOLS) * TS, Math.floor(i / ACOLS) * TS, TS, TS, 0, 0, TS, TS);
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter;
  const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: .5, side: THREE.DoubleSide }); litMats.push(m); return _it[id] = m;
}
const extMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }); extMat.userData.min = .8; litMats.push(extMat);
const _eg = {};
function extGeo(id) {
  if (_eg[id]) return _eg[id];
  const i = TILE[ITEMTILE[id]], d = actx.getImageData((i % ACOLS) * TS, Math.floor(i / ACOLS) * TS, TS, TS).data;
  const A = (x, y) => x >= 0 && y >= 0 && x < TS && y < TS && d[(y * TS + x) * 4 + 3] > 128;
  const p = [], c = [], ind = [], u = 1 / TS, h = 1.4 / TS / 2;
  const quad = (v, col, s) => { const b = p.length / 3; v.forEach(q => { p.push(...q); c.push(col[0] * s, col[1] * s, col[2] * s); }); ind.push(b, b + 1, b + 2, b, b + 2, b + 3); };
  for (let y = 0; y < TS; y++) for (let x = 0; x < TS; x++) {
    if (!A(x, y)) continue;
    const o = (y * TS + x) * 4, col = [d[o] / 255, d[o + 1] / 255, d[o + 2] / 255], x0 = x * u - .5, x1 = x0 + u, y1 = .5 - y * u, y0 = y1 - u;
    quad([[x0, y0, h], [x1, y0, h], [x1, y1, h], [x0, y1, h]], col, 1);
    quad([[x1, y0, -h], [x0, y0, -h], [x0, y1, -h], [x1, y1, -h]], col, .75);
    if (!A(x - 1, y)) quad([[x0, y0, -h], [x0, y0, h], [x0, y1, h], [x0, y1, -h]], col, .7);
    if (!A(x + 1, y)) quad([[x1, y0, h], [x1, y0, -h], [x1, y1, -h], [x1, y1, h]], col, .6);
    if (!A(x, y - 1)) quad([[x0, y1, h], [x1, y1, h], [x1, y1, -h], [x0, y1, -h]], col, .95);
    if (!A(x, y + 1)) quad([[x0, y0, -h], [x1, y0, -h], [x1, y0, h], [x0, y0, h]], col, .55);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); g.setIndex(ind);
  return _eg[id] = g;
}
const itemMesh = id => id < 20 ? new THREE.Mesh(blockGeo(id), blockMat) : new THREE.Mesh(extGeo(id), extMat);
function setLight(L) { solidMat.color.setRGB(L, L, L); waterMat.color.setRGB(L, L, L); litMats.forEach(m => { const b = m.userData.base || { r: 1, g: 1, b: 1 }, k = Math.max(L, m.userData.min || 0); m.color.setRGB(b.r * k, b.g * k, b.b * k); }); }