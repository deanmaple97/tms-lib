export * from "./item.js";
export * from "./excludeObject.js";
export { getFormattedNumber } from "./formatNumber.js";
export * from "./equip.js";
export * from "./monster.js";
export * from "./categoryNames.js";
export * from "./attackSpeedId.js";
export * from "./accessoryId.js";
export * from "./weaponId.js";
export * from "./mobTypeDropRate.js";
export * from "./paginationState.js";
export * from "./baseUrl.js";

// Temp function to convert string to title case
export function toTitle(str) {
  return String(str)
    .split(" ")
    .map((w) => w.split("-").map((p) => p.charAt(0) + p.slice(1).toLowerCase()).join("-"))
    .join(" ");
}
