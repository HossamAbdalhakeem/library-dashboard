/**
 * Normalize branch daily summary payload for hero / payment chips.
 * BE returns `{ section, scope, summary: { ... } }` (or a bare summary object).
 */
export const normalizeBranchSummary = (payload = {}) => {
  const summary = payload?.summary || payload || {};
  return {
    paymentsCollected: Number(summary.paymentsCollected ?? 0),
    refundsTotal: Number(summary.refundsTotal ?? 0),
    paymentsTotal: Number(
      summary.paymentsTotal ?? summary.paymentsCollected ?? 0,
    ),
    paymentsByMethod: Array.isArray(summary.paymentsByMethod)
      ? summary.paymentsByMethod
      : [],
    branchExpenses: Number(summary.branchExpenses ?? 0),
  };
};

/**
 * Ensure paginated section payloads have stable `data` + `pagination` shapes.
 * Display-string section rows are left as returned by BE.
 */
export const normalizeBranchSection = (payload) => {
  if (!payload) {
    return { data: [], pagination: { total: 0, page: 1, perPage: 15 } };
  }
  if (Array.isArray(payload)) {
    return {
      data: payload,
      pagination: {
        total: payload.length,
        page: 1,
        perPage: payload.length || 15,
      },
    };
  }
  const data = Array.isArray(payload.data) ? payload.data : [];
  const pagination = payload.pagination || {
    total: data.length,
    page: 1,
    perPage: data.length || 15,
  };
  return { ...payload, data, pagination };
};
