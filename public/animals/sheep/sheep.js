const WOOL = 32;
NAMES[WOOL] = 'Wool'; ITEMTILE[WOOL] = 'wool';
item('wool', px => {
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const d = Math.hypot(x - 7.5, y - 8) + Math.sin(x * 1.7) * Math.sin(y * 1.3) * .8;
    if (d < 5.4) px(x, y, d > 4.4 ? '#bdb8a8' : (x + y < 14 ? '#ffffff' : '#e6e3d8'));
    else if (d < 6.4) px(x, y, '#6f6b5e');
  }
  px(6, 6, '#d2cec0'); px(9, 9, '#d2cec0'); px(8, 5, '#d2cec0');
});
atlasTex.needsUpdate = true;

registerAnimal((() => {
  const cvTex = (fn) => {
    const c = document.createElement('canvas'); c.width = c.height = 16; fn(c.getContext('2d'));
    const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t;
  };
  const rgb = (c, n) => `rgb(${c.map(q => Math.max(0, Math.min(255, q + n)) | 0)})`;
  const dot = (x, i, j, col) => { x.fillStyle = col; x.fillRect(i, j, 1, 1); };
  const woolTex = (seed, base, holes) => cvTex(x => {
    const r = rng(seed);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
      if (holes && r() < .14) continue;
      const curl = ((i + ((j >> 2) & 1) * 2) % 4 === 0 || j % 4 === 0) ? -14 : 0;
      dot(x, i, j, rgb(base, (r() - .5) * 14 + curl));
    }
  });
  const skinBase = [205, 186, 160];
  const skinTex = () => cvTex(x => { const r = rng(5); for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) dot(x, i, j, rgb(skinBase, (r() - .5) * 10)); });
  const faceTex = () => cvTex(x => {
    const r = rng(6);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) dot(x, i, j, rgb(skinBase, (r() - .5) * 10));
    for (let i = 0; i < 16; i++) { const h = 3 + (i % 3 === 0 ? 1 : 0); for (let j = 0; j < h; j++) dot(x, i, j, rgb([238, 236, 226], (r() - .5) * 10)); }
    for (let j = 9; j < 15; j++) for (let i = 5; i < 11; i++) dot(x, i, j, rgb([176, 150, 122], (r() - .5) * 8));
    for (const ex of [2, 12]) for (let j = 6; j < 8; j++) for (let i = ex; i < ex + 2; i++) dot(x, i, j, '#f4f1e6');
    dot(x, 3, 6, '#17110d'); dot(x, 3, 7, '#17110d'); dot(x, 12, 6, '#17110d'); dot(x, 12, 7, '#17110d');
    dot(x, 6, 10, '#46302a'); dot(x, 9, 10, '#46302a'); dot(x, 7, 11, '#d69696'); dot(x, 8, 11, '#d69696');
    for (let i = 6; i < 10; i++) dot(x, i, 13, '#5a3c32');
  });
  const legTex = () => cvTex(x => {
    const r = rng(8);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) dot(x, i, j, j > 12 ? rgb([64, 55, 50], (r() - .5) * 8) : rgb([198, 180, 154], (r() - .5) * 10));
  });
  const lm = map => { const m = new THREE.MeshBasicMaterial({ map, alphaTest: .5 }); m.userData.base = m.color.clone(); m.userData.min = .4; litMats.push(m); return m; };
  let M = null, G = null;
  const assets = () => {
    if (M) return;
    const skin = lm(skinTex());
    M = { core: lm(woolTex(21, [214, 209, 196])), fleece: lm(woolTex(22, [238, 236, 226], true)), tuft: lm(woolTex(23, [240, 238, 228])),
      skin, face: lm(faceTex()), leg: lm(legTex()) };
    M.head = [skin, skin, skin, skin, M.face, skin];
    const b = (w, h, d) => new THREE.BoxGeometry(w, h, d);
    G = { core: b(.8, .66, 1.1), fleece: b(.96, .82, 1.26), leg: b(.2, .5, .2), head: b(.36, .38, .4), tuft: b(.42, .14, .34), ear: b(.2, .07, .12), tail: b(.2, .2, .2) };
  };
  const mesh = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };

  function build() {
    assets();
    const g = new THREE.Group(), legs = [];
    const fleece = mesh(G.fleece, M.fleece, 0, .85, 0);
    g.add(mesh(G.core, M.core, 0, .83, 0), fleece);
    for (const [lx, lz] of [[-.2, .38], [.2, .38], [-.2, -.38], [.2, -.38]]) {
      const p = new THREE.Group(); p.position.set(lx, .5, lz); p.add(mesh(G.leg, M.leg, 0, -.25, 0)); g.add(p); legs.push(p);
    }
    const head = new THREE.Group(); head.position.set(0, 1.0, .62);
    head.add(mesh(G.head, M.head, 0, .02, .2), mesh(G.tuft, M.tuft, 0, .2, .12));
    const el = mesh(G.ear, M.skin, -.24, .08, .02), er = mesh(G.ear, M.skin, .24, .08, .02); el.rotation.z = .45; er.rotation.z = -.45;
    head.add(el, er); g.add(head);
    const tail = mesh(G.tail, M.tuft, 0, .92, -.68); g.add(tail);
    return { group: g, legs, head, tail, fleece };
  }

  function animate(a, dt, sp) {
    const r = a.rig, s = Math.sin(a.phase) * .65 * a.amp;
    r.legs[0].rotation.x = s; r.legs[3].rotation.x = s; r.legs[1].rotation.x = -s; r.legs[2].rotation.x = -s;
    const graze = a.state === 'graze' && a.panic <= 0 && sp === 0;
    const tgt = graze ? 1.05 + Math.sin(a.age * 7) * .09 : a.panic > 0 ? -.12 : Math.sin(a.age * .8 + a.phase) * .05;
    const k = Math.min(1, 8 * dt);
    r.head.rotation.x += (tgt - r.head.rotation.x) * k;
    r.head.rotation.y += ((graze ? 0 : Math.sin(a.age * .6 + a.phase * 2) * .22) - r.head.rotation.y) * k;
    r.tail.position.x = Math.sin(a.age * (a.panic > 0 ? 14 : 4)) * .04;
    r.fleece.position.y = .85 + Math.abs(Math.sin(a.phase)) * .025 * a.amp + Math.sin(a.age * 1.6) * .004;
  }
  const loot = a => dropItem(WOOL, 1 + Math.floor(Math.random() * 2), a.x, a.y + .6, a.z);

  return { id: 'sheep', name: 'Sheep', ground: GRASS, max: 8, herd: [2, 4], hp: 8, hw: .35, h: 1.1, hit: .6, speed: 1.1, run: 3.2, build, animate, loot };
})());