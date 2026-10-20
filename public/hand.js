const handScene = new THREE.Scene(), handCam = new THREE.PerspectiveCamera(60, 1, .01, 10);
const lit = hex => { const m = new THREE.MeshBasicMaterial({ color: hex, vertexColors: true }); m.userData.base = m.color.clone(); m.userData.min = .3; litMats.push(m); return m; };
const skin = lit(0xc58c66), sleeveMat = lit(0x2a9aa0);
const FS = [.78, .62, 1, .5, .86, .7];
const bx = (w, h, d, m, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d), c = []; for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) c.push(FS[f], FS[f], FS[f]); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); const b = new THREE.Mesh(g, m); b.position.set(x, y, z); return b; };
const _hm = new Map();
const own = m => { if (!_hm.has(m)) { const c = m.clone(); c.userData = { min: .3 }; litMats.push(c); _hm.set(m, c); } return _hm.get(m); };
const rig = new THREE.Group(); handScene.add(rig);
const limb = new THREE.Group(); limb.add(bx(.2, .2, .8, skin, 0, 0, -.25), bx(.235, .235, .45, sleeveMat, 0, 0, -.075)); rig.add(limb);
const wrist = new THREE.Group(); wrist.position.set(0, 0, -.5); rig.add(wrist);
const fist = bx(.2, .2, .2, skin, 0, 0, -.05); wrist.add(fist);
const heldGroup = new THREE.Group(); wrist.add(heldGroup);

let heldShown = -1, swing = 0, swingKind = 'punch', equip = 1, T = 0, lagY = 0, lagP = 0, air = 0, spr = 0, lastYaw = null, lastPitch = 0;
const kindOf = id => id === 20 ? 'eat' : id === 0 ? 'punch' : id < 20 || id === COAL || id === TORCH_ITEM ? 'place' : (id === 24 || id === 29 || id === 25) ? 'slash' : 'chop';
const swingHand = () => { if (swing <= 0) { swing = 1; swingKind = kindOf(heldShown); } };
const sm = t => t * t * (3 - 2 * t), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const A = p => p < .2 ? -sm(p / .2) : p < .48 ? -1 + 2 * sm((p - .2) / .28) : 1 - sm((p - .48) / .52);

const _hr = renderer.render.bind(renderer);
renderer.render = function (s, c) {
  _hr(s, c); if (s !== scene) return;
  renderer.autoClear = false; renderer.clearDepth(); _hr(handScene, handCam); renderer.autoClear = true;
};

function handTick(dt) {
  T += dt; handCam.aspect = camera.aspect; handCam.fov = camera.aspect < 1.3 ? 2 * Math.atan(Math.tan(Math.PI / 6) * 1.3 / camera.aspect) * 57.2958 : 60; handCam.updateProjectionMatrix();
  const h = held(), id = h ? h.id : 0;
  if (id !== heldShown) {
    heldShown = id; equip = 1; heldGroup.clear(); limb.visible = fist.visible = !id;
    if (id === TORCH_ITEM) heldGroup.add(handTorch);
    else if (id) {
      const m = itemMesh(id); m.material = own(m.material);
      if (id < 20) { m.scale.setScalar(.34); m.position.set(-.04, .2, -.05); m.rotation.set(.2, .7, 0); }
      else if (id === APPLE || id === WOOL || id === COAL) { m.scale.setScalar(.42); m.position.set(0, .2, -.05); m.rotation.set(.1, .6, .1); }
      else {
        const SC = .5, G = new THREE.Vector3(-.27, -.26, 0);
        m.scale.setScalar(SC); m.rotation.set(-.2, -.7, .25);
        m.position.set(0, 0, -.05).sub(G.multiplyScalar(SC).applyEuler(m.rotation));
      }
      heldGroup.add(m);
    }
  }
  equip = Math.max(0, equip - dt * 4.5);
  const active = swing > 0;
  if (active) swing = Math.max(0, swing - dt * (swingKind === 'eat' ? 1.1 : swingKind === 'chop' || swingKind === 'slash' ? 2.6 : 3.4));
  const p = active ? 1 - swing : 0;
  let ox = 0, oy = 0, oz = 0, rx = 0, ry = 0, rz = 0, wx = 0;

  if (active) {
    if (swingKind === 'chop') {
      const a = A(p), k = Math.max(a, 0), w = Math.max(-a, 0);
      rx += -.62 * k + .5 * w; oy += -.05 * k + .08 * w; oz += -.1 * k + .05 * w; wx += -.5 * k + .45 * w;
    } else if (swingKind === 'slash') {
      const a = A(p);
      ry += -a * .75; rz += -a * .55; rx += -a * .45; ox += -a * .3; oy += a > 0 ? -.05 * a : -.06 * a; wx += -.3 * Math.max(a, 0);
    } else if (swingKind === 'eat') {
      const u = sm(Math.min(1, p * 3.2)) * (1 - sm(Math.max(0, (p - .75) / .25))), bite = p > .35 && p < .8 ? Math.sin(p * 38) * .015 * u : 0;
      ox += -.34 * u; oy += .42 * u + bite; oz += .12 * u; rx += .65 * u; rz += .35 * u; ry += -.2 * u;
    } else if (swingKind === 'place') {
      const s = Math.sin(p * Math.PI); oz += -.14 * s; rx += -.5 * s; oy += -.05 * s;
    } else {
      const s = Math.sin(p * Math.PI); ox += -.18 * s; oy += -.12 * s; oz += -.22 * s; rx += -1.0 * s; ry += -.3 * s;
    }
  }
  const mv = Math.min(1, (P.moveSpd || 0) / 4.3) * (P.ground ? 1 : 0);
  ox += Math.cos(bobT * .55) * .02 * mv; oy += Math.abs(Math.sin(bobT * 1.1)) * .02 * mv; rz += Math.sin(bobT * .55) * .03 * mv; wx += Math.sin(bobT * 1.1) * .05 * mv;
  oy += Math.sin(T * 1.7) * .006; rx += Math.sin(T * 1.7) * .008;
  spr += ((P.sprint && mv > .1 ? 1 : 0) - spr) * Math.min(1, 8 * dt);
  rx += -.28 * spr; oy += -.03 * spr; wx += -.25 * spr;
  air += ((P.ground ? 0 : clamp(-(P.vy || 0) * .006, -.06, .06)) - air) * Math.min(1, 10 * dt); oy += air;
  oy += -equip * .5; rx += -equip * .5;
  if (lastYaw === null) { lastYaw = P.yaw; lastPitch = P.pitch; }
  const vy = clamp((P.yaw - lastYaw) / Math.max(dt, .001), -8, 8), vp = clamp((P.pitch - lastPitch) / Math.max(dt, .001), -8, 8);
  lastYaw = P.yaw; lastPitch = P.pitch;
  lagY += (-vy * .012 - lagY) * Math.min(1, 10 * dt); lagP += (-vp * .012 - lagP) * Math.min(1, 10 * dt);
  ry += lagY; rx += lagP;

  rig.position.set(.5 + ox, -.56 + oy, -.8 + oz);
  rig.rotation.set(.3 + rx, .4 + ry, .08 + rz);
  wrist.rotation.set(wx, 0, 0);
  if (id === TORCH_ITEM) flameAnim(hFlame, performance.now() / 1000, .85);
}