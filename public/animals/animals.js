const ANIMALS = {}, animals = [];
const registerAnimal = def => { ANIMALS[def.id] = def; };
const _wrapAng = a => { while (a > Math.PI) a -= 6.283185; while (a < -Math.PI) a += 6.283185; return a; };

function spawnAnimal(def, x, z) {
  if (getBlock(x, 30, z) === -1) return null;
  const y = groundHeightAt(x, z);
  if (y <= SEA || getBlock(x, y - 1, z) !== def.ground || collBox(x + .5, y, z + .5, def.hw, def.h)) return null;
  const rig = def.build(), yaw = Math.random() * 6.283;
  scene.add(rig.group);
  const a = { animal: true, def, rig, g: rig.group, x: x + .5, y, z: z + .5, vy: 0, kx: 0, kz: 0, hp: def.hp, lastHp: def.hp, on: false,
    yaw, dyaw: yaw, state: 'idle', t: 1 + Math.random() * 3, panic: 0, bump: 0, phase: Math.random() * 10, amp: 0, age: Math.random() * 50 };
  animals.push(a); return a;
}
function spawnHerd(def) {
  const ang = Math.random() * 6.283, d = 16 + Math.random() * 14, cx = P.x + Math.cos(ang) * d, cz = P.z + Math.sin(ang) * d;
  const n = def.herd[0] + Math.floor(Math.random() * (def.herd[1] - def.herd[0] + 1));
  for (let i = 0; i < n; i++) spawnAnimal(def, Math.floor(cx + (Math.random() - .5) * 6), Math.floor(cz + (Math.random() - .5) * 6));
}
function killAnimal(a, loot) {
  scene.remove(a.g); const i = animals.indexOf(a); if (i >= 0) animals.splice(i, 1);
  if (loot && a.def.loot) a.def.loot(a);
}
const _wet = (a, x, z) => { const bx = Math.floor(x), bz = Math.floor(z), by = Math.floor(a.y); return getBlock(bx, by, bz) === WATER || getBlock(bx, by - 1, bz) === WATER; };

function updateAnimals(dt, L) {
  const count = {}; for (const a of animals) count[a.def.id] = (count[a.def.id] || 0) + 1;
  if (L > .45) for (const id in ANIMALS) { const def = ANIMALS[id]; if ((count[id] || 0) < def.max && Math.random() < dt * .4) spawnHerd(def); }
  for (const a of [...animals]) {
    const def = a.def, dx = P.x - a.x, dz = P.z - a.z, d = Math.hypot(dx, dz);
    if (d > 70 || a.y < -20) { killAnimal(a, false); continue; }
    a.age += dt;
    if (a.hp < a.lastHp) { a.panic = 3; a.state = 'walk'; a.yaw = Math.atan2(-dx, -dz); }
    a.lastHp = a.hp; a.panic = Math.max(0, a.panic - dt); a.t -= dt;
    if (a.panic <= 0 && a.t <= 0) {
      const r = Math.random();
      if (r < .4) { a.state = 'walk'; a.yaw += (Math.random() - .5) * 3.5; a.t = 2 + Math.random() * 3; }
      else if (r < .7) { a.state = 'graze'; a.t = 2.5 + Math.random() * 2; }
      else { a.state = 'idle'; a.t = 1.5 + Math.random() * 2.5; }
    }
    const sp = a.panic > 0 ? def.run : a.state === 'walk' ? def.speed : 0;
    const wx = Math.sin(a.yaw) * sp + a.kx, wz = Math.cos(a.yaw) * sp + a.kz, kf = Math.max(0, 1 - 8 * dt); a.kx *= kf; a.kz *= kf;
    const nx = a.x + wx * dt, nz = a.z + wz * dt; let hit = false;
    if ((wx || wz) && _wet(a, nx, nz)) a.yaw += 1.6 + Math.random() * 1.5;
    else {
      if (!collBox(nx, a.y, a.z, def.hw, def.h)) a.x = nx; else { hit = true; if (a.on && sp > 0) a.vy = 8; }
      if (!collBox(a.x, a.y, nz, def.hw, def.h)) a.z = nz; else { hit = true; if (a.on && sp > 0) a.vy = 8; }
    }
    if (hit && sp > 0) { a.bump += dt; if (a.bump > .7) { a.bump = 0; a.yaw += 1.5 + Math.random() * 1.5; } } else a.bump = 0;
    a.vy -= 28 * dt; const ny = a.y + a.vy * dt; a.on = false;
    if (!collBox(a.x, ny, a.z, def.hw, def.h)) a.y = ny; else { if (a.vy < 0) a.on = true; a.vy = 0; }
    a.dyaw += _wrapAng(a.yaw - a.dyaw) * Math.min(1, 8 * dt);
    a.amp += ((sp > 0 && a.on ? 1 : 0) - a.amp) * Math.min(1, 10 * dt); a.phase += sp * 4 * dt;
    a.g.position.set(a.x, a.y, a.z); a.g.rotation.y = a.dyaw;
    def.animate(a, dt, sp);
  }
}

const _mobTarget = mobTarget, _killMob = killMob;
function _rayT(o, dir, e, cy, r2) {
  const v = new THREE.Vector3(e.x - o.x, e.y + cy - o.y, e.z - o.z), t = v.dot(dir);
  return t > 0 && t < 3.6 && v.lengthSq() - t * t < r2 ? t : Infinity;
}
mobTarget = function () {
  const z = _mobTarget(), o = camera.position, dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  let best = z, bt = z ? _rayT(o, dir, z, .9, .36) : Infinity;
  for (const a of animals) { const t = _rayT(o, dir, a, a.def.h / 2, a.def.hit); if (t < bt) { best = a; bt = t; } }
  return best;
};
killMob = function (m, loot) { m.animal ? killAnimal(m, loot) : _killMob(m, loot); };