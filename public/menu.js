(() => {
  const PX = 4, T = 16, M = 48;
  const root = $('start'), bg = $('mbg');
  const tile = n => { const i = TILE[n]; return actx.getImageData((i % ACOLS) * TS, Math.floor(i / ACOLS) * TS, TS, TS).data; };
  const c8 = v => v < 0 ? 0 : v > 255 ? 255 : v | 0;

  const layers = {};
  [['sky', 0], ['clouds', 6], ['far', 12], ['mid', 22], ['near', 34], ['fore', 52]].forEach(([n, d]) => {
    const l = document.createElement('div'), c = document.createElement('canvas');
    l.className = 'mbl'; l.dataset.d = d; c.className = n; l.appendChild(c); bg.appendChild(l); layers[n] = c;
  });
  const g = n => layers[n].getContext('2d');

  const sheep = (x, X, Y) => {
    const R = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(X + a, Y + b, w, h); };
    const W = '#f0eee4', w = '#cfcabb', sk = '#cdbaa0', dk = '#40372f';
    R('#a8977e', 8, 9, 2, 3); R(dk, 8, 12, 2, 1); R('#a8977e', 17, 9, 2, 3); R(dk, 17, 12, 2, 1);
    R(W, 5, 0, 13, 1); R(W, 4, 1, 15, 5); R(w, 4, 6, 15, 2); R(w, 5, 8, 13, 1);
    R('#fff', 6, 0, 4, 1); R(w, 8, 3, 1, 1); R(w, 12, 2, 1, 1); R(w, 15, 4, 1, 1); R(w, 10, 5, 1, 1);
    R(sk, 5, 9, 2, 3); R(dk, 5, 12, 2, 1); R(sk, 14, 9, 2, 3); R(dk, 14, 12, 2, 1);
    R(W, 19, 1, 2, 2);
    R(sk, 0, 3, 5, 5); R(W, 0, 2, 5, 2); R(sk, 4, 4, 2, 1);
    R('#f4f1e6', 1, 4, 1, 1); R('#17110d', 2, 4, 1, 1); R('#b09678', 0, 6, 2, 2); R('#46302a', 0, 6, 1, 1);
  };

  const paint = () => {
    const W = Math.ceil((innerWidth + M * 2) / PX), H = Math.ceil((innerHeight + M * 2) / PX);
    for (const k in layers) { const c = layers[k]; c.width = k === 'clouds' ? W * 2 : W; c.height = H; c.style.width = c.width * PX + 'px'; c.style.height = H * PX + 'px'; }

    { const x = g('sky'), n = 18, a = [52, 128, 222], b = [152, 210, 249];
      for (let i = 0; i < n; i++) { const t = Math.min(1, i / (n - 1) * 1.15); x.fillStyle = `rgb(${a.map((v, j) => v + (b[j] - v) * t | 0)})`; x.fillRect(0, Math.floor(i * H / n), W, Math.ceil(H / n) + 1); } }

    { const x = g('clouds'), r = rng(7), n = Math.max(5, W / 38 | 0);
      for (let i = 0; i < n; i++) {
        const cw = 16 + r() * 28 | 0, ch = 3 + r() * 3 | 0, cx = r() * (W - cw) | 0, cy = H * .05 + r() * H * .28 | 0;
        x.fillStyle = '#fff'; x.fillRect(cx + 2, cy, cw - 4, ch); x.fillRect(cx, cy + 1, cw, ch - 1); x.fillRect(cx + (cw / 3 | 0), cy - 1, cw / 3 | 0, 1);
        x.fillStyle = '#d8e8f7'; x.fillRect(cx, cy + ch - 1, cw, 1);
      }
      x.drawImage(layers.clouds, 0, 0, W, H, W, 0, W, H); }

    const hill = (name, base, amp, step, col, seed) => {
      const x = g(name), r = rng(seed), p = [r() * 6, r() * 6, r() * 6];
      for (let cx = 0; cx < W; cx += step) {
        const u = cx / W * 6.283, h = (Math.sin(u * 1.3 + p[0]) * .5 + Math.sin(u * 3.1 + p[1]) * .3 + Math.sin(u * 7.3 + p[2]) * .2) * amp, top = Math.round((H * base + h) / 2) * 2;
        x.fillStyle = col[0]; x.fillRect(cx, top, step, H - top); x.fillStyle = col[1]; x.fillRect(cx, top, step, 1);
      }
      x.globalCompositeOperation = 'source-atop';
      for (let i = 0; i < W * H / 220; i++) { x.fillStyle = r() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,40,.09)'; x.fillRect(r() * W | 0, r() * H | 0, 2, 2); }
      x.globalCompositeOperation = 'source-over';
    };
    hill('far', .60, H * .06, 6, ['#7fb0e6', '#9fc8f1'], 31);
    hill('mid', .70, H * .07, 5, ['#5f93d1', '#7cabe0'], 32);
    hill('near', .79, H * .05, 4, ['#3f77b8', '#5b93d2'], 33);

    { const x = g('fore'), r = rng(9), dirt = tile('dirt'), grass = tile('grass_side');
      const ncol = Math.max(3, Math.ceil(W * .34 / T)), x0 = W - ncol * T, rows = k => 3 + Math.floor(k * 3 / ncol);
      for (let k = 0; k < ncol; k++) for (let j = 0; j < rows(k); j++) {
        const s = j === 0 ? grass : dirt, ox = x0 + k * T, oy = H - (rows(k) - j) * T, v = (r() - .5) * 14;
        for (let py = 0; py < T; py++) for (let px = 0; px < T; px++) { const o = (py * T + px) * 4; x.fillStyle = `rgb(${c8(s[o] + v)},${c8(s[o + 1] + v)},${c8(s[o + 2] + v)})`; x.fillRect(ox + px, oy + py, 1, 1); }
      }
      x.globalCompositeOperation = 'source-atop';
      const gr = x.createLinearGradient(0, H - 5 * T, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.38)'); x.fillStyle = gr; x.fillRect(x0, H - 5 * T, W - x0, 5 * T);
      x.globalCompositeOperation = 'source-over';
      if (ncol >= 4) sheep(x, x0 + 5, H - rows(0) * T - 13); }
  };

  const ls = [...bg.children];
  addEventListener('mousemove', e => {
    const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
    ls.forEach(l => { const d = +l.dataset.d; l.style.transform = `translate(${(-dx * d).toFixed(1)}px,${(-dy * d * .5).toFixed(1)}px)`; });
  });

  const logo = () => {
    const F = '900 26px "Arial Black",Impact,"Trebuchet MS",sans-serif', D = 4, P = 3, GAP = 2, BASE = 22;
    const mt = document.createElement('canvas').getContext('2d'); mt.font = F;
    const w1 = Math.ceil(mt.measureText('NUV').width), w2 = Math.ceil(mt.measureText('ORA').width);
    const W = w1 + GAP + w2 + P * 2 + D, H = BASE + P * 2 + D;
    const m = document.createElement('canvas'); m.width = W; m.height = H;
    const mc = m.getContext('2d'); mc.font = F; mc.fillStyle = '#fff'; mc.fillText('NUV', P, BASE + P); mc.fillText('ORA', P + w1 + GAP, BASE + P);
    const a = mc.getImageData(0, 0, W, H).data, inM = (x, y) => x >= 0 && y >= 0 && x < W && y < H && a[(y * W + x) * 4 + 3] > 110;
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const oc = out.getContext('2d'), img = oc.createImageData(W, H), cov = new Uint8Array(W * H);
    const set = (x, y, r, gg, b) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const o = (y * W + x) * 4; img.data[o] = r; img.data[o + 1] = gg; img.data[o + 2] = b; img.data[o + 3] = 255; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inM(x, y)) cov[y * W + x] = 1;
    for (let d = D; d >= 1; d--) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inM(x, y)) { const q = 38 + (d === D ? 0 : 8) + ((x + y) & 1) * 4; set(x + d, y + d, q, q, q + 6); cov[(y + d) * W + x + d] = 1; }
    const C = (x, y) => x >= 0 && y >= 0 && x < W && y < H && cov[y * W + x];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!C(x, y) && (C(x - 1, y) || C(x + 1, y) || C(x, y - 1) || C(x, y + 1) || C(x - 1, y - 1) || C(x + 1, y + 1))) set(x, y, 12, 12, 16);
    const stone = tile('stone'), planks = tile('planks'), cut = P + w1 + GAP / 2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inM(x, y)) {
      const s = x < cut ? stone : planks, o = ((y % T) * T + (x % T)) * 4, lift = x < cut ? 14 : 0;
      let k = lift + (!inM(x, y - 1) ? 42 : 0) + (!inM(x - 1, y) ? 22 : 0) - (!inM(x, y + 1) ? 48 : 0) - (!inM(x + 1, y) ? 30 : 0) - (y - P) * .5;
      set(x, y, c8(s[o] + k), c8(s[o + 1] + k), c8(s[o + 2] + k));
    }
    oc.putImageData(img, 0, 0); return out;
  };

  const SPLASH = ['Now with sheep!', 'Watch out for zombies!', 'Made of blocks!', 'Eat apples!', 'Look at the wool!', 'Don’t dig straight down!',
    'Procedural textures!', 'Multiplayer!', 'Chop logs!', 'Survive the night!'];
  $('logo').append(logo());
  $('splash').textContent = SPLASH[Math.random() * SPLASH.length | 0];

  paint(); let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(paint, 150); });

  const ctl = $('ctl');
  $('bCtl').addEventListener('click', () => ctl.style.display = 'flex');
  $('bBack').addEventListener('click', () => ctl.style.display = 'none');
  $('bFs').addEventListener('click', () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.(); });
  addEventListener('keydown', e => {
    if (root.style.display === 'none') return;
    if (e.code === 'Escape') ctl.style.display = 'none';
    else if (e.code === 'Enter' && ctl.style.display !== 'flex' && !$('play').disabled) $('play').click();
  });
})();