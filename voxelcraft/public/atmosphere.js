(() => {
const TAU = Math.PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const rnd = (a, b) => a + Math.random() * (b - a);
const U = { time: { value: 0 }, player: { value: new THREE.Vector3() }, wind: { value: 1 } };
let T = 0, rain = 0, cloudy = 0, flash = 0, lightL = 1;
const dayPhase = () => dayAngle() / TAU;
const elevNow = () => Math.sin(dayPhase() * TAU);

const RAIN = { gapDays: 6.5, spreadDays: 1.5, minMin: 4, maxMin: 10 };
const DL = typeof DAYLEN !== 'undefined' ? DAYLEN : 480;
const h01 = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function weatherTarget(ts) {
  const W = RAIN.gapDays * DL, k = Math.floor(ts / W); let r = 0, c = 0;
  for (const kk of [k, k + 1]) {
    const st = kk * W + h01(kk * 3.1 + 1) * RAIN.spreadDays * DL;
    const dur = (RAIN.minMin + h01(kk * 5.7 + 2) * (RAIN.maxMin - RAIN.minMin)) * 60;
    const lvl = h01(kk * 7.3 + 3) < .4 ? 1 : .55 + h01(kk * 9.1 + 4) * .25;
    r = Math.max(r, ss(st, st + 90, ts) * (1 - ss(st + dur - 90, st + dur, ts)) * lvl);
    c = Math.max(c, ss(st - 240, st + 90, ts) * (1 - ss(st + dur, st + dur + 240, ts)));
  }
  return [r, c];
}

const PT = 9, pc = document.createElement('canvas'); pc.width = 16 * PT; pc.height = 16;
const px = pc.getContext('2d');
const dot = (t, x, y, c) => { if (x < 0 || x > 15 || y < 0 || y > 15) return; px.fillStyle = c; px.fillRect(t * 16 + x, y, 1, 1); };
const rgb = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`;
function blades(t, seed, n, minH, maxH, tips) {
  const r = rng(seed);
  for (let k = 0; k < n; k++) {
    const x0 = 1 + r() * 13, h = minH + r() * (maxH - minH), lean = (r() - .5) * .9, sh = .75 + r() * .4;
    for (let j = 0; j < h; j++) {
      const x = Math.round(x0 + lean * j * .6), y = 15 - j, f = j / h, c = [(48 + f * 50) * sh, (92 + f * 84) * sh, (22 + f * 12) * sh];
      dot(t, x, y, rgb(...c)); if (r() < .35) dot(t, x + 1, y, rgb(c[0] * .85, c[1] * .85, c[2] * .85));
    }
    if (tips && r() < .5) dot(t, Math.round(x0 + lean * h * .6), 15 - Math.floor(h), rgb(190, 170, 90));
  }
}
blades(0, 11, 9, 5, 11, false); blades(1, 12, 14, 9, 15, true);
(function fern(t) {
  for (let j = 0; j < 14; j++) {
    const y = 15 - j; dot(t, 8, y, rgb(38, 96, 30));
    if (j > 2 && j % 2 === 0) { const len = Math.round(5 * Math.sin(j / 14 * Math.PI * .9 + .3)); for (let k = 1; k <= len; k++) { const c = rgb(52 + k * 5, 122 + k * 4, 36), yy = y - (k > 2 ? 1 : 0); dot(t, 8 - k, yy, c); dot(t, 8 + k, yy, c); } }
  }
})(2);
function stem(t, x, top) { for (let y = top; y < 16; y++) dot(t, x, y, rgb(50, 112, 34)); dot(t, x - 1, 12, rgb(62, 132, 40)); dot(t, x - 2, 11, rgb(62, 132, 40)); dot(t, x + 1, 10, rgb(62, 132, 40)); dot(t, x + 2, 9, rgb(62, 132, 40)); }
(function flowers() {
  stem(3, 8, 7);
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= 2) dot(3, 8 + dx, 5 + dy, (dx + dy) % 2 ? rgb(214, 36, 36) : rgb(188, 24, 28));
  dot(3, 8, 5, rgb(38, 18, 18));
  stem(4, 8, 8);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) dot(4, 8 + dx, 6 + dy, rgb(250, 214, 40));
  for (const [x, y] of [[8, 4], [6, 6], [10, 6], [8, 8], [7, 4], [9, 4]]) dot(4, x, y, rgb(252, 232, 90));
  stem(5, 8, 8);
  for (const [x, y] of [[8, 4], [7, 5], [9, 5], [6, 6], [10, 6], [7, 7], [9, 7], [8, 8]]) dot(5, x, y, rgb(70, 104, 232));
  dot(5, 8, 6, rgb(120, 70, 190)); dot(5, 8, 5, rgb(90, 120, 245)); dot(5, 7, 6, rgb(90, 120, 245)); dot(5, 9, 6, rgb(90, 120, 245));
  stem(6, 8, 8);
  for (const [x, y] of [[8, 3], [8, 9], [5, 6], [11, 6], [6, 4], [10, 4], [6, 8], [10, 8], [8, 4], [8, 8], [7, 6], [9, 6]]) dot(6, x, y, rgb(246, 246, 240));
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) dot(6, 8 + dx, 6 + dy, Math.abs(dx) + Math.abs(dy) < 2 ? rgb(244, 190, 30) : rgb(246, 246, 240));
  stem(7, 8, 8);
  for (const [x, y, w] of [[8, 3, 1], [8, 4, 3], [8, 5, 5], [8, 6, 5], [8, 7, 3]]) for (let k = -(w >> 1); k <= (w >> 1); k++) dot(7, x + k, y, k === 0 && y < 6 ? rgb(250, 130, 60) : rgb(234, 92, 40));
  for (let y = 3; y < 16; y++) dot(8, 8, y, rgb(50, 112, 34)); dot(8, 7, 12, rgb(62, 132, 40)); dot(8, 6, 11, rgb(62, 132, 40)); dot(8, 9, 10, rgb(62, 132, 40));
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) if (dx * dx + dy * dy <= 9) dot(8, 8 + dx, 3 + dy, (dx * 3 + dy * 5) % 3 ? rgb(176, 96, 206) : rgb(206, 140, 232));
})();
const plantTex = new THREE.CanvasTexture(pc); plantTex.magFilter = plantTex.minFilter = THREE.NearestFilter; plantTex.generateMipmaps = false;
const plantMat = new THREE.MeshBasicMaterial({ map: plantTex, vertexColors: true, alphaTest: .45, side: THREE.DoubleSide });
litMats.push(plantMat);
plantMat.onBeforeCompile = sh => {
  sh.uniforms.uTime = U.time; sh.uniforms.uPlayer = U.player; sh.uniforms.uWind = U.wind;
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nattribute float aSway;\nuniform float uTime;\nuniform vec3 uPlayer;\nuniform float uWind;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      float ph = position.x * .9 + position.z * .7;
      float gust = sin(uTime * .5 + position.x * .05 + position.z * .04);
      transformed.x += (sin(uTime * 1.7 + ph) * .06 + sin(uTime * 3.1 + ph * 1.7) * .02 + gust * .05 * uWind) * aSway * uWind;
      transformed.z += (cos(uTime * 1.3 + ph) * .05 + gust * .03 * uWind) * aSway * uWind;
      vec2 dd = position.xz - uPlayer.xz; float dl = length(dd);
      float push = (1.0 - smoothstep(.2, 1.5, dl)) * aSway;
      transformed.xz += dd / (dl + .001) * push * .4;
      transformed.y -= push * .15;`);
};
const SPECIES = [3, 4, 5, 6, 7, 8];
function plantsFor(wx, wz) {
  const n1 = vnoise(wx / 6 + 31, wz / 6 + 17), mdw = vnoise(wx / 13 + 77, wz / 13 - 40), fr = vnoise(wx / 9 - 12, wz / 9 + 50), tone = .82 + .3 * vnoise(wx / 20, wz / 20 + 5);
  const fw = forestAt(wx, wz), r = hash(wx, wz, 555), r2 = hash(wx, wz, 556), r3 = hash(wx, wz, 557), r4 = hash(wx, wz, 558);
  const gx = wx + .5 + (r2 - .5) * .6, gz = wz + .5 + (r4 - .5) * .6, yaw = r * TAU, gm = gmul(grassT(wx, wz)), gt = [tone * .9 * gm[0], tone * gm[1], tone * .78 * gm[2]], out = [];
  const add = (tile, s, x, z, y, tint, sway) => out.push([tile, s, x, z, y, tint, sway]);
  if (mdw > .70 && r3 < (mdw - .66) * 1.3 * (1 - fw)) {
    const sp = SPECIES[(r4 < .7 ? Math.floor(hash(Math.floor(wx / 6), Math.floor(wz / 6), 88) * 6) : Math.floor(r2 * 6)) % 6];
    add(sp, sp === 8 ? 1.05 : .78 + r2 * .12, gx, gz, yaw, [1, 1, 1], .8);
    if (r < .35) add(0, .6 + r2 * .3, wx + .5 + (r - .25), wz + .5 + (r2 - .5) * .5, r4 * TAU, gt, 1);
  } else if (r3 < .004 * (1 - fw * .7)) add(SPECIES[Math.floor(r2 * 6) % 6], .78, gx, gz, yaw, [1, 1, 1], .8);
  else if (fw > .3 && fr > .45 && r < .26 * fw) add(2, .9 + r2 * .3, gx, gz, yaw, [tone, tone, tone * .9], .9);
  else if (n1 > .66 && r < .3) add(1, 1.2 + r2 * .35, gx, gz, yaw, gt, 1.15);
  else if (fr > .74 && r < .09) add(2, .9 + r2 * .25, gx, gz, yaw, [tone, tone, tone * .9], .9);
  else if (r < .045 + n1 * .26 * (1 - fw * .6)) { add(0, .65 + r2 * .4, gx, gz, yaw, gt, 1); if (n1 > .78 && r4 < .3) add(0, .5 + r2 * .3, gx + .25, gz - .2, yaw + 1, gt, 1); }
  return out;
}
const plantGone = (x, y, z) => { const e = editsByChunk.get(ck(Math.floor(x / CS), Math.floor(z / CS))); return !!e && e.has(idx(mod(x, CS), y, mod(z, CS))); };
function plantBoxes(wx, wz, hy) {
  const hw = s => clamp(s * .3, .13, .3);
  return plantsFor(wx, wz).map(p => { const w = hw(p[1]); return [p[2] - w, hy + 1, p[3] - w, p[2] + w, hy + 1 + p[1] * .9, p[3] + w]; });
}
function plantCell(x, y, z) {
  return getBlock(x, y - 1, z) === GRASS && getBlock(x, y, z) === AIR && heightAt(x, z) === y - 1 && !plantGone(x, y, z) && plantsFor(x, z).length > 0;
}
function rayBox(o, d, b, max) {
  let t0 = 0, t1 = max;
  const ax = [[o.x, d.x, b[0], b[3]], [o.y, d.y, b[1], b[4]], [o.z, d.z, b[2], b[5]]];
  for (let i = 0; i < 3; i++) {
    const [oo, dd, lo, hi] = ax[i];
    if (Math.abs(dd) < 1e-9) { if (oo < lo || oo > hi) return false; continue; }
    let a = (lo - oo) / dd, c = (hi - oo) / dd; if (a > c) { const t = a; a = c; c = t; }
    t0 = Math.max(t0, a); t1 = Math.min(t1, c); if (t0 > t1) return false;
  }
  return true;
}
plantHit = function (x, y, z, o, d, max) {
  for (let k = 1; k <= 2; k++) {
    if (getBlock(x, y - k, z) !== GRASS || getBlock(x, y - k + 1, z) !== AIR) continue;
    if (heightAt(x, z) !== y - k || plantGone(x, y - k + 1, z)) continue;
    for (const bx of plantBoxes(x, z, y - k)) if (rayBox(o, d, bx, max)) return bx;
  }
  return null;
};
function buildPlants(cx, cz) {
  const c = chunks.get(ck(cx, cz)); if (!c) return;
  if (c.plants) { scene.remove(c.plants); c.plants.geometry.dispose(); c.plants = null; }
  const pos = [], uv = [], col = [], sw = [], ind = [], ox = cx * CS, oz = cz * CS, d = c.data, ed = editsByChunk.get(ck(cx, cz));
  const add = (tile, s, x, y, z, yaw, tint, sway) => {
    const u0 = tile / PT + .0005, u1 = (tile + 1) / PT - .0005;
    for (let q = 0; q < 2; q++) {
      const a = yaw + q * Math.PI / 2, hx = Math.cos(a) * s / 2, hz = Math.sin(a) * s / 2, b = pos.length / 3;
      pos.push(x - hx, y, z - hz, x + hx, y, z + hz, x + hx, y + s, z + hz, x - hx, y + s, z - hz);
      uv.push(u0, 0, u1, 0, u1, 1, u0, 1);
      col.push(tint[0] * .7, tint[1] * .7, tint[2] * .7, tint[0] * .7, tint[1] * .7, tint[2] * .7, tint[0], tint[1], tint[2], tint[0], tint[1], tint[2]);
      sw.push(0, 0, sway, sway); ind.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
  };
  for (let z = 0; z < CS; z++) for (let x = 0; x < CS; x++) {
    const wx = ox + x, wz = oz + z, hy = heightAt(wx, wz);
    if (hy + 1 >= CH || d[idx(x, hy, z)] !== GRASS || d[idx(x, hy + 1, z)] !== AIR) continue;
    if (ed && ed.has(idx(x, hy + 1, z))) continue;
    for (const p of plantsFor(wx, wz)) add(p[0], p[1], p[2], hy + 1, p[3], p[4], p[5], p[6]);
  }
  if (!ind.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('aSway', new THREE.Float32BufferAttribute(sw, 1));
  g.setIndex(ind); g.computeBoundingSphere(); g.boundingSphere.radius += 1;
  c.plants = new THREE.Mesh(g, plantMat); scene.add(c.plants);
}
const _bm = buildMesh; buildMesh = function (cx, cz) { _bm(cx, cz); buildPlants(cx, cz); };
const _rc = removeChunk; removeChunk = function (k) { const c = chunks.get(k); if (c && c.plants) { scene.remove(c.plants); c.plants.geometry.dispose(); } _rc(k); };

waterMat.onBeforeCompile = sh => {
  sh.uniforms.uTime = U.time;
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying vec3 vWp;')
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      float wv = sin(uTime * 1.5 + position.x * .9 + position.z * .7) * .035 + sin(uTime * 2.3 - position.x * .5 + position.z * 1.2) * .022;
      transformed.y += wv * step(.5, fract(position.y + .001));
      vWp = position;`);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\nuniform float uTime;\nvarying vec3 vWp;')
    .replace('#include <color_fragment>', `#include <color_fragment>
      float rip = sin(uTime * 1.3 + vWp.x * 2.1 + vWp.z * 1.4) * sin(uTime * .8 - vWp.x * 1.1 + vWp.z * 2.3);
      diffuseColor.rgb *= .93 + .07 * rip; diffuseColor.rgb += max(rip - .75, 0.) * .35;`);
};

const CLOUD = { Y: 84, CELL: 12, N: 17, H: 4 };
const cloudMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: .9, fog: false, depthWrite: false });
cloudMat.onBeforeCompile = sh => {
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;').replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.a *= 1.0 - smoothstep(110.0, 190.0, length(vWp.xz - cameraPosition.xz));');
};
let cloudMesh = null, cloudKey = '';
const cloudVal = (i, j) => fbm(i * .085 + 40, j * .085 + 90);
function buildClouds(ci, cj, thr) {
  const { CELL, N, H, Y } = CLOUD, p = [], c = [], ind = [], has = (i, j) => cloudVal(i, j) > thr, bump = (i, j) => cloudVal(i, j) > thr + .07;
  const box = (x0, y0, z0, w, h, d, faces) => {
    const x1 = x0 + w, y1 = y0 + h, z1 = z0 + d, Q = [
      [faces[0], [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], .86], [faces[1], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], .86],
      [1, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], 1], [1, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], .7],
      [faces[2], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], .8], [faces[3], [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], .8]];
    for (const q of Q) { if (!q[0]) continue; const b = p.length / 3; for (let k = 1; k <= 4; k++) { p.push(...q[k]); c.push(q[5], q[5], q[5]); } ind.push(b, b + 1, b + 2, b, b + 2, b + 3); }
  };
  for (let i = ci - N; i <= ci + N; i++) for (let j = cj - N; j <= cj + N; j++) {
    if (!has(i, j)) continue;
    box(i * CELL, Y, j * CELL, CELL, H, CELL, [!has(i + 1, j), !has(i - 1, j), !has(i, j + 1), !has(i, j - 1)]);
    if (bump(i, j)) box(i * CELL + 2, Y + H, j * CELL + 2, CELL - 4, 3, CELL - 4, [1, 1, 1, 1]);
  }
  if (cloudMesh) { scene.remove(cloudMesh); cloudMesh.geometry.dispose(); cloudMesh = null; }
  if (!ind.length) return;
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); g.setIndex(ind);
  cloudMesh = new THREE.Mesh(g, cloudMat); cloudMesh.frustumCulled = false; scene.add(cloudMesh);
}
function updateClouds(elev, warm) {
  const t = (Date.now() / 1000) % 100000, dx = t * 2.2, dz = t * .9, thr = Math.round((.60 - cloudy * .2) * 50) / 50;
  const ci = Math.floor((P.x - dx) / CLOUD.CELL), cj = Math.floor((P.z - dz) / CLOUD.CELL), key = ci + ',' + cj + ',' + thr;
  if (key !== cloudKey) { cloudKey = key; buildClouds(ci, cj, thr); }
  if (cloudMesh) cloudMesh.position.set(dx, 0, dz);
  const day = ss(-.12, .18, elev), gray = clamp(cloudy * .45 + rain * .4, 0, .85);
  let r = lerp(.11, 1, day), g = lerp(.13, 1, day), b = lerp(.22, 1, day);
  r = lerp(r, 1, warm * .55); g = lerp(g, .72, warm * .55); b = lerp(b, .55, warm * .55);
  const lum = lerp(.42, .55, day); cloudMat.color.setRGB(lerp(r, lum * (.4 + day * .6), gray), lerp(g, lum * (.43 + day * .6), gray), lerp(b, lum * (.5 + day * .55), gray));
  cloudMat.opacity = lerp(.88, .96, cloudy);
}

function mkTex(size, draw, linear) { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size); const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = linear ? THREE.LinearFilter : THREE.NearestFilter; t.generateMipmaps = false; return t; }
const sunTex = mkTex(128, (x, s) => {
  const g = x.createRadialGradient(s / 2, s / 2, s * .06, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,244,200,.85)'); g.addColorStop(.3, 'rgba(255,214,130,.28)'); g.addColorStop(1, 'rgba(255,190,90,0)');
  x.fillStyle = g; x.fillRect(0, 0, s, s); x.fillStyle = '#fff7d6'; x.fillRect(s * .37, s * .37, s * .26, s * .26);
}, true);
const moonTex = mkTex(64, (x, s) => {
  const g = x.createRadialGradient(s / 2, s / 2, s * .1, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(190,205,240,.35)'); g.addColorStop(1, 'rgba(190,205,240,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s);
  x.fillStyle = '#e4e9f5'; x.fillRect(s * .3, s * .3, s * .4, s * .4); x.fillStyle = '#b9c1d6';
  for (const [a, b, w, h] of [[.36, .4, .1, .08], [.52, .5, .12, .1], [.4, .6, .08, .06], [.58, .34, .06, .06]]) x.fillRect(s * a, s * b, s * w, s * h);
}, false);
const skyMat = (map, add) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
const sunM = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), skyMat(sunTex, true)), moonM = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), skyMat(moonTex, false));
sunM.frustumCulled = moonM.frustumCulled = false; scene.add(sunM, moonM);
const starGeo = new THREE.BufferGeometry(), sp = [], sc = [];
for (let i = 0; i < 700; i++) { const u = Math.random() * 2 - 1, a = Math.random() * TAU, r = Math.sqrt(1 - u * u), v = .7 + Math.random() * .3; sp.push(r * Math.cos(a) * 360, u * 360, r * Math.sin(a) * 360); sc.push(v, v, v * (.9 + Math.random() * .1)); }
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)); starGeo.setAttribute('color', new THREE.Float32BufferAttribute(sc, 3));
const starMat = new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false, fog: false });
const stars = new THREE.Points(starGeo, starMat); stars.frustumCulled = false; scene.add(stars);
const sdir = new THREE.Vector3();
function updateSky(elev) {
  const th = dayPhase() * TAU; sdir.set(Math.cos(th) * .92, Math.sin(th), .38).normalize();
  const cp = camera.position, vis = 1 - cloudy * .6 - rain * .3;
  sunM.position.copy(cp).addScaledVector(sdir, 330); sunM.quaternion.copy(camera.quaternion); sunM.material.opacity = ss(-.08, .06, elev) * vis;
  moonM.position.copy(cp).addScaledVector(sdir, -330); moonM.quaternion.copy(camera.quaternion); moonM.material.opacity = ss(.08, -.06, elev) * (1 - cloudy * .5);
  stars.position.copy(cp); stars.rotation.set(0, 0, dayPhase() * TAU); starMat.opacity = ss(.1, -.2, elev) * (1 - cloudy * .8) * (.85 + .15 * Math.sin(T * 2.3));
}

function makeSys(max, soft, add) {
  const s = { max, cur: 0, T3: new Float32Array(max * 3), C4: new Float32Array(max * 4), S1: new Float32Array(max) };
  for (const k of ['life', 'ml', 'vx', 'vy', 'vz', 'g', 'dr', 'bn', 'sw', 'ph', 'tw', 'cr', 'cg', 'cb', 'ca', 'sz']) s[k] = new Float32Array(max);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(s.T3, 3)); geo.setAttribute('pcolor', new THREE.BufferAttribute(s.C4, 4)); geo.setAttribute('size', new THREE.BufferAttribute(s.S1, 1));
  s.mat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 600 }, uSoft: { value: soft ? 1 : 0 }, uL: { value: 1 } },
    vertexShader: 'attribute vec4 pcolor; attribute float size; uniform float uScale; varying vec4 vC;\nvoid main(){ vC = pcolor; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv; gl_PointSize = clamp(size * uScale / max(-mv.z, .1), 1.0, 64.0); }',
    fragmentShader: 'uniform float uSoft; uniform float uL; varying vec4 vC;\nvoid main(){ float a = vC.a; if (uSoft > .5) { float r = length(gl_PointCoord - .5) * 2.0; if (r > 1.0) discard; a *= 1.0 - smoothstep(0.0, 1.0, r); } gl_FragColor = vec4(vC.rgb * uL, a); }',
    transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending
  });
  s.pts = new THREE.Points(geo, s.mat); s.pts.frustumCulled = false; scene.add(s.pts); s.geo = geo; return s;
}
const PIX = makeSys(1500, false, false), SOFT = makeSys(700, true, false), GLOW = makeSys(300, true, true);
function emit(s, x, y, z, vx, vy, vz, life, size, r, g, b, a, grav = 0, drag = 0, bounce = 0, sway = 0, twink = 0) {
  const i = s.cur; s.cur = (s.cur + 1) % s.max;
  s.T3[i * 3] = x; s.T3[i * 3 + 1] = y; s.T3[i * 3 + 2] = z; s.vx[i] = vx; s.vy[i] = vy; s.vz[i] = vz; s.life[i] = s.ml[i] = life; s.sz[i] = size;
  s.cr[i] = r; s.cg[i] = g; s.cb[i] = b; s.ca[i] = a; s.g[i] = grav; s.dr[i] = drag; s.bn[i] = bounce; s.sw[i] = sway; s.tw[i] = twink; s.ph[i] = Math.random() * TAU;
}
function stepSys(s, dt, soft) {
  const { T3, C4, S1 } = s;
  for (let i = 0; i < s.max; i++) {
    if (s.life[i] <= 0) continue;
    s.life[i] -= dt;
    if (s.life[i] <= 0) { S1[i] = 0; C4[i * 4 + 3] = 0; continue; }
    let x = T3[i * 3], y = T3[i * 3 + 1], z = T3[i * 3 + 2];
    s.vy[i] -= s.g[i] * dt; const f = Math.max(0, 1 - s.dr[i] * dt); s.vx[i] *= f; s.vz[i] *= f;
    if (s.tw[i]) s.vy[i] += Math.cos(T * 1.3 + s.ph[i]) * .5 * dt;
    if (s.sw[i]) { s.vx[i] += Math.sin(T * 2.3 + s.ph[i]) * s.sw[i] * dt; s.vz[i] += Math.cos(T * 1.9 + s.ph[i]) * s.sw[i] * dt; }
    let nx = x + s.vx[i] * dt, ny = y + s.vy[i] * dt, nz = z + s.vz[i] * dt;
    if (s.bn[i]) {
      if (solid(getBlock(Math.floor(x), Math.floor(ny), Math.floor(z)))) { s.vy[i] = s.vy[i] < 0 ? -s.vy[i] * .28 : 0; if (Math.abs(s.vy[i]) < .6) s.vy[i] = 0; s.vx[i] *= .7; s.vz[i] *= .7; ny = y; }
      if (solid(getBlock(Math.floor(nx), Math.floor(ny), Math.floor(z)))) { s.vx[i] *= -.4; nx = x; }
      if (solid(getBlock(Math.floor(nx), Math.floor(ny), Math.floor(nz)))) { s.vz[i] *= -.4; nz = z; }
    }
    T3[i * 3] = nx; T3[i * 3 + 1] = ny; T3[i * 3 + 2] = nz;
    const age = s.ml[i] - s.life[i];
    let a = s.ca[i] * Math.min(1, s.life[i] / (s.ml[i] * .4)) * (soft ? Math.min(1, age / .5) : 1);
    if (s.tw[i]) a *= .55 + .45 * Math.sin(T * s.tw[i] + s.ph[i]);
    C4[i * 4] = s.cr[i]; C4[i * 4 + 1] = s.cg[i]; C4[i * 4 + 2] = s.cb[i]; C4[i * 4 + 3] = a; S1[i] = s.sz[i];
  }
  s.geo.attributes.position.needsUpdate = s.geo.attributes.pcolor.needsUpdate = s.geo.attributes.size.needsUpdate = true;
}
const BC = { 8: [.63, .5, .31], 9: [.5, .5, .5], 10: [.62, .46, .28] };
const pickCol = id => COL[id] ? COL[id][Math.random() < .45 ? 0 : 1] : (BC[id] || [.5, .5, .5]);
function burst(x, y, z, id) {
  for (let i = 0; i < 16; i++) {
    const c = pickCol(id), v = .85 + Math.random() * .3;
    emit(PIX, x + Math.random(), y + Math.random(), z + Math.random(), rnd(-2.4, 2.4), rnd(1.5, 4), rnd(-2.4, 2.4), rnd(.7, 1.3), rnd(.07, .13), c[0] * v, c[1] * v, c[2] * v, 1, 16, 0, 1);
  }
}
const _sb = setBlock;
setBlock = function (x, y, z, b, send) {
  const old = getBlock(x, y, z), plant = b === AIR && old === AIR && plantCell(x, y, z);
  _sb(x, y, z, b, send);
  if (b === AIR && old > 0 && old !== WATER) burst(x, y, z, old);
  else if (plant) for (let i = 0; i < 9; i++) { const v = .8 + Math.random() * .4; emit(PIX, x + Math.random(), y + Math.random() * .7, z + Math.random(), rnd(-1.4, 1.4), rnd(1, 2.6), rnd(-1.4, 1.4), rnd(.5, .9), rnd(.05, .09), .3 * v, .62 * v, .17 * v, 1, 16, 0, 1); }
};
function footDust(n, strong) {
  const b = getBlock(Math.floor(P.x), Math.floor(P.y - .1), Math.floor(P.z)); if (b <= 0 || b === WATER) return;
  for (let i = 0; i < n; i++) {
    const c = pickCol(b), l = lightL;
    emit(SOFT, P.x + rnd(-.25, .25), P.y + .08, P.z + rnd(-.25, .25), rnd(-.5, .5) * (strong ? 2 : 1), rnd(.3, .9), rnd(-.5, .5) * (strong ? 2 : 1), rnd(.5, .9), rnd(.2, .34), c[0] * 1.1, c[1] * 1.1, c[2] * 1.1, .38, 0, 2.2);
    if (b === GRASS || b === DIRT || b === SAND) emit(PIX, P.x + rnd(-.2, .2), P.y + .05, P.z + rnd(-.2, .2), rnd(-1, 1), rnd(1.2, 2.4), rnd(-1, 1), rnd(.4, .7), .06, c[0], c[1], c[2], 1, 14, 0, 1);
  }
}
function waterSplash(n) { for (let i = 0; i < n; i++) emit(PIX, P.x + rnd(-.4, .4), Math.floor(P.y + .6) + .9, P.z + rnd(-.4, .4), rnd(-1.8, 1.8), rnd(2.2, 4.8), rnd(-1.8, 1.8), rnd(.5, .9), rnd(.06, .11), .75, .88, 1, .9, 14, 0, 0); }
let wasGround = false, wasWater = false, minVy = 0, stepAcc = 0, leafT = 0, pollenT = 0, flyT = 0;

const RN = 650, rainPos = new Float32Array(RN * 6), drops = Array.from({ length: RN }, () => ({ x: 0, y: -999, z: 0, fy: -999, v: rnd(20, 28), live: 0 }));
const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
const rainLines = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xbcd0ee, transparent: true, opacity: .42, depthWrite: false })); rainLines.frustumCulled = false; scene.add(rainLines);
function respawnDrop(d) {
  const a = Math.random() * TAU, r = Math.sqrt(Math.random()) * 14; d.x = P.x + Math.cos(a) * r; d.z = P.z + Math.sin(a) * r; d.y = P.y + rnd(2, 16);
  d.fy = groundHeightAt(Math.floor(d.x), Math.floor(d.z)); d.live = d.fy > d.y - 1 ? 0 : 1;
}
function updateRain(dt, underwater) {
  const active = underwater ? 0 : Math.floor(RN * clamp(rain * 1.1, 0, 1)); rainGeo.setDrawRange(0, active * 2);
  for (let i = 0; i < active; i++) {
    const d = drops[i], o = i * 6;
    if (!d.live) { if (Math.random() < .1) respawnDrop(d); rainPos[o + 1] = rainPos[o + 4] = -999; continue; }
    d.y -= d.v * dt;
    if (d.y <= d.fy) {
      if (Math.random() < .5 && Math.abs(d.x - P.x) < 9 && Math.abs(d.z - P.z) < 9) for (let k = 0; k < 2; k++) emit(PIX, d.x, d.fy + .05, d.z, rnd(-.7, .7), rnd(1.2, 2.4), rnd(-.7, .7), .35, .05, .78, .86, 1, .8, 12, 0, 0);
      respawnDrop(d); if (!d.live) { rainPos[o + 1] = rainPos[o + 4] = -999; continue; }
    }
    rainPos[o] = d.x; rainPos[o + 1] = d.y; rainPos[o + 2] = d.z; rainPos[o + 3] = d.x - .22; rainPos[o + 4] = d.y + .9; rainPos[o + 5] = d.z - .08;
  }
  rainGeo.attributes.position.needsUpdate = true;
}
document.body.insertAdjacentHTML('beforeend', '<div id="bolt" style="position:fixed;inset:0;background:#dfe8ff;opacity:0;pointer-events:none;z-index:14"></div>');
let nextBolt = 20;
function lightning() {
  flash = 1; setTimeout(() => { flash = .85; }, 140);
  const k = Math.random();
  setTimeout(() => { if (AC && AC.state === 'running') thunder(k); }, 350 + k * 2600);
}

const VOL = { rain: .55, wind: 1, thunder: 1 };
let AC = null, master = null, noiseBuf = null, snd = null, weatherAt = 0, lastTick = 0, covered = 0, dropAcc = 0, audAcc = 0;
function makeNoise(seconds) {
  const sr = AC.sampleRate, len = Math.floor(sr * seconds), fade = Math.floor(sr * .8), buf = AC.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const raw = new Float32Array(len + fade); let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < raw.length; i++) {
      const w = Math.random() * 2 - 1;
      b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852; b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898;
      raw[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926;
    }
    const o = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) o[i] = raw[i];
    for (let i = 0; i < fade; i++) { const a = i / fade * Math.PI / 2; o[i] = raw[i] * Math.sin(a) + raw[len + i] * Math.cos(a); }
  }
  return buf;
}
function initAudio() {
  if (AC) return;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
    master = AC.createGain(); master.gain.value = 0; master.connect(AC.destination);
    noiseBuf = makeNoise(8);
    const gain = (v, out) => { const g = AC.createGain(); g.gain.value = v; if (out) g.connect(out); return g; };
    const filt = (type, f, q, out) => { const n = AC.createBiquadFilter(); n.type = type; n.frequency.value = f; n.Q.value = q; if (out) n.connect(out); return n; };
    const loop = (rate, out) => { const s = AC.createBufferSource(); s.buffer = noiseBuf; s.loop = true; s.playbackRate.value = rate; s.connect(out); s.start(0, Math.random() * 6); };
    const bus = gain(0), lp = filt('lowpass', 16000, .5, master); bus.connect(lp);
    const bodyG = gain(.4, bus), hissG = gain(0, bus), windG = gain(0, master), windF = filt('lowpass', 400, 1.4, windG);
    loop(1, filt('bandpass', 1100, .45, bodyG));
    loop(1.35, filt('highpass', 4200, .7, hissG));
    loop(.7, windF);
    snd = { bus, lp, bodyG, hissG, windG, windF };
  } catch (e) { AC = null; }
}
addEventListener('pointerdown', initAudio, { once: true }); addEventListener('keydown', initAudio, { once: true });
addEventListener('click', () => { if (AC && AC.state === 'suspended' && !document.hidden) AC.resume(); });
document.addEventListener('visibilitychange', () => {
  if (!AC || !master) return;
  if (document.hidden) { master.gain.cancelScheduledValues(0); master.gain.value = 0; AC.suspend(); } else AC.resume();
});
setInterval(() => { if (AC && master && performance.now() - lastTick > 1500) master.gain.setTargetAtTime(0, AC.currentTime, .15); }, 500);

function patter(r, spread) {
  const t = AC.currentTime;
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain(), p = AC.createStereoPanner ? AC.createStereoPanner() : null;
  s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = rnd(1800, 6500); f.Q.value = rnd(1.5, 4);
  const t0 = t + Math.random() * spread, d = rnd(.012, .032);
  g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(rnd(.12, .45), t0 + .002); g.gain.exponentialRampToValueAtTime(.001, t0 + d);
  s.connect(f); f.connect(g); if (p) { p.pan.value = rnd(-1, 1); g.connect(p); p.connect(snd.bus); } else g.connect(snd.bus);
  s.start(t0, Math.random() * 6, d + .02);
}
function thunder(k) {
  const t = AC.currentTime, vol = (1 - k * .5) * VOL.thunder, out = AC.createGain(), p = AC.createStereoPanner ? AC.createStereoPanner() : null;
  out.gain.value = 1; if (p) { p.pan.value = rnd(-.8, .8); out.connect(p); p.connect(master); } else out.connect(master);
  if (k < .6) {
    const c = AC.createBufferSource(), cf = AC.createBiquadFilter(), cg = AC.createGain();
    c.buffer = noiseBuf; cf.type = 'bandpass'; cf.frequency.value = 1500 - k * 900; cf.Q.value = .7;
    cg.gain.setValueAtTime(0, t); cg.gain.linearRampToValueAtTime(.6 * vol * (1 - k), t + .01); cg.gain.exponentialRampToValueAtTime(.001, t + .35);
    c.connect(cf); cf.connect(cg); cg.connect(out); c.start(t, Math.random() * 5, .4);
  }
  const dur = 3.6 + k * 2.4, r = AC.createBufferSource(), rf = AC.createBiquadFilter(), rg = AC.createGain(), n = 56, curve = new Float32Array(n);
  r.buffer = noiseBuf; r.playbackRate.value = .65; rf.type = 'lowpass'; rf.Q.value = 1;
  rf.frequency.setValueAtTime(460 - k * 240, t); rf.frequency.exponentialRampToValueAtTime(70, t + dur);
  let sm = .7; for (let i = 0; i < n; i++) { sm += (Math.random() - sm) * .5; curve[i] = vol * 1.1 * (1 - Math.exp(-i / 2.5)) * Math.exp(-i / n * 3.4) * (.5 + .5 * sm); }
  rg.gain.value = 0; rg.gain.setValueCurveAtTime(curve, t, dur);
  r.connect(rf); rf.connect(rg); rg.connect(out); r.start(t, Math.random() * 5, dur + .1);
  const o = AC.createOscillator(), og = AC.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(58, t); o.frequency.exponentialRampToValueAtTime(32, t + 1.6);
  og.gain.setValueAtTime(0, t); og.gain.linearRampToValueAtTime(.45 * vol, t + .06); og.gain.exponentialRampToValueAtTime(.001, t + 1.8);
  o.connect(og); og.connect(out); o.start(t); o.stop(t + 1.9);
}
function audioTick(dt) {
  lastTick = performance.now();
  if (!AC || !snd || (audAcc += dt) < .1) return;
  const step = audAcc; audAcc = 0;
  const t = AC.currentTime, uw = getBlock(Math.floor(P.x), Math.floor(P.y + EYE), Math.floor(P.z)) === WATER, alive = lastTick - weatherAt < 1500;
  const under = groundHeightAt(Math.floor(P.x), Math.floor(P.z)) > P.y + 1.5 ? 1 : 0; covered += (under - covered) * Math.min(1, step * 3);
  const r = rain < .02 ? 0 : rain, mute = uw ? .2 : 1, gust = .5 + .5 * Math.sin(T * .23 + Math.sin(T * .07) * 3);
  master.gain.setTargetAtTime(alive ? 1 : 0, t, .35);
  snd.bus.gain.setTargetAtTime(Math.pow(r, 1.1) * VOL.rain * (1 - .4 * covered) * mute, t, .5);
  snd.bodyG.gain.setTargetAtTime(.25 + .55 * r, t, .5); snd.hissG.gain.setTargetAtTime(.04 + .22 * r * r, t, .5);
  snd.lp.frequency.setTargetAtTime(uw ? 350 : 16000 - covered * 14800, t, .3);
  snd.windG.gain.setTargetAtTime((.006 + .012 * gust + r * .04 + cloudy * .012) * VOL.wind * mute, t, .6);
  snd.windF.frequency.setTargetAtTime(uw ? 200 : 260 + 300 * gust + r * 250, t, .5);
  if (alive && r > 0 && !uw && AC.state === 'running') {
    dropAcc += step * (8 + 42 * r) * (1 - .5 * covered); const n = Math.floor(dropAcc); dropAcc -= n;
    for (let i = 0; i < Math.min(n, 12); i++) patter(r, step);
  } else dropAcc = 0;
}

const wingGeo = new THREE.PlaneGeometry(.2, .16); wingGeo.rotateX(-Math.PI / 2); wingGeo.translate(.1, 0, 0);
const bodyGeo = new THREE.BoxGeometry(.03, .03, .14), bodyMat = new THREE.MeshBasicMaterial({ color: 0x2a2018 }), flies = [];
function spawnButterfly() {
  const a = Math.random() * TAU, d = rnd(8, 18), x = P.x + Math.cos(a) * d, z = P.z + Math.sin(a) * d, gy = groundHeightAt(Math.floor(x), Math.floor(z));
  if (getBlock(Math.floor(x), gy - 1, Math.floor(z)) !== GRASS) return;
  const hues = [.08, .13, .58, .95, 0], m = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(hues[(Math.random() * hues.length) | 0], .85, .58), side: THREE.DoubleSide });
  const g = new THREE.Group(), w1 = new THREE.Mesh(wingGeo, m), w2 = new THREE.Mesh(wingGeo, m); w2.scale.x = -1; g.add(w1, w2, new THREE.Mesh(bodyGeo, bodyMat));
  g.position.set(x, gy + 1, z); scene.add(g); flies.push({ g, w1, w2, m, tx: x, ty: gy + 1.2, tz: z, t: 0, ph: Math.random() * TAU, sp: rnd(.8, 1.5) });
}
function updateButterflies(dt, want) {
  if (flies.length < want && Math.random() < dt * .6) spawnButterfly();
  for (let i = flies.length - 1; i >= 0; i--) {
    const f = flies[i], g = f.g, far = Math.hypot(g.position.x - P.x, g.position.z - P.z) > 28;
    if (far || flies.length > want + 1) { scene.remove(g); f.m.dispose(); flies.splice(i, 1); continue; }
    f.t -= dt; if (f.t <= 0) { f.t = rnd(1.5, 3.5); f.tx = g.position.x + rnd(-5, 5); f.tz = g.position.z + rnd(-5, 5); f.ty = groundHeightAt(Math.floor(f.tx), Math.floor(f.tz)) + rnd(.6, 2.2); }
    const dx = f.tx - g.position.x, dz = f.tz - g.position.z, dy = f.ty - g.position.y, l = Math.hypot(dx, dy, dz) || 1;
    g.position.x += dx / l * f.sp * dt; g.position.z += dz / l * f.sp * dt; g.position.y += dy / l * f.sp * dt + Math.sin(T * 5 + f.ph) * .012;
    g.rotation.y += (Math.atan2(dx, dz) - g.rotation.y) * Math.min(1, 4 * dt);
    const fl = Math.sin(T * 24 + f.ph) * .9 + .35; f.w1.rotation.z = fl; f.w2.rotation.z = -fl;
  }
}

const tmpC = new THREE.Color(), orange = new THREE.Color(0xf2894a), grayC = new THREE.Color(0x5b6572), white = new THREE.Color(0xdfe8ff);
const _st = survivalTick;
survivalTick = function (dt) {
  _st(dt);
  try { atmoTick(dt); } catch (e) { if (!atmoTick.warned) { atmoTick.warned = 1; console.error('atmosphere:', e); } }
  try { audioTick(dt); } catch (e) { if (!audioTick.warned) { audioTick.warned = 1; console.error('audio:', e); } }
};
function atmoTick(dt) {
  T += dt; U.time.value = T; U.player.value.set(P.x, P.y, P.z);
  const elev = elevNow(), L0 = Math.max(.2, Math.min(1, .55 + elev * .7)), w = vnoise(Date.now() / 150000, 3.7);
  const [rT, cT] = weatherTarget(Date.now() / 1000);
  cloudy += (Math.max(cT, .6 * ss(.45, .7, w)) - cloudy) * Math.min(1, dt * .3); rain += (rT - rain) * Math.min(1, dt * .3);
  U.wind.value = 1 + rain * 1.2 + cloudy * .3;
  weatherAt = performance.now();
  const warm = Math.pow(clamp(1 - Math.abs(elev) / .3, 0, 1), 1.6), underwater = getBlock(Math.floor(P.x), Math.floor(P.y + EYE), Math.floor(P.z)) === WATER;
  if (rain > .85 && T > nextBolt) { nextBolt = T + rnd(14, 40); lightning(); } flash *= Math.pow(.015, dt); if (flash < .01) flash = 0;
  document.getElementById('bolt').style.opacity = flash * .35;
  if (typeof S === 'undefined' || !S.dead) {
  tmpC.setHex(skyHex).lerp(orange, warm * .55 * (1 - rain * .7)).lerp(grayC, clamp(cloudy * .35 + rain * .35, 0, .7) * ss(-.15, .2, elev) + clamp(cloudy * .25 + rain * .3, 0, .6) * (1 - ss(-.15, .2, elev)) * .4);
    tmpC.multiplyScalar(1 - rain * .12).lerp(white, flash * .6); skyHex = tmpC.getHex();
    lightL = clamp(L0 * (1 - cloudy * .1 - rain * .22) + flash * .7, .2, 1); setLight(lightL);
  }
  updateSky(elev); updateClouds(elev, warm); updateRain(dt, underwater);
  const sc = renderer.domElement.height / (2 * Math.tan(camera.fov * Math.PI / 360)), ul = Math.max(.28, lightL);
  for (const s of [PIX, SOFT]) { s.mat.uniforms.uScale.value = sc; s.mat.uniforms.uL.value = ul; } GLOW.mat.uniforms.uScale.value = sc;
  if (!P.ground) minVy = Math.min(minVy, P.vy || 0);
  if (P.ground && !wasGround) { if (minVy < -6) footDust(Math.min(14, 5 + Math.floor(-minVy)), true); minVy = 0; }
  if (P.inWater && !wasWater && minVy < -3) { waterSplash(Math.min(30, 10 + Math.floor(-minVy * 2))); minVy = 0; }
  if (P.inWater && (P.moveSpd || 0) > 1 && !underwater && Math.random() < dt * 9) waterSplash(1);
  wasGround = P.ground; wasWater = P.inWater;
  if (P.ground && (P.moveSpd || 0) > .8) { stepAcc += (P.moveSpd) * dt; if (stepAcc > (P.sprint ? 1.9 : 1.45)) { stepAcc = 0; footDust(P.sprint ? 3 : 2, false); } }
  if (typeof hold !== 'undefined' && hold && mt && !invOpen && Math.random() < dt * 16) {
    const b = getBlock(mt.x, mt.y, mt.z), c = pickCol(b), d = new THREE.Vector3(camera.position.x - mt.x - .5, camera.position.y - mt.y - .5, camera.position.z - mt.z - .5).normalize();
    emit(PIX, mt.x + .5 + d.x * .52 + rnd(-.3, .3), mt.y + .5 + d.y * .52 + rnd(-.3, .3), mt.z + .5 + d.z * .52 + rnd(-.3, .3), d.x * 1.2 + rnd(-1, 1), rnd(.8, 2.2), d.z * 1.2 + rnd(-1, 1), rnd(.5, .9), rnd(.05, .09), c[0], c[1], c[2], 1, 14, 0, 1);
  }
  if (underwater && Math.random() < dt * (typeof S !== 'undefined' && S.air < 4 ? 10 : 3)) { const cp = camera.position; emit(SOFT, cp.x + rnd(-.5, .5), cp.y + rnd(-.4, .2), cp.z + rnd(-.5, .5), 0, rnd(.7, 1.3), 0, 1.8, .07, .8, .92, 1, .5, 0, .3, 0, .5); }
  const day = ss(.0, .25, elev) * (1 - rain);
  pollenT += dt * day * 7; while (pollenT > 1) { pollenT--; const a = Math.random() * TAU, r = rnd(2, 13), x = P.x + Math.cos(a) * r, z = P.z + Math.sin(a) * r, gy = groundHeightAt(Math.floor(x), Math.floor(z)); if (gy > 0 && getBlock(Math.floor(x), gy - 1, Math.floor(z)) !== WATER) emit(SOFT, x, gy + rnd(.3, 2.8), z, .22 * U.wind.value, rnd(-.05, .08), .08, rnd(8, 14), rnd(.04, .07), 1, .96, .78, .55, 0, .3, 0, .25); }
  const night = ss(.08, -.12, elev) * (1 - rain);
  flyT += dt * night * 5; while (flyT > 1) { flyT--; const a = Math.random() * TAU, r = rnd(3, 14), x = P.x + Math.cos(a) * r, z = P.z + Math.sin(a) * r, gy = groundHeightAt(Math.floor(x), Math.floor(z)); if (getBlock(Math.floor(x), gy - 1, Math.floor(z)) === GRASS) emit(GLOW, x, gy + rnd(.4, 2), z, rnd(-.3, .3), rnd(-.1, .15), rnd(-.3, .3), rnd(10, 16), rnd(.1, .15), .75, 1, .3, .85, 0, .6, 0, 1.4, 3.2); }
  for (let k = 0; k < 6; k++) {
    const x = Math.floor(P.x + rnd(-16, 16)), z = Math.floor(P.z + rnd(-16, 16)), y = Math.floor(P.y + rnd(-6, 14));
    if (getBlock(x, y, z) === LEAVES && getBlock(x, y - 1, z) === AIR && Math.random() < .045) { const g = Math.random() < .25 ? [.72, .55, .12] : [.2 + Math.random() * .12, .5 + Math.random() * .12, .1]; emit(PIX, x + Math.random(), y, z + Math.random(), rnd(-.2, .2), -rnd(.6, 1.1), rnd(-.2, .2), rnd(5, 9), .09, g[0], g[1], g[2], 1, 0, 1.2, 1, 1.6); }
  }
  stepSys(PIX, dt, false); stepSys(SOFT, dt, true); stepSys(GLOW, dt, true);
  updateButterflies(dt, (day > .6 && !underwater) ? 5 : 0);
}
const _r2 = renderer.render;
renderer.render = function (s, c) { if (s === scene && scene.fog && scene.fog.near > 5) { const k = 1 - rain * .38 - cloudy * .08; scene.fog.near *= k; scene.fog.far *= k; } return _r2.call(this, s, c); };
Object.assign(window, { BC, PIX, SOFT, emit, rnd });
})();