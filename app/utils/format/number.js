/**
 * Shared finite-number checks / coercion.
 */

/**
 * True when `value` coerces to a finite number.
 * @param {unknown} value
 * @returns {boolean}
 */
export function isFiniteNumber(value) {
  return Number.isFinite(Number(value));
}

/**
 * Coerce `value` to a finite number, or `fallback` when invalid.
 * @param {unknown} value
 * @param {number} [fallback=0]
 * @returns {number}
 */
export function toFiniteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
