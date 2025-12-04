/**
 * Determine if a job is allowed to equip based on `reqJob` code.
 * @param {number|string} reqJob - Required job code from stats
 * @param {string} jobName - Display job name (e.g., "Warrior")
 * @returns {boolean} True if allowed
 */
import { ATTACK_SPEED_CONST } from "./attackSpeedId.js";
import { ACCESSORY_IDS } from "./accessoryId.js";
import { WEAPON_IDS } from "./weaponId.js";

const JOB_REQ_CODES = {
  Beginner: [0],
  "Super Beginner": [-1],
  Warrior: [1],
  Magician: [2],
  Thief: [8],
  Bowman: [4],
  Pirate: [5, 16],
};

export function getJobAllowed(reqJob, jobName) {
  const jobCode = Number(reqJob);
  if (jobName === "Super Beginner") {
    return jobCode === -1;
  }
  if (jobCode === 0) return true;
  const list = JOB_REQ_CODES[jobName] || [];
  return list.includes(jobCode);
}

export function isBeginnerOnly(reqJob) {
  return Number(reqJob) === 0;
}

/**
 * Map numeric attack speed into a human-readable label.
 * @param {number|string} speed - Numeric weapon speed
 * @returns {"Faster"|"Fast"|"Normal"|"Slow"|null} Label or null
 */
export function getAttackSpeedLabel(speed) {
  const label = ATTACK_SPEED_CONST[Number(speed)];
  return label || null;
}

/**
 * Infer equip type from item ID prefix (first two digits).
 * @param {number|string} itemId - Equip item ID
 * @returns {string|null} Equip type label or null
 */
export function getEquipType(itemId) {
  const idNum = Number(itemId);
  const prefix = Math.floor(idNum / 10000);

  if (ACCESSORY_IDS[prefix]) return ACCESSORY_IDS[prefix];
  if (WEAPON_IDS[prefix]) return WEAPON_IDS[prefix];

  return null;
}
