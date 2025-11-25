/**
 * Parse a monster elemental attribute string (e.g., "I1F3") into grouped arrays.
 * Codes: I=ice, L=light, F=fire, P=poison, H=holy; Levels: 1=immune, 2=strong, 3=weak.
 * @param {string} [elemAttr=""] - Element attribute string from data source
 * @returns {{immune: string[], strong: string[], weak: string[]}} Parsed groups
 */
const ELEMENT_CODE_MAP = { I: "ice", L: "light", F: "fire", P: "poison", H: "holy" };
const ELEMENT_LEVEL_MAP = { 1: "immune", 2: "strong", 3: "weak" };

export function getElementGroups(elemAttr = "") {
  const groups = { immune: [], strong: [], weak: [] };
  if (!elemAttr) return groups;

  for (let i = 0; i < elemAttr.length; i += 2) {
    const code = elemAttr[i];
    const lvl = elemAttr[i + 1];
    if (!ELEMENT_CODE_MAP[code] || !ELEMENT_LEVEL_MAP[lvl]) continue;
    const groupName = ELEMENT_LEVEL_MAP[lvl];
    groups[groupName].push(ELEMENT_CODE_MAP[code]);
  }
  return groups;
}