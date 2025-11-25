import { getFilteredExcluded } from "../utils/excludeObject.js";

// ===============================
// Base path for GitHub Pages
// ===============================
import { withBase } from "../utils/baseUrl.js";

// ===============================
// Helper: Fix image paths at runtime
// ===============================
function fixImagePath(obj) {
  if (!obj) return obj;

  if (obj.img) obj.img = withBase(obj.img);
  if (obj.image) obj.image = withBase(obj.image);

  return obj;
}

// ===============================
// LOAD MOB DATA
// ===============================
export async function loadAllMobs() {
  const res = await fetch(withBase("data/mob_data.json"));
  let mobMap = await res.json();

  // 🔥 Filter before doing anything
  mobMap = getFilteredExcluded(mobMap);

  // Fix mob images
  Object.values(mobMap).forEach((mob) => fixImagePath(mob));

  const mobs = Object.values(mobMap).filter((m) => {
    if (!m) return false;
    const hasLevel = m.level !== undefined && m.level !== null && String(m.level).trim() !== "";
    const hasImg = m.img !== undefined && m.img !== null && String(m.img).trim() !== "";
    return hasLevel && hasImg;
  });

  return { mobMap, mobs };
}

// ===============================
// LOAD ITEM DATA (Consume, Etc, Install)
// ===============================
const ITEM_FILES = [
  "item_consume_data.json",
  "item_etc_data.json",
  "item_install_data.json",
];

export async function loadAllItems() {
  // Load all 3 categories
  const promises = ITEM_FILES.map((file) =>
    fetch(withBase(`data/${file}`)).then((r) => r.json())
  );

  let itemCategories = await Promise.all(promises);

  // 🔥 Filter each category BEFORE processing
  itemCategories = itemCategories.map((cat) => getFilteredExcluded(cat));

  const itemMap = {};

  itemCategories.forEach((category) => {
    category.forEach((it) => {
      fixImagePath(it);
      itemMap[it.id] = it;
    });
  });

  const items = Object.values(itemMap).sort((a, b) => Number(a.id) - Number(b.id));

  return { itemMap, items };
}

// ===============================
// LOAD DROP TABLE
// ===============================
export async function loadDrops() {
  const res = await fetch(withBase("data/drop_table.json"));
  const raw = await res.json();

  return getFilteredExcluded(raw.drop_data);
}

// ===============================
// LOAD EQUIPS (multi-file merge)
// ===============================
const EQUIP_FILES = [
  "equip_accessory_data.json",
  "equip_cap_data.json",
  "equip_cape_data.json",
  "equip_coat_data.json",
  "equip_longcoat_data.json",
  "equip_pants_data.json",
  "equip_glove_data.json",
  "equip_shoes_data.json",
  "equip_shield_data.json",
  "equip_ring_data.json",
  "equip_weapon_data.json",
];

export async function loadEquips() {
  const promises = EQUIP_FILES.map((file) =>
    fetch(withBase(`data/${file}`)).then((r) => r.json())
  );

  let equipCategories = await Promise.all(promises);

  // 🔥 Filter each category
  equipCategories = equipCategories.map((cat) => getFilteredExcluded(cat));

  equipCategories.forEach((category) =>
    category.forEach((eq) => fixImagePath(eq))
  );

  const flatEquips = equipCategories.flat();

  return { equipCategories, flatEquips };
}
