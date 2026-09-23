/** Today 00:00–23:59:59.999 as ISO range (default for daily reports). */
export const todayRange = () => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};

/** Merge caller params over today range (caller wins). */
export const withDefaultRange = (params = {}) => ({
  ...todayRange(),
  ...params,
});

/**
 * Build a clean report query object (omit empty/nullish keys).
 * Keeps camelCase keys matching Nest ReportQueryDto.
 */
export const buildReportQuery = (params = {}) => {
  const query = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    query[key] = value;
  }
  return query;
};
