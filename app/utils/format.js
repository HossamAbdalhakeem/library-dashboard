/**
 * Shared number / date formatters.
 *
 * formatMoney(value, format?)
 * formatDateTime(value, format?)
 */

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

const DATETIME_PRESETS = {
  datetime: {
    locale: "ar-EG",
    dateStyle: "medium",
    timeStyle: "short",
    empty: "-",
  },
  date: {
    locale: "ar-EG",
    dateStyle: "medium",
    empty: "-",
  },
  time: {
    locale: "ar-EG",
    hour: "2-digit",
    minute: "2-digit",
    empty: "-",
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

const resolveDateTimeOptions = (format = "datetime") => {
  if (typeof format === "string") {
    return { ...(DATETIME_PRESETS[format] || DATETIME_PRESETS.datetime) };
  }

  const custom = format || {};
  const hasFieldOptions = [
    "weekday",
    "era",
    "year",
    "month",
    "day",
    "dayPeriod",
    "hour",
    "minute",
    "second",
    "fractionalSecondDigits",
    "timeZoneName",
  ].some((key) => Object.prototype.hasOwnProperty.call(custom, key));

  // dateStyle/timeStyle cannot mix with individual date/time fields.
  if (hasFieldOptions) {
    const { dateStyle: _ds, timeStyle: _ts, ...base } = DATETIME_PRESETS.datetime;
    return { ...base, ...custom };
  }

  return {
    ...DATETIME_PRESETS.datetime,
    ...custom,
  };
};

/**
 * Format a monetary amount.
 *
 * @param {number|string|null|undefined} value
 * @param {'fixed'|'locale'|'rtl'|object} [format='fixed']
 *   Preset name, or Intl.NumberFormat options plus:
 *   `{ locale, suffix, rtlIsolate, empty }`
 * @returns {string}
 *
 * @example
 * formatMoney(12.5)                 // "12.50 ج.م"
 * formatMoney(1250, "locale")       // "1,250 ج.م"
 * formatMoney(12.5, "rtl")          // "\u206612.50 ج.م\u2069"
 * formatMoney(12.5, { minimumFractionDigits: 0, suffix: " EGP" })
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
  if (!Number.isFinite(amount)) {
    return empty ?? formatMoney(0, format);
  }

  const formatted = `${amount.toLocaleString(locale, intlOptions)}${suffix}`;
  return rtlIsolate ? `${LRI}${formatted}${PDI}` : formatted;
}

/**
 * Format a date / time value.
 *
 * @param {Date|string|number|null|undefined} value
 * @param {'datetime'|'date'|'time'|object} [format='datetime']
 *   Preset name, or Intl.DateTimeFormat options plus:
 *   `{ locale, empty }`
 * @returns {string}
 *
 * @example
 * formatDateTime(new Date())              // medium date + short time (ar-EG)
 * formatDateTime(value, "date")           // date only
 * formatDateTime(value, "time")           // time only
 * formatDateTime(value, { dateStyle: "short", empty: "—" })
 */
export function formatDateTime(value, format = "datetime") {
  const options = resolveDateTimeOptions(format);
  const { locale = "ar-EG", empty = "-", ...intlOptions } = options;

  if (value == null || value === "") return empty;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return empty;

  return new Intl.DateTimeFormat(locale, intlOptions).format(date);
}

/**
 * Stacked datetime parts for table cells.
 * Default matches:
 *   ٢٧ أكتوبر ٢٠٢٣
 *   ٩:٣٧ م
 */
const DATETIME_PARTS_PRESETS = {
  stacked: {
    locale: "ar-EG",
    date: { month: "long", day: "numeric", year: "numeric" },
    time: { hour: "numeric", minute: "2-digit", hour12: true },
    empty: "—",
  },
  date: {
    locale: "ar-EG",
    date: { month: "long", day: "numeric", year: "numeric" },
    time: null,
    empty: "—",
  },
  time: {
    locale: "ar-EG",
    date: null,
    time: { hour: "numeric", minute: "2-digit", hour12: true },
    empty: "—",
  },
};

const resolveDateTimePartsOptions = (format = "stacked") => {
  if (typeof format === "string") {
    return {
      ...(DATETIME_PARTS_PRESETS[format] || DATETIME_PARTS_PRESETS.stacked),
    };
  }

  return {
    ...DATETIME_PARTS_PRESETS.stacked,
    ...(format || {}),
  };
};

/**
 * Split a datetime into display parts for stacked table cells.
 *
 * @param {Date|string|number|null|undefined} value
 * @param {'stacked'|'date'|'time'|object} [format='stacked']
 * @returns {{ date: string, time: string, empty: boolean, emptyLabel: string }}
 *
 * @example
 * formatDateTimeParts(new Date("2023-10-27T21:37:00"))
 * // { date: "٢٧ أكتوبر ٢٠٢٣", time: "٩:٣٧ م", empty: false, emptyLabel: "—" }
 */
export function formatDateTimeParts(value, format = "stacked") {
  const options = resolveDateTimePartsOptions(format);
  const {
    locale = "ar-EG",
    date: dateOpts,
    time: timeOpts,
    empty = "—",
  } = options;

  if (value == null || value === "") {
    return { date: "", time: "", empty: true, emptyLabel: empty };
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: "", empty: true, emptyLabel: empty };
  }

  const dateLine =
    dateOpts && typeof dateOpts === "object"
      ? new Intl.DateTimeFormat(locale, dateOpts).format(parsed)
      : "";
  const timeLine =
    timeOpts && typeof timeOpts === "object"
      ? new Intl.DateTimeFormat(locale, timeOpts).format(parsed)
      : "";

  return {
    date: dateLine,
    time: timeLine,
    empty: !dateLine && !timeLine,
    emptyLabel: empty,
  };
}

const WESTERN_TO_ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/**
 * Convert Western digits (0-9) to Arabic-Indic digits (٠-٩).
 * @param {string|number|null|undefined} value
 * @returns {string}
 */
export function toArabicDigits(value) {
  if (value == null) return "";
  return String(value).replace(/[0-9]/g, (digit) => WESTERN_TO_ARABIC_DIGITS[digit]);
}
