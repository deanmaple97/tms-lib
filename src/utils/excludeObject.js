// excludeObject.js

// Hardcoded IDs you don't want
export const EXCLUDED_IDS = [
  8830008,
  8830009,
  9300183,
  9300216,
  9300338,
  9400564,
  9400707,
  9400711,
  9400713,
  9420541,
  9420545,
  9420546,
  9420545,
  9500336,
  9500364,
  9700021,
  9700022,
  9700023,
  9700038,
  9999999,
];

// ID ranges you want to exclude
export const EXCLUDED_RANGES = [
    ['8830004', '8830006'],
    ['8830011', '8830012'],
    ['8810024', '8810026'],
    ['8810118', '8810121'],
    ['8810123', '8810130' ],
    ['8820008', '8820014'],
    // Accessories
    // Pocket Items
    ["01162000", "01162084"],
    // Badge and Totem
    ["01182000","01182293"],
    // Emblem
    ["01190000", "01191109"],
    // New Version Weapons
    // Shinning Rod, Soul Shooter, Desperado, Energy Chain, Scepter, Psy-Limiter, Gaunlet 
    ["01212000", "01300000"],
    // Katara
    ["01342000", "01342112"],
    // Secondary Weapons
    ["01352000", "01354027"],
    // Cane
    ["01362000","01362154"],
    // Shovel
    ["01502000", "01512011"],
    // Dual Bow Gun
    ["01522000","01522153"],
    // Cannon Shooter
    ["01532000","01532158"],
    // Katara
    ["01542000", "01542128"],
    // Kanna Fan
    ["01552000","01552130"],
    // Lazuli (Zero)
    ["01562000", "01572009"],
    // Arm Cannon (Blaster)
    ["01562000", "01582045"],
    // Ancient Bow (Pathfinder)
    ["01592000","01592041"],
    // Unknown
    ["01690000", "01690335"],
    // ONS - Unsure
    ["01302900", "01302916"]
];

/**
 * Optional custom exclusion condition for IDs.
 * @param {number|string} id - Mob or item ID
 * @returns {boolean} Whether the ID should be excluded
 */
export function getExcludeCondition(id) {
  id = Number(id);

  // Example: exclude IDs ending with 99
  // if (id % 100 === 99) return true;

  return false; // default no extra conditions
}

/**
 * Filter out excluded entries by ID from arrays or maps.
 * - If `data` is an array: returns array excluding objects by `obj.id`.
 * - If `data` is a map: returns object excluding keys by ID.
 * @param {Array|Object} data - Array of objects or ID→object map
 * @returns {Array|Object} Filtered copy
 */
export function getFilteredExcluded(data) {
  const excludeSet = new Set(EXCLUDED_IDS.map(String));

  /**
   * Determine whether the provided ID matches any excluded rule.
   * @param {number|string} id - ID to check
   * @returns {boolean} True if should be excluded
   */
  function shouldExclude(id) {
    id = Number(id);
    const idStr = String(id);

    // 1. Exact ID match
    if (excludeSet.has(idStr)) return true;

    // 2. Range match
    for (const [min, max] of EXCLUDED_RANGES) {
      if (id >= Number(min) && id <= Number(max)) return true;
    }

    // 3. Custom condition
    if (getExcludeCondition(id)) return true;

    return false;
  }

  // If array (item list, equip list)
  if (Array.isArray(data)) {
    return data.filter(obj => !shouldExclude(obj.id));
  }

  // If object (mobMap, itemMap)
  const result = {};
  Object.entries(data).forEach(([id, obj]) => {
    if (!shouldExclude(id)) {
      result[id] = obj;
    }
  });
  return result;
}
