/**
 * Monetary amount formatters.
 *
 * formatMoney(value, format?)
 */

import { isFiniteNumber } from "./number";

const LRI = "\u2066";
const PDI = "\u2069";

const MONEY_PRESETS = {
  /** Fixed 2 decimals: `12.50 ج.م` */
  fixed: {
    locale: "en-US",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
    suffix: " ج.م",
    rtlIsolate: false,
  },
  /** Locale grouping, up to 2 decimals: `1,250 ج.م` */
  locale: {
    locale: "en-US",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
    suffix: " ج.م",
    rtlIsolate: false,
  },
  /** RTL-safe fixed amount for mixed LTR/RTL UIs */
  rtl: {
    locale: "en-US",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
    suffix: " ج.م",
    rtlIsolate: true,
  },
};

const resolveMoneyOptions = (format = "fixed") => {
  if (typeof format === "string") {
    return { ...(MONEY_PRESETS[format] || MONEY_PRESETS.fixed) };
  }
  return {
    ...MONEY_PRESETS.fixed,
    ...(format || {}),
  };
};

/**
 * Format a monetary amount.
 *
 * @param {number|string|null|undefined} value
 * @param {'fixed'|'locale'|'rtl'|object} [format='fixed']
 * @returns {string}
 */
export function formatMoney(value, format = "fixed") {
  const {
    locale = "en-US",
    suffix = " ج.م",
    rtlIsolate = false,
    empty,
    ...intlOptions
  } = resolveMoneyOptions(format);

  const amount = Number(value || 0);
  if (!isFiniteNumber(amount)) {
    return empty ?? formatMoney(0, format);
  }

  const formatted = `${amount.toLocaleString(locale, intlOptions)}${suffix}`;
  return rtlIsolate ? `${LRI}${formatted}${PDI}` : formatted;
}
