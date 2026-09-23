/**
 * Date / time formatters.
 *
 * formatDateTime(value, format?)
 * formatDateTimeParts(value, format?)
 */

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
 * Format a date / time value.
 *
 * @param {Date|string|number|null|undefined} value
 * @param {'datetime'|'date'|'time'|object} [format='datetime']
 * @returns {string}
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
