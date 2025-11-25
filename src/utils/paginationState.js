/**
 * Store and retrieve last-known pagination per route using sessionStorage.
 * Keys are pathnames like "/monsters", "/use", "/etc", "/setup", "/equip/<Cat>".
 */
const KEY_PREFIX = "pagination:";

/**
 * Get saved pagination for a path.
 * @param {string} path - Route pathname
 * @returns {{page:number,size:number}|null}
 */
export function getPaginationState(path) {
  try {
    const raw = sessionStorage.getItem(KEY_PREFIX + path);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    const page = Number(obj.page) || 1;
    const size = Number(obj.size) || 100;
    return { page, size };
  } catch {
    return null;
  }
}

/**
 * Save pagination for a path.
 * @param {string} path - Route pathname
 * @param {{page:number,size:number}} state - Pagination state
 */
export function setPaginationState(path, state) {
  try {
    const page = Number(state.page) || 1;
    const size = Number(state.size) || 100;
    sessionStorage.setItem(KEY_PREFIX + path, JSON.stringify({ page, size }));
  } catch {
    // ignore
  }
}