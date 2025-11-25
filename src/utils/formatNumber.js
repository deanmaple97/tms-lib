/**
 * Format numeric values using en-US locale grouping.
 * @param {number|string} n - Number or numeric string
 * @returns {string} Formatted number string
 */
export function getFormattedNumber(n) {
  return Number(n).toLocaleString("en-US");
}