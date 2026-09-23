/**
 * Hero chips for branch daily report overview.
 */
export const buildBranchHeroChips = (summary = {}) => {
  const s = summary || {};
  return [
    {
      key: "collected",
      label: "المحصل",
      value: s.paymentsCollected ?? s.paymentsTotal ?? 0,
      format: "money",
      valueClass: "text-primary-300",
    },
    {
      key: "expenses",
      label: "المصروفات",
      value: s.branchExpenses ?? s.financials?.branchExpenses ?? 0,
      format: "money",
      valueClass: "text-amber-300",
    },
    {
      key: "refunds",
      label: "المسترد",
      value: Number(s.refundsTotal || 0),
      format: "money",
      valueClass: "text-rose-300",
    },
  ];
};
