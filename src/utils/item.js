import { withBase } from "./baseUrl.js";

/**
 * Return image URL for an item. If the item is a scroll,
 * choose a specific scroll sprite based on its success rate.
 * @param {Object} item - Item object with `name`, `image`, and optional `stats.success`
 * @returns {string} Image URL
 */
export function getScrollImage(item) {
  if (item.name.toLowerCase().includes("production stimulator")) {
    return withBase("images/Common/etc_prod-stim.png");
  }

  if (item.name.toLowerCase().includes("forging")) {
    return withBase("images/Common/etc_forging.png");
  }

  if (item.name.toLowerCase().includes("red-nose")) {
    return withBase("images/Common/scroll_red-nose_60.png");
  }

  if (item.name.toLowerCase().includes("anniv")) {
    return withBase("images/Common/scroll_40.png");
  }

  const rate = Number(item?.stats?.success);

  if (rate == 100 && item.name.toLowerCase().includes("scroll")) {
    return withBase(`images/Common/scroll_${rate}.png`);
  }

  const SUPPORTED_SCROLL_RATES = [10, 15, 30, 40, 50, 60, 65, 70];
  if (SUPPORTED_SCROLL_RATES.includes(rate) && item.name.toLowerCase().includes("scroll")) {
    return withBase(`images/Common/scroll_${rate}.png`);
  }

  return item.image;
}

/**
 * Return a display name for an item. For scrolls, append success % when not present.
 * @param {Object} item - Item object with `name` and optional `stats.success`
 * @returns {string} Display name
 */
export function getScrollName(item) {
  if (!item || !item.name) return "";

  const name = item.name;
  const lower = name.toLowerCase();

  if (!lower.includes("scroll")) {
    return name;
  }

  const percentInName = name.match(/(\d+)\s*%/);
  if (percentInName) {
    return name;
  }

  const success = Number(item?.stats?.success);
  if (!isNaN(success) && success > 0) {
    return `${name} ${success}%`;
  }

  return name;
}