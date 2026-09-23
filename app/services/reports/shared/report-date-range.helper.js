/**
 * Shared report date-input / range helpers (admin home, admin reports, daily filters).
 */

/** Normalize any date-like value to `YYYY-MM-DD` for `<input type="date">`. */
export const toDateInput = (value) => {
  if (!value) return null;
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Today as `YYYY-MM-DD`, with a stable fallback if parsing fails. */
export const todayInputValue = (fallback = "2026-01-01") =>
  toDateInput(new Date()) || fallback;

/**
 * Resolve `{ from, to }` (`YYYY-MM-DD`) for the selected academic year.
 * @param {Array<{ id?: unknown, startDate?: unknown, endDate?: unknown }>} years
 * @param {string|number|null|undefined} academicYearId
 */
export const resolveAcademicYearRange = (years, academicYearId) => {
  if (!academicYearId) return null;
  const match = (years || []).find(
    (year) => String(year.id) === String(academicYearId),
  );
  if (!match) return null;
  const from = toDateInput(match.startDate);
  const to = toDateInput(match.endDate);
  if (!from || !to) return null;
  return { from, to };
};

/**
 * Build ISO `from`/`to` report params (day bounds) + optional academicYearId.
 * @param {{ from?: string|null, to?: string|null, academicYearId?: string|number|null, extras?: Record<string, unknown> }} [options]
 */
export const buildReportDateRangeParams = ({
  from = null,
  to = null,
  academicYearId = null,
  extras = {},
} = {}) => {
  const fromBase = from || to || todayInputValue();
  const toBase = to || from || todayInputValue();
  const params = {
    from: new Date(`${fromBase}T00:00:00`).toISOString(),
    to: new Date(`${toBase}T23:59:59.999`).toISOString(),
    ...extras,
  };
  if (academicYearId) {
    params.academicYearId = String(academicYearId);
  }
  return params;
};

/**
 * Fill missing from/to using academic year range, else today.
 * @returns {{ from: string|null, to: string|null, usedAcademicYear: boolean, usedToday: boolean }}
 */
export const fillMissingDateRange = ({
  from = null,
  to = null,
  academicYearRange = null,
} = {}) => {
  if (from && to) {
    return { from, to, usedAcademicYear: false, usedToday: false };
  }
  if (academicYearRange?.from && academicYearRange?.to) {
    return {
      from: academicYearRange.from,
      to: academicYearRange.to,
      usedAcademicYear: true,
      usedToday: false,
    };
  }
  const today = todayInputValue();
  return { from: today, to: today, usedAcademicYear: false, usedToday: true };
};
