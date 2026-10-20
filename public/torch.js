
const FLAME_N = 8;
const flameTex = Array.from({ length: FLAME_N }, (_, f) => {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const x = c.getContext('2d'), r = rng(900 + f * 53), sway = (r() - .5) * 2.6, hh = 10.5 + r() * 3.5;
  for (let y = 0; y < 16; y++) {
    const t = (15 - y) / hh; if (t > 1) continue;
    const w = (t < .2 ? 2.6 + t * 6 : 3.8 * Math.pow(1 - (t - .2) / .8, .9)) + .5, cx = 7.5 + sway * t * t + (r() - .5) * .9 * t;
    for (let px = 0; px < 16; px++) {
      const d = Math.abs(px - cx) / w + (r() - .5) * .3; if (d >= 1) continue;
      if (d > .86 && r() < .45) continue;
      x.fillStyle = `rgb(${d < .38 && t < .7 ? '255,244,176' : d < .68 && t < .9 ? '255,198,62' : t > .75 ? '226,78,20' : '248,122,26'})`; x.fillRect(px, y, 1, 1);
    }
  }
  const tx = new THREE.CanvasTexture(c); tx.magFilter = tx.minFilter = THREE.NearestFilter; tx.generateMipmaps = false; return tx;
});
const haloTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,190,90,.9)'); gr.addColorStop(.35, 'rgba(255,130,40,.35)'); gr.addColorStop(1, 'rgba(255,90,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const flamePlane = new THREE.PlaneGeometry(.34, .34).translate(0, .17, 0);
function makeFlame(haloK) {
  const mat = new THREE.MeshBasicMaterial({ map: flameTex[0], transparent: true, alphaTest: .35, side: THREE.DoubleSide, depthWrite: false });
  const a = new THREE.Mesh(flamePlane, mat), b = new THREE.Mesh(flamePlane, mat); b.rotation.y = Math.PI / 2;
  const g = new THREE.Group(); g.add(a, b);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .5 }));
  halo.position.y = .16; halo.scale.setScalar(haloK);
  const root = new THREE.Group(); root.add(g, halo);
  return { root, g, mat, halo, haloK, seed: Math.random() * 100 };
}
function flameAnim(F, time, k) {
  const s = time * 11 + F.seed, f = Math.floor(s), q = Math.sin(f * 91.7 + F.seed) * 43758.5453;
  F.mat.map = flameTex[Math.floor((q - Math.floor(q)) * FLAME_N) % FLAME_N];
  const fl = 1 + .09 * Math.sin(time * 17 + F.seed) + .05 * Math.sin(time * 29 + F.seed * 2);
  F.g.scale.set(k * (1 + .05 * Math.sin(time * 23 + F.seed)), k * fl, k);
  F.halo.scale.setScalar(F.haloK * (1 + .12 * Math.sin(time * 13 + F.seed) + .06 * Math.sin(time * 31)));
  F.halo.material.opacity = .42 + .13 * Math.sin(time * 19 + F.seed);
}

const handTorch = new THREE.Group(), hFlame = makeFlame(.6);
handTorch.add(bx(.09, .42, .09, lit(0x8a6035), 0, .21, 0), bx(.1, .07, .1, lit(0x2a1d14), 0, .45, 0));
hFlame.root.position.set(0, .47, 0); handTorch.add(hFlame.root);
handTorch.position.set(0, -.04, -.06); handTorch.rotation.set(-.3, 0, .2);

const isTorch = b => b >= 12 && b <= 16;
const TORCH_WALL = { 13: [1, 0], 14: [-1, 0], 15: [0, 1], 16: [0, -1] };
const TH = .625, TW = .0625, WOOD_C = [.58, .4, .2], CHAR_C = [.16, .11, .08];
BC[11] = [.3, .3, .32]; for (let i = 12; i <= 16; i++) BC[i] = [.75, .5, .24];
const torchMat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }); torchMat.userData.min = .75; litMats.push(torchMat);

function torchFrame(x, y, z, t) {
  let B, d;
  if (t === 12) { B = [x + .5, y, z + .5]; d = [0, 1, 0]; }
  else { const [nx, nz] = TORCH_WALL[t], s = Math.sin(.5), c = Math.cos(.5); B = [x + .5 - nx * .4, y + .22, z + .5 - nz * .4]; d = [nx * s, c, nz * s]; }
  let a = Math.abs(d[1]) > .999 ? [1, 0, 0] : [-d[2], 0, d[0]]; const n = Math.hypot(a[0], a[1], a[2]); a = a.map(v => v / n);
  const b = [d[1] * a[2] - d[2] * a[1], d[2] * a[0] - d[0] * a[2], d[0] * a[1] - d[1] * a[0]];
  return { B, d, a, b, tip: [B[0] + d[0] * TH, B[1] + d[1] * TH, B[2] + d[2] * TH] };
}
const TFACES = [[[4, 6, 7, 5], .8], [[0, 2, 3, 1], .6], [[2, 6, 7, 3], .72], [[0, 4, 5, 1], .68], [[1, 5, 7, 3], 1]];
function torchBox(pos, col, ind, F, h0, h1, hw, c) {
  const { B, d, a, b } = F, V = [];
  for (let sx = 0; sx < 2; sx++) for (let sz = 0; sz < 2; sz++) for (let h = 0; h < 2; h++) {
    const hh = h ? h1 : h0, ka = sx ? hw : -hw, kb = sz ? hw : -hw;
    V.push([0, 1, 2].map(i => B[i] + a[i] * ka + b[i] * kb + d[i] * hh));
  }
  for (const [q, s] of TFACES) { const base = pos.length / 3; q.forEach(i => { pos.push(...V[i]); col.push(c[0] * s, c[1] * s, c[2] * s); }); ind.push(base, base + 1, base + 2, base, base + 2, base + 3); }
}
function buildTorches(cx, cz) {
  const c = chunks.get(ck(cx, cz)); if (!c) return;
  if (c.torchM) { scene.remove(c.torchM); c.torchM.geometry.dispose(); c.torchM = null; }
  c.torches = []; const ed = editsByChunk.get(ck(cx, cz)); if (!ed) return;
  const ox = cx * CS, oz = cz * CS, pos = [], col = [], ind = [];
  for (const [i, b] of ed) {
    if (!isTorch(b) || c.data[i] !== b) continue;
    const x = i % CS, z = ((i / CS) | 0) % CS, y = (i / (CS * CS)) | 0, wx = ox + x, wz = oz + z, F = torchFrame(wx, y, wz, b);
    c.torches.push({ tip: F.tip, ph: hash(wx, y, wz) * 50 });
    torchBox(pos, col, ind, F, 0, TH * .86, TW, WOOD_C); torchBox(pos, col, ind, F, TH * .86, TH, TW * 1.12, CHAR_C);
  }
  if (!ind.length) return;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(ind); g.computeBoundingSphere();
  c.torchM = new THREE.Mesh(g, torchMat); scene.add(c.torchM);
}
const _bm3 = buildMesh; buildMesh = function (cx, cz) { _bm3(cx, cz); buildTorches(cx, cz); };
const _rc3 = removeChunk; removeChunk = function (k) { const c = chunks.get(k); if (c && c.torchM) { scene.remove(c.torchM); c.torchM.geometry.dispose(); } _rc3(k); };

const TL_N = 12, tlU = { value: Array.from({ length: TL_N }, () => new THREE.Vector4(0, 0, 0, 0)) };
solidMat.onBeforeCompile = sh => {
  sh.uniforms.uTL = tlU;
  sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWp = (modelMatrix * vec4(transformed, 1.0)).xyz;');
  sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWp; uniform vec4 uTL[12];').replace('#include <color_fragment>', `
    vec3 tex0 = diffuseColor.rgb / max(diffuse, vec3(.001));
    vec3 tl = vec3(0.0);
    for (int i = 0; i < 12; i++) { vec4 q = uTL[i]; if (q.w > 0.0) { float a = max(0.0, 1.0 - distance(vWp, q.xyz) / q.w); tl += a * a; } }
    float nt = clamp(1.3 - diffuse.r * 1.15, .1, 1.0);
    diffuseColor.rgb = tex0 * (diffuse * vColor + min(tl, 1.15) * nt * vec3(1.0, .62, .27));`);
};

function torchSupported(x, y, z, t) { if (t === 12) return solid(getBlock(x, y - 1, z)); const n = TORCH_WALL[t]; return solid(getBlock(x - n[0], y, z - n[1])); }
function placeTorch(r) {
  if (!r) return;
  let x, y, z, t;
  if (r.plant) { x = r.x; y = r.y; z = r.z; t = 12; }
  else { x = r.px; y = r.py; z = r.pz; const nx = x - r.x, ny = y - r.y, nz = z - r.z; t = ny > 0 ? 12 : ny < 0 ? 0 : nx > 0 ? 13 : nx < 0 ? 14 : nz > 0 ? 15 : 16; }
  if (!t || getBlock(x, y, z) !== AIR || !torchSupported(x, y, z, t)) return;
  const h = held(); setBlock(x, y, z, t, true); swingHand(); if (--h.n <= 0) inv.slots[inv.sel] = null; uiDirty = true;
}
const _sb3 = setBlock;
setBlock = function (x, y, z, b, send) {
  _sb3(x, y, z, b, send);
  if (!send || solid(b)) return;
  for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
    const nx = x + dx, ny = y + dy, nz = z + dz, t = getBlock(nx, ny, nz);
    if (isTorch(t) && !torchSupported(nx, ny, nz, t)) { setBlock(nx, ny, nz, AIR, true); dropItem(TORCH_ITEM, 1, nx + .5, ny + .5, nz + .5); }
  }
};

const POOL = Array.from({ length: 18 }, () => { const F = makeFlame(1.7); F.root.visible = false; scene.add(F.root); return F; });
const _h = new THREE.Vector3(), _v = new THREE.Vector3(), _dd = new THREE.Vector3(); let tclock = 0;
function handFlameWorld(out) {
  hFlame.root.getWorldPosition(_v); _v.project(handCam);
  _dd.set(_v.x, _v.y, .5).unproject(camera).sub(camera.position).normalize();
  return out.copy(camera.position).addScaledVector(_dd, .9);
}
function torchTick(dt) {
  tclock += dt;
  const near = [];
  for (const c of chunks.values()) if (c.torches) for (const t of c.torches) { const dx = t.tip[0] - P.x, dy = t.tip[1] - P.y, dz = t.tip[2] - P.z, d2 = dx * dx + dy * dy + dz * dz; if (d2 < 1024) near.push([d2, t]); }
  near.sort((p, q) => p[0] - q[0]);
  const hd = held(), hand = !!hd && hd.id === TORCH_ITEM && !S.dead; let li = 0;
  if (hand) {
    handFlameWorld(_h);
    tlU.value[li++].set(_h.x, _h.y, _h.z, 7.5 * (1 + .06 * Math.sin(tclock * 14) + .04 * Math.sin(tclock * 33)));
    if (Math.random() < dt * 5) emit(PIX, _h.x + rnd(-.03, .03), _h.y + .02, _h.z + rnd(-.03, .03), rnd(-.25, .25), rnd(.5, 1.2), rnd(-.25, .25), rnd(.4, .9), rnd(.008, .014), 1, rnd(.55, .85), .2, 1, 0, 0, 0, 1.2);
  }
  for (let i = 0; i < POOL.length; i++) {
    const F = POOL[i], e = near[i];
    if (!e) { F.root.visible = false; continue; }
    const t = e[1], tp = t.tip; F.seed = t.ph; F.root.visible = true; F.root.position.set(tp[0], tp[1] - .02, tp[2]); flameAnim(F, tclock, 1);
    if (li < TL_N) tlU.value[li++].set(tp[0], tp[1] + .1, tp[2], 9 * (1 + .07 * Math.sin(tclock * 13 + t.ph) + .04 * Math.sin(tclock * 31 + t.ph * 2)));
    if (i < 10) {
      if (Math.random() < dt * 3) emit(PIX, tp[0] + rnd(-.05, .05), tp[1] + .12, tp[2] + rnd(-.05, .05), rnd(-.2, .2), rnd(.6, 1.4), rnd(-.2, .2), rnd(.5, 1.1), rnd(.03, .055), 1, rnd(.55, .85), .2, 1, 0, 0, 0, 1.2);
      if (Math.random() < dt * 1.1) emit(SOFT, tp[0], tp[1] + .3, tp[2], rnd(-.05, .05), rnd(.3, .6), rnd(-.05, .05), rnd(1, 1.8), rnd(.14, .2), .3, .3, .3, .22, 0, .5, 0, .6);
    }
  }
  for (; li < TL_N; li++) tlU.value[li].w = 0;
}
const _st3 = survivalTick;
survivalTick = function (dt) { _st3(dt); try { torchTick(dt); } catch (e) { if (!torchTick.w) { torchTick.w = 1; console.error('torch:', e); } } };