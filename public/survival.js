const S = { hp: 20, hunger: 20, air: 10, dead: false };
const DAY = { dawn: 90, day: 600, dusk: 90, night: 420 };
const DAYLEN = DAY.dawn + DAY.day + DAY.dusk + DAY.night;
function dayAngle() {
  const t = (Date.now() / 1000) % DAYLEN, h = .3, TAU = Math.PI * 2;
  let a;
  if (t < DAY.dawn) a = -h + 2 * h * t / DAY.dawn;
  else if (t < DAY.dawn + DAY.day) a = h + (Math.PI - 2 * h) * (t - DAY.dawn) / DAY.day;
  else if (t < DAY.dawn + DAY.day + DAY.dusk) a = Math.PI - h + 2 * h * (t - DAY.dawn - DAY.day) / DAY.dusk;
  else a = Math.PI + h + (Math.PI - 2 * h) * (t - DAY.dawn - DAY.day - DAY.dusk) / DAY.night;
  return (a + TAU) % TAU;
}
const SAVEK = 'voxelcraft_save2';
let savedPos = null;
try { const d = JSON.parse(localStorage.getItem(SAVEK)); if (d) { d.slots.forEach((s, i) => inv.slots[i] = s); S.hp = d.hp > 0 ? d.hp : 20; S.hunger = d.hunger ?? 20; if (d.hp > 0 && d.pos && [d.pos.x, d.pos.y, d.pos.z].every(Number.isFinite)) savedPos = d.pos; } } catch {}
const save = () => { try { localStorage.setItem(SAVEK, JSON.stringify({ slots: inv.slots, hp: S.hp, hunger: S.hunger, pos: S.dead ? null : started ? { x: P.x, y: P.y, z: P.z, yaw: P.yaw, pitch: P.pitch } : savedPos })); } catch {} };
addEventListener('pagehide', save);
addEventListener('beforeunload', save);
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
const HARD = { 1: .6, 2: .5, 3: 2.5, 4: .5, 5: 1.5, 6: .2, 8: 1.2, 9: 2.5, 10: 1.2, 11: 3, 12: .05, 13: .05, 14: .05, 15: .05, 16: .05 };
const KIND = { 1: 'shovel', 2: 'shovel', 4: 'shovel', 3: 'pick', 9: 'pick', 5: 'axe', 8: 'axe', 10: 'axe', 11: 'pick' };

function hurt(n) {
  if (S.dead || n <= 0) return;
  S.hp -= n; $('flash').style.opacity = .5; setTimeout(() => $('flash').style.opacity = 0, 120);
  if (S.hp <= 0) die();
}
function die() {
  S.dead = true; S.hp = 0; closeInventory(); document.exitPointerLock?.();
  inv.slots.forEach((s, i) => { if (s) { const dr = dropItem(s.id, s.n, P.x, P.y + 1, P.z); dr.d = s.d; inv.slots[i] = null; } });
  mobs.slice().forEach(m => killMob(m, false)); $('dead').style.display = 'flex'; uiDirty = true; save();
}
$('respawn').addEventListener('click', () => {
  Object.assign(S, { hp: 20, hunger: 20, air: 10, dead: false });
  P.x = 8.5; P.z = 8.5; P.y = groundHeightAt(8, 8) + .1; P.vx = P.vy = P.vz = 0; fallV = 0;
  $('dead').style.display = 'none'; if (!isTouch) renderer.domElement.requestPointerLock();
});
function eatSlot(i) { const s = inv.slots[i]; if (!s || s.id !== APPLE || S.hunger >= 20) return; if (--s.n <= 0) inv.slots[i] = null; S.hunger = Math.min(20, S.hunger + 4); S.hp = Math.min(20, S.hp + 1); uiDirty = true; swingHand(); }
function eatAny() { const i = inv.slots.findIndex(s => s && s.id === APPLE); if (i >= 0) eatSlot(i); }

let hold = false, mt = null, mp = 0, cool = 0, pcool = 0;
breakBlock = function () {
  swingHand();
  const m = mobTarget();
  if (m) {
    if (cool > 0) return; cool = .45;
    const h = held(), T = h && TOOLS[h.id], dmg = T && T[0] === 'sword' ? (T[1] === 2 ? 5 : 4) : 2;
    m.hp -= dmg; useTool(); const d = Math.hypot(m.x - P.x, m.z - P.z) || 1; m.kx = (m.x - P.x) / d * 6; m.kz = (m.z - P.z) / d * 6; m.vy = 4;
    if (m.hp <= 0) killMob(m, true); return;
  }
  hold = true;
};
placeBlock = function () {
  const r = raycast(), h = held();
  if (r && getBlock(r.x, r.y, r.z) === 10 && !P.sneak) return openInventory(3);
  if (r && !r.plant && isChest(getBlock(r.x, r.y, r.z)) && !P.sneak) return openChest(r.x, r.y, r.z);
  if (!h) return;
  if (h.id === APPLE) return eatSlot(inv.sel);
  if (h.id === TORCH_ITEM) return placeTorch(r);
  if (h.id >= 20 || !r) return;
  const { px: x, py: y, pz: z } = r.plant ? { px: r.x, py: r.y, pz: r.z } : r;
  if (x + 1 > P.x - HW && x < P.x + HW && y + 1 > P.y && y < P.y + PH && z + 1 > P.z - HW && z < P.z + HW) return;
  setBlock(x, y, z, h.id, true); swingHand(); if (--h.n <= 0) inv.slots[inv.sel] = null; uiDirty = true;
};
const stopHold = () => { hold = false; };
addEventListener('mouseup', stopHold); addEventListener('touchcancel', stopHold);
addEventListener('touchend', e => { if (e.target.id === 'bBreak') stopHold(); });
function mineTick(dt) {
  const bar = $('mine'), r = hold && !invOpen ? raycast() : null;
  if (!r || r.y < 1) { mt = null; mp = 0; bar.style.display = 'none'; return; }
  if (r.plant) {
    mt = null; mp = 0; bar.style.display = 'none';
    if ((pcool -= dt) <= 0) { pcool = .16; setBlock(r.x, r.y, r.z, AIR, true); swingHand(); }
    return;
  }
  if (!mt || mt.x !== r.x || mt.y !== r.y || mt.z !== r.z) { mt = r; mp = 0; }
  const b = getBlock(r.x, r.y, r.z), h = held(), T = h && TOOLS[h.id], right = T && T[0] === KIND[b];
  mp += dt * (right ? (T[1] === 2 ? 4 : 2) : 1);
  if (Math.sin(mp * 12) > .95) swingHand();
  bar.style.display = 'block'; bar.firstChild.style.width = Math.min(100, mp / HARD[b] * 100) + '%';
  if (mp >= HARD[b]) {
    const pick = h && TOOLS[h.id] && TOOLS[h.id][0] === 'pick';
    let drop = b === GRASS ? DIRT : b === STONE ? (pick ? 9 : 0) : b === 9 ? (pick ? 9 : 0) : b === COAL_ORE ? (pick ? COAL : 0) : (b >= 12 && b <= 16) ? TORCH_ITEM : b === LEAVES ? (Math.random() < .12 ? APPLE : Math.random() < .2 ? STICK : 0) : isChest(b) ? CHEST : b;
    setBlock(r.x, r.y, r.z, AIR, true);
    if (drop) dropItem(drop, 1, r.x + .5, r.y + .5, r.z + .5);
    useTool();
    mt = null; mp = 0;
  }
}

addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'KeyE' && playing && !S.dead) toggleInventory();
  if (e.code === 'Escape') closeInventory();
  if (e.code === 'KeyF') eatAny();
  if (e.code === 'KeyQ' && !invOpen && held()) {
    const h = held(), d = new THREE.Vector3(); camera.getWorldDirection(d);
    const dr = dropItem(h.id, 1, P.x + d.x * .5, P.y + 1.4, P.z + d.z * .5, d.x * 5, d.y * 5 + 2, d.z * 5); dr.d = h.d;
    if (--h.n <= 0) inv.slots[inv.sel] = null; uiDirty = true;
  }
  const n = parseInt(e.key); if (n >= 1 && n <= 9) { inv.sel = n - 1; uiDirty = true; }
});
addEventListener('wheel', e => { if (!invOpen) { inv.sel = mod(inv.sel + Math.sign(e.deltaY), 9); uiDirty = true; } });

const cDay = new THREE.Color(0x7fb8ea), cNight = new THREE.Color(0x070b18), cTmp = new THREE.Color();
let fallV = 0, regen = 0, starve = 0, drown = 0, uiT = 0, saveT = 0;
function survivalTick(dt) {
  if (S.dead) { updateDrops(dt); return; }
  cool -= dt;
  const L = Math.max(.2, Math.min(1, .55 + Math.sin(dayAngle()) * .7));
  skyHex = cTmp.lerpColors(cNight, cDay, (L - .2) / .8).getHex(); setLight(L);
  if (!P.ground && !P.inWater) fallV = Math.min(fallV, P.vy);
  else { if (P.ground && fallV < -14) hurt(Math.floor((-fallV - 13) / 1.2)); fallV = 0; }
  S.hunger = Math.max(0, S.hunger - dt * ((P.moveSpd || 0) > .5 ? (P.sprint ? .09 : .05) : .02));
  if (S.hunger >= 16 && S.hp < 20 && (regen += dt) > 4) { regen = 0; S.hp = Math.min(20, S.hp + 1); S.hunger -= .5; }
  if (S.hunger <= 0 && (starve += dt) > 4) { starve = 0; hurt(1); }
  const head = getBlock(Math.floor(P.x), Math.floor(P.y + EYE), Math.floor(P.z)) === WATER;
  if (head) { S.air -= dt; if (S.air <= 0 && (drown += dt) > 1) { drown = 0; hurt(2); } } else { S.air = Math.min(10, S.air + dt * 4); drown = 0; }
  updateMobs(dt, L); updateAnimals(dt, L); updateDrops(dt); mineTick(dt); handTick(dt);
  if (uiDirty) refreshUI();
  if ((uiT += dt) > .25) {
    uiT = 0;
    $('hp').innerHTML = hudRow('heart', S.hp); $('hu').innerHTML = hudRow('food', S.hunger);
    $('air').innerHTML = S.air < 10 ? bubbles(Math.ceil(S.air)) : '';
    $('items').textContent = (L < .4 ? 'night' : '') + (P.sprint ? ' · sprint' : '') + (P.sneak ? ' · sneak' : '');
  }
  if ((saveT += dt) > 5) { saveT = 0; save(); }
}