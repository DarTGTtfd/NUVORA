const drops = [], mobs = [];
function dropItem(id, n, x, y, z, vx = (Math.random() - .5) * 2.5, vy = 3.5, vz = (Math.random() - .5) * 2.5) {
  const m = itemMesh(id), sc = id < 20 ? .26 : .45; m.scale.setScalar(sc); scene.add(m);
  const dr = { id, n, x, y, z, vx, vy, vz, m, age: 0, wait: .7, on: false }; drops.push(dr); return dr;
}
function updateDrops(dt) {
  for (const d of [...drops]) {
    d.age += dt; d.wait -= dt;
    const px = P.x - d.x, py = P.y + .9 - d.y, pz = P.z - d.z, dist = Math.hypot(px, py, pz);
    if (d.wait <= 0 && dist < 2.6) {
      if (dist < .7) { const left = addItem(d.id, d.n, d.d); if (left < d.n) { d.n = left; if (!left) { scene.remove(d.m); drops.splice(drops.indexOf(d), 1); continue; } } }
      d.x += px / dist * 6 * dt; d.y += py / dist * 6 * dt; d.z += pz / dist * 6 * dt; d.vy = 0;
    } else {
      d.vy -= 24 * dt;
      const nx = d.x + d.vx * dt, nz = d.z + d.vz * dt, ny = d.y + d.vy * dt;
      if (!collBox(nx, d.y, d.z, .12, .25)) d.x = nx; else d.vx *= -.4;
      if (!collBox(d.x, d.y, nz, .12, .25)) d.z = nz; else d.vz *= -.4;
      if (!collBox(d.x, ny, d.z, .12, .25)) { d.y = ny; d.on = false; } else { d.on = true; if (d.vy < -3) d.vy *= -.3; else d.vy = 0; }
      if (d.on) { const f = Math.max(0, 1 - 9 * dt); d.vx *= f; d.vz *= f; }
      if (collBox(d.x, d.y, d.z, .12, .25)) d.y += 2 * dt;
    }
    d.m.position.set(d.x, d.y + .18 + Math.sin(d.age * 3) * .05, d.z); d.m.rotation.y = d.age * 1.6;
    if (d.age > 300) { scene.remove(d.m); drops.splice(drops.indexOf(d), 1); }
  }
}
const zGeo = [new THREE.BoxGeometry(.6, .9, .3), new THREE.BoxGeometry(.45, .45, .45), new THREE.BoxGeometry(.2, .8, .2)];
const zMat = [new THREE.MeshBasicMaterial({ color: 0x2f7d3a }), new THREE.MeshBasicMaterial({ color: 0x5fae5f })]; zMat.forEach(m => m.userData.base = m.color.clone()); litMats.push(...zMat);
function spawnMob() {
  const a = Math.random() * 6.283, d = 18 + Math.random() * 10, x = Math.floor(P.x + Math.cos(a) * d), z = Math.floor(P.z + Math.sin(a) * d);
  if (getBlock(x, 30, z) === -1) return;
  const y = groundHeightAt(x, z); if (getBlock(x, y - 1, z) === WATER || y <= SEA || getBlock(x, y - 1, z) === LEAVES || getBlock(x, y - 1, z) === WOOD) return;
  const g = new THREE.Group(), body = new THREE.Mesh(zGeo[0], zMat[0]), head = new THREE.Mesh(zGeo[1], zMat[1]);
  body.position.y = .75; head.position.y = 1.4;
  const l = new THREE.Mesh(zGeo[2], zMat[0]), r = l.clone(); l.position.set(-.4, 1, .25); r.position.set(.4, 1, .25); l.rotation.x = r.rotation.x = -1.4;
  g.add(body, head, l, r); scene.add(g);
  mobs.push({ g, x: x + .5, y, z: z + .5, vy: 0, kx: 0, kz: 0, hp: 10, cd: 0, on: false });
}
function killMob(m, loot) { scene.remove(m.g); mobs.splice(mobs.indexOf(m), 1); if (loot && Math.random() < .5) dropItem(APPLE, 1, m.x, m.y + .5, m.z); }
function updateMobs(dt, L) {
  if (L < .4 && mobs.length < 6 && Math.random() < dt * .5) spawnMob();
  for (const m of [...mobs]) {
    const dx = P.x - m.x, dz = P.z - m.z, d = Math.hypot(dx, dz) || 1, sp = d < 32 ? 2.3 : 0;
    const wx = dx / d * sp + m.kx, wz = dz / d * sp + m.kz; m.kx *= .88; m.kz *= .88; m.cd -= dt;
    const nx = m.x + wx * dt, nz = m.z + wz * dt;
    if (!collBox(nx, m.y, m.z, .3, 1.8)) m.x = nx; else if (m.on) m.vy = 8;
    if (!collBox(m.x, m.y, nz, .3, 1.8)) m.z = nz; else if (m.on) m.vy = 8;
    m.vy -= 28 * dt; const ny = m.y + m.vy * dt; m.on = false;
    if (!collBox(m.x, ny, m.z, .3, 1.8)) m.y = ny; else { if (m.vy < 0) m.on = true; m.vy = 0; }
    m.g.position.set(m.x, m.y, m.z); m.g.rotation.y = Math.atan2(dx, dz);
    if (d < 1.3 && Math.abs(P.y - m.y) < 1.6 && m.cd <= 0) { hurt(3); m.cd = 1.1; P.vx -= dx / d * 8; P.vz -= dz / d * 8; P.vy = Math.max(P.vy, 4.5); }
    if (L > .6) m.hp -= dt * 3;
    if (m.hp <= 0 || d > 55) killMob(m, false);
  }
}
function mobTarget() {
  const o = camera.position, dir = new THREE.Vector3(); camera.getWorldDirection(dir);
  let best = null, bt = 3.6;
  for (const m of mobs) {
    const v = new THREE.Vector3(m.x - o.x, m.y + .9 - o.y, m.z - o.z), t = v.dot(dir);
    if (t > 0 && t < bt && v.lengthSq() - t * t < .36) { best = m; bt = t; }
  }
  return best;
}