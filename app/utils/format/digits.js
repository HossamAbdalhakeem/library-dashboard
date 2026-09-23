/**
 * Digit conversion helpers.
 */

const WESTERN_TO_ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/**
 * Convert Western digits (0-9) to Arabic-Indic digits (٠-٩).
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function toArabicDigits(value) {
  if (value == null) return "";
  return String(value).replace(
    /[0-9]/g,
    (digit) => WESTERN_TO_ARABIC_DIGITS[digit],
  );
}
