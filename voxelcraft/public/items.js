const TOOLS = { 21: ['pick', 1], 22: ['axe', 1], 23: ['shovel', 1], 24: ['sword', 1], 26: ['pick', 2], 27: ['axe', 2], 28: ['shovel', 2], 29: ['sword', 2] };
const NAMES = { 1:'Grass',2:'Dirt',3:'Stone',4:'Sand',5:'Log',6:'Leaves',8:'Planks',9:'Cobblestone',10:'Crafting Table',20:'Apple',21:'Wooden Pickaxe',22:'Wooden Axe',23:'Wooden Shovel',24:'Wooden Sword',25:'Stick',26:'Stone Pickaxe',27:'Stone Axe',28:'Stone Shovel',29:'Stone Sword' };
const APPLE = 20, STICK = 25, COAL = 40, TORCH_ITEM = 41;
const maxStack = id => TOOLS[id] ? 1 : 64;
const inv = { slots: Array(36).fill(null), cursor: null, sel: 0 };
const craft = { size: 2, grid: Array(9).fill(null), out: null };
let uiDirty = true;
const held = () => inv.slots[inv.sel];
function addItem(id, n, dur) {
  const m = maxStack(id);
  for (const s of inv.slots) if (n > 0 && s && s.id === id && s.n < m) { const t = Math.min(m - s.n, n); s.n += t; n -= t; }
  for (let i = 0; i < 36 && n > 0; i++) if (!inv.slots[i]) { const t = Math.min(m, n); inv.slots[i] = { id, n: t }; if (dur !== undefined && TOOLS[id]) inv.slots[i].d = dur; n -= t; }
  uiDirty = true; return n;
}
const RECIPES = [
  { o: 8, n: 4, i: { 5: 1 } }, { o: 25, n: 4, i: { 8: 2 } }, { o: 10, n: 1, i: { 8: 4 } },
  { o: 21, n: 1, i: { 8: 3, 25: 2 }, t: 1 }, { o: 22, n: 1, i: { 8: 2, 25: 2 }, t: 1 }, { o: 23, n: 1, i: { 8: 1, 25: 2 }, t: 1 }, { o: 24, n: 1, i: { 8: 2, 25: 1 }, t: 1 },
  { o: 26, n: 1, i: { 9: 3, 25: 2 }, t: 1 }, { o: 27, n: 1, i: { 9: 2, 25: 2 }, t: 1 }, { o: 28, n: 1, i: { 9: 1, 25: 2 }, t: 1 }, { o: 29, n: 1, i: { 9: 2, 25: 1 }, t: 1 },
];
function updateCraft() {
  const c = {};
  for (let i = 0; i < craft.size ** 2; i++) { const s = craft.grid[i]; if (s) c[s.id] = (c[s.id] || 0) + 1; }
  const ks = Object.keys(c);
  craft.out = RECIPES.find(r => (!r.t || craft.size === 3) && Object.keys(r.i).length === ks.length && ks.every(k => r.i[k] === c[k])) || null;
}

Object.assign(NAMES, { 11: 'Coal Ore', 40: 'Coal', 41: 'Torch' });
RECIPES.push({ o: TORCH_ITEM, n: 4, i: { [COAL]: 1, [STICK]: 1 } });
const DURABILITY = { 1: 100, 2: 200 };
const maxDur = id => TOOLS[id] ? DURABILITY[TOOLS[id][1]] : 0;
const durOf = s => s.d ?? maxDur(s.id);
function useTool(n = 1) {
  const h = held(); if (!h || !TOOLS[h.id]) return;
  h.d = durOf(h) - n;
  if (h.d <= 0) inv.slots[inv.sel] = null;
  uiDirty = true;
}
const durBar = s => {
  if (!s || !TOOLS[s.id] || s.d === undefined) return '';
  const f = Math.max(0, Math.min(1, s.d / maxDur(s.id))); if (f >= 1) return '';
  return `<u class="du"><i style="width:${f * 100}%;background:hsl(${f * 120},80%,45%)"></i></u>`;
};

const CHEST = 17;
const isChest = b => b === 17 || (b >= 70 && b <= 72);
NAMES[CHEST] = 'Chest';
RECIPES.push({ o: CHEST, n: 1, i: { 8: 8 }, t: 1 });