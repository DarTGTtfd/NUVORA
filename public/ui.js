document.head.insertAdjacentHTML('beforeend', `<style>
:root{--s:min(44px,8.4vw)}
.sl{width:var(--s);height:var(--s);background:#2a1b12;box-shadow:inset 2px 2px #100803,inset -2px -2px #54391f;border-radius:2px;position:relative;display:flex;align-items:center;justify-content:center;box-sizing:border-box}
.sl img{width:78%;height:78%;image-rendering:pixelated;pointer-events:none}
.sl b{position:absolute;right:2px;bottom:-1px;font:bold 14px monospace;color:#fff;text-shadow:-1px 0 #1b1008,1px 0 #1b1008,0 -1px #1b1008,0 2px #1b1008;pointer-events:none}
.du{position:absolute;left:4px;right:4px;bottom:2px;height:3px;background:#000;pointer-events:none;text-decoration:none}.du i{display:block;height:100%}
#inv .sl:hover::after{content:'';position:absolute;inset:2px;background:rgba(255,226,160,.3);pointer-events:none}
#hb2{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:3px;padding:5px;background:linear-gradient(#a56f3a,#8a5a2e);box-shadow:0 0 0 3px #1f1008,inset 0 0 0 2px #c9944f;border-radius:3px;pointer-events:auto}
#hb2 .sl{background:#c8913f;box-shadow:inset 2px 2px #f0c77b,inset -2px -2px #7a4c1c}
#hb2 .sl.sel{box-shadow:inset 0 0 0 3px #fff4d6,0 0 0 2px #1f1008;transform:translateY(-3px);z-index:1}
#vitals{position:absolute;left:50%;bottom:calc(var(--s) + 26px);transform:translateX(-50%);text-shadow:1px 1px 2px #000;color:#fff;font:12px monospace;text-align:center}
#vitals div{height:19px;display:flex;justify-content:center}#vitals img{width:18px;height:18px;image-rendering:pixelated}
#mine{position:absolute;left:50%;top:55%;width:90px;height:8px;margin-left:-45px;background:#0008;display:none}#mine b{display:block;height:100%;width:0;background:#7cd34a}
#flash{position:fixed;inset:0;background:#c00;opacity:0;transition:opacity .35s;pointer-events:none;z-index:15}
#inv,#dead{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:#1a0d12d0;z-index:20;touch-action:auto}
#invwrap{display:flex;align-items:center;justify-content:center;max-height:96vh;max-width:98vw;overflow:auto;padding:14px 10px;touch-action:auto}
.desk{position:relative;display:flex;flex-direction:column;gap:20px;padding:18px 16px 12px;background:repeating-linear-gradient(0deg,#9a6735 0 21px,#6f4623 21px 24px);box-shadow:0 0 0 3px #1f1008,inset 0 0 0 3px #b9803f,0 10px 0 0 #0005;border-radius:4px}
.deskTop{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;justify-content:center}
#side{display:flex;gap:12px;align-items:center}
.notewrap{position:relative;flex:1;min-width:calc(var(--s)*4.2);margin-top:8px}
.notewrap::before{content:'';position:absolute;top:-9px;left:10px;right:10px;height:14px;z-index:2;pointer-events:none;background:radial-gradient(circle at 50% 50%,#e8e8e8 0 2px,#3a3a3a 2.5px 3.6px,transparent 4.2px) 0 0/11px 14px repeat-x}
.note{background:#f0e4c8 repeating-linear-gradient(#0000 0 19px,#dccba3 19px 20px);box-shadow:0 0 0 2px #3a2a1a,-5px 5px 0 #9a2f27,-5px 5px 0 2px #3a1410;padding:18px 10px 10px 14px;color:#4a3320;height:calc(var(--s)*4.5);overflow-y:auto;border-radius:2px;scrollbar-width:thin;scrollbar-color:#b99a63 transparent}
.note h3{margin:0 0 8px;font:italic bold 15px "Trebuchet MS",serif;color:#8a2a20;letter-spacing:1px}
.note .bg{display:grid;grid-template-columns:repeat(4,calc(var(--s)*.84));gap:7px}
.note .sl{width:calc(var(--s)*.84);height:calc(var(--s)*.84);background:#e6d6b0;box-shadow:inset 0 0 0 2px #b8985c,1px 2px 0 #0003}
.note .rb{cursor:pointer;transition:transform .1s}.note .rb:hover{transform:translateY(-2px) rotate(-2deg)}
.note .rb.no{filter:brightness(.62) saturate(.4)}
.pv{background:#f3ead6;padding:5px 5px 13px;box-shadow:0 0 0 2px #3a2a1a,3px 5px 0 2px #0004;transform:rotate(-3deg);flex:none}
.pv div{background:linear-gradient(#9cc4d6,#c9dfc0);display:flex;justify-content:center;width:calc(var(--s)*1.15);height:calc(var(--s)*1.7)}
.pv img{height:92%;align-self:flex-end;image-rendering:pixelated}
.mat{position:relative;display:flex;align-items:center;gap:9px;padding:14px;background-color:#2b4a9e;background-image:linear-gradient(#ffffff0f 1px,#0000 1px),linear-gradient(90deg,#ffffff0f 1px,#0000 1px);background-size:4px 4px;box-shadow:0 0 0 3px #101c4d,inset 0 0 0 3px #3f63c4;flex:none}
.mat::after{content:'';position:absolute;inset:6px;border:2px dashed #a9c0ff90;pointer-events:none}
.mat .sl{background:#16296a;box-shadow:inset 2px 2px #0b1640,inset -2px -2px #3f63c4}
.cg{display:grid;gap:3px}.cg2{grid-template-columns:repeat(2,var(--s))}.cg3{grid-template-columns:repeat(3,var(--s))}
.arrow{image-rendering:pixelated;width:calc(var(--s)*.6)}
.outw{padding:5px;background:#101c4d;box-shadow:inset 0 0 0 2px #3f63c4}
.outw.has{animation:glow 1.1s ease-in-out infinite alternate}
@keyframes glow{from{box-shadow:inset 0 0 0 2px #f0c060,0 0 3px #f0c06060}to{box-shadow:inset 0 0 0 2px #ffe08a,0 0 12px #f0c060}}
.tray{background:#4a2f1a;padding:9px;box-shadow:0 0 0 2px #1d1008,inset 0 0 0 2px #6e4826;border-radius:3px}
.g9{display:grid;grid-template-columns:repeat(9,var(--s));gap:3px}
.g9.hot{margin-top:10px;padding-top:10px;border-top:2px dashed #0006}
.g9.hot .sl{background:#c8913f;box-shadow:inset 2px 2px #f0c77b,inset -2px -2px #7a4c1c}
.plate{align-self:center;margin-top:-6px;background:#2c1a0e;color:#f5d58a;font:bold 12px monospace;letter-spacing:3px;padding:4px 16px;box-shadow:0 0 0 2px #1d1008,inset 0 0 0 1px #8a5a2e}
#tip{position:fixed;z-index:40;pointer-events:none;display:none;background:#1d120bf2;box-shadow:0 0 0 2px #c9944f,0 0 0 4px #1f1008;color:#fff3d6;padding:4px 8px;font:13px monospace;max-width:260px}
#cur{position:fixed;pointer-events:none;z-index:30;width:var(--s);height:var(--s);transform:translate(-50%,-50%);display:none}
#cur img{width:78%;height:78%;margin:11%;image-rendering:pixelated}#cur b{position:absolute;right:2px;bottom:-1px;font:bold 14px monospace;color:#fff;text-shadow:-1px 0 #1b1008,1px 0 #1b1008,0 -1px #1b1008,0 2px #1b1008}
#dead{flex-direction:column;gap:16px;background:#5a0000cc;text-align:center}#dead h2{font-size:44px;margin:0}
.mb2{position:absolute;width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.18);border:2px solid rgba(255,255,255,.4);font:bold 11px monospace;color:#fff;pointer-events:auto}
</style>`);
$('hotbar').style.display = 'none';
$('hud').insertAdjacentHTML('beforeend', '<div id="vitals"><div id="hp"></div><div id="hu"></div><div id="air"></div><div id="items"></div></div><div id="mine"><b></b></div><div id="hb2"></div>');
document.body.insertAdjacentHTML('beforeend', `<div id="flash"></div>
<div id="inv"><div id="invwrap"><div class="desk">
  <div class="deskTop"><div class="notewrap"><div id="book" class="note"></div></div><div id="side"></div></div>
  <div id="trays" class="tray"></div><div id="plate" class="plate"></div>
</div></div></div><div id="cur"></div><div id="tip"></div>
<div id="dead"><h2>You died</h2><button id="respawn" style="font-size:20px;padding:10px 30px;background:#5c9e3a;color:#fff;border:3px solid #243b17;border-radius:4px">Respawn</button></div>`);
$('mobile').insertAdjacentHTML('beforeend', '<button class="mb2" id="bBag" style="right:20px;bottom:240px">Bag</button><button class="mb2" id="bEat" style="right:84px;bottom:240px">Eat</button>');
$('bBag').addEventListener('touchstart', e => { toggleInventory(); e.preventDefault(); });
$('bEat').addEventListener('touchstart', e => { eatAny(); e.preventDefault(); });

if (typeof needOf === 'undefined') {
  window.needOf = r => r.i || {};
  window.countItem = id => inv.slots.reduce((a, s) => a + (s && s.id === id ? s.n : 0), 0);
  window.takeOne = id => { const i = inv.slots.findIndex(s => s && s.id === id); if (i >= 0 && --inv.slots[i].n <= 0) inv.slots[i] = null; };
  window.patOf = r => {
    const ids = []; for (const [id, q] of Object.entries(r.i)) for (let k = 0; k < q; k++) ids.push(+id);
    const w = r.t ? 3 : ids.length <= 4 ? 2 : 3, rows = []; ids.forEach((id, j) => (rows[Math.floor(j / w)] ||= []).push(id)); return rows;
  };
}

function pix(rows, pal, pal2) {
  const c = document.createElement('canvas'); c.width = c.height = 9; const x = c.getContext('2d');
  rows.forEach((row, j) => [...row].forEach((ch, i) => { const col = (pal2 && i > 4 ? pal2 : pal)[ch]; if (col) { x.fillStyle = col; x.fillRect(i, j, 1, 1); } }));
  return c.toDataURL();
}
const HEART = ['.##...##.', '#hrr#rrr#', '#rrrrrrr#', '#rrrrrrr#', '.#rrrrr#.', '..#rrr#..', '...#r#...', '....#....', '.........'];
const DRUM = ['...###...', '..#bhbb#.', '..#bbbb#.', '..#bbbb#.', '...#bb#..', '..#bb#...', '.#ww#....', '#www#....', '.##......'];
const BUBL = ['...###...', '..#hbb#..', '.#hbbbb#.', '.#bbbbb#.', '.#bbbbb#.', '.#bbbbb#.', '..#bbb#..', '...###...', '.........'];
const PAL = {
  heart: [{ '#': '#1a0505', r: '#e02020', h: '#ff9a9a' }, { '#': '#1a0505', r: '#4a1515', h: '#4a1515' }],
  food: [{ '#': '#2e1a08', b: '#b5651d', h: '#e8a455', w: '#efe6cf' }, { '#': '#2e1a08', b: '#4a3a2a', h: '#4a3a2a', w: '#6a6458' }],
};
const HUDI = {
  heart: [pix(HEART, PAL.heart[1]), pix(HEART, PAL.heart[0], PAL.heart[1]), pix(HEART, PAL.heart[0])],
  food: [pix(DRUM, PAL.food[1]), pix(DRUM, PAL.food[0], PAL.food[1]), pix(DRUM, PAL.food[0])],
};
const BUBI = pix(BUBL, { '#': '#1d5aa8', b: '#6fb7ff', h: '#e8f6ff' });
function hudRow(kind, val) {
  const v = Math.ceil(val); return Array.from({ length: 10 }, (_, i) => `<img src="${HUDI[kind][Math.max(0, Math.min(2, v - i * 2))]}">`).join('');
}
const bubbles = n => Array.from({ length: Math.max(0, Math.min(10, n)) }, () => `<img src="${BUBI}">`).join('');
const ARROW = (() => {
  const c = document.createElement('canvas'); c.width = 22; c.height = 15; const x = c.getContext('2d');
  x.fillStyle = '#2a1600'; x.fillRect(0, 4, 14, 7); for (let i = 0; i < 9; i++) x.fillRect(13 + i, i - 1, 1, 17 - i * 2);
  x.fillStyle = '#f0c060'; x.fillRect(1, 5, 12, 5); for (let i = 0; i < 7; i++) x.fillRect(13 + i, 2 + i, 1, 11 - i * 2);
  x.fillStyle = '#fff1b8'; x.fillRect(1, 5, 12, 1); return c.toDataURL();
})();
const EXPLORER = (() => {
  const c = document.createElement('canvas'); c.width = 16; c.height = 32; const x = c.getContext('2d'), r = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  r('#7a4e2a', 5, 0, 6, 3); r('#5a381c', 3, 3, 10, 1); r('#d6a34a', 5, 2, 6, 1);
  r('#c98f66', 4, 4, 8, 5); r('#3a2410', 4, 4, 1, 2); r('#3a2410', 11, 4, 1, 2);
  r('#fff', 5, 6, 2, 1); r('#fff', 9, 6, 2, 1); r('#1d1d2a', 6, 6, 1, 1); r('#1d1d2a', 9, 6, 1, 1); r('#8a4a3a', 7, 8, 2, 1);
  r('#d6452f', 4, 9, 8, 2); r('#d6452f', 10, 11, 2, 5); r('#a8321f', 10, 14, 2, 1);
  r('#4c7a3a', 4, 11, 8, 10); r('#4c7a3a', 0, 11, 4, 8); r('#4c7a3a', 12, 11, 4, 8);
  r('#c98f66', 0, 19, 4, 3); r('#c98f66', 12, 19, 4, 3); r('#7a4e2a', 6, 11, 1, 9); r('#7a4e2a', 9, 11, 1, 9); r('#3a2410', 4, 20, 8, 1);
  r('#3d4f7a', 4, 21, 4, 8); r('#3d4f7a', 8, 21, 4, 8); r('#3a2410', 4, 29, 4, 3); r('#3a2410', 8, 29, 4, 3);
  return c.toDataURL();
})();

const slotHTML = (s, k, i) => `<div class="sl" data-k="${k}" data-i="${i}" ${s ? `data-tip="${NAMES[s.id]}${TOOLS[s.id] ? '<br>Durability: ' + durOf(s) + '/' + maxDur(s.id) : ''}"` : ''}>${s ? `<img src="${iconURL(s.id)}"><b>${s.n > 1 ? s.n : ''}</b>${durBar(s)}` : ''}</div>`;
const ingText = r => Object.entries(needOf(r)).map(([id, n]) => `${NAMES[id]} x${n}`).join('<br>');
function recipeCells(r) {
  const n = craft.size;
  if (r.s) { if (r.s.length > n * n) return null; const rows = []; r.s.forEach((id, j) => { (rows[Math.floor(j / n)] ||= []).push(id); }); return rows; }
  const p = patOf(r); return p.length > n || p[0].length > n ? null : p;
}
function returnGrid() {
  craft.grid.forEach((s, i) => { if (s) { const left = addItem(s.id, s.n, s.d); if (left) { const dr = dropItem(s.id, left, P.x, P.y + 1.2, P.z); dr.d = s.d; } craft.grid[i] = null; } });
  craft.out = null;
}
function fillRecipe(i) {
  const r = RECIPES[i]; returnGrid();
  const cells = recipeCells(r), need = needOf(r);
  if (cells && Object.entries(need).every(([id, n]) => countItem(+id) >= n)) {
    cells.forEach((row, y) => row.forEach((id, x) => { if (id) { takeOne(id); craft.grid[y * craft.size + x] = { id, n: 1 }; } }));
  }
  updateCraft(); refreshUI();
}
let invOpen = false, chestOpen = null;
function renderInv() {
  const n = craft.size, rng = (a, b, f) => Array.from({ length: b - a }, (_, j) => f(a + j)).join('');
  const out = slotHTML(craft.out ? { id: craft.out.o, n: craft.out.n } : null, 'out', 0);
  $('side').innerHTML = chestOpen ? `<div class="tray"><div class="g9">${rng(0, 27, i => slotHTML(chestOpen.slots[i], 'chest', i))}</div></div>` : `${n === 2 ? `<div class="pv"><div><img src="${EXPLORER}"></div></div>` : ''}
    <div class="mat"><div class="cg cg${n}">${rng(0, n * n, i => slotHTML(craft.grid[i], 'craft', i))}</div><img class="arrow" src="${ARROW}"><div class="outw ${craft.out ? 'has' : ''}">${out}</div></div>`;
  $('trays').innerHTML = `<div class="g9">${rng(9, 36, i => slotHTML(inv.slots[i], 'inv', i))}</div><div class="g9 hot">${rng(0, 9, i => slotHTML(inv.slots[i], 'inv', i))}</div>`;
  $('plate').textContent = chestOpen ? 'CHEST' : n === 3 ? 'CRAFTING TABLE' : 'BACKPACK';
  const sc = $('book').scrollTop;
  $('book').innerHTML = `<h3>Recipes</h3><div class="bg">${RECIPES.map((r, i) => {
    const cells = recipeCells(r), ok = cells && Object.entries(needOf(r)).every(([id, q]) => countItem(+id) + craft.grid.filter(s => s && s.id === +id).length >= q);
    return `<div class="sl rb ${ok ? '' : 'no'}" data-r="${i}" data-tip="<b>${NAMES[r.o]}</b>${r.n > 1 ? ' x' + r.n : ''}<br>${ingText(r)}${cells ? '' : '<br>Requires a crafting table'}"><img src="${iconURL(r.o)}"></div>`;
  }).join('')}</div>`;
  $('book').scrollTop = sc;
}
function refreshUI() {
  uiDirty = false;
  $('hb2').innerHTML = Array.from({ length: 9 }, (_, i) => slotHTML(inv.slots[i], 'hb', i)).join('');
  $('hb2').children[inv.sel].classList.add('sel');
  if (invOpen) renderInv();
  const c = inv.cursor, el = $('cur');
  el.style.display = c ? 'block' : 'none'; if (c) el.innerHTML = `<img src="${iconURL(c.id)}"><b>${c.n > 1 ? c.n : ''}</b>${durBar(c)}`;
}
const canFit = (id, n) => inv.slots.reduce((a, s) => a + (!s ? maxStack(id) : s.id === id ? maxStack(id) - s.n : 0), 0) >= n;
function consumeGrid() { for (let j = 0; j < craft.size ** 2; j++) { const s = craft.grid[j]; if (s && --s.n <= 0) craft.grid[j] = null; } updateCraft(); }
function stash(s, a, b, arr = inv.slots) {
  const m = maxStack(s.id);
  for (let j = a; j < b && s.n > 0; j++) { const t = arr[j]; if (t && t.id === s.id && t.n < m) { const q = Math.min(m - t.n, s.n); t.n += q; s.n -= q; } }
  for (let j = a; j < b && s.n > 0; j++) if (!arr[j]) { const q = Math.min(m, s.n); arr[j] = { id: s.id, n: q }; if (s.d !== undefined) arr[j].d = s.d; s.n -= q; }
  return s.n;
}
function quickMove(k, i) {
  if (k === 'out') { for (let g = 0; g < 64 && craft.out && canFit(craft.out.o, craft.out.n); g++) { stash({ id: craft.out.o, n: craft.out.n }, 0, 36); consumeGrid(); } }
  else {
    const A = k === 'inv' ? inv.slots : k === 'chest' ? chestOpen.slots : craft.grid, s = A[i]; if (!s) return;
    const rem = k === 'inv' ? (chestOpen ? stash(s, 0, 27, chestOpen.slots) : i < 9 ? stash(s, 9, 36) : stash(s, 0, 9)) : stash(s, 0, 36);
    if (rem <= 0) A[i] = null; if (k === 'craft') updateCraft(); if (chestOpen && (k === 'chest' || k === 'inv')) chestSave();
  }
  refreshUI();
}
function clickSlot(k, i, right) {
  if (k === 'out') {
    const o = craft.out, c = inv.cursor; if (!o || (c && (c.id !== o.o || c.n + o.n > maxStack(o.o)))) return;
    inv.cursor = c ? { id: c.id, n: c.n + o.n } : { id: o.o, n: o.n }; consumeGrid(); return refreshUI();
  }
  const A = k === 'inv' ? inv.slots : k === 'chest' ? chestOpen.slots : craft.grid, s = A[i], c = inv.cursor;
  if (!c) { if (s) { if (right && s.n > 1) { const h = Math.ceil(s.n / 2); inv.cursor = { id: s.id, n: h }; s.n -= h; } else { inv.cursor = s; A[i] = null; } } }
  else if (!s) { if (right && c.n > 1) { A[i] = { id: c.id, n: 1 }; c.n--; } else { A[i] = c; inv.cursor = null; } }
  else if (s.id === c.id && maxStack(s.id) > 1) { const room = maxStack(s.id) - s.n, m = right ? Math.min(1, room) : Math.min(c.n, room); s.n += m; c.n -= m; if (c.n <= 0) inv.cursor = null; }
  else { A[i] = c; inv.cursor = s; }
  if (k === 'craft') updateCraft(); if (k === 'chest') chestSave(); refreshUI();
}
$('inv').addEventListener('pointerdown', e => {
  if (e.target.id === 'inv') return closeInventory();
  const rb = e.target.closest('.rb'); if (rb) return chestOpen || fillRecipe(+rb.dataset.r);
  const s = e.target.closest('.sl[data-k]'); if (!s) return; e.preventDefault();
  e.shiftKey ? quickMove(s.dataset.k, +s.dataset.i) : clickSlot(s.dataset.k, +s.dataset.i, e.button === 2);
});
$('hb2').addEventListener('pointerdown', e => { const s = e.target.closest('.sl'); if (s) { inv.sel = +s.dataset.i; uiDirty = true; } });
$('inv').addEventListener('contextmenu', e => e.preventDefault());
addEventListener('pointermove', e => {
  $('cur').style.left = e.clientX + 'px'; $('cur').style.top = e.clientY + 'px';
  const t = invOpen && !inv.cursor && e.target.closest ? e.target.closest('[data-tip]') : null, tip = $('tip');
  if (t) { tip.innerHTML = t.dataset.tip; tip.style.display = 'block'; tip.style.left = Math.min(e.clientX + 14, innerWidth - 270) + 'px'; tip.style.top = (e.clientY - 8) + 'px'; } else tip.style.display = 'none';
});
function openInventory(size = 2) {
  craft.size = size; invOpen = true; $('inv').style.display = 'flex'; document.exitPointerLock?.(); updateCraft(); refreshUI();
}
function closeInventory() {
  if (!invOpen) return; invOpen = false; $('inv').style.display = 'none'; $('tip').style.display = 'none';
  chestOpen = null; returnGrid(); const c = inv.cursor; inv.cursor = null;
  if (c) { const left = addItem(c.id, c.n, c.d); if (left) { const dr = dropItem(c.id, left, P.x, P.y + 1.2, P.z); dr.d = c.d; } }
  refreshUI(); if (!isTouch && !S.dead) renderer.domElement.requestPointerLock();
}
const toggleInventory = (size = 2) => invOpen ? closeInventory() : openInventory(size);
refreshUI();