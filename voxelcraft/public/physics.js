function collBox(px, py, pz, hw, h) {
  for (let y = Math.floor(py); y <= Math.floor(py + h - .01); y++) for (let z = Math.floor(pz - hw); z <= Math.floor(pz + hw); z++) for (let x = Math.floor(px - hw); x <= Math.floor(px + hw); x++) if (solid(getBlock(x, y, z))) return true;
  return false;
}
let sprint = false, lastW = 0, bobT = 0;
addEventListener('keydown', e => { if (e.code === 'KeyW' && !e.repeat) { const n = performance.now(); if (n - lastW < 300) sprint = true; lastW = n; } });
addEventListener('keyup', e => { if (e.code === 'KeyW') sprint = false; });
function groundBelow(x, z) {
  const y = Math.floor(P.y - .1);
  for (const dx of [-HW, HW]) for (const dz of [-HW, HW]) if (solid(getBlock(Math.floor(x + dx), y, Math.floor(z + dz)))) return true;
  return false;
}
function stepMove(ax, d) {
  const n = Math.max(1, Math.ceil(Math.abs(d) / .4)), s = d / n;
  for (let i = 0; i < n; i++) {
    const nx = P.x + (ax === 0 ? s : 0), ny = P.y + (ax === 1 ? s : 0), nz = P.z + (ax === 2 ? s : 0);
    if (ax !== 1 && P.sneak && P.ground && !groundBelow(nx, nz)) return true;
    if (collides(nx, ny, nz)) return true;
    P.x = nx; P.y = ny; P.z = nz;
  }
  return false;
}
physics = function (dt) {
  if (typeof S !== 'undefined' && S.dead) return;
  const up = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) - stick.y, rt = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + stick.x;
  const len = Math.hypot(up, rt), mag = Math.min(1, len) / (len || 1);
  P.sneak = !!(keys.ShiftLeft || keys.ShiftRight);
  if (isTouch && stick.y < -.92 && !P.sneak) sprint = true;
  if (up <= .1 || P.sneak || (typeof S !== 'undefined' && S.hunger < 6)) sprint = false;
  P.sprint = sprint;
  const bx = Math.floor(P.x), bz = Math.floor(P.z);
  P.inWater = getBlock(bx, Math.floor(P.y + .6), bz) === WATER;
  const headW = getBlock(bx, Math.floor(P.y + EYE), bz) === WATER;
  const sp = P.inWater ? 2.3 : P.sneak ? 1.3 : P.sprint ? 5.7 : 4.3, sn = Math.sin(P.yaw), cs = Math.cos(P.yaw);
  const tx = (-sn * up + cs * rt) * mag * sp, tz = (-cs * up - sn * rt) * mag * sp;
  const k = Math.min(1, (P.ground ? 14 : P.inWater ? 5 : 2.2) * dt);
  P.vx += (tx - P.vx) * k; P.vz += (tz - P.vz) * k;
  if (P.inWater) { P.vy = (P.vy - 9 * dt) * (1 - Math.min(1, 2.2 * dt)); if (jumpHeld) P.vy = Math.min(P.vy + 30 * dt, 3.6); }
  else { P.vy = Math.max(P.vy - 32 * dt, -55); if (jumpHeld && P.ground) P.vy = 8.9; }
  const hx = stepMove(0, P.vx * dt), hz = stepMove(2, P.vz * dt);
  if (hx) P.vx = 0; if (hz) P.vz = 0;
  if ((hx || hz) && P.inWater && !headW && jumpHeld) P.vy = 6.5;
  P.ground = false;
  if (stepMove(1, P.vy * dt)) {
    if (P.vy < 0) { P.ground = true; P.y = Math.floor(P.y) + 1e-4; } else P.y = Math.ceil(P.y + PH) - PH - 1e-4;
    P.vy = 0;
  }
  if (P.y < -20) { P.y = 70; P.vy = 0; }
  P.eyeDrop = (P.eyeDrop || 0) + ((P.sneak ? .25 : 0) - (P.eyeDrop || 0)) * Math.min(1, 12 * dt);
  const fov = 72 + (P.sprint && up > 0 ? 8 : 0); if (Math.abs(camera.fov - fov) > .05) { camera.fov += (fov - camera.fov) * Math.min(1, 8 * dt); camera.updateProjectionMatrix(); }
  P.moveSpd = Math.hypot(P.vx, P.vz); if (P.ground) bobT += P.moveSpd * dt;
};
