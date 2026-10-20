const chestCache = new Map();
const chestKey = (x, y, z) => x + ',' + y + ',' + z;
const CH_IDS = [17, 70, 71, 72];
for (const id of CH_IDS) { HARD[id] = 1.2; KIND[id] = 'axe'; }
function chestIdFacingPlayer() {
  const s = Math.sin(P.yaw), c = Math.cos(P.yaw);
  return Math.abs(s) > Math.abs(c) ? (s > 0 ? 17 : 70) : (c > 0 ? 71 : 72);
}

function chestInit(all) { for (const k in all) chestCache.set(k, all[k]); }
function chestNet(m) {
  const k = chestKey(m.x, m.y, m.z);
  if (m.s) chestCache.set(k, m.s); else chestCache.delete(k);
  if (chestOpen && chestOpen.key === k) { chestOpen.slots = chestCache.get(k) || Array(27).fill(null); if (!chestCache.has(k)) chestCache.set(k, chestOpen.slots); uiDirty = true; }
}
function chestSave() {
  if (!chestOpen) return;
  const { x, y, z, slots } = chestOpen;
  if (net.ws && net.ws.readyState === 1) net.ws.send(JSON.stringify({ t: 'chest', x, y, z, s: slots }));
}
function openChest(x, y, z) {
  const key = chestKey(x, y, z);
  let slots = chestCache.get(key); if (!slots) chestCache.set(key, slots = Array(27).fill(null));
  chestOpen = { key, x, y, z, slots };
  openInventory(2);
}

const _sb4 = setBlock;
setBlock = function (x, y, z, b, send) {
  if (send && b === CHEST) b = chestIdFacingPlayer();
  const old = getBlock(x, y, z);
  _sb4(x, y, z, b, send);
  if (!isChest(old) || isChest(b)) return;
  const k = chestKey(x, y, z), s = chestCache.get(k);
  if (chestOpen && chestOpen.key === k) closeInventory();
  if (send && s) for (const it of s) if (it) { const dr = dropItem(it.id, it.n, x + .5, y + .5, z + .5); dr.d = it.d; }
  chestCache.delete(k);
};