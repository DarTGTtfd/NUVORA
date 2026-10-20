const SPAWN = { x: 8, z: 8 };
const tstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const tlerp = (a, b, t) => a + (b - a) * t;
function tn(x, z, s) {
  const xi = Math.floor(x), zi = Math.floor(z), u = smooth(x - xi), v = smooth(z - zi);
  const a = hash(xi, zi, s), b = hash(xi + 1, zi, s), c = hash(xi, zi + 1, s), d = hash(xi + 1, zi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function tf(x, z, s, oct) {
  let a = .5, f = 1, sum = 0, w = 0;
  for (let i = 0; i < oct; i++) { sum += a * tn(x * f, z * f, s + i); w += a; a *= .5; f *= 2.03; }
  return sum / w;
}
function tn3(x, y, z, s) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), u = smooth(x - xi), v = smooth(y - yi), w = smooth(z - zi), o = s * 977;
  const h = (a, b, c) => hash(xi + a + o, yi + b, zi + c), l = (p, q, t) => p + (q - p) * t;
  return l(l(l(h(0, 0, 0), h(1, 0, 0), u), l(h(0, 1, 0), h(1, 1, 0), u), v), l(l(h(0, 0, 1), h(1, 0, 1), u), l(h(0, 1, 1), h(1, 1, 1), u), v), w);
}

const spawnDist = (x, z) => Math.hypot(x - SPAWN.x, z - SPAWN.z);
function lakeAt(x, z) {
  const d = tstep(36, 90, spawnDist(x, z)); if (d <= 0) return 0;
  return d * tstep(LAKE_T[0], LAKE_T[1], tf(x / 110, z / 110, 4101, 2));
}
function mountainAt(x, z) {
  const d = tstep(45, 100, spawnDist(x, z)); if (d <= 0) return 0;
  return d * tstep(MOUNT_T[0], MOUNT_T[1], tf(x / 240, z / 240, 4201, 2));
}
function forestAt(x, z, mk = mountainAt(x, z), lk = lakeAt(x, z)) {
  const far = tstep(FOREST_FAR[0], FOREST_FAR[1], spawnDist(x, z)); if (far <= 0) return 0;
  return far * tstep(FOREST_T[0], FOREST_T[1], tf(x / 150, z / 150, 4401, 2)) * (1 - tstep(.08, .3, mk)) * (1 - tstep(.1, .5, lk));
}
const LAKE_T = [.34, .24], MOUNT_T = [.70, .79], FOREST_T = [.74, .82], FOREST_FAR = [190, 280];
function biomeName(x, z) {
  if (forestAt(x, z) > .45) return 'Giant Forest';
  if (mountainAt(x, z) > .3) return 'Mountains';
  if (lakeAt(x, z) > .35) return 'Lake';
  return 'Plains';
}

function heightAt(x, z) {
  const mk = mountainAt(x, z), lk = lakeAt(x, z), fw = forestAt(x, z, mk, lk);
  const rolling = tf(x / 80, z / 80, 4301, 3);
  let h = 24 + (rolling - .5) * 13 + (tn(x / 17, z / 17, 4302) - .5) * 2;
  if (fw > 0) h = tlerp(h, 25 + (rolling - .5) * 5, fw * .8);
  if (mk > 0) {
    const ridge = 1 - Math.abs(tf(x / 40, z / 40, 4303, 2) * 2 - 1);
    h += mk * (9 + ridge * ridge * 24 + tn(x / 9, z / 9, 4304) * 5);
  }
  if (lk > 0) h = tlerp(h, SEA - 2 - lk * 5, Math.min(1, lk * 1.15));
  if (h > 46) h = 46 + (h - 46) * .55;
  return Math.max(4, Math.min(CH - 6, Math.floor(h)));
}

function caveAt(x, y, z, h) {
  const dep = h - y, w = .03 + Math.min(dep, 24) * .0007;
  if (Math.abs(tn3(x / 24, y / 14, z / 24, 1) - .5) < w && Math.abs(tn3(x / 24 + 40, y / 14, z / 24 - 40, 2) - .5) < w) return true;
  if (dep > 6 && y > 5 && tn3(x / 30, y / 9, z / 30, 3) > CAVERN_T) return true;
  return false;
}
let CAVERN_T = .83;

function coalAt(x, y, z, dp) {
  const t = .88 - Math.min(dp, 28) * .0021;
  return tn3(x / 2.6, y / 2.6, z / 2.6, 11) > t && hash(x, y * 3 + 1, z + 7) > .12;
}

function genChunk(cx, cz) {
  const data = new Uint8Array(CS * CH * CS), ox = cx * CS, oz = cz * CS, N = CS + 2;
  const hm = new Int16Array(N * N);
  for (let z = -1; z <= CS; z++) for (let x = -1; x <= CS; x++) hm[(z + 1) * N + x + 1] = heightAt(ox + x, oz + z);
  const H = (x, z) => hm[(z + 1) * N + x + 1];
  for (let z = 0; z < CS; z++) for (let x = 0; x < CS; x++) {
    const wx = ox + x, wz = oz + z, h = H(x, z), mk = mountainAt(wx, wz), beach = h <= SEA + 1;
    const slope = Math.max(Math.abs(h - H(x - 1, z)), Math.abs(h - H(x + 1, z)), Math.abs(h - H(x, z - 1)), Math.abs(h - H(x, z + 1)));
    const rock = !beach && mk > .1 && (h >= 44 || slope >= 3);
    const mouth = h > SEA + 4 && tn(wx / 34, wz / 34, 4601) > .86;
    const crust = h <= SEA + 2 ? 4 : (mk > .2 || mouth) ? 0 : 3;
    for (let y = 0; y <= Math.max(h, SEA); y++) {
      let b;
      if (y > h) b = WATER;
      else if (y === h) b = beach ? SAND : rock ? STONE : GRASS;
      else if (y > h - 4) b = beach ? SAND : rock ? STONE : DIRT;
      else b = STONE;
      if (b === STONE && y >= 2 && h - y >= (mk > .1 ? 2 : 5) && coalAt(wx, y, wz, h - y)) b = COAL_ORE;
      if (y <= h && y >= 3 && y <= h - crust && caveAt(wx, y, wz, h)) b = AIR;
      data[idx(x, y, z)] = b;
    }
  }

  const put = (x, y, z, b, onlyAir) => {
    const lx = x - ox, lz = z - oz;
    if (lx < 0 || lx >= CS || lz < 0 || lz >= CS || y < 1 || y >= CH) return;
    const i = idx(lx, y, lz);
    if (!onlyAir || data[i] === AIR) data[i] = b;
  };
  const blob = (bx, by, bz, rx, ry, rz) => {
    if (bx + rx < ox || bx - rx >= ox + CS || bz + rz < oz || bz - rz >= oz + CS) return;
    const ax = Math.ceil(rx), ay = Math.ceil(ry), az = Math.ceil(rz);
    for (let dy = -ay; dy <= ay; dy++) for (let dz = -az; dz <= az; dz++) for (let dx = -ax; dx <= ax; dx++) {
      const d = (dx / rx) ** 2 + (dy / ry) ** 2 + (dz / rz) ** 2;
      if (d > 1) continue;
      const x = bx + dx, y = by + dy, z = bz + dz;
      if (d > .66 && hash(x * 5 + 1, y * 3 + 2, z * 7 + 3) < .26) continue;
      put(x, y, z, LEAVES, true);
    }
  };
  const inChunk = (x, z) => x >= ox && x < ox + CS && z >= oz && z < oz + CS;

  const giant = (tx, tz, h) => {
    const Ht = Math.min(15 + Math.floor(hash(tx, tz, 8101) * 9), CH - 9 - h); if (Ht < 8) return;
    const top = h + Ht, split = h + Math.floor(Ht * .62);
    for (let y = h - 2; y <= top; y++) { put(tx, y, tz, WOOD); if (y <= split) { put(tx + 1, y, tz, WOOD); put(tx, y, tz + 1, WOOD); put(tx + 1, y, tz + 1, WOOD); } }
    for (const [a, b] of [[-1, 0], [-1, 1], [2, 0], [2, 1], [0, -1], [1, -1], [0, 2], [1, 2]]) {
      const px = tx + a, pz = tz + b; if (!inChunk(px, pz) || hash(px, pz, 8102) > .6) continue;
      const g = H(px - ox, pz - oz), rh = hash(px, pz, 8103) < .35 ? 2 : 1;
      for (let y = g; y <= g + rh; y++) put(px, y, pz, WOOD);
    }
    for (let dz = -4; dz <= 5; dz++) for (let dx = -4; dx <= 5; dx++) {
      const x = tx + dx, z = tz + dz; if (!inChunk(x, z)) continue;
      const dd = Math.hypot(dx - .5, dz - .5); if (dd > 4.2 || hash(x, z, 8104) < dd / 4.6) continue;
      const i = idx(x - ox, H(x - ox, z - oz), z - oz); if (data[i] === GRASS) data[i] = DIRT;
    }
    const nb = 2 + Math.floor(hash(tx, tz, 8105) * 3);
    for (let n = 0; n < nb; n++) {
      const a = hash(tx, tz, 8110 + n) * 6.283, ca = Math.cos(a), sa = Math.sin(a), y0 = h + Math.floor(Ht * (.45 + .3 * hash(tx, tz, 8120 + n))), L = 3 + Math.floor(hash(tx, tz, 8130 + n) * 3);
      let bx = tx, bz = tz, by = y0;
      for (let s = 1; s <= L; s++) { bx = tx + Math.round(ca * s); bz = tz + Math.round(sa * s); by = y0 + Math.floor(s * .5); put(bx, by, bz, WOOD); }
      blob(bx, by + 1, bz, 3.4, 2.4, 3.4);
    }
    blob(tx, top - 1, tz, 6.2, 3.6, 6.2); blob(tx, top + 2, tz, 4.2, 2.6, 4.2); blob(tx, top - 4, tz, 5.4, 2.2, 5.4);
    const nl = 3 + Math.floor(hash(tx, tz, 8140) * 3);
    for (let n = 0; n < nl; n++) { const a = hash(tx, tz, 8150 + n) * 6.283; blob(tx + Math.round(Math.cos(a) * 4.4), top - 1 - Math.floor(hash(tx, tz, 8160 + n) * 3), tz + Math.round(Math.sin(a) * 4.4), 3.4, 2.4, 3.4); }
  };
  const medium = (tx, tz, h) => {
    const top = h + 9 + Math.floor(hash(tx, tz, 8201) * 5);
    for (let y = h - 1; y <= top; y++) put(tx, y, tz, WOOD);
    blob(tx, top, tz, 3.9, 3.1, 3.9); blob(tx, top + 3, tz, 2.4, 1.9, 2.4);
    for (let n = 0; n < 2; n++) { const a = hash(tx, tz, 8210 + n) * 6.283; blob(tx + Math.round(Math.cos(a) * 3), top - 2, tz + Math.round(Math.sin(a) * 3), 2.4, 1.8, 2.4); }
  };
  const spruce = (tx, tz, h) => {
    const Ht = 11 + Math.floor(hash(tx, tz, 8301) * 6), top = h + Ht;
    for (let y = h - 1; y < top; y++) put(tx, y, tz, WOOD);
    for (let rel = 0; rel <= Ht - 3; rel++) {
      const rad = (rel % 2 === 0 ? 1 : 0) + Math.min(3, Math.floor(rel / 3)), y = top - rel;
      for (let dz = -rad; dz <= rad; dz++) for (let dx = -rad; dx <= rad; dx++) if (dx * dx + dz * dz <= rad * rad + (rad > 1 ? 1 : 0)) put(tx + dx, y, tz + dz, LEAVES, true);
    }
  };

  for (let tz = oz - 2; tz < oz + CS + 2; tz++) for (let tx = ox - 2; tx < ox + CS + 2; tx++) {
    if (hash(tx * 7 + 13, tz * 3 + 5, 99) >= .011) continue;
    const h = heightAt(tx, tz); if (h <= SEA + 1 || h >= 40 || mountainAt(tx, tz) > .1 || forestAt(tx, tz) > .12) continue;
    const top = h + 4 + Math.floor(hash(tx, tz, 7) * 2);
    for (let dy = -1; dy <= 2; dy++) for (let dz = -2; dz <= 2; dz++) for (let dx = -2; dx <= 2; dx++) {
      const r = dy >= 1 ? 1 : 2;
      if (dx * dx + dz * dz + dy * dy <= r * r + 1) put(tx + dx, top + dy, tz + dz, LEAVES, true);
    }
    for (let y = h + 1; y <= top; y++) put(tx, y, tz, WOOD);
  }
  const FC = 10;
  for (let gz = Math.floor((oz - 11) / FC); gz <= Math.floor((oz + CS + 10) / FC); gz++) for (let gx = Math.floor((ox - 11) / FC); gx <= Math.floor((ox + CS + 10) / FC); gx++) {
    const tx = gx * FC + 1 + Math.floor(hash(gx, gz, 8001) * (FC - 2)), tz = gz * FC + 1 + Math.floor(hash(gx, gz, 8002) * (FC - 2));
    const fw = forestAt(tx, tz); if (fw < .12) continue;
    const h = heightAt(tx, tz); if (h <= SEA + 2 || h > 40) continue;
    if (hash(gx, gz, 8003) < fw * .9) { const t = hash(gx, gz, 8004); (t < .5 ? giant : t < .8 ? medium : spruce)(tx, tz, h); }
    else if (hash(gx, gz, 8005) < .3 * fw) blob(tx, h + 1, tz, 1.7, 1.3, 1.7);
  }

  const ed = editsByChunk.get(ck(cx, cz));
  if (ed) ed.forEach((b, i) => { data[i] = b; });
  return data;
}